import React, {useState} from 'react';
import type {FieldMapping} from '../../api/hooks/useEndpoints';
import type {PaymentPreset} from '../../utils/paymentFormConfig';
import {groups, isOptional} from '../../utils/paymentForms';
import {verificationMethods, bicOptionsDev, bicOptionsProd} from '../../constants/gatewayFormOptions';
import {useAuthentication} from '../../auth/AuthProvider';
import {generateLocalId} from '../../utils/generateLocalId';
import Input from '../common/Input/Input';
import SelectInput from '../common/SelectInput/SelectInput';
import ActionButton from '../common/ActionButton/ActionButton';
import styles from './PaymentTester.module.css';

export default function AccountTransferSteps({values, mappings, preset, locked, change, errors, busy, verified, onPreview, onSubmit, paymentType = 'account', paymentSent = false, onStartNewPayment}: {
    values: Record<string, string>; mappings: FieldMapping[]; preset: PaymentPreset;
    locked: (field: string) => boolean; change: (field: string, value: string) => void;
    errors: string[]; busy: boolean; verified: boolean; onPreview: () => void; onSubmit: () => void; paymentType?: 'account' | 'staticQr' | 'dynamicQr'; paymentSent?: boolean; onStartNewPayment?: () => void;
}) {
    const {config: appConfig} = useAuthentication();
    const bankOptions = appConfig?.profile === 'prod' ? bicOptionsProd : bicOptionsDev;
    const selectedBank = bankOptions.find(option => option.value === values.ToBIC);
    const accountTypeLabel = verificationMethods.find(option => option.value === values.CreditorAccountType)?.label;
    const recipient = groups.Recipient;
    const [step, setStep] = useState(1);
    const stepFields = step === 1 ? recipient : [...groups['Payment details'], ...groups.Payer];
    const missing = stepFields.filter(f => !isOptional(f, paymentType)).filter(f => !values[f]?.trim() || !mappings.some(m => m.internalField === f));
    const validStep = !missing.length && (step !== 2 || (Number.isFinite(Number(values.Amount)) && Number(values.Amount) > 0));
    const labels: Record<string, string> = {ToBIC: 'Recipient bank BIC', CreditorAccount: 'Recipient account', CreditorAccountType: 'Recipient account type', CreditorName: 'Recipient name', CreditorAgentBIC: 'Recipient agent BIC', CreditorAddress: 'Recipient address', DebtorName: 'Payer name', DebtorAccount: 'Payer account', DebtorAccountType: 'Payer account type', DebtorAddress: 'Payer address', EndToEndId: 'Payment reference', RemittanceInformation: 'Payment description'};
    const renderField = (field: string) => {
        if (['EndToEndId', 'CreditorIssuer'].includes(field)) return null;
        const config = preset.fields.find(f => f.internalField === field);
        const mapping = mappings.find(m => m.internalField === field);
        if (!mapping || (!config?.visible && !locked(field))) return null;
        const label = config?.label && config.label !== field ? config.label : labels[field] ?? field;
        if (field === 'Currency' && ['account', 'staticQr', 'dynamicQr'].includes(paymentType)) return <SelectInput key={field} label={label} value="USD" options={[{value: 'USD', label: 'USD - US Dollar'}]} required disabled onChange={() => {}}/>;
        if (field === 'CreditorAgentBIC' && ((!values[field] && !locked('ToBIC')) || values[field] === values.ToBIC)) return null;
        if (locked(field)) {
            if (field === 'ToBIC') return <SelectInput key={field} label={label} value={values[field] ?? ''} options={bankOptions} required disabled onChange={() => {}}/>;
            if (field.endsWith('AccountType')) return <SelectInput key={field} label={label} value={values[field] ?? ''} options={verificationMethods} required disabled onChange={() => {}}/>;
            return <Input key={field} label={label} value={values[field] ?? ''} type="text" required={!isOptional(field, paymentType)} disabled onChange={() => {}}/>;
        }
        const update = (value: string) => {
            change(field, value);
            if (field === 'ToBIC' && !locked('CreditorAgentBIC') && (!values.CreditorAgentBIC || values.CreditorAgentBIC === values.ToBIC)) change('CreditorAgentBIC', value);
        };
        return <div key={field}>
            {field === 'ToBIC' ? <SelectInput label={label} value={values[field] ?? ''} options={bankOptions} required onChange={event => update(event.target.value)}/>
                : field.endsWith('AccountType') ? <SelectInput label={label} value={values[field] ?? ''} options={verificationMethods} required onChange={event => update(event.target.value)}/>
                : <Input label={label} value={values[field] ?? ''} type="text" required={!isOptional(field, paymentType)} onChange={event => update(event.target.value)}/>}
            {['EndToEndId', 'TxId'].includes(field) && <ActionButton className={styles.secondary} onClick={() => update(generateLocalId())}>Generate ID</ActionButton>}
        </div>;
    };
    const fields = (list: string[]) => mappings.filter(m => list.includes(m.internalField)).map(m => renderField(m.internalField));
    return <div>
        <ol className={styles.steps} aria-label="Payment steps">{['Recipient', 'Details', 'Review'].map((label, index) => <li key={label} aria-current={step === index + 1 ? 'step' : undefined}>{index + 1}. {label}</li>)}</ol>
        <form onSubmit={event => {event.preventDefault(); if (busy || paymentSent) return; if (step < 3) {if (validStep) setStep(step + 1);} else if (!errors.length) onSubmit();}}>
            {step === 1 && <section className={styles.section}><h2>Recipient</h2><div className={styles.grid}>{fields(recipient)}</div></section>}
            {step === 2 && <section className={styles.section}>
                <h2>Payment details</h2>
                <div className={styles.grid}>{fields(groups['Payment details'])}</div>
                <h3 className={styles.subsectionTitle}>Payer details</h3>
                <div className={styles.grid}>{fields(groups.Payer)}</div>
            </section>}
            {step === 3 && <section className={styles.reviewSection}><div className={styles.reviewHeader}><div><p className={styles.eyebrow}>Step 3 of 3</p><h2>Review payment</h2><p>Check the payment details before sending the request.</p></div><span className={styles.reviewBadge}>{paymentType === 'staticQr' ? 'P2M Static SOMQR' : paymentType === 'dynamicQr' ? 'P2M Dynamic SOMQR' : 'Domestic SIPS'}</span></div>
                <div className={styles.reviewCards}>
                    <article className={styles.reviewCard}><h3>Recipient</h3><dl className={styles.review}><dt>Name</dt><dd>{values.CreditorName || '—'}</dd><dt>Account</dt><dd>{values.CreditorAccount || '—'}</dd><dt>Bank BIC</dt><dd>{selectedBank ? `${selectedBank.label} (${values.ToBIC})` : values.ToBIC || '—'}</dd><dt>Type</dt><dd>{accountTypeLabel ? `${accountTypeLabel} (${values.CreditorAccountType})` : values.CreditorAccountType || '—'}</dd><dt>Address</dt><dd>{values.CreditorAddress || '—'}</dd></dl></article>
                    <article className={styles.reviewCard}><h3>Payer</h3><dl className={styles.review}><dt>Name</dt><dd>{values.DebtorName || '—'}</dd><dt>Account</dt><dd>{values.DebtorAccount || '—'}</dd><dt>Type</dt><dd>{verificationMethods.find(option => option.value === values.DebtorAccountType)?.label ? `${verificationMethods.find(option => option.value === values.DebtorAccountType)?.label} (${values.DebtorAccountType})` : values.DebtorAccountType || '—'}</dd><dt>Address</dt><dd>{values.DebtorAddress || '—'}</dd></dl></article>
                    <article className={`${styles.reviewCard} ${styles.amountCard}`}><h3>Payment</h3><p className={styles.amountValue}>{values.Amount || '—'} <span>{values.Currency || 'USD'}</span></p><p className={styles.paymentDescription}>{values.RemittanceInformation || '—'}</p></article>
                </div>
                <div className={styles.reviewActions}><ActionButton className={styles.secondary} onClick={onPreview}>View Request JSON</ActionButton><span className={styles.reviewHint}>The request includes the configured adapter fields.</span></div>
                {errors.length > 0 && <ul role="alert">{errors.map(error => <li key={error}>{error}</li>)}</ul>}
            </section>}
            {step < 3 && !validStep && <p className={styles.note}>Complete the required fields to continue.{missing.some(f => !mappings.some(m => m.internalField === f)) ? ` Missing adapter mappings: ${missing.filter(f => !mappings.some(m => m.internalField === f)).join(', ')}.` : ''}</p>}
            <div className={styles.actions}>
                {!paymentSent && step > 1 && <ActionButton className={styles.secondary} disabled={busy} onClick={() => setStep(step - 1)}>← Back</ActionButton>}
                {paymentSent ? <ActionButton type="button" disabled={busy} onClick={onStartNewPayment}>Start New Payment</ActionButton> : <ActionButton type="submit" disabled={busy || (step < 3 ? !validStep : errors.length > 0)}>{step < 3 ? 'Next →' : busy ? 'Sending payment…' : 'Send Payment'}</ActionButton>}
            </div>
        </form>
    </div>;
}
