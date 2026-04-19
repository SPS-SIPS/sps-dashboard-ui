import useAxiosPrivate from "./useAxiosPrivate";
import { ApiResponse } from "../../types/participants";
import { SomQRMerchantData, SomQRPersonData } from "../../types/somqr";

const BASE_URL = "/api/v1/SomQR";

const useSomQRParser = () => {
    const axiosPrivate = useAxiosPrivate();

    const parseMerchantQR = async (
        code: string
    ): Promise<ApiResponse<SomQRMerchantData>> => {
        const response = await axiosPrivate.get<ApiResponse<SomQRMerchantData>>(
            `${BASE_URL}/ParseMerchantQR`,
            { params: { code } }
        );
        return response.data;
    };

    const parsePersonQR = async (
        code: string
    ): Promise<ApiResponse<SomQRPersonData>> => {
        const response = await axiosPrivate.get<ApiResponse<SomQRPersonData>>(
            `${BASE_URL}/ParsePersonQR`,
            { params: { code } }
        );
        return response.data;
    };

    return { parseMerchantQR, parsePersonQR };
};

export default useSomQRParser;