import React from "react";
import DashboardCard from "../DashboardCard/DashboardCard";
import styles from "./TransactionTypeDistributionSection.module.css";
import {
    FiArrowDownCircle,
    FiArrowUpCircle,
    FiRefreshCw,
    FiRotateCcw,
    FiPieChart,
    FiDollarSign,
} from "react-icons/fi";
import {
    TransactionTypeDistribution,
    TransactionTypeSummary,
} from "../../../api/hooks/useDashboardAPI";
import {TransactionType} from "../../../types/types";

type Props = {
    data: TransactionTypeDistribution;
};

const transactionColorMap: Record<string, string> = {
    deposit: "#10b981", // Emerald 500
    withdrawal: "#ef4444", // Red 500
    readyforreturn: "#f59e0b", // Amber 500
    returnwithdrawal: "#8b5cf6", // Violet 500
    default: "#64748b", // Slate 500
};

const transactionIconMap: Record<string, React.ReactNode> = {
    deposit: <FiArrowDownCircle/>,
    withdrawal: <FiArrowUpCircle/>,
    readyforreturn: <FiRefreshCw/>,
    returnwithdrawal: <FiRotateCcw/>,
    default: <FiDollarSign/>,
};

const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);

const transactionTypeLabelMap: Record<TransactionType, string> = {
    [TransactionType.Deposit]: "Deposits",
    [TransactionType.Withdrawal]: "Withdrawals",
    [TransactionType.ReadyForReturn]: "Ready for Return",
    [TransactionType.ReturnWithdrawal]: "Return Withdrawals",
};

const transactionTypeKeyMap: Record<TransactionType, string> = {
    [TransactionType.Deposit]: "deposit",
    [TransactionType.Withdrawal]: "withdrawal",
    [TransactionType.ReadyForReturn]: "readyforreturn",
    [TransactionType.ReturnWithdrawal]: "returnwithdrawal",
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value);

const TransactionTypeDistributionSection: React.FC<Props> = ({data}) => {
    const hasData =
        data?.transactionTypeSummary &&
        data.transactionTypeSummary.length > 0;

    if (!hasData) {
        return (
            <div className={styles.emptyState}>
                <FiPieChart className={styles.emptyIcon}/>
                <p className={styles.emptyText}>
                    No transaction data available
                </p>
            </div>
        );
    }

    return (
        <div className={styles.section}>
            <div className={styles.grid}>
                {data.transactionTypeSummary.map((tx: TransactionTypeSummary) => {
                    const label = transactionTypeLabelMap[tx.type];
                    const key = transactionTypeKeyMap[tx.type];

                    const cardColor = transactionColorMap[key] ?? transactionColorMap.default;
                    const icon = transactionIconMap[key] ?? transactionIconMap.default;

                    return (
                        <DashboardCard
                            key={tx.type}
                            title={label}
                            value={formatCurrency(tx.totalAmount)}
                            description={`${formatNumber(tx.count)} transactions`}
                            icon={icon}
                            colorVar={cardColor}
                            isRawColor
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default TransactionTypeDistributionSection;