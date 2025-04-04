import React, {useState} from 'react';
import styles from './RequestForm.module.css';
import Input from "../common/Input/Input";

interface FieldMapping {
    internalField: string;
    userField: string;
    type: string;
}

interface RequestFormProps {
    requestType?: string;
    fieldMappings?: FieldMapping[];
    onSubmit: (data: Record<string, string>) => void;
    buttonText: string;
}

const RequestForm: React.FC<RequestFormProps> = ({
                                                     requestType,
                                                     fieldMappings = [],
                                                     onSubmit,
                                                     buttonText,
                                                 }) => {
    const [formValues, setFormValues] = useState<Record<string, string>>({});

    const handleInputChange = (userField: string, value: string) => {
        setFormValues(prev => ({
            ...prev,
            [userField]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formValues);
    };

    if (!requestType || !fieldMappings.length) {
        return <div className={styles.noSelection}>Select a request type from the list</div>;
    }

    return (
        <div className={styles.formContainer}>
            <div className={styles.header}>
                <h2 className={styles.formTitle}>{requestType}</h2>
            </div>

            <form onSubmit={handleSubmit} className={styles.requestForm}>
                {fieldMappings.map((mapping) => (
                    <div key={mapping.userField} className={styles.mappingItem}>
                        <Input
                            key={mapping.userField}
                            label={`${mapping.userField} (${mapping.type})`}
                            value={formValues[mapping.userField] || ''}
                            onChange={(e) => handleInputChange(mapping.userField, e.target.value)}
                            type={getInputType(mapping.type)}
                            placeholder={`Enter ${mapping.userField}`}
                            required
                        />
                    </div>
                ))}

                <div className={styles.buttonGroup}>
                    <button
                        type="button"
                        className={styles.clearButton}
                        onClick={() => setFormValues({})}
                    >
                        Clear
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={!isFormValid()}
                    >
                        {buttonText}
                    </button>
                </div>
            </form>
        </div>
    );
//Generate Request
    function isFormValid() {
        return fieldMappings.every(mapping =>
            formValues[mapping.userField]?.trim()
        );
    }

    function getInputType(fieldType: string): string {
        switch (fieldType.toLowerCase()) {
            case 'datetime':
                return 'datetime-local';
            case 'bool':
                return 'checkbox';
            case 'double':
            case 'number':
                return 'number';
            default:
                return 'text';
        }
    }
};

export default RequestForm;