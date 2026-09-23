import type {NextApiRequest, NextApiResponse} from "next";
import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import {Agent} from "node:https";
import {rootCertificates} from "node:tls";
import {presetIds, validatePreset, type PresetId} from "../../utils/verificationForms";
import {createVerificationFormsStorage, FormsStorageError, type FormsState} from "../../utils/verificationFormsStorage";
import type {EndpointsData} from "../../api/hooks/useEndpoints";

export const config = {api: {bodyParser: {sizeLimit: "32kb"}}};
const present = (state: FormsState) => ({forms: state.forms, revision: state.revision, source: state.source});

function backendHttpsAgent(baseUrl: string, profile: string): Agent | undefined {
    if (!baseUrl.startsWith("https://")) return undefined;
    if (process.env.SIPS_BACKEND_ALLOW_SELF_SIGNED === "true" && ["uat", "sit"].includes(profile)) {
        // Explicit non-production opt-in, scoped to this backend adapter request.
        return new Agent({rejectUnauthorized: false});
    }
    const configuredPath = process.env.SIPS_BACKEND_CA_FILE;
    const certificatePath = configuredPath
        ? path.resolve(configuredPath) : path.join(process.cwd(), "certs", "backend-ca.crt");
    if (!configuredPath && !fs.existsSync(certificatePath)) return undefined;
    try {
        // Trust only an operator-provided certificate; retain hostname verification.
        return new Agent({ca: [...rootCertificates, fs.readFileSync(certificatePath, "utf8")], rejectUnauthorized: true});
    } catch {
        throw new FormsStorageError(503, "BACKEND_TLS_CONFIG", "Cannot read the backend CA certificate. Check certs/backend-ca.crt or SIPS_BACKEND_CA_FILE and its file permissions.");
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Cache-Control", "no-store");
    if (!["GET", "PUT", "POST"].includes(req.method ?? "")) {
        res.setHeader("Allow", "GET, PUT, POST");
        return res.status(405).json({message: "Method not allowed."});
    }
    try {
        const storage = createVerificationFormsStorage();
        if (req.method === "GET") {
            const state = storage.load();
            if (!state.forms) return res.status(422).json({code: "INVALID_CONFIG", revision: state.revision,
                message: "Verification settings contain invalid data. Back up and reset to defaults to recover."});
            return res.status(200).json(present(state));
        }
        let mappings: EndpointsData | undefined;
        {
            if (!req.headers.authorization?.startsWith("Bearer ")) return res.status(401).json({message: "Sign in to save shared form settings."});
            const app = JSON.parse(fs.readFileSync(path.join(process.cwd(), "app-config.json"), "utf8"));
            if (app.config.profile === "prod") return res.status(403).json({message: "Verification tester configuration is disabled in production."});
            // The configured backend validates the token and requires its configuration role.
            // Never accept an upstream URL or adapter mappings from the save request.
            const upstream = await axios.get<EndpointsData>(`${app.config.api.baseUrl.replace(/\/$/, "")}/api/v1/Adapter`, {
                headers: {Authorization: req.headers.authorization}, timeout: 10000, maxRedirects: 0,
                httpsAgent: backendHttpsAgent(app.config.api.baseUrl, app.config.profile),
            });
            mappings = upstream.data;
        }
        const {presetId, preset, revision: expectedRevision} = req.body ?? {};
        if (typeof expectedRevision !== "string") return res.status(400).json({message: "Reload settings before continuing."});
        if (!Array.isArray(mappings?.VerificationRequest?.fieldMappings)) return res.status(502).json({message: "The backend did not return verification mappings."});
        if (req.method === "POST") {
            if (req.body?.action !== "reset" || req.body?.confirmed !== true) return res.status(400).json({message: "Explicit confirmation is required to back up and reset settings."});
            const state = storage.reset(expectedRevision);
            return res.status(200).json({...present(state), backup: state.backup, mappings});
        }
        if (!presetIds.includes(presetId)) return res.status(400).json({message: "Unknown verification method."});
        const errors = validatePreset(presetId, preset, mappings.VerificationRequest.fieldMappings);
        if (errors.length) return res.status(400).json({message: errors.join(" ")});
        const state = storage.update(expectedRevision, forms => {forms.presets[presetId as PresetId] = preset;});
        return res.status(200).json(present(state));
    } catch (error) {
        if (error instanceof FormsStorageError) return res.status(error.status).json({code: error.code, message: error.message});
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const code = error.code;
            if (["DEPTH_ZERO_SELF_SIGNED_CERT", "SELF_SIGNED_CERT_IN_CHAIN", "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "UNABLE_TO_GET_ISSUER_CERT_LOCALLY"].includes(code ?? "")) {
                return res.status(502).json({code: "BACKEND_TLS_UNTRUSTED", message: "The UI server does not trust the backend HTTPS certificate. Add the trusted backend CA certificate to certs/backend-ca.crt, or set SIPS_BACKEND_CA_FILE to its path, then retry. Settings have not been saved."});
            }
            if (code === "ERR_TLS_CERT_ALTNAME_INVALID") return res.status(502).json({code: "BACKEND_TLS_HOSTNAME", message: "The backend certificate does not cover the configured API hostname or IP. Use an API address listed in the certificate, or correct the backend certificate."});
            if (code === "CERT_HAS_EXPIRED" || code === "CERT_NOT_YET_VALID") return res.status(502).json({code: "BACKEND_TLS_DATES", message: "The backend certificate is expired or not yet valid. Check the certificate and server clock."});
            if (!status) return res.status(502).json({code: "BACKEND_CONNECTION_FAILED", message: `The UI server cannot reach the backend adapter (${code || "connection failed"}). Check server connectivity and the configured API address.`});
            return res.status(status === 401 || status === 403 ? status : 502).json({message:
                status === 401 || status === 403 ? "Saving requires the backend configuration role and a valid login." : `The backend adapter returned HTTP ${status}. Check its address and service status.`});
        }
        const code = (error as NodeJS.ErrnoException).code;
        return res.status(500).json({code: "CONFIG_STORAGE_ERROR", message:
            code === "EACCES" || code === "EPERM" ? "Access to verification settings was denied. Check runtime-config folder permissions; existing files have not been reset."
                : "Unable to read, migrate, back up, or save verification settings. Check runtime-config storage and permissions. Existing files have not been reset automatically."});
    }
}
