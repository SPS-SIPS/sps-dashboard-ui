import axios from "axios";

export function extractErrorMessage(
    error: unknown,
    defaultMessage: string = "An unexpected error occurred."
): string {
    if (axios.isAxiosError(error)) {
        return (
            error.response?.data?.message ||
            error.response?.statusText ||
            error.message ||
            defaultMessage
        );
    }

    if (error instanceof Error) {
        return error.message || defaultMessage;
    }

    return defaultMessage;
}
