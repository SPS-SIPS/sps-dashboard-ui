import React, {useCallback, useEffect, useRef, useState} from "react";
import {isAxiosError} from "axios";
import {MdRefresh, MdSettings} from "react-icons/md";
import useAxiosPrivate from "../../api/hooks/useAxiosPrivate";
import SpinLoading from "../../component/Loading/SpinLoading/SpinLoading";
import Input from "../../component/common/Input/Input";
import ActionButton from "../../component/common/ActionButton/ActionButton";
import SelectInput from "../../component/common/SelectInput/SelectInput";

import useEndpoints, {type EndpointsData} from "../../api/hooks/useEndpoints";

import {
    extractFieldsFromData,
    getUserFieldFromEndpoint,
    getUserFieldsFromEndpoint,
    remapToInternalFields,
} from "../../utils/endpointHelpers";

import {
    verificationMethods,
    bicOptionsDev,
} from "../../constants/gatewayFormOptions";

import {validateUrl} from "../../utils/validation";

import sharedStyles from "../../component/RequestForm/SharedStyles.module.css";
import styles from "../../styles/VerificationRequestPage.module.css";

import RoleGuard from "../../auth/RoleGuard";
import {useRouter} from "next/router";
import {useAuthentication} from "../../auth/AuthProvider";
import QRDataViewer from "../../component/ScanToPay/QRDataViewer/QRDataViewer";
import UploadQRScanner from "../../component/ScanToPay/UploadQRScanner/UploadQRScanner";
import {SOMQRType, validateSOMQR} from "../../utils/validateSOMQR";
import {PAYMENT_DRAFT_KEY} from "../../utils/paymentDraft";
import AlertModal from "../../component/common/AlertModal/AlertModal";
import {extractErrorMessage} from "../../utils/extractErrorMessage";
import VerificationFormSettings from "../../component/RequestForm/VerificationFormSettings";
import PapssVerificationStatus from "../../component/RequestForm/PapssVerificationStatus";
import {buildVerificationPayload, presetLabels, validatePreset, validateRequestForms, type PresetId, type RequestForms, type VerificationPreset} from "../../utils/verificationForms";

const VerificationRequestPage: React.FC = () => {
    const {config, roles, keycloak} = useAuthentication();
    const router = useRouter();
    const axiosPrivate = useAxiosPrivate();
    const {endpoints: initialEndpoints, loading: endpointsLoading, error: initialEndpointsError} = useEndpoints();
    const [refreshedEndpoints, setRefreshedEndpoints] = useState<EndpointsData | null>(null);
    const endpoints = refreshedEndpoints ?? initialEndpoints;
    const endpointsError = refreshedEndpoints ? null : initialEndpointsError;
    const [presetId, setPresetId] = useState<PresetId>("domesticAccount");
    const rail = presetId === "papssAccount" ? "PAPSS" : "SIPS";
    const mode = presetId === "domesticQr" ? "SOMQR" : "form";
    const [forms, setForms] = useState<RequestForms | null>(null);
    const [formsRevision, setFormsRevision] = useState("");
    const [formsError, setFormsError] = useState("");
    const [usingDefaults, setUsingDefaults] = useState(false);
    const [recoveryRevision, setRecoveryRevision] = useState<string | null>(null);
    const [confirmReset, setConfirmReset] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [formsLoading, setFormsLoading] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsNotice, setSettingsNotice] = useState("");
    const preset = forms?.presets[presetId];
    const adapterMappings = endpoints?.VerificationRequest?.fieldMappings ?? [];
    const presetErrors = preset ? validatePreset(presetId, preset, adapterMappings) : [];
    const pending = useRef(false);
    const [participants, setParticipants] = useState<{value: string; label: string; country: string; currencies: string[]}[]>([]);
    const [discoveryLoaded, setDiscoveryLoaded] = useState(false);
    const [discoveryError, setDiscoveryError] = useState("");
    const [discoveryRequest, setDiscoveryRequest] = useState<{url: string; method: string; body: Record<string, string | boolean>} | null>(null);
    const [discoveryResponse, setDiscoveryResponse] = useState<{status: number | null; data: unknown; error?: string} | null>(null);
    const [discoveryViewer, setDiscoveryViewer] = useState<"request" | "response" | null>(null);
    const [destinationCountry, setDestinationCountry] = useState("");
    const [destinationBic, setDestinationBic] = useState("");
    const [destinationCurrency, setDestinationCurrency] = useState("");
    const [discovering, setDiscovering] = useState(false);
    const countryNames = new Intl.DisplayNames(["en"], {type: "region"});
    const countryOptions = [...new Set(participants.map(bank => bank.country))]
        .map(value => ({value, label: `${countryNames.of(value) ?? value} (${value})`}))
        .sort((a, b) => a.label.localeCompare(b.label));
    const destinationBanks = participants.filter(bank => bank.country === destinationCountry);
    const selectedDestinationBank = participants.find(bank => bank.value === destinationBic);
    const destinationCurrencyOptions = (selectedDestinationBank?.currencies?.length ? selectedDestinationBank.currencies : ["USD"])
        .map(value => ({value, label: value === "USD" ? "USD - US Dollar" : value}));
    const papssReady = discoveryLoaded && destinationBanks.some(bank => bank.value === destinationBic);
    const papssSelectionReady = papssReady && destinationCurrency === "USD";
    const resetDiscovery = () => {
        setParticipants([]); setDiscoveryLoaded(false); setDiscoveryError("");
        setDestinationCountry(""); setDestinationBic(""); setDestinationCurrency("");
        setDiscoveryRequest(null); setDiscoveryResponse(null); setDiscoveryViewer(null);
    };

    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const fieldValue = (userField: string) => rail === "PAPSS" && preset?.fields.some(field => field.internalField === "ToBIC" && field.userField === userField)
        ? destinationBic : formValues[userField] ?? preset?.fields.find(field => field.userField === userField)?.defaultValue ?? "";

    const [qrCode, setQrCode] = useState("");
    const [qrError, setQrError] = useState("");

    const [submittedData, setSubmittedData] = useState<any>(null);
    const [response, setResponse] = useState<any>(null);
    const [papssVerificationResult, setPapssVerificationResult] = useState<Record<string, unknown> | null>(null);
    const [papssPolling, setPapssPolling] = useState(false);

    const [requestViewerOpen, setRequestViewerOpen] = useState(false);
    const [responseViewerOpen, setResponseViewerOpen] = useState(false);

    const [apiUrlOverride, setApiUrl] = useState<string | null>(null);
    const apiUrl = apiUrlOverride ?? (config?.api.baseUrl
        ? `${config.api.baseUrl.replace(/\/$/, "")}/api/v1/Gateway/Verify` : "");

    const [modal, setModal] = useState<{
        show: boolean;
        title?: string;
        message?: string;
    }>({show: false});

    const [loading, setLoading] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [urlError, setUrlError] = useState("");

    const activeProfile = config?.profile;

    const loadForms = async () => {
        setFormsLoading(true); setFormsError(""); setRecoveryRevision(null); setUsingDefaults(false);
        try {
            const result = await fetch("/api/request-forms", {cache: "no-store"});
            const data = await result.json();
            if (data.code === "INVALID_CONFIG" && typeof data.revision === "string") setRecoveryRevision(data.revision);
            if (!result.ok || !validateRequestForms(data.forms)) throw new Error(data.message || "Invalid shared form settings.");
            setForms(data.forms); setFormsRevision(data.revision);
            setUsingDefaults(data.source === "defaults");
            resetDiscovery();
            setFormValues({}); setQrCode(""); setSubmittedData(null); setResponse(null); setPapssVerificationResult(null);
            setSettingsOpen(false);
        } catch (error) {
            setForms(null); setFormsRevision(""); setSettingsOpen(false);
            setSubmittedData(null); setResponse(null);
            setFormsError(error instanceof Error ? error.message : "Unable to load shared form settings.");
        } finally {setFormsLoading(false);}
    };
    useEffect(() => {void loadForms();}, []);

    // ================= AUTH =================
    useEffect(() => {
        if (activeProfile === "prod") {
            void router.replace("/403");
        }
    }, [activeProfile, router]);

    const mappedField = (endpoint: string, internal: string) =>
        (endpoint === "VerificationRequest" ? preset?.fields.find(field => field.internalField === internal)?.userField : undefined)
        ?? getUserFieldFromEndpoint(endpoints, endpoint, internal);
    const responseValue = (internal: string, endpoint = "VerificationResponse"): unknown => {
        const mappings = endpoints?.[endpoint]?.fieldMappings ?? [];
        for (const mapping of mappings.filter((m) => m.internalField === internal)) {
            const value = response?.data?.[mapping.userField];
            if (value !== undefined && value !== null && value !== "") return value;
        }
        return undefined;
    };
    const p2gLookup = presetId === "domesticP2g";
    const isP2G = p2gLookup || responseValue("IsP2G") === true;
    const papssVerificationId = rail === "PAPSS" && response?.success
        ? String(responseValue("RequestMessageId", "PapssAdmissionResponse") ?? response?.data?.requestMessageId ?? response?.data?.RequestMessageId ?? "")
        : "";
    const clearResult = () => {
        setQrError("");
        setSubmittedData(null);
        setResponse(null);
        setPapssVerificationResult(null);
        setRequestViewerOpen(false);
        setResponseViewerOpen(false);
    };

    // ================= INPUT =================
    const handleInputChange = (field: string, value: string) => {
        clearResult();
        setFormValues((prev) => ({...prev, [field]: value}));
    };

    // ================= VALIDATION =================
    const isFormValid = () => {
        if (!preset || presetErrors.length || formsError || formsLoading || (rail === "PAPSS" && !papssSelectionReady)) return false;
        try {
            buildVerificationPayload(presetId, preset, Object.fromEntries(preset.fields.map(field =>
                [field.internalField, field.internalField === "Code" ? qrCode : fieldValue(field.userField)])), adapterMappings);
            return true;
        } catch {return false;}
    };

    const savePreset = async (updatedPreset: VerificationPreset) => {
        if (!keycloak || !roles.includes("configuration")) throw new Error("Configuration permission is required.");
        await keycloak.updateToken(30);
        const result = await fetch("/api/request-forms", {
            method: "PUT", headers: {"Content-Type": "application/json", Authorization: `Bearer ${keycloak.token}`},
            body: JSON.stringify({presetId, preset: updatedPreset, revision: formsRevision}),
        });
        const data = await result.json();
        if (!result.ok || !validateRequestForms(data.forms)) throw new Error(data.message || "Unable to save shared settings.");
        setForms(data.forms); setFormsRevision(data.revision); setSettingsOpen(false);
        setUsingDefaults(false);
        resetDiscovery();
        setFormValues({}); setQrCode(""); clearResult();
        setSettingsNotice(`${presetLabels[presetId]} settings saved and applied.`);
    };

    const resetForms = async () => {
        if (resetting || !recoveryRevision || !keycloak || !roles.includes("configuration")) return;
        setConfirmReset(false); setResetting(true);
        try {
            await keycloak.updateToken(30);
            const result = await fetch("/api/request-forms", {
                method: "POST", headers: {"Content-Type": "application/json", Authorization: `Bearer ${keycloak.token}`},
                body: JSON.stringify({action: "reset", confirmed: true, revision: recoveryRevision}),
            });
            const data = await result.json();
            if (!result.ok || !validateRequestForms(data.forms)) throw new Error(data.message || "Unable to back up and reset settings.");
            setForms(data.forms); setFormsRevision(data.revision); setUsingDefaults(false);
            setFormsError(""); setRecoveryRevision(null); setRefreshedEndpoints(data.mappings);
            setFormValues({}); setQrCode(""); clearResult();
            setSettingsNotice(`Defaults restored. Original file backed up to ${data.backup}. Review the mappings before sending.`);
            setSettingsOpen(true);
        } catch (error) {
            setFormsError(error instanceof Error ? error.message : "Unable to back up and reset settings.");
        } finally {setResetting(false);}
    };

    const reloadAdapter = async () => {
        const {data} = await axiosPrivate.get<EndpointsData>("/api/v1/Adapter", {headers: {"Cache-Control": "no-cache"}});
        if (!data || !Array.isArray(data.VerificationRequest?.fieldMappings) ||
            !Object.values(data).every(endpoint => endpoint && Array.isArray(endpoint.fieldMappings) &&
                endpoint.fieldMappings.every(field => field && typeof field.internalField === "string" && typeof field.userField === "string"))) {
            throw new Error("The adapter did not return valid field mappings. Try reloading again.");
        }
        setRefreshedEndpoints(data);
        resetDiscovery();
        clearResult();
    };

    // ================= SUBMIT =================
    const handleSubmit = async () => {
        if (pending.current || endpointsLoading || endpointsError || settingsOpen || activeProfile === "prod") return;
        if (!isFormValid() || !preset) return;
        if (mode === "SOMQR" && !validateSOMQR(qrCode.trim()).isValid) {
            setQrError("This is not a supported SOMQR code. Check the image or pasted data.");
            return;
        }
        setQrError("");
        const railField = mappedField("VerificationRequest", "Rail");
        const qrField = mappedField("VerificationRequest", "Code");
        if (rail === "PAPSS" && (!railField || mode === "SOMQR")) {
            showError("PAPSS requires manual input and a Rail mapping in the backend adapter.");
            return;
        }
        if (mode === "SOMQR" && !qrField) {
            showError("The backend adapter is missing the SOMQR code mapping.");
            return;
        }
        setUrlError("");

        if (!validateUrl(apiUrl, {allowLocalhost: true})) {
            setUrlError("Please enter a valid API endpoint URL");
            return;
        }

        clearResult();

        const payload = buildVerificationPayload(presetId, preset, Object.fromEntries(preset.fields.map(field =>
            [field.internalField, field.internalField === "Code" ? qrCode : fieldValue(field.userField)])), adapterMappings);

        try {
            pending.current = true;
            setLoading(true);
            setSubmittedData(payload);
            const res = await axiosPrivate.post(apiUrl, payload);
            setResponse({data: res.data, status: res.status, success: true});
        } catch (error: unknown) {
            const data = isAxiosError(error) ? error.response?.data : undefined;
            const message = typeof data?.message === "string" ? data.message
                : extractErrorMessage(error, "Verification request failed");
            setResponse({data: data ?? null, status: isAxiosError(error) ? error.response?.status : undefined,
                success: false, error: message});
        } finally {
            pending.current = false;
            setLoading(false);
        }
    };

    const discoverParticipants = async () => {
        if (pending.current || rail !== "PAPSS") return;
        if (!validateUrl(apiUrl, {allowLocalhost: true})) {
            setUrlError("Please enter a valid API endpoint URL"); return;
        }
        setUrlError("");
        resetDiscovery(); clearResult();
        const railField = mappedField("ParticipantDiscoveryRequest", "Rail");
        const resultField = mappedField("ParticipantDiscoveryResponse", "Participants");
        if (!railField || !resultField) {
            setDiscoveryError("The backend adapter is missing PAPSS discovery mappings.");
            return;
        }
        pending.current = true;
        setDiscovering(true);
        try {
            const url = new URL(apiUrl);
            if (!/\/Verify\/?$/i.test(url.pathname)) throw new Error("Use the Gateway Verify endpoint to discover participants.");
            url.pathname = url.pathname.replace(/\/Verify\/?$/i, "/Discovery");
            const payload: Record<string, string | boolean> = {[railField]: "PAPSS"};
            const onlineField = mappedField("ParticipantDiscoveryRequest", "Online");
            if (onlineField) payload[onlineField] = true;
            setDiscoveryRequest({url: url.toString(), method: "POST", body: payload});
            const {data, status} = await axiosPrivate.post(url.toString(), payload);
            setDiscoveryResponse({status, data});
            const errorField = mappedField("ParticipantDiscoveryResponse", "Error");
            if (errorField && data?.[errorField]) throw new Error(JSON.stringify(data[errorField]));
            const rows: unknown = data?.[resultField];
            if (!Array.isArray(rows)) throw new Error("Discovery did not return a participant list.");
            const options = rows.flatMap((row: Record<string, unknown>) => {
                if (!row || typeof row !== "object") return [];
                const bic = row.bic ?? row.Bic;
                const name = row.name ?? row.Name;
                const country = row.countryCode ?? row.CountryCode;
                const rawCurrencies = row.currencies ?? row.Currencies;
                const currencies = Array.isArray(rawCurrencies)
                    ? rawCurrencies.filter((value): value is string => typeof value === "string").map(value => value.trim().toUpperCase()).filter(Boolean)
                    : [];
                if (typeof bic !== "string" || typeof country !== "string" ||
                    !/^[A-Z]{2}$/.test(country.trim().toUpperCase()) ||
                    !/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic.trim().toUpperCase()) ||
                    (row.online ?? row.Online) === false) return [];
                return [{value: bic.trim().toUpperCase(), label: `${typeof name === "string" ? name : bic} — ${bic.trim().toUpperCase()}`, country: country.trim().toUpperCase(), currencies}];
            });
            const banks = [...new Map(options.map((option) => [`${option.country}:${option.value}`, option])).values()];
            setParticipants(banks); setDiscoveryLoaded(true);
            const defaultBic = preset?.fields.find(field => field.internalField === "ToBIC")?.defaultValue;
            const defaultBank = banks.find(bank => bank.value === defaultBic);
            if (defaultBank) {setDestinationCountry(defaultBank.country); setDestinationBic(defaultBank.value);}
        } catch (error) {
            const data = isAxiosError(error) ? error.response?.data : undefined;
            const message = `${typeof data?.code === "string" ? `${data.code}: ` : ""}${typeof data?.message === "string" ? data.message : extractErrorMessage(error, "Participant discovery failed")}`;
            setDiscoveryError(message);
            if (isAxiosError(error)) {
                setDiscoveryResponse({status: error.response?.status ?? null, data: data ?? null, error: message});
            } else {
                setDiscoveryResponse(previous => previous ? {...previous, error: message} : null);
            }
        } finally {
            pending.current = false;
            setDiscovering(false);
        }
    };

    // ================= PAYMENT =================
    const handleSendPaymentRequest = async () => {
        if (rail !== "SIPS" || !response?.success || !isVerified || !submittedData || !response?.data || !endpoints) return;

        try {
            setProcessingPayment(true);

            if (isP2G) {
                const data = response.data as Record<string, unknown>;
                const value = (internal: string, ...fallbackKeys: string[]) => {
                    const mapped = responseValue(internal);
                    if (mapped !== undefined && mapped !== null && String(mapped).trim()) return String(mapped).trim();
                    for (const key of fallbackKeys) {
                        const fallback = data[key];
                        if (fallback !== undefined && fallback !== null && String(fallback).trim()) return String(fallback).trim();
                    }
                    return undefined;
                };
                const toBicField = mappedField("VerificationRequest", "ToBIC");
                const p2gData: Record<string, string> = {
                    PaymentType: "p2g", Rail: "SIPS", LocalInstrument: "CRTRM", CategoryPurpose: "C2GCRT",
                    CreditorIssuer: "C",
                };
                const toBic = toBicField && submittedData[toBicField];
                if (toBic) p2gData.ToBIC = String(toBic).trim();
                const fields: Array<[string, string[]]> = [
                    ["CreditorAccount", ["creditorAccount", "pam"]],
                    ["CreditorAccountType", ["creditorAccountType", "type"]],
                    ["CreditorName", ["creditorName", "customer_name"]],
                    ["Currency", ["currency", "account_currency"]],
                    ["Amount", ["amount"]],
                    ["AmountPayable", ["amountPayable"]],
                    ["BillReference", ["billReference", "invoiceId"]],
                    ["RemittanceInformation", ["remittanceInformation"]],
                    ["MdaCode", ["mdaCode"]],
                    ["ServiceCode", ["serviceCode"]],
                    ["DueDate", ["dueDate"]],
                    ["PayerReference", ["payerReference"]],
                ];
                for (const [internal, fallbackKeys] of fields) {
                    const fieldValue = value(internal, ...fallbackKeys);
                    if (fieldValue) p2gData[internal] = fieldValue;
                }
                const draftId = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, "0")).join("");
                sessionStorage.setItem(PAYMENT_DRAFT_KEY, JSON.stringify({id: draftId, createdAt: Date.now(), data: p2gData}));
                await router.push({pathname: "/api-tester/payment", query: {draft: draftId}});
                return;
            }

            const verificationResponseFields = getUserFieldsFromEndpoint(
                endpoints,
                "VerificationResponse",
                ["AccountNo", "AccountType", "Name", "Currency", "Address"]
            );

            const verificationRequestFields = getUserFieldsFromEndpoint(
                endpoints,
                "VerificationRequest",
                ["ToBIC"]
            );
            verificationRequestFields.ToBIC = mappedField("VerificationRequest", "ToBIC");

            const submittedFieldValues = extractFieldsFromData(
                submittedData,
                Object.values(verificationRequestFields)
            );

            const responseFieldValues = extractFieldsFromData(
                response.data,
                Object.values(verificationResponseFields)
            );

            submittedFieldValues["CategoryPurpose"] = "C2CCRT";

            const parsed = mode === "SOMQR" ? response?.data?.parsed : undefined;
            if (mode === "SOMQR") {
                const toBicField = verificationRequestFields["ToBIC"];

                if (parsed?.bankBICCode && toBicField) {
                    submittedFieldValues[toBicField] = parsed.bankBICCode;
                }

                // ================= CATEGORY PURPOSE RULES =================
                const payloadFormat = parsed?.payloadFormatIndicator;
                const initMethod = parsed?.pointOfInitializationMethod;

                if (payloadFormat === "01") {
                    if (initMethod === "11") {
                        submittedFieldValues["CategoryPurpose"] = "C2BSQR";
                    } else if (initMethod === "12") {
                        submittedFieldValues["CategoryPurpose"] = "C2BDQR";
                    }
                }

                if (initMethod === "12" && parsed?.amount != null) {
                    submittedFieldValues["Amount"] = parsed.amount;
                }
            }

            const combinedFields = {
                ...submittedFieldValues,
                ...responseFieldValues,
            };

            const internalData = remapToInternalFields(combinedFields, {
                ...verificationResponseFields,
                ...verificationRequestFields,
            });
            internalData.Rail = "SIPS";
            // P2P SOMQR uses the normal account-transfer payment flow. Only
            // merchant (P2M) QR codes select the static/dynamic SOMQR forms.
            const isP2m = mode === "SOMQR" && parsed?.payloadFormatIndicator === "01";
            internalData.PaymentType = mode !== "SOMQR" || !isP2m
                ? "account"
                : parsed?.pointOfInitializationMethod === "12" ? "dynamicQr" : "staticQr";

            const draftId = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, "0")).join("");
            sessionStorage.setItem(PAYMENT_DRAFT_KEY, JSON.stringify({id: draftId, createdAt: Date.now(), data: internalData}));
            await router.push({
                pathname: "/api-tester/payment",
                query: {draft: draftId},
            });
        }catch (error){
            setModal({
                show: true,
                title: "Error",
                message: extractErrorMessage(error, "Failed to process payment request")
            });
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleProceedToPapssPayment = async () => {
        if (rail !== "PAPSS" || !response?.success || !papssVerificationResult || !endpoints) return;
        const status = String(papssVerificationResult.status ?? papssVerificationResult.Status ?? "").toUpperCase();
        const verified = papssVerificationResult.verified === true || papssVerificationResult.Verified === true;
        if (status !== "COMPLETED" || !verified) return;

        const value = (...keys: string[]) => {
            for (const key of keys) {
                const candidate = papssVerificationResult[key] ?? papssVerificationResult[key.charAt(0).toLowerCase() + key.slice(1)];
                if (candidate !== undefined && candidate !== null && String(candidate).trim()) return String(candidate).trim();
            }
            return undefined;
        };

        try {
            setProcessingPayment(true);
            const draftData: Record<string, string> = {
                PaymentType: "papss",
                Rail: "PAPSS",
                ReceiverCountry: destinationCountry,
                ReceiverCurrency: destinationCurrency,
                Currency: destinationCurrency,
                ToBIC: destinationBic,
                CreditorAgentBIC: value("counterpartyBic") ?? destinationBic,
            };
            const fields: Array<[string, string[]]> = [
                ["CreditorName", ["accountName"]],
                ["CreditorAccount", ["accountNumber"]],
                ["CreditorAccountType", ["accountType"]],
            ];
            for (const [internal, keys] of fields) {
                const fieldValue = value(...keys);
                if (fieldValue) draftData[internal] = fieldValue;
            }
            const draftId = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, "0")).join("");
            sessionStorage.setItem(PAYMENT_DRAFT_KEY, JSON.stringify({id: draftId, createdAt: Date.now(), data: draftData}));
            await router.push({pathname: "/api-tester/payment", query: {draft: draftId}});
        } catch (error) {
            setModal({show: true, title: "Error", message: extractErrorMessage(error, "Failed to prepare PAPSS payment")});
        } finally {
            setProcessingPayment(false);
        }
    };

    const handlePapssCompleted = useCallback((data: Record<string, unknown>) => {
        setPapssVerificationResult(data);
    }, []);

    const isVerified = (() => {
        const field = getUserFieldFromEndpoint(
            endpoints,
            "VerificationResponse",
            "IsVerified"
        );
        const mappedValue = field ? response?.data?.[field] : undefined;
        // P2G responses commonly use the lower-camel-case API property even
        // when the adapter mapping is configured with a different alias.
        return mappedValue === true || response?.data?.isVerified === true || response?.data?.IsVerified === true;
    })();

    // ================= SOMQR =================
    const handleQRSuccess = (result: { data: string; type: SOMQRType }) => {
        if (pending.current) return;
        clearResult();
        setQrCode(result.data);
    };

    const showError = (message: string) => {
        setModal({show: true, title: "Error", message});
    };

    const handleModeChange = (newPreset: PresetId) => {
        if (pending.current) return;
        resetDiscovery();
        setPresetId(newPreset);
        setSettingsOpen(false);
        setSettingsNotice("");
        setSubmittedData(null);
        setResponse(null);
        setQrCode("");
        setFormValues({});
        setRequestViewerOpen(false);
        setResponseViewerOpen(false);
    };

    const verificationForm = rail === "PAPSS" && !papssSelectionReady ? null : endpointsLoading || formsLoading ? (
        <div className={styles.loadingContainer}>
            <SpinLoading />
            <p className={styles.loadingText}>Loading endpoint configurations...</p>
        </div>
    ) : mode === "form" ? (
        <div className={`${styles.formContainer} ${rail === "PAPSS" ? styles.fullWidthForm : ""}`}>
            {preset?.fields.filter(m => rail !== "PAPSS" || m.internalField !== "ToBIC").map((m) => (
                <div key={m.internalField} className={styles.formField}>
                    {(m.input === "select" || m.input === "bankSelect") ? (
                        <SelectInput
                            label={m.label}
                            value={fieldValue(m.userField)}
                            onChange={(e) => handleInputChange(m.userField, e.target.value)}
                            options={
                                m.internalField === "Type"
                                    ? (m.options ?? []).map(value => ({value, label: verificationMethods.find(option => option.value === value)?.label ?? value}))
                                    : [
                                        ...(m.defaultValue && !(rail === "PAPSS" ? participants : bicOptionsDev).some(bank => bank.value === m.defaultValue)
                                            ? [{value: m.defaultValue, label: m.defaultValue}] : []),
                                        ...(rail === "PAPSS" ? participants : bicOptionsDev),
                                    ]
                            }
                            required
                        />
                    ) : (
                        <Input
                            label={m.label}
                            value={fieldValue(m.userField)}
                            onChange={(e) => handleInputChange(m.userField, e.target.value)}
                            type="text"
                            required
                        />
                    )}
                </div>
            ))}
        </div>
    ) : (
        <div className={styles.qrSection}>
            {preset?.fields[0]?.input === "text" ? <Input label={preset.fields[0].label} value={qrCode} type="text" required
                onChange={event => {clearResult(); setQrCode(event.target.value);}}/> : <>
            <UploadQRScanner
                key={presetId + formsRevision}
                onScanSuccess={handleQRSuccess}
                onClear={() => {setQrCode(""); clearResult();}}
                onManualChange={data => {setQrCode(data); clearResult();}}
                validationError={qrError}
                disabled={loading || discovering || processingPayment || settingsOpen || formsLoading}
            /></>}
            {preset?.fields[0]?.input === "text" && qrError && <p role="alert">{qrError}</p>}
        </div>
    );

    const sendVerificationButton = (rail === "SIPS" || papssSelectionReady) && <ActionButton
        onClick={handleSubmit}
        className={styles.submitButton}
        disabled={
            loading || discovering || papssPolling || endpointsLoading || !!endpointsError ||
            (rail === "PAPSS" && !mappedField("VerificationRequest", "Rail")) || !isFormValid()
        }
    >
        {loading ? "Sending..." : "Send Verification Request"}
    </ActionButton>;

    if (activeProfile === "prod") return null;

    return (
        <RoleGuard allowedRoles={["gateway"]}>
            <div className={sharedStyles.container}>
                <header className={styles.pageHeader}>
                    <div className={styles.headingText}>
                        <h1 className={sharedStyles.mainTitle}>Verification Request Tester</h1>
                        <p className={sharedStyles.subTitle}>Send account, SOMQR, or P2G verification requests.</p>
                    </div>
                    <div className={styles.headerActions}>
                        <span title="Reload shared settings">
                            <ActionButton className={styles.headerIconButton} onClick={() => void loadForms()} disabled={loading || discovering || papssPolling || processingPayment || formsLoading || settingsOpen || resetting}>
                                <MdRefresh size={22} aria-hidden="true"/><span className={styles.srOnly}>Reload shared settings</span>
                            </ActionButton>
                        </span>
                        {roles.includes("configuration") && <span title={`Configure ${presetLabels[presetId]}`}>
                            <ActionButton className={styles.headerIconButton} onClick={() => {setSettingsOpen(true); setSettingsNotice("");}} disabled={!preset || formsLoading || !!formsError || endpointsLoading || !!endpointsError || loading || discovering || papssPolling || processingPayment || settingsOpen}>
                                <MdSettings size={22} aria-hidden="true"/><span className={styles.srOnly}>{`Configure ${presetLabels[presetId]}`}</span>
                            </ActionButton>
                        </span>}
                    </div>
                </header>

                {/* API URL */}
                {formsError && <p role="alert">{formsError}</p>}
                {usingDefaults && <p role="status">Using default settings. Configure and save to persist changes.</p>}
                {recoveryRevision && roles.includes("configuration") && <ActionButton disabled={resetting || formsLoading}
                    onClick={() => setConfirmReset(true)}>{resetting ? "Backing up and resetting…" : "Back up & Reset to Defaults"}</ActionButton>}
                {settingsNotice && <p role="status">{settingsNotice}</p>}
                {settingsOpen && preset && <VerificationFormSettings key={presetId + formsRevision}
                    id={presetId} preset={preset} mappings={adapterMappings} participantOptions={participants} onSave={savePreset} onReloadAdapter={reloadAdapter} onClose={() => setSettingsOpen(false)}/>}
                <fieldset disabled={loading || discovering || papssPolling || processingPayment || settingsOpen || formsLoading} style={{border: 0, padding: 0, margin: 0, minWidth: 0}}>

                <Input
                    label="Verification API Endpoint"
                    value={apiUrl}
                    onChange={(e) => {setApiUrl(e.target.value); clearResult(); resetDiscovery();}}
                    type="url"
                    placeholder="https://example.com/api/v1/Gateway/Verify"
                    errorMessage={urlError}
                    required
                />
                <SelectInput
                    label="Payment Rail"
                    value={rail}
                    options={[{value: "SIPS", label: "Domestic SIPS"}, {value: "PAPSS", label: "PAPSS"}]}
                    onChange={(e) => {
                        handleModeChange(e.target.value === "PAPSS" ? "papssAccount" : "domesticAccount");
                    }}
                />
                {endpointsError && <p role="alert">Failed to load adapter mappings: {endpointsError}</p>}
                {!endpointsLoading && !endpointsError && presetErrors.length > 0 && <div role="alert"><p>This method needs configuration before sending:</p><ul>{presetErrors.map(error => <li key={error}>{error}</li>)}</ul></div>}
                {rail === "PAPSS" && (
                    <div className={styles.discoveryCard}>
                        <h2>Find PAPSS destination banks</h2>
                        <p>Load available countries and participating banks to begin.</p>
                        {!mappedField("VerificationRequest", "Rail") && <p role="alert">PAPSS is unavailable: the backend adapter has no Rail mapping.</p>}
                        <ActionButton onClick={discoverParticipants} disabled={endpointsLoading || !!endpointsError || discovering || loading}>
                            {discovering ? "Loading participants…" : discoveryError ? "Retry Discovery" : discoveryLoaded ? "Reload PAPSS Participants" : "Load PAPSS Participants"}
                        </ActionButton>
                        {discovering && <p role="status">Loading PAPSS participants…</p>}
                        {discoveryError && <p className={styles.discoveryError} role="alert">{discoveryError}</p>}
                        {discoveryRequest && <div className={styles.discoveryActions}>
                            <ActionButton className={styles.viewerBtn} onClick={() => setDiscoveryViewer("request")}>View Discovery Request</ActionButton>
                            {discoveryResponse && <ActionButton className={styles.viewerBtn} onClick={() => setDiscoveryViewer("response")}>View Discovery Response</ActionButton>}
                        </div>}
                        {discoveryLoaded && !participants.length && <p role="status">No eligible participants with a country and destination BIC were returned. Reload to try again.</p>}
                        {discoveryLoaded && participants.length > 0 && <SelectInput label="Destination Country" value={destinationCountry}
                            options={countryOptions} required onChange={event => {
                                setDestinationCountry(event.target.value); setDestinationBic(""); setDestinationCurrency(""); clearResult();
                            }}/>}
                        {destinationCountry && <SelectInput label="Destination Bank" value={destinationBic} options={destinationBanks}
                            required onChange={event => {setDestinationBic(event.target.value); setDestinationCurrency(""); clearResult();}}/>}
                        {destinationBic && <SelectInput label="Destination Currency" value={destinationCurrency} options={destinationCurrencyOptions}
                            required onChange={event => {setDestinationCurrency(event.target.value); clearResult();}}/>}
                        {destinationCurrency && destinationCurrency !== "USD" && <p className={styles.discoveryError} role="alert">
                            SPS currently supports USD only for PAPSS. Please select USD to continue.
                        </p>}
                        {verificationForm}
                        {sendVerificationButton}
                    </div>
                )}

                {/* MODE SWITCH */}
                {rail === "SIPS" && <div className={styles.modeSwitch}>
                    {(["domesticAccount", "domesticQr", "domesticP2g"] as const).map(id => <ActionButton key={id}
                        onClick={() => handleModeChange(id)} className={`${styles.modeButton} ${presetId === id ? styles.activeMode : ""}`}>
                        {presetLabels[id]}
                    </ActionButton>)}
                </div>}

                {/* DOMESTIC FORM */}
                {rail === "SIPS" && verificationForm}
                {rail === "SIPS" && sendVerificationButton}
                </fieldset>

                {loading && (
                    <div className={styles.loadingContainer}>
                        <SpinLoading/>
                        <p className={styles.loadingText}>Sending verification request...</p>
                    </div>
                )}

                {/* VIEWERS */}
                {response && response.status === undefined && <p role="status">No response received</p>}
                {submittedData && response && (
                    <div className={styles.viewerButtons}>
                        <ActionButton
                            className={styles.viewerBtn}
                            onClick={() => setRequestViewerOpen(true)}
                        >
                            View Request Payload
                        </ActionButton>

                        <ActionButton
                            className={styles.viewerBtn}
                            disabled={response.status === undefined}
                            onClick={() => setResponseViewerOpen(true)}
                        >
                            View Response Payload
                        </ActionButton>
                    </div>
                )}

                {/* PAYMENT */}
                {response && !response.success && (
                    <div className={styles.qrPreview} role="alert">
                        <p>{typeof response.data?.code === "string" ? `${response.data.code}: ` : ""}{response.error}</p>
                        {rail === "PAPSS" && ["PAPSS_DISABLED", "PAPSS_NOT_ENABLED"].includes(response.data?.code) &&
                            <p>PAPSS is unavailable for this deployment or participant. Domestic SIPS has not been selected.</p>}
                    </div>
                )}
                {rail === "PAPSS" && response?.success && papssVerificationId && (
                    <PapssVerificationStatus
                        endpoint={apiUrl}
                        requestMessageId={papssVerificationId}
                        axiosPrivate={axiosPrivate}
                        onPollingChange={setPapssPolling}
                        onCompleted={handlePapssCompleted}
                    />
                )}
                {rail === "PAPSS" && papssVerificationResult &&
                    String(papssVerificationResult.status ?? papssVerificationResult.Status ?? "").toUpperCase() === "COMPLETED" &&
                    (papssVerificationResult.verified === true || papssVerificationResult.Verified === true) && <ActionButton
                        onClick={handleProceedToPapssPayment}
                        className={styles.paymentButton}
                        disabled={processingPayment}
                    >
                        {processingPayment ? "Processing Payment..." : "Proceed to Payment"}
                    </ActionButton>}
                {rail === "SIPS" && response?.success && isP2G && isVerified && <ActionButton
                    onClick={handleSendPaymentRequest}
                    className={styles.paymentButton}
                    disabled={processingPayment}
                >
                    {processingPayment ? "Processing Payment..." : "Proceed to Payment"}
                </ActionButton>}
                {rail === "SIPS" && !isP2G && response?.success && isVerified && (
                    <ActionButton
                        onClick={handleSendPaymentRequest}
                        className={styles.paymentButton}
                        disabled={processingPayment}
                    >
                        {processingPayment
                            ? "Processing Payment..."
                            : "Proceed to Payment"}
                    </ActionButton>
                )}
            </div>

            {/* MODALS */}
            <QRDataViewer data={discoveryViewer === "request" ? discoveryRequest : discoveryResponse?.data}
                isOpen={discoveryViewer !== null} onClose={() => setDiscoveryViewer(null)}
                rawResponse
                title={discoveryViewer === "request" ? "PAPSS Discovery Request" : "PAPSS Discovery Response"}/>
            {confirmReset && <AlertModal title="Back up & Reset Verification Settings"
                message="The original file will be backed up before all four verification methods are reset to built-in defaults. If the backup fails, the file will not be replaced. Continue?"
                buttonText="Back up & Reset" warning onConfirm={() => void resetForms()} onClose={() => setConfirmReset(false)}/>}
            <QRDataViewer
                data={submittedData ? {method: "POST", url: apiUrl, body: submittedData} : null}
                isOpen={requestViewerOpen}
                onClose={() => setRequestViewerOpen(false)}
                title="Verification Request"
            />

            <QRDataViewer
                data={response?.data}
                isOpen={responseViewerOpen}
                onClose={() => setResponseViewerOpen(false)}
                title="Verification Response"
                rawResponse
            />

            {modal.show && (
                <AlertModal
                    title={modal.title!}
                    message={modal.message!}
                    onConfirm={() => setModal({show: false})}
                    onClose={() => setModal({show: false})}
                    error
                />
            )}
        </RoleGuard>
    );
};

export default VerificationRequestPage;
