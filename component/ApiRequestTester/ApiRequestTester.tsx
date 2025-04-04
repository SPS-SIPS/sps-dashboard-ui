import React, {useState, useCallback} from "react";

import styles from './ApiRequestTester.module.css';
import {APIError, APIResponse} from "../../types/types";
import {validateUrl} from "../../utils/validation";
import {makeApiRequest} from "../../utils/apiService";
import Input from "../../component/common/Input/Input";
import RequestFormWrapper from "../../component/RequestFormWrapper/RequestFormWrapper";
import {useAuthentication} from "../../auth/AuthProvider";

type ApiConfigState = {
    apiUrl: string;
    urlError: string;
};

const initialApiState: ApiConfigState = {
    apiUrl: "http://localhost:8080/api/v1/Gateway/Verify",
    urlError: "",
};
interface StatusProps {
    title: string;
    placeholder: string;
    selectedRequest: string;
}

const ApiRequestTester: React.FC<StatusProps> = ({ title, placeholder, selectedRequest }) => {
    const [apiConfig, setApiConfig] = useState<ApiConfigState>(initialApiState);
    const [response, setResponse] = useState<APIResponse | null>(null);
    const [error, setError] = useState<APIError | null>(null);
    const { authToken } = useAuthentication();
    const handleApiUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;
        setApiConfig(prev => ({
            ...prev,
            apiUrl: value,
            urlError: value ? "" : prev.urlError
        }));
    }, []);
    const handleApiResponse = useCallback((result: APIResponse) => {
        setResponse(result);
        setError(null);
    }, []);

    const handleApiError = useCallback((err: APIError) => {
        setError(err);
        setResponse(null);
    }, []);

    const handleSubmit = useCallback(async (formData: Record<string, string>) => {
        if (!validateUrl(apiConfig.apiUrl, {allowLocalhost: true})) {
            setApiConfig(prev => ({
                ...prev,
                urlError: "Please enter a valid API URL."
            }));
            return;
        }

        try {
            const result = await makeApiRequest({
                url: apiConfig.apiUrl,
                method: 'POST',
                data: formData,
                token: authToken!,
            });
            handleApiResponse(result);
        } catch (err) {
            handleApiError({
                message: err instanceof Error ? err.message : 'Unknown error occurred',
                details: JSON.stringify(err, null, 2)
            });
        }
    }, [apiConfig.apiUrl, handleApiResponse, handleApiError]);

    return (
        <div className={styles.container}>
            <div className={styles.titleContainer}>
                <h1 className={styles.mainTitle}>{title}</h1>
                <p className={styles.subTitle}>
                    Validate and test your API endpoints by sending properly formatted status requests
                </p>
            </div>

            <Input
                label="Enter API Endpoint URL"
                value={apiConfig.apiUrl}
                onChange={handleApiUrlChange}
                type="url"
                placeholder={placeholder}
                errorMessage={apiConfig.urlError}
                required
            />

            <RequestFormWrapper
                selectedRequest={selectedRequest}
                onSubmit={handleSubmit}
            />

            {response && (
                <section className={styles.responseSection}>
                    <div className={styles.responseMessage}>
                        <h3 className={styles.responseTitle}>API Response</h3>
                        <pre className={styles.responseText}>{JSON.stringify(response, null, 2)}</pre>
                    </div>
                </section>
            )}

            {error && (
                <section className={styles.errorSection}>
                    <div className={styles.errorMessage}>
                        <h3 className={styles.errorTitle}>Request Failed</h3>
                        <pre className={styles.errorText}>{error.details || error.message}</pre>
                    </div>
                </section>
            )}
        </div>
    );
};

export default ApiRequestTester;