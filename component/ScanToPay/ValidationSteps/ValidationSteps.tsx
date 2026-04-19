'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './ValidationSteps.module.css';
import { QRValidationResult } from '../../../utils/qrValidationUtils';
import { FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

interface ValidationStepsProps {
    title: string;
    subtitle?: string; // Optional subtitle
    result: QRValidationResult;
    isOpen: boolean;
    onClose?: () => void;
}

export default function ValidationSteps({ title, subtitle, result, isOpen, onClose }: ValidationStepsProps) {
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

    // Don't render anything if not open
    if (!isOpen) return null;

    const steps = result.steps;

    // Modal content
    const modalContent = (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="validation-title"
                aria-describedby={subtitle ? "validation-subtitle" : undefined}
            >
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                    <FaTimes />
                </button>

                <h3 id="validation-title" className={styles.title}>{title}</h3>
                {subtitle && (
                    <p id="validation-subtitle" className={styles.subtitle}>{subtitle}</p>
                )}

                <div className={styles.stepsChain}>
                    {steps.map((step, index) => {
                        const isFirst = index === 0;
                        const isLast = index === steps.length - 1;

                        return (
                            <div
                                key={index}
                                className={`${styles.step} ${isFirst ? styles.firstStep : ''} ${
                                    isLast ? styles.lastStep : ''
                                }`}
                            >
                                <div className={styles.iconWrapper}>
                                    {step.passed ? (
                                        <FaCheckCircle className={styles.passIcon} />
                                    ) : (
                                        <FaTimesCircle className={styles.failIcon} />
                                    )}
                                </div>

                                <div className={styles.content}>
                                    <p className={styles.stepName}>{step.step}</p>
                                    <p className={styles.stepMessage}>{step.message}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    // Render into a portal at the end of body
    return createPortal(modalContent, document.body);
}