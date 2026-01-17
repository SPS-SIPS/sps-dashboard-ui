import useAxiosPrivate from "./useAxiosPrivate";
import {ISOMessageType, TransactionStatus} from "../../types/types";

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

export type StatusMessage = {
    id: number;
    messageType: ISOMessageType;
    status: TransactionStatus;
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

const BASE_URL = "/api/v1/StatusMessages";

const useStatusMessages = () => {
    const axiosPrivate = useAxiosPrivate();

    const getStatusMessages = async (
        query: StatusMessagesQuery
    ): Promise<StatusMessage[]> => {
        try {
            const response = await axiosPrivate.get<StatusMessage[]>(BASE_URL, {
                params: query,
            });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    };

    return {
        getStatusMessages,
    };
};

export default useStatusMessages;
