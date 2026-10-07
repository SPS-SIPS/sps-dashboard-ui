import React, {useEffect, useRef, useState} from 'react';
import type {FieldMapping} from '../../api/hooks/useEndpoints';
import {defaultableFields, p2gReferenceTypes, validatePaymentPreset, type PaymentPreset, type PaymentType, type P2GReferenceType} from '../../utils/paymentFormConfig';
import {isOptional, paymentDefaults} from '../../utils/paymentForms';
import Input from '../common/Input/Input';
import SelectInput from '../common/SelectInput/SelectInput';
import Checkbox from '../common/Checkbox/Checkbox';
import ActionButton from '../common/ActionButton/ActionButton';
import {MdClose} from 'react-icons/md';
import styles from './VerificationFormSettings.module.css';
export default function PaymentFormSettings({type, preset, mappings, onSave, onReload, onClose}: {
    type: PaymentType; preset: PaymentPreset; mappings: FieldMapping[]; onSave: (preset: PaymentPreset) => Promise<void>; onReload: () => Promise<void>; onClose: () => void;
}) {
    const [draft, setDraft] = useState<PaymentPreset>(() => structuredClone(preset));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const previous = document.activeElement as HTMLElement | null;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden'; dialog.current?.showModal();
        return () => {document.body.style.overflow = overflow; previous?.focus();};
    }, []);
    const update = (index: number, patch: object) => setDraft(previous => ({fields: previous.fields.map((field, i) => i === index ? {...field, ...patch} : field)}));
    const updateReferenceTypes = (type: P2GReferenceType, checked: boolean) => setDraft(previous => {
        const current = previous.referenceTypes ?? {enabled: [...p2gReferenceTypes], default: 'BillReference' as P2GReferenceType};
        const enabled = checked ? [...new Set([...current.enabled, type])] : current.enabled.filter(value => value !== type);
        const fallback = enabled.includes(current.default) ? current.default : enabled[0] ?? current.default;
        return {...previous, referenceTypes: {enabled, default: fallback}};
    });
    const run = async (action: () => Promise<void>) => {setBusy(true); setError(''); try {await action();} catch (e) {setError(e instanceof Error ? e.message : 'Unable to update settings.');} finally {setBusy(false);}};
    const errors = validatePaymentPreset(type, draft, mappings);
    return <dialog ref={dialog} className={styles.panel} aria-labelledby="payment-settings-title" onCancel={event => {event.preventDefault(); if (!busy) onClose();}}>
        <header className={styles.header}><h2 id="payment-settings-title">{type === 'p2g' ? 'P2G' : type === 'papss' ? 'PAPSS' : 'Domestic SIPS'} payment settings</h2><ActionButton className={styles.closeButton} disabled={busy} onClick={onClose}><MdClose/><span className={styles.srOnly}>Close</span></ActionButton></header>
        <div className={styles.body}>
            <div className={styles.actions}><a href="/config/endpoint" target="_blank" rel="noreferrer">Manage Adapter</a><ActionButton disabled={busy} className={styles.secondaryButton} onClick={() => void run(onReload)}>Reload Adapter</ActionButton></div>
            <p>Settings apply to this payment type. Verified values override defaults. Domestic SIPS and P2G use a fixed step order.</p>
            {type === 'p2g' && <section className={styles.field}><h3>Reference types</h3><p>Select which reference type a direct P2G payment can use.</p><div className={styles.grid}>{p2gReferenceTypes.map(reference => <Checkbox key={reference} label={reference === 'BillReference' ? 'Bill reference' : reference === 'InvoiceId' ? 'Invoice ID' : 'UPR'} checked={(draft.referenceTypes?.enabled ?? [...p2gReferenceTypes]).includes(reference)} onChange={event => updateReferenceTypes(reference, event.target.checked)}/>)}<SelectInput label="Default reference type" value={draft.referenceTypes?.default ?? 'BillReference'} options={(draft.referenceTypes?.enabled ?? [...p2gReferenceTypes]).map(reference => ({value: reference, label: reference === 'BillReference' ? 'Bill reference' : reference === 'InvoiceId' ? 'Invoice ID' : 'UPR'}))} onChange={event => setDraft(previous => ({...previous, referenceTypes: {...(previous.referenceTypes ?? {enabled: [...p2gReferenceTypes], default: 'BillReference'}), default: event.target.value as P2GReferenceType}}))}/></div></section>}
            <fieldset disabled={busy} className={styles.fields}>
                {draft.fields.map((field, index) => <section className={styles.field} key={field.internalField}>
                    <h3>{field.internalField} <small>{isOptional(field.internalField, type) ? 'Optional' : 'Required'}</small></h3>
                    <div className={styles.grid}>
                        <Input label="Label" value={field.label} type="text" onChange={event => update(index, {label: event.target.value})}/>
                        <SelectInput label="Send as" value={field.userField ?? ''} options={[{value: '', label: 'Use first adapter alias'}, ...mappings.filter(m => m.internalField === field.internalField).map(m => ({value: m.userField, label: m.userField}))]} onChange={event => update(index, {userField: event.target.value || undefined})}/>
                        <Input label="Input control" type="text" value="Text (contract validated)" disabled onChange={() => {}}/>
                        {defaultableFields.has(field.internalField) && <Input label="Default" type="text" value={field.defaultValue ?? ''} onChange={event => update(index, {defaultValue: event.target.value || undefined})}/>}
                    </div>
                    <Checkbox label="Show optional field" checked={field.visible} disabled={!isOptional(field.internalField, type) || field.internalField in paymentDefaults(type)} onChange={event => update(index, {visible: event.target.checked})}/>
                </section>)}
            </fieldset>
            {(error || errors.length > 0) && <p role="alert">{error || errors.join(' ')}</p>}
        </div>
        <footer className={styles.footer}><ActionButton className={styles.secondaryButton} disabled={busy} onClick={onClose}>Cancel</ActionButton><ActionButton className={styles.primaryButton} disabled={busy || errors.length > 0} onClick={() => void run(() => onSave(draft))}>{busy ? 'Working…' : 'Save & Apply'}</ActionButton></footer>
    </dialog>;
}


