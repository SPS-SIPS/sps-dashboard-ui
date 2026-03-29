import React, { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import RoleGuard from "../auth/RoleGuard";
import useLogs, { LogFileResponse, PagedResult } from "../api/hooks/useLogs";
import { extractErrorMessage } from "../utils/extractErrorMessage";
import {
    FiDownload,
    FiFile,
    FiCalendar,
    FiHardDrive,
    FiRefreshCw,
    FiAlertCircle,
    FiClock,
    FiCheckCircle,
    FiSearch,
    FiX,
    FiArrowUp,
    FiArrowDown,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
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

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

export default function Logs() {
    const { getLogFiles, downloadLogFile } = useLogs();
    const [logs, setLogs] = useState<LogFileResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [state, setState] = useState<LogState>({
        loading: false,
        downloading: null,
        error: null,
        success: null,
    });

    const searchTimeoutRef = useRef<number | undefined>(undefined);

    // Debounce search input
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = window.setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm]);

    const fetchLogs = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null, success: null }));
        try {
            const result: PagedResult<LogFileResponse> = await getLogFiles(
                currentPage,
                pageSize,
                debouncedSearchTerm || undefined,
                sortDirection
            );
            setLogs(result.items);
            setTotalCount(result.totalCount);
            setState(prev => ({ ...prev, loading: false }));
        } catch (err) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: extractErrorMessage(err, "Failed to fetch log files")
            }));
        }
    }, [currentPage, pageSize, debouncedSearchTerm, sortDirection]);

    useEffect(() => {
        void fetchLogs();
    }, [currentPage, pageSize, debouncedSearchTerm, sortDirection])

    const handleDownload = async (fileName: string) => {
        setState(prev => ({ ...prev, downloading: fileName, error: null, success: null }));
        try {
            const blob = await downloadLogFile(fileName);
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

            setTimeout(() => {
                setState(prev => ({ ...prev, success: null }));
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
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            void fetchLogs();
        }
    };

    const handleSearchClear = () => {
        setSearchTerm("");
        setDebouncedSearchTerm("");
        setCurrentPage(1);
    };

    const handleSortToggle = () => {
        setSortDirection(prev => prev === "desc" ? "asc" : "desc");
        setCurrentPage(1);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalCount / pageSize);
    const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

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
                            View, search, and download application log files
                        </p>
                    </div>

                    <button
                        className={styles.refreshButton}
                        onClick={handleRefresh}
                        disabled={state.loading}
                        aria-label="Refresh log files"
                    >
                        <FiRefreshCw className={`${styles.refreshIcon} ${state.loading ? styles.spinning : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Stats Summary */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIconWrapper}>
                            <FiFile className={styles.statIcon} />
                        </div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>{totalCount}</div>
                            <div className={styles.statLabel}>Total Files</div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIconWrapper}>
                            <FiHardDrive className={styles.statIcon} />
                        </div>
                        <div className={styles.statContent}>
                            <div className={styles.statValue}>
                                {formatFileSize(logs.reduce((total, log) => total + log.sizeBytes, 0))}
                            </div>
                            <div className={styles.statLabel}>Total Size</div>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIconWrapper}>
                            <FiClock className={styles.statIcon} />
                        </div>
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
                        <FiCheckCircle className={styles.messageIcon} />
                        <span>{state.success}</span>
                    </div>
                )}

                {state.error && (
                    <div className={styles.errorMessage}>
                        <FiAlertCircle className={styles.messageIcon} />
                        <span>{state.error}</span>
                    </div>
                )}

                {/* Search and Filters Bar */}
                <div className={styles.filtersBar}>
                    <div className={styles.searchWrapper}>
                        <FiSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search by filename..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search log files"
                        />
                        {searchTerm && (
                            <button
                                className={styles.clearSearchButton}
                                onClick={handleSearchClear}
                                aria-label="Clear search"
                            >
                                <FiX />
                            </button>
                        )}
                    </div>

                    <div className={styles.filtersRight}>
                        <button
                            className={styles.sortButton}
                            onClick={handleSortToggle}
                            aria-label={`Sort ${sortDirection === "desc" ? "ascending" : "descending"}`}
                        >
                            {sortDirection === "desc" ? <FiArrowDown /> : <FiArrowUp />}
                            <span>{sortDirection === "desc" ? "Newest First" : "Oldest First"}</span>
                        </button>

                        <div className={styles.pageSizeSelector}>
                            <span className={styles.pageSizeLabel}>Show:</span>
                            <select
                                className={styles.pageSizeSelect}
                                value={pageSize}
                                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                aria-label="Items per page"
                            >
                                {PAGE_SIZE_OPTIONS.map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Log Files Table */}
                <div className={styles.tableContainer}>
                    {state.loading ? (
                        <div className={styles.loadingSkeleton}>
                            <div className={styles.skeletonHeader} />
                            {[...Array(pageSize > 5 ? 5 : pageSize)].map((_, i) => (
                                <div key={i} className={styles.skeletonRow} />
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className={styles.emptyState}>
                            <FiFile className={styles.emptyIcon} />
                            <h3>No log files found</h3>
                            <p>
                                {searchTerm
                                    ? `No results found for "${searchTerm}"`
                                    : "There are no log files available at the moment."}
                            </p>
                            {searchTerm && (
                                <button className={styles.clearSearchBtn} onClick={handleSearchClear}>
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={styles.tableWrapper}>
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
                                                <FiFile className={styles.fileIcon} />
                                                <span className={styles.fileNameText} title={log.fileName}>
                                                        {log.fileName}
                                                    </span>
                                            </div>
                                        </td>
                                        <td className={styles.td}>
                                            <div className={styles.dateCell}>
                                                <FiCalendar className={styles.dateIcon} />
                                                <span>{formatDate(log.lastWriteTime)}</span>
                                            </div>
                                        </td>
                                        <td className={styles.td}>
                                            <div className={styles.sizeCell}>
                                                <FiHardDrive className={styles.sizeIcon} />
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
                                                <FiDownload className={styles.downloadIcon} />
                                                {state.downloading === log.fileName ? "Downloading..." : "Download"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!state.loading && totalCount > 0 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Showing {startItem} to {endItem} of {totalCount} files
                        </div>
                        <div className={styles.paginationControls}>
                            <button
                                className={styles.paginationButton}
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                aria-label="First page"
                            >
                                <FiChevronsLeft />
                            </button>
                            <button
                                className={styles.paginationButton}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                aria-label="Previous page"
                            >
                                <FiChevronLeft />
                            </button>
                            <span className={styles.paginationCurrent}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                className={styles.paginationButton}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                aria-label="Next page"
                            >
                                <FiChevronRight />
                            </button>
                            <button
                                className={styles.paginationButton}
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                aria-label="Last page"
                            >
                                <FiChevronsRight />
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer Info */}
                <div className={styles.footerInfo}>
                    <FiAlertCircle className={styles.infoIcon} />
                    <p className={styles.infoText}>
                        Log files are automatically rotated and archived. Downloaded files are saved to your device.
                    </p>
                </div>
            </div>
        </RoleGuard>
    );
}