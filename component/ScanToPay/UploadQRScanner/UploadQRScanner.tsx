'use client';

import React, { useState } from 'react';
import jsQR from 'jsqr';
import styles from './UploadQRScanner.module.css';
import {SOMQRType, validateSOMQR} from '../../../utils/validateSOMQR';

interface UploadQRScannerProps {
    onScanSuccess: (result: { data: string; type: SOMQRType }) => void;
    onScanError?: (error: string) => void;
}

type Mode = 'upload' | 'manual';

export default function UploadQRScanner({
                                            onScanSuccess,
                                            onScanError,
                                        }: UploadQRScannerProps) {
    const [mode, setMode] = useState<Mode>('upload');
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [manualInput, setManualInput] = useState('');

    const validateFile = (file: File): string | null => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return 'Unsupported file type. Please upload PNG, JPG, or WebP.';
        }
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return 'File size exceeds 5MB.';
        }
        return null;
    };

    const decodeQRFromImage = async (file: File): Promise<string | null> => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        return new Promise((resolve) => {
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
                if (!imageData) {
                    resolve(null);
                    return;
                }
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                resolve(code?.data ?? null);
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const validationError = validateFile(file);
        if (validationError) {
            onScanError?.(validationError);
            return;
        }

        setIsLoading(true);
        try {
            const decoded = await decodeQRFromImage(file);
            if (!decoded) throw new Error('No QR code found in the image.');
            const validation = validateSOMQR(decoded);
            if (!validation.isValid) throw new Error('Invalid SOM QR code format.');
            onScanSuccess({
                data: decoded,
                type: validation.type!,
            });
        } catch (err: any) {
            onScanError?.(err?.message || 'Failed to read QR image.');
        } finally {
            setIsLoading(false);
            e.target.value = ''; // Allow re-upload of the same file
        }
    };

    const handleManualSubmit = () => {
        const trimmed = manualInput.trim();
        if (!trimmed) return;

        const validation = validateSOMQR(trimmed);
        if (!validation.isValid) {
            onScanError?.('Invalid SOM QR code format.');
            return;
        }
        onScanSuccess({
            data: trimmed,
            type: validation.type!,
        });
        setManualInput('');
    };

    const switchMode = (newMode: Mode) => {
        setMode(newMode);
        setFileName(null);
        setManualInput('');
        setIsLoading(false);
    };

    return (
        <div className={styles.container}>
            {/* Mode Toggle */}
            <div className={styles.toggleContainer} role="tablist">
                <button
                    className={`${styles.toggleButton} ${mode === 'upload' ? styles.activeToggle : ''}`}
                    onClick={() => switchMode('upload')}
                    role="tab"
                    aria-selected={mode === 'upload'}
                    aria-controls="upload-panel"
                >
                    Upload Image
                </button>
                <button
                    className={`${styles.toggleButton} ${mode === 'manual' ? styles.activeToggle : ''}`}
                    onClick={() => switchMode('manual')}
                    role="tab"
                    aria-selected={mode === 'manual'}
                    aria-controls="manual-panel"
                >
                    Enter Manually
                </button>
            </div>

            {/* Upload Panel */}
            {mode === 'upload' && (
                <div id="upload-panel" role="tabpanel" className={styles.panel}>
                    <label className={styles.uploadLabel}>
                        Choose QR Image
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleUpload}
                            hidden
                        />
                    </label>
                    {fileName && <p className={styles.fileName}>{fileName}</p>}
                </div>
            )}

            {/* Manual Input Panel */}
            {mode === 'manual' && (
                <div id="manual-panel" role="tabpanel" className={styles.panel}>
          <textarea
              className={styles.textarea}
              placeholder="Paste SOM QR string here..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              rows={4}
          />
                    <button className={styles.button} onClick={handleManualSubmit}>
                        Submit QR Data
                    </button>
                </div>
            )}

            {isLoading && <p className={styles.loading}>Reading QR code…</p>}
        </div>
    );
}