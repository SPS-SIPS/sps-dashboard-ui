import React from 'react';
import styles from './AlertModal.module.css';
import {MdClose} from "react-icons/md";

interface AlertModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onClose?: () => void;
    error?: boolean;
    success?: boolean;
    warning?: boolean;
    buttonText?: string;
    showCloseButton?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({
                                                   title,
                                                   message,
                                                   onConfirm,
                                                   onClose,
                                                   error = false,
                                                   success = false,
                                                   warning = false,
                                                   buttonText = "OK",
                                                   showCloseButton = true,
                                               }) => {

    // Determine modal type for styling
    const getModalTypeClass = () => {
        if (error) return styles.errorModal;
        if (success) return styles.successModal;
        return '';
    };

    // Determine button class
    const getButtonClass = () => {
        if (error) return styles.errorButton;
        if (success) return styles.successButton;
        return styles.confirmButton;
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={`${styles.modal} ${getModalTypeClass()}`}
                onClick={(e) => e.stopPropagation()}
            >
                {showCloseButton && onClose && (
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <MdClose className={styles.closeIcon} size={20} />
                    </button>
                )}

                <h3>{title}</h3>
                <p>{message}</p>

                <div className={styles.buttons}>
                    <button
                        onClick={onConfirm}
                        className={getButtonClass()}
                        autoFocus
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;