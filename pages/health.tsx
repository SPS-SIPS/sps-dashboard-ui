import {useEffect, useState} from 'react';

import SpinLoading from '../component/Loading/SpinLoading/SpinLoading';
import styles from '../styles/Health.module.css';
import useSystemHealth from "../api/hooks/useSystemHealth";
import {HealthCheckResponse} from "../types/health";
import {extractErrorMessage} from "../utils/extractErrorMessage";

const Health = () => {
    const {getSystemHealth} = useSystemHealth();

    const [health, setHealth] = useState<HealthCheckResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const data = await getSystemHealth();
                setHealth(data);
            } catch (err: any) {
                setError(extractErrorMessage(error,'Failed to fetch system health'));
            } finally {
                setLoading(false);
            }
        };

        void fetchHealth();
    }, []);

    return (
        <div className={styles.healthPage}>
            <h1 className={styles.title}>Health Status</h1>
            {loading ? (
                <div className={styles.loading}>
                    <SpinLoading/>
                    <p>Checking system health...</p>
                </div>
            ) : error ? (
                <div className={styles.error}>{error}</div>
            ) : !health ? (
                <div className={styles.error}>No health data available</div>
            ) : (
                <>
                    <div
                        className={`${styles.status} ${styles[health.status]}`}
                    >
                        Overall Status: <strong>{health.status.toUpperCase()}</strong>
                    </div>
                    <div className={styles.components}>
                        {health.components.map((component) => (
                            <div key={component.name} className={styles.componentCard}>
                                <h3>{component.name}</h3>
                                <p>Status: {component.status}</p>
                                <p>Endpoint: {component.endpointStatus}</p>
                                <p>HTTP Result: {component.httpResult}</p>
                                <p>
                                    Last Checked:{' '}
                                    {new Date(component.lastChecked).toLocaleString()}
                                </p>

                                {component.errorMessage && (
                                    <p className={styles.errorMessage}>
                                        {component.errorMessage}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Health;
