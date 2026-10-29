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
import PapssPaymentStatus from '../../component/RequestForm/PapssPaymentStatus';
import ConfirmationModal from '../../component/common/ConfirmationModal/ConfirmationModal';
import {PAPSS_PURPOSE_CODES} from '../../constants/papssPurposeCodes';

type ReturnForm = {
    toBIC: string;
    lclInstrument: string;
    ctgPurp: string;
    originalAmount: string;
    originalCurrency: string;
    txId: string;
    endToEndId: string;
    reason: string;
    additionalInfo: string;
    returnId: string;
};

const initialForm: ReturnForm = {
    toBIC: '', lclInstrument: 'USDP', ctgPurp: '', originalAmount: '',
    originalCurrency: 'USD', txId: '', endToEndId: '', reason: '', additionalInfo: '', returnId: '',
};

const localInstrumentOptions = [
    {value: 'USDP', label: 'USD payment (USDP)'},
    {value: 'SSA3', label: 'Cross-currency payment (SSA3)'},
];

const returnReasonOptions = [
    {value: 'AC01', label: 'Incorrect account number (AC01)'},
    {value: 'AC04', label: 'Closed account number (AC04)'},
    {value: 'AM04', label: 'Insufficient funds (AM04)'},
    {value: 'BE05', label: 'Unrecognised initiating party (BE05)'},
    {value: 'DUPL', label: 'Duplicate payment (DUPL)'},
    {value: 'FOCR', label: 'Return by beneficiary (FOCR)'},
    {value: 'FRAD', label: 'Fraudulent payment (FRAD)'},
    {value: 'TECH', label: 'Technical problem (TECH)'},
    {value: 'NARR', label: 'Narrative reason (NARR)'},
];

const errorText = (error: unknown, fallback: string) => {
    const data = isAxiosError(error) ? error.response?.data : null;
    return typeof data?.message === 'string' ? data.message : error instanceof Error ? error.message : fallback;
};

const generateReturnId = () => {
    const bytes = new Uint8Array(12);
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
    return `SIPS-${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
};

export default function PapssReturnsPage() {
    const axiosPrivate = useAxiosPrivate();
    const {config} = useAuthentication();
    const {endpoints, loading: endpointsLoading, error: endpointsError} = useEndpoints();
    const [form, setForm] = useState<ReturnForm>(initialForm);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitResponse, setSubmitResponse] = useState<unknown>(null);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [submittedReturnId, setSubmittedReturnId] = useState('');
    const [confirmSubmit, setConfirmSubmit] = useState(false);
    const [lookupId, setLookupId] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');
    const [lookupResponse, setLookupResponse] = useState<unknown>(null);
    const [activePanel, setActivePanel] = useState<'submit' | 'lookup'>('submit');
    const [viewer, setViewer] = useState<'submit-request' | 'submit-response' | 'lookup-request' | 'lookup-response' | null>(null);
    const baseUrl = config?.api.baseUrl?.replace(/\/$/, '') ?? '';
    const lookupRequest = useMemo(() => ({method: 'GET', url: `${baseUrl}/api/v1/Gateway/Return/${encodeURIComponent(lookupId.trim())}`}), [baseUrl, lookupId]);

    const update = (key: keyof ReturnForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(previous => ({...previous, [key]: event.target.value}));
    const narrativeReason = form.reason === 'NARR';
    const updateReason = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const reason = event.target.value;
        const selectedReason = returnReasonOptions.find(option => option.value === reason);
        const reasonText = selectedReason?.label.replace(/\s*\([^)]*\)\s*$/, '') ?? '';
        setForm(previous => ({...previous, reason, additionalInfo: reasonText}));
    };

    const payload = useMemo(() => {
        if (!endpoints?.ReturnRequest?.fieldMappings) return null;
        const values: Record<string, string | number> = {
            Rail: 'PAPSS', ToBIC: form.toBIC, LocalInstrument: form.lclInstrument,
            CategoryPurpose: form.ctgPurp, OriginalAmount: Number(form.originalAmount),
            OriginalCurrency: form.originalCurrency, OriginalTxId: form.txId,
            OriginalEndToEndId: form.endToEndId, Reason: form.reason,
            AdditionalInfo: form.additionalInfo, ReturnId: form.returnId,
        };
        return Object.fromEntries(endpoints.ReturnRequest.fieldMappings.map(mapping => [mapping.userField, values[mapping.internalField] ?? '']));
    }, [endpoints, form]);
    const submitRequest = useMemo(() => ({method: 'POST', url: `${baseUrl}/api/v1/Gateway/Return`, body: payload}), [baseUrl, payload]);

    const submitReturn = (event: React.FormEvent) => {
        event.preventDefault();
        if (!payload || submitLoading) return;
        setConfirmSubmit(true);
    };

    const confirmReturn = async () => {
        setConfirmSubmit(false);
        if (!payload || submitLoading) return;
        setSubmitAttempted(true);
        setSubmitLoading(true); setSubmitError(''); setSubmitResponse(null); setSubmittedReturnId(''); setViewer(null);
        try { const result = await axiosPrivate.post('/api/v1/Gateway/Return', payload); setSubmitResponse(result.data); setSubmittedReturnId(form.returnId.trim()); setLookupId(form.returnId); }
        catch (error) {
            const data = isAxiosError(error) ? error.response?.data : null;
            setSubmitResponse(data ?? {error: errorText(error, 'Unable to submit the PAPSS return.')});
            setSubmitError(errorText(error, 'Unable to submit the PAPSS return.'));
        }
        finally { setSubmitLoading(false); }
    };

    const lookupReturn = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!lookupId.trim() || lookupLoading) return;
        setLookupLoading(true); setLookupError(''); setLookupResponse(null); setViewer(null);
        try { const result = await axiosPrivate.get(lookupRequest.url); setLookupResponse(result.data); }
        catch (error) { setLookupError(errorText(error, 'Unable to retrieve the PAPSS return.')); }
        finally { setLookupLoading(false); }
    };

    return <RoleGuard allowedRoles={['gateway', 'recon']}><div className={`${sharedStyles.container} ${styles.page}`}>
        <header className={styles.header}><div><h1 className={sharedStyles.mainTitle}>PAPSS Returns</h1><p className={sharedStyles.subTitle}>Submit a PAPSS return and look up its processing status.</p></div></header>
        <div className={styles.panelChooser} role="tablist" aria-label="PAPSS return actions">
            <button type="button" role="tab" aria-selected={activePanel === 'submit'} className={`${styles.panelChoice} ${activePanel === 'submit' ? styles.panelChoiceActive : ''}`} onClick={() => setActivePanel('submit')}>
                <strong>Submit a New Return</strong><span>Create and monitor a PAPSS return request.</span>
            </button>
            <button type="button" role="tab" aria-selected={activePanel === 'lookup'} className={`${styles.panelChoice} ${activePanel === 'lookup' ? styles.panelChoiceActive : ''}`} onClick={() => setActivePanel('lookup')}>
                <strong>Lookup Return</strong><span>Check the status of an existing Return ID.</span>
            </button>
        </div>
        {activePanel === 'submit' && <>
        <section className={styles.card}>
            <div className={styles.cardHeader}><h2>Submit a new return</h2><p>Send a return request for an existing PAPSS transaction.</p></div>
            {endpointsError && <p className={styles.error} role="alert">{endpointsError}</p>}
            <div className={styles.endpointBlock}>
                <span className={styles.endpointLabel}>Return API Endpoint<span className={styles.requiredAsterisk}>*</span></span>
                <div className={styles.endpointValue}><span className={styles.endpointMethod}>POST</span><code>{`${baseUrl}/api/v1/Gateway/Return`}</code></div>
            </div>
            <form onSubmit={submitReturn}>
                <div className={`${styles.filterGrid} ${styles.returnFormGrid}`}>
                    <Input label="Destination bank BIC" type="text" value={form.toBIC} required disabled={submitLoading} onChange={update('toBIC')} />
                    <SelectInput label="Local instrument" value={form.lclInstrument} required disabled={submitLoading} options={localInstrumentOptions} onChange={update('lclInstrument')} />
                    <SelectInput label="Category purpose" value={form.ctgPurp} required disabled={submitLoading} options={PAPSS_PURPOSE_CODES.map(option => ({value: option.value, label: `${option.label} (${option.value})`}))} placeholder="-- Select a payment purpose --" onChange={update('ctgPurp')} />
                    <Input label="Original amount" value={form.originalAmount} type="number" required disabled={submitLoading} onChange={update('originalAmount')} />
                    <Input label="Original currency" type="text" value={form.originalCurrency} required disabled={submitLoading} onChange={update('originalCurrency')} />
                    <Input label="Original transaction ID" type="text" value={form.txId} required disabled={submitLoading} onChange={update('txId')} />
                    <Input label="Original end-to-end ID" type="text" value={form.endToEndId} required disabled={submitLoading} onChange={update('endToEndId')} />
                    <div className={styles.fieldWithAction}>
                        <Input label="Return ID" type="text" value={form.returnId} required disabled={submitLoading} onChange={update('returnId')} />
                        <button type="button" className={styles.textAction} disabled={submitLoading} onClick={() => setForm(previous => ({...previous, returnId: generateReturnId()}))}>Generate random Return ID</button>
                    </div>
                    <SelectInput label="Reason" value={form.reason} required disabled={submitLoading} options={returnReasonOptions} placeholder="-- Select a return reason --" onChange={updateReason} />
                    <Input label={narrativeReason ? 'Reason details' : 'Additional information (optional)'} type="text" value={form.additionalInfo} required={narrativeReason} disabled={submitLoading} onChange={update('additionalInfo')} />
                </div>
                <div className={styles.actions}><ActionButton type="submit" disabled={submitLoading || endpointsLoading || !payload}>{submitLoading ? 'Submitting…' : 'Submit Return'}</ActionButton></div>
            </form>
            {submitError && <p className={styles.error} role="alert">{submitError}</p>}
        </section>
        {submitAttempted && <>
            <section className={styles.result}><div className={styles.resultHeader}><h2>Return submission</h2><span>POST</span></div><div className={styles.actions}><ActionButton className={styles.secondary} onClick={() => setViewer('submit-request')}>View Request Payload</ActionButton><ActionButton className={styles.secondary} onClick={() => setViewer('submit-response')}>View Response Payload</ActionButton></div></section>
            {submittedReturnId && <PapssPaymentStatus endpoint={`${baseUrl}/api/v1/Gateway/Return`} txId={submittedReturnId} axiosPrivate={axiosPrivate} title="PAPSS Return Status" identifierLabel="Return ID" pendingMessage="Waiting for the PAPSS return result…" timeoutMessage="PAPSS return is still pending. Try checking again later." />}
        </>}
        </>}
        {activePanel === 'lookup' && <>
        <section className={styles.card}>
            <div className={styles.cardHeader}><h2>Lookup an existing return</h2><p>Retrieve the current status of a return using its Return ID.</p></div>
            <form onSubmit={lookupReturn} className={styles.inlineForm}><Input label="Return ID" type="text" value={lookupId} required disabled={lookupLoading} onChange={event => setLookupId(event.target.value)} /><ActionButton type="submit" disabled={lookupLoading || !lookupId.trim()}>{lookupLoading ? 'Looking up…' : 'Lookup Return'}</ActionButton></form>
            {lookupError && <p className={styles.error} role="alert">{lookupError}</p>}
        </section>
        {lookupResponse !== null && <section className={styles.result}><div className={styles.resultHeader}><h2>Return lookup response</h2><span>GET</span></div><pre>{JSON.stringify(lookupResponse, null, 2)}</pre><div className={styles.actions}><ActionButton className={styles.secondary} onClick={() => setViewer('lookup-request')}>View Request JSON</ActionButton><ActionButton className={styles.secondary} onClick={() => setViewer('lookup-response')}>View Response JSON</ActionButton></div></section>}
        </>}
        <QRDataViewer isOpen={viewer === 'submit-request'} data={submitRequest} rawResponse title="PAPSS Return Request" onClose={() => setViewer(null)} />
        <QRDataViewer isOpen={viewer === 'submit-response'} data={submitResponse} rawResponse title="PAPSS Return Response" onClose={() => setViewer(null)} />
        <QRDataViewer isOpen={viewer === 'lookup-request'} data={lookupRequest} rawResponse title="PAPSS Return Lookup Request" onClose={() => setViewer(null)} />
        <QRDataViewer isOpen={viewer === 'lookup-response'} data={lookupResponse} rawResponse title="PAPSS Return Lookup Response" onClose={() => setViewer(null)} />
        {confirmSubmit && <ConfirmationModal title="Submit PAPSS return" message={`Submit the return request for Return ID ${form.returnId}?`} confirmText="Submit Return" cancelText="Cancel" onConfirm={() => void confirmReturn()} onCancel={() => setConfirmSubmit(false)} />}
    </div></RoleGuard>;
}
