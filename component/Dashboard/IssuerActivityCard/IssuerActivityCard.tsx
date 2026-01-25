import React, { useMemo } from 'react';
import {
    FiTrendingUp,
    FiTrendingDown,
    FiBarChart2,
    FiDollarSign,
    FiActivity,
    FiUser
} from 'react-icons/fi';
import styles from './IssuerActivityCard.module.css';
import {bicOptionsDev, bicOptionsProd} from "../../../constants/gatewayFormOptions";
import {useAuthentication} from "../../../auth/AuthProvider";

interface IssuerData {
    issuer: string;
    transactionCount: number;
    totalAmount: number;
}

interface IssuerActivityCardProps {
    data: IssuerData;
    type: 'debtor' | 'creditor';
    index?: number;
    maxAmount?: number;
    className?: string;
}

const IssuerActivityCard: React.FC<IssuerActivityCardProps> = ({
                                                                   data,
                                                                   type,
                                                                   index = 0,
                                                                   maxAmount = 0,
                                                                   className = ''
                                                               }) => {
    // Format currency with abbreviations
    const formatCurrency = (val: number) => {
        if (val >= 1000000000) {
            return `$${(val / 1000000000).toFixed(1)}B`;
        }
        if (val >= 1000000) {
            return `$${(val / 1000000).toFixed(1)}M`;
        }
        if (val >= 1000) {
            return `$${(val / 1000).toFixed(1)}K`;
        }
        return `$${val.toLocaleString()}`;
    };

    // Calculate progress percentage
    const progressPercentage = useMemo(() => {
        if (!maxAmount || maxAmount <= 0) return Math.min(data.transactionCount / 100, 100);
        return Math.min((data.totalAmount / maxAmount) * 100, 100);
    }, [data.totalAmount, maxAmount, data.transactionCount]);

    // Get activity level
    const activityLevel = useMemo(() => {
        if (data.transactionCount > 1000) return { label: 'High', color: 'var(--color-error)' };
        if (data.transactionCount > 100) return { label: 'Medium', color: 'var(--color-warning)' };
        return { label: 'Low', color: 'var(--color-success)' };
    }, [data.transactionCount]);

    const {config} = useAuthentication();
    const activeProfile = config?.profile;

    const bicOptions = activeProfile === 'prod' ? bicOptionsProd : bicOptionsDev;

    const issuerLabel = useMemo(() => {
        const found = bicOptions.find(bic => bic.value.toUpperCase() === data.issuer.toUpperCase());
        return found ? found.label : data.issuer;
    }, [data.issuer, bicOptions]);


    return (
        <div
            className={`${styles.card} ${styles[type]} ${className}`}
            data-index={index}
            role="article"
            aria-label={`${issuerLabel} - ${type} activity`}
        >
            {/* Header with issuer info */}
            <div className={styles.cardHeader}>
                <div className={styles.issuerInfo}>
                    <div className={styles.issuerIcon}>
                        <FiUser size={20} />
                    </div>
                    <div className={styles.issuerDetails}>
                        <h3 className={styles.issuerName} title={issuerLabel}>
                            {issuerLabel}
                        </h3>
                        <div className={`${styles.typeBadge} ${styles[`${type}Badge`]}`}>
                            {type === 'debtor' ?
                                <FiTrendingUp className={styles.typeIcon} /> :
                                <FiTrendingDown className={styles.typeIcon} />
                            }
                            <span className={styles.typeLabel}>
                                {type === 'debtor' ? 'Debtor' : 'Creditor'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main metrics */}
            <div className={styles.cardBody}>
                <div className={styles.metricsGrid}>
                    <div className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                            <div className={styles.metricIcon}>
                                <FiBarChart2 size={18} />
                            </div>
                            <span className={styles.metricLabel}>Transactions</span>
                        </div>
                        <div className={styles.metricValue}>
                            {data.transactionCount.toLocaleString()}
                        </div>
                        <div className={styles.metricSubtext}>
                            {data.transactionCount === 1 ? 'transaction' : 'transactions'}
                        </div>
                    </div>

                    <div className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                            <div className={styles.metricIcon}>
                                <FiDollarSign size={18} />
                            </div>
                            <span className={styles.metricLabel}>Total Volume</span>
                        </div>
                        <div className={styles.metricValue}>
                            {formatCurrency(data.totalAmount)}
                        </div>
                        <div className={styles.metricSubtext}>
                            USD
                        </div>
                    </div>
                </div>

                {/* Progress indicator */}
                <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>Volume indicator</span>
                        <span className={styles.progressPercentage}>
                            {Math.round(progressPercentage)}%
                        </span>
                    </div>
                    <div className={styles.progressContainer}>
                        <div
                            className={styles.progressBar}
                            style={{ width: `${progressPercentage}%` }}
                            role="progressbar"
                            aria-valuenow={progressPercentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        />
                    </div>
                </div>
            </div>

            {/* Footer with activity level */}
            <div className={styles.cardFooter}>
                <div className={styles.activityIndicator}>
                    <FiActivity className={styles.activityIcon} />
                    <span
                        className={styles.activityLevel}
                        style={{ color: activityLevel.color }}
                    >
                        {activityLevel.label} activity
                    </span>
                </div>
                <div className={styles.rank}>
                    #{index + 1}
                </div>
            </div>
        </div>
    );
};

export default IssuerActivityCard;