'use client';

import React, {useEffect, useId, useRef, useState} from 'react';
import jsQR from 'jsqr';
import {MdCheckCircle, MdCloudUpload, MdContentPaste, MdErrorOutline, MdQrCode2, MdRefresh, MdClose} from 'react-icons/md';
import ActionButton from '../../common/ActionButton/ActionButton';
import styles from './UploadQRScanner.module.css';
import {SOMQRType, validateSOMQR} from '../../../utils/validateSOMQR';

interface UploadQRScannerProps {
    onScanSuccess: (result: {data: string; type: SOMQRType}) => void;
    onScanError?: (error: string) => void;
    onClear?: () => void;
    disabled?: boolean;
    onManualChange?: (data: string) => void;
    validationError?: string;
}

type Mode = 'upload' | 'manual';

export function validateQRImage(file: File): string | null {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) return 'Choose a PNG, JPG, or WebP image.';
    if (file.size > 5 * 1024 * 1024) return 'This image is larger than 5 MB. Choose a smaller image.';
    return null;
}

export function decodeQRImage(url: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const finish = (value: string | null, error?: Error) => {
            clearTimeout(timer);
            img.onload = null; img.onerror = null;
            if (error) reject(error); else resolve(value);
        };
        const timer = setTimeout(() => finish(null, new Error('Reading the image timed out. Try another image.')), 10000);
        img.onerror = () => finish(null, new Error('This image could not be opened. Choose another image.'));
        img.onload = () => {
            try {
                const scale = Math.min(1, 2048 / Math.max(img.naturalWidth, img.naturalHeight));
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
                canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Image scanning is unavailable in this browser. Paste SOMQR data instead.');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
                finish(jsQR(pixels.data, pixels.width, pixels.height)?.data ?? null);
            } catch (error) {finish(null, error instanceof Error ? error : new Error('Unable to read SOMQR image.'));}
        };
        img.src = url;
    });
}

export default function UploadQRScanner({onScanSuccess, onScanError, onClear, disabled = false, onManualChange, validationError}: UploadQRScannerProps) {
    const [mode, setMode] = useState<Mode>('upload');
    const [reading, setReading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [manualInput, setManualInput] = useState('');
    const [decoded, setDecoded] = useState('');
    const [error, setError] = useState('');
    const [dragging, setDragging] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);
    const objectUrl = useRef('');
    const operation = useRef(0);
    const pending = useRef(false);
    const id = useId();
    useEffect(() => () => {
        operation.current++;
        if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    }, []);
    const clear = () => {
        operation.current++; pending.current = false;
        if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        objectUrl.current = '';
        setPreviewUrl(''); setFileName(''); setManualInput(''); setDecoded(''); setError(''); setReading(false); setDragging(false);
        if (fileInput.current) fileInput.current.value = '';
        onClear?.();
    };
    const reportError = (message: string) => {setError(message); onScanError?.(message);};
    const acceptData = (data: string) => {
        const validation = validateSOMQR(data);
        if (!validation.isValid || !validation.type) throw new Error('This is not a supported SOMQR code. Check the image or pasted data.');
        setDecoded(data);
        onScanSuccess({data, type: validation.type});
    };
    const upload = async (file: File) => {
        if (disabled || pending.current) return;
        clear();
        const validationError = validateQRImage(file);
        if (validationError) {reportError(validationError); return;}
        const current = operation.current;
        pending.current = true; setReading(true); setFileName(file.name);
        try {
            objectUrl.current = URL.createObjectURL(file);
            setPreviewUrl(objectUrl.current);
            const data = await decodeQRImage(objectUrl.current);
            if (current !== operation.current) return;
            if (!data) throw new Error('No SOMQR code found. Use a clear image showing the entire SOMQR code.');
            acceptData(data);
        } catch (err) {
            if (current === operation.current) reportError(err instanceof Error ? err.message : 'Unable to read SOMQR image.');
        } finally {
            if (current === operation.current) {pending.current = false; setReading(false);}
        }
    };
    const useManualData = () => {
        if (disabled || !manualInput.trim()) return;
        setError(''); setDecoded(''); onClear?.();
        try {acceptData(manualInput.trim());} catch (err) {reportError(err instanceof Error ? err.message : 'Invalid SOMQR data.');}
    };
    const switchMode = (next: Mode) => {
        if (disabled || reading || next === mode) return;
        clear(); setMode(next);
    };
    return <section className={styles.container} aria-label="SOMQR input">
        <div className={styles.modeSwitch} role="group" aria-label="SOMQR input method">
            <button type="button" className={`${styles.modeButton} ${mode === 'upload' ? styles.active : ''}`} aria-pressed={mode === 'upload'} disabled={disabled || reading} onClick={() => switchMode('upload')}><MdCloudUpload aria-hidden="true" size={20}/>Upload Image</button>
            <button type="button" className={`${styles.modeButton} ${mode === 'manual' ? styles.active : ''}`} aria-pressed={mode === 'manual'} disabled={disabled || reading} onClick={() => switchMode('manual')}><MdContentPaste aria-hidden="true" size={20}/>Paste SOMQR Data</button>
        </div>
        {mode === 'upload' ? <>
            <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" hidden disabled={disabled || reading} aria-label="Choose SOMQR image"
                onChange={event => {const file = event.target.files?.[0]; event.target.value = ''; if (file) void upload(file);}}/>
            {!fileName ? <div className={`${styles.dropZone} ${dragging ? styles.dragging : ''}`}
                onDragOver={event => {event.preventDefault(); if (!disabled && !reading) setDragging(true);}}
                onDragLeave={event => {if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);}}
                onDrop={event => {event.preventDefault(); setDragging(false); if (disabled || reading) return;
                    if (event.dataTransfer.files.length !== 1) {clear(); reportError('Drop one SOMQR image at a time.'); return;}
                    void upload(event.dataTransfer.files[0]);}}>
                <span className={styles.uploadIcon}><MdQrCode2 size={40} aria-hidden="true"/></span>
                <h3>Drop a SOMQR image here</h3>
                <p>Choose a clear image showing the entire code.</p>
                <ActionButton className={styles.primaryButton} disabled={disabled || reading} onClick={() => fileInput.current?.click()}>Browse files</ActionButton>
                <small>PNG, JPG, WebP · Max 5 MB</small>
            </div> : <div className={styles.fileCard}>
                {/* Local object URL used for an image selected by the user. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {previewUrl && <img className={styles.thumbnail} src={previewUrl} alt="Selected SOMQR image"/>}
                <div className={styles.fileInfo}><strong>{fileName}</strong><p>{reading ? 'Reading SOMQR image…' : decoded ? 'Image read successfully' : 'Choose another image to try again'}</p></div>
                <div className={styles.fileActions}>
                    <ActionButton className={styles.secondaryButton} disabled={disabled || reading} onClick={() => fileInput.current?.click()}><MdRefresh aria-hidden="true"/>Replace image</ActionButton>
                    <ActionButton className={styles.secondaryButton} disabled={disabled || reading} onClick={clear}><MdClose aria-hidden="true"/>Clear</ActionButton>
                </div>
            </div>}
        </> : <div className={styles.manualPanel}>
            <label htmlFor={`${id}-data`}>SOMQR data</label>
            <textarea id={`${id}-data`} className={styles.textarea} value={manualInput} disabled={disabled} rows={5} spellCheck={false}
                aria-invalid={Boolean(validationError || error)} aria-describedby={validationError || error ? `${id}-error` : undefined}
                placeholder="Paste the complete SOMQR string here…" onChange={event => {setManualInput(event.target.value); setDecoded(''); setError(''); onClear?.(); onManualChange?.(event.target.value);}}/>
            <div className={styles.manualActions}>
                {!onManualChange && <ActionButton className={styles.primaryButton} disabled={disabled || !manualInput.trim()} onClick={useManualData}>Use SOMQR Data</ActionButton>}
                <ActionButton className={styles.secondaryButton} disabled={disabled || !manualInput} onClick={clear}>Clear</ActionButton>
            </div>
        </div>}
        {reading && <p className={styles.status} role="status">Reading SOMQR code…</p>}
        {(validationError || error) && <p id={`${id}-error`} className={`${styles.status} ${styles.error}`} role="alert"><MdErrorOutline aria-hidden="true" size={20}/>{validationError || error}</p>}
        {decoded && <div className={styles.result}>
            <p className={`${styles.status} ${styles.success}`} role="status"><MdCheckCircle aria-hidden="true" size={20}/>SOMQR ready</p>
            <details><summary>View SOMQR data</summary><pre>{decoded}</pre></details>
        </div>}
    </section>;
}
