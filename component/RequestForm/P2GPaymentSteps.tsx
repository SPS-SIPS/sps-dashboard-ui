import React, {useState} from 'react';
import type {FieldMapping} from '../../api/hooks/useEndpoints';
import type {PaymentPreset} from '../../utils/paymentFormConfig';
import {p2gReferenceTypes, type P2GReferenceType} from '../../utils/paymentFormConfig';
import {groups, isOptional} from '../../utils/paymentForms';
import {verificationMethods, bicOptionsDev, bicOptionsProd} from '../../constants/gatewayFormOptions';
import {useAuthentication} from '../../auth/AuthProvider';
import Input from '../common/Input/Input';
import SelectInput from '../common/SelectInput/SelectInput';
import ActionButton from '../common/ActionButton/ActionButton';
import styles from './PaymentTester.module.css';

const hiddenFields = new Set(['EndToEndId', 'CreditorIssuer', 'CreditorAgentBIC', 'AmountPayable', 'Rail', 'LocalInstrument', 'CategoryPurpose', 'TxId']);
const billFields = ['ToBIC', 'CreditorName', 'CreditorAccount', 'CreditorAccountType', 'CreditorAddress', 'Amount', 'Currency', 'RemittanceInformation'];

export default function P2GPaymentSteps({values, mappings, preset, locked, change, errors, busy, verified = false, paymentSent, onStartNewPayment, onPreview, onSubmit}: {
    values: Record<string, string>; mappings: FieldMapping[]; preset: PaymentPreset;
    locked: (field: string) => boolean; change: (field: string, value: string) => void;
    errors: string[]; busy: boolean; verified?: boolean; paymentSent: boolean; onStartNewPayment?: () => void;
    onPreview: () => void; onSubmit: () => void;
}) {
    const {config} = useAuthentication();
    const bankOptions = config?.profile === 'prod' ? bicOptionsProd : bicOptionsDev;
    const [step, setStep] = useState(1);
    const configuredReferences = preset.referenceTypes?.enabled?.length ? preset.referenceTypes.enabled : [...p2gReferenceTypes];
    const configuredDefault = preset.referenceTypes?.default && configuredReferences.includes(preset.referenceTypes.default) ? preset.referenceTypes.default : configuredReferences[0];
    const detectedReference = configuredReferences.find(field => values[field]?.trim());
    const [referenceType, setReferenceType] = useState<P2GReferenceType>((verified && detectedReference) || configuredDefault);
    const labels: Record<string, string> = {
        ToBIC: 'Destination bank BIC', CreditorName: 'Creditor name', CreditorAccount: 'Creditor account',
        CreditorAccountType: 'Creditor account type', CreditorAgentBIC: 'Creditor agent BIC', CreditorAddress: 'Creditor address',
        Amount: 'Amount', Currency: 'Currency', RemittanceInformation: 'Payment description',
        BillReference: 'Bill reference', InvoiceId: 'Invoice ID', Upr: 'UPR', AmountPayable: 'Amount payable',
        DebtorName: 'Payer name', DebtorAccount: 'Payer account', DebtorAccountType: 'Payer account type', DebtorAddress: 'Payer address',
    };
    const mapped = (field: string) => mappings.some(m => m.internalField === field);
    const requiredField = (field: string) => field === 'RemittanceInformation' || p2gReferenceTypes.includes(field as P2GReferenceType) || !isOptional(field, 'p2g');
    const renderField = (field: string) => {
        if (hiddenFields.has(field)) return null;
        const mapping = mappings.find(m => m.internalField === field);
        const configField = preset.fields.find(f => f.internalField === field);
        if (!mapping || (!configField?.visible && !locked(field))) return null;
        const label = configField?.label && configField.label !== field ? configField.label : labels[field] ?? field;
        const disabled = locked(field);
        if (field === 'ToBIC') return <SelectInput key={field} label={label} value={values[field] ?? ''} options={bankOptions} required disabled={disabled} onChange={event => {change(field, event.target.value); if (!locked('CreditorAgentBIC')) change('CreditorAgentBIC', event.target.value);}}/>;
        if (field.endsWith('AccountType')) return <SelectInput key={field} label={label} value={values[field] ?? ''} options={verificationMethods} required disabled={disabled} onChange={event => change(field, event.target.value)}/>;
        if (field === 'Currency') return <SelectInput key={field} label={label} value="USD" options={[{value: 'USD', label: 'USD - US Dollar'}]} required disabled onChange={() => {}}/>;
        return <Input key={field} label={label} value={values[field] ?? ''} type="text" required={requiredField(field)} disabled={disabled} onChange={event => change(field, event.target.value)}/>;
    };
    const renderFields = (fields: string[]) => fields.filter(mapped).map(renderField);
    const billList = billFields.filter(field => !hiddenFields.has(field) && mapped(field));
    const payerFields = groups.Payer;
    const verifiedMetadata = [
        ['MdaCode', 'MDA code'], ['ServiceCode', 'Service code'],
        ['DueDate', 'Due date'], ['PayerReference', 'Payer reference'],
    ].filter(([field]) => values[field]?.trim());
    const verifiedBillFields = [...billFields, ...p2gReferenceTypes]
        .filter((field, index, list) => list.indexOf(field) === index && !hiddenFields.has(field) && values[field]?.trim());
    const billMissing = billList.filter(field => !hiddenFields.has(field) && requiredField(field) && (!values[field]?.trim() || !mapped(field)));
    const references = ['BillReference', 'InvoiceId', 'Upr'].filter(field => values[field]?.trim() && mapped(field));
    const amountValid = Number.isFinite(Number(values.Amount)) && Number(values.Amount) > 0;
    const billValid = billMissing.length === 0 && references.length === 1 && amountValid;
    const payerMissing = payerFields.filter(field => !isOptional(field, 'p2g') && (!values[field]?.trim() || !mapped(field)));
    const payerValid = payerMissing.length === 0;
    const stepValid = step === 1 ? billValid : step === 2 ? payerValid : !errors.length;
    return <div>
        <ol className={styles.steps} aria-label="P2G payment steps">{['Bill details', 'Payer details', 'Review'].map((label, index) => <li key={label} aria-current={step === index + 1 ? 'step' : undefined}>{index + 1}. {label}</li>)}</ol>
        <form onSubmit={event => {event.preventDefault(); if (busy || paymentSent) return; if (step < 3) {if (stepValid) setStep(step + 1);} else if (!errors.length) onSubmit();}}>
            {step === 1 && <section className={styles.section}><h2>{verified ? 'Verified bill information' : 'Bill details'}</h2>{verified ? <dl className={styles.review}>{[...verifiedBillFields.map(field => [field, labels[field] ?? field] as [string, string]), ...verifiedMetadata].map(([field, label]) => <React.Fragment key={field}><dt>{label}</dt><dd>{values[field]}</dd></React.Fragment>)}</dl> : <><div className={styles.grid}>{renderFields(billList)}<SelectInput label="Reference type" value={referenceType} options={configuredReferences.map(reference => ({value: reference, label: reference === 'BillReference' ? 'Bill reference' : reference === 'InvoiceId' ? 'Invoice ID' : 'UPR'}))} required onChange={event => {const next = event.target.value as P2GReferenceType; configuredReferences.filter(reference => reference !== next).forEach(reference => change(reference, '')); setReferenceType(next);}}/><div>{renderField(referenceType)}</div></div>{references.length !== 1 && <p className={styles.note}>Reference type and reference value are required. Use exactly one bill reference, invoice ID, or UPR.</p>}</>}{!verified && verifiedMetadata.length > 0 && <article className={styles.reviewCard}><h3>Verified bill information</h3><dl className={styles.review}>{verifiedMetadata.map(([field, label]) => <React.Fragment key={field}><dt>{label}</dt><dd>{values[field]}</dd></React.Fragment>)}</dl></article>}</section>}
            {step === 2 && <section className={styles.section}><h2>Payer details</h2><div className={styles.grid}>{renderFields(payerFields)}</div></section>}
            {step === 3 && <section className={styles.reviewSection}><div className={styles.reviewHeader}><div><p className={styles.eyebrow}>Step 3 of 3</p><h2>Review P2G payment</h2><p>Check the verified bill and payer details before sending.</p></div><span className={styles.reviewBadge}>P2G</span></div>
                <div className={styles.reviewCards}><article className={styles.reviewCard}><h3>Bill</h3><dl className={styles.review}><dt>Reference</dt><dd>{values.BillReference || values.InvoiceId || values.Upr || '—'}</dd><dt>Creditor</dt><dd>{values.CreditorName || '—'}</dd><dt>Account</dt><dd>{values.CreditorAccount || '—'}</dd><dt>Amount</dt><dd>{values.Amount || '—'} {values.Currency || ''}</dd><dt>Description</dt><dd>{values.RemittanceInformation || '—'}</dd></dl></article><article className={styles.reviewCard}><h3>Payer</h3><dl className={styles.review}><dt>Name</dt><dd>{values.DebtorName || '—'}</dd><dt>Account</dt><dd>{values.DebtorAccount || '—'}</dd><dt>Type</dt><dd>{values.DebtorAccountType || '—'}</dd><dt>Address</dt><dd>{values.DebtorAddress || '—'}</dd></dl></article></div>
                <div className={styles.reviewActions}><ActionButton className={styles.secondary} onClick={onPreview}>View Request JSON</ActionButton>{errors.length > 0 && <ul role="alert">{errors.map(error => <li key={error}>{error}</li>)}</ul>}</div>
            </section>}
            {step < 3 && !stepValid && <p className={styles.note}>Complete the required P2G fields to continue.</p>}
            <div className={styles.actions}>{!paymentSent && step > 1 && <ActionButton className={styles.secondary} disabled={busy} onClick={() => setStep(step - 1)}>← Back</ActionButton>}{paymentSent ? <ActionButton type="button" disabled={busy} onClick={onStartNewPayment}>Start New Payment</ActionButton> : <ActionButton type="submit" disabled={busy || !stepValid}>{step < 3 ? 'Next →' : busy ? 'Sending payment…' : 'Send Payment'}</ActionButton>}</div>
        </form>
    </div>;
}
