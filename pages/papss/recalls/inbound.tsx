import React, {useState} from 'react';
import {isAxiosError} from 'axios';
import Input from '../../../component/common/Input/Input';
import ActionButton from '../../../component/common/ActionButton/ActionButton';
import QRDataViewer from '../../../component/ScanToPay/QRDataViewer/QRDataViewer';
import RoleGuard from '../../../auth/RoleGuard';
import useAxiosPrivate from '../../../api/hooks/useAxiosPrivate';
import {useAuthentication} from '../../../auth/AuthProvider';
import sharedStyles from '../../../component/RequestForm/SharedStyles.module.css';
import styles from '../../../styles/PapssOperations.module.css';

const errorText = (error: unknown, fallback: string) => { const data = isAxiosError(error) ? error.response?.data : null; return typeof data?.message === 'string' ? data.message : error instanceof Error ? error.message : fallback; };
const read = (row: Record<string, unknown>, key: string) => row[key] ?? row[key[0].toUpperCase() + key.slice(1)] ?? '—';

export default function PapssInboundRecallsPage() {
    const axiosPrivate = useAxiosPrivate();
    const {config} = useAuthentication();
    const [limit, setLimit] = useState('50');
    const [rows, setRows] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
    const [decision, setDecision] = useState<'ACCEPT' | 'REJECT' | null>(null);
    const [reason, setReason] = useState('');
    const [decisionLoading, setDecisionLoading] = useState(false);
    const [decisionError, setDecisionError] = useState('');
    const [viewer, setViewer] = useState<'list-request' | 'list-response' | 'detail-request' | 'detail-response' | 'decision-request' | 'decision-response' | null>(null);
    const baseUrl = config?.api.baseUrl?.replace(/\/$/, '') ?? '';
    const listRequest = {method: 'GET', url: `${baseUrl}/api/v1/Gateway/Recall/Inbound?limit=${encodeURIComponent(limit)}`};
    const recallId = String(selected ? read(selected, 'recallId') : '');
    const detailRequest = {method: 'GET', url: `${baseUrl}/api/v1/Gateway/Recall/Inbound/${encodeURIComponent(recallId)}`};
    const decisionRequest = {method: 'POST', url: `${baseUrl}/api/v1/Gateway/Recall/Inbound/${encodeURIComponent(recallId)}/Decision`, body: {decision, reason: reason || undefined}};
    const load = async () => { const value = Number(limit); if (!Number.isInteger(value) || value < 1 || value > 500 || loading) return; setLoading(true); setError(''); setViewer(null); try { const result = await axiosPrivate.get(listRequest.url); setRows(Array.isArray(result.data) ? result.data : []); } catch (requestError) { setError(errorText(requestError, 'Unable to load inbound recalls.')); } finally { setLoading(false); } };
    const loadDetails = async (row: Record<string, unknown>) => { const id = String(read(row, 'recallId')); if (!id) return; setSelected(row); setDecision(null); setDecisionError(''); try { const result = await axiosPrivate.get(`${baseUrl}/api/v1/Gateway/Recall/Inbound/${encodeURIComponent(id)}`); setSelected(result.data); } catch (requestError) { setDecisionError(errorText(requestError, 'Unable to load recall details.')); } };
    const submitDecision = async () => { if (!recallId || !decision || decisionLoading || (decision === 'REJECT' && !reason.trim())) return; setDecisionLoading(true); setDecisionError(''); setViewer(null); try { const result = await axiosPrivate.post(`/api/v1/Gateway/Recall/Inbound/${encodeURIComponent(recallId)}/Decision`, {decision, ...(reason.trim() ? {reason: reason.trim()} : {})}); setSelected(result.data); setDecision(null); setReason(''); await load(); } catch (requestError) { setDecisionError(errorText(requestError, 'Unable to submit the recall decision.')); } finally { setDecisionLoading(false); } };
    return <RoleGuard allowedRoles={['gateway', 'recon']}><div className={`${sharedStyles.container} ${styles.page}`}>
        <header className={styles.header}><div><h1 className={sharedStyles.mainTitle}>Inbound PAPSS Recalls</h1><p className={sharedStyles.subTitle}>Review recalls received from other institutions and decide whether to accept or reject them.</p></div></header>
        <section className={styles.card}><div className={styles.inlineForm}><Input label="Maximum recalls" type="number" value={limit} disabled={loading} onChange={event => setLimit(event.target.value)} /><ActionButton onClick={() => void load()} disabled={loading}>{loading ? 'Loading…' : 'Load Inbound Recalls'}</ActionButton></div>{error && <p className={styles.error}>{error}</p>}</section>
        <section className={styles.result}><div className={styles.resultHeader}><h2>Pending inbound recalls</h2><span>{rows.length}</span></div><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Recall ID</th><th>Transaction ID</th><th>End-to-end ID</th><th>Reason</th><th>Outcome</th><th>Action</th></tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={6}>No pending inbound recalls.</td></tr> : rows.map((row, index) => <tr key={`${String(read(row, 'recallId'))}-${index}`}><td>{String(read(row, 'recallId'))}</td><td>{String(read(row, 'txId'))}</td><td>{String(read(row, 'endToEndId'))}</td><td>{String(read(row, 'reason'))}</td><td>{String(read(row, 'papssOutcome'))}</td><td><ActionButton onClick={() => void loadDetails(row)}>Review</ActionButton></td></tr>)}</tbody></table></div><div className={styles.actions}><ActionButton className={styles.secondary} onClick={() => setViewer('list-request')}>View List Request</ActionButton><ActionButton className={styles.secondary} onClick={() => setViewer('list-response')} disabled={rows.length === 0}>View List Response</ActionButton></div></section>
        {selected && <section className={styles.card}><div className={styles.resultHeader}><h2>Recall details</h2><span>GET</span></div><pre>{JSON.stringify(selected, null, 2)}</pre><div className={styles.actions}><ActionButton className={styles.secondary} onClick={() => setViewer('detail-request')}>View Detail Request</ActionButton><ActionButton className={styles.secondary} onClick={() => setViewer('detail-response')}>View Detail Response</ActionButton></div><div className={styles.actions}><ActionButton onClick={() => {setDecision('ACCEPT'); setReason('');}}>Accept Recall</ActionButton><ActionButton className={styles.secondary} onClick={() => setDecision('REJECT')}>Reject Recall</ActionButton></div>{decision && <div className={styles.inlineForm}><Input label={decision === 'REJECT' ? 'Rejection reason code' : 'Reason (optional)'} type="text" value={reason} required={decision === 'REJECT'} disabled={decisionLoading} onChange={event => setReason(event.target.value)} /><ActionButton onClick={() => void submitDecision()} disabled={decisionLoading || (decision === 'REJECT' && !reason.trim())}>{decisionLoading ? 'Submitting…' : `Confirm ${decision}`}</ActionButton></div>}{decisionError && <p className={styles.error}>{decisionError}</p>}</section>}
        <QRDataViewer isOpen={viewer === 'list-request'} data={listRequest} rawResponse title="Inbound Recalls List Request" onClose={() => setViewer(null)} /><QRDataViewer isOpen={viewer === 'list-response'} data={rows} rawResponse title="Inbound Recalls List Response" onClose={() => setViewer(null)} /><QRDataViewer isOpen={viewer === 'detail-request'} data={detailRequest} rawResponse title="Inbound Recall Detail Request" onClose={() => setViewer(null)} /><QRDataViewer isOpen={viewer === 'detail-response'} data={selected} rawResponse title="Inbound Recall Detail Response" onClose={() => setViewer(null)} /><QRDataViewer isOpen={viewer === 'decision-request'} data={decisionRequest} rawResponse title="Inbound Recall Decision Request" onClose={() => setViewer(null)} />
    </div></RoleGuard>;
}
