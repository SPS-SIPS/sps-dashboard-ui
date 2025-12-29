import useAxiosPrivate from "./useAxiosPrivate";
import {ApiResponse, IsParticipantLiveResult, ParticipantStatus} from "../../types/participants";

const BASE_URL = "api/v1/Participants";

const useParticipants = () => {
    const axiosPrivate = useAxiosPrivate();

    /**
     * Get live participants
     * Optional filter: IsLive (true | false)
     */
    const getLiveParticipants = async (
        isLive?: boolean
    ): Promise<ParticipantStatus[]> => {
        const response = await axiosPrivate.get<ApiResponse<ParticipantStatus[]>>(
            `${BASE_URL}/live`,
            {
                params: isLive !== undefined ? { IsLive: isLive } : undefined,
            }
        );

        return response.data.data;
    };

    /**
     * Check if a participant is live by BIC
     */
    const isParticipantLive = async (
        bic: string
    ): Promise<IsParticipantLiveResult> => {
        const response = await axiosPrivate.get<
            ApiResponse<IsParticipantLiveResult>
        >(`${BASE_URL}/live/${bic}`);

        return response.data.data;
    };

    /**
     * Get all available participant BICs
     */
    const getAvailableParticipantBics = async (): Promise<string[]> => {
        const response = await axiosPrivate.get<ApiResponse<string[]>>(
            `${BASE_URL}/live/available/bics`
        );

        return response.data.data;
    };

    return {
        getLiveParticipants,
        isParticipantLive,
        getAvailableParticipantBics,
    };
};

export default useParticipants;
