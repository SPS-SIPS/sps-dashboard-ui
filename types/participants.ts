export type ParticipantStatus = {
    institutionBic: string;
    institutionName: string;
    isLive: boolean;
    lastCheckedAt: string;
    lastStatusChangeAt: string;
    consecutiveFailures: number;
    consecutiveSuccesses: number;
    lastError?: string | null;
};

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
