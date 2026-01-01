import React, { useEffect, useState } from 'react';

import styles from '../../../styles/Home.module.css';
import useSystemHealth from "../../../api/hooks/useSystemHealth";
import SpinLoading from "../../Loading/SpinLoading/SpinLoading";
import {ComponentHealth} from "../../../types/health";

interface HealthCheckResponse {
    components: ComponentHealth[];
}

const SystemStatus = () => {
    const { getSystemHealth } = useSystemHealth();
    const [health, setHealth] = useState<HealthCheckResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const data = await getSystemHealth();
                setHealth(data);
            } catch (err) {
                setError('Failed to fetch system health');
            } finally {
                setLoading(false);
            }
        };

        void fetchHealth();
    }, []);

    if (loading) return <SpinLoading />;
    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <section className={styles.statusSection}>
            <div className={styles.statusCard}>
                <h2>System Health</h2>
                <div className={styles.statusGrid}>
                    {health?.components.map((component) => (
                        <div key={component.name} className={styles.statusItem}>
                            <div
                                className={styles.statusIndicator}
                                data-status={component.status}
                            ></div>
                            <span>{component.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SystemStatus;
