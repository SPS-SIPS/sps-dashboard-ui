import { useState } from "react";
import useAxiosPrivate from "./useAxiosPrivate";

export type GatewayResponse<T = any> = {
    data: T;
    isSuccess: boolean;
    message: string;
    statusCode: number;
};

export type JsonObject = Record<string, any>;

const useGatewayAPI = () => {
    const axiosPrivate = useAxiosPrivate();
    const [loading, setLoading] = useState(false);

    const postRequest = async <T = any>(endpoint: string, body: JsonObject): Promise<GatewayResponse<T>> => {
        setLoading(true);

        try {
            const response = await axiosPrivate.post<GatewayResponse<T>>(`/api/v1/Gateway/${endpoint}`, body);
            return response.data;
        } catch (err: any) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        getStatus: (body: JsonObject) => postRequest("Status", body),
        returnApi: (body: JsonObject) => postRequest("Return", body),
        retryReturn: (id: string) => postRequest(`Retry/${id}`, {}),
    };
};

export default useGatewayAPI;
