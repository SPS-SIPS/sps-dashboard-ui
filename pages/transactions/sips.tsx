import React, { useState, useEffect } from "react";
import { FiFilter, FiX } from "react-icons/fi";
import { useTransactions } from "../../api/hooks/useTransactions";
import {
  Transaction,
  getTransactionStatusType,
  getTransactionStatusText,
  TransactionType,
  TransactionStatus,
} from "../../types/types";
import styles from "../../styles/TransactionsList.module.css";
import SearchInput from "../../component/common/SearchInput/SearchInput";
import SelectInput from "../../component/common/SelectInput/SelectInput";
import ActionButton from "../../component/common/ActionButton/ActionButton";
import RoleGuard from "../../auth/RoleGuard";
import { TiInfo } from "react-icons/ti";
import TransactionDetailsModal from "../../component/TransactionDetailsModal/TransactionDetailsModal";
import ExcelExport from "../../component/ExcelExport/excel-export";
import ColumnVisibilityModal from "../../component/common/ColumnVisibilityModal/ColumnVisibilityModal";

const allColumns = [
  { id: "listItemId", label: "List Item ID" },
  { id: "operationType", label: "Operation Type" },
  { id: "direction", label: "Direction" },
  { id: "recordedAtUtc", label: "Recorded At" },
  { id: "status", label: "Status" },
  { id: "txId", label: "Transaction ID" },
  { id: "type", label: "Transaction type" },
  { id: "isoMessageId", label: "ISO Message ID" },
  { id: "fromBIC", label: "From BIC" },
  { id: "localInstrument", label: "Local Instrument" },
  { id: "categoryPurpose", label: "Category Purpose" },
  { id: "endToEndId", label: "End To End ID" },
  { id: "amount", label: "Amount" },
  { id: "currency", label: "Currency" },
  { id: "debtorName", label: "Debtor Name" },
  { id: "debtorAccount", label: "Debtor Account" },
  { id: "debtorAddress", label: "Debtor Address" },
  { id: "debtorAccountType", label: "Debtor Account Type" },
  { id: "debtorAgentBIC", label: "Debtor Agent BIC" },
  { id: "debtorIssuer", label: "Debtor Issuer" },
  { id: "creditorName", label: "Creditor Name" },
  { id: "creditorAccount", label: "Creditor Account" },
  { id: "creditorAddress", label: "Creditor Address" },
  { id: "creditorAccountType", label: "Creditor Account Type" },
  { id: "creditorAgentBIC", label: "Creditor Agent BIC" },
  { id: "creditorIssuer", label: "Creditor Issuer" },
  { id: "remittanceInformation", label: "Remittance Information" },
  { id: "actions", label: "Actions" },
];

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 / page" },
  { value: "25", label: "25 / page" },
  { value: "50", label: "50 / page" },
  { value: "100", label: "100 / page" },
];

const EMPTY_FILTERS = {
  RelatedToISOMessageId: "",
  ISOMessageId: "",
  TransactionId: "",
  EndToEndId: "",
  LocalInstrument: "",
  CategoryPurpose: "",
  DebtorAccount: "",
  CreditorAccount: "",
  Status: "",
  Direction: "",
  FromDate: "",
  ToDate: "",
};

const VISIBLE_COLUMNS_KEY = "transactions_visible_columns";
const PAGE_SIZE_KEY = "transactions_page_size";
const TRANSACTION_RAIL = "SIPS" as const;
const DEFAULT_VISIBLE_COLUMNS = ["txId", "type", "status", "amount"];

const TransactionsList = () => {
  const initialPageSize =
    typeof window !== "undefined"
      ? Number(localStorage.getItem(PAGE_SIZE_KEY)) || 10
      : 10;
  const { transactions, loading, error, query, setQuery, refetch } =
    useTransactions({ page: 0, pageSize: initialPageSize, Rail: TRANSACTION_RAIL });

  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const stored = localStorage.getItem(VISIBLE_COLUMNS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_VISIBLE_COLUMNS;
  });

  const [selectedPageSize, setSelectedPageSize] = useState<number>(() => {
    const stored = localStorage.getItem(PAGE_SIZE_KEY);
    return stored ? parseInt(stored) : 10;
  });

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    RelatedToISOMessageId: "",
    ISOMessageId: "",
    TransactionId: "",
    EndToEndId: "",
    LocalInstrument: "",
    CategoryPurpose: "",
    DebtorAccount: "",
    CreditorAccount: "",
    Status: "",
    Direction: "",
    FromDate: "",
    ToDate: "",
  });

  const advancedFilterCount = [
    filters.ISOMessageId,
    filters.LocalInstrument,
    filters.RelatedToISOMessageId,
    filters.CategoryPurpose,
    filters.DebtorAccount,
    filters.CreditorAccount,
    filters.Direction,
  ].filter(Boolean).length;
  const hasActiveFilters = Object.values(filters).some(Boolean);

  useEffect(() => {
    if (query.page !== 0 || query.pageSize !== selectedPageSize) {
      setQuery({
        page: 0,
        pageSize: selectedPageSize,
        Rail: TRANSACTION_RAIL,
      });
    }
  }, [selectedPageSize]);

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);

    setQuery({
      ...newFilters,
      page: 0,
      Rail: TRANSACTION_RAIL,
      RelatedToISOMessageId: newFilters.RelatedToISOMessageId
        ? Number(newFilters.RelatedToISOMessageId)
        : undefined,
      ISOMessageId: newFilters.ISOMessageId
        ? Number(newFilters.ISOMessageId)
        : undefined,
      Status: newFilters.Status
        ? (newFilters.Status as unknown as TransactionStatus)
        : undefined,
      Direction: newFilters.Direction
        ? (newFilters.Direction as "INBOUND" | "OUTBOUND")
        : undefined,
    });
  };

  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value);
    setSelectedPageSize(newPageSize);

    localStorage.setItem(PAGE_SIZE_KEY, String(newPageSize));
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);

    setQuery({
      page: 0,
      Rail: TRANSACTION_RAIL,
      ISOMessageId: undefined,
      RelatedToISOMessageId: undefined,
      TransactionId: undefined,
      EndToEndId: undefined,
      LocalInstrument: undefined,
      CategoryPurpose: undefined,
      DebtorAccount: undefined,
      CreditorAccount: undefined,
      Status: undefined,
      Direction: undefined,
      FromDate: undefined,
      ToDate: undefined,
    });
  };

  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns((prev) => {
      const updated = prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId];

      localStorage.setItem(VISIBLE_COLUMNS_KEY, JSON.stringify(updated));

      return updated;
    });
  };

  const updateVisibleColumns = (columnIds: string[]) => {
    setVisibleColumns(columnIds);
    localStorage.setItem(VISIBLE_COLUMNS_KEY, JSON.stringify(columnIds));
  };

  const getStatusClass = (status: TransactionType) => {
    switch (status) {
      case TransactionType.Deposit:
        return styles.transactionDeposit;
      case TransactionType.Withdrawal:
        return styles.Withdrawal;
      case TransactionType.ReadyForReturn:
        return styles.ReadyForReturn;
      case TransactionType.ReturnWithdrawal:
        return styles.transactionReturnWithdrawal;
      default:
        return "";
    }
  };

  const renderCellContent = (transaction: Transaction, columnId: string) => {
    switch (columnId) {
      case "amount":
        return transaction.amount
          ? `${transaction.amount} ${transaction.currency || ""}`
          : "-";
      case "type":
        return (
          <span
            className={`${styles.statusBadge} ${getStatusClass(
              transaction.type
            )}`}
          >
            {getTransactionStatusType(transaction.type)}
          </span>
        );
      case "recordedAtUtc":
        return transaction.recordedAtUtc
          ? new Date(transaction.recordedAtUtc).toLocaleString()
          : "-";
      case "status":
        return getTransactionStatusText(transaction.status);
      case "actions":
        return (
          <div className={styles.actionsCell}>
            <button
              className="p-2 bg-gray-300 text-gray-700-700 rounded-md flex items-center gap-1 hover:bg-gray-200 hover:cursor-pointer transition"
              title="Details"
              onClick={() => setSelectedTransaction(transaction)}
            >
              <TiInfo /> Details
            </button>
          </div>
        );

      default:
        return transaction[columnId as keyof Transaction] || "-";
    }
  };

  return (
    <RoleGuard allowedRoles={["transactions"]}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>SIPS Transactions</h2>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.searchContainer}>
          <div className={styles.searchInputRow}>
            <SearchInput
              label="Transaction ID"
              placeholder="Search by Transaction ID"
              value={filters.TransactionId}
              onChange={(e) =>
                handleFilterChange("TransactionId", e.target.value)
              }
            />
            <SearchInput
              label="End-to-End ID"
              placeholder="Search by End-to-End ID"
              value={filters.EndToEndId}
              onChange={(e) => handleFilterChange("EndToEndId", e.target.value)}
            />
            <SelectInput
              label="Status"
              value={filters.Status}
              onChange={(e) => handleFilterChange("Status", e.target.value)}
              options={[
                ...Object.entries(TransactionStatus)
                  .filter(([key]) => isNaN(Number(key)))
                  .map(([key, value]) => ({
                    value: String(value),
                    label: key,
                  })),
              ]}
              placeholder="-- Select a Status --"
            />
          </div>
          {showAdvancedFilters && (
            <div
              className={styles.advancedFiltersBackdrop}
              role="presentation"
              onClick={() => setShowAdvancedFilters(false)}
            >
              <section
                className={styles.advancedFiltersModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="advanced-filters-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className={styles.advancedFiltersHeader}>
                  <h3 id="advanced-filters-title">Advanced filters</h3>
                  <button
                    type="button"
                    className={styles.advancedFiltersClose}
                    aria-label="Close advanced filters"
                    onClick={() => setShowAdvancedFilters(false)}
                  >
                    <FiX />
                  </button>
                </div>
                <div className={styles.advancedFiltersGrid}>
                  <SearchInput
                    label="ISO Message ID"
                    placeholder="Search by ISO Message ID"
                    value={filters.ISOMessageId}
                    onChange={(e) => handleFilterChange("ISOMessageId", e.target.value)}
                  />
                  <SearchInput
                    label="Related ISO Message ID"
                    placeholder="Search by Related ISO Message ID"
                    value={filters.RelatedToISOMessageId}
                    onChange={(e) => handleFilterChange("RelatedToISOMessageId", e.target.value)}
                  />
                  <SearchInput
                    label="Local Instrument"
                    placeholder="Search by Local Instrument"
                    value={filters.LocalInstrument}
                    onChange={(e) => handleFilterChange("LocalInstrument", e.target.value)}
                  />
                  <SearchInput
                    label="Category Purpose"
                    placeholder="Search by Category Purpose"
                    value={filters.CategoryPurpose}
                    onChange={(e) => handleFilterChange("CategoryPurpose", e.target.value)}
                  />
                  <SearchInput
                    label="Debtor Account"
                    placeholder="Search by Debtor Account"
                    value={filters.DebtorAccount}
                    onChange={(e) => handleFilterChange("DebtorAccount", e.target.value)}
                  />
                  <SearchInput
                    label="Creditor Account"
                    placeholder="Search by Creditor Account"
                    value={filters.CreditorAccount}
                    onChange={(e) => handleFilterChange("CreditorAccount", e.target.value)}
                  />
                  <SelectInput
                    label="Direction"
                    value={filters.Direction}
                    onChange={(e) => handleFilterChange("Direction", e.target.value)}
                    options={[
                      { value: "INBOUND", label: "Inbound" },
                      { value: "OUTBOUND", label: "Outbound" },
                    ]}
                    placeholder="-- Select a Direction --"
                  />
                </div>
                <div className={styles.advancedFiltersFooter}>
                  <ActionButton
                    onClick={clearFilters}
                    disabled={loading || !hasActiveFilters}
                    type="button"
                    className={styles.clearButton}
                  >
                    Clear filters
                  </ActionButton>
                  <ActionButton
                    onClick={() => setShowAdvancedFilters(false)}
                    type="button"
                    className={styles.refreshButton}
                  >
                    Apply
                  </ActionButton>
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
                  value={query.FromDate || ""}
                  onChange={(e) =>
                    handleFilterChange("FromDate", e.target.value)
                  }
                  className={styles.datePicker}
                />
              </div>
              <div className={styles.dateInput}>
                <label>To date</label>
                <input
                  type="date"
                  value={query.ToDate || ""}
                  onChange={(e) => handleFilterChange("ToDate", e.target.value)}
                  className={styles.datePicker}
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
                  <FiFilter />
                  Advanced filters
                  {advancedFilterCount > 0 && (
                    <span className={styles.filterCount}>{advancedFilterCount}</span>
                  )}
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
                <ExcelExport<Transaction>
                  data={transactions}
                  columns={allColumns}
                  visibleColumns={visibleColumns}
                  fileName="sips_transactions"
                  disabled={loading}
                  metadata={{
                    title: "SIPS Transactions Export",
                    totalRecords: transactions.length,
                    page: query.page + 1,
                    filters: {
                      ...(query.TransactionId && {
                        "Transaction ID": query.TransactionId,
                      }),
                      ...(query.Status && { Status: query.Status }),
                      ...(query.FromDate && { "From Date": query.FromDate }),
                      ...(query.ToDate && { "To Date": query.ToDate }),
                    },
                  }}
                  formatters={{
                    type: getTransactionStatusType,
                    amount: (value) => {
                      if (
                        typeof value === "object" &&
                        "amount" in value &&
                        "currency" in value
                      ) {
                        return `${value.amount} ${value.currency || ""}`;
                      }
                      return value?.toString() || "-";
                    },
                  }}
                />
              </div>
          </div>
        </div>

        {showColumnSettings && (
          <ColumnVisibilityModal
            columns={allColumns.filter((column) => column.id !== "actions")}
            visibleColumns={visibleColumns}
            onToggle={toggleColumnVisibility}
            onChange={updateVisibleColumns}
            defaultVisibleColumns={DEFAULT_VISIBLE_COLUMNS}
            onClose={() => setShowColumnSettings(false)}
          />
        )}

        <div className={styles.resultsPanel}>
          {loading && query.page === 0 ? (
            <div className={styles.loadingMessage}>Loading transactions...</div>
          ) : (
            <>
              <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    {visibleColumns.map((columnId) => {
                      const column = allColumns.find((c) => c.id === columnId);
                      return column ? (
                        <th key={columnId}>{column.label}</th>
                      ) : null;
                    })}

                    <th className={styles.actionsHeader}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className={styles.tableRow}>
                      {visibleColumns.map((columnId) => (
                        <td key={`${transaction.id}-${columnId}`}>
                          {renderCellContent(transaction, columnId)}
                        </td>
                      ))}

                      <td className={styles.actionsCellSticky}>
                        {renderCellContent(transaction, "actions")}
                      </td>
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
                  disabled={transactions.length < selectedPageSize || loading}
                  className={styles.paginationButton}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />

        {loading && query.page > 0 && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

export default TransactionsList;
