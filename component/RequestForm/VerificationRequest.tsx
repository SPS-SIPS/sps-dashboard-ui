import useEndpoints, { EndpointsData } from "../../api/hooks/useEndpoints";
import React, { useEffect, useState } from "react";
import SpinLoading from "../Loading/SpinLoading/SpinLoading";
import Input from "../common/Input/Input";
import ActionButton from "../common/ActionButton/ActionButton";
import SelectInput from "../common/SelectInput/SelectInput";
import { verificationMethods } from "../../constants/gatewayFormOptions";
import styles from "./RequestForm.module.css";
import useParticipants from "../../api/hooks/useParticipants";

export interface FieldMapping {
  internalField: string;
  userField: string;
  type: string;
}
type Option = {
  value: string;
  label: string;
};

interface VerificationRequestProps {
  onSubmit: (
    data: Record<string, string>,
    endpoints: EndpointsData | null
  ) => void;
}

const VerificationRequest: React.FC<VerificationRequestProps> = ({
  onSubmit,
}) => {
  const { endpoints, loading, error } = useEndpoints();
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const { bicOptions } = useParticipants();

  const handleInputChange = (userField: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [userField]: value,
    }));
  };
  useEffect(() => {
    if (endpoints) {
      const selectedEndpoint = endpoints["VerificationRequest"];
      if (selectedEndpoint) {
        setFieldMappings(selectedEndpoint.fieldMappings);
      }
    }
  }, [endpoints]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (endpoints) {
      if (endpoints) {
        onSubmit(formValues, endpoints);
      }
    }
  };

  const formatUserField = (userField: string, internalField: string) => {
    if (internalField === "Code") {
      return userField; // Don't format if internalField is "Code"
    }
    return userField
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  function isFormValid() {
    return fieldMappings.every((mapping) => {
      if (mapping.internalField === "Code") {
        return true;
      }
      return formValues[mapping.userField]?.trim();
    });
  }

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
            <h2 className={styles.formTitle}>VerificationRequest</h2>
          </div>
          <form onSubmit={handleSubmit} className={styles.requestForm}>
            {fieldMappings.map((mapping, index) => (
              <div key={index}>
                {["Type", "ToBIC"].includes(mapping.internalField) ? (
                  <div key={mapping.userField} className={styles.mappingItem}>
                    <SelectInput
                      label={`${formatUserField(
                        mapping.userField,
                        mapping.internalField
                      )} (${mapping.type})`}
                      value={formValues[mapping.userField] || ""}
                      onChange={(e) =>
                        handleInputChange(mapping.userField, e.target.value)
                      }
                      options={
                        mapping.internalField === "Type"
                          ? verificationMethods
                          : bicOptions
                      }
                      required={true}
                      name={mapping.userField}
                      disabled={false}
                    />
                  </div>
                ) : (
                  <div key={mapping.userField} className={styles.mappingItem}>
                    <Input
                      label={`${formatUserField(
                        mapping.userField,
                        mapping.internalField
                      )} (${mapping.type})`}
                      value={formValues[mapping.userField] || ""}
                      onChange={(e) =>
                        handleInputChange(mapping.userField, e.target.value)
                      }
                      type={mapping.type}
                      placeholder={`Enter ${mapping.userField}`}
                      required={mapping.internalField !== "Code"}
                      autoComplete="on"
                    />
                  </div>
                )}
              </div>
            ))}

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
                Send Request
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
export default VerificationRequest;
