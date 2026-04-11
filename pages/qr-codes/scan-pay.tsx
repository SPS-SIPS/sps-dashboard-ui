'use client';

import React, {useState} from "react";
import UploadQRScanner from "../../component/ScanToPay/UploadQRScanner/UploadQRScanner";
import {SOMQRType} from "../../utils/validateSOMQR";
import AlertModal from "../../component/common/AlertModal/AlertModal";

import useSomQRParser from "../../api/hooks/useSomQRParser";
import {extractErrorMessage} from "../../utils/extractErrorMessage";

import {
    PaymentRequest,
    PaymentResponse,
    SomQRMerchantData,
    SomQRPersonData,
    VerificationInternalResponse
} from "../../types/somqr";
import SpinLoading from "../../component/Loading/SpinLoading/SpinLoading";
import {
    validateMerchantQrBasic, validateMerchantQRWithVerification,
    validatePersonalQrBasic,
    validatePersonalQRWithVerification
} from "../../utils/qrValidationUtils";
import ValidationSteps from "../../component/ScanToPay/ValidationSteps/ValidationSteps";
import QRDataViewer from "../../component/ScanToPay/QRDataViewer/QRDataViewer";
import {mapRequestToUserFields} from "../../types/mapRequestToUserFields";
import useEndpoints from "../../api/hooks/useEndpoints";
import useGatewayApi from "../../api/hooks/useGatewayApiWithTypes";
import {mapResponseToInternalFields} from "../../types/mapResponseToInternalFields";
import {extractBankCodeFromIBAN, getBicFromAcqId, getMnoBicFromAcqId} from "../../constants/gatewayFormOptions";
import {useAuthentication} from "../../auth/AuthProvider";
import {FiCheckCircle, FiCreditCard, FiDatabase, FiEye, FiFileText, FiRefreshCw, FiShield} from "react-icons/fi";

import sharedStyles from '../../component/QRParser/QRParser.module.css';
import styles from "../../styles/ScanPayPage.module.css";

import {MdQrCodeScanner} from "react-icons/md";
import {getCurrencyCodeFromNumber} from "../../data/currencyOptions";
import {generateLocalId} from "../../utils/generateLocalId";
import PaymentForm from "../../component/Gateway/PaymentForm/PaymentForm";

type VerifyPayeePayload = {
    Alias: string;
    Type: string;
    ToBIC: string;
    Code?: string;
};

type QRValidationStep = {
    step: string;
    passed: boolean;
    message: string;
};

type QRValidationResult = {
    type: "personal" | "merchant";
    steps: QRValidationStep[];
};

export default function ScanPayPage() {
    const {parseMerchantQR, parsePersonQR} = useSomQRParser();
    const [qrData, setQrData] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [qrParsedData, setQrParsedData] = useState<
        | { type: "merchant"; data: SomQRMerchantData }
        | { type: "personal"; data: SomQRPersonData }
        | null
    >(null);

    const [basicValidation, setBasicValidation] = useState<QRValidationResult | null>(null);
    const [validation, setValidation] = useState<QRValidationResult | null>(null);

    const [modal, setModal] = useState<{
        show: boolean;
        title?: string;
        message?: string;
    }>({show: false});

    const [modalState, setModalState] = useState({
        basicValidationOpen: false,
        verificationValidationOpen: false,
        verificationResponseOpen: false,
        rawViewerOpen: false,
        decodedViewerOpen: false,
        showPaymentModal: false,
        paymentRequestOpen: false,
        paymentResponseOpen: false,
    });

    const showError = (message: string) => {
        setModal({
            show: true,
            title: "Error",
            message
        });
    };

    const {endpoints} = useEndpoints();
    const {verifyPayee, makePayment} = useGatewayApi();

    const [verificationRequest, setVerificationRequest] =
        useState<VerifyPayeePayload | null>(null);

    const [verificationResponse, setVerificationResponse] =
        useState<VerificationInternalResponse | null>(null);

    const [verificationLoading, setVerificationLoading] = useState(false);

    const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
    const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const handleCloseModal = () => setModal({show: false});

    const handleQRSuccess = async (result: { data: string; type: SOMQRType }) => {
        setQrData(result.data);
        try {
            setLoading(true);
            let parsed: typeof qrParsedData;
            let basic: QRValidationResult;

            if (result.type === "merchant") {
                const response = await parseMerchantQR(result.data);
                parsed = {
                    type: "merchant",
                    data: response.data
                };
                basic = validateMerchantQrBasic(response.data);
            } else {
                const response = await parsePersonQR(result.data);
                parsed = {
                    type: "personal",
                    data: response.data
                };
                basic = validatePersonalQrBasic(response.data);
            }
            setQrParsedData(parsed);
            setBasicValidation(basic);
        } catch (error) {
            showError(
                extractErrorMessage(
                    error,
                    "Failed to parse QR"
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const getQRTitle = (): string => {
        if (!qrParsedData) return "QR Code Validation";

        const type = qrParsedData.type.toLocaleUpperCase();

        if (qrParsedData.type === "personal") {
            const scheme = qrParsedData.data.schemeIdentifier ?? "Unknown Scheme";
            const method =
                qrParsedData.data.pointOfInitializationMethod === "11"
                    ? "Static QR"
                    : qrParsedData.data.pointOfInitializationMethod === "12"
                        ? "Dynamic QR"
                        : "";
            const name = qrParsedData.data.accountName ?? "";

            return `${type} QR (${scheme}${method ? `, ${method}` : ""}) - ${name}`;
        } else {
            // merchant
            const payload = qrParsedData.data.payloadFormatIndicator ?? "Unknown Payload";
            const method =
                qrParsedData.data.pointOfInitializationMethod === "11"
                    ? "Static QR"
                    : qrParsedData.data.pointOfInitializationMethod === "12"
                        ? "Dynamic QR"
                        : "";
            const merchantName = qrParsedData.data.merchantName ?? "";

            return `${type} QR (${payload}${method ? `, ${method}` : ""}) - ${merchantName}`;
        }
    };

    const {config} = useAuthentication();
    const activeProfile = config?.profile === "prod" ? "prod" : "dev";

    const verifyPayeeWithGateway = async (
        payload: VerifyPayeePayload
    ): Promise<VerificationInternalResponse | null> => {
        if (!endpoints) {
            showError("Endpoints not initialized");
            return null;
        }

        try {

            const requestMappings =
                endpoints["VerificationRequest"].fieldMappings;

            const mappedPayload =
                mapRequestToUserFields(payload, requestMappings);

            const response = await verifyPayee(mappedPayload);

            const responseMappings =
                endpoints["VerificationResponse"].fieldMappings;

            return mapResponseToInternalFields(response, responseMappings);

        } catch (error) {
            showError(
                extractErrorMessage(
                    error,
                    "Payee verification failed"
                )
            );
            return null;
        }
    };

    const processQrVerification = async (): Promise<VerificationInternalResponse | null> => {
        if (!qrData) {
            showError("QR code content is missing.");
            return null;
        }

        if (!qrParsedData) {
            showError("No QR data available to verify.");
            return null;
        }

        try {
            setVerificationLoading(true);

            let bicCode: string;
            let type: string;
            let alias: string;

            if (qrParsedData.type === "personal") {
                const accountNumber = qrParsedData.data.accountNumber;

                if (!accountNumber || accountNumber.length < 23) {
                    showError("Invalid IBAN in QR code.");
                    return null;
                }

                const bankCode = extractBankCodeFromIBAN(accountNumber);
                if (!bankCode) {
                    showError("Unable to determine bank from IBAN.");
                    return null;
                }

                bicCode = getBicFromAcqId(bankCode, activeProfile);
                if (!bicCode) {
                    showError("Bank not supported.");
                    return null;
                }

                type = "IBAN";
                alias = accountNumber;

            } else {
                // ✅ Support both Bank (26) and MNO (31)
                const merchantAccount =
                    qrParsedData.data.merchantAccount?.["26"] ||
                    qrParsedData.data.merchantAccount?.["31"];

                const merchantId =
                    merchantAccount?.paymentNetworkSpecific?.["44"];

                const acqIdRaw =
                    merchantAccount?.paymentNetworkSpecific?.["1"];

                const isMNO = !!qrParsedData.data.merchantAccount?.["31"];

                if (!merchantId || !acqIdRaw) {
                    showError("Invalid merchant QR.");
                    return null;
                }

                if (isMNO) {
                    // ✅ MNO FLOW
                    bicCode = getMnoBicFromAcqId(acqIdRaw, activeProfile);

                    if (!bicCode) {
                        showError("MNO not supported.");
                        return null;
                    }

                    type = "EWLT"; // Wallet
                    alias = merchantId;

                } else {
                    // ✅ BANK FLOW
                    const acqId = acqIdRaw.substring(2);

                    bicCode = getBicFromAcqId(acqId, activeProfile);

                    if (!bicCode) {
                        showError("Unable to determine merchant bank.");
                        return null;
                    }

                    const isIBAN =
                        merchantId.startsWith("SO") && merchantId.length < 23;

                    type = isIBAN ? "IBAN" : "ACCT";
                    alias = merchantId;
                }
            }

            const payload: VerifyPayeePayload = {
                Alias: alias,
                Type: type,
                ToBIC: bicCode
            };

            setVerificationRequest(payload);

            const response = await verifyPayeeWithGateway(payload);
            setVerificationResponse(response || null);

            let verification: QRValidationResult | null = null;

            if (response) {
                if (qrParsedData.type === "personal") {
                    verification = validatePersonalQRWithVerification(
                        qrParsedData.data,
                        response
                    );
                } else {
                    verification = validateMerchantQRWithVerification(
                        qrParsedData.data,
                        response
                    );
                }
            }

            if (verification) {
                setValidation(verification);
            }

            return response || null;

        } catch (error) {
            showError(
                extractErrorMessage(error, "Verification failed")
            );
            return null;
        } finally {
            setVerificationLoading(false);
        }
    };

    const resetScanner = () => {
        setQrData(null);
        setQrParsedData(null);
        setBasicValidation(null);
        setValidation(null);
        setVerificationResponse(null);
        setVerificationRequest(null);
        setPaymentRequest(null);
        setPaymentResponse(null);
        setModalState({
            basicValidationOpen: false,
            verificationValidationOpen: false,
            verificationResponseOpen: false,
            rawViewerOpen: false,
            decodedViewerOpen: false,
            showPaymentModal: false,
            paymentResponseOpen: false,
            paymentRequestOpen: false,
        });
    };

    const preparePaymentData = () => {
        if (!qrParsedData || !verificationResponse || !verificationRequest) {
            showError("Unable to prepare payment.");
            return;
        }

        let data: PaymentRequest;

        const isPersonal = qrParsedData.type === "personal";

        const localInstrument = "CRTRM";

        let categoryPurpose: string;

        if (isPersonal) {
            categoryPurpose = "C2CCRT";
        } else {
            const isStatic = qrParsedData.data.pointOfInitializationMethod === "11";
            categoryPurpose = isStatic ? "C2BSQR" : "C2BDQR";
        }

        let amount: number;
        let currency = "USD";
        let remittance: string;

        if (isPersonal) {

            const dataQR = qrParsedData.data as SomQRPersonData;

            amount = dataQR.amount ?? 0;
            remittance = dataQR.particulars ?? "";
        } else {
            const dataQR = qrParsedData.data as SomQRMerchantData;

            amount = dataQR.transactionAmount ?? 0;

            currency = getCurrencyCodeFromNumber(dataQR.transactionCurrency);

            remittance = "";
        }


        data = {

            /* HIDDEN FIELDS */

            ToBIC: verificationRequest.ToBIC,
            LocalInstrument: localInstrument,
            CategoryPurpose: categoryPurpose,
            EndToEndId: generateLocalId(),
            CreditorIssuer: "C",

            DebtorName: "",
            DebtorAccount: "",
            DebtorAccountType: "",

            /* FROM VERIFICATION */

            CreditorName: verificationResponse.Name ?? "",
            CreditorAccount: verificationResponse.AccountNo ?? "",
            CreditorAccountType: verificationResponse.AccountType ?? "IBAN",
            CreditorAgentBIC: verificationRequest.ToBIC,

            /* QR VALUES */

            Amount: amount,
            Currency: currency,
            RemittanceInformation: remittance
        };

        setPaymentRequest(data);
        setModalState(prev => ({...prev, showPaymentModal: true}))
    }

    const handlePaymentSubmit = async (payload: PaymentRequest) => {
        if (!endpoints) {
            showError("Endpoints not initialized");
            return null;
        }
        try {
            setPaymentLoading(true);
            setModalState(prev => ({...prev, showPaymentModal: false}))
            setPaymentRequest(payload);
            const requestMappings =
                endpoints["PaymentRequest"].fieldMappings;

            const mappedPayload =
                mapRequestToUserFields(payload, requestMappings);

            const response = await makePayment(mappedPayload);

            const responseMappings =
                endpoints["PaymentResponse"].fieldMappings;

            const mapResponse = mapResponseToInternalFields(response, responseMappings);
            setPaymentResponse(mapResponse as PaymentResponse);
        } catch (error) {

            showError(
                extractErrorMessage(error, "Payment failed")
            );

        } finally {

            setPaymentLoading(false);

        }
    }
    return (

        <div className={sharedStyles.container}>

            <div className={sharedStyles.header}>
                <div className={sharedStyles.headerContent}>
                    <div className={sharedStyles.titleSection}>
                        <div className={sharedStyles.titleIcon}>
                            <MdQrCodeScanner/>
                        </div>
                        <div>
                            <h1 className={sharedStyles.title}>SOMQR Scanner & Verification</h1>
                            <p className={sharedStyles.subtitle}>
                                Scan or upload a Somali National QR code to decode,
                                validate its structure, and verify the payee before initiating payment.
                            </p>
                        </div>
                    </div>
                    <div>
                    </div>
                </div>
            </div>


            {(loading || verificationLoading || paymentLoading) ? (
                <div className={styles.qrLoading}>
                    <p className={styles.qrLoadingText}>
                        {loading
                            ? "Scanning and decoding QR code..."
                            : verificationLoading
                                ? "Verifying payee with gateway..."
                                : "Processing payment..."
                        }
                    </p>
                    <SpinLoading/>
                </div>
            ) : qrParsedData ? (
                <div className={styles.resultSection}>

                    <div className={styles.resultHeader}>

                        <h2 className={styles.qrResultTitle}>
                            QR Code Successfully Detected
                        </h2>

                        <button
                            className={styles.resetButton}
                            onClick={resetScanner}
                        >
                            <FiRefreshCw/>
                            Scan Another QR
                        </button>
                    </div>

                    <p className={styles.qrResultType}>
                        Type: <span>{qrParsedData.type.toUpperCase()}</span>
                    </p>


                    <p className={styles.qrResultDesc}>
                        The QR code has been decoded successfully.
                        You can now inspect the data, run validations,
                        or verify the account before making a payment.
                    </p>

                    {basicValidation && (
                        <div className={styles.buttonGroup}>
                            <button
                                className={styles.rawButton}
                                onClick={() => setModalState(prev => ({...prev, rawViewerOpen: true}))}
                            >
                                <FiFileText/>
                                View Raw QR Data
                            </button>

                            <button
                                className={styles.decodedButton}
                                onClick={() => setModalState(prev => ({...prev, decodedViewerOpen: true}))}
                            >
                                <FiDatabase/>
                                View Decoded Data
                            </button>

                            <button
                                className={styles.validationButton}
                                onClick={() => setModalState(prev => ({...prev, basicValidationOpen: true}))}
                            >
                                <FiCheckCircle/>
                                Show Structure Validation
                            </button>

                            <button
                                className={styles.verifyButton}
                                onClick={processQrVerification}
                                disabled={verificationLoading || !!verificationResponse}
                            >
                                <FiShield/>
                                {verificationResponse
                                    ? "Verification Completed"
                                    : "Verify Payee"}
                            </button>
                        </div>
                    )}

                    {verificationResponse && (
                        <div className={styles.verificationSection}>

                            <h3 className={styles.verificationTitle}>
                                Payee Verification Results
                            </h3>

                            <div className={styles.buttonGroup}>
                                <button
                                    className={styles.verifyResultButton}
                                    onClick={() =>
                                        setModalState(prev => ({...prev, verificationResponseOpen: true}))
                                    }
                                >
                                    <FiEye/>
                                    View Gateway Response
                                </button>


                                <button
                                    className={styles.validationButton}
                                    onClick={() =>
                                        setModalState(prev => ({...prev, verificationValidationOpen: true}))
                                    }
                                >
                                    <FiCheckCircle/>
                                    Validate Verification Data
                                </button>

                                <button
                                    className={styles.paymentButton}
                                    onClick={preparePaymentData}
                                    disabled={!verificationResponse?.IsVerified || !!paymentResponse}
                                >
                                    <FiCreditCard/>
                                    {paymentResponse
                                        ? "Payment Completed"
                                        : "Proceed to Payment"}
                                </button>
                            </div>
                        </div>
                    )}

                    {paymentRequest && paymentResponse && (
                        <div className={styles.paymentSection}>
                            <h3 className={styles.paymentTitle}>
                                Payment Transaction Details
                            </h3>

                            <p className={styles.paymentDescription}>
                                The payment request has been successfully submitted to the gateway.
                                You can review the outgoing payment request and the response returned
                                by the payment network for auditing and debugging purposes.
                            </p>
                            <div className={styles.buttonGroup}>
                                <button
                                    className={styles.rawButton}
                                    onClick={() => setModalState(prev => ({...prev, paymentRequestOpen: true}))}
                                >
                                    <FiFileText/> View Payment Request
                                </button>

                                <button
                                    className={styles.rawButton}
                                    onClick={() => setModalState(prev => ({...prev, paymentResponseOpen: true}))}
                                >
                                    <FiFileText/> View Payment Response
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            ) : (
                <div className={styles.qrUpload}>
                    <UploadQRScanner
                        onScanSuccess={handleQRSuccess}
                        onScanError={showError}
                    />
                </div>
            )}

            <ValidationSteps
                title={getQRTitle()}
                subtitle="This validation is run locally according to the SOMQR code structure after decoding the QR. It does not confirm whether the account exists. To verify the account, use the Validate button."
                result={basicValidation ?? {type: "personal", steps: []}}
                isOpen={modalState.basicValidationOpen}
                onClose={() => setModalState(prev => ({...prev, basicValidationOpen: false}))}
            />

            <ValidationSteps
                title="Verification Validation"
                subtitle="Validation after gateway verification response."
                result={validation ?? {type: "personal", steps: []}}
                isOpen={modalState.verificationValidationOpen}
                onClose={() =>
                    setModalState(prev => ({...prev, verificationValidationOpen: false}))
                }
            />

            <QRDataViewer
                data={qrData}
                isOpen={modalState.rawViewerOpen}
                onClose={() => setModalState(prev => ({...prev, rawViewerOpen: false}))}
                title="Scanned QR Raw Data"
                subtitle="This shows the original QR code string exactly as scanned, before any parsing or validation."
            />

            <QRDataViewer
                data={qrParsedData?.data}
                isOpen={modalState.decodedViewerOpen}
                onClose={() => setModalState(prev => ({...prev, decodedViewerOpen: false}))}
                title="Decoded QR Data"
                subtitle="Raw JSON representation of the QR code content"
            />

            <QRDataViewer
                data={verificationResponse}
                isOpen={modalState.verificationResponseOpen}
                onClose={() =>
                    setModalState(prev => ({...prev, verificationResponseOpen: false}))
                }
                title="Verification Response"
                subtitle="Raw gateway verification response for the scanned QR account."
            />

            <QRDataViewer
                data={paymentRequest}
                isOpen={modalState.paymentRequestOpen}
                onClose={() => setModalState(prev => ({...prev, paymentRequestOpen: false}))}
                title="Outgoing Payment Request"
                subtitle="This is the exact request payload that was generated by the system and sent to the payment gateway for processing."
            />

            <QRDataViewer
                data={paymentResponse}
                isOpen={modalState.paymentResponseOpen}
                onClose={() => setModalState(prev => ({...prev, paymentResponseOpen: false}))}
                title="Payment Response"
                subtitle="This is the response returned by the payment gateway after processing the payment request."
            />

            {modalState.showPaymentModal && paymentRequest && (
                <PaymentForm
                    data={paymentRequest}
                    onSubmit={handlePaymentSubmit}
                    onClose={() =>
                        setModalState(prev => ({...prev, showPaymentModal: false}))
                    }
                />
            )}

            {modal.show && (
                <AlertModal
                    title={modal.title!}
                    message={modal.message!}
                    onConfirm={handleCloseModal}
                    onClose={handleCloseModal}
                    error
                />
            )}
        </div>
    );
}