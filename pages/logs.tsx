import React, {useState, useEffect} from "react";
import Head from "next/head";
import RoleGuard from "../auth/RoleGuard";
import useLogs, {LogFileResponse} from "../api/hooks/useLogs";
import {extractErrorMessage} from "../utils/extractErrorMessage";
import {
    FiDownload,
    FiFile,
    FiCalendar,
    FiHardDrive,
    FiRefreshCw,
    FiAlertCircle,
    FiClock,
    FiCheckCircle
} from "react-icons/fi";
import styles from "../styles/LogsPage.module.css";

type LogState = {
    loading: boolean;
    downloading: string | null;
    error: string | null;
    success: string | null;
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
};

export default function Logs() {
    const {getLogFiles, downloadLogFile} = useLogs();
    const [logs, setLogs] = useState<LogFileResponse[]>([]);
    const [state, setState] = useState<LogState>({
        loading: false,
        downloading: null,
        error: null,
        success: null,
    });

    const fetchLogs = async () => {
        setState(prev => ({...prev, loading: true, error: null, success: null}));
        try {
            const logFiles = await getLogFiles();
            // Sort by last write time (newest first)
            const sortedLogs = logFiles.sort((a, b) =>
                new Date(b.lastWriteTime).getTime() - new Date(a.lastWriteTime).getTime()
            );
            setLogs(sortedLogs);
            setState(prev => ({...prev, loading: false}));
        } catch (err) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: extractErrorMessage(err, "Failed to fetch log files")
            }));
        }
    };

    useEffect(() => {
        void fetchLogs();
    }, []);

    const handleDownload = async (fileName: string) => {
        setState(prev => ({...prev, downloading: fileName, error: null, success: null}));
        try {
            const blob = await downloadLogFile(fileName);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setState(prev => ({
                ...prev,
                downloading: null,
                success: `Downloaded ${fileName} successfully`
            }));

            // Clear success message after 3 seconds
            setTimeout(() => {
                setState(prev => ({...prev, success: null}));
            }, 3000);
        } catch (err) {
            setState(prev => ({
                ...prev,
                downloading: null,
                error: extractErrorMessage(err, `Failed to download ${fileName}`)
            }));
        }
    };

    const handleRefresh = () => {
        void fetchLogs();
    };

    return (
        <RoleGuard allowedRoles={["logs"]}>
            <Head>
                <title>Log Files | SPS</title>
            </Head>

            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>Log Files</h1>
                        <p className={styles.subtitle}>
                            View and download application log files
                        </p>
                    </div>

                    <button
                        className={styles.refreshButton}
                        onClick={handleRefresh}
                        disabled={state.loading}
                        aria-label="Refresh log files"
                    >
                        <FiRefreshCw className={`${styles.refreshIcon} ${state.loading ? styles.spinning : ''}`}/>
                        Refresh
                    </button>
                </div>

                {/* Stats Summary */}
                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <FiFile className={styles.statIcon}/>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>{logs.length}</div>
                            <div className={styles.statLabel}>Total Files</div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <FiHardDrive className={styles.statIcon}/>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>
                                {formatFileSize(logs.reduce((total, log) => total + log.sizeBytes, 0))}
                            </div>
                            <div className={styles.statLabel}>Total Size</div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <FiClock className={styles.statIcon}/>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>
                                {logs.length > 0 ? formatDate(logs[0].lastWriteTime) : "N/A"}
                            </div>
                            <div className={styles.statLabel}>Latest Log</div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {state.success && (
                    <div className={styles.successMessage}>
                        <FiCheckCircle className={styles.successIcon}/>
                        <span>{state.success}</span>
                    </div>
                )}

                {state.error && (
                    <div className={styles.errorMessage}>
                        <FiAlertCircle className={styles.errorIcon}/>
                        <span>{state.error}</span>
                    </div>
                )}

                {/* Log Files Table */}
                <div className={styles.tableContainer}>
                    {state.loading ? (
                        <div className={styles.loadingSkeleton}>
                            <div className={styles.skeletonHeader}/>
                            <div className={styles.skeletonRow}/>
                            <div className={styles.skeletonRow}/>
                            <div className={styles.skeletonRow}/>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className={styles.emptyState}>
                            <FiFile className={styles.emptyIcon}/>
                            <h3>No log files found</h3>
                            <p>There are no log files available at the moment.</p>
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th className={styles.th}>File Name</th>
                                <th className={styles.th}>Last Modified</th>
                                <th className={styles.th}>Size</th>
                                <th className={styles.th}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {logs.map((log) => (
                                <tr key={log.fileName} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div className={styles.fileName}>
                                            <FiFile className={styles.fileIcon}/>
                                            <span className={styles.fileNameText} title={log.fileName}>
                          {log.fileName}
                        </span>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.dateCell}>
                                            <FiCalendar className={styles.dateIcon}/>
                                            <span>{formatDate(log.lastWriteTime)}</span>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.sizeCell}>
                                            <FiHardDrive className={styles.sizeIcon}/>
                                            <span>{formatFileSize(log.sizeBytes)}</span>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <button
                                            className={styles.downloadButton}
                                            onClick={() => handleDownload(log.fileName)}
                                            disabled={state.downloading === log.fileName}
                                            aria-label={`Download ${log.fileName}`}
                                        >
                                            <FiDownload className={styles.downloadIcon}/>
                                            {state.downloading === log.fileName ? "Downloading..." : "Download"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer Info */}
                <div className={styles.footerInfo}>
                    <p className={styles.infoText}>
                        <FiAlertCircle className={styles.infoIcon}/>
                        Log files are automatically rotated and archived. Downloaded files are saved to your device.
                    </p>
                </div>
            </div>
        </RoleGuard>
    );
}