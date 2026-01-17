import React, { useMemo } from 'react';
import {
    FiArrowDown,
    FiArrowUp,
    FiTrendingUp,
    FiTrendingDown,
    FiDollarSign,
    FiHash,
    FiActivity
} from 'react-icons/fi';
import styles from './CashFlowCard.module.css';

interface FlowData {
    type: string;
    count: number;
    totalAmount: number;
}

interface CashFlowProps {
    data: {
        inbound: FlowData;
        outbound: FlowData;
        netFlow: number;
    };
    period?: string;
}

const CashFlowCard: React.FC<CashFlowProps> = ({ data, period = 'Current Period' }) => {

    // Format currency for display
    const formatCurrency = useMemo(() => (amount: number) => {
        const absAmount = Math.abs(amount);
        const sign = amount < 0 ? '-' : '';

        if (absAmount >= 1000000) {
            return `${sign}$${(absAmount / 1000000).toFixed(2)}M`;
        }
        if (absAmount >= 1000) {
            return `${sign}$${(absAmount / 1000).toFixed(2)}K`;
        }
        return `${sign}$${absAmount.toFixed(2)}`;
    }, []);

    // Format count with proper pluralization
    const formatCount = useMemo(() => (count: number) => {
        return `${count} ${count === 1 ? 'transaction' : 'transactions'}`;
    }, []);

    // Determine net flow status
    const netFlowStatus = useMemo(() => {
        if (data.netFlow > 0) return {
            status: 'positive',
            icon: <FiTrendingUp className={styles.netIconPositive} />,
            label: 'Net Inflow',
            description: 'Positive cash flow'
        };
        if (data.netFlow < 0) return {
            status: 'negative',
            icon: <FiTrendingDown className={styles.netIconNegative} />,
            label: 'Net Outflow',
            description: 'Negative cash flow'
        };
        return {
            status: 'neutral',
            icon: <FiActivity className={styles.netIconNeutral} />,
            label: 'Balanced',
            description: 'No net flow'
        };
    }, [data.netFlow]);

    // Calculate percentages for visual indicators
    const totalCashFlow = useMemo(() => {
        return Math.abs(data.inbound.totalAmount) + Math.abs(data.outbound.totalAmount);
    }, [data.inbound.totalAmount, data.outbound.totalAmount]);

    const inboundPercentage = useMemo(() => {
        return totalCashFlow > 0 ? (Math.abs(data.inbound.totalAmount) / totalCashFlow) * 100 : 50;
    }, [data.inbound.totalAmount, totalCashFlow]);

    const outboundPercentage = useMemo(() => {
        return 100 - inboundPercentage;
    }, [inboundPercentage]);

    // Calculate average transaction amounts
    const inboundAvg = useMemo(() => {
        return data.inbound.count > 0 ? data.inbound.totalAmount / data.inbound.count : 0;
    }, [data.inbound]);

    const outboundAvg = useMemo(() => {
        return data.outbound.count > 0 ? data.outbound.totalAmount / data.outbound.count : 0;
    }, [data.outbound]);

    return (
        <div className={styles.container}>
            {/* Header with period */}
            <div className={styles.header}>
                <h3 className={styles.title}>Cash Flow Overview</h3>
                <span className={styles.period}>{period}</span>
            </div>

            {/* Visual Flow Distribution Bar */}
            <div className={styles.flowDistribution}>
                <div className={styles.distributionBar}>
                    <div
                        className={styles.inboundSegment}
                        style={{ width: `${inboundPercentage}%` }}
                        title={`Inbound: ${inboundPercentage.toFixed(1)}% of total flow`}
                    >
                        <span className={styles.segmentLabel}>Inbound</span>
                        <span className={styles.segmentPercentage}>
                            {inboundPercentage.toFixed(0)}%
                        </span>
                    </div>
                    <div
                        className={styles.outboundSegment}
                        style={{ width: `${outboundPercentage}%` }}
                        title={`Outbound: ${outboundPercentage.toFixed(1)}% of total flow`}
                    >
                        <span className={styles.segmentLabel}>Outbound</span>
                        <span className={styles.segmentPercentage}>
                            {outboundPercentage.toFixed(0)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Flow Sections */}
            <div className={styles.flowSections}>
                {/* Inbound Section */}
                <div className={styles.flowCard}>
                    <div className={styles.flowCardHeader}>
                        <div className={styles.flowIconInbound}>
                            <FiArrowDown size={20} />
                        </div>
                        <div className={styles.flowTitle}>
                            <h4 className={styles.flowType}>Inbound ({data.inbound.type})</h4>
                            <span className={styles.flowSubtitle}>Cash received</span>
                        </div>
                    </div>

                    <div className={styles.flowCardBody}>
                        <div className={styles.primaryMetric}>
                            <span className={styles.metricLabel}>Total Amount</span>
                            <h3 className={styles.amountInbound}>
                                {formatCurrency(data.inbound.totalAmount)}
                            </h3>
                        </div>

                        <div className={styles.secondaryMetrics}>
                            <div className={styles.metric}>
                                <div className={styles.metricIcon}>
                                    <FiHash size={14} />
                                </div>
                                <div className={styles.metricDetails}>
                                    <span className={styles.metricValue}>
                                        {data.inbound.count}
                                    </span>
                                    <span className={styles.metricLabel}>
                                        transactions
                                    </span>
                                </div>
                            </div>
                            <div className={styles.metric}>
                                <div className={styles.metricIcon}>
                                    <FiDollarSign size={14} />
                                </div>
                                <div className={styles.metricDetails}>
                                    <span className={styles.metricValue}>
                                        {formatCurrency(inboundAvg)}
                                    </span>
                                    <span className={styles.metricLabel}>
                                        avg per txn
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Net Flow Divider */}
                <div className={styles.netDivider}>
                    <div className={styles.dividerLine} />
                    <div className={`${styles.netIndicator} ${styles[netFlowStatus.status]}`}>
                        {netFlowStatus.icon}
                    </div>
                    <div className={styles.dividerLine} />
                </div>

                {/* Outbound Section */}
                <div className={styles.flowCard}>
                    <div className={styles.flowCardHeader}>
                        <div className={styles.flowIconOutbound}>
                            <FiArrowUp size={20} />
                        </div>
                        <div className={styles.flowTitle}>
                            <h4 className={styles.flowType}>Outbound ({data.outbound.type})</h4>
                            <span className={styles.flowSubtitle}>Cash paid out</span>
                        </div>
                    </div>

                    <div className={styles.flowCardBody}>
                        <div className={styles.primaryMetric}>
                            <span className={styles.metricLabel}>Total Amount</span>
                            <h3 className={styles.amountOutbound}>
                                {formatCurrency(data.outbound.totalAmount)}
                            </h3>
                        </div>

                        <div className={styles.secondaryMetrics}>
                            <div className={styles.metric}>
                                <div className={styles.metricIcon}>
                                    <FiHash size={14} />
                                </div>
                                <div className={styles.metricDetails}>
                                    <span className={styles.metricValue}>
                                        {data.outbound.count}
                                    </span>
                                    <span className={styles.metricLabel}>
                                        transactions
                                    </span>
                                </div>
                            </div>
                            <div className={styles.metric}>
                                <div className={styles.metricIcon}>
                                    <FiDollarSign size={14} />
                                </div>
                                <div className={styles.metricDetails}>
                                    <span className={styles.metricValue}>
                                        {formatCurrency(outboundAvg)}
                                    </span>
                                    <span className={styles.metricLabel}>
                                        avg per txn
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Net Flow Summary */}
            <div className={`${styles.netFlowSummary} ${styles[netFlowStatus.status]}`}>
                <div className={styles.netFlowHeader}>
                    {netFlowStatus.icon}
                    <div>
                        <h4 className={styles.netFlowTitle}>{netFlowStatus.label}</h4>
                        <p className={styles.netFlowDescription}>{netFlowStatus.description}</p>
                    </div>
                </div>

                <div className={styles.netFlowAmount}>
                    <div className={styles.netAmountContainer}>
                        <span className={styles.netAmountLabel}>Net Cash Flow</span>
                        <h3 className={styles.netAmountValue}>
                            {formatCurrency(data.netFlow)}
                        </h3>
                    </div>
                    <div className={styles.flowComparison}>
                        <span className={styles.comparisonLabel}>Outflow vs Inflow</span>
                        <span className={styles.comparisonValue}>
                            {Math.abs(data.outbound.totalAmount / data.inbound.totalAmount).toFixed(2)}x
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashFlowCard;