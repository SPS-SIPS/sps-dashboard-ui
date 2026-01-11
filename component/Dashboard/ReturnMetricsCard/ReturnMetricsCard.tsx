import React from 'react';
import { FiRefreshCw, FiAlertTriangle, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import styles from './ReturnMetricsCard.module.css';

interface ReturnMetricsData {
    readyForReturn: number;
    returnWithdrawal: number;
    returnRatePercentage: number;
}

interface ReturnMetricsCardProps {
    data: ReturnMetricsData;
}

const ReturnMetricsCard: React.FC<ReturnMetricsCardProps> = ({ data }) => {

    // Format numbers with commas
    const formatNumber = (num: number) => {
        return num.toLocaleString();
    };

    // Determine return rate status color
    const getReturnRateColor = () => {
        if (data.returnRatePercentage > 10) return '#ef4444'; // Red for high
        if (data.returnRatePercentage > 5) return '#f59e0b'; // Orange for moderate
        return '#10b981'; // Green for low
    };

    return (
        <div className={styles.container}>
            {/* Header with gradient background */}
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <div className={styles.titleIcon}>
                        <FiRefreshCw />
                    </div>
                    <h3 className={styles.title}>Return Metrics</h3>
                </div>
                <div
                    className={styles.returnRateBadge}
                    style={{
                        background: `linear-gradient(135deg, ${getReturnRateColor()}20 0%, ${getReturnRateColor()}10 100%)`,
                        borderColor: `${getReturnRateColor()}40`
                    }}
                >
                    <FiTrendingUp
                        className={styles.returnRateIcon}
                        style={{ color: getReturnRateColor() }}
                    />
                    <div className={styles.rateInfo}>
                        <span className={styles.rateValue} style={{ color: getReturnRateColor() }}>
                            {data.returnRatePercentage.toFixed(1)}%
                        </span>
                        <span className={styles.rateLabel}>Return Rate</span>
                    </div>
                </div>
            </div>

            {/* Colorful Metrics Grid */}
            <div className={styles.metricsGrid}>
                {/* Ready for Return - Orange Theme */}
                <div className={`${styles.metricCard} ${styles.pendingCard}`}>
                    <div className={styles.metricHeader}>
                        <div className={styles.metricIcon}>
                            <FiAlertTriangle size={24} />
                        </div>
                        <div className={styles.metricText}>
                            <h4 className={styles.metricTitle}>Ready for Return</h4>
                            <span className={styles.metricSubtitle}>Pending processing</span>
                        </div>
                    </div>
                    <div className={styles.metricValueContainer}>
                        <span className={styles.metricValue}>
                            {formatNumber(data.readyForReturn)}
                        </span>
                        <span className={styles.metricUnit}>transactions</span>
                    </div>
                    <div className={styles.metricIndicator}>
                        <div
                            className={styles.indicatorBar}
                            style={{
                                width: `${(data.readyForReturn / (data.readyForReturn + data.returnWithdrawal)) * 100}%`,
                                background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                            }}
                        />
                    </div>
                </div>

                {/* Return Withdrawal - Green Theme */}
                <div className={`${styles.metricCard} ${styles.processedCard}`}>
                    <div className={styles.metricHeader}>
                        <div className={styles.metricIcon}>
                            <FiCheckCircle size={24} />
                        </div>
                        <div className={styles.metricText}>
                            <h4 className={styles.metricTitle}>Return Withdrawal</h4>
                            <span className={styles.metricSubtitle}>Successfully processed</span>
                        </div>
                    </div>
                    <div className={styles.metricValueContainer}>
                        <span className={styles.metricValue}>
                            {formatNumber(data.returnWithdrawal)}
                        </span>
                        <span className={styles.metricUnit}>transactions</span>
                    </div>
                    <div className={styles.metricIndicator}>
                        <div
                            className={styles.indicatorBar}
                            style={{
                                width: `${(data.returnWithdrawal / (data.readyForReturn + data.returnWithdrawal)) * 100}%`,
                                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Visual Progress Bar */}
            <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Processing Status</span>
                    <span className={styles.progressPercentage}>
                        {((data.returnWithdrawal / data.readyForReturn) * 100).toFixed(1)}%
                    </span>
                </div>
                <div className={styles.progressBarContainer}>
                    <div
                        className={styles.progressBar}
                        style={{
                            width: `${(data.returnWithdrawal / data.readyForReturn) * 100}%`,
                            background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)'
                        }}
                    />
                </div>
                <div className={styles.progressStats}>
                    <span className={styles.stat}>
                        <span className={styles.statNumber} style={{ color: '#f59e0b' }}>
                            {formatNumber(data.readyForReturn)}
                        </span>
                        <span className={styles.statLabel}>Pending</span>
                    </span>
                    <span className={styles.stat}>
                        <span className={styles.statNumber} style={{ color: '#10b981' }}>
                            {formatNumber(data.returnWithdrawal)}
                        </span>
                        <span className={styles.statLabel}>Processed</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ReturnMetricsCard;