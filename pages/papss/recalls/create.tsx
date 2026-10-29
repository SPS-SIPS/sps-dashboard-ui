import React, {useMemo, useState} from 'react';
import {isAxiosError} from 'axios';
import Input from '../../../component/common/Input/Input';
import ActionButton from '../../../component/common/ActionButton/ActionButton';
import QRDataViewer from '../../../component/ScanToPay/QRDataViewer/QRDataViewer';
import RoleGuard from '../../../auth/RoleGuard';
import useAxiosPrivate from '../../../api/hooks/useAxiosPrivate';
import useEndpoints from '../../../api/hooks/useEndpoints';
import {useAuthentication} from '../../../auth/AuthProvider';
import sharedStyles from '../../../component/RequestForm/SharedStyles.module.css';
import styles from '../../../styles/PapssOperations.module.css';

type RecallForm = { txId: string; endToEndId: string; reason: string; recallId: string };
const initialForm: RecallForm = {txId: '', endToEndId: '', reason: '', recallId: ''};
const errorText = (error: unknown, fallback: string) => { const data = isAxiosError(error) ? error.response?.data : null; return typeof data?.message === 'string' ? data.message : error instanceof Error ? error.message : fallback; };

export default function PapssRecallCreatePage() {
    const axiosPrivate = useAxiosPrivate();
    const {config} = useAuthentication();
    const {endpoints, loading: endpointsLoading, error: endpointsError} = useEndpoints();
    const [form, setForm] = useState<RecallForm>(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [response, setResponse] = useState<unknown>(null);
    const [status, setStatus] = useState<unknown>(null);
    const [statusLoading, setStatusLoading] = useState(false);
    const [statusError, setStatusError] = useState('');
    const [closeReason, setCloseReason] = useState('');
    const [closeLoading, setCloseLoading] = useState(false);
    const [closeError, setCloseError] = useState('');
    const [viewer, setViewer] = useState<'request' | 'response' | 'status-request' | 'status-response' | null>(null);
    const baseUrl = config?.api.baseUrl?.replace(/\/$/, '') ?? '';
    const requestId = typeof response === 'object' && response !== null ? String((response as Record<string, unknown>).requestMessageId ?? '') : form.recallId;
    const request = useMemo(() => ({method: 'POST', url: `${baseUrl}/api/v1/Gateway/Recall`, body: {rail: 'PAPSS', ...form}}), [baseUrl, form]);
    const statusRequest = useMemo(() => ({method: 'GET', url: `${baseUrl}/api/v1/Gateway/Recall/${encodeURIComponent(requestId.trim())}`}), [baseUrl, requestId]);
    const closeRequest = useMemo(() => ({method: 'POST', url: `${baseUrl}/api/v1/Gateway/Recall/${encodeURIComponent(requestId.trim())}/Close`, body: {reason: closeReason}}), [baseUrl, requestId, closeReason]);
    const payload = useMemo(() => {
        const mappings = endpoints?.RecallRequest?.fieldMappings;
        if (!mappings) return null;
        const values: Record<string, string> = {Rail: 'PAPSS', TxId: form.txId, EndToEndId: form.endToEndId, Reason: form.reason, RecallId: form.recallId};
        return Object.fromEntries(mappings.map(mapping => [mapping.userField, values[mapping.internalField] ?? '']));
    }, [endpoints, form]);
    const update = (key: keyof RecallForm) => (event: React.ChangeEvent<HTMLInputElement>) => setForm(previous => ({...previous, [key]: event.target.value}));

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!payload || (!form.txId.trim() && !form.endToEndId.trim()) || loading) return;
        setLoading(true); setError(''); setResponse(null); setStatus(null); setViewer(null);
        try { const result = await axiosPrivate.post('/api/v1/Gateway/Recall', payload); setResponse(result.data); }
        catch (requestError) { setError(errorText(requestError, 'Unable to create the PAPSS recall.')); }
        finally { setLoading(false); }
    };
    const lookup = async () => {
        if (!requestId.trim() || statusLoading) return;
        setStatusLoading(true); setStatusError(''); setStatus(null); setViewer(null);
        try { const result = await axiosPrivate.get(statusRequest.url); setStatus(result.data); }
        catch (requestError) { setStatusError(errorText(requestError, 'Unable to retrieve the recall status.')); }
        finally { setStatusLoading(false); }
    };
    const close = async () => {
        if (!requestId.trim() || !closeReason.trim() || closeLoading) return;
        setCloseLoading(true); setCloseError('');
        try { const result = await axiosPrivate.post(`/api/v1/Gateway/Recall/${encodeURIComponent(requestId.trim())}/Close`, {reason: closeReason}); setStatus(result.data); setCloseReason(''); }
        catch (requestError) { setCloseError(errorText(requestError, 'Unable to close the recall.')); }
        finally { setCloseLoading(false); }
    };

    return <RoleGuard allowedRoles={['gateway', 'recon']}><div className={`${sharedStyles.container} ${styles.page}`}>
        <header className={styles.header}><div><h1 className={sharedStyles.mainTitle}>Create PAPSS Recall</h1><p className={sharedStyles.subTitle}>Recall a settled outbound PAPSS payment and follow its outcome.</p></div></header>
        <section className={styles.card}><h2>Recall payment</h2>{endpointsError && <p className={styles.error}>{endpointsError}</p>}<form onSubmit={submit}><div className={styles.filterGrid}><Input label="Transaction ID" type="text" value={form.txId} disabled={loading} onChange={update('txId')} /><Input label="End-to-end ID" type="text" value={form.endToEndId} disabled={loading} onChange={update('endToEndId')} /><Input label="Recall reason" type="text" value={form.reason} required disabled={loading} onChange={update('reason')} /><Input label="Recall ID (optional)" type="text" value={form.recallId} disabled={loading} onChange={update('recallId')} /></div><p className={sharedStyles.helpText}>Provide either a transaction ID or an end-to-end ID.</p><div className={styles.actions}><ActionButton type="submit" disabled={loading || endpointsLoading || !payload || (!form.txId.trim() && !form.endToEndId.trim()) || !form.reason.trim()}>{loading ? 'Submitting…' : 'Create Recall'}</ActionButton></div></form>{error && <p className={styles.error} role="alert">{error}</p>}</section>
        {response !== null && <section className={styles.result}><div className={styles.resultHeader}><h2>Recall admission</h2><span>POST</span></div><pre>{JSON.stringify(response, null, 2)}</pre><div className={styles.actions}><ActionButton className={styles.secondary} onClick={() => setViewer('request')}>View Request JSON</ActionButton><ActionButton className={styles.secondary} onClick={() => setViewer('response')}>View Response JSON</ActionButton><ActionButton onClick={() => void lookup()} disabled={statusLoading}>{statusLoading ? 'Checking…' : 'Check Recall Status'}</ActionButton></div></section>}
        {(status !== null || Boolean(statusError)) && <section className={styles.result}><div className={styles.resultHeader}><h2>Recall status</h2><span>GET</span></div>{status !== null && <pre>{JSON.stringify(status, null, 2)}</pre>}{statusError && <p className={styles.error}>{statusError}</p>}<div className={styles.actions}><ActionButton className={styles.secondary} onClick={() => setViewer('status-request')}>View Status Request</ActionButton><ActionButton className={styles.secondary} onClick={() => setViewer('status-response')} disabled={status === null}>View Status Response</ActionButton></div><div className={styles.inlineForm}><Input label="Close reason" type="text" value={closeReason} required disabled={closeLoading} onChange={event => setCloseReason(event.target.value)} /><ActionButton onClick={() => void close()} disabled={closeLoading || !closeReason.trim() || !requestId.trim()}>{closeLoading ? 'Closing…' : 'Close Recall'}</ActionButton></div>{closeError && <p className={styles.error}>{closeError}</p>}</section>}
        <QRDataViewer isOpen={viewer === 'request'} data={payload ? {method: 'POST', url: request.url, body: payload} : request} rawResponse title="PAPSS Recall Request" onClose={() => setViewer(null)} /><QRDataViewer isOpen={viewer === 'response'} data={response} rawResponse title="PAPSS Recall Response" onClose={() => setViewer(null)} /><QRDataViewer isOpen={viewer === 'status-request'} data={statusRequest} rawResponse title="PAPSS Recall Status Request" onClose={() => setViewer(null)} /><QRDataViewer isOpen={viewer === 'status-response'} data={status} rawResponse title="PAPSS Recall Status Response" onClose={() => setViewer(null)} />
    </div></RoleGuard>;
}
