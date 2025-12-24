import useAxiosPrivate from "./useAxiosPrivate";

/**
 * Query parameters you can pass to the API
 */
export type StatusMessagesQuery = {
    relatedToISOMessageId?: number;
    msgId?: string;
    bizMsgIdr?: string;
    msgDefIdr?: string;
    type?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
};

/**
 * Status message DTO returned by the API
 */
export type StatusMessage = {
    id: number;
    messageType: string;
    status: string;
    msgId: string;
    bizMsgIdr?: string;
    msgDefIdr?: string;
    round?: number;
    txId?: string | null;
    endToEndId?: string | null;
    reason?: string;
    additionalInfo?: string;
    date: string;
    fromBIC?: string;
    toBIC?: string;
    request: string;
    response: string;
};

const BASE_URL = "/api/v1/StatusMessages/status-messages";

const useStatusMessages = () => {
    const axiosPrivate = useAxiosPrivate();

    /**
     * Get paged status (pacs.002) messages
     */
    const getStatusMessages = async (
        query: StatusMessagesQuery
    ): Promise<StatusMessage[]> => {
        try {
            const response = await axiosPrivate.get<StatusMessage[]>(
                BASE_URL,
                { params: query }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        getStatusMessages,
    };
};

export default useStatusMessages;
