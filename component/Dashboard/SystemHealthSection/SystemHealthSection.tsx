import React from "react";
import DashboardCard from "../DashboardCard/DashboardCard";
import styles from "./SystemHealthSection.module.css";
import { HealthCheckResponse, ComponentHealth } from "../../../types/health";
import {
    FaDatabase,
    FaHeartbeat, FaUniversity, FaNetworkWired, FaFileContract, FaWallet, FaShieldAlt,
} from "react-icons/fa";

type Props = {
    health: HealthCheckResponse;
};

const componentIconMap: Record<string, React.ReactNode> = {
    corebank: <FaUniversity />,
    database: <FaDatabase />,
    "sips-core": <FaNetworkWired />,
    "xades-certificate": <FaFileContract />,
    keycloak: <FaShieldAlt />,
    "balance-status": <FaWallet />,
    default: <FaHeartbeat />,
};

const componentColorMap: Record<string, string> = {
    corebank: "#455a64",

    database: "#1b5e20",

    "sips-core": "#6a1b9a",

    "xades-certificate": "#bf360c",

    keycloak: "#a52a2a",

    "balance-status": "#00695c",

    default: "#9e9e9e",
};

const parseBalanceResult = (httpResult: string) => {
    const zoneMatch = httpResult.match(/Zone:\s*(Green|Amber|Red)/i);
    return {
        zone: zoneMatch?.[1] ?? "Unknown",
    };
};

const capitalizeFirstLetter = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

const SystemHealthSection: React.FC<Props> = ({ health }) => {
    const lastUpdated = health.components[0]?.lastChecked;
    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>System Health Overview</h2>

            <div className={styles.systemHealthGrid}>
                {health.components.map((component: ComponentHealth) => {
                    const cardColor =
                        componentColorMap[component.name] ?? componentColorMap.default;

                    const icon =
                        componentIconMap[component.name] ?? componentIconMap.default;

                    let value = capitalizeFirstLetter(component.status);

                    if (component.name === "balance-status") {
                        const balanceData = parseBalanceResult(component.httpResult);
                        if (balanceData.zone !== "Unknown") {
                            value = capitalizeFirstLetter(balanceData.zone.toLowerCase());
                        }
                    }

                    return (
                        <DashboardCard
                            key={component.name}
                            title={capitalizeFirstLetter(
                                component.name.replace(/-/g, " ")
                            )}
                            value={value}
                            icon={icon}
                            colorVar={cardColor}
                            isRawColor
                        />
                    );
                })}
            </div>
            <p className={styles.lastUpdated}>
                System Health Last checked:{" "}
                {lastUpdated &&
                    new Date(lastUpdated).toLocaleString("en-US", {
                        month: "long",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    })}
            </p>
        </div>
    );
};

export default SystemHealthSection;
