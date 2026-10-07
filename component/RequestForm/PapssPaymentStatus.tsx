import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {AxiosInstance} from 'axios';
import {isAxiosError} from 'axios';
import ActionButton from '../common/ActionButton/ActionButton';
import QRDataViewer from '../ScanToPay/QRDataViewer/QRDataViewer';
import {extractErrorMessage} from '../../utils/extractErrorMessage';
import styles from './PapssVerificationStatus.module.css';

type StatusResponse = Record<string, unknown>;
type Props = {endpoint: string; requestMessageId: string; statusBody: Record<string, unknown>; axiosPrivate: AxiosInstance};

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 40;
const PENDING_STATES = new Set(['PENDING', 'PROCESSING', 'IN_PROGRESS', 'ADMITTED', 'RECEIVED', 'RECEIVED_AND_DURABLY_ADMITTED']);

const valueOf = (data: StatusResponse, ...keys: string[]) => keys.map(key => data[key] ?? data[key.charAt(0).toLowerCase() + key.slice(1)]).find(value => value !== undefined && value !== null);

export default function PapssPaymentStatus({endpoint, requestMessageId, statusBody, axiosPrivate}: Props) {
    const statusUrl = useMemo(() => endpoint.replace(/\/Payment\/?$/i, '/Status'), [endpoint]);
    const [status, setStatus] = useState('PENDING');
    const [result, setResult] = useState<StatusResponse | null>(null);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [polling, setPolling] = useState(true);
    const [stopped, setStopped] = useState(false);
    const [retry, setRetry] = useState(0);
    const [viewer, setViewer] = useState<'request' | 'response' | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stoppedRef = useRef(false);

    useEffect(() => {
        stoppedRef.current = false;
        setPolling(true); setStopped(false); setError(''); setAttempts(0); setStatus('PENDING'); setResult(null);
        const poll = async (attempt: number) => {
            if (stoppedRef.current) return;
            setAttempts(attempt);
            try {
                const response = await axiosPrivate.post<StatusResponse>(statusUrl, statusBody);
                if (stoppedRef.current) return;
                const data = response.data ?? {};
                setResult(data);
                const nextStatus = String(valueOf(data, 'status', 'Status', 'code', 'Code') ?? 'PENDING').toUpperCase();
                setStatus(nextStatus);
                if (!PENDING_STATES.has(nextStatus) || attempt >= MAX_ATTEMPTS) {
                    setPolling(false);
                    if (attempt >= MAX_ATTEMPTS && PENDING_STATES.has(nextStatus)) setError('PAPSS payment is still pending. Try checking again later.');
                    return;
                }
                timer.current = setTimeout(() => void poll(attempt + 1), POLL_INTERVAL_MS);
            } catch (requestError) {
                if (stoppedRef.current) return;
                const data = isAxiosError(requestError) ? requestError.response?.data : undefined;
                setError(typeof data?.message === 'string' ? data.message : extractErrorMessage(requestError, 'Unable to retrieve the PAPSS payment status.'));
                setPolling(false);
            }
        };
        void poll(1);
        return () => {stoppedRef.current = true; if (timer.current) clearTimeout(timer.current);};
    }, [axiosPrivate, retry, statusBody, statusUrl]);

    const stopPolling = () => {stoppedRef.current = true; if (timer.current) clearTimeout(timer.current); setPolling(false); setStopped(true);};
    const checkAgain = () => setRetry(value => value + 1);
    const requestData = {method: 'POST', url: statusUrl, body: statusBody};

    return <section className={styles.card} aria-live="polite">
        <div className={styles.headingRow}><div><h2>PAPSS Payment Status</h2><p className={styles.messageId}>Request ID: {requestMessageId}</p></div><span className={styles.status}>{status}</span></div>
        {polling && <div className={styles.pollingControls}><p className={styles.pendingMessage}>Waiting for the PAPSS payment result… Check {attempts} of {MAX_ATTEMPTS}.</p><ActionButton className={styles.stopButton} onClick={stopPolling}>Stop Checking</ActionButton></div>}
        {stopped && !polling && <div className={styles.stoppedMessage} role="status"><p>Status checking stopped. The PAPSS payment remains active.</p><ActionButton onClick={checkAgain}>Check Again</ActionButton></div>}
        {error && <div className={styles.error} role="alert"><p>{error}</p><ActionButton onClick={checkAgain}>Check Again</ActionButton></div>}
        <div className={styles.actions}><ActionButton className={styles.viewerButton} onClick={() => setViewer('request')}>View Status Request</ActionButton>{result && <ActionButton className={styles.viewerButton} onClick={() => setViewer('response')}>View Status Response</ActionButton>}</div>
        <QRDataViewer data={requestData} isOpen={viewer === 'request'} onClose={() => setViewer(null)} title="PAPSS Payment Status Request" rawResponse/>
        <QRDataViewer data={result} isOpen={viewer === 'response'} onClose={() => setViewer(null)} title="PAPSS Payment Status Response" rawResponse/>
    </section>;
}
