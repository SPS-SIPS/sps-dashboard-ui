import React, { useMemo } from 'react';
import {
    FiFileText,
    FiHash,
    FiPercent,
    FiTrendingUp,
    FiBarChart2,
    FiGlobe,
    FiDatabase
} from 'react-icons/fi';
import styles from './MessageDefinitionsTable.module.css';

interface MessageDefinition {
    msgDefIdr: string;
    count: number;
}

interface MessageDefinitionsData {
    messageDefinitions: MessageDefinition[];
}

interface MessageDefinitionsTableProps {
    data: MessageDefinitionsData;
    title?: string;
}

const MessageDefinitionsTable: React.FC<MessageDefinitionsTableProps> = ({
                                                                             data,
                                                                             title = "ISO Message Standards Coverage"
                                                                         }) => {

    const totalCount = useMemo(() => {
        return data.messageDefinitions.reduce((sum, item) => sum + item.count, 0);
    }, [data.messageDefinitions]);

    // Sort by count (highest first)
    const sortedData = useMemo(() => {
        return [...data.messageDefinitions].sort((a, b) => b.count - a.count);
    }, [data.messageDefinitions]);

    // Get percentage for each item
    const getPercentage = (count: number) => {
        return totalCount > 0 ? (count / totalCount) * 100 : 0;
    };

    // Format message ID for display
    const formatMessageId = (msgId: string) => {
        const parts = msgId.split('.');
        return (
            <div className={styles.messageId}>
                <span className={styles.standardName}>{parts[0].toUpperCase()}</span>
                <span className={styles.version}>
                    v{parts[1]}.{parts[2]}.{parts[3]}
                </span>
            </div>
        );
    };

    // Get status based on percentage
    const getStatus = (percentage: number) => {
        if (percentage > 50) return { label: 'High', color: '#10b981' };
        if (percentage > 20) return { label: 'Medium', color: '#f59e0b' };
        return { label: 'Low', color: '#ef4444' };
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <div className={styles.titleIcon}>
                        <FiDatabase size={24} />
                    </div>
                    <div>
                        <h3 className={styles.title}>{title}</h3>
                        <p className={styles.subtitle}>ISO 20022 Financial Message Standards</p>
                    </div>
                </div>
                <div className={styles.summary}>
                    <div className={styles.summaryItem}>
                        <FiHash className={styles.summaryIcon} />
                        <div>
                            <span className={styles.summaryValue}>
                                {totalCount.toLocaleString()}
                            </span>
                            <span className={styles.summaryLabel}>Total Messages</span>
                        </div>
                    </div>
                    <div className={styles.summaryItem}>
                        <FiGlobe className={styles.summaryIcon} />
                        <div>
                            <span className={styles.summaryValue}>
                                {sortedData.length}
                            </span>
                            <span className={styles.summaryLabel}>Standards</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Header */}
            <div className={styles.tableHeader}>
                <div className={styles.tableHeaderRow}>
                    <div className={styles.headerCell}>
                        <FiFileText className={styles.headerIcon} />
                        <span>ISO Standard</span>
                    </div>
                    <div className={styles.headerCell}>
                        <FiBarChart2 className={styles.headerIcon} />
                        <span>Usage</span>
                    </div>
                    <div className={styles.headerCell}>
                        <FiPercent className={styles.headerIcon} />
                        <span>Distribution</span>
                    </div>
                    <div className={styles.headerCell}>
                        <FiTrendingUp className={styles.headerIcon} />
                        <span>Status</span>
                    </div>
                </div>
            </div>

            {/* Table Body */}
            <div className={styles.tableBody}>
                {sortedData.map((item, index) => {
                    const percentage = getPercentage(item.count);
                    const status = getStatus(percentage);
                    const rank = index + 1;

                    return (
                        <div key={item.msgDefIdr} className={styles.tableRow}>
                            {/* Standard Column */}
                            <div className={styles.standardColumn}>
                                <div className={styles.rankBadge}>#{rank}</div>
                                <div className={styles.standardInfo}>
                                    {formatMessageId(item.msgDefIdr)}
                                    <div className={styles.messageCode}>
                                        {item.msgDefIdr}
                                    </div>
                                </div>
                            </div>

                            {/* Usage Column */}
                            <div className={styles.usageColumn}>
                                <div className={styles.usageValue}>
                                    {item.count.toLocaleString()}
                                </div>
                                <div className={styles.usageLabel}>messages</div>
                            </div>

                            {/* Distribution Column */}
                            <div className={styles.distributionColumn}>
                                <div className={styles.percentageValue}>
                                    {percentage.toFixed(1)}%
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{
                                            width: `${percentage}%`,
                                            background: `linear-gradient(90deg, #3b82f6 0%, #1d4ed8 ${Math.min(percentage, 100)}%)`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Status Column */}
                            <div className={styles.statusColumn}>
                                <div
                                    className={styles.statusBadge}
                                    style={{
                                        background: `${status.color}20`,
                                        borderColor: `${status.color}40`,
                                        color: status.color
                                    }}
                                >
                                    {status.label}
                                </div>
                                <div className={styles.trendIndicator}>
                                    <div
                                        className={styles.trendBar}
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: status.color
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <div className={styles.footerInfo}>
                    <div className={styles.legend}>
                        <div className={styles.legendItem}>
                            <div className={styles.legendColor} style={{ backgroundColor: '#10b981' }} />
                            <span className={styles.legendLabel}>High Usage (50%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <div className={styles.legendColor} style={{ backgroundColor: '#f59e0b' }} />
                            <span className={styles.legendLabel}>Medium Usage (20-50%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <div className={styles.legendColor} style={{ backgroundColor: '#ef4444' }} />
                            <span className={styles.legendLabel}>Low Usage (20%)</span>
                        </div>
                    </div>
                </div>
                <div className={styles.coverage}>
                    <span className={styles.coverageLabel}>Coverage Score</span>
                    <span className={styles.coverageValue}>
                        {((sortedData.length / 400) * 100).toFixed(1)}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MessageDefinitionsTable;