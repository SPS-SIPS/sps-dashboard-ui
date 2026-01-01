import React, { useState } from "react";
import styles from "./VerificationRequest.module.css";
import Breadcrumb from "../../common/Breadcrumb/Breadcrumb";
import {
  ISOMessage,
  getTransactionStatusText,
  TransactionStatus,
} from "../../../types/types";
import { FiArrowRight, FiEye, FiX } from "react-icons/fi";
import XmlViewerModal from "../../XmlViewerModal/XmlViewerModal";
import { useBicLabel } from "../../../api/hooks/useBicLable";

interface Props {
  isoMessage: ISOMessage;
  onClose?: () => void;
}

const VerificationRequest: React.FC<Props> = ({ isoMessage, onClose }) => {
  const [selectedXml, setSelectedXml] = useState<{
    content: string;
    title: string;
  } | null>(null);
  const getBicLabel = useBicLabel();

  const breadcrumbs = [
    { label: "Home", link: "/" },
    { label: "ISO Messages", link: "/iso-messages" },
    { label: "ISO 20022 Identification Verification", link: "/iso-messages" },
  ];

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

  return (
    <div className={styles.container}>
      <Breadcrumb breadcrumbs={breadcrumbs} />

      <button className={styles.closeButton} onClick={onClose}>
        <FiX size={20} />
      </button>
      <div className={styles.details}>
        <div className={styles.detailsHeaderLeft}>
          <h3>ISO 20022 Verification Request Details</h3>

          <div className={styles.bics}>
            <span>{getBicLabel(isoMessage.fromBIC)}</span>
            <FiArrowRight className={styles.bicIcon} />
            <span>{getBicLabel(isoMessage.toBIC)}</span>
          </div>
        </div>

        <div
          className={styles.statusContainer}
          style={{ background: getStatusColor(isoMessage.status) }}
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
            <FiEye className={styles.icon} /> View Request
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
            <FiEye className={styles.icon} /> View Response
          </button>
        </div>
      </div>

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

export default VerificationRequest;
