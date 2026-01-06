import React, { useEffect, useState, useCallback } from "react";
import styles from "./GatewayModal.module.css"
import useGatewayAPI from "../../api/hooks/useGatewayAPI";
import useEndpoints from "../../api/hooks/useEndpoints";
import { AiOutlineClose, AiOutlineWarning } from "react-icons/ai";
import { extractErrorMessage } from "../../utils/extractErrorMessage";
import { FiLoader } from "react-icons/fi";

interface StatusCheckerProps {
    endToEndId: string;
    txId: string;
    toBIC: string;
    isOpen: boolean;
    onClose: () => void;
}

const StatusChecker: React.FC<StatusCheckerProps> = ({
                                                         endToEndId,
                                                         txId,
                                                         toBIC,
                                                         isOpen,
                                                         onClose,
                                                     }) => {
    const { getStatus, loading: statusLoading } = useGatewayAPI();
    const { endpoints, loading: endpointsLoading, error: endpointsError } = useEndpoints();

    const [statusResponse, setStatusResponse] = useState<any>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Handle escape key press to close modal
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // Handle click outside to close
    const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    // Reset states when modal opens
    useEffect(() => {
        if (isOpen) {
            setStatusResponse(null);
            setFetchError(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        if (endpointsLoading || endpointsError || !endpoints) return;

        const statusEndpoint = endpoints["StatusRequest"];
        if (!statusEndpoint) {
            setFetchError("Status endpoint not configured");
            return;
        }

        const payload: Record<string, string> = {};
        statusEndpoint.fieldMappings.forEach((field: any) => {
            switch (field.internalField) {
                case "EndToEndId":
                    payload[field.userField] = endToEndId;
                    break;
                case "TxId":
                    payload[field.userField] = txId;
                    break;
                case "ToBIC":
                    payload[field.userField] = toBIC;
                    break;
                default:
                    payload[field.userField] = "";
            }
        });

        const fetchStatus = async () => {
            try {
                const response = await getStatus(payload);
                setStatusResponse(response);
                setFetchError(null);
            } catch (err) {
                setFetchError(extractErrorMessage(err, "Unexpected error occurred"));
                setStatusResponse(null);
            }
        };

        void fetchStatus();
    }, [isOpen, txId, toBIC, endToEndId]);

    if (!isOpen) return null;

    return (
        <div className={styles.popupOverlay} onClick={handleOverlayClick}>
            <div className={styles.popupContent}>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close status checker"
                >
                    <AiOutlineClose size={20} />
                </button>

                <h3>Transaction Status Check</h3>

                {/* Endpoints loading/error */}
                {endpointsLoading && (
                    <p className={styles.loading}>
                        <FiLoader className={styles.spinner} />
                        Loading endpoints configuration...
                    </p>
                )}

                {endpointsError && (
                    <p className={styles.errorMessage}>
                        <AiOutlineWarning />
                        Error loading endpoints: {endpointsError}
                    </p>
                )}

                {/* Status API loading/error */}
                {!endpointsLoading && !endpointsError && statusLoading && (
                    <p className={styles.loading}>
                        <FiLoader className={styles.spinner} />
                        Fetching transaction status...
                    </p>
                )}

                {!endpointsLoading && !endpointsError && !statusLoading && fetchError && (
                    <p className={styles.errorMessage}>
                        <AiOutlineWarning />
                        Error fetching status: {fetchError}
                    </p>
                )}

                {/* Display response */}
                {!endpointsLoading &&
                    !endpointsError &&
                    !statusLoading &&
                    !fetchError &&
                    statusResponse && (
                        <>
                            <div className={styles.responseHeader}>
                                <h4>Status Response</h4>
                                <div className={styles.transactionInfo}>
                                    <span>Transaction ID: <strong>{txId}</strong></span>
                                    <span>End-to-End ID: <strong>{endToEndId}</strong></span>
                                </div>
                            </div>
                            <pre className={styles.responseText}>
                                {JSON.stringify(statusResponse, null, 2)}
                            </pre>
                        </>
                    )}
            </div>
        </div>
    );
};

export default StatusChecker;