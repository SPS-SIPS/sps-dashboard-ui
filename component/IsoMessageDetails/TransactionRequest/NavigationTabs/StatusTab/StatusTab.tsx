import React, {useEffect, useState} from "react";
import useStatusMessages, {StatusMessage} from "../../../../../api/hooks/useStatusMessages";
import {getTransactionStatusText, getISOMessageTypeText} from "../../../../../types/types";
import styles from "./StatusTab.module.css";
import XmlViewerModal from "../../../../XmlViewerModal/XmlViewerModal";

type StatusTabProps = {
    isoMessageIds: number[];
};

const DataField: React.FC<{ label: string; value?: string | number | null }> = ({label, value}) => {
    if (value === undefined || value === null || value === "") return null;
    return (
        <div className={styles.dataField}>
            <span className={styles.label}>{label}:</span>
            <span className={styles.value}>{value}</span>
        </div>
    );
};

const StatusTab: React.FC<StatusTabProps> = ({isoMessageIds}) => {
    const {getStatusMessages} = useStatusMessages();
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [xmlModal, setXmlModal] = useState<{
        visible: boolean;
        title: string;
        content: string;
    }>({visible: false, title: "", content: ""});

    useEffect(() => {
        if (!isoMessageIds || isoMessageIds.length === 0) return;

        const fetchAllStatusMessages = async () => {
            setLoading(true);
            setError(null);
            try {
                const results = await Promise.all(
                    isoMessageIds.map((id) => getStatusMessages({page: 0, pageSize: 100, relatedToISOMessageId: id}))
                );
                const flattened = results.flat().sort((a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                setStatusMessages(flattened);
            } catch {
                setError("Failed to load status history");
            } finally {
                setLoading(false);
            }
        };

        void fetchAllStatusMessages();
    }, [isoMessageIds]);

    if (loading) return <div className={styles.loading}>Loading status history...</div>;
    if (error) return <p className={styles.error}>{error}</p>;
    if (statusMessages.length === 0) return <p className={styles.noData}>No status messages found.</p>;


    const openXmlModal = (title: string, content: string) => {
        setXmlModal({visible: true, title, content});
    };

    const closeXmlModal = () => {
        setXmlModal({visible: false, title: "", content: ""});
    };

    return (
        <div className={styles.statusTimeline}>
            {statusMessages.map((msg) => (
                <div key={msg.id} className={styles.statusCard}>
                    <div className={styles.statusIndicator}>
                        <div className={`${styles.dot} ${styles[`status${msg.status}`]}`}/>
                        <div className={styles.line}/>
                    </div>

                    <div className={styles.statusContent}>
                        <div className={styles.statusHeader}>
                            <div className={styles.headerLeft}>
                                <span className={styles.statusBadge}>{getTransactionStatusText(msg.status)}</span>
                                <span className={styles.typeBadge}>{getISOMessageTypeText(msg.messageType)}</span>
                                {msg.round && <span className={styles.roundBadge}>Round {msg.round}</span>}
                            </div>
                            <span className={styles.statusDate}>{new Date(msg.date).toLocaleString()}</span>
                        </div>

                        <div className={styles.gridContainer}>
                            <div className={styles.section}>
                                <h5>Identification</h5>
                                <DataField label={"ID"} value={msg.id} />
                                <DataField label="Message ID" value={msg.msgId}/>
                                <DataField label="Biz Msg Id" value={msg.bizMsgIdr}/>
                                <DataField label="Msg Def Id" value={msg.msgDefIdr}/>
                                <DataField label="Transaction ID" value={msg.txId}/>
                                <DataField label="End to End ID" value={msg.endToEndId}/>
                            </div>

                            <div className={styles.section}>
                                <h5>Routing & Details</h5>
                                <DataField label="From BIC" value={msg.fromBIC}/>
                                <DataField label="To BIC" value={msg.toBIC}/>
                                <DataField label="Reason" value={msg.reason}/>
                            </div>
                        </div>

                        {msg.additionalInfo && (
                            <div className={styles.additionalInfoBox}>
                                <strong>Additional Info:</strong>
                                <p>{msg.additionalInfo}</p>
                            </div>
                        )}
                        <div className={styles.payloadActions}>
                            <button
                                className={styles.payloadBtn}
                                onClick={() => openXmlModal("Request XML", msg.request || "")}
                            >
                                View Request XML
                            </button>
                            <button
                                className={styles.payloadBtn}
                                onClick={() => openXmlModal("Response XML", msg.response || "")}
                            >
                                View Response XML
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {xmlModal.visible && (
                <XmlViewerModal
                    title={xmlModal.title}
                    content={xmlModal.content}
                    onClose={closeXmlModal}
                />
            )}
        </div>
    );
};

export default StatusTab;
