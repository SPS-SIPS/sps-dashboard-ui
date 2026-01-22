import React, { useState, useEffect } from "react";
import { FiSettings, FiX, FiCheck, FiEye } from "react-icons/fi";

import { useISOMessages } from "../api/hooks/useISOMessages";
import {
  getISOMessageTypeText,
  getTransactionStatusText,
  ISOMessage,
  ISOMessageType,
  TransactionStatus,
} from "../types/types";
import SelectInput from "../component/common/SelectInput/SelectInput";
import SearchInput from "../component/common/SearchInput/SearchInput";
import ActionButton from "../component/common/ActionButton/ActionButton";

import styles from "../styles/ISOMessagesList.module.css";
import RoleGuard from "../auth/RoleGuard";
import XmlViewerModal from "../component/XmlViewerModal/XmlViewerModal";
import AlertModal from "../component/common/AlertModal/AlertModal";
import { useAuthentication } from "../auth/AuthProvider";
import IsoMessageDetails from "../component/IsoMessageDetails/IsoMessageDetails/IsoMessageDetails";
import ExcelExport from "./excel-export";

const allColumns = [
  { id: "id", label: "ID" },
  { id: "msgId", label: "Message ID" },
  { id: "messageType", label: "Type" },
  { id: "status", label: "Status" },
  { id: "date", label: "Date" },
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
  type: "",
  endToEndId: "",
  fromDate: "",
  toDate: "",
  transactionId: "",
};

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 / page" },
  { value: "25", label: "25 / page" },
  { value: "50", label: "50 / page" },
  { value: "100", label: "100 / page" },
];

const VISIBLE_COLUMNS_KEY = "iso_messages_visible_columns";
const PAGE_SIZE_KEY = "iso_messages_page_size"; // New localStorage key for page size

const ISOMessagesList = () => {
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
    useISOMessages();

  const [alertModal, setAlertModal] = useState<{
    title: string;
    message: string;
    error: boolean;
  } | null>(null);

  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [selectedXml, setSelectedXml] = useState<{
    content: string;
    title: string;
  } | null>(null);

  const DEFAULT_VISIBLE_COLUMNS = [
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
    setQuery({
      ...query,
      page: 0,
      pageSize: selectedPageSize,
    });
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

  const clearFilters = () => {
    setFilters({ ...EMPTY_FILTERS });
    setQuery({
      page: 0,
      status: undefined,
      type: undefined,
      RelatedToISOMessageId: undefined,
      msgId: undefined,
      bizMsgIdr: undefined,
      endToEndId: undefined,
      transactionId: undefined,
      msgDefIdr: undefined,
      fromDate: undefined,
      toDate: undefined,
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
      RelatedToISOMessageId: newFilters.RelatedToISOMessageId
        ? Number(newFilters.RelatedToISOMessageId)
        : undefined,
      transactionId: newFilters.transactionId || undefined,
      page: 0,
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
            <h2 className={styles.title}>ISO Messages</h2>
            <div className={styles.headerButtons}>
              <button
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className={styles.settingsButton}
              >
                <FiSettings />
              </button>
            </div>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.searchContainer}>
            <div className={styles.searchInputRow}>
              <SearchInput
                value={filters.transactionId}
                onChange={(e) =>
                  handleFilterChange("transactionId", e.target.value)
                }
                placeholder="Transaction ID"
              />
              <SearchInput
                value={filters.msgId}
                onChange={(e) => handleFilterChange("msgId", e.target.value)}
                placeholder="Message ID"
              />
              <SearchInput
                value={filters.bizMsgIdr}
                onChange={(e) =>
                  handleFilterChange("bizMsgIdr", e.target.value)
                }
                placeholder="Business Msg ID"
              />
            </div>

            <div className={styles.searchInputRow}>
              <SearchInput
                value={filters.RelatedToISOMessageId}
                onChange={(e) =>
                  handleFilterChange("RelatedToISOMessageId", e.target.value)
                }
                placeholder="Related ISO Message ID"
              />
              <SearchInput
                value={filters.msgDefIdr}
                onChange={(e) =>
                  handleFilterChange("msgDefIdr", e.target.value)
                }
                placeholder="Msg Definition ID"
              />
              <SearchInput
                value={filters.endToEndId}
                onChange={(e) =>
                  handleFilterChange("endToEndId", e.target.value)
                }
                placeholder="End To End ID"
              />
            </div>

            <div className={styles.filterControlsRow}>
              <div className={styles.selectGroup}>
                <SelectInput
                  label=""
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  options={[
                    { value: "", label: "All Statuses" },
                    ...Object.entries(TransactionStatus)
                      .filter(([key]) => isNaN(Number(key)))
                      .map(([key, value]) => ({
                        value: String(value),
                        label: key,
                      })),
                  ]}
                  placeholder="-- Select a Status --"
                />
                <SelectInput
                  label=""
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  options={[
                    { value: "", label: "All Types" },
                    ...Object.entries(ISOMessageType)
                      .filter(([key]) => isNaN(Number(key)))
                      .map(([key, value]) => ({
                        value: String(value),
                        label: key,
                      })),
                  ]}
                  placeholder="-- Select a Type --"
                />
              </div>

              <div className={styles.dateGroup}>
                <div className={styles.dateInput}>
                  <label>From:</label>
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) =>
                      handleFilterChange("fromDate", e.target.value)
                    }
                  />
                </div>
                <div className={styles.dateInput}>
                  <label>To:</label>
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) =>
                      handleFilterChange("toDate", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className={styles.tableControls}>
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
                  <ActionButton
                    onClick={clearFilters}
                    disabled={loading}
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
                    fileName="iso_messages"
                    disabled={loading}
                    metadata={{
                      title: "ISO Messages Export",
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
                      },
                    }}
                    formatters={{
                      messageType: getISOMessageTypeText,
                      status: getTransactionStatusText,
                      date: (value) => new Date(value).toLocaleString(),
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
            <div className={styles.columnSettings}>
              <h3>Visible Columns</h3>
              <div className={styles.columnOptions}>
                {allColumns.map((column) => (
                  <label key={column.id} className={styles.columnOption}>
                    <span>{column.label}</span>
                    <button
                      onClick={() => toggleColumnVisibility(column.id)}
                      className={`${styles.toggleButton} ${
                        visibleColumns.includes(column.id) ? styles.active : ""
                      }`}
                    >
                      {visibleColumns.includes(column.id) ? (
                        <FiCheck />
                      ) : (
                        <FiX />
                      )}
                    </button>
                  </label>
                ))}
              </div>
            </div>
          )}

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
                    {messages.map((message) => (
                      <tr key={message.id} className={styles.tableRow}>
                        {visibleColumns.map((columnId) => (
                          <td key={`${message.id}-${columnId}`}>
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
                      </tr>
                    ))}
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
        />
      )}
    </RoleGuard>
  );
};

export default ISOMessagesList;
