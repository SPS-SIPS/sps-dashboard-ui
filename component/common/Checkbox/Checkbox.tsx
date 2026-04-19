import React from 'react';
import styles from "./Checkbox.module.css";

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    name?: string;
    id?: string;
    disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
                                               label,
                                               checked,
                                               onChange,
                                               required = false,
                                               name,
                                               id,
                                               disabled = false,
                                           }) => {
    return (
        <div className={styles.checkboxContainer}>
            <label className={styles.checkboxLabel}>
                <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    required={required}
                    name={name}
                    id={id}
                    disabled={disabled}
                />
                {label}
            </label>
        </div>
    );
};

export default Checkbox;
