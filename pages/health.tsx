import { JSX, useEffect, useState } from "react";
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
} from "react-icons/fa";

import SpinLoading from "../component/Loading/SpinLoading/SpinLoading";
import styles from "../styles/Health.module.css";
import useSystemHealth from "../api/hooks/useSystemHealth";
import { HealthCheckResponse, ComponentHealth } from "../types/health";
import { extractErrorMessage } from "../utils/extractErrorMessage";


const parseBalanceResult = (httpResult: string) => {
  const zoneMatch = httpResult.match(/Zone:\s*(Green|Amber|Red)/i);
  const balanceMatch = httpResult.match(/Balance:\s*(.+)/i);

  return {
    zone: zoneMatch?.[1]?.toLowerCase() ?? "unknown",
    balance: balanceMatch?.[1] ?? "Unknown",
  };
};


const zoneCardClassMap: Record<string, string> = {
  green: styles.zoneGreen,
  amber: styles.zoneAmber,
  red: styles.zoneRed,
};

const zoneTextClassMap: Record<string, string> = {
  green: styles.zoneTextGreen,
  amber: styles.zoneTextAmber,
  red: styles.zoneTextRed,
  unknown: "", // No style for unknown
};


const zoneBalanceBoxClassMap: Record<string, string> = {
  green: styles.balanceBoxGreen,
  amber: styles.balanceBoxAmber,
  red: styles.balanceBoxRed,
  unknown: styles.balanceBox,
};


const zoneIconColorMap: Record<string, string> = {
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  unknown: "#10b981",
};


const componentIcons: Record<string, JSX.Element> = {
  corebank: <FaServer />,
  database: <FaDatabase />,
  "sips-core": <FaServer />,
  "xades-certificate": <FaCertificate />,
  keycloak: <FaKey />,
  "balance-status": <FaMoneyBillWave />,
};


const statusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "ok":
      return <FaCheckCircle className={styles.ok} />;
    case "degraded":
      return <FaExclamationTriangle className={styles.degraded} />;
    case "error":
      return <FaTimesCircle className={styles.error} />;
    default:
      return <FaExclamationTriangle />;
  }
};

const statusTextClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case "ok":
      return styles.okText;
    case "degraded":
      return styles.degradedText;
    case "error":
      return styles.errorText;
    default:
      return "";
  }
};


const Health = () => {
  const { getSystemHealth } = useSystemHealth();

  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await getSystemHealth();
        setHealth(data);
      } catch (err: any) {
        setError(extractErrorMessage(err, "Failed to fetch system health"));
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

      {!loading && error && <div className={styles.error}>{error}</div>}

      {!loading && !error && health && (
        <>
          <div className={`${styles.overallStatus} ${styles[health.status.toLowerCase()]}`}>
            Overall Status:{" "}
            <strong className={statusTextClass(health.status)}>
              {health.status.toUpperCase()}
            </strong>
            {statusIcon(health.status)}
          </div>

          <div className={styles.components}>
            {health.components.map((component: ComponentHealth) => {
              const isBalanceStatus = component.name === "balance-status";
              const balanceData = isBalanceStatus
                ? parseBalanceResult(component.httpResult)
                : null;

              const zoneCardClass =
                balanceData && balanceData.zone !== "unknown"
                  ? zoneCardClassMap[balanceData.zone]
                  : "";

              const zoneTextClass =
                balanceData && balanceData.zone !== "unknown"
                  ? zoneTextClassMap[balanceData.zone]
                  : "";

              const balanceBoxClass =
                balanceData && balanceData.zone !== "unknown"
                  ? zoneBalanceBoxClassMap[balanceData.zone]
                  : zoneBalanceBoxClassMap.unknown;

              const zoneIconColor = balanceData
                ? zoneIconColorMap[balanceData.zone] || "#10b981"
                : "#10b981";

              return (
                <div
                  key={component.name}
                  className={`${styles.componentCard} ${styles[component.status.toLowerCase()]} ${zoneCardClass}`}
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

                  <p>
                    <strong>Endpoint:</strong>{" "}
                    <span className={statusTextClass(component.status)}>
                      {component.endpointStatus.toUpperCase()}
                    </span>
                  </p>

                  {isBalanceStatus && balanceData ? (
                    <div className={`${styles.balanceBox} ${balanceBoxClass}`}>
                      <p>
                        <FaMapMarkerAlt /> Zone:{" "}
                        <strong 
                          className={`${zoneTextClass} ${styles.zoneText}`}
                          style={{
                            color: balanceData.zone === 'green' ? '#16a34a' :
                                   balanceData.zone === 'amber' ? '#d97706' :
                                   balanceData.zone === 'red' ? '#dc2626' :
                                   'inherit'
                          }}
                        >
                          {balanceData.zone.toUpperCase()}
                        </strong>
                      </p>
                      <p>
                        <FaMoneyBillWave /> Balance:{" "}
                        <strong>{balanceData.balance}</strong>
                      </p>
                    </div>
                  ) : (
                    <p>
                      <strong>HTTP Result:</strong> {component.httpResult}
                    </p>
                  )}

                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={statusTextClass(component.status)}>
                      {component.status.toUpperCase()}
                    </span>
                  </p>

                  <p>
                    <strong>Last Checked:</strong>{" "}
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