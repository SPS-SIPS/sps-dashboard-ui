import React, {useEffect, useMemo, useRef, useState} from "react";
import type {AxiosInstance} from "axios";
import {isAxiosError} from "axios";
import ActionButton from "../common/ActionButton/ActionButton";
import QRDataViewer from "../ScanToPay/QRDataViewer/QRDataViewer";
import {extractErrorMessage} from "../../utils/extractErrorMessage";
import styles from "./PapssVerificationStatus.module.css";

type StatusResponse = Record<string, unknown>;

type Props = {
    endpoint: string;
    requestMessageId: string;
    axiosPrivate: AxiosInstance;
    onPollingChange?: (polling: boolean) => void;
    onCompleted?: (data: StatusResponse) => void;
};

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 40;
const PENDING_STATES = new Set(["PENDING", "PROCESSING", "IN_PROGRESS", "ADMITTED"]);

const valueOf = (data: StatusResponse, ...keys: string[]) => {
    for (const key of keys) {
        const value = data[key] ?? data[key.charAt(0).toLowerCase() + key.slice(1)];
        if (value !== undefined && value !== null) return value;
    }
    return undefined;
};

const PapssVerificationStatus: React.FC<Props> = ({endpoint, requestMessageId, axiosPrivate, onPollingChange, onCompleted}) => {
    const [status, setStatus] = useState("PENDING");
    const [result, setResult] = useState<StatusResponse | null>(null);
    const [error, setError] = useState("");
    const [stoppedByUser, setStoppedByUser] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [polling, setPolling] = useState(false);
    const [requestViewerOpen, setRequestViewerOpen] = useState(false);
    const [responseViewerOpen, setResponseViewerOpen] = useState(false);
    const [retryNumber, setRetryNumber] = useState(0);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stopped = useRef(false);

    const statusUrl = useMemo(() => `${endpoint.replace(/\/+$/, "")}/${encodeURIComponent(requestMessageId)}`, [endpoint, requestMessageId]);
    const requestData = useMemo(() => ({method: "GET", url: statusUrl}), [statusUrl]);

    useEffect(() => {
        stopped.current = false;
        setStatus("PENDING");
        setResult(null);
        setError("");
        setStoppedByUser(false);
        setAttempts(0);
        setPolling(true);
        onPollingChange?.(true);

        const stop = () => {
            setPolling(false);
            onPollingChange?.(false);
        };

        const poll = async (attempt: number) => {
            if (stopped.current) return;
            setAttempts(attempt);
            try {
                const response = await axiosPrivate.get<StatusResponse>(statusUrl);
                if (stopped.current) return;

                const data = response.data ?? {};
                setResult(data);
                const nextStatus = String(valueOf(data, "status", "Status") ?? "PENDING").toUpperCase();
                setStatus(nextStatus);

                if (nextStatus === "COMPLETED" || !PENDING_STATES.has(nextStatus)) {
                    stop();
                    onCompleted?.(data);
                    return;
                }

                if (attempt >= MAX_ATTEMPTS) {
                    setError("PAPSS verification is still pending. Try checking again later.");
                    stop();
                    return;
                }

                timer.current = setTimeout(() => void poll(attempt + 1), POLL_INTERVAL_MS);
            } catch (requestError) {
                if (stopped.current) return;
                const data = isAxiosError(requestError) ? requestError.response?.data : undefined;
                setError(typeof data?.message === "string"
                    ? data.message
                    : extractErrorMessage(requestError, "Unable to retrieve the PAPSS verification result."));
                stop();
            }
        };

        void poll(1);
        return () => {
            stopped.current = true;
            if (timer.current) clearTimeout(timer.current);
            onPollingChange?.(false);
        };
    }, [axiosPrivate, onCompleted, onPollingChange, retryNumber, statusUrl]);

    const retry = () => {
        setError("");
        setStoppedByUser(false);
        setRetryNumber(previous => previous + 1);
    };

    const stopPolling = () => {
        stopped.current = true;
        if (timer.current) clearTimeout(timer.current);
        setPolling(false);
        setStoppedByUser(true);
        onPollingChange?.(false);
    };

    const verified = valueOf(result ?? {}, "verified", "Verified") === true;
    const accountName = valueOf(result ?? {}, "accountName", "AccountName");
    const accountNumber = valueOf(result ?? {}, "accountNumber", "AccountNumber");
    const accountType = valueOf(result ?? {}, "accountType", "AccountType");
    const counterpartyBic = valueOf(result ?? {}, "counterpartyBic", "CounterpartyBic");
    const reason = valueOf(result ?? {}, "reason", "Reason");

    return <section className={styles.card} aria-live="polite">
        <div className={styles.headingRow}>
            <div>
                <h2>PAPSS Verification Result</h2>
                <p className={styles.messageId}>Request ID: {requestMessageId}</p>
            </div>
            <span className={`${styles.status} ${status === "COMPLETED" ? (verified ? styles.success : styles.failure) : styles.pending}`}>
                {status}
            </span>
        </div>

        {polling && <div className={styles.pollingControls}>
            <p className={styles.pendingMessage}>Waiting for the PAPSS verification result… Check {attempts} of {MAX_ATTEMPTS}.</p>
            <ActionButton className={styles.stopButton} onClick={stopPolling}>Stop Checking</ActionButton>
        </div>}
        {stoppedByUser && <div className={styles.stoppedMessage} role="status">
            <p>Status checking stopped. The PAPSS request remains active.</p>
            <ActionButton onClick={retry}>Check Again</ActionButton>
        </div>}
        {error && <div className={styles.error} role="alert"><p>{error}</p><ActionButton onClick={retry}>Check Again</ActionButton></div>}

        {status === "COMPLETED" && result && <div className={styles.details}>
            <p><strong>Verified:</strong> {verified ? "Yes" : "No"}</p>
            {accountName !== undefined && <p><strong>Account name:</strong> {String(accountName)}</p>}
            {accountNumber !== undefined && <p><strong>Account number:</strong> {String(accountNumber)}</p>}
            {accountType !== undefined && <p><strong>Account type:</strong> {String(accountType)}</p>}
            {counterpartyBic !== undefined && <p><strong>Counterparty BIC:</strong> {String(counterpartyBic)}</p>}
            {!verified && reason !== undefined && <p><strong>Reason:</strong> {String(reason)}</p>}
        </div>}

        <div className={styles.actions}>
            <ActionButton className={styles.viewerButton} onClick={() => setRequestViewerOpen(true)}>View Status Request</ActionButton>
            {result && <ActionButton className={styles.viewerButton} onClick={() => setResponseViewerOpen(true)}>View Status Response</ActionButton>}
        </div>

        <QRDataViewer data={requestData} isOpen={requestViewerOpen} onClose={() => setRequestViewerOpen(false)} title="PAPSS Verification Status Request" rawResponse/>
        <QRDataViewer data={result} isOpen={responseViewerOpen} onClose={() => setResponseViewerOpen(false)} title="PAPSS Verification Status Response" rawResponse/>
    </section>;
};

export default PapssVerificationStatus;
