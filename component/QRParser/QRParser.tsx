import React, { useState, useRef } from 'react';
import styles from './QRParser.module.css';
import ActionButton from '../common/ActionButton/ActionButton';
import jsQR from 'jsqr';

interface QRParserProps {
    title: string;
    subtitle: string;
    onParse: (qrCode: string) => Promise<unknown>;
}

export const QRParser: React.FC<QRParserProps> = ({
                                                      title,
                                                      subtitle,
                                                      onParse
                                                  }) => {
    const [qrCode, setQrCode] = useState<string>('');
    const [parseResult, setParseResult] = useState<string | object | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [qrImage, setQrImage] = useState<string | null>(null);

    const scanQRCodeFromImage = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');

                        if (!ctx) {
                            reject(new Error('Could not get canvas context'));
                            return;
                        }

                        ctx.drawImage(img, 0, 0);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height);

                        if (code) {
                            resolve(code.data);
                        } else {
                            reject(new Error('No QR code found in image'));
                        }
                    };
                    img.onerror = () => reject(new Error('Failed to load image'));
                    img.src = event.target?.result as string;
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const qrData = await scanQRCodeFromImage(file);
            setQrCode(qrData);

            // Show preview of the uploaded image
            const reader = new FileReader();
            reader.onload = (event) => {
                setQrImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to read QR code from image');
            setQrImage(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleParse = async () => {
        if (!qrCode.trim()) {
            setError('Please enter a QR code or upload an image');
            return;
        }

        setIsLoading(true);
        setError('');
        setParseResult(null);

        try {
            const result = await onParse(qrCode);
            // @ts-ignore
            setParseResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse QR code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>

            <div className={styles.inputSection}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>QR Code Data</label>
                    <textarea
                        className={styles.textarea}
                        value={qrCode}
                        onChange={(e) => setQrCode(e.target.value)}
                        placeholder="Paste QR code data here or upload an image"
                        rows={4}
                    />
                </div>

                <div className={styles.uploadSection}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className={styles.fileInput}
                    />
                    <ActionButton
                        onClick={() => fileInputRef.current?.click()}
                        className={styles.uploadButton}
                    >
                        Upload QR Image
                    </ActionButton>
                    {qrImage && (
                        <div className={styles.qrPreview}>
                            <img src={qrImage} alt="Uploaded QR" className={styles.qrImage} />
                            <button
                                className={styles.removeButton}
                                onClick={() => {
                                    setQrImage(null);
                                    setQrCode('');
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ActionButton
                onClick={handleParse}
                disabled={isLoading}
                className={styles.parseButton}
            >
                {isLoading ? 'Parsing...' : 'Parse QR Code'}
            </ActionButton>

            {error && <div className={styles.error}>{error}</div>}

            {parseResult && (
                <div className={styles.resultSection}>
                    <h3 className={styles.resultTitle}>Parsed QR Data</h3>
                    <div className={styles.resultData}>
                        <pre>{JSON.stringify(parseResult, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};