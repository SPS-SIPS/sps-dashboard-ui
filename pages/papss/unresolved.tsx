import React, {useState} from 'react';
import {FiCheck, FiSettings, FiX} from 'react-icons/fi';
import {isAxiosError} from 'axios';
import Input from '../../component/common/Input/Input';
import SelectInput from '../../component/common/SelectInput/SelectInput';
import ActionButton from '../../component/common/ActionButton/ActionButton';
import RoleGuard from '../../auth/RoleGuard';
import useAxiosPrivate from '../../api/hooks/useAxiosPrivate';
import {useAuthentication} from '../../auth/AuthProvider';
import sharedStyles from '../../component/RequestForm/SharedStyles.module.css';
import styles from '../../styles/TransactionsList.module.css';
import positionStyles from '../../styles/PapssPositions.module.css';
import ExcelExport from '../../component/ExcelExport/excel-export';

type EventRecord = Record<string, any>;
const columns = ['receivedAt','eventType','messageType','sourceMessageId','status','reasonCode','correlation','originalMessageId','originalMessageType','originalTxId','originalEndToEndId','amount','currency','amountSource','categoryPurposeSource','disposition','attached'].map(id => ({id, label: id.replace(/([A-Z])/g, ' $1').replace(/^./, value => value.toUpperCase())}));

const eventTypeOptions = [
    {value: 'PAYMENT_STATUS', label: 'Payment status'},
    {value: 'RETURN_RECEIVED', label: 'Return received'},
    {value: 'RECALL_STATUS', label: 'Recall status'},
    {value: 'RECALL_RESOLUTION', label: 'Recall resolution'},
];
const messageTypeOptions = [
    {value: 'pacs.002.001.12', label: 'Payment status (pacs.002)'},
    {value: 'pacs.004.001.11', label: 'Payment return (pacs.004)'},
    {value: 'camt.029.001.09', label: 'Recall resolution (camt.029)'},
];
const statusOptions = [
    {value: 'ACCP', label: 'Accepted'},
    {value: 'ACSP', label: 'Accepted for settlement'},
    {value: 'ACSC', label: 'Completed'},
    {value: 'PDNG', label: 'Pending'},
    {value: 'RJCT', label: 'Rejected'},
    {value: 'UNKNOWN', label: 'Unknown'},
];
const dispositionOptions = [
    {value: 'UNCORRELATED', label: 'Uncorrelated'},
    {value: 'CONFLICT', label: 'Conflict'},
    {value: 'UNKNOWN_STATUS', label: 'Unknown status'},
];
const correlationOptions = [
    {value: 'MSG_ID', label: 'Message ID'},
    {value: 'TX_ID', label: 'Transaction ID'},
    {value: 'NONE', label: 'No match'},
    {value: 'MISMATCH', label: 'Mismatch'},
];

export default function PapssUnresolvedPage() {
    const {config} = useAuthentication();
    const axiosPrivate = useAxiosPrivate();
    const [limit, setLimit] = useState('50');
    const [events, setEvents] = useState<EventRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({eventType: '', messageType: '', status: '', disposition: '', correlation: '', txId: '', endToEndId: ''});
    const [settings, setSettings] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>(() => columns.map(column => column.id));
    const baseUrl = config?.api.baseUrl?.replace(/\/$/, '') ?? '';
    const requestUrl = `${baseUrl}/api/v1/Gateway/Operations/Unresolved?limit=${encodeURIComponent(limit)}`;

    const loadEvents = async (event?: React.FormEvent) => {
        event?.preventDefault();
        const requestedLimit = Number(limit);
        if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 500 || loading) return;
        setLoading(true); setError('');
        try {
            const result = await axiosPrivate.get(requestUrl);
            setEvents(Array.isArray(result.data) ? result.data : []);
        } catch (requestError) {
            const data = isAxiosError(requestError) ? requestError.response?.data : null;
            setEvents([]);
            setError(typeof data?.message === 'string' ? data.message : requestError instanceof Error ? requestError.message : 'Unable to retrieve unresolved PAPSS events.');
        } finally { setLoading(false); }
    };

    const filteredEvents = events.filter(item => {
        const matches = (key: string, filter: string) => !filter || String(item[key] ?? '').toLowerCase().includes(filter.toLowerCase());
        const selectedStatus = filters.status === 'UNKNOWN' ? !['ACCP', 'ACSP', 'ACSC', 'PDNG', 'RJCT'].includes(String(item.status ?? '').toUpperCase()) : filters.status;
        return matches('eventType', filters.eventType) && matches('messageType', filters.messageType) && (!selectedStatus || String(item.status ?? '').toUpperCase() === selectedStatus) && matches('disposition', filters.disposition) && matches('correlation', filters.correlation) && matches('originalTxId', filters.txId) && matches('originalEndToEndId', filters.endToEndId);
    });
    const toggleColumn = (id: string) => setVisibleColumns(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]);

    return <RoleGuard allowedRoles={['gateway', 'recon']}><div className={styles.container}>
        <div className={styles.header}><div><h2 className={styles.title}>Unresolved PAPSS Events</h2><p>Review unresolved PAPSS status events that need reconciliation.</p></div><button onClick={() => setSettings(!settings)} className={styles.settingsButton} title="Column settings"><FiSettings /></button></div>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <div className={styles.searchContainer}><div className={`${styles.searchInputRow} ${positionStyles.unresolvedFilterRow}`}><SelectInput label="Event type" value={filters.eventType} options={eventTypeOptions} placeholder="All event types" onChange={event => setFilters(previous => ({...previous, eventType: event.target.value}))}/><SelectInput label="Message type" value={filters.messageType} options={messageTypeOptions} placeholder="All message types" onChange={event => setFilters(previous => ({...previous, messageType: event.target.value}))}/><SelectInput label="Status" value={filters.status} options={statusOptions} placeholder="All statuses" onChange={event => setFilters(previous => ({...previous, status: event.target.value}))}/></div><div className={`${styles.searchInputRow} ${positionStyles.unresolvedFilterRow}`}><SelectInput label="Disposition" value={filters.disposition} options={dispositionOptions} placeholder="All dispositions" onChange={event => setFilters(previous => ({...previous, disposition: event.target.value}))}/><SelectInput label="Correlation" value={filters.correlation} options={correlationOptions} placeholder="All correlations" onChange={event => setFilters(previous => ({...previous, correlation: event.target.value}))}/><Input label="Transaction ID" value={filters.txId} type="text" onChange={event => setFilters(previous => ({...previous, txId: event.target.value}))}/><Input label="End-to-end ID" value={filters.endToEndId} type="text" onChange={event => setFilters(previous => ({...previous, endToEndId: event.target.value}))}/></div><div className={positionStyles.positionControls}><div className={positionStyles.positionInput}><Input label="Maximum events" value={limit} type="number" required disabled={loading} onChange={event => setLimit(event.target.value)}/></div><div className={`${styles.actionButtons} ${positionStyles.compactActions}`}><ActionButton type="submit" onClick={() => void loadEvents()} className={positionStyles.loadButton} disabled={loading || !Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 500}>{loading ? 'Loading…' : 'Load Events'}</ActionButton><ExcelExport data={filteredEvents} columns={columns} visibleColumns={visibleColumns} fileName="papss_unresolved_events" disabled={loading || filteredEvents.length === 0} metadata={{title: 'PAPSS Unresolved Events Export', totalRecords: filteredEvents.length}}/></div></div></div>
        {settings && <div className={styles.columnSettings}><h3>Visible Columns</h3><div className={styles.columnOptions}>{columns.map(column => <label key={column.id} className={styles.columnOption}><span>{column.label}</span><button onClick={() => toggleColumn(column.id)} className={`${styles.toggleButton} ${visibleColumns.includes(column.id) ? styles.active : ''}`}>{visibleColumns.includes(column.id) ? <FiCheck /> : <FiX />}</button></label>)}</div></div>}
        <section aria-live="polite">
            <div className={styles.filterControlsRow}><h3>{filteredEvents.length} event{filteredEvents.length === 1 ? '' : 's'}</h3></div>
            {filteredEvents.length === 0 ? <p>No unresolved events match the current filters.</p> : <div className={styles.tableWrapper}><table className={styles.table}><thead className={styles.tableHeader}><tr>{visibleColumns.map(id => <th key={id}>{columns.find(column => column.id === id)?.label}</th>)}</tr></thead><tbody>{filteredEvents.map((item, index) => <tr key={`${item.sourceMessageId ?? 'event'}-${index}`} className={styles.tableRow}>{visibleColumns.map(id => <td key={`${index}-${id}`}>{id === 'attached' ? (item[id] === true ? 'Yes' : 'No') : item[id] ?? item.note ?? '—'}</td>)}</tr>)}</tbody></table></div>}
        </section>
    </div></RoleGuard>;
}


