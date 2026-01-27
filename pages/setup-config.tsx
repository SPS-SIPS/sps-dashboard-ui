import {AppConfig, getAppConfig} from "../utils/config";
import {AiOutlineWarning, AiOutlineHome, AiOutlineSetting, AiOutlineCheckCircle} from "react-icons/ai";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import ConfigUpdateModal from "../component/ConfigUpdateModal/ConfigUpdateModal";
import ConfirmationModal from "../component/common/ConfirmationModal/ConfirmationModal";
import AlertModal from "../component/common/AlertModal/AlertModal";
import styles from "../styles/SetupConfig.module.css";
import SpinLoading from "../component/Loading/SpinLoading/SpinLoading";
type ActiveModal = "update" | "confirm" | null;

export interface ConfigFormValues {
    baseUrl: string;
    keycloakUrl: string;
    keycloakRealm: string;
    keycloakClientId: string;
    profile: string;
}

const SetupConfig = () => {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const [formValues, setFormValues] = useState<ConfigFormValues>({
        baseUrl: "",
        keycloakUrl: "",
        keycloakRealm: "",
        keycloakClientId: "",
        profile: "dev",
    });

    const router = useRouter();
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const [alert, setAlert] = useState<{
        title: string;
        message: string;
        error?: boolean;
    } | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchConfig() {
            try {
                const cfg = await getAppConfig();
                setConfig(cfg);
                setFormValues({
                    baseUrl: cfg.api.baseUrl,
                    keycloakUrl: cfg.keycloak.url,
                    keycloakRealm: cfg.keycloak.realm,
                    keycloakClientId: cfg.keycloak.clientId,
                    profile: cfg.profile,
                });
            } catch (err) {
                console.error("Failed to load config", err);
            } finally {
                setLoading(false);
            }
        }

        void fetchConfig();
    }, []);

    const confirmSetup = async () => {
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/confirm-setup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            setAlert({
                title: data.status || "Response",
                message: data.message || "No message returned from server.",
                error: data.code !== 200,
            });

            if (data.code === 200) {
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }

        } catch (err: any) {
            setAlert({
                title: "Request Failed",
                message: err.message || "An unexpected error occurred.",
                error: true,
            });
        } finally {
            setIsSubmitting(false);
            setActiveModal(null);
        }
    };

    if (loading) {
        return (
            <div className={styles.statusMessage}>
                <SpinLoading />
                <p className={styles.statusText}>Loading configuration...</p>
            </div>
        );
    }

    if (!config) {
        return (
            <div className={styles.statusMessage}>
                <AiOutlineWarning size={50} className={styles.warningIcon} />
                <p className={styles.statusText}>Error loading configuration.</p>
            </div>
        );
    }


    const goHome = () => {
        void router.push("/");
    };

    return (
        <div className={styles.container}>
            {config.uiGuards.setupConfirmed ? (
                <div className={styles.errorMessage}>
                    <AiOutlineWarning size={60} className={styles.warningIcon} />

                    <div className={styles.messageContent}>
                        <p className={styles.title}>
                            The Integration Config setup is already confirmed.
                        </p>

                        <p className={styles.description}>
                            If you want to update the configuration, please use the{" "}
                            <strong>Integration Config</strong> button available in your profile
                            dropdown, as shown in the image below.
                        </p>

                        <img
                            src="/images/integration-button.png"
                            alt="Integration Config button in profile dropdown"
                            className={styles.screenshot}
                        />

                        <p className={styles.note}>
                            If you cannot access this option due to a Keycloak issue or any other
                            reason, please contact the <strong>SPS team</strong> to resolve the issue.
                            <br />
                            Thank you for your understanding.
                        </p>

                        <button className={styles.homeButton} onClick={goHome}>
                            <AiOutlineHome size={18} />
                            <span>Go Back</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.cardsGrid}>
                    <div
                        className={styles.card}
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveModal("update")}
                    >
                        <div className={styles.cardHeader}>
                            <AiOutlineSetting className={styles.cardIcon} />
                            <h3 className={styles.cardTitle}>Update Configuration</h3>
                        </div>

                        <p className={styles.cardDescription}>
                            Modify API endpoints, Keycloak settings, and environment configuration
                            before finalizing the setup.
                        </p>
                    </div>

                    {/* Confirm Setup Card */}
                    <div
                        className={`${styles.card} ${styles.confirmCard}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveModal("confirm")}
                    >
                        <div className={styles.cardHeader}>
                            <AiOutlineCheckCircle className={styles.confirmIcon} />
                            <h3 className={styles.cardTitle}>Confirm Setup</h3>
                        </div>

                        <p className={styles.cardDescription}>
                            Finalize the integration setup. Once confirmed, configuration changes will
                            be locked and can only be managed through the Integration Config menu.
                        </p>
                    </div>
                </div>
            )}

            {activeModal === "update" && (
                <ConfigUpdateModal
                    popup
                    initialValues={formValues}
                    onClose={() => setActiveModal(null)}
                    onUpdate={(updatedValues) => setFormValues(updatedValues)}
                    showCloseButton={true}
                />
            )}

            {activeModal === "confirm" && (
                <ConfirmationModal
                    title="Confirm Integration Setup"
                    message="Are you sure you want to confirm the setup? This action cannot be undone."
                    confirmText={isSubmitting ? "Confirming..." : "Yes, Confirm"}
                    cancelText="Cancel"
                    onConfirm={confirmSetup}
                    onCancel={() => setActiveModal(null)}
                />
            )}

            {alert && (
                <AlertModal
                    title={alert.title}
                    message={alert.message}
                    error={alert.error}
                    buttonText="OK"
                    onConfirm={() => {
                        setAlert(null);
                    }}
                    onClose={() => setAlert(null)}
                />
            )}

        </div>
    );
};

export default SetupConfig;
