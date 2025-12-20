import useAxiosPrivate from './useAxiosPrivate';
import { HealthCheckResponse } from '../../types/health';

const BASE_URL = '/Health';

const useSystemHealth = () => {
    const axiosPrivate = useAxiosPrivate();

    const getSystemHealth = async (): Promise<HealthCheckResponse> => {
        try {
            const response = await axiosPrivate.get<HealthCheckResponse>(BASE_URL);
            return response.data;
        } catch (error: any) {
            // Health endpoint may return 503 with valid body (degraded state)
            if (error.response?.data) {
                return error.response.data as HealthCheckResponse;
            }

            // Network / unexpected error → propagate
            throw error;
        }
    };

    return {
        getSystemHealth,
    };
};

export default useSystemHealth;
