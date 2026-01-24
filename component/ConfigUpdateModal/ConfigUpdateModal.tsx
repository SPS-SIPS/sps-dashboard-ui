import React, {useState} from "react";
import Input from "../common/Input/Input";
import SelectInput from "../common/SelectInput/SelectInput";
import ActionButton from "../common/ActionButton/ActionButton";
import AlertModal from "../common/AlertModal/AlertModal";
import styles from "./ConfigUpdateModal.module.css";
import {MdClose} from "react-icons/md";

interface ConfigFormValues {
    baseUrl: string;
    keycloakUrl: string;
    keycloakRealm: string;
    keycloakClientId: string;
    profile: string;
}

interface ConfigFormProps {
    initialValues?: Partial<ConfigFormValues>;
    popup?: boolean;
    showCloseButton?: boolean;
    onClose?: () => void;
    onUpdate?: (updatedValues: ConfigFormValues) => void;
}

const ConfigUpdateModal: React.FC<ConfigFormProps> = ({
                                                          initialValues = {},
                                                          popup = false,
                                                          showCloseButton = false,
                                                          onClose,
                                                          onUpdate
                                                      }) => {
    const [values, setValues] = useState<ConfigFormValues>({
        baseUrl: initialValues.baseUrl || "",
        keycloakUrl: initialValues.keycloakUrl || "",
        keycloakRealm: initialValues.keycloakRealm || "",
        keycloakClientId: initialValues.keycloakClientId || "",
        profile: initialValues.profile || "dev",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showModal, setShowModal] = useState(false);
    const [modalProps, setModalProps] = useState<{
        title: string;
        message: string;
        success?: boolean;
        error?: boolean;
    }>({title: "", message: ""});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {name, value} = e.target;
        setValues((prev) => ({...prev, [name]: value}));
    };

    const validateUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!validateUrl(values.baseUrl)) {
            newErrors.baseUrl = "Invalid API Base URL";
        }
        if (!validateUrl(values.keycloakUrl)) {
            newErrors.keycloakUrl = "Invalid Keycloak URL";
        }
        if (!values.keycloakRealm) newErrors.keycloakRealm = "Required";
        if (!values.keycloakClientId) newErrors.keycloakClientId = "Required";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            const res = await fetch("/api/update-config", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(values),
            });
            const data = await res.json();
                setModalProps({
                    title: data.code === 200 ? "Success" : "Error",
                    message: data.message || "Something went wrong",
                    success: data.code === 200,
                    error: data.code !== 200,
                });
            setShowModal(true);

            if (data.code === 200 && onUpdate) {
                onUpdate(values);
            }
        } catch (err) {
            setModalProps({
                title: "Error",
                message: "Network error. Please try again.",
                error: true,
            });
            setShowModal(true);
        }
    };

    return (
        <div className={`${styles.container} ${popup ? styles.popupContainer : ""}`}>
            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <div className={styles.header}>
                    <h2 className={styles.formTitle}>Update Integration Settings</h2>
                    {showCloseButton && onClose && (
                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={onClose}
                            aria-label="Close modal"
                        >
                            <MdClose size={24}/>
                        </button>
                    )}
                </div>

                <p className={styles.formSubtitle}>
                    Configure your SIPS Connect API endpoint and Keycloak authentication details to ensure proper system
                    connectivity and security.
                </p>
                <Input
                    label="SIPS Connect URL"
                    name="baseUrl"
                    type="url"
                    value={values.baseUrl}
                    onChange={handleChange}
                    required
                    errorMessage={errors.baseUrl}
                    placeholder="https://sips-connect.example.com"
                />

                <Input
                    label="Keycloak URL"
                    name="keycloakUrl"
                    type="url"
                    value={values.keycloakUrl}
                    onChange={handleChange}
                    required
                    errorMessage={errors.keycloakUrl}
                    placeholder="https://auth.example.com"
                />

                <Input
                    label="Keycloak Realm"
                    name="keycloakRealm"
                    type="text"
                    value={values.keycloakRealm}
                    onChange={handleChange}
                    required
                    errorMessage={errors.keycloakRealm}
                    placeholder="Enter Keycloak Realm"
                />

                <Input
                    label="Keycloak Client ID"
                    name="keycloakClientId"
                    type="text"
                    value={values.keycloakClientId}
                    onChange={handleChange}
                    required
                    errorMessage={errors.keycloakClientId}
                    placeholder="Enter Keycloak Client ID"
                />

                <SelectInput
                    label="Profile"
                    name="profile"
                    value={values.profile}
                    onChange={handleChange}
                    options={[
                        {value: "dev", label: "Development"},
                        {value: "test", label: "Testing"},
                        {value: "prod", label: "Production"},
                    ]}
                    required
                />

                <ActionButton type="submit" className={styles.button}>Update Config</ActionButton>
            </form>
            {showModal && (
                <AlertModal
                    title={modalProps.title}
                    message={modalProps.message}
                    error={modalProps.error}
                    onConfirm={() => {
                        setShowModal(false)
                        if (onClose) onClose();
                    }}
                    showCloseButton={true}
                />
            )}
        </div>
    );
};

export default ConfigUpdateModal;
