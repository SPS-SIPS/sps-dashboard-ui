import React from 'react';
import styles from './TransactionDetailsModal.module.css';
import {Transaction, TransactionType} from '../../types/types';
import {AiOutlineClose} from 'react-icons/ai';
import {bicOptions} from '../../constants/gatewayFormOptions';

interface Props {
    transaction: Transaction | null;
    onClose: () => void;
}

const getTransactionTypeLabel = (type: TransactionType) => {
    switch (type) {
        case TransactionType.Deposit:
            return 'Deposit';
        case TransactionType.Withdrawal:
            return 'Withdrawal';
        case TransactionType.ReadyForReturn:
            return 'Ready For Return';
        case TransactionType.ReturnWithdrawal:
            return 'Return Withdrawal';
        default:
            return 'Unknown';
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

export const getBicLabel = (bic?: string) => {
    const option = bicOptions.find(o => o.value === bic);
    return option ? option.label : bic || '-';
};

const transactionSections = [
    {
        title: 'Overview',
        fields: [
            { label: 'ID', value: (t: Transaction) => t.id },
            { label: 'Type', value: (t: Transaction) => getTransactionTypeLabel(t.type) },
            { label: 'Amount', value: (t: Transaction) => `${t.amount ?? '-'} ${t.currency ?? ''}` },
            { label: 'ISO Message ID', value: (t: Transaction) => t.isoMessageId },
        ],
    },
    {
        title: 'Debtor',
        fields: [
            { label: 'Name', value: (t: Transaction) => t.debtorName },
            { label: 'Account', value: (t: Transaction) => t.debtorAccount },
            { label: 'Account Type', value: (t: Transaction) => t.debtorAccountType },
            { label: 'Agent BIC', value: (t: Transaction) => getBicLabel(t.debtorAgentBIC) },
            { label: 'Issuer', value: (t: Transaction) => t.debtorIssuer },
        ],
    },
    {
        title: 'Creditor',
        fields: [
            { label: 'Name', value: (t: Transaction) => t.creditorName },
            { label: 'Account', value: (t: Transaction) => t.creditorAccount },
            { label: 'Account Type', value: (t: Transaction) => t.creditorAccountType },
            { label: 'Agent BIC', value: (t: Transaction) => getBicLabel(t.creditorAgentBIC) },
            { label: 'Issuer', value: (t: Transaction) => t.creditorIssuer },
        ],
    },
    {
        title: 'Payment Details',
        fields: [
            { label: 'From BIC', value: (t: Transaction) => getBicLabel(t.fromBIC) },
            { label: 'Local Instrument', value: (t: Transaction) => t.localInstrument },
            { label: 'Category Purpose', value: (t: Transaction) => t.categoryPurpose },
            { label: 'End To End ID', value: (t: Transaction) => t.endToEndId },
            { label: 'Transaction ID', value: (t: Transaction) => t.txId },
        ],
    },
    {
        title: 'Remittance',
        fields: [
            { label: 'Remittance Information', value: (t: Transaction) => t.remittanceInformation },
        ],
    },
];


const TransactionDetailsModal: React.FC<Props> = ({transaction, onClose}) => {
    if (!transaction) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label="Close modal"
                    >
                        <AiOutlineClose size={24}/>
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={`${styles.transactionCard} ${getTransactionTypeClass(transaction.type)}`}>
                    <div className={styles.transactionMainInfo}>
                            <h4 className={styles.transactionHeading}>
                                Transaction Details
                            </h4>

                            <p className={styles.transactionParties}>
                                <span className={styles.bic}>
                                    {getBicLabel(transaction.fromBIC)}
                                </span>
                                {transaction.creditorAgentBIC ? (
                                    <>{' - '}
                                        <span className={styles.bic}>
                                          {getBicLabel(transaction.creditorAgentBIC)}
                                        </span>
                                    </>
                                ) : null}

                                <span className={styles.separator}> • </span>
                                <span className={styles.amount}>
                                    {transaction.amount}
                                </span>
                                <span className={styles.currency}>
                                    {transaction.currency}
                                </span>
                            </p>
                        </div>

                        <p className={styles.transactionType}>
                            {getTransactionTypeLabel(transaction.type)}
                        </p>
                    </div>

                    <div className={styles.detailsContainer}>
                        {transactionSections.map(section => (
                            <div key={section.title} className={styles.section}>
                                <h4 className={styles.sectionTitle}>{section.title}</h4>

                                <div className={styles.fieldGrid}>
                                    {section.fields.map(field => {
                                        const value = field.value(transaction);

                                        if (!value) return null;

                                        return (
                                            <div key={field.label} className={styles.fieldRow}>
                                                <span className={styles.fieldLabel}>{field.label}</span>
                                                <span className={styles.fieldValue}>{value}</span>
                                            </div>
                                        );
                                    })}
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
