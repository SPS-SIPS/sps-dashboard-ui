import useAxiosPrivate from "./useAxiosPrivate";
import {TransactionType} from "../../types/types";

export type PeriodType = 'All' | 'Today' | 'ThisWeek' | 'LastWeek' | 'ThisMonth' | 'LastMonth' | 'Last3Months' | 'ThisYear';

export type DashboardQuery = {
    period: PeriodType;
};

// DTOs based on your C# models
export type TransactionTypeSummary = {
    type: TransactionType;
    count: number;
    totalAmount: number;
};

export type TransactionTypeDistribution = {
    transactionTypeSummary: TransactionTypeSummary[];
};

export type CashFlowItem = {
    type: string;
    count: number;
    totalAmount: number;
};

export type CashFlowOverview = {
    inbound: CashFlowItem;
    outbound: CashFlowItem;
    netFlow: number;
};

export type CashFlowOverviewResponse = {
    cashFlowOverview: CashFlowOverview;
};

export type ReturnMonitoring = {
    readyForReturn: number;
    returnWithdrawal: number;
    returnRatePercentage: number;
};

export type IssuerActivityItem = {
    issuer: string;
    transactionCount: number;
    totalAmount: number | null;
};

export type IssuerActivityResponse = {
    debtorIssuerActivity: IssuerActivityItem[];
    creditorIssuerActivity: IssuerActivityItem[];
};

export type IsoRequestSummaryItem = {
    type: string;
    count: number;
};

export type IsoStatusSummaryItem = {
    status: string;
    count: number;
};

export type IsoMsgDefSummaryItem = {
    msgDefIdr: string;
    count: number;
};

const BASE_URL = '/api/v1/Dashboard';

const useDashboardAPI = () => {
    const axiosPrivate = useAxiosPrivate();

    const getTransactionTypeDistribution = async (
        query: DashboardQuery
    ): Promise<TransactionTypeDistribution> => {
        const response = await axiosPrivate.get<TransactionTypeDistribution>(`${BASE_URL}/TransactionTypeDistribution`, {
            params: query,
        });
        return response.data;
    };

    const getCashFlowOverview = async (
        query: DashboardQuery
    ): Promise<CashFlowOverviewResponse> => {
        const response = await axiosPrivate.get<CashFlowOverviewResponse>(`${BASE_URL}/CashFlowOverview`, {
            params: query,
        });
        return response.data;
    };

    const getReturnExceptionMonitoring = async (
        query: DashboardQuery
    ): Promise<ReturnMonitoring> => {
        const response = await axiosPrivate.get<ReturnMonitoring>(`${BASE_URL}/ReturnExceptionMonitoring`, {
            params: query,
        });
        return response.data;
    };

    const getIssuerActivity = async (
        query: DashboardQuery
    ): Promise<IssuerActivityResponse> => {
        const response = await axiosPrivate.get<IssuerActivityResponse>(`${BASE_URL}/IssuerActivity`, {
            params: query,
        });
        return response.data;
    };

    const getIsoRequestsSummary = async (
        query: DashboardQuery
    ): Promise<IsoRequestSummaryItem[]> => {
        const response = await axiosPrivate.get<IsoRequestSummaryItem[]>(`${BASE_URL}/IsoRequestsSummary`, {
            params: query,
        });
        return response.data;
    };

    const getIsoStatusSummary = async (
        query: DashboardQuery
    ): Promise<IsoStatusSummaryItem[]> => {
        const response = await axiosPrivate.get<IsoStatusSummaryItem[]>(`${BASE_URL}/IsoStatusSummary`, {
            params: query,
        });
        return response.data;
    };

    const getIsoMsgDefSummary = async (
        query: DashboardQuery
    ): Promise<IsoMsgDefSummaryItem[]> => {
        const response = await axiosPrivate.get<IsoMsgDefSummaryItem[]>(`${BASE_URL}/IsoMsgdefSummary`, {
            params: query,
        });
        return response.data;
    };

    return {
        getTransactionTypeDistribution,
        getCashFlowOverview,
        getReturnExceptionMonitoring,
        getIssuerActivity,
        getIsoRequestsSummary,
        getIsoStatusSummary,
        getIsoMsgDefSummary,
    };
};

export default useDashboardAPI;
