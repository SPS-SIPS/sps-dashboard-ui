import React from 'react';
import type {FieldMapping} from '../../api/hooks/useEndpoints';
import ActionButton from '../common/ActionButton/ActionButton';
import QRDataViewer from '../ScanToPay/QRDataViewer/QRDataViewer';
import styles from './PaymentTester.module.css';

type AmountValue = {value?: number | string; currency?: string};

function formatMoney(value: number, currency: string) {
    if (!Number.isFinite(value) || !/^[A-Z]{3}$/.test(currency)) return `${value.toLocaleString('en-US')} ${currency}`;
    return new Intl.NumberFormat('en-US', {style: 'currency', currency, currencyDisplay: 'code'}).format(value);
}

function amount(value: unknown) {
    if (!value || typeof value !== 'object') return '—';
    const item = value as AmountValue;
    if (item.value === undefined || item.value === null) return '—';
    const numeric = Number(item.value);
    return item.currency && Number.isFinite(numeric) ? formatMoney(numeric, item.currency) : `${item.value}${item.currency ? ` ${item.currency}` : ''}`;
}

function numericAmount(value: unknown) {
    if (!value || typeof value !== 'object') return null;
    const number = Number((value as AmountValue).value);
    return Number.isFinite(number) ? number : null;
}

export default function PapssFxQuote({
    crossCurrency, senderCurrency, receiverCurrency, busy, canQuote, quoteLoading, error, request, endpoint, response, responseMappings,
    onGetQuote, onViewRequest, onViewResponse, viewer, onCloseViewer,
}: {
    crossCurrency: boolean; senderCurrency: string; receiverCurrency: string; busy: boolean; canQuote: boolean; quoteLoading: boolean;
    error: string; request: Record<string, unknown> | null; endpoint: string; response: unknown; responseMappings: FieldMapping[]; onGetQuote: () => void;
    onViewRequest: () => void; onViewResponse: () => void; viewer: 'request' | 'response' | null; onCloseViewer: () => void;
}) {
    if (!crossCurrency) return null;
    const result = response && typeof response === 'object' ? response as Record<string, unknown> : null;
    const responseError = result?.error && typeof result.error === 'object' ? result.error as Record<string, unknown> : null;
    const requestViewerData = request ? {method: 'POST', url: endpoint, body: request} : null;
    const read = (internalField: string, fallback: string) => {
        const mapping = responseMappings.find(item => item.internalField === internalField);
        const path = mapping?.userField ?? fallback;
        return path.split('.').reduce<unknown>((value, part) => value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined, result);
    };
    const senderAmount = read('SenderAmount', 'senderAmount');
    const nationalFee = read('NationalFeeAmount', 'nationalFeeAmount');
    const papssFee = read('FeeAmount', 'feeAmount');
    const totalDebit = [senderAmount, nationalFee, papssFee].every(value => numericAmount(value) !== null)
        ? (numericAmount(senderAmount)! + numericAmount(nationalFee)! + numericAmount(papssFee)!).toFixed(2)
        : null;
    const rates = read('Rates', 'rates');
    const selectedRate = Array.isArray(rates)
        ? rates.find(rate => rate && typeof rate === 'object' && String((rate as Record<string, unknown>).type ?? '').toUpperCase() === `${senderCurrency}/${receiverCurrency}`) ?? rates[0]
        : null;
    const rateText = selectedRate && typeof selectedRate === 'object' && (selectedRate as Record<string, unknown>).value !== undefined
        ? `1 ${senderCurrency} = ${String((selectedRate as Record<string, unknown>).value)} ${receiverCurrency}`
        : '—';
    return <section className={styles.fxQuote} aria-label="PAPSS foreign exchange quote">
        <div className={styles.fxHeader}>
            <div><h3>Foreign exchange quote</h3><p>Get the current PAPSS quote before sending this cross-currency payment.</p></div>
            <span className={styles.fxBadge}>{senderCurrency} → {receiverCurrency}</span>
        </div>
        <div className={styles.actions}>
            <ActionButton type="button" disabled={busy || quoteLoading || !canQuote} onClick={onGetQuote}>{quoteLoading ? 'Getting FX quote…' : 'Get FX quote'}</ActionButton>
            {request && <ActionButton type="button" className={styles.secondary} onClick={onViewRequest}>View FX Request</ActionButton>}
            {Boolean(response) && <ActionButton type="button" className={styles.secondary} onClick={onViewResponse}>View FX Response</ActionButton>}
        </div>
        {error && <p className={styles.status} role="alert">{error}</p>}
        {responseError && <p className={styles.status} role="alert">{String(responseError.description ?? responseError.message ?? responseError.code ?? 'FX quote failed.')}</p>}
        {result && !responseError && <div className={styles.fxSummary}>
            <article className={styles.fxPanel}><h4>Payment summary</h4>
                <div className={styles.fxLine}><span>Payment amount</span><strong>{amount(senderAmount)}</strong></div>
                <div className={styles.fxLine}><span>National fee</span><strong>{amount(nationalFee)}</strong></div>
                <div className={styles.fxLine}><span>PAPSS fee</span><strong>{amount(papssFee)}</strong></div>
                <div className={styles.fxTotal}><span>Estimated total debit</span><strong>{totalDebit === null ? '—' : formatMoney(Number(totalDebit), typeof senderAmount === 'object' && senderAmount && 'currency' in senderAmount ? String((senderAmount as AmountValue).currency ?? senderCurrency) : senderCurrency)}</strong></div>
            </article>
            <article className={styles.fxPanel}><h4>Exchange</h4>
                <div className={styles.fxLine}><span>Exchange rate</span><strong>{rateText}</strong></div>
                <div className={styles.fxRecipient}><span>Recipient receives</span><strong>{amount(read('ReceiverAmount', 'receiverAmount'))}</strong></div>
            </article>
        </div>}
        <QRDataViewer isOpen={viewer === 'request'} data={requestViewerData} title="FX Request" subtitle="The HTTP method, endpoint URL, and exact request body sent to the PAPSS FX endpoint." onClose={onCloseViewer}/>
        <QRDataViewer isOpen={viewer === 'response'} data={response} title="FX Response" subtitle="The exact response returned by the PAPSS FX endpoint." onClose={onCloseViewer}/>
    </section>;
}
