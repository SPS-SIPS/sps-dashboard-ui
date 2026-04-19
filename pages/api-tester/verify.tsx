import React, {useEffect, useState} from "react";
import {useApiRequest} from "../../utils/apiService";
import SpinLoading from "../../component/Loading/SpinLoading/SpinLoading";
import Input from "../../component/common/Input/Input";
import ActionButton from "../../component/common/ActionButton/ActionButton";
import SelectInput from "../../component/common/SelectInput/SelectInput";

import useEndpoints from "../../api/hooks/useEndpoints";

import {
    extractFieldsFromData,
    getUserFieldFromEndpoint,
    getUserFieldsFromEndpoint,
    remapToInternalFields,
} from "../../utils/endpointHelpers";

import {
    verificationMethods,
    bicOptionsDev, extractBankCodeFromIBAN, getBicFromAcqId,
} from "../../constants/gatewayFormOptions";

import {validateUrl} from "../../utils/validation";

import sharedStyles from "../../component/RequestForm/SharedStyles.module.css";
import styles from "../../styles/VerificationRequestPage.module.css";

import RoleGuard from "../../auth/RoleGuard";
import {useRouter} from "next/router";
import {useAuthentication} from "../../auth/AuthProvider";
import QRDataViewer from "../../component/ScanToPay/QRDataViewer/QRDataViewer";
import UploadQRScanner from "../../component/ScanToPay/UploadQRScanner/UploadQRScanner";
import {SOMQRType} from "../../utils/validateSOMQR";
import AlertModal from "../../component/common/AlertModal/AlertModal";
import {extractErrorMessage} from "../../utils/extractErrorMessage";

const VerificationRequestPage: React.FC = () => {
    const {config} = useAuthentication();
    const router = useRouter();
    const {makeApiRequest} = useApiRequest();
    const {endpoints, loading: endpointsLoading} = useEndpoints();

    const [mode, setMode] = useState<"form" | "qr">("form");

    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [fieldMappings, setFieldMappings] = useState<any[]>([]);

    const [qrCode, setQrCode] = useState("");

    const [submittedData, setSubmittedData] = useState<any>(null);
    const [response, setResponse] = useState<any>(null);

    const [requestViewerOpen, setRequestViewerOpen] = useState(false);
    const [responseViewerOpen, setResponseViewerOpen] = useState(false);

    const [apiUrl, setApiUrl] = useState(
        `${config?.api.baseUrl}/api/v1/Gateway/Verify`
    );

    const [modal, setModal] = useState<{
        show: boolean;
        title?: string;
        message?: string;
    }>({show: false});

    const [loading, setLoading] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [urlError, setUrlError] = useState("");

    const activeProfile = config?.profile;

    // ================= AUTH =================
    useEffect(() => {
        if (activeProfile === "prod") {
            void router.replace("/403");
        }
    }, [activeProfile, router]);

    if (activeProfile === "prod") return null;

    // ================= LOAD MAPPINGS =================
    useEffect(() => {
        if (endpoints) {
            const endpoint = endpoints["VerificationRequest"];
            if (endpoint) {
                const filtered = endpoint.fieldMappings.filter(
                    (f: any) => f.internalField !== "Code"
                );
                setFieldMappings(filtered);
            }
        }
    }, [endpoints]);

    // ================= INPUT =================
    const handleInputChange = (field: string, value: string) => {
        setFormValues((prev) => ({...prev, [field]: value}));
    };

    // ================= VALIDATION =================
    const isFormValid = () => {
        return fieldMappings.every((m) => {
            return formValues[m.userField]?.trim();
        });
    };

    // ================= SUBMIT =================
    const handleSubmit = async () => {
        setUrlError("");

        if (!validateUrl(apiUrl, {allowLocalhost: true})) {
            setUrlError("Please enter a valid API endpoint URL");
            return;
        }

      setSubmittedData(null);
      setResponse(null);

        const payload = mode === "qr" ? {QRCode: qrCode} : formValues;

        try {
            setLoading(true);

            const res = await makeApiRequest({
                url: apiUrl,
                method: "post",
                data: payload,
            });

            setResponse(res);
            setSubmittedData(payload);
        } catch (error: any) {
            showError(error?.message || "Verification request failed");
        } finally {
            setLoading(false);
        }
    };

    // ================= PAYMENT =================
    const handleSendPaymentRequest = async () => {
        if (!submittedData || !response?.data || !endpoints) return;

        try {
            setProcessingPayment(true);

            const verificationResponseFields = getUserFieldsFromEndpoint(
                endpoints,
                "VerificationResponse",
                ["AccountNo", "AccountType", "Name", "Currency", "Address"]
            );

            const verificationRequestFields = getUserFieldsFromEndpoint(
                endpoints,
                "VerificationRequest",
                ["ToBIC"]
            );

            const submittedFieldValues = extractFieldsFromData(
                submittedData,
                Object.values(verificationRequestFields)
            );

            const responseFieldValues = extractFieldsFromData(
                response.data,
                Object.values(verificationResponseFields)
            );

            submittedFieldValues["CategoryPurpose"] = "C2CCRT";

            if (mode === "qr") {
                const parsed = response?.data?.parsed;

                const toBicField = verificationRequestFields["ToBIC"];

                if (parsed?.bankBICCode && toBicField) {
                    submittedFieldValues[toBicField] = parsed.bankBICCode;
                }

                // ================= CATEGORY PURPOSE RULES =================
                const payloadFormat = parsed?.payloadFormatIndicator;
                const initMethod = parsed?.pointOfInitializationMethod;

                if (payloadFormat === "01") {
                    if (initMethod === "11") {
                        submittedFieldValues["CategoryPurpose"] = "C2BSQR";
                    } else if (initMethod === "12") {
                        submittedFieldValues["CategoryPurpose"] = "C2BDQR";
                    }
                }

                if (initMethod === "12" && parsed?.amount != null) {
                    submittedFieldValues["Amount"] = parsed.amount;
                }
            }

            const combinedFields = {
                ...submittedFieldValues,
                ...responseFieldValues,
            };

            const internalData = remapToInternalFields(combinedFields, {
                ...verificationResponseFields,
                ...verificationRequestFields,
            });

            await router.push({
                pathname: "/api-tester/payment",
                query: {data: JSON.stringify(internalData)},
            });
        }catch (error){
            setModal({
                show: true,
                title: "Error",
                message: extractErrorMessage(error, "Failed to process payment request")
            });
        } finally {
            setProcessingPayment(false);
        }
    };

    const isVerified = (() => {
        const field = getUserFieldFromEndpoint(
            endpoints,
            "VerificationResponse",
            "IsVerified"
        );
        return field ? response?.data?.[field] : false;
    })();

    // ================= QR =================
    const handleQRSuccess = (result: { data: string; type: SOMQRType }) => {
        setQrCode(result.data);
        setMode("qr");
    };

    const showError = (message: string) => {
        setModal({show: true, title: "Error", message});
    };

    const handleModeChange = (newMode: "form" | "qr") => {
        setMode(newMode);
        setSubmittedData(null);
        setResponse(null);
        setQrCode("");
        setFormValues({});
        setRequestViewerOpen(false);
        setResponseViewerOpen(false);
    };

    return (
        <RoleGuard allowedRoles={["gateway"]}>
            <div className={sharedStyles.container}>
                {/* HEADER */}
                <div className={sharedStyles.titleContainer}>
                    <h1 className={sharedStyles.mainTitle}>
                        Verification Request Tester
                    </h1>
                    <p className={sharedStyles.subTitle}>
                        Send verification requests using form input or QR code scanning.
                    </p>
                </div>

                {/* API URL */}
                <Input
                    label="Verification API Endpoint"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    type="url"
                    placeholder="https://example.com/api/v1/Gateway/Verify"
                    errorMessage={urlError}
                    required
                />

                {/* MODE SWITCH */}
                <div className={styles.modeSwitch}>
                    <ActionButton
                        onClick={() => handleModeChange("form")}
                        className={`${styles.modeButton} ${
                            mode === "form" ? styles.activeMode : ""
                        }`}
                    >
                        Manual Form
                    </ActionButton>

                    <ActionButton
                        onClick={() => handleModeChange("qr")}
                        className={`${styles.modeButton} ${
                            mode === "qr" ? styles.activeMode : ""
                        }`}
                    >
                        QR Code Scan
                    </ActionButton>
                </div>

                {/* FORM */}
              {endpointsLoading ? (
                  <div className={styles.loadingContainer}>
                    <SpinLoading />
                    <p className={styles.loadingText}>Loading endpoint configurations...</p>
                  </div>
              ) : mode === "form" ? (
                    <div className={styles.formContainer}>
                        {fieldMappings.map((m, i) => (
                            <div key={i} className={styles.formField}>
                                {["Type", "ToBIC"].includes(m.internalField) ? (
                                    <SelectInput
                                        label={m.userField}
                                        value={formValues[m.userField] || ""}
                                        onChange={(e) =>
                                            handleInputChange(m.userField, e.target.value)
                                        }
                                        options={
                                            m.internalField === "Type"
                                                ? verificationMethods
                                                : bicOptionsDev
                                        }
                                        required
                                    />
                                ) : (
                                    <Input
                                        label={m.userField}
                                        value={formValues[m.userField] || ""}
                                        onChange={(e) =>
                                            handleInputChange(m.userField, e.target.value)
                                        }
                                        type="text"
                                        required
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.qrSection}>
                        {qrCode && (
                            <div className={styles.qrPreview}>
                                <p className={styles.qrLabel}>Scanned QR Data</p>
                                <pre className={styles.qrText}>{qrCode}</pre>
                            </div>
                        )}
                        <UploadQRScanner
                            onScanSuccess={handleQRSuccess}
                            onScanError={showError}
                        />
                    </div>
                )}

                {/* SUBMIT */}
                <ActionButton
                    onClick={handleSubmit}
                    className={styles.submitButton}
                    disabled={
                        loading ||
                        endpointsLoading ||
                        (mode === "form" ? !isFormValid() : !qrCode.trim())
                    }
                >
                    {loading ? "Sending..." : "Send Verification Request"}
                </ActionButton>

                {loading && (
                    <div className={styles.loadingContainer}>
                        <SpinLoading/>
                        <p className={styles.loadingText}>Sending verification request...</p>
                    </div>
                )}

                {/* VIEWERS */}
                {submittedData && response && (
                    <div className={styles.viewerButtons}>
                        <ActionButton
                            className={styles.viewerBtn}
                            onClick={() => setRequestViewerOpen(true)}
                        >
                            View Request Payload
                        </ActionButton>

                        <ActionButton
                            className={styles.viewerBtn}
                            onClick={() => setResponseViewerOpen(true)}
                        >
                            View Response Payload
                        </ActionButton>
                    </div>
                )}

                {/* PAYMENT */}
                {response?.success && isVerified && (
                    <ActionButton
                        onClick={handleSendPaymentRequest}
                        className={styles.paymentButton}
                        disabled={processingPayment}
                    >
                        {processingPayment
                            ? "Processing Payment..."
                            : "Proceed to Payment"}
                    </ActionButton>
                )}
            </div>

            {/* MODALS */}
            <QRDataViewer
                data={submittedData}
                isOpen={requestViewerOpen}
                onClose={() => setRequestViewerOpen(false)}
                title="Verification Request"
            />

            <QRDataViewer
                data={response}
                isOpen={responseViewerOpen}
                onClose={() => setResponseViewerOpen(false)}
                title="Verification Response"
            />

            {modal.show && (
                <AlertModal
                    title={modal.title!}
                    message={modal.message!}
                    onConfirm={() => setModal({show: false})}
                    onClose={() => setModal({show: false})}
                    error
                />
            )}
        </RoleGuard>
    );
};

export default VerificationRequestPage;