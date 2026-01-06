import React, { useEffect, useState } from "react";
import styles from "./SummaryTab.module.css";
import { getTransactionTypeLabel } from "../../../../TransactionDetailsModal/TransactionDetailsModal";
import { useTransactions } from "../../../../../api/hooks/useTransactions";
import TransactionDetailsModal from "../../../../TransactionDetailsModal/TransactionDetailsModal";
import { Transaction } from "../../../../../types/types";

interface SummaryTabProps {
    txId?: string | null;
}

const SummaryTab: React.FC<SummaryTabProps> = ({ txId }) => {
    const { transactions, loading, error, refetch } = useTransactions(
        txId ? { page: 0, pageSize: 100, TransactionId: txId } : { page: 0, pageSize: 100 }
    );

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    useEffect(() => {
        if (txId) {
            void refetch();
        }
    }, [txId]);

    if (!txId || !transactions || transactions.length === 0) {
        return <p className={styles.noTransactions}>No transactions related to this message.</p>;
    }

    if (loading) {
        return <p className={styles.loading}>Loading transactions...</p>;
    }

    if (error) {
        return <p className={styles.error}>Error: {error}</p>;
    }

    return (
        <div className={styles.summaryTabContainer}>
            {transactions.map((transaction) => (
                <div key={transaction.id} className={styles.summaryTransaction}>
                    <div className={styles.transactionField}>
                        <strong className={styles.fieldLabel}>Internal ID</strong>
                        <span className={styles.fieldValue}>{transaction.id}</span>
                    </div>

                    <div className={styles.transactionField}>
                        <strong className={styles.fieldLabel}>Transaction ID</strong>
                        <span className={styles.fieldValue}>{transaction.txId || "N/A"}</span>
                    </div>

                    <div className={styles.transactionField}>
                        <strong className={styles.fieldLabel}>Type</strong>
                        <span className={styles.fieldValue}>{getTransactionTypeLabel(transaction.type)}</span>
                    </div>

                    <div className={`${styles.transactionField} ${styles.amountContainer}`}>
                        <strong className={styles.fieldLabel}>Amount</strong>
                        <span className={styles.amountValue}>
                            {transaction.amount} {transaction.currency}
                        </span>
                    </div>

                    {/* Button to open modal */}
                    <button
                        className={styles.detailsButton}
                        onClick={() => setSelectedTransaction(transaction)}
                    >
                        View Details
                    </button>
                </div>
            ))}

            {/* Modal */}
            {selectedTransaction && (
                <TransactionDetailsModal
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                />
            )}
        </div>
    );
};

export default SummaryTab;
