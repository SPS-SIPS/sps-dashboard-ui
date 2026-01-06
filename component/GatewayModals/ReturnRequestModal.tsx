import React, {useEffect, useState, useCallback} from "react";
import {AiOutlineClose, AiOutlineWarning} from "react-icons/ai";
import Input from "../common/Input/Input";
import useEndpoints, {EndpointsData} from "../../api/hooks/useEndpoints";
import useGatewayAPI from "../../api/hooks/useGatewayAPI";
import {mapReturnRequestPayload, ReturnRequestSourceData} from "../../utils/returnRequestMapper";
import {extractErrorMessage} from "../../utils/extractErrorMessage";
import styles from "./GatewayModal.module.css";

interface ReturnRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    txId: string;
    endToEndId: string;
}

interface FormState {
    reason: string;
    additionalInfo: string;
    returnIdInput: string;
}

const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   txId,
                                                                   endToEndId,
                                                               }) => {

    const [formState, setFormState] = useState<FormState>({
        reason: "",
        additionalInfo: "",
        returnIdInput: "",
    });

    const {endpoints, loading: endpointsLoading, error: endpointsError} = useEndpoints();
    const {returnApi, loading} = useGatewayAPI();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [resultData, setResultData] = useState<any | null>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) resetModal();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    const handleOverlayClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) resetModal();
        },
        []
    );

    // Random 9-digit generator
    const generateRandomReturnId = () => {
        const randomId = Math.floor(100000000 + Math.random() * 900000000).toString();
        setFormState((prev) => ({...prev, returnIdInput: randomId}));
    };

    const buildReturnRequestPayload = (
        endpoints: EndpointsData | null,
        data: ReturnRequestSourceData
    ): Record<string, string> | null => {
        if (!endpoints?.ReturnRequest) return null;

        return mapReturnRequestPayload(
            endpoints.ReturnRequest.fieldMappings,
            data
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload = buildReturnRequestPayload(endpoints, {
            txId,
            endToEndId,
            reason: formState.reason,
            additionalInfo: formState.additionalInfo,
            returnIdInput: formState.returnIdInput,
        });

        if (!payload) {
            setErrorMessage("Cannot build payload. Please check the endpoints or form data.");
            return;
        }

        try {
            const result = await returnApi(payload);
            setResultData(result);
        } catch (err) {
            setErrorMessage(extractErrorMessage(err, "Error processing return"));
            setResultData(null);
        }
    };

    const isFormValid =
        formState.reason.trim() !== "" &&
        formState.returnIdInput.trim() !== "" &&
        txId.trim() !== "" &&
        endToEndId.trim() !== "";

    const resetModal = () => {
        setFormState({
            reason: "",
            additionalInfo: "",
            returnIdInput: "",
        });
        setErrorMessage(null);
        setResultData(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.popupOverlay} onClick={handleOverlayClick}>
            <div className={styles.popupContent}>
                <button
                    className={styles.closeButton}
                    onClick={resetModal}
                    aria-label="Close return request modal"
                    disabled={loading || endpointsLoading}
                    style={{
                        cursor: loading || endpointsLoading ? 'not-allowed' : 'pointer',
                        opacity: loading || endpointsLoading ? 0.5 : 1
                    }}
                >
                    <AiOutlineClose size={20}/>
                </button>

                <h3 className={styles.modalTitle}>Return Requests</h3>

                {errorMessage || endpointsError ? (
                    <p className={styles.errorMessage}>
                        <AiOutlineWarning/>
                        {errorMessage || endpointsError}
                    </p>
                ) : resultData ? (
                    <>
                        <div className={styles.responseHeader}>
                            <h4>Status Response</h4>
                            <div className={styles.transactionInfo}>
                                <span>Transaction ID: <strong>{txId}</strong></span>
                                <span>End-to-End ID: <strong>{endToEndId}</strong></span>
                            </div>
                        </div>
                        <pre className={styles.responseText}>
                                {JSON.stringify(resultData, null, 2)}
                        </pre>
                    </>
                ) : (
                    <form className={styles.returnForm} onSubmit={handleSubmit}>
                        <Input
                            label="Transaction ID"
                            value={txId}
                            type="text"
                            disabled
                            onChange={() => {
                            }}
                        />

                        <Input
                            label="End-to-End ID"
                            value={endToEndId}
                            type="text"
                            disabled
                            onChange={() => {
                            }}
                        />

                        <Input
                            label="Reason"
                            value={formState.reason}
                            onChange={(e) =>
                                setFormState((prev) => ({...prev, reason: e.target.value}))
                            }
                            type="text"
                            placeholder="Enter reason"
                            required
                        />

                        <Input
                            label="Additional Info"
                            value={formState.additionalInfo}
                            onChange={(e) =>
                                setFormState((prev) => ({...prev, additionalInfo: e.target.value}))
                            }
                            type="text"
                            placeholder="Enter additional info"
                        />

                        <div className={styles.returnIdContainer}>
                            <Input
                                label="Return ID"
                                value={formState.returnIdInput}
                                onChange={(e) =>
                                    setFormState((prev) => ({...prev, returnIdInput: e.target.value}))
                                }
                                type="text"
                                placeholder="Enter return ID or generate"
                                required
                            />
                            <p
                                className={styles.generateLink}
                                onClick={generateRandomReturnId}
                            >
                                Generate Random Return ID
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className={styles.buttonContainer}>
                            <button
                                type="submit"
                                className={styles.returnButton}
                                disabled={!isFormValid || loading || endpointsLoading}
                            >
                                {loading || endpointsLoading
                                    ? endpointsLoading
                                        ? "Loading endpoints..."
                                        : "Processing..."
                                    : "Process Return"}
                            </button>

                            <button
                                className={styles.cancelButton}
                                onClick={onClose}
                                type="button"
                                disabled={loading || endpointsLoading}
                            >
                                {loading || endpointsLoading ? "Please wait..." : "Cancel"}
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
};

export default ReturnRequestModal;
