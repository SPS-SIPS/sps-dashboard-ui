import useAxiosPrivate from "./useAxiosPrivate";

export interface LogFileResponse {
    fileName: string;
    lastWriteTime: string; // ISO string
    sizeBytes: number;
    size: string;
}

const BASE_URL = "api/v1/Logs";

const useLogs = () => {
    const axiosPrivate = useAxiosPrivate();

    // Fetch log files
    const getLogFiles = async (): Promise<LogFileResponse[]> => {
        const response = await axiosPrivate.get<LogFileResponse[]>(`${BASE_URL}/files`);
        return response.data;
    };

    // Download a log file as Blob
    const downloadLogFile = async (fileName: string): Promise<Blob> => {
        const response = await axiosPrivate.get(`${BASE_URL}/download/${fileName}`, {
            responseType: "blob",
        });
        return response.data;
    };

    return {
        getLogFiles,
        downloadLogFile,
    };
};

export default useLogs;
