import {useEffect, useMemo} from "react";
import { useAuthentication } from "../../auth/AuthProvider";
import axios from "axios";

const useAxiosPrivate = () => {
    const { keycloak ,config, isLoading} = useAuthentication();

    const axiosInstance = useMemo(() => {
        return axios.create({
            baseURL: config?.api.baseUrl || "http://localhost:8080", // fallback
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        });
    }, [config?.api.baseUrl]);

    useEffect(() => {
        if (!keycloak) return;

        const requestIntercept = axiosInstance.interceptors.request.use(
            async (config) => {
                if (!keycloak.authenticated || !keycloak.token) {
                    return config;
                }

                try {
                    // Refresh token if it's expired or about to expire (within 30 seconds)
                    await keycloak.updateToken(30);
                    config.headers.Authorization = `Bearer ${keycloak.token}`;
                } catch (error) {
                    console.error("Failed to refresh token:", error);
                    await keycloak.logout();
                    throw error;
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseIntercept = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const prevRequest = error?.config;

                if (error?.response?.status === 401 && !prevRequest?._retry) {
                    prevRequest._retry = true;

                    try {
                        await keycloak.updateToken();
                        prevRequest.headers.Authorization = `Bearer ${keycloak.token}`;
                        return axiosInstance(prevRequest);
                    } catch (refreshError) {
                        console.error("Token refresh failed:", refreshError);
                        await keycloak.logout();
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axiosInstance.interceptors.request.eject(requestIntercept);
            axiosInstance.interceptors.response.eject(responseIntercept);
        };
    }, [keycloak]);

    return axiosInstance;
};

export default useAxiosPrivate;