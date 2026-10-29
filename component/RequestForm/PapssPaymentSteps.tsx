import React, {useEffect, useState} from 'react';
import type {AxiosInstance} from 'axios';
import type {FieldMapping} from '../../api/hooks/useEndpoints';
import type {PaymentPreset} from '../../utils/paymentFormConfig';
import {groups, isOptional} from '../../utils/paymentForms';
import {verificationMethods} from '../../constants/gatewayFormOptions';
import {PAPSS_PURPOSE_CODES} from '../../constants/papssPurposeCodes';
import Input from '../common/Input/Input';
import SelectInput from '../common/SelectInput/SelectInput';
import ActionButton from '../common/ActionButton/ActionButton';
import PapssFxQuote from './PapssFxQuote';
import styles from './PaymentTester.module.css';

const hiddenFields = new Set(['Rail', 'LocalInstrument', 'EndToEndId', 'TxId', 'CategoryPurpose', 'Currency', 'CreditorIssuer', 'DebtorIssuer', 'DebtorAgentBIC', 'CreditorAgentBIC', 'SenderCountry', 'SenderCurrency']);
const corridorFields = ['SenderCountry', 'SenderCurrency', 'ReceiverCountry', 'ReceiverCurrency'];
type Participant = {value: string; label: string; country: string; currencies: string[]};

const formatMoney = (value: string | undefined, currency: string | undefined) => {
    const numeric = Number(value);
    const code = (currency ?? '').trim().toUpperCase();
    if (!Number.isFinite(numeric) || !/^[A-Z]{3}$/.test(code)) return value || '—';
    return new Intl.NumberFormat('en-US', {style: 'currency', currency: code, currencyDisplay: 'code'}).format(numeric);
};

export default function PapssPaymentSteps({values, mappings, preset, locked, change, errors, busy, paymentSent, prefilled = false, paymentEndpoint, discoveryRequestMappings, discoveryResponseMappings, fxRequestMappings, fxResponseMappings, axiosPrivate, onStartNewPayment, onPreview, onSubmit}: {
    values: Record<string, string>; mappings: FieldMapping[]; preset: PaymentPreset;
    locked: (field: string) => boolean; change: (field: string, value: string) => void;
    errors: string[]; busy: boolean; paymentSent: boolean; prefilled?: boolean; paymentEndpoint: string; discoveryRequestMappings: FieldMapping[]; discoveryResponseMappings: FieldMapping[]; fxRequestMappings: FieldMapping[]; fxResponseMappings: FieldMapping[]; axiosPrivate: AxiosInstance; onStartNewPayment?: () => void;
    onPreview: () => void; onSubmit: () => void;
}) {
    const [step, setStep] = useState(1);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [discoveryLoaded, setDiscoveryLoaded] = useState(false);
    const [discovering, setDiscovering] = useState(false);
    const [discoveryError, setDiscoveryError] = useState('');
    const [fxRequest, setFxRequest] = useState<Record<string, unknown> | null>(null);
    const [fxResponse, setFxResponse] = useState<unknown>(null);
    const [fxError, setFxError] = useState('');
    const [fxLoading, setFxLoading] = useState(false);
    const [fxViewer, setFxViewer] = useState<'request' | 'response' | null>(null);
    const countryNames = new Intl.DisplayNames(['en'], {type: 'region'});
    const countryLabel = (code?: string) => code ? `${countryNames.of(code) ?? code} (${code})` : '—';
    const labels: Record<string, string> = {
        ToBIC: 'Destination bank BIC', CreditorName: 'Recipient name', CreditorAccount: 'Recipient account',
        CreditorAccountType: 'Recipient account type', CreditorAgentBIC: 'Creditor agent BIC', CreditorAddress: 'Recipient address',
        DebtorName: 'Payer name', DebtorAccount: 'Payer account', DebtorAccountType: 'Payer account type', DebtorAddress: 'Payer address',
        Amount: 'Amount', Currency: 'Currency', CategoryPurpose: 'Payment purpose', RemittanceInformation: 'Describe the payment',
        SenderCountry: 'Sender country', ReceiverCountry: 'Receiver country', SenderCurrency: 'Sender currency', ReceiverCurrency: 'Receiver currency',
    };
    const mapped = (field: string) => mappings.some(mapping => mapping.internalField === field);
    const configured = (field: string) => preset.fields.find(item => item.internalField === field);
    const visible = (field: string) => mapped(field) && (configured(field)?.visible || locked(field));
    const required = (field: string) => !isOptional(field, 'papss');
    const recipientFields = groups.Recipient.filter(field => !hiddenFields.has(field));
    const payerFields = groups.Payer.filter(field => !hiddenFields.has(field));
    const paymentFields = groups['Payment details'].filter(field => !hiddenFields.has(field));
    const stepOneFields = ['ReceiverCountry', 'ToBIC', ...recipientFields.filter(field => !['ToBIC'].includes(field)), ...corridorFields.filter(field => !['ReceiverCountry', 'ReceiverCurrency'].includes(field))]
        .filter((field, index, list) => list.indexOf(field) === index);
    const stepTwoFields = ['Amount', 'RemittanceInformation', 'Currency', 'ReceiverCurrency'].filter(field => paymentFields.includes(field) || field === 'ReceiverCurrency');
    const stepThreeFields = payerFields;
    const missing = (fields: string[]) => fields.filter(field => required(field) && (!values[field]?.trim() || !mapped(field)));
    const purposeInvalid = Boolean(values.CategoryPurpose?.trim() && !PAPSS_PURPOSE_CODES.some(option => option.value === values.CategoryPurpose));
    const senderCurrency = (values.SenderCurrency || values.Currency || '').trim().toUpperCase();
    const receiverCurrency = (values.ReceiverCurrency || '').trim().toUpperCase();
    const crossCurrency = Boolean(senderCurrency && receiverCurrency && senderCurrency !== receiverCurrency);
    const receiverCurrencyInvalid = Boolean(receiverCurrency && !/^[A-Z]{3}$/.test(receiverCurrency));
    const fxInputReady = Boolean(values.SenderCountry && values.ReceiverCountry && values.ToBIC && senderCurrency && receiverCurrency && Number(values.Amount) > 0 && !receiverCurrencyInvalid);
    const fxResult = fxResponse && typeof fxResponse === 'object' ? fxResponse as Record<string, unknown> : null;
    const fxReady = !crossCurrency || Boolean(fxResult && !fxResult.error && !fxError);
    const stepValid = step === 1 ? missing(stepOneFields).length === 0 : step === 2 ? missing(stepTwoFields).length === 0 && !purposeInvalid && !receiverCurrencyInvalid && fxReady : step === 3 ? missing(stepThreeFields).length === 0 : errors.length === 0 && !receiverCurrencyInvalid && !purposeInvalid && fxReady;
    const discoveryRequestField = (internalField: string) => discoveryRequestMappings.find(mapping => mapping.internalField === internalField);
    const discoveryResponseField = (internalField: string) => discoveryResponseMappings.find(mapping => mapping.internalField === internalField);
    const discoveryUrl = paymentEndpoint.replace(/\/Payment\/?$/i, '/Discovery');
    const fxUrl = paymentEndpoint.replace(/\/Payment\/?$/i, '/FX');
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
    const carriedCurrencies = (values.PAPSSReceiverCurrencies ?? '').split(',').map(value => value.trim().toUpperCase()).filter(value => /^[A-Z]{3}$/.test(value));
    const discoveredCurrencies = [...new Set([...(selectedParticipant?.currencies ?? []), ...carriedCurrencies])].map(value => ({value, label: value === 'USD' ? 'USD - US Dollar' : value}));
    const currencies = discoveredCurrencies;

    // Discovery is authoritative for a prefilled payment. Do not keep a
    // verification account currency when the selected participant does not
    // support it (for example, verification returns USD but the bank only
    // supports ZAR).
    useEffect(() => {
        if (!prefilled || !currencies.length) return;
        const current = (values.ReceiverCurrency ?? '').trim().toUpperCase();
        if (!currencies.some(option => option.value === current)) {
            const next = currencies[0].value;
            change('ReceiverCurrency', next);
            change('LocalInstrument', senderCurrency && next !== senderCurrency ? 'SSA3' : 'USDP');
        }
    }, [prefilled, currencies, values.ReceiverCurrency, senderCurrency, change]);

    const updateValue = (field: string, value: string) => {
        if (['ReceiverCountry', 'ToBIC', 'ReceiverCurrency', 'Amount'].includes(field)) {
            setFxRequest(null); setFxResponse(null); setFxError(''); setFxViewer(null);
        }
        change(field, value);
        if (field === 'ReceiverCurrency') change('LocalInstrument', senderCurrency && value.trim().toUpperCase() !== senderCurrency ? 'SSA3' : 'USDP');
    };

    const setMappedValue = (target: Record<string, unknown>, path: string, value: unknown) => {
        const parts = path.split('.').filter(Boolean);
        if (!parts.length) return;
        let current = target;
        parts.slice(0, -1).forEach(part => {current[part] ??= {}; current = current[part] as Record<string, unknown>;});
        current[parts[parts.length - 1]] = value;
    };

    const getFxQuote = async () => {
        if (fxLoading || !crossCurrency) return;
        if (!fxRequestMappings.length) {setFxError('The backend adapter does not expose PAPSS FX request mappings.'); return;}
        setFxLoading(true); setFxError(''); setFxResponse(null); setFxViewer(null);
        const internalValues: Record<string, unknown> = {
            Rail: 'PAPSS', SenderCountry: values.SenderCountry, ReceiverCountry: values.ReceiverCountry,
            SenderCurrency: senderCurrency, ReceiverCurrency: receiverCurrency, ReceiverBank: values.ToBIC,
            LocalInstrument: 'SSA3', Amount: Number(values.Amount), IsInvoice: false,
        };
        const payload: Record<string, unknown> = {};
        for (const mapping of fxRequestMappings) {
            const value = internalValues[mapping.internalField];
            if (value === undefined || value === '') continue;
            setMappedValue(payload, mapping.userField, value);
        }
        setFxRequest(payload);
        try {
            const {data} = await axiosPrivate.post(fxUrl, payload);
            setFxResponse(data);
            const result = data && typeof data === 'object' ? data as Record<string, unknown> : null;
            const responseError = result?.error && typeof result.error === 'object' ? result.error as Record<string, unknown> : null;
            if (responseError) setFxError(String(responseError.description ?? responseError.message ?? responseError.code ?? 'FX quote failed.'));
        } catch (error) {
            const response = (error as {response?: {data?: unknown}}).response?.data;
            setFxResponse(response ?? null);
            const body = response && typeof response === 'object' ? response as Record<string, unknown> : null;
            const responseError = body?.error && typeof body.error === 'object' ? body.error as Record<string, unknown> : null;
            setFxError(String(responseError?.description ?? body?.message ?? (error instanceof Error ? error.message : 'FX quote request failed.')));
        } finally {setFxLoading(false);}
    };

    const fxDisplay = (internalField: string, fallback: string) => {
        const result = fxResponse && typeof fxResponse === 'object' ? fxResponse as Record<string, unknown> : null;
        const mapping = fxResponseMappings.find(item => item.internalField === internalField);
        const raw = (mapping?.userField ?? fallback).split('.').reduce<unknown>((value, part) => value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined, result);
        if (!raw || typeof raw !== 'object') return '—';
        const amount = raw as {value?: unknown; currency?: unknown};
        return amount.value === undefined ? '—' : `${amount.value}${amount.currency ? ` ${amount.currency}` : ''}`;
    };

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
        const config = configured(field);
        const mapping = mappings.find(item => item.internalField === field);
        if (!mapping) return null;
        const isPurposeNarration = field === 'RemittanceInformation';
        if (hiddenFields.has(field) || (!isPurposeNarration && !visible(field))) return null;
        const label = config?.label && config.label !== field ? config.label : labels[field] ?? field;
        const disabled = locked(field);
        // PAPSS uses the selected purpose label as the narration. Only ask for
        // free text when the user selects the catch-all OTHR purpose.
        if (field === 'RemittanceInformation') {
            const selectedPurpose = PAPSS_PURPOSE_CODES.some(option => option.value === values.CategoryPurpose) ? values.CategoryPurpose : '';
            const purposeLabel = labels.CategoryPurpose;
            const purposeSelect = <SelectInput key={`${field}-purpose`} label={purposeLabel} value={selectedPurpose} options={PAPSS_PURPOSE_CODES.map(option => ({value: option.value, label: option.label}))} required disabled={disabled} onChange={event => {
                const purpose = PAPSS_PURPOSE_CODES.find(option => option.value === event.target.value);
                change('CategoryPurpose', event.target.value);
                change('RemittanceInformation', purpose?.value === 'OTHR' ? '' : purpose?.label ?? '');
            }} />;
            if (selectedPurpose !== 'OTHR') return purposeSelect;
            return <React.Fragment key={field}>{purposeSelect}<Input label={labels.RemittanceInformation} value={values[field] ?? ''} type="text" required disabled={disabled} placeholder="Describe the payment" onChange={event => change(field, event.target.value)}/></React.Fragment>;
        }
        if (field === 'ReceiverCountry') {
            return <SelectInput key={field} label={label} value={values[field] ?? ''} options={countries} required={required(field)} disabled={disabled || (!prefilled && !discoveryLoaded)} onChange={event => {updateValue(field, event.target.value); updateValue('ToBIC', ''); updateValue('ReceiverCurrency', '');}}/>;
        }
        if (field === 'ToBIC') {
            return <SelectInput key={field} label={label} value={values[field] ?? ''} options={banks} required={required(field)} disabled={disabled || (!prefilled && !discoveryLoaded)} onChange={event => {
                const selected = participants.find(participant => participant.value === event.target.value);
                const nextCurrency = selected?.currencies.includes('USD') ? 'USD' : selected?.currencies[0] ?? '';
                updateValue(field, event.target.value); updateValue('CreditorAgentBIC', event.target.value); updateValue('ReceiverCurrency', nextCurrency);
            }}/>
        }
        if (field === 'Currency' || field === 'SenderCurrency' || field === 'ReceiverCurrency') {
            const options = field === 'ReceiverCurrency' ? currencies : [{value: 'USD', label: 'USD - US Dollar'}];
            const value = field === 'ReceiverCurrency'
                ? options.some(option => option.value === values[field]) ? values[field] : options[0]?.value ?? ''
                : values[field] || 'USD';
            const currencyDisabled = field === 'ReceiverCurrency' ? false : true;
            return <SelectInput key={field} label={label} value={value} options={options} required={!isOptional(field, 'papss')} errorMessage={field === 'ReceiverCurrency' && receiverCurrencyInvalid ? 'Enter a valid three-letter currency code.' : undefined} disabled={currencyDisabled} onChange={event => updateValue(field, event.target.value)}/>;
        }
        if (field.endsWith('AccountType')) {
            return <SelectInput key={field} label={label} value={values[field] ?? ''} options={verificationMethods} required={!isOptional(field, 'papss')} disabled={disabled} onChange={event => change(field, event.target.value)}/>;
        }
        return <Input key={field} label={label} value={values[field] ?? ''} type="text" required={required(field)} disabled={disabled} onChange={event => updateValue(field, event.target.value)}/>;
    };
    const renderFields = (fields: string[]) => fields.map(renderField);

    return <div>
        <ol className={styles.steps} aria-label="PAPSS payment steps">{['Recipient and corridor', 'Amount and FX', 'Payer details', 'Review and send'].map((label, index) => <li key={label} aria-current={step === index + 1 ? 'step' : undefined}>{index + 1}. {label}</li>)}</ol>
        <form onSubmit={event => {event.preventDefault(); if (busy || paymentSent) return; if (step < 4) {if (stepValid) setStep(step + 1);} else if (!errors.length) onSubmit();}}>
            {step === 1 && <section className={styles.section}><h2>Recipient and corridor</h2>{!prefilled && <div className={styles.actions}><ActionButton type="button" className={styles.secondary} disabled={discovering || busy} onClick={() => void discoverParticipants()}>{discovering ? 'Loading PAPSS participants…' : discoveryLoaded ? 'Reload PAPSS Participants' : 'Load PAPSS Participants'}</ActionButton></div>}{discoveryError && <p className={styles.status} role="alert">{discoveryError}</p>}{!prefilled && !discoveryLoaded && <p className={styles.note}>Load PAPSS participants to select the receiver country and destination bank.</p>}<div className={styles.grid}>{renderFields(stepOneFields)}</div></section>}
            {step === 2 && <section className={styles.section}><h2>Amount and FX</h2><div className={styles.grid}>{renderFields(stepTwoFields)}</div><PapssFxQuote crossCurrency={crossCurrency} senderCurrency={senderCurrency} receiverCurrency={receiverCurrency} busy={busy} canQuote={fxInputReady} quoteLoading={fxLoading} error={fxError} request={fxRequest} endpoint={fxUrl} response={fxResponse} responseMappings={fxResponseMappings} onGetQuote={() => void getFxQuote()} onViewRequest={() => setFxViewer('request')} onViewResponse={() => setFxViewer('response')} viewer={fxViewer} onCloseViewer={() => setFxViewer(null)}/></section>}
            {step === 3 && <section className={styles.section}><h2>Payer details</h2><div className={styles.grid}>{renderFields(stepThreeFields)}</div></section>}
            {step === 4 && <section className={styles.reviewSection}><div className={styles.reviewHeader}><div><p className={styles.eyebrow}>Step 4 of 4</p><h2>Review PAPSS payment</h2><p>Check the corridor, payment amount, FX quote, payer, and recipient before sending.</p></div><span className={styles.reviewBadge}>PAPSS</span></div>
                <div className={styles.reviewCards}>
                    <article className={styles.reviewCard}><h3>Corridor</h3><dl className={styles.review}><dt>Sender</dt><dd>{countryLabel(values.SenderCountry)} · {values.SenderCurrency || '—'}</dd><dt>Receiver</dt><dd>{countryLabel(values.ReceiverCountry)} · {values.ReceiverCurrency || '—'}</dd><dt>Destination bank</dt><dd>{destinationBankLabel}</dd><dt>Bank BIC</dt><dd>{values.ToBIC || '—'}</dd></dl></article>
                    <article className={styles.reviewCard}><h3>Recipient</h3><dl className={styles.review}><dt>Recipient name</dt><dd>{values.CreditorName || '—'}</dd><dt>Recipient account</dt><dd>{values.CreditorAccount || '—'}</dd><dt>Account type</dt><dd>{values.CreditorAccountType || '—'}</dd><dt>Recipient address</dt><dd>{values.CreditorAddress || '—'}</dd></dl></article>
                    <article className={styles.reviewCard}><h3>Payer</h3><dl className={styles.review}><dt>Payer name</dt><dd>{values.DebtorName || '—'}</dd><dt>Payer account</dt><dd>{values.DebtorAccount || '—'}</dd><dt>Account type</dt><dd>{values.DebtorAccountType || '—'}</dd><dt>Payer address</dt><dd>{values.DebtorAddress || '—'}</dd></dl></article>
                    <article className={`${styles.reviewCard} ${styles.amountCard}`}><h3>Payment</h3><p className={styles.amountValue}>{formatMoney(values.Amount, values.Currency || 'USD')}</p><dl className={styles.review}><dt>Payment purpose</dt><dd>{PAPSS_PURPOSE_CODES.find(option => option.value === values.CategoryPurpose)?.label || '—'}{values.CategoryPurpose ? ` (${values.CategoryPurpose})` : ''}</dd>{values.CategoryPurpose === 'OTHR' && <><dt>Purpose details</dt><dd>{values.RemittanceInformation || '—'}</dd></>}{crossCurrency && <><dt>FX status</dt><dd>{fxReady ? 'Quote received' : 'Quote required'}</dd><dt>Receiver amount</dt><dd>{fxDisplay('ReceiverAmount', 'receiverAmount')}</dd><dt>National fee</dt><dd>{fxDisplay('NationalFeeAmount', 'nationalFeeAmount')}</dd><dt>PAPSS fee</dt><dd>{fxDisplay('FeeAmount', 'feeAmount')}</dd></>}</dl></article>
                </div>
                <div className={styles.reviewActions}><ActionButton className={styles.secondary} onClick={onPreview}>View Request JSON</ActionButton><span className={styles.reviewHint}>Technical PAPSS fields are generated or configured automatically.</span></div>
                {errors.length > 0 && <ul role="alert">{errors.map(error => <li key={error}>{error}</li>)}</ul>}
            </section>}
            {step < 4 && !stepValid && <p className={styles.note}>{crossCurrency && !fxReady ? 'Get a successful FX quote before continuing.' : 'Complete the required PAPSS fields to continue.'}</p>}
            <div className={styles.actions}>{!paymentSent && step > 1 && <ActionButton className={styles.secondary} disabled={busy} onClick={() => setStep(step - 1)}>← Back</ActionButton>}{paymentSent ? <ActionButton type="button" disabled={busy} onClick={onStartNewPayment}>Start New Payment</ActionButton> : <ActionButton type="submit" disabled={busy || !stepValid}>{step < 4 ? 'Next →' : busy ? 'Sending payment…' : 'Send Payment'}</ActionButton>}</div>
        </form>
    </div>;
}
