import React, { useEffect, useState } from "react";
import useStatusMessages, {StatusMessage, StatusMessagesQuery} from "../api/hooks/useStatusMessages";

const Test = () => {
    const { getStatusMessages } = useStatusMessages();
    const [messages, setMessages] = useState<StatusMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            setError(null);
            const query: StatusMessagesQuery = {
                page: 1,
                pageSize: 10,
            };
            try {
                const data = await getStatusMessages(query);
                setMessages(data);
            } catch (err: any) {
                setError(err.message || "Failed to fetch status messages");
            } finally {
                setLoading(false);
            }
        };

        void fetchMessages();
    }, [getStatusMessages]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Status Messages</h2>
            {messages.length === 0 ? (
                <p>No messages found</p>
            ) : (
                <ul>
                    {messages.map((msg) => (
                        <li key={msg.id}>
                            <strong>{msg.messageType}</strong> - {msg.status} - {msg.msgId}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Test;
