import React, {useEffect, useState, useCallback, useMemo, useRef} from "react";
import useDashboardAPI, {
    CashFlowOverviewResponse,
    IsoMsgDefSummaryItem, IsoRequestSummaryItem, IsoStatusSummaryItem, IssuerActivityResponse,
    PeriodType, ReturnMonitoring, TransactionTypeDistribution,
} from "../../../api/hooks/useDashboardAPI";

import TransactionTypeDistributionSection
    from "../../../component/Dashboard/TransactionTypeDistributionSection/TransactionTypeDistributionSection";
import {extractErrorMessage} from "../../../utils/extractErrorMessage";
import BarChart from "../../../component/Dashboard/BarChart/BarChart";
import DonutChart from "../../../component/Dashboard/DonutChart/DonutChart";
import SystemHealthSection from "../../../component/Dashboard/SystemHealthSection/SystemHealthSection";
import {HealthCheckResponse} from "../../../types/health";
import useSystemHealth from "../../../api/hooks/useSystemHealth";
import IssuerActivityCard from "../../../component/Dashboard/IssuerActivityCard/IssuerActivityCard";
import CashFlowCard from "../../../component/Dashboard/CashFlowCard/CashFlowCard";
import ReturnMetricsCard from "../../../component/Dashboard/ReturnMetricsCard/ReturnMetricsCard";
import MessageDefinitionsTable from "../../../component/Dashboard/MessageDefinitionsChart/MessageDefinitionsChart";
import { FiRefreshCw, FiCalendar, FiClock, FiUser, FiSun, FiMoon, FiStar, FiAlertCircle } from "react-icons/fi";
import AlertModal from "../../../component/common/AlertModal/AlertModal";
import {useAuthentication} from "../../../auth/AuthProvider";
import styles from "./FullDashboard.module.css";

const AUTO_REFRESH_OPTIONS = [
    {label: "Off", value: 0},
    {label: "5 sec", value: 5000},
    {label: "10 sec", value: 10000},
    {label: "30 sec", value: 30000},
    {label: "1 min", value: 60000},
    {label: "5 min", value: 300000},
    {label: "10 min", value: 600000},
    {label: "30 min", value: 1800000},
    {label: "1 hour", value: 3600000},
    {label: "2 hours", value: 7200000},
];

const PERIOD_OPTIONS: PeriodType[] = [
    "Today",
    "ThisWeek",
    "LastWeek",
    "ThisMonth",
    "LastMonth",
    "Last3Months",
    "ThisYear",
    "All",
];

type DashboardData = {
    transactionTypeDistribution: { data: TransactionTypeDistribution | null; error: string | null; loading: boolean };
    cashFlowOverview: { data: CashFlowOverviewResponse | null; error: string | null; loading: boolean };
    returnMonitoring: { data: ReturnMonitoring | null; error: string | null; loading: boolean };
    issuerActivity: { data: IssuerActivityResponse | null; error: string | null; loading: boolean };
    isoRequestsSummary: { data: IsoRequestSummaryItem[] | null; error: string | null; loading: boolean };
    isoStatusSummary: { data: IsoStatusSummaryItem[] | null; error: string | null; loading: boolean };
    isoMsgDefSummary: { data: IsoMsgDefSummaryItem[] | null; error: string | null; loading: boolean };
};

type FetchStatus = {
    loading: boolean;
    error: string | null;
    successCount: number;
    totalCount: number;
    lastRefreshTime: Date | null;
};

type AlertState = {
    title: string;
    message: string;
    error?: boolean;
    success?: boolean;
    warning?: boolean;
} | null;

export default function FullDashboard() {
    const {
        getTransactionTypeDistribution,
        getCashFlowOverview,
        getReturnExceptionMonitoring,
        getIssuerActivity,
        getIsoRequestsSummary,
        getIsoStatusSummary,
        getIsoMsgDefSummary,
    } = useDashboardAPI();
    const { getSystemHealth } = useSystemHealth();

    const [systemHealthStatus, setSystemHealthStatus] = useState<{
        loading: boolean;
        error: string | null;
        health: HealthCheckResponse | null;
    }>({
        loading: true,
        error: null,
        health: null,
    });

    const [alert, setAlert] = useState<AlertState>(null);

    const showErrorAlert = (title: string, message: string) => {
        setAlert({
            title,
            message,
            error: true,
        });
    };

    const closeAlert = () => {
        setAlert(null);
    };

    const {userName} = useAuthentication();

    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [period, setPeriod] = useState<PeriodType>("All");
    const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0);
    const [fetchStatus, setFetchStatus] = useState<FetchStatus>({
        loading: false,
        error: null,
        successCount: 0,
        totalCount: 7,
        lastRefreshTime: null,
    });

    const [data, setData] = useState<DashboardData>({
        transactionTypeDistribution: { data: null, error: null, loading: false },
        cashFlowOverview: { data: null, error: null, loading: false },
        returnMonitoring: { data: null, error: null, loading: false },
        issuerActivity: { data: null, error: null, loading: false },
        isoRequestsSummary: { data: null, error: null, loading: false },
        isoStatusSummary: { data: null, error: null, loading: false },
        isoMsgDefSummary: { data: null, error: null, loading: false },
    });

    const [currentTime, setCurrentTime] = useState(new Date());
    const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const getGreetingIcon = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return <FiSun className={styles.greetingIcon} />;
        if (hour < 18) return <FiSun className={styles.greetingIcon} />;
        return <FiMoon className={styles.greetingIcon} />;
    };

    const fetchAll = useCallback(async () => {
        setFetchStatus(prev => ({
            ...prev,
            loading: true,
            error: null,
            successCount: 0,
            lastRefreshTime: new Date()
        }));
        setIsInitialLoad(false);

        // Reset all data states but keep existing data
        setData(prev => ({
            transactionTypeDistribution: { ...prev.transactionTypeDistribution, loading: isInitialLoad, error: null },
            cashFlowOverview: { ...prev.cashFlowOverview, loading: isInitialLoad, error: null },
            returnMonitoring: { ...prev.returnMonitoring, loading: isInitialLoad, error: null },
            issuerActivity: { ...prev.issuerActivity, loading: isInitialLoad, error: null },
            isoRequestsSummary: { ...prev.isoRequestsSummary, loading: isInitialLoad, error: null },
            isoStatusSummary: { ...prev.isoStatusSummary, loading: isInitialLoad, error: null },
            isoMsgDefSummary: { ...prev.isoMsgDefSummary, loading: isInitialLoad, error: null },
        }));

        const query = { period };
        let successCount = 0;

        const fetchWithErrorHandling = async <T,>(
            fetchFn: () => Promise<T>,
            dataKey: keyof DashboardData
        ) => {
            try {
                const result = await fetchFn();
                setData(prev => ({
                    ...prev,
                    [dataKey]: {
                        data: result,
                        error: null,
                        loading: false
                    }
                }));
                return { success: true, data: result };
            } catch (error) {
                const errorMessage = extractErrorMessage(error, "Failed to load data");
                showErrorAlert(
                    "Data Load Failed",
                    `${dataKey} failed to load. ${errorMessage}`
                );
                setData(prev => ({
                    ...prev,
                    [dataKey]: {
                        data: prev[dataKey].data,
                        error: errorMessage,
                        loading: false
                    }
                }));
                return { success: false, error: errorMessage };
            }
        };

        // Fetch all endpoints independently
        const results = await Promise.allSettled([
            fetchWithErrorHandling(
                () => getTransactionTypeDistribution(query),
                "transactionTypeDistribution"
            ),
            fetchWithErrorHandling(
                () => getCashFlowOverview(query),
                "cashFlowOverview"
            ),
            fetchWithErrorHandling(
                () => getReturnExceptionMonitoring(query),
                "returnMonitoring"
            ),
            fetchWithErrorHandling(
                () => getIssuerActivity(query),
                "issuerActivity"
            ),
            fetchWithErrorHandling(
                () => getIsoRequestsSummary(query),
                "isoRequestsSummary"
            ),
            fetchWithErrorHandling(
                () => getIsoStatusSummary(query),
                "isoStatusSummary"
            ),
            fetchWithErrorHandling(
                () => getIsoMsgDefSummary(query),
                "isoMsgDefSummary"
            ),
        ]);

        // Count successful fetches
        successCount = results.filter(result =>
            result.status === 'fulfilled' && result.value.success
        ).length;

        setFetchStatus(prev => ({
            ...prev,
            loading: false,
            successCount,
            lastRefreshTime: new Date()
        }));
    }, [period]);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const data = await getSystemHealth();
                setSystemHealthStatus(prev => ({ ...prev, health: data }));
            } catch (error) {
                const errorMessage = extractErrorMessage(error, "Failed to load system health");
                setSystemHealthStatus(prev => ({ ...prev, error: errorMessage }));
            } finally {
                setSystemHealthStatus(prev => ({ ...prev, loading: false }));
            }
        };

        void fetchHealth();
    }, []);

    useEffect(() => {
        void fetchAll();
    }, [period]);

    useEffect(() => {
        if (autoRefreshInterval <= 0) {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
            return;
        }

        refreshIntervalRef.current = setInterval(() => {
            void fetchAll();
        }, autoRefreshInterval);

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [autoRefreshInterval]);

    // Convert IsoRequestsSummaryItem[] to { type: count }
    const isoRequestsData = useMemo(() => {
        if (!data.isoRequestsSummary.data) return {};
        return data.isoRequestsSummary.data.reduce((acc, item) => {
            acc[item.type] = item.count;
            return acc;
        }, {} as Record<string, number>);
    }, [data.isoRequestsSummary.data]);

    // Convert IsoStatusSummaryItem[] to { status: count }
    const isoStatusData = useMemo(() => {
        if (!data.isoStatusSummary.data) return {};
        return data.isoStatusSummary.data.reduce((acc, item) => {
            acc[item.status] = item.count;
            return acc;
        }, {} as Record<string, number>);
    }, [data.isoStatusSummary.data]);

    const debtorIssuers = data.issuerActivity.data?.debtorIssuerActivity || [];
    const creditorIssuers = data.issuerActivity.data?.creditorIssuerActivity || [];

    // Calculate maxAmount across both lists for progress bar scaling
    const maxIssuerAmount = useMemo(() => {
        const allAmounts = [...debtorIssuers, ...creditorIssuers]
            .map((i) => i.totalAmount || 0);
        return allAmounts.length ? Math.max(...allAmounts) : 0;
    }, [debtorIssuers, creditorIssuers]);

    const safeReturnData = useMemo(() => {
        if (!data.returnMonitoring.data) return null;

        const rm = data.returnMonitoring.data;
        return {
            readyForReturn: rm.readyForReturn ?? 0,
            returnWithdrawal: rm.returnWithdrawal ?? 0,
            returnRatePercentage: rm.returnRatePercentage ?? 0,
        };
    }, [data.returnMonitoring.data]);

    const messageDefinitionsData = useMemo(() => {
        if (!data.isoMsgDefSummary.data) return { messageDefinitions: [] };
        return { messageDefinitions: data.isoMsgDefSummary.data };
    }, [data.isoMsgDefSummary.data]);

    // Format last refresh time
    const formatLastRefresh = () => {
        if (!fetchStatus.lastRefreshTime) return "Never";

        const now = new Date();
        const diff = Math.floor((now.getTime() - fetchStatus.lastRefreshTime.getTime()) / 1000);

        if (diff < 60) return `${diff} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        return fetchStatus.lastRefreshTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };


    type SectionErrorBoundaryProps = {
        error: string | null;
    };

    const SectionErrorBoundary = ({ error }: SectionErrorBoundaryProps) => {
        if (!error) return null;

        return (
            <div className={styles.errorCard}>
                <FiAlertCircle className={styles.errorIcon} />
                <div className={styles.errorContent}>
                    <h4 className={styles.errorTitle}>Failed to load data</h4>
                    <p className={styles.errorMessage}>{error}</p>
                </div>
            </div>
        );
    };


    // Loading skeleton for sections
    const SectionLoadingSkeleton = () => (
        <div className={styles.loadingSkeleton}>
            <div className={styles.skeletonHeader} />
            <div className={styles.skeletonContent}>
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLine} />
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            {/* Header Bar */}
            <div className={styles.headerBar}>
                <div className={styles.headerLeft}>
                    <div className={styles.greetingContainer}>
                        {getGreetingIcon()}
                        <div>
                            <div className={styles.greeting}>
                                {getGreeting()}, <span className={styles.userName}>{userName}</span>
                            </div>
                            <div className={styles.time}>
                                <FiClock className={styles.timeIcon} />
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.headerRight}>

                    {/* Controls */}
                    <div className={styles.controls}>
                        <div className={styles.controlGroup}>
                            <FiCalendar className={styles.controlIcon} />
                            <select
                                className={styles.select}
                                value={period}
                                onChange={(e) => setPeriod(e.target.value as PeriodType)}
                            >
                                {PERIOD_OPTIONS.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.controlGroup}>
                            <FiClock className={styles.controlIcon} />
                            <select
                                className={styles.select}
                                value={autoRefreshInterval}
                                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                            >
                                {AUTO_REFRESH_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            className={`${styles.refreshButton} ${fetchStatus.loading ? styles.refreshing : ''}`}
                            onClick={fetchAll}
                            disabled={fetchStatus.loading}
                        >
                            <FiRefreshCw className={`${styles.refreshIcon} ${fetchStatus.loading ? styles.spinning : ''}`} />
                            {fetchStatus.loading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>

                    <div className={styles.lastRefresh}>
                        Last update: {formatLastRefresh()}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Transaction Distribution */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <FiStar className={styles.sectionIcon} />
                            Transaction Distribution
                        </h2>
                    </div>

                    {data.transactionTypeDistribution.loading ? (
                        <SectionLoadingSkeleton />
                    ) : data.transactionTypeDistribution.error ? (
                        <SectionErrorBoundary error={data.transactionTypeDistribution.error} />
                    ) : data.transactionTypeDistribution.data ? (
                        <div className={styles.sectionContent}>
                            <TransactionTypeDistributionSection
                                data={data.transactionTypeDistribution.data}
                            />
                        </div>
                    ) : null}
                </div>

                {/* ISO Metrics */}
                <div className={styles.isoMetricsSection}>
                    {/* ISO Requests */}
                    <div className={styles.metricCard}>
                        {data.isoRequestsSummary.loading ? (
                            <div className={styles.chartSkeleton} />
                        ) : data.isoRequestsSummary.error ? (
                            <SectionErrorBoundary error={data.isoRequestsSummary.error}/>
                        ): Object.keys(isoRequestsData).length > 0 && (
                            <BarChart
                                dataObject={isoRequestsData}
                                title="ISO Requests"
                                orientation="vertical"
                            />
                        )}
                    </div>

                    {/* ISO Status */}
                    <div className={styles.metricCard}>
                        {data.isoStatusSummary.loading ? (
                            <div className={styles.chartSkeleton} />
                        ) : data.isoStatusSummary.error ? (
                            <SectionErrorBoundary error={data.isoStatusSummary.error} />
                        ) : Object.keys(isoStatusData).length > 0 ? (
                            <div className={styles.metricCardContent}>
                                <DonutChart
                                    dataObject={isoStatusData}
                                    title="ISO Status"
                                    height={400}
                                />
                            </div>
                        ) : null}
                    </div>

                </div>

                {/* Issuer Activity */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <FiUser className={styles.sectionIcon} />
                            Issuer Activity
                        </h2>
                    </div>

                    {data.issuerActivity.loading ? (
                        <SectionLoadingSkeleton />
                    ) : data.issuerActivity.error ? (
                        <SectionErrorBoundary error={data.issuerActivity.error} />
                    ) : (debtorIssuers.length > 0 || creditorIssuers.length > 0) ? (
                        <div className={styles.issuerGrid}>
                            <div className={styles.issuerGrid}>
                                {debtorIssuers.length > 0 && (
                                    <div className={styles.issuerGroup}>
                                        <h4 className={styles.issuerGroupTitle}>Outgoing Funds</h4>
                                        <div className={styles.issuerCards}>
                                            {debtorIssuers.map((issuer, index) => (
                                                <IssuerActivityCard
                                                    key={issuer.issuer}
                                                    data={{
                                                        ...issuer,
                                                        totalAmount: issuer.totalAmount ?? 0,
                                                    }}
                                                    type="debtor"
                                                    index={index}
                                                    maxAmount={maxIssuerAmount}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {creditorIssuers.length > 0 && (
                                    <div className={styles.issuerGroup}>
                                        <h4 className={styles.issuerGroupTitle}>Incoming Funds</h4>
                                        <div className={styles.issuerCards}>
                                            {creditorIssuers.map((issuer, index) => (
                                                <IssuerActivityCard
                                                    key={issuer.issuer}
                                                    data={{
                                                        ...issuer,
                                                        totalAmount: issuer.totalAmount ?? 0,
                                                    }}
                                                    type="creditor"
                                                    index={index}
                                                    maxAmount={maxIssuerAmount}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}

                </div>

                {/* Financial Metrics Row */}
                <div className={styles.financialMetrics}>
                    {/* Cash Flow */}
                    <div className={styles.financialCard}>
                        {data.cashFlowOverview.loading ? (
                            <div className={styles.cardSkeleton} />
                        ) : data.cashFlowOverview.error ? (
                            <SectionErrorBoundary error={data.cashFlowOverview.error} />
                        ) : data.cashFlowOverview.data?.cashFlowOverview ? (
                            <CashFlowCard
                                data={data.cashFlowOverview.data.cashFlowOverview}
                                period={period}
                            />
                        ) : null}
                    </div>


                    {/* Return Metrics */}
                    <div className={styles.financialCard}>
                        {data.returnMonitoring.loading ? (
                            <div className={styles.cardSkeleton} />
                        ) : data.returnMonitoring.error ? (
                            <SectionErrorBoundary error={data.returnMonitoring.error} />
                        ) : safeReturnData ? (
                            <ReturnMetricsCard data={safeReturnData} />
                        ) : null}
                    </div>

                </div>

                {/* ISO Message Definitions */}
                <div className={styles.section}>
                    {data.isoMsgDefSummary.loading ? (
                        <SectionLoadingSkeleton />
                    ) : data.isoMsgDefSummary.error ? (
                        <SectionErrorBoundary error={data.isoMsgDefSummary.error} />
                    ) : messageDefinitionsData.messageDefinitions.length > 0 ? (
                        <div className={styles.sectionContent}>
                            <MessageDefinitionsTable data={messageDefinitionsData} />
                        </div>
                    ) : null}
                </div>

                {/* System Health */}
                <div className={styles.section}>
                    {systemHealthStatus.loading ? (
                        <SectionLoadingSkeleton />
                    ) : systemHealthStatus.error ? (
                        <SectionErrorBoundary error={systemHealthStatus.error} />
                    ) : systemHealthStatus.health ? (
                        <div className={styles.sectionContent}>
                            <SystemHealthSection health={systemHealthStatus.health} />
                        </div>
                    ) : null}
                </div>
            </div>

            {alert && (
                <AlertModal
                    title={alert.title}
                    message={alert.message}
                    error={alert.error}
                    success={alert.success}
                    warning={alert.warning}
                    onConfirm={closeAlert}
                    onClose={closeAlert}
                    showCloseButton
                />
            )}

        </div>
    );
}