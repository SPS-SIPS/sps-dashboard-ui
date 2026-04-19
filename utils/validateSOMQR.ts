export type SOMQRType = "merchant" | "personal";

export function validateSOMQR(data: string): { isValid: boolean; type?: SOMQRType } {
    if (!data) return { isValid: false };

    const trimmed = data.trim();

    // Merchant QR Code starts with '000201'
    if (trimmed.startsWith("000201") && trimmed.length > 30) {
        return { isValid: true, type: "merchant" };
    }

    // Personal QR Code starts with '000202'
    if (trimmed.startsWith("000202") && trimmed.length > 30) {
        return { isValid: true, type: "personal" };
    }

    return { isValid: false };
}