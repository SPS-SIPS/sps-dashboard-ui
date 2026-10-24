import { useState, useEffect, useRef } from 'react';
import useAxiosPrivate from "./useAxiosPrivate";
import {ISOMessage, MessageQuery} from "../../types/types";

const pendingMessageRequests = new Map<string, Promise<ISOMessage[]>>();

export const useISOMessages = (initialQuery: MessageQuery = { page: 0, pageSize: 10 }) => {
    const axiosPrivate = useAxiosPrivate();
    const [query, setQuery] = useState<MessageQuery>(initialQuery);
    const [messages, setMessages] = useState<ISOMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loadedQueryKey = useRef<string | null>(null);
    const inFlightQueryKey = useRef<string | null>(null);

    const fetchMessages = async (force = false) => {
        const queryKey = JSON.stringify(query);
        if (!force && (queryKey === loadedQueryKey.current || queryKey === inFlightQueryKey.current)) return;
        inFlightQueryKey.current = queryKey;
        setLoading(true);
        setError(null);

        try {
            const params = {
                ...query,
                status: query.status?.toString(),
                type: query.type?.toString(),
            };

            let request = pendingMessageRequests.get(queryKey);
            if (!request) {
                request = axiosPrivate.get<ISOMessage[]>('/api/v1/Transactions/iso-messages', {
                    params,
                    paramsSerializer: { indexes: null }
                }).then(response => response.data)
                    .finally(() => pendingMessageRequests.delete(queryKey));
                pendingMessageRequests.set(queryKey, request);
            }
            setMessages(await request);
            loadedQueryKey.current = queryKey;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch messages');
        } finally {
            if (inFlightQueryKey.current === queryKey) inFlightQueryKey.current = null;
            setLoading(false);
        }
    };

    // Fetch when query changes
    useEffect(() => {
        void fetchMessages();
    }, [query]);

    const updateQuery = (newQuery: Partial<MessageQuery>) => {
        setQuery(prev => ({ ...prev, ...newQuery }));
    };

    return {
        messages,
        loading,
        error,
        query,
        setQuery: updateQuery,
        refetch: () => fetchMessages(true),
    };
};
