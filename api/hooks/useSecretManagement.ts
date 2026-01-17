import useAxiosPrivate from './useAxiosPrivate';

export type SecretRequest = {
    key: string;
    value: string;
};

export type EncryptDecryptResponse = {
    key: string;
    encrypted?: string;
    decrypted?: string;
    message?: string;
    warning?: string;
};

export type EncryptAllResponse = {
    success: boolean;
    message: string;
    encryptedKeys?: string[];
    backupPath?: string;
    warning?: string;
};

export type DecryptAllResponse = {
    success: boolean;
    message: string;
    decryptedKeys?: string[];
    backupPath?: string;
    warning?: string;
};

export type GetSecretResponse = {
    key: string;
    value: string;
    isEncrypted: boolean;
    warning?: string;
};

const BASE_URL = '/api/admin/secrets';

const useSecretManagement = () => {
    const axiosPrivate = useAxiosPrivate();

    const encryptValue = async (request: SecretRequest): Promise<EncryptDecryptResponse> => {
        const response = await axiosPrivate.post<EncryptDecryptResponse>(`${BASE_URL}/encrypt`, request);
        return response.data;
    };

    const decryptValue = async (request: SecretRequest): Promise<EncryptDecryptResponse> => {
        const response = await axiosPrivate.post<EncryptDecryptResponse>(`${BASE_URL}/decrypt`, request);
        return response.data;
    };

    const encryptAll = async (): Promise<EncryptAllResponse> => {
        const response = await axiosPrivate.post<EncryptAllResponse>(`${BASE_URL}/encrypt-all`);
        return response.data;
    };

    const decryptAll = async (): Promise<DecryptAllResponse> => {
        const response = await axiosPrivate.post<DecryptAllResponse>(`${BASE_URL}/decrypt-all`);
        return response.data;
    };

    const getSecret = async (key: string): Promise<GetSecretResponse> => {
        const encodedKey = encodeURIComponent(key);
        const response = await axiosPrivate.get<GetSecretResponse>(`${BASE_URL}/${encodedKey}`);
        return response.data;
    };

    return {
        encryptValue,
        decryptValue,
        encryptAll,
        decryptAll,
        getSecret,
    };
};

export default useSecretManagement;
