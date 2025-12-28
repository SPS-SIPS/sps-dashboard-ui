import { useState, useEffect } from 'react';
import useAxiosPrivate from './useAxiosPrivate';
import { Transaction, TransactionQuery } from '../../types/types';

export const useTransactions = (initialQuery: TransactionQuery = { page: 0, pageSize: 10 }) => {
    const axiosPrivate = useAxiosPrivate();
    const [query, setQuery] = useState<TransactionQuery>(initialQuery);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);

        try {
            const params: Record<string, string> = {
                page: query.page.toString(),
                pageSize: query.pageSize.toString(),
                ...(query.Status !== undefined && { Status: query.Status.toString() }),
                ...(query.TransactionId && { TransactionId: query.TransactionId }),
                ...(query.EndToEndId && { EndToEndId: query.EndToEndId }),
                ...(query.LocalInstrument && { LocalInstrument: query.LocalInstrument }),
                ...(query.CategoryPurpose && { CategoryPurpose: query.CategoryPurpose }),
                ...(query.DebtorAccount && { DebtorAccount: query.DebtorAccount }),
                ...(query.CreditorAccount && { CreditorAccount: query.CreditorAccount }),
                ...(query.FromDate && { FromDate: query.FromDate }),
                ...(query.ToDate && { ToDate: query.ToDate }),
                ...(query.ISOMessageId !== undefined && { ISOMessageId: query.ISOMessageId.toString() }),
                ...(query.RelatedToISOMessageId !== undefined && { RelatedToISOMessageId: query.RelatedToISOMessageId.toString() })
            };

            const response = await axiosPrivate.get<Transaction[]>('/api/v1/Transactions/transactions', {
                params,
                paramsSerializer: { indexes: null }
            });

            setTransactions(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchTransactions();
    }, [query]);

    const updateQuery = (newQuery: Partial<TransactionQuery>) => {
        setQuery(prev => ({ ...prev, ...newQuery }));
    };

    return {
        transactions,
        loading,
        error,
        query,
        setQuery: updateQuery,
        refetch: fetchTransactions,
    };
};
