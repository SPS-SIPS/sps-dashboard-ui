// Server-only storage. Do not import this module into a browser component.
import fs from "node:fs";
import path from "node:path";
import {createHash, randomUUID} from "node:crypto";
import {createDefaultVerificationForms, validateRequestForms, type RequestForms} from "./verificationForms";

export class FormsStorageError extends Error {
    constructor(public status: number, public code: string, message: string) {super(message);}
}
export type FormsState = {
    forms: RequestForms | null;
    revision: string;
    source: "saved" | "defaults" | "legacy";
    location: string;
    raw: Buffer | null;
};

export function createVerificationFormsStorage(root = process.cwd()) {
    const directory = path.join(root, "runtime-config");
    const target = path.join(directory, "verification-forms.json");
    const legacy = path.join(root, "request-forms.json");
    const lock = path.join(directory, ".verification-forms.lock");
    const readOptional = (file: string): Buffer | null => {
        try {return fs.readFileSync(file);} catch (error) {
            if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
            throw error;
        }
    };
    const read = (): FormsState => {
        let location = target;
        let raw = readOptional(target);
        if (raw === null) {
            const old = readOptional(legacy);
            if (old !== null) {location = legacy; raw = old;}
        }
        const hash = createHash("sha256").update(location).update(raw === null ? "\0missing" : "\0present");
        if (raw !== null) hash.update(raw);
        const revision = hash.digest("hex");
        const text = raw?.toString("utf8") ?? "";
        if (!text.trim()) return {forms: createDefaultVerificationForms(), revision, source: "defaults", location, raw};
        let forms: unknown;
        try {forms = JSON.parse(text);} catch {forms = null;}
        return {forms: validateRequestForms(forms) ? forms : null, revision, source: location === legacy ? "legacy" : "saved", location, raw};
    };
    const withLock = <T>(work: () => T): T => {
        fs.mkdirSync(directory, {recursive: true});
        try {fs.mkdirSync(lock);} catch (error) {
            if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new FormsStorageError(409, "CONFIG_BUSY", "Another configuration update is in progress. Try again shortly.");
            throw error;
        }
        try {return work();} finally {fs.rmdirSync(lock);}
    };
    const atomicWrite = (forms: RequestForms) => {
        const temporary = path.join(directory, `.verification-forms.${randomUUID()}.tmp`);
        try {
            fs.writeFileSync(temporary, JSON.stringify(forms, null, 2) + "\n", {encoding: "utf8", flag: "wx", mode: 0o600});
            fs.renameSync(temporary, target);
        } finally {
            if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
        }
    };
    const checkRevision = (expected: string, state: FormsState) => {
        if (expected !== state.revision) throw new FormsStorageError(409, "CONFIG_CHANGED", "Settings changed since you loaded them. Reload shared settings before continuing.");
    };
    return {
        read,
        load: () => {
            const state = read();
            if (state.source !== "legacy" || !state.forms) return state;
            // Migrate valid legacy settings without altering the original file.
            return withLock(() => {
                const current = read();
                if (current.source === "legacy" && current.forms) atomicWrite(current.forms);
                return read();
            });
        },
        update: (expected: string, change: (forms: RequestForms) => void) => withLock(() => {
            const state = read();
            checkRevision(expected, state);
            if (!state.forms) throw new FormsStorageError(422, "INVALID_CONFIG", "The configuration is invalid. Back up and reset it before saving.");
            change(state.forms);
            atomicWrite(state.forms);
            return read();
        }),
        reset: (expected: string) => withLock(() => {
            const state = read();
            checkRevision(expected, state);
            if (state.forms || state.raw === null) throw new FormsStorageError(409, "RESET_NOT_NEEDED", "The file is no longer invalid. Reload shared settings.");
            const backups = path.join(directory, "backups");
            fs.mkdirSync(backups, {recursive: true});
            const name = `verification-forms.${new Date().toISOString().replace(/[:.]/g, "-")}.${randomUUID()}.json`;
            // Write the original bytes first. Any backup failure stops the reset.
            fs.writeFileSync(path.join(backups, name), state.raw, {flag: "wx", mode: 0o600});
            atomicWrite(createDefaultVerificationForms());
            return {...read(), backup: `runtime-config/backups/${name}`};
        }),
    };
}
