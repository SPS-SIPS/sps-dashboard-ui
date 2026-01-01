import {useEffect, useMemo, useState} from "react";
import useAxiosPrivate from "./useAxiosPrivate";
import {
    ApiResponse,
    IsParticipantLiveResult,
    ParticipantStatus,
} from "../../types/participants";

export interface Option {
    value: string;
    label: string;
}

const BASE_URL = "api/v1/Participants";

const useParticipants = () => {
    const axiosPrivate = useAxiosPrivate();

    const getLiveParticipants = async (
        isLive?: boolean
    ): Promise<ParticipantStatus[]> => {
        const response = await axiosPrivate.get<ApiResponse<ParticipantStatus[]>>(
            `${BASE_URL}/live`,
            {
                params: isLive !== undefined ? {IsLive: isLive} : undefined,
            }
        );

        return response.data.data;
    };

    const isParticipantLive = async (
        bic: string
    ): Promise<IsParticipantLiveResult> => {
        const response = await axiosPrivate.get<
            ApiResponse<IsParticipantLiveResult>
        >(`${BASE_URL}/live/${bic}`);

        return response.data.data;
    };

    const getAvailableParticipantBics = async (): Promise<string[]> => {
        const response = await axiosPrivate.get<ApiResponse<string[]>>(
            `${BASE_URL}/live/available/bics`
        );

        return response.data.data;
    };


    const [participants, setParticipants] = useState<ParticipantStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        let mounted = true;

        const loadParticipants = async () => {
            try {
                const data = await getLiveParticipants();
                if (mounted) setParticipants(data);
            } catch (err) {
                if (mounted) setError(err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void loadParticipants();

        return () => {
            mounted = false;
        };
    }, []);


    const bicOptions: Option[] = useMemo(
        () =>
            participants.map((p) => ({
                value: p.institutionBic,
                label: p.institutionName,
            })),
        [participants]
    );

    /* ======================================================
       PUBLIC API
    ====================================================== */

    return {
        /* Raw API helpers */
        getLiveParticipants,
        isParticipantLive,
        getAvailableParticipantBics,

        /* Live participants state */
        participants,
        bicOptions,
        loading,
        error,
        hasParticipants: participants.length > 0,
    };
};

export default useParticipants;
