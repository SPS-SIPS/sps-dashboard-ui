import React, {useState} from 'react';
import {FiCheck, FiSettings, FiX} from 'react-icons/fi';
import {isAxiosError} from 'axios';
import Input from '../../component/common/Input/Input';
import ActionButton from '../../component/common/ActionButton/ActionButton';
import RoleGuard from '../../auth/RoleGuard';
import useAxiosPrivate from '../../api/hooks/useAxiosPrivate';
import {useAuthentication} from '../../auth/AuthProvider';
import ExcelExport from '../../component/ExcelExport/excel-export';
import styles from '../../styles/TransactionsList.module.css';
import positionStyles from '../../styles/PapssPositions.module.css';

type Position = Record<string, any>;
const columns = [
    {id: 'processedAt', label: 'Processed'}, {id: 'receivedAt', label: 'Received'}, {id: 'messageSequence', label: 'Sequence'}, {id: 'messageId', label: 'Message ID'},
    {id: 'openingBalance', label: 'Opening Balance'}, {id: 'closingBalance', label: 'Closing Balance'}, {id: 'totalSent', label: 'Total Sent'}, {id: 'totalReceived', label: 'Total Received'},
    {id: 'total', label: 'Total'}, {id: 'possibleDuplicate', label: 'Duplicate'}, {id: 'remainingOutputs', label: 'Remaining Outputs'},
];
const display = (item: Position, ...keys: string[]) => { const value = keys.reduce<any>((found, key) => found ?? item[key], undefined); return value === undefined || value === null || value === '' ? '—' : String(value); };
const nested = (item: Position, parent: string, key: string) => { const object = item[parent] ?? item[parent[0].toUpperCase() + parent.slice(1)]; const value = object?.[key] ?? object?.[key[0].toUpperCase() + key.slice(1)]; return value === undefined || value === null ? '—' : String(value); };
const balance = (item: Position, parent: string) => { const amount = nested(item, parent, 'amount'); const currency = nested(item, parent, 'currency'); return amount === '—' ? '—' : `${amount}${currency === '—' ? '' : ` ${currency}`}`; };
const total = (item: Position, parent: string) => `${balance(item, parent)} · ${nested(item, parent, 'count')} tx`;

export default function PapssPositionsPage() {
    const {config} = useAuthentication(); const axiosPrivate = useAxiosPrivate();
    const [limit, setLimit] = useState('20'); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [response, setResponse] = useState<unknown>(null); const [settings, setSettings] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>(() => { if (typeof window === 'undefined') return columns.map(column => column.id); const stored = localStorage.getItem('papss_positions_visible_columns'); return stored ? JSON.parse(stored) : columns.map(column => column.id); });
    const baseUrl = config?.api.baseUrl?.replace(/\/$/, '') ?? '';
    const requestUrl = `${baseUrl}/api/v1/Gateway/PAPSS/Positions?limit=${encodeURIComponent(limit)}`;
    const positions = Array.isArray(response) ? response : response && typeof response === 'object' ? ((response as Position).positions ?? (response as Position).Positions ?? []) : [];
    const loadPositions = async (event?: React.FormEvent) => { event?.preventDefault(); const requestedLimit = Number(limit); if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 500 || loading) return; setLoading(true); setError(''); setResponse(null); try { const result = await axiosPrivate.get(requestUrl); setResponse(result.data); } catch (requestError) { const data = isAxiosError(requestError) ? requestError.response?.data : null; setResponse(data ?? null); setError(typeof data?.message === 'string' ? data.message : requestError instanceof Error ? requestError.message : 'Unable to retrieve PAPSS positions.'); } finally { setLoading(false); } };
    const toggleColumn = (id: string) => setVisibleColumns(previous => { const next = previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]; localStorage.setItem('papss_positions_visible_columns', JSON.stringify(next)); return next; });
    const cell = (item: Position, id: string) => id === 'openingBalance' || id === 'closingBalance' ? balance(item, id) : id === 'totalSent' || id === 'totalReceived' || id === 'total' ? total(item, id) : display(item, id);
    return <RoleGuard allowedRoles={['gateway', 'recon']}><div className={styles.container}>
        <div className={styles.header}><div><h2 className={styles.title}>PAPSS Positions</h2><p>View the latest PAPSS position snapshots for your institution.</p></div><button onClick={() => setSettings(!settings)} className={styles.settingsButton} title="Column settings"><FiSettings /></button></div>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <div className={styles.searchContainer}><div className={positionStyles.positionControls}><div className={positionStyles.positionInput}><Input label="Maximum snapshots" value={limit} type="number" required disabled={loading} onChange={event => setLimit(event.target.value)}/></div><div className={`${styles.actionButtons} ${positionStyles.compactActions}`}><ActionButton onClick={() => void loadPositions()} className={positionStyles.loadButton} disabled={loading || !Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 500}>{loading ? 'Loading…' : 'Load Positions'}</ActionButton><ExcelExport data={positions} columns={columns} visibleColumns={visibleColumns} fileName="papss_positions" disabled={loading || positions.length === 0} metadata={{title: 'PAPSS Positions Export', totalRecords: positions.length}}/></div></div></div>
        {settings && <div className={styles.columnSettings}><h3>Visible Columns</h3><div className={styles.columnOptions}>{columns.map(column => <label key={column.id} className={styles.columnOption}><span>{column.label}</span><button onClick={() => toggleColumn(column.id)} className={`${styles.toggleButton} ${visibleColumns.includes(column.id) ? styles.active : ''}`}>{visibleColumns.includes(column.id) ? <FiCheck /> : <FiX />}</button></label>)}</div></div>}
        {loading && !response ? <div className={styles.loadingMessage}>Loading positions...</div> : response !== null && <div className={styles.tableWrapper}><table className={styles.table}><thead className={styles.tableHeader}><tr>{visibleColumns.map(id => <th key={id}>{columns.find(column => column.id === id)?.label}</th>)}</tr></thead><tbody>{positions.map((item: Position, index: number) => <tr key={`${display(item, 'messageId', 'MessageId')}-${index}`} className={styles.tableRow}>{visibleColumns.map(id => <td key={`${index}-${id}`}>{cell(item, id)}</td>)}</tr>)}</tbody></table></div>}
    </div></RoleGuard>;
}
