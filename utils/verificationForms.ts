import type {FieldMapping} from "../api/hooks/useEndpoints";

export const presetIds = ["domesticAccount", "domesticQr", "domesticP2g", "papssAccount"] as const;
export type PresetId = typeof presetIds[number];
export type FormField = {
    internalField: "Alias" | "Type" | "ToBIC" | "Code";
    userField: string;
    label: string;
    input: "text" | "select" | "bankSelect" | "SOMQR";
    options?: string[];
    defaultValue?: string;
};
export type VerificationPreset = {fields: FormField[]};
export type RequestForms = {version: 1; presets: Record<PresetId, VerificationPreset>};
export const presetLabels: Record<PresetId, string> = {
    domesticAccount: "Account Verification", domesticQr: "SOMQR Verification",
    domesticP2g: "P2G Verification", papssAccount: "PAPSS Account Verification",
};
export const typeChoices = (id: PresetId) => id === "domesticP2g"
    ? ["BILL", "INVOICE", "UPR"] : ["ACCT", "IBAN", "MSIS", "EWLT"];

export function createDefaultVerificationForms(): RequestForms {
    const account = (papss = false): VerificationPreset => ({fields: [
        {internalField: "Alias", userField: "accNo", label: "Account Number", input: "text"},
        {internalField: "Type", userField: "accType", label: "Account Type", input: "select", options: typeChoices("domesticAccount"), defaultValue: "ACCT"},
        {internalField: "ToBIC", userField: "agent", label: papss ? "Destination BIC" : "Destination Bank", input: papss ? "text" : "bankSelect"},
    ]});
    return {version: 1, presets: {
        domesticAccount: account(),
        domesticQr: {fields: [{internalField: "Code", userField: "QRCode", label: "SOMQR Code", input: "SOMQR"}]},
        domesticP2g: {fields: [
            {internalField: "Alias", userField: "invoiceIdOrUpr", label: "Bill / Invoice / UPR Reference", input: "text"},
            {internalField: "Type", userField: "accountType", label: "Reference Type", input: "select", options: typeChoices("domesticP2g"), defaultValue: "BILL"},
            {internalField: "ToBIC", userField: "agent", label: "Destination Bank", input: "bankSelect"},
        ]},
        papssAccount: account(true),
    }};
}

export function validatePreset(id: PresetId, value: unknown, mappings?: FieldMapping[]): string[] {
    if (!presetIds.includes(id)) return ["Unknown verification method."];
    if (!value || typeof value !== "object" || !Array.isArray((value as VerificationPreset).fields)) return ["Invalid form configuration."];
    const fields = (value as VerificationPreset).fields;
    const expected = id === "domesticQr" ? ["Code"] : ["Alias", "Type", "ToBIC"];
    const errors: string[] = [];
    if (Object.keys(value).some(key => key !== "fields")) errors.push("Unsupported preset property.");
    if (fields.length !== expected.length || expected.some(key => fields.filter(f => f?.internalField === key).length !== 1)) {
        errors.push(`Required fields: ${expected.join(", ")}. Include each field exactly once.`);
    }
    const names = new Set<string>();
    for (const field of fields) {
        if (!field || typeof field !== "object") {errors.push("Invalid field."); continue;}
        if (Object.keys(field).some(key => !["internalField", "userField", "label", "input", "options", "defaultValue"].includes(key))) errors.push("Unsupported field property.");
        if (typeof field.userField !== "string" || !field.userField.trim() || field.userField.length > 128 || ["__proto__", "constructor", "prototype"].includes(field.userField)) errors.push("Choose a valid JSON field name.");
        if (names.has(field.userField)) errors.push("JSON field names must be unique.");
        names.add(field.userField);
        if (typeof field.label !== "string" || !field.label.trim() || field.label.length > 100) errors.push("Labels must contain 1–100 characters.");
        const inputs = field.internalField === "Type" ? ["select"] : field.internalField === "Code" ? ["SOMQR", "text"] : field.internalField === "ToBIC" ? ["text", "bankSelect"] : ["text"];
        if (!inputs.includes(field.input)) errors.push(`Unsupported input for ${field.internalField}.`);
        if (field.internalField === "Type") {
            if (!Array.isArray(field.options) || !field.options.length || field.options.some(option => !typeChoices(id).includes(option)) || new Set(field.options).size !== field.options.length) errors.push("Select supported verification types without duplicates.");
            if (field.defaultValue !== undefined && (typeof field.defaultValue !== "string" || (field.defaultValue !== "" && (!Array.isArray(field.options) || !field.options.includes(field.defaultValue))))) errors.push("Default type must be one of the selected choices.");
        } else if (field.internalField === "ToBIC") {
            if (field.options !== undefined) errors.push("Destination bank choices come from the bank list or PAPSS discovery.");
            if (field.defaultValue !== undefined && (typeof field.defaultValue !== "string" ||
                (field.defaultValue !== "" && !/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(field.defaultValue)))) errors.push("Default destination must be a valid 8 or 11 character BIC.");
        } else if (field.defaultValue !== undefined || field.options !== undefined) errors.push("Account identifiers and SOMQR content cannot have saved defaults or choices.");
        if (mappings && !mappings.some(m => m.internalField === field.internalField && m.userField === field.userField)) errors.push(`${field.internalField}: '${field.userField}' is not supported by the current adapter.`);
    }
    if (id === "papssAccount" && mappings) {
        const rail = mappings.find(m => m.internalField === "Rail");
        if (!rail) errors.push("The current adapter has no Rail mapping for PAPSS.");
        else if (names.has(rail.userField)) errors.push("A form field conflicts with the PAPSS rail mapping.");
    }
    return [...new Set(errors)];
}

export function validateRequestForms(value: unknown): value is RequestForms {
    if (!value || typeof value !== "object") return false;
    const candidate = value as RequestForms;
    return candidate.version === 1 && !!candidate.presets &&
        Object.keys(candidate).every(key => ["version", "presets"].includes(key)) &&
        Object.keys(candidate.presets).length === presetIds.length &&
        presetIds.every(id => validatePreset(id, candidate.presets[id]).length === 0);
}

export function buildVerificationPayload(id: PresetId, preset: VerificationPreset, values: Record<string, string>, mappings: FieldMapping[]): Record<string, string> {
    const errors = validatePreset(id, preset, mappings);
    if (errors.length) throw new Error(errors.join(" "));
    const payload: Record<string, string> = {};
    for (const field of preset.fields) {
        const value = (values[field.internalField] ?? field.defaultValue ?? "").trim();
        if (!value) throw new Error(`${field.label} is required.`);
        if (field.internalField === "Type" && !field.options?.includes(value)) throw new Error("Choose a supported verification type.");
        payload[field.userField] = value;
    }
    if (id === "papssAccount") payload[mappings.find(m => m.internalField === "Rail")!.userField] = "PAPSS";
    return payload;
}
