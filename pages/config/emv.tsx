import React, {useEffect, useState} from "react";
import Head from "next/head";

import Input from "../../component/common/Input/Input";
import ActionButton from "../../component/common/ActionButton/ActionButton";
import AlertModal from "../../component/common/AlertModal/AlertModal";
import RoleGuard from "../../auth/RoleGuard";

import useConfigurationsEmv, {
    ConfigurationsEmv,
    Acquirer,
} from "../../api/hooks/useConfigurationsEmv";

import {extractErrorMessage} from "../../utils/extractErrorMessage";

import styles from "../../styles/EmvConfigForm.module.css";

const EmvConfigForm = () => {
    const {getConfigurations, updateConfigurations} = useConfigurationsEmv();

    const [config, setConfig] = useState<ConfigurationsEmv | null>(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [isAddingNew, setIsAddingNew] = useState(false);

    const [newAcquirer, setNewAcquirer] = useState<Acquirer>({
        id: "",
        name: "",
        bic: "",
    });

    const [modal, setModal] = useState({
        show: false,
        title: "",
        message: "",
        error: false,
    });

    // ================= FETCH =================
    useEffect(() => {
        const fetchData = async () => {
            try {
                setFetching(true);
                const data = await getConfigurations();

                setConfig({
                    ...data,
                    acquirers: data.acquirers ?? [],
                });
            } catch (error) {
                setModal({
                    show: true,
                    title: "Error",
                    message: extractErrorMessage(error, "Failed to load configuration"),
                    error: true,
                });
            } finally {
                setFetching(false);
            }
        };

        void fetchData();
    }, []);

    // ================= INPUT CHANGE =================
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!config) return;

        const {name, value} = e.target;

        if (name in config.tags) {
            setConfig({
                ...config,
                tags: {
                    ...config.tags,
                    [name]: value,
                },
            });
        } else {
            setConfig({
                ...config,
                [name]: value,
            });
        }
    };

    // ================= NEW ACQUIRER =================
    const handleNewAcquirerChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const {name, value} = e.target;

        setNewAcquirer((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveAcquirer = async () => {
        if (!config) return;

        if (!newAcquirer.id || !newAcquirer.name || !newAcquirer.bic) {
            setModal({
                show: true,
                title: "Validation",
                message: "All fields are required",
                error: true,
            });
            return;
        }

        const updatedConfig: ConfigurationsEmv = {
            ...config,
            acquirers: [...(config.acquirers ?? []), newAcquirer],
        };

        try {
            setLoading(true);

            const response = await updateConfigurations(updatedConfig);

            setConfig(updatedConfig);

            setModal({
                show: true,
                title: "Success",
                message: response,
                error: false,
            });

            setNewAcquirer({id: "", name: "", bic: ""});
            setIsAddingNew(false);
        } catch (error) {
            setModal({
                show: true,
                title: "Error",
                message: extractErrorMessage(error),
                error: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAcquirer = async (index: number) => {
        if (!config) return;

        const updatedAcquirers = (config.acquirers ?? []).filter(
            (_, i) => i !== index
        );

        const updatedConfig = {
            ...config,
            acquirers: updatedAcquirers,
        };

        try {
            setLoading(true);

            const response = await updateConfigurations(updatedConfig);

            setConfig(updatedConfig);

            setModal({
                show: true,
                title: "Success",
                message: response,
                error: false,
            });
        } catch (error) {
            setModal({
                show: true,
                title: "Error",
                message: extractErrorMessage(error),
                error: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!config) return;

        try {
            setLoading(true);

            const response = await updateConfigurations(config);

            setModal({
                show: true,
                title: "Success",
                message: response,
                error: false,
            });
        } catch (error) {
            setModal({
                show: true,
                title: "Error",
                message: extractErrorMessage(error),
                error: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsAddingNew(false);
        setNewAcquirer({id: "", name: "", bic: ""});
    };

    // ================= UI =================
    return (
        <RoleGuard allowedRoles={["configuration"]}>
            <Head>
                <title>EMV Configuration | SPS</title>
            </Head>

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        SomQR Configuration & QR Management
                    </h1>

                    <p className={styles.subtitle}>
                        Configure EMV settings, manage acquirer mappings, and support QR generation, parsing, and
                        verification routing across SIPS-integrated banks.
                    </p>
                </div>

                {fetching ? (
                    <div className={styles.loading}>Loading...</div>
                ) : config && (
                    <>
                        {/* MAIN CONFIG */}
                            <div className={styles.section}>
                                <Input label="Acquirer ID" name="acquirerId" value={config.acquirerId} required
                                       onChange={handleChange} type="text"/>
                                <Input label="FI Type" name="fiType" value={config.fiType} required
                                       onChange={handleChange} type="text"/>
                                <Input label="FI Name" name="fiName" value={config.fiName} required
                                       onChange={handleChange} type="text"/>
                                <Input label="Version" name="version" value={config.version} required
                                       onChange={handleChange} type="text"/>
                                <Input label="Country Code" name="countryCode" value={config.countryCode} required
                                       onChange={handleChange} type="text"/>
                                <Input label="Merchant Identifier Tag" name="merchantIdentifier"
                                       value={config.tags.merchantIdentifier} required onChange={handleChange}
                                       type="text"/>
                                <Input label="Acquirer Tag" name="acquirerTag" value={config.tags.acquirerTag} required
                                       onChange={handleChange} type="text"/>
                                <Input label="Merchant ID Tag" name="merchantIdTag" value={config.tags.merchantIdTag}
                                       required onChange={handleChange} type="text"/>

                                {/* SAVE CONFIG */}
                                <div className={styles.actions}>
                                    <ActionButton onClick={handleSubmit} disabled={loading}>
                                        {loading ? "Saving..." : "Save Configuration"}
                                    </ActionButton>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h2 className={styles.subSectionTitle}>Acquirers Mapping</h2>
                                <p className={styles.subSectionSubtitle}>
                                    Configure acquirer IDs and BIC codes used during QR-based verification.
                                    When a QR code is submitted to the verification endpoint, the system decodes it,
                                    identifies the acquirer, maps it to the corresponding BIC, and routes the request
                                    to the correct financial institution.
                                </p>
                                {/* ACQUIRERS LIST */}
                                {(config.acquirers ?? []).map((acquirer, index) => (
                                    <div key={index} className={styles.section}>
                                        <div className={styles.actions}>
                                            <ActionButton
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteAcquirer(index)}
                                                disabled={loading}
                                            >
                                                Delete
                                            </ActionButton>
                                        </div>

                                        <Input label="Acquirer ID" value={acquirer.id} onChange={() => {
                                        }} type="text" disabled required/>
                                        <Input label="Name" value={acquirer.name} onChange={() => {
                                        }} type="text" disabled required/>
                                        <Input label="BIC" value={acquirer.bic} onChange={() => {
                                        }} type="text" disabled required/>
                                    </div>
                                ))}

                                {/* ADD NEW */}
                                {isAddingNew && (
                                    <div className={styles.section}>
                                        <div className={styles.actions}>
                                            <ActionButton className={styles.saveButton} onClick={handleSaveAcquirer}>
                                                Save
                                            </ActionButton>
                                            <ActionButton className={styles.cancelButton} onClick={handleCancel}>
                                                Cancel
                                            </ActionButton>
                                        </div>

                                        <Input label="Acquirer ID" name="id" value={newAcquirer.id}
                                               onChange={handleNewAcquirerChange} type="text" required/>
                                        <Input label="Name" name="name" value={newAcquirer.name}
                                               onChange={handleNewAcquirerChange} type="text"required/>
                                        <Input label="BIC" name="bic" value={newAcquirer.bic}
                                               onChange={handleNewAcquirerChange} type="text"required/>
                                    </div>
                                )}

                                {!isAddingNew && (
                                    <div className={styles.actions}>
                                        <ActionButton onClick={() => setIsAddingNew(true)}>
                                            Add New Acquirer
                                        </ActionButton>
                                    </div>
                                )}
                            </div>
                    </>
                )}
            </div>

            {modal.show && (
                <AlertModal
                    title={modal.title}
                    message={modal.message}
                    error={modal.error}
                    onConfirm={() => setModal((prev) => ({...prev, show: false}))}
                    onClose={() => setModal((prev) => ({...prev, show: false}))}
                />
            )}
        </RoleGuard>
    );
};

export default EmvConfigForm;