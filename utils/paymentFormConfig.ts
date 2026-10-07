import type {FieldMapping} from '../api/hooks/useEndpoints';
import {fieldsFor, isOptional, paymentDefaults, type PaymentType} from './paymentForms';
export type {PaymentType} from './paymentForms';
export const presetIds: PaymentType[] = ['account', 'staticQr', 'dynamicQr', 'p2g', 'papss'];
export const p2gReferenceTypes = ['BillReference', 'InvoiceId', 'Upr'] as const;
export type P2GReferenceType = typeof p2gReferenceTypes[number];
export type P2GReferenceSettings = {enabled: P2GReferenceType[]; default: P2GReferenceType};
export type PaymentFieldConfig = {internalField: string; label: string; userField?: string; visible: boolean; defaultValue?: string};
export type PaymentPreset = {fields: PaymentFieldConfig[]; referenceTypes?: P2GReferenceSettings};
export type PaymentForms = {version: 1; presets: Record<PaymentType, PaymentPreset>};
export const defaultableFields = new Set(['Currency', 'CreditorIssuer', 'DebtorIssuer', 'LocalInstrument', 'CategoryPurpose', 'SenderCountry', 'SenderCurrency', 'ReceiverCurrency']);
export function createDefaultPaymentForms(): PaymentForms {
    return {version: 1, presets: Object.fromEntries(presetIds.map(id => [id, {fields: fieldsFor(id).map(internalField => ({
        internalField,
        label: internalField,
        visible: !(id === 'papss' && ['DebtorAgentBIC', 'CreditorAgentBIC', 'SenderCountry', 'SenderCurrency'].includes(internalField)),
        ...(id === 'papss' && internalField === 'LocalInstrument' ? {defaultValue: 'USDP'} : {}),
        ...(id === 'papss' && internalField === 'CategoryPurpose' ? {defaultValue: 'CASH'} : {}),
        ...(id === 'papss' && internalField === 'SenderCountry' ? {defaultValue: 'SO'} : {}),
        ...(id === 'papss' && internalField === 'SenderCurrency' ? {defaultValue: 'USD'} : {}),
        ...(id === 'papss' && internalField === 'ReceiverCurrency' ? {defaultValue: 'USD'} : {}),
    })), ...(id === 'p2g' ? {referenceTypes: {enabled: [...p2gReferenceTypes], default: 'BillReference'}} : {})}])) as PaymentForms['presets']};
}
export function validatePaymentPreset(id: PaymentType, value: unknown, mappings?: FieldMapping[]): string[] {
    const errors: string[] = [];
    const fields = (value as PaymentPreset)?.fields;
    if (!value || Object.keys(value).some(key => key !== 'fields' && !(id === 'p2g' && key === 'referenceTypes')) || !Array.isArray(fields) || fields.length !== fieldsFor(id).length) return ['Invalid payment field configuration.'];
    if (id === 'p2g' && (value as PaymentPreset).referenceTypes !== undefined) {
        const references = (value as PaymentPreset).referenceTypes;
        if (!references || !Array.isArray(references.enabled) || references.enabled.length === 0 || references.enabled.some(type => !p2gReferenceTypes.includes(type)) || new Set(references.enabled).size !== references.enabled.length || !p2gReferenceTypes.includes(references.default) || !references.enabled.includes(references.default)) {
            errors.push('P2G must keep at least one valid reference type enabled, and the default must be enabled.');
        }
    }
    if (id !== 'p2g' && 'referenceTypes' in (value as object)) errors.push('Reference types are only supported for P2G.');
    const seen = new Set<string>();
    for (const field of fields) {
        if (!field || !fieldsFor(id).includes(field.internalField) || seen.has(field.internalField)) {errors.push('Unknown or duplicated payment field.'); continue;}
        seen.add(field.internalField);
        if (Object.keys(field).some(key => !['internalField', 'label', 'userField', 'visible', 'defaultValue'].includes(key))) errors.push('Unknown field setting.');
        if (typeof field.label !== 'string' || !field.label.trim() || field.label.length > 100) errors.push('Labels must contain 1–100 characters.');
        const hiddenAutomatic = id === 'papss' && ['CreditorAgentBIC', 'DebtorAgentBIC'].includes(field.internalField);
        if (typeof field.visible !== 'boolean' || (!field.visible && (!isOptional(field.internalField, id) || field.internalField in paymentDefaults(id)) && !hiddenAutomatic)) errors.push(`${field.internalField} must remain available.`);
        if (field.userField !== undefined && (typeof field.userField !== 'string' || !field.userField.trim() || field.userField.length > 128)) errors.push('Invalid JSON alias.');
        if (field.defaultValue !== undefined && (!defaultableFields.has(field.internalField) || typeof field.defaultValue !== 'string' || field.defaultValue.length > 64)) errors.push(`Defaults are not permitted for ${field.internalField}.`);
        if (mappings && field.userField && !mappings.some(m => m.internalField === field.internalField && m.userField === field.userField)) errors.push(`Reload adapter: ${field.userField} is no longer mapped to ${field.internalField}.`);
    }
    return errors;
}
export function validatePaymentForms(value: unknown): value is PaymentForms {
    const forms = value as PaymentForms;
    return !!forms && forms.version === 1 && Object.keys(forms).every(key => ['version', 'presets'].includes(key)) && !!forms.presets && Object.keys(forms.presets).length === 5 && presetIds.every(id => !validatePaymentPreset(id, forms.presets[id]).length);
}
export function configuredDefaults(preset: PaymentPreset) {
    return Object.fromEntries(preset.fields.filter(field => field.defaultValue?.trim()).map(field => [field.internalField, field.defaultValue!.trim()]));
}


// Expand only a valid older three-preset file; retain all existing choices.
export function upgradePaymentForms(value: unknown): unknown {
    const forms = value as PaymentForms;
    const original = ['account', 'staticQr', 'dynamicQr'] as const;
    if (forms?.version === 1 && forms.presets && Object.keys(forms).every(key => ['version', 'presets'].includes(key)) &&
        Object.keys(forms.presets).length === 3 && original.every(id => !validatePaymentPreset(id, forms.presets[id]).length)) {
        return {...forms, presets: {...createDefaultPaymentForms().presets, ...forms.presets}};
    }
    return value;
}
