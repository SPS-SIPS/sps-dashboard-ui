import React, {useState, useRef, useCallback, useEffect} from 'react';
import styles from './QRParser.module.css';
import ActionButton from '../common/ActionButton/ActionButton';
import jsQR from 'jsqr';
import AlertModal from "../common/AlertModal/AlertModal";
import {
    MdFileUpload,
    MdQrCodeScanner,
    MdContentCopy,
    MdCheckCircle,
    MdDelete,
    MdClear,
    MdInfo,
    MdImage,
    MdTextFields,
    MdExpandMore,
    MdExpandLess,
    MdDownload,
    MdError
} from 'react-icons/md';
import {extractErrorMessage} from "../../utils/extractErrorMessage";

type JSONObject = { [key: string]: any } | any[] | string | number | boolean;

type QRType = 'merchant' | 'personal';

interface ApiResponse {
    status?: number;
    data?: any;
    error?: string;
    success: boolean;
}

interface QRParserProps {
    title: string;
    subtitle: string;
    onParse: (qrCode: string) => Promise<ApiResponse>;
    qrType: QRType;
}

interface QRValidationResult {
    isValid: boolean;
    type: QRType | null;
}

export const QRParser: React.FC<QRParserProps> = ({
                                                      title,
                                                      subtitle,
                                                      onParse,
                                                      qrType
                                                  }) => {
    const [qrCode, setQrCode] = useState<string>('');
    // Update state type to use JSONObject | null
    const [parseResult, setParseResult] = useState<JSONObject | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [isValidating, setIsValidating] = useState(false);
    const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [qrTypeDetected, setQrTypeDetected] = useState<QRType | null>(null);
    const [characterCount, setCharacterCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [qrImage, setQrImage] = useState<string | null>(null);

    // Update character count when qrCode changes
    useEffect(() => {
        setCharacterCount(qrCode.length);
        if (qrCode.trim()) {
            const validation = validateQRCode(qrCode);
            setQrTypeDetected(validation.type);
        } else {
            setQrTypeDetected(null);
        }
    }, [qrCode]);

    // Helper to validate the structure and type of the SOMQR code
    const validateQRCode = useCallback((qr: string): QRValidationResult => {
        const trimmed = qr.trim();
        // Merchant QR Code starts with '000201'
        if (trimmed.startsWith('000201') && trimmed.length > 30) {
            return {isValid: true, type: 'merchant'};
        }
        // Personal QR Code starts with '000202'
        if (trimmed.startsWith('000202') && trimmed.length > 30) {
            return {isValid: true, type: 'personal'};
        }
        return {isValid: false, type: null};
    }, []);

    // Helper to scan a QR code from a File object
    const scanQRCodeFromImage = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            setIsValidating(true);
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        setIsValidating(false);
                        return reject(new Error('Could not get canvas context'));
                    }

                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    // jsQR is safe, its return type is known
                    const code = jsQR(imageData.data, imageData.width, imageData.height);

                    if (code) {
                        setIsValidating(false);
                        resolve(code.data);
                    } else {
                        setIsValidating(false);
                        reject(new Error('No QR code found in image. Please ensure the code is clear.'));
                    }
                };
                img.onerror = () => {
                    setIsValidating(false);
                    reject(new Error('Failed to load image file.'));
                };
                img.src = event.target?.result as string;
            };
            reader.onerror = () => {
                setIsValidating(false);
                reject(new Error('Failed to read file.'));
            };
            reader.readAsDataURL(file);
        });
    };

    const resetState = () => {
        setQrImage(null);
        setQrCode('');
        setParseResult(null);
        setError('');
        setQrTypeDetected(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        if (!file.type.match('image.*')) {
            setError('Please select a valid image file (PNG, JPG, JPEG, WebP)');
            return;
        }

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        try {
            const qrData = await scanQRCodeFromImage(file);
            const validation = validateQRCode(qrData);

            if (!validation.isValid) {
                throw new Error('Invalid QR code format. Data structure not recognized.');
            }

            if (validation.type !== qrType) {
                throw new Error(`The uploaded QR code is a ${validation.type} code. Please upload a ${qrType} QR code.`);
            }

            // Show preview of the uploaded image
            const reader = new FileReader();
            reader.onload = (event) => {
                setQrImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            setQrCode(qrData);
            setQrTypeDetected(validation.type);
            setError('');
        } catch (err) {
            setError(extractErrorMessage(err, 'An unknown error occurred during upload.'));
            setQrImage(null);
            setQrCode('');
            setQrTypeDetected(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleParse = async () => {
        if (!qrCode.trim()) {
            setError('Please provide QR code data or upload an image.');
            return;
        }

        const validation = validateQRCode(qrCode);
        if (!validation.isValid) {
            setError('The provided QR code data has an invalid format.');
            return;
        }

        if (validation.type !== qrType) {
            setError(`The QR code data is a ${validation.type} code. Please parse a ${qrType} QR code.`);
            return;
        }

        setIsLoading(true);
        setError('');
        setParseResult(null);

        try {
            // onParse now returns Promise<JSONObject>
            console.log("sending req: ", qrCode)
            const result = await onParse(qrCode);
            console.log(result);
            if (result.status === 200) {
                setParseResult(result.data);
            }
            if (result.error)
                setError(result.error);
        } catch (err) {
            setError(extractErrorMessage(err, 'An unknown error occurred during upload.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyResult = async () => {
        if (!parseResult) return;

        try {
            await navigator.clipboard.writeText(JSON.stringify(parseResult, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            setError('Failed to copy to clipboard');
        }
    };

    const handleDownloadResult = () => {
        if (!parseResult) return;

        const dataStr = JSON.stringify(parseResult, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${qrType}-qr-data.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const getTypeColor = (type: QRType) => {
        return type === 'merchant' ? 'var(--color-success)' : 'var(--color-primary)';
    };

    const getTypeBackground = (type: QRType) => {
        return type === 'merchant' ? 'var(--color-success-background)' : 'var(--color-primary-light)';
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSection}>
                        <div className={styles.titleIcon}>
                            <MdQrCodeScanner/>
                        </div>
                        <div>
                            <h2 className={styles.title}>{title}</h2>
                            <p className={styles.subtitle}>{subtitle}</p>
                        </div>
                    </div>
                    <div
                        className={styles.typeBadge}
                        style={{
                            backgroundColor: getTypeBackground(qrType),
                            color: getTypeColor(qrType),
                            borderColor: getTypeColor(qrType)
                        }}
                    >
                        {qrType === 'merchant' ? 'Merchant QR' : 'Personal QR'}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.content}>
                {/* Input Tabs */}
                <div className={styles.tabContainer}>
                    <div className={styles.tabButtons}>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'text' ? styles.active : ''}`}
                            onClick={() => setActiveTab('text')}
                        >
                            <MdTextFields className={styles.tabIcon}/>
                            <span>Text Input</span>
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'image' ? styles.active : ''}`}
                            onClick={() => setActiveTab('image')}
                        >
                            <MdImage className={styles.tabIcon}/>
                            <span>Image Upload</span>
                        </button>
                    </div>

                    {/* Text Input Tab */}
                    {activeTab === 'text' && (
                        <div className={styles.tabContent}>
                            <div className={styles.inputGroup}>
                                <div className={styles.labelRow}>
                                    <label className={styles.label} htmlFor="qr-data-input">
                                        QR Code Data
                                    </label>
                                    <div className={styles.labelInfo}>
                                        <div className={styles.charCounter}>
                                            {characterCount} characters
                                        </div>
                                        {qrTypeDetected && (
                                            <div
                                                className={styles.detectedType}
                                                style={{
                                                    backgroundColor: getTypeBackground(qrTypeDetected),
                                                    color: getTypeColor(qrTypeDetected)
                                                }}
                                            >
                                                {qrTypeDetected === 'merchant' ? 'Merchant' : 'Personal'} QR detected
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.textareaContainer}>
                                    <textarea
                                        id="qr-data-input"
                                        className={styles.textarea}
                                        value={qrCode}
                                        onChange={(e) => {
                                            setQrCode(e.target.value);
                                            setError('');
                                        }}
                                        placeholder={qrType === 'merchant'
                                            ? "Enter Merchant QR code starting with 000201..."
                                            : "Enter Personal QR code starting with 000202..."
                                        }
                                        rows={expanded ? 8 : 5}
                                    />
                                    <div className={styles.textareaActions}>
                                        <button
                                            className={styles.clearButton}
                                            onClick={() => setQrCode('')}
                                            disabled={!qrCode}
                                            title="Clear text"
                                        >
                                            <MdClear/>
                                        </button>
                                        <button
                                            className={styles.expandButton}
                                            onClick={() => setExpanded(!expanded)}
                                            title={expanded ? "Collapse" : "Expand"}
                                        >
                                            {expanded ? <MdExpandLess/> : <MdExpandMore/>}
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.formatHint}>
                                    <MdInfo className={styles.hintIcon}/>
                                    <span>Expected format: {qrType === 'merchant' ? '000201...' : '000202...'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image Upload Tab */}
                    {activeTab === 'image' && (
                        <div className={styles.tabContent}>
                            <div className={styles.uploadContainer}>
                                {qrImage ? (
                                    <div className={styles.previewSection}>
                                        <div className={styles.previewHeader}>
                                            <h4 className={styles.previewTitle}>QR Code Preview</h4>
                                            <button
                                                className={styles.removeButton}
                                                onClick={resetState}
                                                title="Remove Image & Data"
                                            >
                                                <MdDelete/> Remove
                                            </button>
                                        </div>
                                        <div className={styles.imageWrapper}>
                                            <img
                                                src={qrImage}
                                                alt="Uploaded QR Code"
                                                className={styles.qrImage}
                                            />
                                            {qrTypeDetected && (
                                                <div
                                                    className={styles.imageTypeBadge}
                                                    style={{
                                                        backgroundColor: getTypeBackground(qrTypeDetected),
                                                        color: getTypeColor(qrTypeDetected)
                                                    }}
                                                >
                                                    {qrTypeDetected === 'merchant' ? 'Merchant' : 'Personal'} QR
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={styles.uploadArea}
                                        onClick={() => !isValidating && fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            accept="image/png, image/jpeg, image/webp, image/gif"
                                            className={styles.fileInput}
                                            disabled={isValidating}
                                        />
                                        <div className={styles.uploadContent}>
                                            {isValidating ? (
                                                <div className={styles.uploadLoading}>
                                                    <div className={styles.spinner}></div>
                                                    <p className={styles.uploadText}>Scanning QR Code...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className={styles.uploadIcon}>
                                                        <MdFileUpload/>
                                                    </div>
                                                    <div className={styles.uploadText}>
                                                        <p className={styles.uploadTitle}>Upload QR Code Image</p>
                                                        <p className={styles.uploadSubtitle}>
                                                            Click to browse or drag & drop
                                                        </p>
                                                        <p className={styles.uploadInfo}>
                                                            Supports: PNG, JPG, WebP • Max 5MB
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.actionSection}>
                    <ActionButton
                        onClick={handleParse}
                        disabled={isLoading || !qrCode.trim() || isValidating}
                        className={styles.parseButton}
                    >
                        {isLoading
                            ? `Scanning...`
                            : `Scan ${qrType === 'merchant' ? 'Merchant' : 'Personal'} SOMQR`}
                    </ActionButton>

                    {qrCode && (
                        <button
                            className={styles.clearAllButton}
                            onClick={resetState}
                            disabled={isLoading}
                        >
                            <MdClear/> Clear All
                        </button>
                    )}
                </div>

                {/* Results Section */}
                {parseResult && (
                    <div className={styles.resultSection}>
                        <div className={styles.resultHeader}>
                            <div className={styles.resultTitleSection}>
                                <MdCheckCircle className={styles.successIcon}/>
                                <h3 className={styles.resultTitle}>Parsed Data</h3>
                                <div
                                    className={styles.resultTypeBadge}
                                    style={{
                                        backgroundColor: getTypeBackground(qrType),
                                        color: getTypeColor(qrType)
                                    }}
                                >
                                    {qrType === 'merchant' ? 'Merchant QR' : 'Personal QR'}
                                </div>
                            </div>
                            <div className={styles.resultActions}>
                                <button
                                    className={styles.copyResultButton}
                                    onClick={handleCopyResult}
                                    title="Copy Parsed JSON"
                                >
                                    {copied ? <MdCheckCircle/> : <MdContentCopy/>}
                                    {copied ? 'Copied!' : 'Copy JSON'}
                                </button>
                                <button
                                    className={styles.downloadButton}
                                    onClick={handleDownloadResult}
                                    title="Download as JSON"
                                >
                                    <MdDownload/> Download
                                </button>
                            </div>
                        </div>
                        <div className={styles.resultData}>
                            <pre>{JSON.stringify(parseResult, null, 2)}</pre>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className={styles.errorContainer}>
                    <MdError className={styles.errorIcon}/>
                    <div className={styles.errorContent}>
                        <strong className={styles.errorTitle}>Validation Error</strong>
                        <p className={styles.errorMessage}>{error}</p>
                    </div>
                    <button
                        className={styles.dismissError}
                        onClick={() => setError('')}
                    >
                        <MdClear/>
                    </button>
                </div>
            )}

            {/* Alert Modal for critical errors */}
            {error && error.length > 100 && (
                <AlertModal
                    title="Validation Error"
                    message={error}
                    onConfirm={() => setError('')}
                    onClose={() => setError('')}
                    error
                />
            )}
        </div>
    );
};