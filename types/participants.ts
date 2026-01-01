export type ApiResponse<T> = {
    data: T;
    succeeded: boolean;
    message?: string | null;
    errors?: string[] | null;
};

export type IsParticipantLiveResult = {
    institutionBic: string;
    isLive: boolean;
};


export type ParticipantStatus = IsParticipantLiveResult & {
    institutionName: string;

    lastCheckedAt: string;
    lastStatusChangeAt: string;

    consecutiveFailures: number;
    consecutiveSuccesses: number;

    lastError?: string | null;

    currentBalance?: number | null;
    availableBalance?: number | null;

    canSend: boolean;
    minimumSendBalance?: number | null;
};
