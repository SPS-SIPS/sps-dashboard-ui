import React, { useEffect } from "react";
import { FiChevronRight } from "react-icons/fi";
import useSystemHealth from "../api/hooks/useSystemHealth";
import {
  FaCheckCircle,
  FaCogs,
  FaExclamationTriangle,
  FaEye,
  FaFileAlt,
  FaPlug,
  FaPlusCircle,
  FaRocket,
  FaTimesCircle,
} from "react-icons/fa";
import styles from "../styles/Home.module.css";
import Link from "next/link";

const DashboardHome = () => {
  const { getSystemHealth } = useSystemHealth();

  const [health, setHealth] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  useEffect(() => {
    const loadHealth = async () => {
      try {
        const data = await getSystemHealth();
        setHealth(data);
      } finally {
        setLoading(false);
      }
    };

    void loadHealth();
  }, []);
  return (
    <>
      <div className={styles.container}>
        {/* Header Section */}
        <header className={styles.header}>
          <h1 className={styles.title}>SIPS Connect API Dashboard</h1>
          <p className={styles.subtitle}>
            Configure adapters, test endpoints, and manage API integrations
          </p>
        </header>

        {/* Configuration Section */}
        <section className={styles.configSection}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FaCogs className={styles.cardIcon} />
              <div className={styles.cardTitleWrapper}>
                <h2>Request Builder</h2>
              </div>
            </div>

            <div className={styles.builderDescription}>
              <p>Create and customize API requests with our visual builder</p>
              <ul className={styles.builderFeatures}>
                <li>
                  <FiChevronRight /> Build payment requests
                </li>
                <li>
                  <FiChevronRight /> Generate verification payloads
                </li>
                <li>
                  <FiChevronRight /> Save request templates
                </li>
              </ul>
            </div>

            <div className={styles.cardFooter}>
              <Link href={"/request-builder"} className={styles.primaryButton}>
                Start Building
              </Link>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FaFileAlt className={styles.cardIcon} />
              <h2>Documentation Hub</h2>
            </div>
            <div className={styles.docGrid}>
              <div className={styles.docCard}>
                <h3>Getting Started</h3>
                <p>Integration guide and setup instructions</p>
              </div>
              <div className={styles.docCard}>
                <h3>API Reference</h3>
                <p>Detailed endpoint documentation</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Grid */}
        <section className={styles.quickAccess}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FaPlug className={styles.cardIcon} />
              <h2>Endpoint Configurations</h2>
              <span className={styles.featureBadge}>Featured</span>
            </div>
            <ul className={styles.configList}>
              {[
                { path: "/config/endpoint", label: "API Adapter Mappings" },
                { path: "/config/core", label: "Core Configuration" },
                { path: "/config/emv", label: "EMV Settings" },
                { path: "/config/hosts", label: "Host Configurations" },
                { path: "/config/iso20022", label: "ISO 20022 Settings" },
                { path: "/config/origins", label: "Origin Management" },
                { path: "/config/xades", label: "XAdES Configuration" },
              ].map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <FiChevronRight />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* API Testing Suite Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FaRocket className={styles.cardIcon} />
              <h2>API Testing Suite</h2>
            </div>
            <div className={styles.subSections}>
              <div className={styles.subCard}>
                <h3>Transaction APIs</h3>
                <ul className={styles.featureList}>
                  <li>
                    <Link href="/api-tester/verify">
                      <FiChevronRight /> Verify API
                    </Link>
                  </li>
                  <li>
                    <Link href="/api-tester/payment">
                      <FiChevronRight /> Payment API
                    </Link>
                  </li>
                  <li>
                    <Link href="/api-tester/status">
                      <FiChevronRight /> Status API
                    </Link>
                  </li>
                  <li>
                    <Link href="/api-tester/return">
                      <FiChevronRight /> Return API
                    </Link>
                  </li>
                </ul>
              </div>

              <div className={styles.apiToolsWrapper}>
                <div className={styles.subCard}>
                  <h3>QR Code Services</h3>
                  <div className={styles.qrSubGrid}>
                    <Link
                      href="/api-tester/qr-codes/generate/merchant"
                      className={styles.miniCard}
                    >
                      <FaPlusCircle /> Generate QR Codes
                    </Link>
                    <Link
                      href={"/api-tester/qr-codes/parse/merchant"}
                      className={styles.miniCard}
                    >
                      <FaEye /> Parse QR Codes
                    </Link>
                  </div>
                </div>

                <div className={styles.subCard}>
                  <h3>Transactions</h3>
                  <ul className={styles.featureList}>
                    <li>
                      <Link href="/transactions/list">
                        <FiChevronRight /> Transaction List
                      </Link>
                    </li>
                    <li>
                      <Link href="/transactions/iso-messages">
                        <FiChevronRight /> ISO Messages
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Status */}
        <section className={styles.quickAccess}>
          <div className="  bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              System Health
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {health && !loading ? (
                health.components.map((component: any, idx: number) => {
                  const statusColor =
                    component.status === "ok"
                      ? "green"
                      : component.status === "degraded"
                      ? "amber"
                      : "red";
                  const StatusIcon =
                    component.status === "ok" ? (
                      <FaCheckCircle className={`text-green-500`} />
                    ) : component.status === "degraded" ? (
                      <FaExclamationTriangle className={`text-amber-500`} />
                    ) : (
                      <FaTimesCircle className={`text-red-500`} />
                    );

                  return (
                    <div
                      key={idx}
                      className="relative p-5 rounded-2xl bg-white shadow-md hover:shadow-2xl transition cursor-pointer"
                    >
                      <div
                        className={`absolute -top-2 -right-2 h-10 w-10 rounded-full bg-${statusColor}-400/30 blur-xl`}
                      />
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {StatusIcon}
                          <h3 className="text-lg font-semibold text-gray-800">
                            {component.name}
                          </h3>
                        </div>
                        <span
                          className={`h-3 w-3 rounded-full bg-${statusColor}-500`}
                        />
                      </div>
                      <p
                        className={`text-sm font-medium text-${statusColor}-700`}
                      >
                        {component.status.toUpperCase()}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">Loading system health...</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default DashboardHome;
