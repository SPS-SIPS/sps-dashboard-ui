import { useState, useEffect } from 'react';
import useAxiosPrivate from "./useAxiosPrivate";
import {extractErrorMessage} from "../../utils/extractErrorMessage";

export type FieldMapping = {
    internalField: string;
    userField: string;
    type: string;
};

type Endpoint = {
    fieldMappings: FieldMapping[];
};

export type EndpointsData = {
    [key: string]: Endpoint;
};

const useEndpoints = () => {
    const [endpoints, setEndpoints] = useState<EndpointsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchEndpoints = async () => {
            try {
                const response = await axiosPrivate.get<EndpointsData>('/api/v1/Adapter');
                setEndpoints(response.data);
                setLoading(false);
            } catch (err: unknown) {
                setError(extractErrorMessage(err));
                setLoading(false);
            }
        };

        void fetchEndpoints();
    }, []);

    return { endpoints, loading, error };
};

export default useEndpoints;