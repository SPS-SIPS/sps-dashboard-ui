import {JSX, useEffect, useState} from 'react';
import {
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaDatabase,
    FaServer,
    FaCertificate,
    FaKey,
    FaMoneyBillWave,
    FaMapMarkerAlt,
} from 'react-icons/fa';

import SpinLoading from '../component/Loading/SpinLoading/SpinLoading';
import styles from '../styles/Health.module.css';
import useSystemHealth from '../api/hooks/useSystemHealth';
import { HealthCheckResponse, ComponentHealth } from '../types/health';
import { extractErrorMessage } from '../utils/extractErrorMessage';

const parseBalanceResult = (httpResult: string) => {
    const zoneMatch = httpResult.match(/Zone:\s*([^,]+)/i);
    const balanceMatch = httpResult.match(/Balance:\s*(.+)/i);

    return {
        zone: zoneMatch?.[1] ?? 'Unknown',
        balance: balanceMatch?.[1] ?? 'Unknown',
    };
};

// Map component names to icons
const componentIcons: Record<string, JSX.Element> = {
    'corebank': <FaServer />,
    'database': <FaDatabase />,
    'sips-core': <FaServer />,
    'xades-certificate': <FaCertificate />,
    'keycloak': <FaKey />,
    'balance-status': <FaMoneyBillWave />,
};

// Map status to colors/icons
const statusIcon = (status: string) => {
    switch (status) {
        case 'ok':
            return <FaCheckCircle className={styles.ok} />;
        case 'degraded':
            return <FaExclamationTriangle className={styles.degraded} />;
        case 'error':
            return <FaTimesCircle className={styles.error} />;
        default:
            return <FaExclamationTriangle />;
    }
};

const Health = () => {
    const { getSystemHealth } = useSystemHealth();

    const [health, setHealth] = useState<HealthCheckResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const data = await getSystemHealth();
                setHealth(data);
            } catch (err: any) {
                setError(extractErrorMessage(err, 'Failed to fetch system health'));
            } finally {
                setLoading(false);
            }
        };

        void fetchHealth();
    }, []);

    return (
        <div className={styles.healthPage}>
            <h1 className={styles.title}>System Health Status</h1>

            {loading && (
                <div className={styles.loading}>
                    <SpinLoading />
                    <p>Checking system health...</p>
                </div>
            )}

            {!loading && error && (
                <div className={styles.error}>{error}</div>
            )}

            {!loading && !error && !health && (
                <div className={styles.error}>No health data available</div>
            )}

            {!loading && !error && health && (
                <>
                    <div className={`${styles.overallStatus} ${styles[health.status]}`}>
                        Overall Status: <strong>{health.status.toUpperCase()}</strong>
                        {statusIcon(health.status)}
                    </div>

                    <div className={styles.components}>
                        {health.components.map((component: ComponentHealth) => {
                            const isBalanceOk =
                                component.name === 'balance-status' &&
                                component.status === 'ok';

                            const balanceData = isBalanceOk
                                ? parseBalanceResult(component.httpResult)
                                : null;

                            return (
                                <div
                                    key={component.name}
                                    className={`${styles.componentCard} ${styles[component.status]}`}
                                >
                                    <div className={styles.componentHeader}>
                                        <div className={styles.icon}>
                                            {componentIcons[component.name] || <FaServer />}
                                        </div>
                                        <h3>{component.name}</h3>
                                        <div className={styles.statusIcon}>
                                            {statusIcon(component.status)}
                                        </div>
                                    </div>

                                    <p><strong>Endpoint:</strong> {component.endpointStatus}</p>

                                    {isBalanceOk ? (
                                        <div className={styles.balanceBox}>
                                            <p>
                                                <FaMapMarkerAlt /> Zone: <strong>{balanceData!.zone}</strong>
                                            </p>
                                            <p>
                                                <FaMoneyBillWave /> Balance: <strong>{balanceData!.balance}</strong>
                                            </p>
                                        </div>
                                    ) : (
                                        <p><strong>HTTP Result:</strong> {component.httpResult}</p>
                                    )}

                                    <p>
                                        <strong>Last Checked:</strong>{' '}
                                        {new Date(component.lastChecked).toLocaleString()}
                                    </p>

                                    {component.errorMessage && (
                                        <p className={styles.errorMessage}>{component.errorMessage}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default Health;
