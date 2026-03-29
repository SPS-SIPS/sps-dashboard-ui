import useAxiosPrivate from "./useAxiosPrivate";

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface LogFileResponse {
    fileName: string;
    lastWriteTime: string;
    sizeBytes: number;
    size: string;
}

const BASE_URL = "api/v1/Logs";

const useLogs = () => {
    const axiosPrivate = useAxiosPrivate();

    // Fetch log files
    const getLogFiles = async (
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        sort: "asc" | "desc" = "desc"
    ): Promise<PagedResult<LogFileResponse>> => {

        const response = await axiosPrivate.get<PagedResult<LogFileResponse>>(
            `${BASE_URL}/files`,
            {
                params: {
                    page,
                    pageSize,
                    search,
                    sort,
                },
            }
        );

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
