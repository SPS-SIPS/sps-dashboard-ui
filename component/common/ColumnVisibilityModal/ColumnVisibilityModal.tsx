import React from "react";
import { FiCheck, FiX } from "react-icons/fi";
import styles from "./ColumnVisibilityModal.module.css";

export interface ColumnVisibilityOption {
  id: string;
  label: string;
}

interface ColumnVisibilityModalProps {
  columns: ColumnVisibilityOption[];
  visibleColumns: string[];
  onToggle: (columnId: string) => void;
  onChange: (columnIds: string[]) => void;
  defaultVisibleColumns: string[];
  onClose: () => void;
  title?: string;
}

const ColumnVisibilityModal: React.FC<ColumnVisibilityModalProps> = ({
  columns,
  visibleColumns,
  onToggle,
  onChange,
  defaultVisibleColumns,
  onClose,
  title = "Visible Columns",
}) => {
  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="column-visibility-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 id="column-visibility-title">{title}</h3>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close column settings"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        <p className={styles.description}>
          Choose which columns should be shown in the table.
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.selectAllButton}
            onClick={() => onChange(columns.map((column) => column.id))}
          >
            Select all
          </button>
          <button
            type="button"
            className={styles.resetButton}
            onClick={() => onChange(defaultVisibleColumns)}
          >
            Reset defaults
          </button>
        </div>

        <div className={styles.options}>
          {columns.map((column) => {
            const isVisible = visibleColumns.includes(column.id);
            return (
              <div key={column.id} className={styles.option}>
                <span>{column.label}</span>
                <button
                  type="button"
                  aria-pressed={isVisible}
                  aria-label={`${isVisible ? "Hide" : "Show"} ${column.label}`}
                  onClick={() => onToggle(column.id)}
                  className={`${styles.toggleButton} ${
                    isVisible ? styles.active : ""
                  }`}
                >
                  {isVisible ? <FiCheck /> : <FiX />}
                </button>
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.doneButton} onClick={onClose}>
            Done
          </button>
        </div>
      </section>
    </div>
  );
};

export default ColumnVisibilityModal;
