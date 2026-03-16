'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './QRDataViewer.module.css';
import { FaTimes } from 'react-icons/fa';

interface QRDataViewerProps {
    data: any;
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    subtitle?: string;
}

export default function QRDataViewer({
                                         data,
                                         isOpen,
                                         onClose,
                                         title = "Decoded QR Data (JSON)",
                                         subtitle
                                     }: QRDataViewerProps) {
    // Handle ESC key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !data) return null;

    const modalContent = (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="viewer-title"
                aria-describedby={subtitle ? "viewer-subtitle" : undefined}
            >
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                    <FaTimes />
                </button>

                <h3 id="viewer-title" className={styles.title}>{title}</h3>
                {subtitle && (
                    <p id="viewer-subtitle" className={styles.subtitle}>{subtitle}</p>
                )}

                <pre className={styles.jsonBlock}>
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}