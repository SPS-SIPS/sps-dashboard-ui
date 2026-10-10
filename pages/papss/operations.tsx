import React, {useMemo, useState} from 'react';
import {isAxiosError} from 'axios';
import Input from '../../component/common/Input/Input';
import ActionButton from '../../component/common/ActionButton/ActionButton';
import QRDataViewer from '../../component/ScanToPay/QRDataViewer/QRDataViewer';
import RoleGuard from '../../auth/RoleGuard';
import useAxiosPrivate from '../../api/hooks/useAxiosPrivate';
import {useAuthentication} from '../../auth/AuthProvider';
import sharedStyles from '../../component/RequestForm/SharedStyles.module.css';
import styles from '../../styles/PapssOperations.module.css';

type JsonRecord = Record<string, unknown>;

const fieldValue = (data: unknown, key: string) => {
    if (!data || typeof data !== 'object') return undefined;
    const record = data as JsonRecord;
    return record[key] ?? record[key[0].toUpperCase() + key.slice(1)];
};

const readableValue = (data: unknown, key: string) => {
    const value = fieldValue(data, key);
    if (value === undefined || value === null || value === '') return '—';
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
};

const OperationSummary = ({data, title}: {data: unknown; title: string}) => {
    const fields = [
        ['Operation', 'operation'], ['Status', 'status'], ['Direction', 'direction'],
        ['Request message ID', 'requestMessageId'], ['Transaction ID', 'txId'],
        ['End-to-end ID', 'endToEndId'], ['Amount', 'amount'], ['Currency', 'currency'],
        ['Payment outcome', 'paymentOutcome'], ['Payment status', 'paymentStatus'],
        ['PAPSS outcome', 'papssOutcome'], ['Gateway state', 'gatewayState'],
        ['Bank delivery state', 'bankDeliveryState'], ['Reason', 'reason'],
        ['Created at', 'createdAt'], ['Completed at', 'completedAt'],
    ];
    return <div className={styles.summary}><h3>{title}</h3><div className={styles.summaryGrid}>{fields.map(([label, key]) => <div className={styles.summaryItem} key={key}><span>{label}</span><strong>{readableValue(data, key)}</strong></div>)}</div></div>;
};

export default function PapssOperationsPage() {
    const {config} = useAuthentication();
    const axiosPrivate = useAxiosPrivate();
    const [requestMessageId, setRequestMessageId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [response, setResponse] = useState<unknown>(null);
    const [txId, setTxId] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [paymentResponse, setPaymentResponse] = useState<unknown>(null);
    const [endToEndId, setEndToEndId] = useState('');
    const [endToEndLoading, setEndToEndLoading] = useState(false);
    const [endToEndError, setEndToEndError] = useState('');
    const [endToEndResponse, setEndToEndResponse] = useState<unknown>(null);
    const [viewer, setViewer] = useState<'operation-request' | 'operation-response' | 'payment-request' | 'payment-response' | 'end-to-end-request' | 'end-to-end-response' | null>(null);
    const baseUrl = config?.api.baseUrl?.replace(/\/$/, '') ?? '';
    const request = useMemo(() => ({method: 'GET', url: `${baseUrl}/api/v1/Gateway/Operations/${encodeURIComponent(requestMessageId.trim())}`}), [baseUrl, requestMessageId]);
    const paymentRequest = useMemo(() => ({method: 'GET', url: `${baseUrl}/api/v1/Gateway/Payment/${encodeURIComponent(txId.trim())}`}), [baseUrl, txId]);
    const endToEndRequest = useMemo(() => ({method: 'GET', url: `${baseUrl}/api/v1/Gateway/Operations?endToEndId=${encodeURIComponent(endToEndId.trim())}`}), [baseUrl, endToEndId]);

    const lookup = async (event: React.FormEvent) => {
        event.preventDefault();
        const id = requestMessageId.trim();
        if (!id || loading) return;
        setLoading(true); setError(''); setResponse(null); setViewer(null);
        try {
            const result = await axiosPrivate.get(request.url);
            setResponse(result.data);
        } catch (requestError) {
            const data = isAxiosError(requestError) ? requestError.response?.data : null;
            setResponse(data ?? null);
            setError(typeof data?.message === 'string' ? data.message : requestError instanceof Error ? requestError.message : 'Unable to retrieve the PAPSS operation.');
        } finally {setLoading(false);}
    };

    const lookupPayment = async (event: React.FormEvent) => {
        event.preventDefault();
        const id = txId.trim();
        if (!id || paymentLoading) return;
        setPaymentLoading(true); setPaymentError(''); setPaymentResponse(null); setViewer(null);
        try {
            const result = await axiosPrivate.get(paymentRequest.url);
            setPaymentResponse(result.data);
        } catch (requestError) {
            const data = isAxiosError(requestError) ? requestError.response?.data : null;
            setPaymentResponse(data ?? null);
            setPaymentError(typeof data?.message === 'string' ? data.message : requestError instanceof Error ? requestError.message : 'Unable to retrieve the PAPSS payment.');
        } finally {setPaymentLoading(false);}
    };

    const lookupEndToEnd = async (event: React.FormEvent) => {
        event.preventDefault();
        const id = endToEndId.trim();
        if (!id || endToEndLoading) return;
        setEndToEndLoading(true); setEndToEndError(''); setEndToEndResponse(null); setViewer(null);
        try {
            const result = await axiosPrivate.get(endToEndRequest.url);
            setEndToEndResponse(result.data);
        } catch (requestError) {
            const data = isAxiosError(requestError) ? requestError.response?.data : null;
            setEndToEndResponse(data ?? null);
            setEndToEndError(typeof data?.message === 'string' ? data.message : requestError instanceof Error ? requestError.message : 'Unable to retrieve the PAPSS operation.');
        } finally {setEndToEndLoading(false);}
    };


    return <RoleGuard allowedRoles={['gateway', 'recon']}><div className={`${sharedStyles.container} ${styles.page}`}>
        <header className={styles.header}><div><h1 className={sharedStyles.mainTitle}>PAPSS Operations</h1><p className={sharedStyles.subTitle}>Look up a PAPSS operation using the request message ID returned by Verify or Payment.</p></div></header>
        <section className={styles.card}>
            <h2>Lookup operation</h2>
            <form onSubmit={lookup}>
                <Input label="Request message ID" value={requestMessageId} type="text" required disabled={loading} onChange={event => setRequestMessageId(event.target.value)}/>
                <div className={styles.actions}><ActionButton type="submit" disabled={loading || !requestMessageId.trim()}>{loading ? 'Looking up…' : 'Lookup Operation'}</ActionButton></div>
            </form>
            {error && <p className={styles.error} role="alert">{error}</p>}
        </section>
        {response !== null && <section className={styles.result} aria-live="polite"><div className={styles.resultHeader}><h2>Operation response</h2><span>GET</span></div><OperationSummary data={response} title="Operation details"/><div className={styles.actions}><ActionButton className={styles.secondary} onClick={() => setViewer('operation-request')}>View Request JSON</ActionButton><ActionButton className={styles.secondary} onClick={() => setViewer('operation-response')}>View Response JSON</ActionButton></div></section>}
        <section className={styles.card}>
            <h2>Lookup payment</h2>
            <form onSubmit={lookupPayment}>
                <Input label="Transaction ID" value={txId} type="text" required disabled={paymentLoading} onChange={event => setTxId(event.target.value)}/>
                <div className={styles.actions}><ActionButton type="submit" disabled={paymentLoading || !txId.trim()}>{paymentLoading ? 'Looking up…' : 'Lookup Payment'}</ActionButton></div>
            </form>
            {paymentError && <p className={styles.error} role="alert">{paymentError}</p>}
        </section>
        {paymentResponse !== null && <section className={styles.result} aria-live="polite"><div className={styles.resultHeader}><h2>Payment response</h2><span>GET</span></div><OperationSummary data={paymentResponse} title="Payment details"/><div className={styles.actions}><ActionButton className={styles.secondary} onClick={() => setViewer('payment-request')}>View Request JSON</ActionButton><ActionButton className={styles.secondary} onClick={() => setViewer('payment-response')}>View Response JSON</ActionButton></div></section>}
        <section className={styles.card}>
            <h2>Lookup by end-to-end ID</h2>
            <form onSubmit={lookupEndToEnd}>
                <Input label="End-to-end ID" value={endToEndId} type="text" required disabled={endToEndLoading} onChange={event => setEndToEndId(event.target.value)}/>
                <div className={styles.actions}><ActionButton type="submit" disabled={endToEndLoading || !endToEndId.trim()}>{endToEndLoading ? 'Looking up…' : 'Lookup by End-to-End ID'}</ActionButton></div>
            </form>
            {endToEndError && <p className={styles.error} role="alert">{endToEndError}</p>}
        </section>
        {endToEndResponse !== null && <section className={styles.result} aria-live="polite"><div className={styles.resultHeader}><h2>End-to-end lookup response</h2><span>GET</span></div><OperationSummary data={endToEndResponse} title="Payment details"/><div className={styles.actions}><ActionButton className={styles.secondary} onClick={() => setViewer('end-to-end-request')}>View Request JSON</ActionButton><ActionButton className={styles.secondary} onClick={() => setViewer('end-to-end-response')}>View Response JSON</ActionButton></div></section>}
        <QRDataViewer isOpen={viewer === 'operation-request'} data={request} rawResponse title="PAPSS Operation Request" onClose={() => setViewer(null)}/>
        <QRDataViewer isOpen={viewer === 'operation-response'} data={response} rawResponse title="PAPSS Operation Response" onClose={() => setViewer(null)}/>
        <QRDataViewer isOpen={viewer === 'payment-request'} data={paymentRequest} rawResponse title="PAPSS Payment Request" onClose={() => setViewer(null)}/>
        <QRDataViewer isOpen={viewer === 'payment-response'} data={paymentResponse} rawResponse title="PAPSS Payment Response" onClose={() => setViewer(null)}/>
        <QRDataViewer isOpen={viewer === 'end-to-end-request'} data={endToEndRequest} rawResponse title="PAPSS End-to-End Lookup Request" onClose={() => setViewer(null)}/>
        <QRDataViewer isOpen={viewer === 'end-to-end-response'} data={endToEndResponse} rawResponse title="PAPSS End-to-End Lookup Response" onClose={() => setViewer(null)}/>
    </div></RoleGuard>;
}
