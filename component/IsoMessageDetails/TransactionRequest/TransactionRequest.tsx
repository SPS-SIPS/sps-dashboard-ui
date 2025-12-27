import React, {useState} from "react";
import {FiArrowRight, FiX} from "react-icons/fi";
import {
    getBicLabel,
    getTransactionTypeLabel,
} from "../../TransactionDetailsModal/TransactionDetailsModal";

import {TransactionType} from "../../../types/types";
import Breadcrumb from "../../common/Breadcrumb/Breadcrumb";
import {LuDot} from "react-icons/lu";
import SummaryTab from "./NavigationTabs/SummaryTab/SummaryTab";
import UnderConstructionTab from "./NavigationTabs/UnderConstructionTab/UnderConstructionTab";
import styles from "./TransactionRequest.module.css";
import {useTransactions} from "../../../api/hooks/useTransactions";

const breadcrumbs = [
    {label: "Home", link: "/"},
    {label: "ISO Messages", link: "/iso-messages"},
    {label: "ISO 20022 Transaction Requests", link: "/iso-messages"},
];

interface Props {
    txId: string;
    onClose?: () => void;
}

const Field: React.FC<{
    label: string;
    value?: React.ReactNode;
    fullWidth?: boolean;
}> = ({label, value, fullWidth}) => {
    if (!value) return null;

    return (
        <div className={fullWidth ? styles.fieldRowFull : styles.fieldRow}>
            <span className={styles.fieldLabel}>{label}</span>
            <span className={styles.fieldValue}>{value}</span>
        </div>
    );
};


const TransactionRequest: React.FC<Props> = ({txId, onClose}) => {
    const { transactions, loading, error } = useTransactions({ page: 0, pageSize: 10, TransactionId: txId });
    // Tabs with counts
    const tabs = [
        {label: "Summary", count: null},
        {label: "Status History", count: 1},
        {label: "Verifications", count: 0},
        {label: "Status Requests", count: 0},
    ];

    const [activeTab, setActiveTab] = useState("Summary");

    // Render tab content based on activeTab
    const renderTabContent = () => {
        switch (activeTab) {
            case "Summary":
                return <SummaryTab transactions={transactions}/>;

            case "Status History":
                return <UnderConstructionTab title="Status History"/>;

            case "Verifications":
                return <UnderConstructionTab title="Verifications"/>;

            case "Status Requests":
                return <UnderConstructionTab title="Status Requests"/>;

            case "Notifications":
                return <UnderConstructionTab title="Notifications"/>;

            default:
                return <UnderConstructionTab title={activeTab}/>;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <Breadcrumb breadcrumbs={breadcrumbs}/>

                <button className={styles.closeButton} onClick={onClose}>
                    <FiX size={20}/>
                </button>
            </div>

            <h3 className={styles.pageTitle}>Transaction Details</h3>

            {loading &&
                Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className={styles.transactionGrid}>
                        <div className={styles.loadingField}></div>
                        <div className={styles.loadingField}></div>
                        <div className={styles.loadingField}></div>
                        <div className={styles.loadingField}></div>
                        <div className={styles.loadingField}></div>
                        <div className={styles.loadingField}></div>
                        <div className={styles.loadingField}></div>
                        <div className={styles.loadingField}></div>
                    </div>
                ))}

            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && !error && transactions.map((transaction) => (
            <>
                <div key={transaction.id} className={styles.details}>
                    {/* Header */}
                    <div className={styles.detailsHeaderLeft}>
                        <div className={styles.bics}>
                            <span>{getBicLabel(transaction.fromBIC)}</span>
                            <FiArrowRight className={styles.bicIcon}/>
                            <span>{getBicLabel(transaction.creditorAgentBIC)}</span>
                            <LuDot/>
                            <span>
                                     {transaction.amount} {transaction.currency}
                                 </span>
                        </div>
                    </div>

                    {/* Status */}
                    <div
                        className={`${styles.statusContainer} ${
                            transaction.type === TransactionType.Deposit
                                ? styles.deposit
                                : transaction.type === TransactionType.Withdrawal
                                    ? styles.withdrawal
                                    : transaction.type === TransactionType.ReadyForReturn
                                        ? styles.readyForReturn
                                        : transaction.type === TransactionType.ReturnWithdrawal
                                            ? styles.returnWithdrawal
                                            : styles.unknown
                        }`}
                    >
                        <p className={styles.statusText}>
                            {getTransactionTypeLabel(transaction.type)}
                        </p>
                    </div>
                </div>

                {/* All Transaction Data */}
                <div className={styles.transactionGrid}>
                    <Field label="Transaction ID" value={transaction.txId}/>
                    <Field label="ISO Message ID" value={transaction.isoMessageId}/>
                    <Field label="End To End ID" value={transaction.endToEndId}/>
                    <Field label="Local Instrument" value={transaction.localInstrument}/>
                    <Field label="Category Purpose" value={transaction.categoryPurpose}/>

                    <Field label="Debtor Name" value={transaction.debtorName}/>
                    <Field label="Debtor Account" value={transaction.debtorAccount}/>
                    <Field label="Debtor Account Type" value={transaction.debtorAccountType}/>
                    <Field
                        label="Debtor Agent BIC"
                        value={getBicLabel(transaction.debtorAgentBIC)}
                    />
                    <Field label="Debtor Issuer" value={transaction.debtorIssuer}/>

                    <Field label="Creditor Name" value={transaction.creditorName}/>
                    <Field label="Creditor Account" value={transaction.creditorAccount}/>
                    <Field label="Creditor Account Type" value={transaction.creditorAccountType}/>
                    <Field
                        label="Creditor Agent BIC"
                        value={getBicLabel(transaction.creditorAgentBIC)}
                    />
                    <Field label="Creditor Issuer" value={transaction.creditorIssuer}/>

                    <Field
                        label="Remittance Information"
                        value={transaction.remittanceInformation}
                        fullWidth
                    />
                </div>
            </>
            ))}

            {/* Tabs Navigation at Bottom */}
            <nav className={styles.tabsContainer}>
                {tabs.map((tab) => (
                    <button
                        key={tab.label}
                        className={`${styles.tabButton} ${
                            activeTab === tab.label ? styles.active : ""
                        }`}
                        onClick={() => setActiveTab(tab.label)}
                        type="button"
                    >
                        {tab.label}
                        {tab.count !== null && tab.count > 0 ? ` (${tab.count})` : ""}
                    </button>
                ))}
            </nav>

            {/* Render selected tab content */}
            <div className={styles.tabContentContainer}>{renderTabContent()}</div>
        </div>
    );
};

export default TransactionRequest;
