import {APIResponse} from "../types/types";

export const makeApiRequest = async (config: {
    url: string;
    method: string;
    data?: unknown;
    token?: string;
}): Promise<APIResponse> => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (config.token) {
        headers['Authorization'] = `Bearer ${config.token}`;
    }

    const response = await fetch(config.url, {
        method: config.method,
        headers: headers,
        body: JSON.stringify(config.data),
    });

    if (!response.ok) {
        throw {
            message: `HTTP error! status: ${response.status}`,
            statusCode: response.status
        };
    }

    return {
        data: await response.json(),
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
    };
};
