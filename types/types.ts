export interface APIResponse {
    data: unknown;
    status: number;
    headers: Record<string, string>;
}

export interface APIError {
    message: string;
    details?: string;
    statusCode?: number;
}