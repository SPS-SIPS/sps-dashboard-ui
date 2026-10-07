import React, {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/router';
import {isAxiosError} from 'axios';
import {MdRefresh} from 'react-icons/md';
import PaymentRequest from '../../component/RequestForm/PaymentRequest';
import RoleGuard from '../../auth/RoleGuard';
import {useAuthentication} from '../../auth/AuthProvider';
import useAxiosPrivate from '../../api/hooks/useAxiosPrivate';
import {PAYMENT_DRAFT_KEY, paymentPrefill, readPaymentDraft} from '../../utils/paymentDraft';
import Input from '../../component/common/Input/Input';
import ActionButton from '../../component/common/ActionButton/ActionButton';
import QRDataViewer from '../../component/ScanToPay/QRDataViewer/QRDataViewer';
import {validateUrl} from '../../utils/validation';
import sharedStyles from '../../component/RequestForm/SharedStyles.module.css';
import styles from '../../component/RequestForm/PaymentTester.module.css';
import headerStyles from '../../styles/VerificationRequestPage.module.css';
import type {PaymentType} from '../../utils/paymentForms';
import PapssPaymentStatus from '../../component/RequestForm/PapssPaymentStatus';

export default function PaymentPage() {
    const router = useRouter();
    const {config} = useAuthentication();
    const axios = useAxiosPrivate();
    const [prefill, setPrefill] = useState<Record<string, string> | null>(null);
    const [draftError, setDraftError] = useState('');
    const [ready, setReady] = useState(false);
    const [revision, setRevision] = useState(0);
    const [family, setFamily] = useState<'domestic' | 'p2g' | 'papss'>('domestic');
    const [urlOverride, setUrlOverride] = useState<string | null>(null);
    const url = urlOverride ?? `${config?.api.baseUrl?.replace(/\/$/, '') ?? ''}/api/v1/Gateway/Payment`;
    const [urlError, setUrlError] = useState('');
    const [busy, setBusy] = useState(false);
    const pending = useRef(false);
    const [sent, setSent] = useState<{url: string; method: string; body: Record<string, unknown>} | null>(null);
    const [response, setResponse] = useState<{status: number | null; data: unknown; error?: string} | null>(null);
    const [viewer, setViewer] = useState<'request' | 'response' | null>(null);
    const [accountSubmission, setAccountSubmission] = useState(false);
    const [papssRequestMessageId, setPapssRequestMessageId] = useState('');
    const [papssStatusBody, setPapssStatusBody] = useState<Record<string, unknown> | null>(null);
    useEffect(() => {
        if (!router.isReady) return;
        setReady(false); setDraftError(''); setPrefill(null);
        try {
            if (router.query.draft) {
                if (typeof router.query.draft !== 'string') throw new Error('Invalid payment draft.');
                setPrefill(readPaymentDraft(sessionStorage.getItem(PAYMENT_DRAFT_KEY), router.query.draft));
            } else if (router.query.data) {
                if (typeof router.query.data !== 'string') throw new Error('Invalid payment details.');
                setPrefill(paymentPrefill(JSON.parse(router.query.data)));
            }
        } catch (error) {setDraftError(error instanceof Error ? error.message : 'Unable to load draft. Verify the recipient again.');}
        setReady(true);
    }, [router.isReady, router.query.draft, router.query.data, revision]);
    useEffect(() => {
        if (!prefill) return;
        setFamily(prefill.PaymentType === 'p2g' ? 'p2g' : prefill.PaymentType === 'papss' ? 'papss' : 'domestic');
    }, [prefill]);
    useEffect(() => {if (config?.profile === 'prod') void router.replace('/403');}, [config?.profile, router]);
    const submit = async (payload: Record<string, unknown>, paymentType?: PaymentType) => {
        if (pending.current || draftError || !ready || config?.profile === 'prod') return;
        if (typeof router.query.draft === 'string') {
            try {readPaymentDraft(sessionStorage.getItem(PAYMENT_DRAFT_KEY), router.query.draft);}
            catch {setDraftError('Payment draft has expired or is unavailable. Verify the recipient again.'); return;}
        }
        if (!validateUrl(url, {allowLocalhost: true})) {setUrlError('Enter a valid payment endpoint URL.'); return;}
        pending.current = true; setBusy(true); setUrlError(''); setResponse(null); setViewer(null); setPapssRequestMessageId('');
        setSent({url, method: 'POST', body: structuredClone(payload)});
        setAccountSubmission(paymentType === 'account');
        try {
            const result = await axios.post(url, payload);
            setResponse({status: result.status, data: result.data});
            if (paymentType === 'papss') {
                const data = result.data as Record<string, unknown> | null;
                const id = data && (data.requestMessageId ?? data.RequestMessageId);
                if (typeof id === 'string' && id.trim()) setPapssRequestMessageId(id.trim());
            }
        } catch (error) {
            setResponse({status: isAxiosError(error) ? error.response?.status ?? null : null,
                data: isAxiosError(error) ? error.response?.data ?? null : null,
                error: error instanceof Error ? error.message : 'Payment request failed.'});
        } finally {pending.current = false; setBusy(false);}
    };
    if (config?.profile === 'prod') return null;
    return <RoleGuard allowedRoles={['gateway']}><div className={sharedStyles.container}>
        <header className={headerStyles.pageHeader}>
            <div className={headerStyles.headingText}>
                <h1 className={sharedStyles.mainTitle}>Payment API Tester</h1>
                <p className={sharedStyles.subTitle}>Build and send payment requests, then inspect API responses.</p>
            </div>
            <div className={headerStyles.headerActions}>
                <span title="Reload payment adapter and reset editable fields">
                    <ActionButton className={headerStyles.headerIconButton} disabled={busy} onClick={() => {setRevision(value => value + 1); setSent(null); setResponse(null); setPapssRequestMessageId(''); setPapssStatusBody(null); setViewer(null);}}>
                        <MdRefresh size={22} aria-hidden="true"/><span className={headerStyles.srOnly}>Reload payment adapter and reset editable fields</span>
                    </ActionButton>
                </span>
                <span id="payment-settings-action"/>
            </div>
        </header>
        <Input label="Payment API Endpoint" value={url} type="url" required disabled={busy} errorMessage={urlError} onChange={event => setUrlOverride(event.target.value)}/>
        <div className={headerStyles.modeSwitch} role="group" aria-label="Payment family">
            {(['domestic', 'p2g', 'papss'] as const).map(value => <button key={value} type="button" className={`${headerStyles.modeButton} ${family === value ? headerStyles.activeMode : ''}`} aria-pressed={family === value} disabled={busy || Boolean(prefill)} onClick={() => {setFamily(value); setSent(null); setResponse(null); setPapssRequestMessageId(''); setPapssStatusBody(null); setViewer(null);}}>{value === 'domestic' ? 'Domestic SIPS' : value.toUpperCase()}</button>)}
        </div>
        {(prefill || draftError) && <div className={styles.actions}><ActionButton disabled={busy} onClick={() => void router.push('/api-tester/verify')}>Back to Verification</ActionButton>
            {prefill && <span className={styles.note}>Recipient and payment type came from verification.</span>}</div>}
        {draftError && <p role="alert" className={styles.status}>{draftError}</p>}
        {!ready && <p role="status">Loading payment draft…</p>}
        {ready && !draftError && <PaymentRequest key={`${revision}-${family}`} family={family} paymentEndpoint={url} prefilledValues={prefill} busy={busy} paymentSent={Boolean(sent)} onSubmit={submit} onPapssStatusRequest={setPapssStatusBody} settingsContainerId="payment-settings-action" onPaymentTypeChange={() => {setSent(null); setResponse(null); setPapssRequestMessageId(''); setPapssStatusBody(null); setViewer(null);}} onStartNewPayment={() => {setSent(null); setResponse(null); setPapssRequestMessageId(''); setPapssStatusBody(null); setViewer(null);}}/>}
        {busy && <p role="status">Sending payment request…</p>}
        {response && <p className={styles.status} role="status">{response.status === null ? 'No HTTP response received' : `HTTP ${response.status}`}{response.error ? ` — ${response.error}` : ''}</p>}
        {family === 'papss' && papssRequestMessageId && papssStatusBody && !response?.error && <PapssPaymentStatus endpoint={url} requestMessageId={papssRequestMessageId} statusBody={papssStatusBody} axiosPrivate={axios}/>}
        {sent && <div className={styles.actions}>
            <ActionButton className={styles.requestViewer} onClick={() => setViewer('request')}>View Sent Request</ActionButton>
            {response && <ActionButton className={response.error ? styles.responseError : styles.responseViewer} onClick={() => setViewer('response')}>View Response</ActionButton>}
        </div>}
        <QRDataViewer isOpen={viewer !== null} data={accountSubmission ? (viewer === 'request' ? sent?.body : response?.data) : (viewer === 'request' ? sent : response)} rawResponse={accountSubmission} title={viewer === 'request' ? 'Sent Payment Request' : 'Payment Response'} onClose={() => setViewer(null)}/>
    </div></RoleGuard>;
}
