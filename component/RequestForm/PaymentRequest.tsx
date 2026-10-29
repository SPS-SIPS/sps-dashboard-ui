import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import headerStyles from '../../styles/VerificationRequestPage.module.css';
import useEndpoints from '../../api/hooks/useEndpoints';
import Input from '../common/Input/Input';
import SelectInput from '../common/SelectInput/SelectInput';
import ActionButton from '../common/ActionButton/ActionButton';
import QRDataViewer from '../ScanToPay/QRDataViewer/QRDataViewer';
import {fieldsFor, buildPaymentPayload, groups, isOptional, paymentDefaults, paymentTypes, type PaymentType} from '../../utils/paymentForms';
import {generateLocalId} from '../../utils/generateLocalId';
import styles from './PaymentTester.module.css';
import PaymentFormSettings from './PaymentFormSettings';
import {createDefaultPaymentForms, configuredDefaults, validatePaymentForms, validatePaymentPreset, type PaymentPreset} from '../../utils/paymentFormConfig';
import {useAuthentication} from '../../auth/AuthProvider';
import useAxiosPrivate from '../../api/hooks/useAxiosPrivate';
import type {FieldMapping} from '../../api/hooks/useEndpoints';
import AlertModal from '../common/AlertModal/AlertModal';
import {MdSettings} from 'react-icons/md';
import AccountTransferSteps from './AccountTransferSteps';
import P2GPaymentSteps from './P2GPaymentSteps';
import PapssPaymentSteps from './PapssPaymentSteps';

export default function PaymentRequest({onSubmit, onPapssPaymentTxId, prefilledValues = null, busy = false, settingsContainerId, family = 'domestic', paymentEndpoint = '', onPaymentTypeChange, paymentSent = false, onStartNewPayment}: {
    onSubmit: (payload: Record<string, unknown>, paymentType?: PaymentType) => void;
    onPapssPaymentTxId?: (txId: string) => void;
    prefilledValues?: Record<string, string> | null;
    busy?: boolean;
    settingsContainerId?: string;
    family?: 'domestic' | 'p2g' | 'papss';
    paymentEndpoint?: string;
    onPaymentTypeChange?: (type: PaymentType) => void;
    paymentSent?: boolean;
    onStartNewPayment?: () => void;
}) {
    const {endpoints, loading, error} = useEndpoints();
    const [type, setType] = useState<PaymentType>('account');
    const [activePrefill, setActivePrefill] = useState<Record<string, string> | null>(prefilledValues);
    const [paymentSession, setPaymentSession] = useState(0);
    const [values, setValues] = useState<Record<string, string>>({});
    const [preview, setPreview] = useState(false);
    const {roles, keycloak} = useAuthentication();
    const axios = useAxiosPrivate();
    const [forms, setForms] = useState(createDefaultPaymentForms);
    const [revision, setRevision] = useState('');
    const [configLoading, setConfigLoading] = useState(true);
    const [configError, setConfigError] = useState('');
    const [invalid, setInvalid] = useState(false);
    const [settings, setSettings] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);
    const [reloadedMappings, setReloadedMappings] = useState<FieldMapping[] | null>(null);
    const initialValues = (next: PaymentType, source = activePrefill) => ({...paymentDefaults(next), ...configuredDefaults(forms.presets[next]), ...source,
        ...(['account', 'staticQr', 'dynamicQr', 'p2g', 'papss'].includes(next) ? {Currency: 'USD'} : {}),
        ...(next === 'papss' ? {CreditorIssuer: 'C', DebtorIssuer: 'C', EndToEndId: generateLocalId(), TxId: generateLocalId()} :
            ['account', 'staticQr', 'dynamicQr', 'p2g'].includes(next) ? {CreditorIssuer: 'C', EndToEndId: generateLocalId()} : {})});
    const loadSettings = async () => {
        setConfigLoading(true); setConfigError('');
        try {
            const result = await fetch('/api/payment-forms', {cache: 'no-store'});
            const data = await result.json();
            setRevision(data.revision ?? ''); setInvalid(data.code === 'INVALID_CONFIG');
            if (!result.ok || !validatePaymentForms(data.forms)) throw new Error(data.message || 'Invalid payment settings.');
            setForms(data.forms);
        } catch (e) {setConfigError(e instanceof Error ? e.message : 'Unable to load settings.');}
        finally {setConfigLoading(false);}
    };
    useEffect(() => {void loadSettings();}, []);
    useEffect(() => {
        setActivePrefill(prefilledValues);
        const next = (prefilledValues?.PaymentType ?? (family !== 'domestic' ? family : ['p2g', 'papss'].includes(type) ? 'account' : type)) as PaymentType;
        setType(next); setValues(initialValues(next, prefilledValues));
    }, [prefilledValues, forms, family]);
    const all = reloadedMappings ?? endpoints?.PaymentRequest?.fieldMappings ?? [];
    const preset = forms.presets[type];
    const configErrors = validatePaymentPreset(type, preset, all);
    const mappings = preset.fields.flatMap(field => {
        const mapping = all.find(m => m.internalField === field.internalField && (!field.userField || m.userField === field.userField));
        return mapping ? [mapping] : [];
    });
    const automatic = {...paymentDefaults(type), ...(type === 'papss' ? configuredDefaults(preset) : {}),
        ...(type === 'papss' ? {LocalInstrument: values.SenderCurrency && values.ReceiverCurrency && values.SenderCurrency !== values.ReceiverCurrency ? 'SSA3' : 'USDP'} : {}),
        ...(['account', 'staticQr', 'dynamicQr', 'p2g'].includes(type) ? {Currency: 'USD', CreditorIssuer: 'C', EndToEndId: values.EndToEndId} : {}),
        ...(type === 'papss' ? {CreditorIssuer: 'C', DebtorIssuer: 'C', EndToEndId: values.EndToEndId, TxId: values.TxId} : {})};
    const locked = (field: string) => field in automatic || Boolean(activePrefill?.[field]?.trim());
    const configuredPayloadValues = Object.fromEntries(Object.entries(values).filter(([field]) => preset.fields.find(f => f.internalField === field)?.visible || locked(field)));
    const payloadValues: Record<string, string> = type === 'papss' ? {...configuredPayloadValues, LocalInstrument: automatic.LocalInstrument ?? 'USDP', ...(values.ToBIC ? {CreditorAgentBIC: values.ToBIC} : {})} : configuredPayloadValues;
    const built = buildPaymentPayload(payloadValues, mappings, type);
    built.errors.push(...configErrors);
    const mutateSettings = async (method: 'PUT' | 'POST', body: object) => {
        if (!keycloak || !roles.includes('configuration')) throw new Error('Configuration permission is required.');
        await keycloak.updateToken(30);
        const result = await fetch('/api/payment-forms', {method, headers: {'Content-Type': 'application/json', Authorization: `Bearer ${keycloak.token}`}, body: JSON.stringify({...body, revision})});
        const data = await result.json();
        if (!result.ok || !validatePaymentForms(data.forms)) throw new Error(data.message || 'Unable to save settings.');
        setForms(data.forms); setRevision(data.revision); setInvalid(false); setConfigError(''); setSettings(false);
    };
    const change = (field: string, value: string) => setValues(previous => ({...previous, [field]: value, ...(type === 'p2g' && field === 'Amount' ? {AmountPayable: value} : {})}));
    const changePaymentType = (next: PaymentType) => {
        setType(next);
        setValues(initialValues(next));
        setPreview(false);
        onPaymentTypeChange?.(next);
    };
    const startNewPayment = () => {
        setActivePrefill(null);
        setValues(initialValues(type, null));
        setPreview(false);
        setPaymentSession(value => value + 1);
        onStartNewPayment?.();
    };
    if (loading) return <p role="status">Loading payment adapter…</p>;
    if (error) return <p role="alert">Unable to load payment adapter: {error}</p>;
    if (configLoading) return <p role="status">Loading payment settings…</p>;
    if (configError) return <>
        <p role="alert">{configError}</p><ActionButton onClick={() => void loadSettings()}>Reload Settings</ActionButton>
        {invalid && roles.includes('configuration') && <ActionButton onClick={() => setConfirmReset(true)}>Back up & Reset Payment Settings</ActionButton>}
        {confirmReset && <AlertModal title="Reset payment settings" message="Back up the invalid file and restore defaults?" warning buttonText="Back up & Reset" onClose={() => setConfirmReset(false)} onConfirm={() => {setConfirmReset(false); void mutateSettings('POST', {action: 'reset', confirmed: true}).catch(e => setConfigError(e.message));}}/>}
    </>;
    return <>
        {roles.includes('configuration') && settingsContainerId && typeof document !== 'undefined' && document.getElementById(settingsContainerId) && createPortal(
            <span title="Configure payment form"><ActionButton className={headerStyles.headerIconButton} disabled={busy} onClick={() => setSettings(true)}><MdSettings size={22} aria-hidden="true"/><span className={headerStyles.srOnly}>Configure payment form</span></ActionButton></span>,
            document.getElementById(settingsContainerId)!
        )}
        {settings && <PaymentFormSettings type={type} preset={preset} mappings={all} onClose={() => setSettings(false)} onSave={(updated: PaymentPreset) => mutateSettings('PUT', {presetId: type, preset: updated})} onReload={async () => {
            const result = await axios.get('/api/v1/Adapter');
            const mappings = result.data?.PaymentRequest?.fieldMappings;
            if (!Array.isArray(mappings) || mappings.some(m => typeof m.internalField !== 'string' || typeof m.userField !== 'string' || typeof m.type !== 'string')) throw new Error('Invalid payment adapter mappings.');
            setReloadedMappings(mappings);
        }}/>}
        <fieldset disabled={busy || settings} className={styles.fieldset}>
            <div className={styles.grid}>
                {family === 'domestic' && <SelectInput label="Payment Type" value={type} options={paymentTypes} disabled={Boolean(activePrefill) || paymentSent} onChange={event => {
                    const next = event.target.value as PaymentType; changePaymentType(next);
                }}/>}
            </div>
            {family === 'domestic' && ['account', 'staticQr', 'dynamicQr'].includes(type) ? <AccountTransferSteps key={`${revision}-${type}-${paymentSession}`} paymentType={type as 'account' | 'staticQr' | 'dynamicQr'} values={values} mappings={mappings} preset={preset} locked={locked} change={change} errors={built.errors} busy={busy || settings} verified={Boolean(activePrefill)} paymentSent={paymentSent} onStartNewPayment={startNewPayment} onPreview={() => setPreview(true)} onSubmit={() => {if (!busy && !settings && !paymentSent && !built.errors.length) onSubmit(built.payload, type);}}/> : family === 'p2g' ? <P2GPaymentSteps key={`${revision}-${type}-${paymentSession}`} values={values} mappings={mappings} preset={preset} locked={locked} change={change} errors={built.errors} busy={busy || settings} verified={Boolean(activePrefill)} paymentSent={paymentSent} onStartNewPayment={startNewPayment} onPreview={() => setPreview(true)} onSubmit={() => {if (!busy && !settings && !paymentSent && !built.errors.length) onSubmit(built.payload, type);}}/> : family === 'papss' ? <PapssPaymentSteps key={`${revision}-${type}-${paymentSession}`} values={values} mappings={mappings} preset={preset} locked={locked} change={change} errors={built.errors} busy={busy || settings} paymentSent={paymentSent} prefilled={Boolean(activePrefill)} paymentEndpoint={paymentEndpoint} discoveryRequestMappings={endpoints?.ParticipantDiscoveryRequest?.fieldMappings ?? []} discoveryResponseMappings={endpoints?.ParticipantDiscoveryResponse?.fieldMappings ?? []} fxRequestMappings={endpoints?.FxRequest?.fieldMappings ?? []} fxResponseMappings={endpoints?.FxResponse?.fieldMappings ?? []} axiosPrivate={axios} onStartNewPayment={startNewPayment} onPreview={() => setPreview(true)} onSubmit={() => {if (!busy && !settings && !paymentSent && !built.errors.length) {onPapssPaymentTxId?.(values.TxId ?? ''); onSubmit(built.payload, type);}}}/> : <form onSubmit={event => {event.preventDefault(); if (!busy && !built.errors.length) onSubmit(built.payload, type);}}>
                {Object.entries(groups).filter(([, fields]) => fields.some(field => mappings.some(m => m.internalField === field))).map(([group, fields]) => <section className={styles.section} key={group}>
                    <h2>{group}</h2><div className={styles.grid}>
                        {mappings.filter(m => fields.includes(m.internalField) && (preset.fields.find(f => f.internalField === m.internalField)?.visible || locked(m.internalField))).map(mapping => {
                            const field = mapping.internalField;
                            return <div key={field}>
                                <Input label={`${preset.fields.find(f => f.internalField === field)?.label} · ${mapping.userField} (${mapping.type})`} value={values[field] ?? ''} type="text"
                                    required={!isOptional(field, type)} disabled={locked(field)} onChange={event => change(field, event.target.value)}/>
                                <small className={styles.note}>{field} · {field in automatic ? 'Automatically set' : activePrefill?.[field]?.trim() ? 'From verification' : isOptional(field, type) ? 'Optional' : 'Required'}{isOptional(field, type) && locked(field) ? ' · Optional' : ''}</small>
                                {['EndToEndId', 'TxId'].includes(field) && <ActionButton className={styles.secondary} onClick={() => change(field, generateLocalId())}>Generate ID</ActionButton>}
                            </div>;
                        })}
                    </div>
                </section>)}
                <details className={styles.validation}><summary>{built.errors.length ? `${built.errors.length} items to complete before sending` : 'Request is ready to send'}</summary>
                    {built.errors.length > 0 && <ul>{built.errors.map(message => <li key={message}>{message}</li>)}</ul>}
                </details>
                <div className={styles.actions}>
                    <ActionButton className={styles.secondary} onClick={() => setPreview(true)}>View Request</ActionButton>
                    <ActionButton className={styles.secondary} onClick={() => setValues(previous => Object.fromEntries(Object.entries(previous).filter(([field]) => fieldsFor(type).includes(field) && locked(field))))}>Clear Editable Fields</ActionButton>
                    <ActionButton type="submit" disabled={busy || built.errors.length > 0}>{busy ? 'Sending payment…' : 'Send Payment'}</ActionButton>
                </div>
            </form>}
        </fieldset>
        <QRDataViewer isOpen={preview} data={built.payload} title="Payment Request Preview" subtitle={built.errors.length ? 'Incomplete request — complete required fields before sending.' : 'This JSON will be sent to the payment endpoint.'} onClose={() => setPreview(false)}/>
    </>;
}
