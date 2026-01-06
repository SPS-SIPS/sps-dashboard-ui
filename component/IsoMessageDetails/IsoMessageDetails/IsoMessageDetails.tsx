import { useBicLabel } from "../../../api/hooks/useBicLable";
import {getTransactionStatusText, ISOMessage, ISOMessageType, TransactionStatus} from "../../../types/types";
import React, {useState} from "react";
import {getMessageTypeTitle, MESSAGE_TYPE_BREADCRUMB_LABELS} from "../../../utils/isoMessage";
import UnderConstructionTab from "./NavigationTabs/UnderConstructionTab/UnderConstructionTab";
import Breadcrumb from "../../common/Breadcrumb/Breadcrumb";
import {FiArrowRight, FiCornerUpLeft, FiEye, FiInfo, FiRefreshCw, FiX} from "react-icons/fi";

import styles from "./IsoMessageDetails.module.css"
import XmlViewerModal from "../../XmlViewerModal/XmlViewerModal";
import StatusTab from "./NavigationTabs/StatusTab/StatusTab";
import SummaryTab from "./NavigationTabs/SummaryTab/SummaryTab";

interface Props {
    isoMessage: ISOMessage;
    onClose?: () => void;
}

const IsoMessageDetails: React.FC<Props> = ({isoMessage, onClose}) => {
    const [selectedXml, setSelectedXml] = useState<{
        content: string;
        title: string;
    } | null>(null);
    const getBicLabel = useBicLabel();

    const breadcrumbs = [
        {label: "Home", link: "/"},
        {label: "ISO Messages", link: "/iso-messages"},
        {
            label: `ISO 20022 ${MESSAGE_TYPE_BREADCRUMB_LABELS[isoMessage.messageType]}`, link: `/iso-messages`,

        },
    ];

    const hasValue = (value?: string | null) =>
        value !== null && value !== undefined && value.trim() !== "";


    const displayValue = (value?: string | number) => (value ? value : "-");

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusColor = (status: TransactionStatus) => {
        switch (status) {
            case TransactionStatus.Success:
                return "var(--color-success)";
            case TransactionStatus.Failed:
                return "var(--color-error)";
            case TransactionStatus.Pending:
                return "var(--color-warning)";
            case TransactionStatus.ReadyForReturn:
                return "var(--color-error-dark)";
            case TransactionStatus.CheckStatus:
                return "var(--color-text-primary)";
            default:
                return "var(--color-text-secondary)";
        }
    };

    const tabs = [
        {id: "related-transactions", label: "Related Transactions", count: 0},
        {id: "status-history", label: "Status History", count: 0},
    ];

    const [activeTab, setActiveTab] = useState("related-transactions");

    const renderTabContent = () => {
        switch (activeTab) {
            case "related-transactions":
                return <SummaryTab txId={isoMessage.txId} />;

            case "status-history":
                return <StatusTab isoMessageIds={[isoMessage.id]} />;

            default:
                return <UnderConstructionTab title={activeTab}/>;
        }
    };

    const shouldShowStatusButton =
        isoMessage.status !== TransactionStatus.Success &&
        isoMessage.messageType !== ISOMessageType.VerificationRequest &&
        isoMessage.messageType !== ISOMessageType.VerificationResponse &&
        hasValue(isoMessage.txId) &&
        hasValue(isoMessage.endToEndId) &&
        hasValue(isoMessage.toBIC);

    const shouldShowReturnButton =
        isoMessage.round >= 3 &&
        (
            isoMessage.messageType === ISOMessageType.TransactionRequest ||
            isoMessage.messageType === ISOMessageType.ReturnRequest
        );

    const shouldShowRetryButton =
        isoMessage.status !== TransactionStatus.Success &&
        isoMessage.round < 3 &&
        isoMessage.messageType === ISOMessageType.TransactionRequest;

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <Breadcrumb breadcrumbs={breadcrumbs} />

                <div className={styles.headerActions}>
                    {/* Retry */}
                    {shouldShowRetryButton && (
                        <button
                            className={`${styles.actionButton} ${styles.retry}`}
                            onClick={() => console.log("Retry")}
                            type="button"
                            title="Retry Message"
                        >
                            <FiRefreshCw size={16} />
                            <span>Retry</span>
                        </button>
                    )}

                    {shouldShowReturnButton && (
                        <button
                            className={`${styles.actionButton} ${styles.return}`}
                            onClick={() => console.log("Return")}
                            type="button"
                            title="Return Message"
                        >
                            <FiCornerUpLeft size={16} />
                            <span>Return</span>
                        </button>
                    )}

                    {shouldShowStatusButton && (
                        <button
                            className={`${styles.actionButton} ${styles.status}`}
                            onClick={() => console.log("Check Status")}
                            type="button"
                            title="Check Status"
                        >
                            <FiInfo size={16} />
                            <span>Status</span>
                        </button>
                    )}

                    <button
                        className={`${styles.actionButton} ${styles.close}`}
                        onClick={onClose}
                        type="button"
                        title="Close"
                    >
                        <FiX size={16} />
                        <span>Close</span>
                    </button>
                </div>
            </div>

            <div className={styles.details}>
                <div className={styles.detailsHeaderLeft}>
                    <h3>{getMessageTypeTitle(isoMessage.messageType)}</h3>

                    <div className={styles.bics}>
                        <span>{getBicLabel(isoMessage.fromBIC)}</span>
                        <FiArrowRight className={styles.bicIcon}/>
                        <span>{getBicLabel(isoMessage.toBIC)}</span>
                    </div>
                </div>

                <div
                    className={styles.statusContainer}
                    style={{background: getStatusColor(isoMessage.status)}}
                >
                    <p className={styles.statusText}>
                        {getTransactionStatusText(isoMessage.status)}
                    </p>
                </div>
            </div>

            {/* General Information */}
            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>General Information</h4>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Message ID:</span>
                    <span className={styles.value}>{displayValue(isoMessage.msgId)}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Business Msg ID:</span>
                    <span className={styles.value}>
            {displayValue(isoMessage.bizMsgIdr)}
          </span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Message Definition ID:</span>
                    <span className={styles.value}>
            {displayValue(isoMessage.msgDefIdr)}
          </span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Round:</span>
                    <span className={styles.value}>{displayValue(isoMessage.round)}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Date:</span>
                    <span className={styles.value}>{formatDate(isoMessage.date)}</span>
                </div>
            </div>

            {/* Transaction Information */}
            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Transaction Information</h4>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Transaction ID:</span>
                    <span className={styles.value}>{displayValue(isoMessage.txId)}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>End-to-End ID:</span>
                    <span className={styles.value}>
            {displayValue(isoMessage.endToEndId)}
          </span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Reason:</span>
                    <span className={styles.value}>
            {displayValue(isoMessage.reason)}
          </span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Additional Info:</span>
                    <span className={styles.value}>
            {displayValue(isoMessage.additionalInfo)}
          </span>
                </div>
            </div>

            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Request / Response</h4>
                <div className={styles.infoRow}>
                    <button
                        className={`${styles.xmlButton} ${styles.requestButton}`}
                        onClick={() =>
                            setSelectedXml({
                                content: isoMessage.request,
                                title: `Request - ${isoMessage.msgId}`,
                            })
                        }
                    >
                        <FiEye className={styles.icon}/> View Request
                    </button>
                </div>

                <div className={styles.infoRow}>
                    <button
                        className={`${styles.xmlButton} ${styles.responseButton}`}
                        onClick={() =>
                            setSelectedXml({
                                content: isoMessage.response,
                                title: `Response - ${isoMessage.msgId}`,
                            })
                        }
                    >
                        <FiEye className={styles.icon}/> View Response
                    </button>
                </div>

            </div>

            {/* Tabs Navigation at Bottom */}
            <nav className={styles.tabsContainer}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.tabButton} ${
                            activeTab === tab.id ? styles.active : ""
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                        type="button"
                    >
                        {tab.label}
                        {tab.count !== null && tab.count > 0 ? ` (${tab.count})` : ""}
                    </button>
                ))}
            </nav>

            {/* Render selected tab content */}
            <div className={styles.tabContentContainer}>{renderTabContent()}</div>

            {selectedXml && (
                <XmlViewerModal
                    content={selectedXml.content}
                    title={selectedXml.title}
                    onClose={() => setSelectedXml(null)}
                />
            )}
        </div>
    );
};

export default IsoMessageDetails;
