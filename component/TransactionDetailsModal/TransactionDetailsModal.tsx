import React from "react";
import styles from "./TransactionDetailsModal.module.css";
import { Transaction, TransactionType } from "../../types/types";
import { AiOutlineClose } from "react-icons/ai";
import {useAuthentication} from "../../auth/AuthProvider";
import {bicOptionsDev, bicOptionsProd} from "../../constants/gatewayFormOptions";


interface Props {
  transaction: Transaction | null;
  onClose: () => void;
}

export const getTransactionTypeLabel = (type: TransactionType) => {
  switch (type) {
    case TransactionType.Deposit:
      return "Deposit";
    case TransactionType.Withdrawal:
      return "Withdrawal";
    case TransactionType.ReadyForReturn:
      return "Ready For Return";
    case TransactionType.ReturnWithdrawal:
      return "Return Withdrawal";
    default:
      return "Unknown";
  }
};

const getTransactionTypeClass = (type: TransactionType) => {
  switch (type) {
    case TransactionType.Deposit:
      return styles.deposit;
    case TransactionType.Withdrawal:
      return styles.withdrawal;
    case TransactionType.ReadyForReturn:
      return styles.readyForReturn;
    case TransactionType.ReturnWithdrawal:
      return styles.returnWithdrawal;
    default:
      return styles.unknown;
  }
};

const TransactionDetailsModal: React.FC<Props> = ({ transaction, onClose }) => {
  const {config} = useAuthentication();
  const activeProfile = config?.profile;

  const getBicLabel = (bic?: string) => {
    if (!bic) return "-";

    const options = activeProfile === "prod" ? bicOptionsProd : bicOptionsDev;
    const match = options.find((opt) => opt.value === bic);

    return match ? match.label : bic;
  };

  if (!transaction) return null;

  const transactionSections = [
    {
      title: "Overview",
      fields: [
        { label: "ID", value: transaction.id },
        { label: "Type", value: getTransactionTypeLabel(transaction.type) },
        {
          label: "Amount",
          value: `${transaction.amount ?? "-"} ${transaction.currency ?? ""}`,
        },
        { label: "ISO Message ID", value: transaction.isoMessageId },
      ],
    },
    {
      title: "Debtor",
      fields: [
        { label: "Name", value: transaction.debtorName },
        { label: "Account", value: transaction.debtorAccount },
        { label: "Account Type", value: transaction.debtorAccountType },
        {
          label: "Agent BIC",
          value: transaction.debtorAgentBIC,
        },
        { label: "Issuer", value: transaction.debtorIssuer },
      ],
    },
    {
      title: "Creditor",
      fields: [
        { label: "Name", value: transaction.creditorName },
        { label: "Account", value: transaction.creditorAccount },
        { label: "Account Type", value: transaction.creditorAccountType },
        {
          label: "Agent BIC",
          value: transaction.creditorAgentBIC,
        },
        { label: "Issuer", value: transaction.creditorIssuer },
      ],
    },
    {
      title: "Payment Details",
      fields: [
        { label: "From BIC", value: transaction.fromBIC },
        { label: "Local Instrument", value: transaction.localInstrument },
        { label: "Category Purpose", value: transaction.categoryPurpose },
        { label: "End To End ID", value: transaction.endToEndId },
        { label: "Transaction ID", value: transaction.txId },
      ],
    },
    {
      title: "Remittance",
      fields: [
        {
          label: "Remittance Information",
          value: transaction.remittanceInformation,
        },
      ],
    },
  ];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close modal"
          >
            <AiOutlineClose size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div
            className={`${styles.transactionCard} ${getTransactionTypeClass(
              transaction.type
            )}`}
          >
            <div className={styles.transactionMainInfo}>
              <h4 className={styles.transactionHeading}>Transaction Details</h4>

              <p className={styles.transactionParties}>
                <span className={styles.bic}>
                  {getBicLabel(transaction.fromBIC)}
                </span>

                {transaction.creditorAgentBIC && (
                  <>
                    {" - "}
                    <span className={styles.bic}>
                      {getBicLabel(transaction.creditorAgentBIC)}
                    </span>
                  </>
                )}

                <span className={styles.separator}> • </span>

                <span className={styles.amount}>{transaction.amount}</span>
                <span className={styles.currency}>{transaction.currency}</span>
              </p>
            </div>

            <p className={styles.transactionType}>
              {getTransactionTypeLabel(transaction.type)}
            </p>
          </div>

          <div className={styles.detailsContainer}>
            {transactionSections.map((section) => (
              <div key={section.title} className={styles.section}>
                <h4 className={styles.sectionTitle}>{section.title}</h4>

                <div className={styles.fieldGrid}>
                  {section.fields.map((field) =>
                    field.value ? (
                      <div key={field.label} className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>{field.label}</span>
                        <span className={styles.fieldValue}>{field.value}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
