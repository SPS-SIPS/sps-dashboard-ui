import type {FieldMapping} from '../api/hooks/useEndpoints';
export type PaymentType = 'account' | 'staticQr' | 'dynamicQr' | 'p2g' | 'papss';
export const paymentTypes = [{value: 'account', label: 'Account Transfer'}, {value: 'staticQr', label: 'P2M Static SOMQR'}, {value: 'dynamicQr', label: 'P2M Dynamic SOMQR'}];
export const purposes: Record<PaymentType, string> = {account: 'C2CCRT', staticQr: 'C2BSQR', dynamicQr: 'C2BDQR', p2g: '', papss: ''};
export const groups: Record<string, string[]> = {
    Recipient: ['ToBIC', 'CreditorName', 'CreditorAccount', 'CreditorAccountType', 'CreditorAgentBIC', 'CreditorAddress'],
    Payer: ['DebtorName', 'DebtorAccount', 'DebtorAccountType', 'DebtorAddress'],
    'Payment details': ['Amount', 'Currency', 'EndToEndId', 'RemittanceInformation'],
    'Bill references': ['BillReference', 'InvoiceId', 'Upr', 'AmountPayable'],
    'PAPSS corridor': ['SenderCountry', 'ReceiverCountry', 'SenderCurrency', 'ReceiverCurrency', 'DebtorAgentBIC'],
    'Technical fields': ['Rail', 'LocalInstrument', 'CategoryPurpose', 'CreditorIssuer', 'DebtorIssuer', 'TxId'],
};
export const optionalFields = new Set(['Rail', 'CreditorAddress', 'DebtorAddress', 'CreditorIssuer', 'DebtorIssuer', 'TxId', 'RemittanceInformation', 'BillReference', 'InvoiceId', 'Upr', 'AmountPayable', 'SenderCountry', 'ReceiverCountry', 'SenderCurrency']);
export const applicableFields = Object.entries(groups).filter(([name]) => !['Bill references', 'PAPSS corridor'].includes(name)).flatMap(([, fields]) => fields);
export function fieldsFor(type: PaymentType) {return [...applicableFields, ...(type === 'p2g' ? groups['Bill references'] : type === 'papss' ? groups['PAPSS corridor'] : [])];}
export function isOptional(field: string, type: PaymentType) {
    if (['account', 'staticQr', 'dynamicQr'].includes(type) && field === 'RemittanceInformation') return false;
    return type === 'papss' && ['Rail', 'TxId'].includes(field) ? false : optionalFields.has(field);
}
export function paymentDefaults(type: PaymentType): Record<string, string> {return type === 'papss' ? {Rail: 'PAPSS'} : type === 'p2g' ? {Rail: 'SIPS', LocalInstrument: 'CRTRM', CategoryPurpose: 'C2GCRT'} : {Rail: 'SIPS', LocalInstrument: 'CRTRM', CategoryPurpose: purposes[type]};}
export function paymentMappings(mappings: FieldMapping[], paymentType: PaymentType = 'account') {
    return fieldsFor(paymentType).flatMap(field => {const mapping = mappings.find(m => m.internalField === field); return mapping ? [mapping] : [];});
}
export function buildPaymentPayload(values: Record<string, string>, mappings: FieldMapping[], paymentType: PaymentType = 'account') {
    const payload: Record<string, unknown> = {};
    const errors: string[] = [];
    for (const field of fieldsFor(paymentType).filter(f => !isOptional(f, paymentType))) {
        if (!mappings.some(m => m.internalField === field)) errors.push(`Adapter is missing ${field}.`);
    }
    for (const mapping of paymentMappings(mappings, paymentType)) {
        const value = (values[mapping.internalField] ?? '').trim();
        if (!value) {if (!isOptional(mapping.internalField, paymentType)) errors.push(`${mapping.userField} is required.`); continue;}
        let converted: unknown = value;
        if (['Amount', 'AmountPayable'].includes(mapping.internalField) && (!Number.isFinite(Number(value)) || Number(value) <= 0)) {errors.push('Amount must be greater than zero.'); continue;}
        const type = mapping.type.toLowerCase();
        if (['double', 'decimal', 'number', 'float', 'int', 'integer', 'long'].includes(type)) {
            converted = Number(value);
            if (!Number.isFinite(converted) || (['int', 'integer', 'long'].includes(type) && !Number.isSafeInteger(converted))) {errors.push(`${mapping.userField} must be a valid ${type}.`); continue;}
        } else if (['boolean', 'bool'].includes(type)) {
            if (!['true', 'false'].includes(value)) {errors.push(`${mapping.userField} must be true or false.`); continue;}
            converted = value === 'true';
        } else if (type !== 'string') {errors.push(`Unsupported adapter type for ${mapping.userField}: ${mapping.type}.`); continue;}
        const path = mapping.userField.split('.');
        if (path.some(p => !p || ['__proto__', 'constructor', 'prototype'].includes(p))) {errors.push(`Invalid JSON path: ${mapping.userField}.`); continue;}
        let target = payload;
        let collision = false;
        for (const part of path.slice(0, -1)) {
            if (part in target && (typeof target[part] !== 'object' || target[part] === null)) {collision = true; break;}
            target[part] ??= {}; target = target[part] as Record<string, unknown>;
        }
        const last = path[path.length - 1];
        if (collision || last in target) {errors.push(`Conflicting JSON path: ${mapping.userField}.`); continue;}
        target[last] = converted;
    }
    if (paymentType === 'p2g') {
        const references = ['BillReference', 'InvoiceId', 'Upr'].filter(field => values[field]?.trim() && mappings.some(m => m.internalField === field));
        if (references.length !== 1) errors.push('Provide exactly one bill reference, invoice ID, or UPR.');
        if (values.AmountPayable?.trim() && Number(values.AmountPayable) !== Number(values.Amount)) errors.push('Amount and AmountPayable must match; the backend uses AmountPayable when supplied.');
    }
    if (paymentType === 'papss') {
        for (const field of ['SenderCountry', 'ReceiverCountry', 'SenderCurrency', 'ReceiverCurrency', 'Currency']) {
            const value = values[field]?.trim();
            if (value && !(field.endsWith('Country') ? /^[A-Z]{2}$/ : /^[A-Z]{3}$/).test(value)) errors.push(`${field} must be an uppercase ${field.endsWith('Country') ? 'two-letter country' : 'three-letter currency'} code.`);
        }
        if (values.SenderCurrency?.trim() && values.SenderCurrency.trim() !== values.Currency?.trim()) errors.push('SenderCurrency must match Currency.');
    }
    return {payload, errors};
}

