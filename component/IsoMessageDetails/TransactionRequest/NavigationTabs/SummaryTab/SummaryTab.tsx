import React from "react";
import styles from "./SummaryTab.module.css";
import { getTransactionTypeLabel } from "../../../../TransactionDetailsModal/TransactionDetailsModal";
import { Transaction } from "../../../../../types/types";

interface SummaryTabProps {
    transactions: Transaction[];
}

const SummaryTab: React.FC<SummaryTabProps> = ({ transactions }) => {
    return (
        <div className={styles.summaryTabContainer}>
            {transactions.length === 0 ? (
                <p className={styles.noTransactions}>No transactions available.</p>
            ) : (
                transactions.map((transaction) => (
                    <div key={transaction.id} className={styles.summaryTransaction}>
                        <div>
                            <strong>Internal ID</strong>
                            <span>{transaction.id}</span>
                        </div>

                        <div>
                            <strong>Transaction ID</strong>
                            <span>{transaction.txId || "N/A"}</span>
                        </div>

                        <div>
                            <strong>Type</strong>
                            <span>{getTransactionTypeLabel(transaction.type)}</span>
                        </div>

                        <div className={styles.amountContainer}>
                            <strong>Amount</strong>
                            <span className={styles.amountValue}>
                                {transaction.amount} {transaction.currency}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default SummaryTab;