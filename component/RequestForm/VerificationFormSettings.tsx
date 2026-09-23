import React, {useEffect, useRef, useState} from "react";
import type {FieldMapping} from "../../api/hooks/useEndpoints";
import {
    buildVerificationPayload,
    presetLabels,
    typeChoices,
    validatePreset,
    type FormField,
    type PresetId,
    type VerificationPreset
} from "../../utils/verificationForms";
import styles from "./VerificationFormSettings.module.css";
import Input from "../common/Input/Input";
import SelectInput from "../common/SelectInput/SelectInput";
import Checkbox from "../common/Checkbox/Checkbox";
import ActionButton from "../common/ActionButton/ActionButton";
import {MdArrowUpward, MdArrowDownward, MdClose, MdOpenInNew, MdRefresh} from "react-icons/md";
import {extractErrorMessage} from "../../utils/extractErrorMessage";
import {bicOptionsDev} from "../../constants/gatewayFormOptions";

type Props = {
    id: PresetId;
    preset: VerificationPreset;
    mappings: FieldMapping[];
    onSave: (preset: VerificationPreset) => Promise<void>;
    onClose: () => void;
    onReloadAdapter: () => Promise<void>;
    participantOptions?: { value: string; label: string }[];
};

export default function VerificationFormSettings({
                                                     id,
                                                     preset,
                                                     mappings,
                                                     onSave,
                                                     onClose,
                                                     onReloadAdapter,
                                                     participantOptions = []
                                                 }: Props) {
    const [draft, setDraft] = useState<VerificationPreset>(() => structuredClone(preset));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [reloading, setReloading] = useState(false);
    const [reloadError, setReloadError] = useState("");
    const [reloadNotice, setReloadNotice] = useState("");
    const reloadPending = useRef(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        const previousRootOverflow = document.documentElement.style.overflow;
        dialog.showModal();
        dialog.querySelector<HTMLElement>("h2")?.focus();
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
            document.documentElement.style.overflow = previousRootOverflow;
            queueMicrotask(() => {
                if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
            });
        };
    }, []);
    const errors = validatePreset(id, draft, mappings);
    const bankOptions = id === "papssAccount" ? participantOptions : bicOptionsDev;
    const update = (index: number, change: Partial<FormField>) => setDraft(previous => ({fields: previous.fields.map((field, i) => i === index ? {...field, ...change} : field)}));
    const move = (index: number, offset: number) => setDraft(previous => {
        const fields = [...previous.fields];
        [fields[index], fields[index + offset]] = [fields[index + offset], fields[index]];
        return {fields};
    });
    const sample = Object.fromEntries(draft.fields.map(field => [field.internalField,
        field.internalField === "Type" ? field.defaultValue || field.options?.[0] || "" : field.internalField === "ToBIC" ? field.defaultValue || "<BankBIC>" : field.internalField === "Code" ? "<SOMQR content>" : "<identifier>"]));
    const preview = errors.length ? null : buildVerificationPayload(id, draft, sample, mappings);
    const save = async () => {
        if (saving || reloading || reloadError || errors.length) return;
        setSaving(true);
        setError("");
        try {
            await onSave(draft);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to save settings.");
        } finally {
            setSaving(false);
        }
    };
    const reload = async () => {
        if (saving || reloadPending.current) return;
        reloadPending.current = true;
        setReloading(true);
        setReloadError("");
        setReloadNotice("");
        try {
            await onReloadAdapter();
            setReloadNotice("Adapter mappings refreshed. Your unsaved edits have been kept.");
        } catch (error) {
            setReloadError(extractErrorMessage(error, "Unable to reload the adapter. Try again before saving."));
        } finally {
            reloadPending.current = false;
            setReloading(false);
        }
    };
    return <dialog ref={dialogRef} className={styles.panel} aria-labelledby="verification-settings-title"
                   aria-modal="true"
                   onCancel={event => {
                       event.preventDefault();
                       if (!saving && !reloading) onClose();
                   }}>
        <header className={styles.header}>
            <h2 id="verification-settings-title" tabIndex={-1}>Shared form settings — {presetLabels[id]}</h2>
            <ActionButton className={styles.closeButton} onClick={onClose} disabled={saving || reloading}>
                <MdClose size={22} aria-hidden="true"/><span className={styles.srOnly}>Close form settings</span>
            </ActionButton>
        </header>
        <div className={styles.body}>
            <div className={styles.toolbar}>
                <ActionButton className={`${styles.secondaryButton} ${styles.toolbarButton}`}
                              disabled={saving || reloading}
                              onClick={() => window.open("/config/endpoint", "_blank", "noopener,noreferrer")}>
                    <MdOpenInNew size={18} aria-hidden="true"/>Manage Adapter<span className={styles.srOnly}> (opens in a new tab)</span>
                </ActionButton>
                <ActionButton className={`${styles.secondaryButton} ${styles.toolbarButton}`}
                              disabled={saving || reloading} onClick={() => void reload()}>
                    <MdRefresh size={18} aria-hidden="true"/>{reloading ? "Reloading Adapter…" : "Reload Adapter"}
                </ActionButton>
            </div>
            {reloadNotice && <p role="status">{reloadNotice}</p>}
            {reloadError && <p role="alert">{reloadError}</p>}
            <p>Changes apply to everyone using this method. All listed fields are required. Choose one accepted JSON
                name per field.</p>
            <fieldset disabled={saving} className={styles.fields}>
                {draft.fields.map((field, index) => <section className={styles.field} key={field.internalField}>
                    <h3>{field.internalField} <small>Required</small></h3>
                    <div className={styles.grid}>
                        <SelectInput label="Send as" value={field.userField} required disabled={saving}
                                     onChange={event => update(index, {userField: event.target.value})}
                                     options={[
                                         ...(!mappings.some(m => m.internalField === field.internalField && m.userField === field.userField)
                                             ? [{
                                                 value: field.userField,
                                                 label: `${field.userField} (unavailable)`
                                             }] : []),
                                         ...[...new Set(mappings.filter(m => m.internalField === field.internalField).map(m => m.userField))].map(name => ({
                                             value: name,
                                             label: name
                                         })),
                                     ]}/>
                        <Input label="Display label" type="text" required disabled={saving} maxLength={100}
                               value={field.label}
                               onChange={event => update(index, {label: event.target.value})}/>
                        <SelectInput label="Input control" value={field.input} required disabled
                                     onChange={() => {
                                     }}
                                     options={(field.internalField === "Type" ? ["select"] : field.internalField === "Code" ? ["SOMQR", "text"] : field.internalField === "ToBIC" ? ["bankSelect", "text"] : ["text"]).map(input => ({
                                         value: input,
                                         label: ({
                                             text: "Text input",
                                             select: "Dropdown",
                                             bankSelect: "Bank dropdown",
                                             SOMQR: "SOMQR scanner"
                                         })[input]!,
                                     }))}/>
                    </div>
                    {field.internalField === "Type" && <>
                        <p>Allowed verification types</p>
                        <div className={styles.actions}>{typeChoices(id).map(value => <Checkbox key={value}
                                                                                                label={value}
                                                                                                disabled
                                                                                                checked={field.options?.includes(value) ?? false}
                                                                                                onChange={() => {
                                                                                                }}/>)}</div>
                        <SelectInput label="Default type" disabled={saving} value={field.defaultValue || "__none"}
                                     onChange={event => update(index, {defaultValue: event.target.value === "__none" ? "" : event.target.value})}
                                     options={[{
                                         value: "__none",
                                         label: "No default — user selects"
                                     }, ...(field.options ?? []).map(value => ({value, label: value}))]}/>
                    </>}
                    {field.internalField === "ToBIC" && <>
                        <SelectInput label="Default Destination Bank" disabled={saving}
                                     value={field.defaultValue || "__none"}
                                     onChange={event => update(index, {defaultValue: event.target.value === "__none" ? "" : event.target.value})}
                                     options={[{value: "__none", label: "No default — user selects"},
                                         ...(field.defaultValue && !bankOptions.some(bank => bank.value === field.defaultValue)
                                             ? [{
                                                 value: field.defaultValue,
                                                 label: field.defaultValue
                                             }] : []), ...bankOptions]}/>
                        {id === "papssAccount" &&
                            <Input label="Default Destination BIC (optional)" type="text" disabled={saving}
                                   value={field.defaultValue ?? ""} maxLength={11}
                                   placeholder="Enter BIC or select a discovered participant"
                                   onChange={event => update(index, {defaultValue: event.target.value.trim().toUpperCase()})}/>}
                        <p>This bank will be prefilled. Users can change it before sending; a destination remains
                            required.</p>
                    </>}
                    <div className={styles.actions}>
                        <ActionButton className={`${styles.reorderButton} ${styles.moveUpButton}`}
                                      disabled={saving || index === 0} onClick={() => move(index, -1)}><MdArrowUpward
                            size={18} aria-hidden="true"/>Move up<span className={styles.srOnly}>: {field.label}</span></ActionButton>
                        <ActionButton className={`${styles.reorderButton} ${styles.moveDownButton}`}
                                      disabled={saving || index === draft.fields.length - 1}
                                      onClick={() => move(index, 1)}><MdArrowDownward size={18} aria-hidden="true"/>Move
                            down<span className={styles.srOnly}>: {field.label}</span></ActionButton>
                    </div>
                </section>)}
            </fieldset>
            <h3>Form preview</h3>
            <div
                className={styles.grid}>{draft.fields.map(field => field.input === "select" || field.input === "bankSelect"
                ? <SelectInput key={field.internalField} label={field.label} required disabled
                               value={field.defaultValue ?? ""} onChange={() => {
                }}
                               placeholder={field.input === "bankSelect" ? "Select destination bank" : "Select verification type"}
                               options={field.internalField === "ToBIC" ? [
                                   ...(field.defaultValue && !bankOptions.some(bank => bank.value === field.defaultValue) ? [{
                                       value: field.defaultValue,
                                       label: field.defaultValue
                                   }] : []), ...bankOptions,
                               ] : (field.options ?? []).map(value => ({value, label: value}))}/>
                : <Input key={field.internalField} label={field.label} type="text" required disabled
                         value={field.defaultValue ?? ""} onChange={() => {
                }}
                         placeholder={field.input === "SOMQR" ? "Upload and scan SOMQR code" : "Enter value"}/>
            )}</div>
            <h3>Example request</h3>
            <pre
                className={styles.preview}>{preview ? JSON.stringify(preview, null, 2) : "Correct the settings to preview the request."}</pre>
            {errors.length > 0 && <ul role="alert">{errors.map(message => <li key={message}>{message}</li>)}</ul>}
            {error && <p role="alert">{error}</p>}
        </div>
        <footer className={styles.footer}>
            <ActionButton className={styles.primaryButton}
                          disabled={saving || reloading || !!reloadError || errors.length > 0}
                          onClick={() => void save()}>{saving ? "Saving…" : "Save & Apply"}</ActionButton>
            <ActionButton className={styles.secondaryButton} disabled={saving || reloading}
                          onClick={onClose}>Cancel</ActionButton>
        </footer>
    </dialog>;
}
