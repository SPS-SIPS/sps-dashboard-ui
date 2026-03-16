import useAxiosPrivate from "./useAxiosPrivate";
import { ApiResponse } from "../../types/participants";

const BASE_URL = "/api/v1/Gateway";

const useGatewayApi = () => {

    const axiosPrivate = useAxiosPrivate();

    const verifyPayee = async (payload: any): Promise<ApiResponse<any>> => {

        const response = await axiosPrivate.post<ApiResponse<any>>(
            `${BASE_URL}/Verify`,
            payload
        );

        return response.data;
    };

    const makePayment = async (payload: any): Promise<ApiResponse<any>> => {

        const response = await axiosPrivate.post<ApiResponse<any>>(
            `${BASE_URL}/Payment`,
            payload
        );

        return response.data;
    };


    return {
        verifyPayee,
        makePayment
    };
};

export default useGatewayApi;