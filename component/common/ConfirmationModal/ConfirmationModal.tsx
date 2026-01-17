import React from 'react';
import styles from './ConfirmationModal.module.css';
import { AiOutlineClose } from 'react-icons/ai';

interface ConfirmationModalProps {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
                                                                 title = "Confirmation",
                                                                 message = "Are you sure?",
                                                                 confirmText = "Yes",
                                                                 cancelText = "Cancel",
                                                                 onConfirm = () => {},
                                                                 onCancel = () => {},

                                                             }) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>{title}</h3>

                    <button className={styles.closeButton} onClick={onCancel}>
                        <AiOutlineClose size={20} />
                    </button>
                </div>

                <p className={styles.message}>{message}</p>

                <div className={styles.buttons}>
                    <button onClick={onConfirm} className={styles.confirmButton}>
                        {confirmText}
                    </button>
                    <button onClick={onCancel} className={styles.cancelButton}>
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
