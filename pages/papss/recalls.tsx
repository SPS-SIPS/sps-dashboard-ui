import React, {useMemo, useState} from 'react';
import {isAxiosError} from 'axios';
import Input from '../../component/common/Input/Input';
import SelectInput from '../../component/common/SelectInput/SelectInput';
import ActionButton from '../../component/common/ActionButton/ActionButton';
import QRDataViewer from '../../component/ScanToPay/QRDataViewer/QRDataViewer';
import RoleGuard from '../../auth/RoleGuard';
import useAxiosPrivate from '../../api/hooks/useAxiosPrivate';
import useEndpoints from '../../api/hooks/useEndpoints';
import {useAuthentication} from '../../auth/AuthProvider';
import sharedStyles from '../../component/RequestForm/SharedStyles.module.css';
import styles from '../../styles/PapssOperations.module.css';

type Panel = 'create' | 'inbound';
type RecallForm = {txId: string; endToEndId: string; reason: string; recallId: string};
type RecordValue = Record<string, unknown>;
const initialForm: RecallForm = {txId: '', endToEndId: '', reason: '', recallId: ''};
const recallReasonSuggestions = [
    {value: 'DUPL', label: 'Duplicate payment'},
    {value: 'FRAD', label: 'Fraudulent payment'},
    {value: 'AC04', label: 'Closed account'},
    {value: 'AM04', label: 'Insufficient funds'},
    {value: 'CUST', label: 'Customer decision'},
    {value: 'AGNT', label: 'Agent decision'},
    {value: 'LEGL', label: 'Legal decision'},
];
const inboundRejectionReasons = [
    {value: 'LEGL', label: 'Legal decision (LEGL)'},
    {value: 'AGNT', label: 'Agent decision (AGNT)'},
    {value: 'CUST', label: 'Customer decision (CUST)'},
    {value: 'ARDT', label: 'Already returned (ARDT)'},
    {value: 'NOAS', label: 'No answer from customer (NOAS)'},
    {value: 'NOOR', label: 'No original transaction received (NOOR)'},
    {value: 'AC04', label: 'Closed account (AC04)'},
    {value: 'AM04', label: 'Insufficient funds (AM04)'},
];
const errorText = (error: unknown, fallback: string) => { const data = isAxiosError(error) ? error.response?.data : null; return typeof data?.message === 'string' ? data.message : error instanceof Error ? error.message : fallback; };
const read = (row: RecordValue, key: string) => row[key] ?? row[key[0].toUpperCase() + key.slice(1)] ?? '—';

export default function PapssRecallsPage() {
    const axiosPrivate = useAxiosPrivate();
    const {config} = useAuthentication();
    const {endpoints, loading: endpointsLoading, error: endpointsError} = useEndpoints();
    const [panel, setPanel] = useState<Panel>('create');
    const [form, setForm] = useState<RecallForm>(initialForm);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createResponse, setCreateResponse] = useState<unknown>(null);
    const [status, setStatus] = useState<unknown>(null);
    const [statusLoading, setStatusLoading] = useState(false);
    const [statusError, setStatusError] = useState('');
    const [closeReason, setCloseReason] = useState('');
    const [closeLoading, setCloseLoading] = useState(false);
    const [closeError, setCloseError] = useState('');
    const [limit, setLimit] = useState('50');
    const [rows, setRows] = useState<RecordValue[]>([]);
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState('');
    const [selected, setSelected] = useState<RecordValue | null>(null);
    const [decision, setDecision] = useState<'ACCEPT' | 'REJECT' | null>(null);
    const [decisionReason, setDecisionReason] = useState('');
    const [decisionLoading, setDecisionLoading] = useState(false);
    const [decisionError, setDecisionError] = useState('');
    const [viewer, setViewer] = useState<'request' | 'response' | 'status-request' | 'status-response' | 'list-request' | 'list-response' | 'detail-request' | 'detail-response' | 'decision-request' | 'decision-response' | null>(null);
    const baseUrl = config?.api.baseUrl?.replace(/\/$/, '') ?? '';
    const requestId = typeof createResponse === 'object' && createResponse !== null ? String((createResponse as RecordValue).requestMessageId ?? '') : form.recallId;
    const request = useMemo(() => ({method: 'POST', url: `${baseUrl}/api/v1/Gateway/Recall`, body: {rail: 'PAPSS', ...form}}), [baseUrl, form]);
    const statusRequest = useMemo(() => ({method: 'GET', url: `${baseUrl}/api/v1/Gateway/Recall/${encodeURIComponent(requestId.trim())}`}), [baseUrl, requestId]);
    const listRequest = useMemo(() => ({method: 'GET', url: `${baseUrl}/api/v1/Gateway/Recall/Inbound?limit=${encodeURIComponent(limit)}`}), [baseUrl, limit]);
    const recallId = String(selected ? read(selected, 'recallId') : '');
    const detailRequest = useMemo(() => ({method: 'GET', url: `${baseUrl}/api/v1/Gateway/Recall/Inbound/${encodeURIComponent(recallId)}`}), [baseUrl, recallId]);
    const decisionRequest = useMemo(() => ({method: 'POST', url: `${baseUrl}/api/v1/Gateway/Recall/Inbound/${encodeURIComponent(recallId)}/Decision`, body: {decision, reason: decisionReason || undefined}}), [baseUrl, recallId, decision, decisionReason]);
    const payload = useMemo(() => {
        const mappings = endpoints?.RecallRequest?.fieldMappings;
        if (!mappings) return null;
        const values: Record<string, string> = {Rail: 'PAPSS', TxId: form.txId, EndToEndId: form.endToEndId, Reason: form.reason, RecallId: form.recallId};
        return Object.fromEntries(mappings.map(mapping => [mapping.userField, values[mapping.internalField] ?? '']));
    }, [endpoints, form]);
    const update = (key: keyof RecallForm) => (event: React.ChangeEvent<HTMLInputElement>) => setForm(previous => ({...previous, [key]: event.target.value}));

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!payload || (!form.txId.trim() && !form.endToEndId.trim()) || !form.reason.trim() || createLoading) return;
        setCreateLoading(true); setCreateError(''); setCreateResponse(null); setStatus(null); setViewer(null);
        try { const result = await axiosPrivate.post('/api/v1/Gateway/Recall', payload); setCreateResponse(result.data); }
        catch (error) { setCreateError(errorText(error, 'Unable to create the PAPSS recall.')); }
        finally { setCreateLoading(false); }
    };
    const lookup = async () => {
        if (!requestId.trim() || statusLoading) return;
        setStatusLoading(true); setStatusError(''); setStatus(null); setViewer(null);
        try { const result = await axiosPrivate.get(statusRequest.url); setStatus(result.data); }
        catch (error) { setStatusError(errorText(error, 'Unable to retrieve the recall status.')); }
        finally { setStatusLoading(false); }
    };
    const close = async () => {
        if (!requestId.trim() || !closeReason.trim() || closeLoading) return;
        setCloseLoading(true); setCloseError('');
        try { const result = await axiosPrivate.post(`/api/v1/Gateway/Recall/${encodeURIComponent(requestId.trim())}/Close`, {reason: closeReason}); setStatus(result.data); setCloseReason(''); }
        catch (error) { setCloseError(errorText(error, 'Unable to close the recall.')); }
        finally { setCloseLoading(false); }
    };
    const load = async () => {
        const value = Number(limit); if (!Number.isInteger(value) || value < 1 || value > 500 || listLoading) return;
        setListLoading(true); setListError(''); setViewer(null);
        try { const result = await axiosPrivate.get(listRequest.url); setRows(Array.isArray(result.data) ? result.data : []); }
        catch (error) { setListError(errorText(error, 'Unable to load inbound recalls.')); }
        finally { setListLoading(false); }
    };
    const loadDetails = async (row: RecordValue) => {
        const id = String(read(row, 'recallId')); if (!id) return;
        setSelected(row); setDecision(null); setDecisionError('');
        try { const result = await axiosPrivate.get(`${baseUrl}/api/v1/Gateway/Recall/Inbound/${encodeURIComponent(id)}`); setSelected(result.data); }
        catch (error) { setDecisionError(errorText(error, 'Unable to load recall details.')); }
    };
    const submitDecision = async () => {
        if (!recallId || !decision || decisionLoading || (decision === 'REJECT' && !decisionReason.trim())) return;
        setDecisionLoading(true); setDecisionError(''); setViewer(null);
        try { const result = await axiosPrivate.post(`/api/v1/Gateway/Recall/Inbound/${encodeURIComponent(recallId)}/Decision`, {decision, ...(decisionReason.trim() ? {reason: decisionReason.trim()} : {})}); setSelected(result.data); setDecision(null); setDecisionReason(''); await load(); }
        catch (error) { setDecisionError(errorText(error, 'Unable to submit the recall decision.')); }
        finally { setDecisionLoading(false); }
    };

    return <RoleGuard allowedRoles={['gateway', 'recon']}><div className={`${sharedStyles.container} ${styles.page}`}>
        <header className={styles.header}><div><h1 className={sharedStyles.mainTitle}>PAPSS Recalls</h1><p className={sharedStyles.subTitle}>Create outbound recalls or review inbound recalls.</p></div></header>
        <div className={styles.panelChooser} role="tablist" aria-label="PAPSS recall actions">
            <button type="button" role="tab" aria-selected={panel === 'create'} className={`${styles.panelChoice} ${panel === 'create' ? styles.panelChoiceActive : ''}`} onClick={() => setPanel('create')}><strong>Create Recall</strong><span>Recall a settled outbound PAPSS payment.</span></button>
            <button type="button" role="tab" aria-selected={panel === 'inbound'} className={`${styles.panelChoice} ${panel === 'inbound' ? styles.panelChoiceActive : ''}`} onClick={() => setPanel('inbound')}><strong>Inbound Recalls</strong><span>Review and decide on recalls from other institutions.</span></button>
        </div>
        {panel === 'create' && <>
            <section className={styles.card}><div className={styles.cardHeader}><h2>Create a PAPSS recall</h2><p>Recall a settled outbound PAPSS payment and follow its outcome.</p></div>{endpointsError && <p className={styles.error}>{endpointsError}</p>}<form onSubmit={submit}><div className={`${styles.filterGrid} ${styles.returnFormGrid}`}><Input label="Transaction ID" type="text" value={form.txId} disabled={createLoading} onChange={update('txId')} /><Input label="End-to-end ID" type="text" value={form.endToEndId} disabled={createLoading} onChange={update('endToEndId')} /><Input label="Recall reason" type="text" value={form.reason} required maxLength={4} list="papss-recall-reasons" placeholder="e.g. DUPL" disabled={createLoading} onChange={update('reason')} /><datalist id="papss-recall-reasons">{recallReasonSuggestions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</datalist><Input label="Recall ID (optional)" type="text" value={form.recallId} disabled={createLoading} onChange={update('recallId')} /></div><p className={sharedStyles.helpText}>Provide either a transaction ID or an end-to-end ID. The reason must be a 1–4 character ISO cancellation code; suggestions are provided but other valid codes are allowed.</p><div className={styles.actions}><ActionButton type="submit" disabled={createLoading || endpointsLoading || !payload || (!form.txId.trim() && !form.endToEndId.trim()) || !form.reason.trim()}>{createLoading ? 'Submitting…' : 'Create Recall'}</ActionButton></div></form>{createError && <p className={styles.error} role="alert">{createError}</p>}</section>
            {createResponse !== null && <section className={styles.result}><div className={styles.resultHeader}><h2>Recall admission</h2><span>POST</span></div><div className={styles.actions}><ActionButton className={styles.secondary} onClick={() => setViewer('request')}>View Request Payload</ActionButton><ActionButton className={styles.secondary} onClick={() => setViewer('response')}>View Response Payload</ActionButton><ActionButton onClick={() => void lookup()} disabled={statusLoading}>{statusLoading ? 'Checking…' : 'Check Recall Status'}</ActionButton></div></section>}
            {(status !== null || Boolean(statusError)) && <section className={styles.result}><div className={styles.resultHeader}><h2>Recall status</h2><span>GET</span></div>{statusError && <p className={styles.error}>{statusError}</p>}<div className={styles.actions}><ActionButton className={styles.secondary} onClick={() => setViewer('status-request')}>View Status Request</ActionButton><ActionButton className={styles.secondary} onClick={() => setViewer('status-response')} disabled={status === null}>View Status Response</ActionButton></div><div className={styles.inlineForm}><Input label="Close reason" type="text" value={closeReason} required disabled={closeLoading} onChange={event => setCloseReason(event.target.value)} /><ActionButton onClick={() => void close()} disabled={closeLoading || !closeReason.trim() || !requestId.trim()}>{closeLoading ? 'Closing…' : 'Close Recall'}</ActionButton></div>{closeError && <p className={styles.error}>{closeError}</p>}</section>}
        </>}
        {panel === 'inbound' && <>
            <section className={styles.card}><div className={styles.cardHeader}><h2>Load inbound recalls</h2><p>Review recalls received from other institutions and decide whether to accept or reject them.</p></div><div className={styles.inlineForm}><Input label="Maximum recalls" type="number" value={limit} disabled={listLoading} onChange={event => setLimit(event.target.value)} /><ActionButton onClick={() => void load()} disabled={listLoading}>{listLoading ? 'Loading…' : 'Load Inbound Recalls'}</ActionButton></div>{listError && <p className={styles.error}>{listError}</p>}</section>
            <section className={styles.result}><div className={styles.resultHeader}><h2>Pending inbound recalls</h2><span>{rows.length}</span></div><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Recall ID</th><th>Transaction ID</th><th>End-to-end ID</th><th>Reason</th><th>Outcome</th><th>Action</th></tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={6}>No pending inbound recalls.</td></tr> : rows.map((row, index) => <tr key={`${String(read(row, 'recallId'))}-${index}`}><td>{String(read(row, 'recallId'))}</td><td>{String(read(row, 'txId'))}</td><td>{String(read(row, 'endToEndId'))}</td><td>{String(read(row, 'reason'))}</td><td>{String(read(row, 'papssOutcome'))}</td><td><ActionButton onClick={() => void loadDetails(row)}>Review</ActionButton></td></tr>)}</tbody></table></div><div className={styles.actions}><ActionButton className={styles.secondary} onClick={() => setViewer('list-request')}>View List Request</ActionButton><ActionButton className={styles.secondary} onClick={() => setViewer('list-response')} disabled={rows.length === 0}>View List Response</ActionButton></div></section>
            {selected && <section className={styles.card}><div className={styles.resultHeader}><h2>Recall details</h2><span>GET</span></div><div className={styles.actions}><ActionButton className={styles.secondary} onClick={() => setViewer('detail-request')}>View Detail Request</ActionButton><ActionButton className={styles.secondary} onClick={() => setViewer('detail-response')}>View Detail Response</ActionButton></div><div className={styles.actions}><ActionButton onClick={() => {setDecision('ACCEPT'); setDecisionReason('');}}>Accept Recall</ActionButton><ActionButton className={styles.secondary} onClick={() => setDecision('REJECT')}>Reject Recall</ActionButton></div>{decision && <div className={styles.inlineForm}>{decision === 'REJECT' ? <SelectInput label="Rejection reason code" value={decisionReason} required disabled={decisionLoading} options={inboundRejectionReasons} placeholder="-- Select a rejection reason --" onChange={event => setDecisionReason(event.target.value)} /> : <Input label="Reason (optional)" type="text" value={decisionReason} disabled={decisionLoading} onChange={event => setDecisionReason(event.target.value)} />}<ActionButton onClick={() => void submitDecision()} disabled={decisionLoading || (decision === 'REJECT' && !decisionReason.trim())}>{decisionLoading ? 'Submitting…' : `Confirm ${decision}`}</ActionButton></div>}{decisionError && <p className={styles.error}>{decisionError}</p>}</section>}
        </>}
        <QRDataViewer isOpen={viewer === 'request'} data={payload ? {method: 'POST', url: request.url, body: payload} : request} rawResponse title="PAPSS Recall Request" onClose={() => setViewer(null)} /><QRDataViewer isOpen={viewer === 'response'} data={createResponse} rawResponse title="PAPSS Recall Response" onClose={() => setViewer(null)} /><QRDataViewer isOpen={viewer === 'status-request'} data={statusRequest} rawResponse title="PAPSS Recall Status Request" onClose={() => setViewer(null)} /><QRDataViewer isOpen={viewer === 'status-response'} data={status} rawResponse title="PAPSS Recall Status Response" onClose={() => setViewer(null)} /><QRDataViewer isOpen={viewer === 'list-request'} data={listRequest} rawResponse title="Inbound Recalls List Request" onClose={() => setViewer(null)} /><QRDataViewer isOpen={viewer === 'list-response'} data={rows} rawResponse title="Inbound Recalls List Response" onClose={() => setViewer(null)} /><QRDataViewer isOpen={viewer === 'detail-request'} data={detailRequest} rawResponse title="Inbound Recall Detail Request" onClose={() => setViewer(null)} /><QRDataViewer isOpen={viewer === 'detail-response'} data={selected} rawResponse title="Inbound Recall Detail Response" onClose={() => setViewer(null)} /><QRDataViewer isOpen={viewer === 'decision-request'} data={decisionRequest} rawResponse title="Inbound Recall Decision Request" onClose={() => setViewer(null)} />
    </div></RoleGuard>;
}
