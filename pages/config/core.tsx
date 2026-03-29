import React, {useEffect, useState} from "react";
import Head from "next/head";

import useConfigurationsCore, {
    ConfigurationsCore,
} from "../../api/hooks/useConfigurationsCore";

import Input from "../../component/common/Input/Input";
import Checkbox from "../../component/common/Checkbox/Checkbox";
import styles from "../../styles/ConfigurationsForm.module.css";
import ConfigFormWrapper from "../../component/ConfigFormWrapper/ConfigFormWrapper";
import {AxiosError} from "axios";
import RoleGuard from "../../auth/RoleGuard";

const ISO20022ConfigForm = () => {
    const {getConfigurations, updateConfigurations} = useConfigurationsCore();

    const [config, setConfig] = useState<ConfigurationsCore | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [modal, setModal] = useState({
        show: false,
        title: "",
        message: "",
        error: false,
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleErrorMessage = (
        error: unknown,
        defaultMessage: string
    ): string => {
        if (typeof error === "string") return error;
        if (error instanceof AxiosError) {
            return error.response?.data?.message || error.message || defaultMessage;
        }
        if (error instanceof Error) return error.message;
        return defaultMessage;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getConfigurations();
                setConfig(data);
            } catch (error) {
                setErrorMessage(
                    handleErrorMessage(error, "Failed to load configurations")
                );
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!config) return;
        const {name, type, value, checked} = e.target;

        setConfig({
            ...config,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const showModalWithProps = (
        show: boolean,
        title: string,
        message: string,
        isError: boolean
    ) => {
        setModal({
            show,
            title,
            message,
            error: isError,
        });
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;
        setLoading(true);
        try {
            const response = await updateConfigurations(config);
            showModalWithProps(true, "Success", response, false);
        } catch (error) {
            showModalWithProps(
                true,
                "Error",
                handleErrorMessage(error, "Failed to update configuration"),
                true
            );
        } finally {
            setLoading(false);
        }
    };

    if (errorMessage)
        return <div className={styles.errorContainer}>{errorMessage}</div>;

    return (
        <RoleGuard allowedRoles={["configuration"]}>
            <Head>
                <title>System Configuration | SPS</title>
            </Head>
            <ConfigFormWrapper
                title="Core Configuration"
                subtitle="Manage system-wide settings and API configurations"
                config={config}
                loading={loading}
                onChange={handleChange}
                onSubmit={handleSubmit}
                renderForm={(cfg, onChange) => (
                    <>
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Core API & Integration</h2>
                            <Input
                                label="Base URL"
                                type="text"
                                name="baseUrl"
                                value={cfg.baseUrl}
                                onChange={onChange}
                                placeholder="Enter Base URL"
                                required
                            />
                            <Input
                                label="Public Keys Repo URL"
                                type="text"
                                name="publicKeysRepUrl"
                                value={cfg.publicKeysRepUrl}
                                onChange={onChange}
                                placeholder="Enter Public Keys Repo URL"
                                required
                            />
                            <Input
                                label="Login Endpoint"
                                type="text"
                                name="loginEndpoint"
                                value={cfg.loginEndpoint}
                                onChange={onChange}
                                placeholder="Login Endpoint"
                                required
                            />

                            <Checkbox
                                label="Include Idempotency Headers"
                                name="includeIdempotencyHeaders"
                                checked={cfg.includeIdempotencyHeaders}
                                onChange={onChange}
                            />
                            <div className={styles.fieldWithNote}>
                                <Checkbox
                                    label="Include Core Bank On Listing"
                                    name="includeCoreBankOnListing"
                                    checked={cfg.includeCoreBankOnListing}
                                    onChange={onChange}
                                    disabled
                                />

                                <p className={styles.fieldNote}>
                                    ⚠️ The field <strong>includeCoreBankOnListing</strong> is managed at the application configuration level and cannot be modified through this UI.
                                    Any changes must be applied directly in the application settings.
                                    Please contact the SIPS IT team for further assistance.
                                </p>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Authentication</h2>
                            <Input
                                label="Username"
                                type="text"
                                name="username"
                                value={cfg.username}
                                onChange={onChange}
                                placeholder="Enter Username"
                            />
                            <div className={styles.passwordSection}>
                                <Input
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={cfg.password}
                                    onChange={onChange}
                                    placeholder="Enter Password"
                                />
                                <Checkbox
                                    label="Show Password"
                                    checked={showPassword}
                                    onChange={(e) => setShowPassword(e.target.checked)}
                                />
                            </div>
                            <Input
                                label="BIC"
                                type="text"
                                name="bic"
                                value={cfg.bic}
                                onChange={onChange}
                                placeholder="Enter BIC"
                            />

                        </div>

                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>SAF Settings</h2>
                            <Input
                                label="SAF Expression (Cron)"
                                type="text"
                                name="safExpression"
                                value={cfg.safExpression}
                                onChange={onChange}
                                placeholder="Enter SAF Expression"
                            />
                            <Input
                                label="SAF Page Size"
                                type="number"
                                name="safPage"
                                value={cfg.safPage.toString()}
                                onChange={onChange}
                                placeholder="Enter SAF Page"
                                min={1}
                            />
                            <Input
                                label="SAF Time Zone"
                                type="text"
                                name="safTimeZoneInfo"
                                value={cfg.safTimeZoneInfo}
                                onChange={onChange}
                                placeholder="Enter SAF Time Zone Info"
                            />
                            <Input
                                label="SAF Max Retries"
                                type="number"
                                name="safMaxRetries"
                                value={cfg.safMaxRetries.toString()}
                                onChange={onChange}
                                placeholder="Enter SAF Max Retries"
                                min={0}
                            />
                        </div>

                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Timeouts & Limits</h2>
                            <Input
                                label="HTTP Timeout (seconds)"
                                type="number"
                                name="httpTimeoutSeconds"
                                value={cfg.httpTimeoutSeconds.toString()}
                                onChange={onChange}
                                placeholder="Enter HTTP Timeout in seconds"
                                min={1}
                            />

                            <Input
                                label="Core Bank Timeout (seconds)"
                                type="number"
                                name="coreBankTimeoutSeconds"
                                value={cfg.coreBankTimeoutSeconds.toString()}
                                onChange={onChange}
                                min={1}
                            />
                            <Input
                                label="DB Persist Timeout (seconds)"
                                type="number"
                                name="dbPersistTimeoutSeconds"
                                value={cfg.dbPersistTimeoutSeconds.toString()}
                                onChange={onChange}
                                placeholder="Enter DB Persist Timeout"
                                min={1}
                            />

                            <Input
                                label="Transaction Timeout (minutes)"
                                type="number"
                                name="transactionTimeoutMinutes"
                                value={cfg.transactionTimeoutMinutes.toString()}
                                onChange={onChange}
                                placeholder="Enter Transaction Timeout"
                                min={1}
                            />

                            <Input
                                label="Callback SLA (seconds)"
                                type="number"
                                name="callbackSlaSeconds"
                                value={cfg.callbackSlaSeconds.toString()}
                                onChange={onChange}
                                min={1}
                            />

                            <Input
                                label="Callback Internal Budget (seconds)"
                                type="number"
                                name="callbackInternalBudgetSeconds"
                                value={cfg.callbackInternalBudgetSeconds.toString()}
                                onChange={onChange}
                                min={1}
                            />
                        </div>


                        {/* ================= SYSTEM BEHAVIOR ================= */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>System Behavior & Background Processing</h2>

                            <Input
                                label="Timeout Worker Schedule (Cron)"
                                type="text"
                                name="timeoutWorkerSchedule"
                                value={cfg.timeoutWorkerSchedule}
                                onChange={onChange}
                                placeholder="*/15 * * * *"
                            />

                            <Checkbox
                                label="Verification Only Mode"
                                name="verificationOnlyMode"
                                checked={cfg.verificationOnlyMode}
                                onChange={onChange}
                            />
                        </div>

                    </>
                )}
                modalProps={{
                    ...modal,
                    onClose: () =>
                        setModal({show: false, title: "", message: "", error: false}),
                }}
            />
        </RoleGuard>
    );
};

export default ISO20022ConfigForm;
