import React, { useState, useEffect } from "react";
import { FiX, FiEye } from "react-icons/fi";

import { useISOMessages } from "../../api/hooks/useISOMessages";
import {
  getISOMessageTypeText,
  getTransactionStatusText,
  ISOMessage,
  ISOMessageType,
  TransactionStatus,
} from "../../types/types";
import SelectInput from "../../component/common/SelectInput/SelectInput";
import SearchInput from "../../component/common/SearchInput/SearchInput";
import ActionButton from "../../component/common/ActionButton/ActionButton";

import styles from "../../styles/ISOMessagesList.module.css";
import RoleGuard from "../../auth/RoleGuard";
import XmlViewerModal from "../../component/XmlViewerModal/XmlViewerModal";
import AlertModal from "../../component/common/AlertModal/AlertModal";
import { useAuthentication } from "../../auth/AuthProvider";
import IsoMessageDetails from "../../component/IsoMessageDetails/IsoMessageDetails/IsoMessageDetails";
import ExcelExport from "../../component/ExcelExport/excel-export";
import ColumnVisibilityModal from "../../component/common/ColumnVisibilityModal/ColumnVisibilityModal";

const allColumns = [
  { id: "listItemId", label: "List Item ID" },
  { id: "operationType", label: "Operation Type" },
  { id: "direction", label: "Direction" },
  { id: "rail", label: "Rail" },
  { id: "id", label: "ID" },
  { id: "msgId", label: "Message ID" },
  { id: "messageType", label: "Type" },
  { id: "status", label: "Status" },
  { id: "date", label: "Date" },
  { id: "recordedAtUtc", label: "Recorded At (UTC)" },
  { id: "messageCreatedAtUtc", label: "Message Created At (UTC)" },
  { id: "fromBIC", label: "From BIC" },
  { id: "toBIC", label: "To BIC" },
  { id: "txId", label: "Transaction ID" },
  { id: "endToEndId", label: "End To End ID" },
  { id: "bizMsgIdr", label: "Business Msg ID" },
  { id: "msgDefIdr", label: "Msg Definition ID" },
  { id: "reason", label: "Reason" },
  { id: "additionalInfo", label: "Additional Info" },
  { id: "request", label: "Request" },
  { id: "response", label: "Response" },
];

const EMPTY_FILTERS = {
  RelatedToISOMessageId: "",
  msgId: "",
  bizMsgIdr: "",
  msgDefIdr: "",
  status: "",
  OperationType: "",
  Direction: "",
  type: "",
  endToEndId: "",
  fromDate: "",
  toDate: "",
  transactionId: "",
  debtorAccount: "",
  creditorAccount: "",
};

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 / page" },
  { value: "25", label: "25 / page" },
  { value: "50", label: "50 / page" },
  { value: "100", label: "100 / page" },
];

const VISIBLE_COLUMNS_KEY = "papss_iso_messages_visible_columns";
const PAGE_SIZE_KEY = "papss_iso_messages_page_size"; // New localStorage key for page size
const MESSAGE_RAIL = "PAPSS" as const;

const ISOMessagesList = () => {
  const initialPageSize =
    typeof window !== "undefined"
      ? Number(localStorage.getItem(PAGE_SIZE_KEY)) || 10
      : 10;
  const [selectedMessage, setSelectedMessage] = useState<ISOMessage | null>(
    null
  );

  const handleShowDetails = (message: ISOMessage) => {
    setSelectedMessage(message);
  };

  const handleCloseDetails = () => {
    setSelectedMessage(null);
  };

  const { messages, loading, error, query, setQuery, refetch } =
    useISOMessages({ page: 0, pageSize: initialPageSize, Rail: MESSAGE_RAIL });

  const [alertModal, setAlertModal] = useState<{
    title: string;
    message: string;
    error: boolean;
  } | null>(null);

  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedXml, setSelectedXml] = useState<{
    content: string;
    title: string;
  } | null>(null);

  const DEFAULT_VISIBLE_COLUMNS = [
    "listItemId",
    "operationType",
    "direction",
    "messageType",
    "status",
    "msgDefIdr",
    "request",
    "response",
    "reason",
  ];

  const { roles } = useAuthentication();
  const showDetailsColumn = roles.includes("transactions");

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const stored = localStorage.getItem(VISIBLE_COLUMNS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_VISIBLE_COLUMNS;
  });

  const [selectedPageSize, setSelectedPageSize] = useState<number>(() => {
    const stored = localStorage.getItem(PAGE_SIZE_KEY);
    return stored ? parseInt(stored) : 10;
  });

  useEffect(() => {
    if (query.page !== 0 || query.pageSize !== selectedPageSize) {
      setQuery({ page: 0, pageSize: selectedPageSize, Rail: MESSAGE_RAIL });
    }
  }, [selectedPageSize]);

  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns((prev) => {
      const updated = prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId];

      localStorage.setItem(VISIBLE_COLUMNS_KEY, JSON.stringify(updated));

      return updated;
    });
  };

  const [filters, setFilters] = useState<typeof EMPTY_FILTERS>({
    ...EMPTY_FILTERS,
  });

  const advancedFilterCount = [
    filters.msgId,
    filters.bizMsgIdr,
    filters.msgDefIdr,
    filters.RelatedToISOMessageId,
    filters.type,
    filters.debtorAccount,
    filters.creditorAccount,
    filters.OperationType,
    filters.Direction,
  ].filter(Boolean).length;
  const hasActiveFilters = Object.values(filters).some(Boolean);

  const clearFilters = () => {
    setFilters({ ...EMPTY_FILTERS });
    setQuery({
      page: 0,
      Rail: MESSAGE_RAIL,
      status: undefined,
      type: undefined,
      OperationType: undefined,
      Direction: undefined,
      RelatedToISOMessageId: undefined,
      msgId: undefined,
      bizMsgIdr: undefined,
      endToEndId: undefined,
      transactionId: undefined,
      msgDefIdr: undefined,
      fromDate: undefined,
      toDate: undefined,
      debtorAccount: undefined,
      creditorAccount: undefined,
    });
  };

  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value);
    setSelectedPageSize(newPageSize);

    localStorage.setItem(PAGE_SIZE_KEY, String(newPageSize));
  };

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    setQuery({
      ...newFilters,
      status: newFilters.status
        ? (newFilters.status as unknown as TransactionStatus)
        : undefined,
      type: newFilters.type
        ? (newFilters.type as unknown as ISOMessageType)
        : undefined,
      OperationType: newFilters.OperationType
        ? (newFilters.OperationType as "PAYMENT" | "VERIFICATION" | "RETURN" | "STATUS_ENQUIRY" | "RECALL")
        : undefined,
      Direction: newFilters.Direction
        ? (newFilters.Direction as "INBOUND" | "OUTBOUND")
        : undefined,
      RelatedToISOMessageId: newFilters.RelatedToISOMessageId
        ? Number(newFilters.RelatedToISOMessageId)
        : undefined,
      transactionId: newFilters.transactionId || undefined,
      page: 0,
      Rail: MESSAGE_RAIL,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusClass = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.Success:
        return styles.success;
      case TransactionStatus.Failed:
        return styles.error;
      case TransactionStatus.Pending:
        return styles.warning;
      case TransactionStatus.ReadyForReturn:
        return styles.error;
      case TransactionStatus.CheckStatus:
        return styles.info;
      default:
        return status;
    }
  };

  const renderCellContent = (message: ISOMessage, columnId: string) => {
    switch (columnId) {
      case "messageType":
        return getISOMessageTypeText(message.messageType);
      case "status":
        return (
          <span
            className={`${styles.statusBadge} ${getStatusClass(
              message.status
            )}`}
          >
            {getTransactionStatusText(message.status)}
          </span>
        );
      case "date":
        return formatDate(message.date);
      case "recordedAtUtc":
        return message.recordedAtUtc ? formatDate(message.recordedAtUtc) : "-";
      case "messageCreatedAtUtc":
        return message.messageCreatedAtUtc
          ? formatDate(message.messageCreatedAtUtc)
          : "-";
      case "request":
        return (
          <button
            onClick={() => {
              setSelectedXml({
                content: message[columnId as keyof ISOMessage] as string,
                title: `${columnId} - ${message.msgId}`,
              });
            }}
            className={styles.xmlButton}
          >
            View Request
          </button>
        );
      case "response":
        return (
          <button
            onClick={() => {
              setSelectedXml({
                content: message[columnId as keyof ISOMessage] as string,
                title: `${columnId} - ${message.msgId}`,
              });
            }}
            className={styles.xmlButton}
          >
            View Response
          </button>
        );
      default:
        return message[columnId as keyof ISOMessage] || "-";
    }
  };

  return (
    <RoleGuard allowedRoles={["iso_messages"]}>
      {!selectedMessage ? (
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>PAPSS ISO Messages</h2>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.searchContainer}>
            <div className={styles.searchInputRow}>
              <SearchInput
                label="Transaction ID"
                value={filters.transactionId}
                onChange={(e) =>
                  handleFilterChange("transactionId", e.target.value)
                }
                placeholder="Search by Transaction ID"
              />
              <SearchInput
                label="End-to-End ID"
                value={filters.endToEndId}
                onChange={(e) => handleFilterChange("endToEndId", e.target.value)}
                placeholder="Search by End-to-End ID"
              />
              <SelectInput
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                options={Object.entries(TransactionStatus)
                  .filter(([key]) => isNaN(Number(key)))
                  .map(([key, value]) => ({ value: String(value), label: key }))}
                placeholder="-- Select a Status --"
              />
            </div>

            {showAdvancedFilters && (
              <div className={styles.advancedFiltersBackdrop} role="presentation" onClick={() => setShowAdvancedFilters(false)}>
                <section className={styles.advancedFiltersModal} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                  <div className={styles.advancedFiltersHeader}>
                    <h3>Advanced filters</h3>
                    <button type="button" className={styles.advancedFiltersClose} aria-label="Close advanced filters" onClick={() => setShowAdvancedFilters(false)}>
                      <FiX />
                    </button>
                  </div>
                  <div className={styles.advancedFiltersGrid}>
                    <SearchInput label="Message ID" value={filters.msgId} onChange={(e) => handleFilterChange("msgId", e.target.value)} placeholder="Search by Message ID" />
                    <SearchInput label="Business Message ID" value={filters.bizMsgIdr} onChange={(e) => handleFilterChange("bizMsgIdr", e.target.value)} placeholder="Search by Business Message ID" />
                    <SearchInput label="Related ISO Message ID" value={filters.RelatedToISOMessageId} onChange={(e) => handleFilterChange("RelatedToISOMessageId", e.target.value)} placeholder="Search by Related ISO Message ID" />
                    <SearchInput label="Message Definition ID" value={filters.msgDefIdr} onChange={(e) => handleFilterChange("msgDefIdr", e.target.value)} placeholder="Search by Message Definition ID" />
                    <SearchInput label="Debtor Account" value={filters.debtorAccount} onChange={(e) => handleFilterChange("debtorAccount", e.target.value)} placeholder="Search by Debtor Account" />
                    <SearchInput label="Creditor Account" value={filters.creditorAccount} onChange={(e) => handleFilterChange("creditorAccount", e.target.value)} placeholder="Search by Creditor Account" />
                    <SelectInput label="Message Type" value={filters.type} onChange={(e) => handleFilterChange("type", e.target.value)} options={Object.entries(ISOMessageType).filter(([key]) => isNaN(Number(key))).map(([key, value]) => ({ value: String(value), label: key }))} placeholder="-- Select a Message Type --" />
                    <SelectInput label="Operation Type" value={filters.OperationType} onChange={(e) => handleFilterChange("OperationType", e.target.value)} options={[{ value: "PAYMENT", label: "Payment" }, { value: "VERIFICATION", label: "Verification" }, { value: "RETURN", label: "Return" }, { value: "STATUS_ENQUIRY", label: "Status Enquiry" }, { value: "RECALL", label: "Recall" }]} placeholder="-- Select an Operation Type --" />
                    <SelectInput label="Direction" value={filters.Direction} onChange={(e) => handleFilterChange("Direction", e.target.value)} options={[{ value: "INBOUND", label: "Inbound" }, { value: "OUTBOUND", label: "Outbound" }]} placeholder="-- Select a Direction --" />
                  </div>
                  <div className={styles.advancedFiltersFooter}>
                    <ActionButton onClick={clearFilters} disabled={loading || !hasActiveFilters} type="button" className={styles.clearButton}>Clear filters</ActionButton>
                    <ActionButton onClick={() => setShowAdvancedFilters(false)} type="button" className={styles.refreshButton}>Apply</ActionButton>
                  </div>
                </section>
              </div>
            )}

            <div className={styles.filterControlsRow}>
              <div className={styles.dateGroup}>
                <div className={styles.dateInput}>
                  <label>From date</label>
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) =>
                      handleFilterChange("fromDate", e.target.value)
                    }
                  />
                </div>
                <div className={styles.dateInput}>
                  <label>To date</label>
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) =>
                      handleFilterChange("toDate", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className={styles.displayControls}>
                <div className={styles.pageSizeControl}>
                  <SelectInput
                    label=""
                    value={String(selectedPageSize)} // Use selectedPageSize from state
                    onChange={(e) => handlePageSizeChange(e.target.value)}
                    options={PAGE_SIZE_OPTIONS}
                    placeholder="Page size"
                  />
                </div>
                <div className={styles.actionButtons}>
                  <button
                    type="button"
                    className={styles.advancedFilterButton}
                    onClick={() => setShowAdvancedFilters(true)}
                  >
                    Advanced filters
                    {advancedFilterCount > 0 && <span className={styles.filterCount}>{advancedFilterCount}</span>}
                  </button>
                  <button
                    type="button"
                    className={styles.visibleColumnsButton}
                    onClick={() => setShowColumnSettings(true)}
                  >
                    Visible columns
                  </button>
                </div>
              </div>

              <div className={styles.tableActionsRow}>
                <div className={styles.actionButtons}>
                  <ActionButton
                    onClick={clearFilters}
                    disabled={loading || !hasActiveFilters}
                    type="button"
                    className={styles.clearButton}
                  >
                    Clear
                  </ActionButton>

                  <ActionButton
                    onClick={refetch}
                    disabled={loading}
                    type="button"
                    className={styles.refreshButton}
                  >
                    Refresh
                  </ActionButton>
                  <ExcelExport<ISOMessage>
                    data={messages}
                    columns={allColumns}
                    visibleColumns={visibleColumns}
                    fileName="papss_iso_messages"
                    disabled={loading}
                    metadata={{
                      title: "PAPSS ISO Messages Export",
                      totalRecords: messages.length,
                      page: query.page + 1,
                      filters: {
                        ...(filters.status && { Status: filters.status }),
                        ...(filters.type && { Type: filters.type }),
                        ...(filters.transactionId && {
                          "Transaction ID": filters.transactionId,
                        }),
                        ...(filters.msgId && { "Message ID": filters.msgId }),
                        ...(filters.fromDate && {
                          "From Date": filters.fromDate,
                        }),
                        ...(filters.toDate && { "To Date": filters.toDate }),
                        ...(filters.debtorAccount && {
                          "Debtor Account": filters.debtorAccount,
                        }),
                        ...(filters.creditorAccount && {
                          "Creditor Account": filters.creditorAccount,
                        }),
                      },
                    }}
                    formatters={{
                      messageType: getISOMessageTypeText,
                      status: getTransactionStatusText,
                      date: (value) => new Date(value).toLocaleString(),
                      recordedAtUtc: (value) => new Date(value).toLocaleString(),
                      messageCreatedAtUtc: (value) =>
                        value ? new Date(value).toLocaleString() : "",
                    }}
                    cellStylers={{
                      status: (cell, message: ISOMessage) => {
                        if (message.status === TransactionStatus.Success) {
                          cell.font = {
                            color: { argb: "FF059669" },
                            bold: true,
                          };
                        } else if (
                          message.status === TransactionStatus.Failed
                        ) {
                          cell.font = {
                            color: { argb: "FFDC2626" },
                            bold: true,
                          };
                        } else if (
                          message.status === TransactionStatus.Pending
                        ) {
                          cell.font = {
                            color: { argb: "FFF59E0B" },
                            bold: true,
                          };
                        }
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {showColumnSettings && (
            <ColumnVisibilityModal
              columns={allColumns}
              visibleColumns={visibleColumns}
              onToggle={toggleColumnVisibility}
              onChange={(columnIds) => {
                setVisibleColumns(columnIds);
                localStorage.setItem(VISIBLE_COLUMNS_KEY, JSON.stringify(columnIds));
              }}
              defaultVisibleColumns={DEFAULT_VISIBLE_COLUMNS}
              onClose={() => setShowColumnSettings(false)}
            />
          )}

          <div className={styles.resultsPanel}>
            {loading && query.page === 0 ? (
              <div className={styles.loadingMessage}>Loading messages...</div>
            ) : (
              <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      {visibleColumns.map((columnId) => {
                        const column = allColumns.find(
                          (c) => c.id === columnId
                        );
                        return column ? (
                          <th key={columnId}>{column.label}</th>
                        ) : null;
                      })}
                      {showDetailsColumn && <th>Actions</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {messages.map((message, index) => {
                      const messageKey = String(message.id ?? message.listItemId ?? message.msgId ?? message.bizMsgIdr ?? `message-${index}`);
                      return <tr key={messageKey} className={styles.tableRow}>
                        {visibleColumns.map((columnId) => (
                          <td key={`${messageKey}-${columnId}`}>
                            {renderCellContent(message, columnId)}
                          </td>
                        ))}

                        {showDetailsColumn ? (
                          <td>
                            <button
                              className={styles.iconButton}
                              type="button"
                              onClick={() => handleShowDetails(message)}
                            >
                              <FiEye /> Details
                            </button>
                          </td>
                        ) : null}
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>

              <div className={styles.paginationContainer}>
                <button
                  onClick={() => setQuery({ page: query.page - 1 })}
                  disabled={query.page === 0 || loading}
                  className={styles.paginationButton}
                >
                  Previous
                </button>
                <span>Page {query.page + 1}</span>
                <button
                  onClick={() => setQuery({ page: query.page + 1 })}
                  disabled={messages.length < selectedPageSize || loading}
                  className={styles.paginationButton}
                >
                  Next
                </button>
              </div>
              </>
            )}
          </div>
          {loading && query.page > 0 && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner}></div>
            </div>
          )}

          {selectedXml && (
            <XmlViewerModal
              content={selectedXml.content}
              title={selectedXml.title}
              onClose={() => setSelectedXml(null)}
            />
          )}
          {alertModal && (
            <AlertModal
              title={alertModal.title}
              message={alertModal.message}
              error={alertModal.error}
              onConfirm={() => setAlertModal(null)}
              onClose={() => setAlertModal(null)}
            />
          )}
        </div>
      ) : (
        <IsoMessageDetails
          isoMessage={selectedMessage}
          onClose={handleCloseDetails}
          rail="PAPSS"
        />
      )}
    </RoleGuard>
  );
};

export default ISOMessagesList;

