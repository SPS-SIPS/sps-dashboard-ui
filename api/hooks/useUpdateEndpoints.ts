import { useState } from 'react';
import useAxiosPrivate from "./useAxiosPrivate";
import {extractErrorMessage} from "../../utils/extractErrorMessage";

interface FieldMapping {
    InternalField: string;
    UserField: string;
    Type?: string;
}

interface Endpoint {
    FieldMappings: FieldMapping[];
}

interface EndpointsConfig {
    Endpoints: {
        [key: string]: Endpoint;
    };
}

const useUpdateEndpoints = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();

    const updateEndpoints = async (updatedConfig: EndpointsConfig) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await axiosPrivate.put<string>('/api/v1/adapter', updatedConfig);
            setSuccessMessage(response.data);
            setLoading(false);
            return response.data;
        } catch (err: unknown) {
            setError(extractErrorMessage(err, "Something went wrong"));
            setLoading(false);
        }
    };

    return { updateEndpoints, loading, error, successMessage };
};

export default useUpdateEndpoints;