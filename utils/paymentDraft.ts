export const PAYMENT_DRAFT_KEY = 'sips.payment-draft';
const MAX_AGE = 30 * 60 * 1000;

export function paymentPrefill(data: Record<string, unknown>): Record<string, string> {
    if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error('Invalid payment details. Verify the recipient again.');
    const paymentType = data.PaymentType ?? (data.CategoryPurpose === 'C2BDQR' ? 'dynamicQr' : data.CategoryPurpose === 'C2BSQR' ? 'staticQr' : 'account');
    if ((data.Rail && data.Rail !== 'SIPS') || !['account', 'staticQr', 'dynamicQr', 'p2g'].includes(String(paymentType))) throw new Error('This payment flow is not supported yet.');
    const fields: Record<string, string> = paymentType === 'p2g' ? {
        ToBIC: 'ToBIC', CreditorAgentBIC: 'ToBIC', CreditorAccount: 'CreditorAccount',
        CreditorAccountType: 'CreditorAccountType', CreditorName: 'CreditorName', CreditorAddress: 'CreditorAddress',
        Currency: 'Currency', Amount: 'Amount', CategoryPurpose: 'CategoryPurpose',
        AmountPayable: 'AmountPayable', BillReference: 'BillReference', InvoiceId: 'InvoiceId', Upr: 'Upr',
        MdaCode: 'MdaCode', ServiceCode: 'ServiceCode', DueDate: 'DueDate', PayerReference: 'PayerReference',
        RemittanceInformation: 'RemittanceInformation',
    } : {
        ToBIC: 'ToBIC', CreditorAgentBIC: 'ToBIC', CreditorAccount: 'AccountNo',
        CreditorAccountType: 'AccountType', CreditorName: 'Name', CreditorAddress: 'Address',
        Currency: 'Currency', Amount: 'Amount', CategoryPurpose: 'CategoryPurpose',
    };
    const result: Record<string, string> = {};
    for (const [target, source] of Object.entries(fields)) {
        const value = data[source];
        if ((typeof value === 'string' || typeof value === 'number') && String(value).trim()) result[target] = String(value).trim();
    }
    if (paymentType !== 'dynamicQr' && paymentType !== 'p2g') delete result.Amount;
    return {...result, PaymentType: String(paymentType), Rail: 'SIPS', LocalInstrument: 'CRTRM', CreditorIssuer: 'C', ...(paymentType === 'p2g' ? {CategoryPurpose: 'C2GCRT'} : {})};
}

export function readPaymentDraft(raw: string | null, id: string, now = Date.now()): Record<string, string> {
    if (!raw) throw new Error('Payment draft is unavailable. Verify the recipient again.');
    const draft = JSON.parse(raw);
    if (draft?.id !== id || typeof draft.createdAt !== 'number' || now - draft.createdAt > MAX_AGE || draft.createdAt > now ||
        !draft.data || typeof draft.data !== 'object' || Array.isArray(draft.data)) {
        throw new Error('Payment draft has expired or is invalid. Verify the recipient again.');
    }
    return paymentPrefill(draft.data);
}
