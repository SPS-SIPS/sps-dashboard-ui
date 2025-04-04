import React, { useRef } from "react";
import Multiselect from "multiselect-react-dropdown";
import styles from "./MultiSelectDropdown.module.css";

interface MultiSelectDropdownProps {
    label: string;
    options: { name: string; id: number }[];
    selectedValues?: { name: string; id: number }[];
    onChange: (selectedList: { name: string; id: number }[]) => void;
    required?: boolean;
    errorMessage?: string;
    placeholder?: string;
    showCheckbox?: boolean;
    selectionLimit?: number;
    singleSelect?: boolean;
    disabled?: boolean;
    closeOnSelect?: boolean;
    hidePlaceholder?: boolean;
    className?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
                                                                     label,
                                                                     options,
                                                                     selectedValues = [],
                                                                     onChange,
                                                                     required = false,
                                                                     errorMessage ,
                                                                     placeholder = "Select options",
                                                                     showCheckbox = false,
                                                                     selectionLimit = -1,
                                                                     singleSelect = false,
                                                                     disabled = false,
                                                                     closeOnSelect = true,
                                                                     hidePlaceholder = false,
                                                                     className = "",
                                                                 }) => {
    const multiSelectRef = useRef<Multiselect>(null);

    const handleSelect = (selectedList: { name: string; id: number }[]) => {
        onChange(selectedList);
    };

    const handleRemove = (selectedList: { name: string; id: number }[]) => {
        onChange(selectedList);
    };

    return (
        <div className={`${styles.container} ${className} ${errorMessage ? styles.error : ""}`}>
            <label className={styles.label}>
                {label}
                {required && <span className={styles.required}>*</span>}
            </label>

            <div className={styles.wrapper}>
                <Multiselect
                    ref={multiSelectRef}
                    options={options}
                    selectedValues={selectedValues}
                    onSelect={handleSelect}
                    onRemove={handleRemove}
                    displayValue="name"
                    showCheckbox={showCheckbox}
                    selectionLimit={selectionLimit}
                    singleSelect={singleSelect}
                    placeholder={placeholder}
                    disable={disabled}
                    showArrow={true}
                    closeOnSelect={closeOnSelect}
                    hidePlaceholder={hidePlaceholder}
                    avoidHighlightFirstOption={true}
                    isObject={true}
                    className={styles.multiselect}
                />
            </div>

            {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        </div>
    );
};

export default MultiSelectDropdown;