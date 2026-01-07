import React, {useEffect, useState, useCallback} from "react";
import styles from "./GatewayModal.module.css";
import useGatewayAPI from "../../api/hooks/useGatewayAPI";
import {AiOutlineClose, AiOutlineWarning} from "react-icons/ai";
import {FiLoader} from "react-icons/fi";
import {extractErrorMessage} from "../../utils/extractErrorMessage";

interface RetryReturnModalProps {
    returnId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const RetryReturnModal: React.FC<RetryReturnModalProps> = ({
                                                               returnId,
                                                               isOpen,
                                                               onClose,
                                                               onSuccess,
                                                           }) => {
    const {retryReturn, loading} = useGatewayAPI();

    const [response, setResponse] = useState<any>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Close on ESC
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Close on overlay click
    const handleOverlayClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose]
    );

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setResponse(null);
            setFetchError(null);
        }
    }, [isOpen]);

    // Retry return call
    useEffect(() => {
        if (!isOpen) return;

        const retry = async () => {
            try {
                const res = await retryReturn(returnId);
                setResponse(res);
                if (onSuccess) onSuccess();
            } catch (err) {
                setFetchError(
                    extractErrorMessage(err, "Failed to retry return")
                );
            }
        };

        void retry();
    }, [isOpen, returnId]);

    if (!isOpen) return null;

    return (
        <div className={styles.popupOverlay} onClick={handleOverlayClick}>
            <div className={styles.popupContent}>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close retry return modal"
                >
                    <AiOutlineClose size={20}/>
                </button>

                <h3>Retry Return</h3>

                {loading && (
                    <p className={styles.loading}>
                        <FiLoader className={styles.spinner}/>
                        Retrying return...
                    </p>
                )}

                {!loading && fetchError && (
                    <p className={styles.errorMessage}>
                        <AiOutlineWarning/>
                        {fetchError}
                    </p>
                )}

                {!loading && !fetchError && response && (
                    <>
                        <div className={styles.responseHeader}>
                            <h4>Retry Response</h4>
                            <div className={styles.transactionInfo}>
                                <span>
                                    Return ID: <strong>{returnId}</strong>
                                </span>
                            </div>
                        </div>

                        <pre className={styles.responseText}>
                            {JSON.stringify(response, null, 2)}
                        </pre>
                    </>
                )}
            </div>
        </div>
    );
};

export default RetryReturnModal;
