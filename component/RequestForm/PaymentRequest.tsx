import useEndpoints from "../../api/hooks/useEndpoints";
import React, { useEffect, useState } from "react";
import SpinLoading from "../Loading/SpinLoading/SpinLoading";
import Input from "../common/Input/Input";
import ActionButton from "../common/ActionButton/ActionButton";
import SelectInput from "../common/SelectInput/SelectInput";

import styles from "../RequestForm/RequestForm.module.css";
import {
  paymentMethods,
  verificationMethods,
} from "../../constants/gatewayFormOptions";

export interface FieldMapping {
  internalField: string;
  userField: string;
  type: string;
}

interface PaymentRequestProps {
  onSubmit: (data: Record<string, string>) => void;
  prefilledValues?: Record<string, string> | null;
}

const PaymentRequest: React.FC<PaymentRequestProps> = ({
  onSubmit,
  prefilledValues = null,
}) => {
  const { endpoints, loading, error } = useEndpoints();
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [disabledFields, setDisabledFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (endpoints) {
      const selectedEndpoint = endpoints["PaymentRequest"];
      if (selectedEndpoint) {
        const mappings = selectedEndpoint.fieldMappings;
        setFieldMappings(mappings);
        const initialValues: Record<string, string> = {};
        const disabledSet = new Set<string>();
        mappings.forEach(({ internalField, userField }) => {
          if (prefilledValues && internalField in prefilledValues) {
            initialValues[userField] = prefilledValues[internalField];
            if (
              internalField !== "LocalInstrument" &&
              internalField !== "CategoryPurpose" &&
              internalField !== "ToBIC" &&
              internalField !== "CreditorIssuer"
            ) {
              disabledSet.add(userField);
            }
          }
        });

        setFormValues(initialValues);
        setDisabledFields(disabledSet);
      }
    }
  }, [endpoints, prefilledValues]);

  const generateLocalId = () => {
    return `${Math.floor(Math.random() * 1000)}`;
  };

  const handleInputChange = (userField: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [userField]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (endpoints) {
      onSubmit(formValues);
    }
  };

  const formatUserField = (userField: string) => {
    return userField
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const isFormValid = () => {
    return fieldMappings.every((mapping) => {
      return formValues[mapping.userField]?.trim();
    });
  };

  return (
    <div className={styles.formContainer}>
      {loading ? (
        <div className={styles.loading}>
          <SpinLoading />
        </div>
      ) : error ? (
        <div>Error: {error || "An unknown error occurred."}</div>
      ) : fieldMappings.length > 0 ? (
        <>
          <div className={styles.header}>
            <h2 className={styles.formTitle}>PaymentRequest</h2>
          </div>
          <form onSubmit={handleSubmit} className={styles.requestForm}>
            {fieldMappings.map(({ internalField, userField, type }, index) => {
              console.log("Rendering field:", { internalField });
              const isAccountType =
                internalField === "CreditorAccountType" ||
                internalField === "DebtorAccountType";

              const isPaymentType = internalField === "LocalInstrument";
              const isSelectField = isAccountType || isPaymentType;
              const selectOptions = isAccountType
                ? verificationMethods
                : paymentMethods;
              const isDisabled =
                isSelectField === isAccountType
                  ? disabledFields.has(userField)
                  : false;

              return (
                <div key={index} className={styles.mappingItem}>
                  {isSelectField ? (
                    <SelectInput
                      label={`${formatUserField(userField)} (${type})`}
                      value={formValues[userField] || ""}
                      onChange={(e) =>
                        handleInputChange(userField, e.target.value)
                      }
                      options={selectOptions}
                      required
                      name={userField}
                      disabled={isDisabled}
                    />
                  ) : (
                    <>
                      <Input
                        label={`${userField} (${type})`}
                        value={formValues[userField] || ""}
                        onChange={(e) =>
                          handleInputChange(userField, e.target.value)
                        }
                        type={type === "double" ? "number" : type}
                        placeholder={`Enter ${userField}`}
                        required
                        disabled={isDisabled}
                      />
                      {internalField === "EndToEndId" && (
                        <button
                          type="button"
                          onClick={() => {
                            const generatedId = generateLocalId();
                            handleInputChange(userField, generatedId);
                          }}
                          className="p-1 mt-2  text-green-300 underline hover:cursor-pointer hover:underline-offset-2 "
                        >
                          Generate Random Local ID
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
            <div className={styles.buttonGroup}>
              <ActionButton
                type="button"
                className={styles.clearButton}
                onClick={() => setFormValues({})}
              >
                Clear
              </ActionButton>
              <ActionButton
                type="submit"
                className={styles.submitButton}
                disabled={!isFormValid()}
              >
                Send Payment
              </ActionButton>
            </div>
          </form>
        </>
      ) : (
        <div>No field mappings available.</div>
      )}
    </div>
  );
};

export default PaymentRequest;
