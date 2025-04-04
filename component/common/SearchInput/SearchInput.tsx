import React from 'react';
import styles from './SearchInput.module.css';
import Image from 'next/image';

interface SearchInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
                                                     value,
                                                     onChange,
                                                     placeholder = "Search...",
                                                     required = false,
                                                 }) => {
    return (
        <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
                <input
                    className={styles.inputField}
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                />
                <div className={styles.searchIcon}>
                    <Image
                        src="/icons/search.svg"
                        alt="Search Icon"
                        width={20}
                        height={20} 
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchInput;
