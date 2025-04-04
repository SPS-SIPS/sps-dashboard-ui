import React from 'react';
import styles from './AlertModal.module.css';
import Image from "next/image";

interface AlertModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onClose?: () => void; // Add an optional onClose handler
    error?: boolean;
    buttonText?: string;
}

const AlertModal: React.FC<AlertModalProps> = ({
                                                   title,
                                                   message,
                                                   onConfirm,
                                                   onClose,
                                                   error = false,
                                                   buttonText = "OK",
                                               }) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                {onClose && (
                    <button className={styles.closeButton} onClick={onClose}>
                        <Image
                            src="/icons/cancel.svg"
                            alt="Close"
                            width={20}
                            height={20}
                            className={styles.closeIcon}
                        />
                    </button>
                )}
                <h3>{title}</h3>
                <p>{message}</p>
                <div className={styles.buttons}>
                    <button
                        onClick={onConfirm}
                        className={error ? styles.errorButton : styles.confirmButton}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;