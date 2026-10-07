import React, {useState} from 'react';
import type {AxiosInstance} from 'axios';
import type {FieldMapping} from '../../api/hooks/useEndpoints';
import type {PaymentPreset} from '../../utils/paymentFormConfig';
import {groups, isOptional} from '../../utils/paymentForms';
import {verificationMethods} from '../../constants/gatewayFormOptions';
import Input from '../common/Input/Input';
import SelectInput from '../common/SelectInput/SelectInput';
import ActionButton from '../common/ActionButton/ActionButton';
import styles from './PaymentTester.module.css';

const hiddenFields = new Set(['Rail', 'LocalInstrument', 'CategoryPurpose', 'EndToEndId', 'TxId', 'CreditorIssuer', 'DebtorIssuer', 'DebtorAgentBIC', 'CreditorAgentBIC', 'SenderCountry', 'SenderCurrency']);
const corridorFields = ['SenderCountry', 'SenderCurrency', 'ReceiverCountry', 'ReceiverCurrency'];
type Participant = {value: string; label: string; country: string; currencies: string[]};

export default function PapssPaymentSteps({values, mappings, preset, locked, change, errors, busy, paymentSent, prefilled = false, paymentEndpoint, discoveryRequestMappings, discoveryResponseMappings, axiosPrivate, onStartNewPayment, onPreview, onSubmit}: {
    values: Record<string, string>; mappings: FieldMapping[]; preset: PaymentPreset;
    locked: (field: string) => boolean; change: (field: string, value: string) => void;
    errors: string[]; busy: boolean; paymentSent: boolean; prefilled?: boolean; paymentEndpoint: string; discoveryRequestMappings: FieldMapping[]; discoveryResponseMappings: FieldMapping[]; axiosPrivate: AxiosInstance; onStartNewPayment?: () => void;
    onPreview: () => void; onSubmit: () => void;
}) {
    const [step, setStep] = useState(1);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [discoveryLoaded, setDiscoveryLoaded] = useState(false);
    const [discovering, setDiscovering] = useState(false);
    const [discoveryError, setDiscoveryError] = useState('');
    const countryNames = new Intl.DisplayNames(['en'], {type: 'region'});
    const countryLabel = (code?: string) => code ? `${countryNames.of(code) ?? code} (${code})` : '—';
    const labels: Record<string, string> = {
        ToBIC: 'Destination bank BIC', CreditorName: 'Recipient name', CreditorAccount: 'Recipient account',
        CreditorAccountType: 'Recipient account type', CreditorAgentBIC: 'Creditor agent BIC', CreditorAddress: 'Recipient address',
        DebtorName: 'Payer name', DebtorAccount: 'Payer account', DebtorAccountType: 'Payer account type', DebtorAddress: 'Payer address',
        Amount: 'Amount', Currency: 'Currency', RemittanceInformation: 'Payment description',
        SenderCountry: 'Sender country', ReceiverCountry: 'Receiver country', SenderCurrency: 'Sender currency', ReceiverCurrency: 'Receiver currency',
    };
    const mapped = (field: string) => mappings.some(mapping => mapping.internalField === field);
    const configured = (field: string) => preset.fields.find(item => item.internalField === field);
    const visible = (field: string) => mapped(field) && (configured(field)?.visible || locked(field));
    const required = (field: string) => !isOptional(field, 'papss');
    const recipientFields = groups.Recipient.filter(field => !hiddenFields.has(field));
    const payerFields = groups.Payer.filter(field => !hiddenFields.has(field));
    const paymentFields = groups['Payment details'].filter(field => !hiddenFields.has(field));
    const stepOneFields = ['ReceiverCountry', 'ToBIC', 'ReceiverCurrency', ...recipientFields.filter(field => !['ToBIC'].includes(field)), ...corridorFields.filter(field => !['ReceiverCountry', 'ReceiverCurrency'].includes(field))]
        .filter((field, index, list) => list.indexOf(field) === index);
    const stepTwoFields = [...paymentFields, ...payerFields].filter((field, index, list) => list.indexOf(field) === index);
    const missing = (fields: string[]) => fields.filter(field => required(field) && (!values[field]?.trim() || !mapped(field)));
    const receiverCurrencyUnsupported = Boolean(values.ReceiverCurrency?.trim() && values.ReceiverCurrency.trim().toUpperCase() !== 'USD');
    const stepValid = step === 1 ? missing(stepOneFields).length === 0 && !receiverCurrencyUnsupported : step === 2 ? missing(stepTwoFields).length === 0 : errors.length === 0 && !receiverCurrencyUnsupported;
    const discoveryRequestField = (internalField: string) => discoveryRequestMappings.find(mapping => mapping.internalField === internalField);
    const discoveryResponseField = (internalField: string) => discoveryResponseMappings.find(mapping => mapping.internalField === internalField);
    const discoveryUrl = paymentEndpoint.replace(/\/Payment\/?$/i, '/Discovery');
    const discoveredCountries = [...new Set(participants.map(participant => participant.country))].sort().map(value => ({value, label: `${countryNames.of(value) ?? value} (${value})`}));
    const countries = prefilled && values.ReceiverCountry && !discoveredCountries.some(option => option.value === values.ReceiverCountry)
        ? [{value: values.ReceiverCountry, label: `${countryNames.of(values.ReceiverCountry) ?? values.ReceiverCountry} (${values.ReceiverCountry})`}, ...discoveredCountries]
        : discoveredCountries;
    const discoveredBanks = participants.filter(participant => participant.country === values.ReceiverCountry).map(({value, label}) => ({value, label}));
    const banks = prefilled && values.ToBIC && !discoveredBanks.some(option => option.value === values.ToBIC)
        ? [{value: values.ToBIC, label: values.ToBIC}, ...discoveredBanks]
        : discoveredBanks;
    const selectedParticipant = participants.find(participant => participant.value === values.ToBIC);
    const destinationBankLabel = selectedParticipant?.label ?? values.ToBIC ?? '—';
    const discoveredCurrencies = (selectedParticipant?.currencies ?? []).map(value => ({value, label: value === 'USD' ? 'USD - US Dollar' : value}));
    const currencies = prefilled && values.ReceiverCurrency && !discoveredCurrencies.some(option => option.value === values.ReceiverCurrency)
        ? [{value: values.ReceiverCurrency, label: values.ReceiverCurrency === 'USD' ? 'USD - US Dollar' : values.ReceiverCurrency}, ...discoveredCurrencies]
        : discoveredCurrencies;

    const discoverParticipants = async () => {
        if (discovering || prefilled || !paymentEndpoint) return;
        setDiscovering(true); setDiscoveryError('');
        try {
            const railField = discoveryRequestField('Rail');
            const onlineField = discoveryRequestField('Online');
            const participantsField = discoveryResponseField('Participants');
            if (!railField || !participantsField) throw new Error('The backend adapter is missing PAPSS discovery mappings.');
            const payload: Record<string, string | boolean> = {[railField.userField]: 'PAPSS'};
            if (onlineField) payload[onlineField.userField] = true;
            const {data} = await axiosPrivate.post(discoveryUrl, payload);
            const rows = data?.[participantsField.userField] ?? data?.participants ?? data?.Participants;
            if (!Array.isArray(rows)) throw new Error('Discovery did not return a participant list.');
            const parsed = rows.flatMap((row: Record<string, unknown>) => {
                const bic = row.bic ?? row.Bic;
                const name = row.name ?? row.Name;
                const country = row.countryCode ?? row.CountryCode;
                const rawCurrencies = row.currencies ?? row.Currencies;
                const rowCurrencies = Array.isArray(rawCurrencies) ? rawCurrencies.filter((value): value is string => typeof value === 'string').map(value => value.trim().toUpperCase()).filter(Boolean) : [];
                if (typeof bic !== 'string' || typeof country !== 'string' || !/^[A-Z]{2}$/.test(country.trim().toUpperCase()) || !/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic.trim().toUpperCase()) || (row.online ?? row.Online) === false) return [];
                return [{value: bic.trim().toUpperCase(), label: `${typeof name === 'string' ? name : bic} — ${bic.trim().toUpperCase()}`, country: country.trim().toUpperCase(), currencies: rowCurrencies.length ? rowCurrencies : ['USD']}];
            });
            setParticipants([...new Map(parsed.map(participant => [`${participant.country}:${participant.value}`, participant])).values()]);
            setDiscoveryLoaded(true);
        } catch (error) {
            setDiscoveryError(error instanceof Error ? error.message : 'Participant discovery failed.');
        } finally {setDiscovering(false);}
    };

    const renderField = (field: string) => {
        if (hiddenFields.has(field) || !visible(field)) return null;
        const config = configured(field);
        const mapping = mappings.find(item => item.internalField === field);
        if (!mapping) return null;
        const label = config?.label && config.label !== field ? config.label : labels[field] ?? field;
        const disabled = locked(field);
        if (field === 'ReceiverCountry') {
            return <SelectInput key={field} label={label} value={values[field] ?? ''} options={countries} required={required(field)} disabled={disabled || (!prefilled && !discoveryLoaded)} onChange={event => {change(field, event.target.value); change('ToBIC', ''); change('ReceiverCurrency', '');}}/>;
        }
        if (field === 'ToBIC') {
            return <SelectInput key={field} label={label} value={values[field] ?? ''} options={banks} required={required(field)} disabled={disabled || (!prefilled && !discoveryLoaded)} onChange={event => {
                const selected = participants.find(participant => participant.value === event.target.value);
                const nextCurrency = selected?.currencies.includes('USD') ? 'USD' : selected?.currencies[0] ?? '';
                change(field, event.target.value); change('CreditorAgentBIC', event.target.value); change('ReceiverCurrency', nextCurrency);
            }}/>
        }
        if (field === 'Currency' || field === 'SenderCurrency' || field === 'ReceiverCurrency') {
            const value = values[field] || 'USD';
            const options = field === 'ReceiverCurrency' ? currencies : [{value: 'USD', label: 'USD - US Dollar'}];
            const currencyDisabled = field === 'ReceiverCurrency' ? (prefilled && disabled) : true;
            return <SelectInput key={field} label={label} value={value} options={options} required={!isOptional(field, 'papss')} errorMessage={field === 'ReceiverCurrency' && receiverCurrencyUnsupported ? 'Currently, only USD payments are supported.' : undefined} disabled={currencyDisabled} onChange={event => change(field, event.target.value)}/>;
        }
        if (field.endsWith('AccountType')) {
            return <SelectInput key={field} label={label} value={values[field] ?? ''} options={verificationMethods} required={!isOptional(field, 'papss')} disabled={disabled} onChange={event => change(field, event.target.value)}/>;
        }
        return <Input key={field} label={label} value={values[field] ?? ''} type="text" required={required(field)} disabled={disabled} onChange={event => change(field, event.target.value)}/>;
    };
    const renderFields = (fields: string[]) => fields.map(renderField);

    return <div>
        <ol className={styles.steps} aria-label="PAPSS payment steps">{['Recipient and corridor', 'Payment and payer details', 'Review'].map((label, index) => <li key={label} aria-current={step === index + 1 ? 'step' : undefined}>{index + 1}. {label}</li>)}</ol>
        <form onSubmit={event => {event.preventDefault(); if (busy || paymentSent) return; if (step < 3) {if (stepValid) setStep(step + 1);} else if (!errors.length) onSubmit();}}>
            {step === 1 && <section className={styles.section}><h2>Recipient and corridor</h2>{!prefilled && <div className={styles.actions}><ActionButton type="button" className={styles.secondary} disabled={discovering || busy} onClick={() => void discoverParticipants()}>{discovering ? 'Loading PAPSS participants…' : discoveryLoaded ? 'Reload PAPSS Participants' : 'Load PAPSS Participants'}</ActionButton></div>}{discoveryError && <p className={styles.status} role="alert">{discoveryError}</p>}{!prefilled && !discoveryLoaded && <p className={styles.note}>Load PAPSS participants to select the receiver country and destination bank.</p>}<div className={styles.grid}>{renderFields(stepOneFields)}</div></section>}
            {step === 2 && <section className={styles.section}><h2>Payment and payer details</h2><div className={styles.grid}>{renderFields(stepTwoFields)}</div></section>}
            {step === 3 && <section className={styles.reviewSection}><div className={styles.reviewHeader}><div><p className={styles.eyebrow}>Step 3 of 3</p><h2>Review PAPSS payment</h2><p>Check the corridor, verified recipient, payer, and payment details before sending.</p></div><span className={styles.reviewBadge}>PAPSS</span></div>
                <div className={styles.reviewCards}>
                    <article className={styles.reviewCard}><h3>Corridor</h3><dl className={styles.review}><dt>Sender</dt><dd>{countryLabel(values.SenderCountry)} · {values.SenderCurrency || '—'}</dd><dt>Receiver</dt><dd>{countryLabel(values.ReceiverCountry)} · {values.ReceiverCurrency || '—'}</dd><dt>Destination bank</dt><dd>{destinationBankLabel}</dd><dt>Bank BIC</dt><dd>{values.ToBIC || '—'}</dd></dl></article>
                    <article className={styles.reviewCard}><h3>Recipient</h3><dl className={styles.review}><dt>Recipient name</dt><dd>{values.CreditorName || '—'}</dd><dt>Recipient account</dt><dd>{values.CreditorAccount || '—'}</dd><dt>Account type</dt><dd>{values.CreditorAccountType || '—'}</dd><dt>Recipient address</dt><dd>{values.CreditorAddress || '—'}</dd></dl></article>
                    <article className={styles.reviewCard}><h3>Payer</h3><dl className={styles.review}><dt>Payer name</dt><dd>{values.DebtorName || '—'}</dd><dt>Payer account</dt><dd>{values.DebtorAccount || '—'}</dd><dt>Account type</dt><dd>{values.DebtorAccountType || '—'}</dd><dt>Payer address</dt><dd>{values.DebtorAddress || '—'}</dd></dl></article>
                    <article className={`${styles.reviewCard} ${styles.amountCard}`}><h3>Payment</h3><p className={styles.amountValue}>{values.Amount || '—'} <span>{values.Currency || 'USD'}</span></p><p className={styles.paymentDescription}>{values.RemittanceInformation || '—'}</p></article>
                </div>
                <div className={styles.reviewActions}><ActionButton className={styles.secondary} onClick={onPreview}>View Request JSON</ActionButton><span className={styles.reviewHint}>Technical PAPSS fields are generated or configured automatically.</span></div>
                {errors.length > 0 && <ul role="alert">{errors.map(error => <li key={error}>{error}</li>)}</ul>}
            </section>}
            {step < 3 && !stepValid && <p className={styles.note}>Complete the required PAPSS fields to continue.</p>}
            <div className={styles.actions}>{!paymentSent && step > 1 && <ActionButton className={styles.secondary} disabled={busy} onClick={() => setStep(step - 1)}>← Back</ActionButton>}{paymentSent ? <ActionButton type="button" disabled={busy} onClick={onStartNewPayment}>Start New Payment</ActionButton> : <ActionButton type="submit" disabled={busy || !stepValid}>{step < 3 ? 'Next →' : busy ? 'Sending payment…' : 'Send Payment'}</ActionButton>}</div>
        </form>
    </div>;
}
