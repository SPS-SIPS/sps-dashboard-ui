import { ISOMessageType } from "../types/types";

export const getMessageTypeTitle = (type: ISOMessageType): string => {
    switch (type) {
        case ISOMessageType.VerificationRequest:
            return "ISO 20022 Verification Request Details";
        case ISOMessageType.VerificationResponse:
            return "ISO 20022 Verification Response Details";
        case ISOMessageType.TransactionRequest:
            return "ISO 20022 Transaction Request Details";
        case ISOMessageType.TransactionResponse:
            return "ISO 20022 Transaction Response Details";
        case ISOMessageType.StatusRequest:
            return "ISO 20022 Status Request Details";
        case ISOMessageType.StatusResponse:
            return "ISO 20022 Status Response Details";
        case ISOMessageType.ReturnRequest:
            return "ISO 20022 Return Request Details";
        case ISOMessageType.ReturnResponse:
            return "ISO 20022 Return Response Details";
        default:
            return "ISO 20022 Message Details";
    }
};


export const MESSAGE_TYPE_BREADCRUMB_LABELS: Record<ISOMessageType, string> = {
    [ISOMessageType.VerificationRequest]: "Verification Request",
    [ISOMessageType.VerificationResponse]: "Verification Response",
    [ISOMessageType.TransactionRequest]: "Transaction Request",
    [ISOMessageType.TransactionResponse]: "Transaction Response",
    [ISOMessageType.StatusRequest]: "Status Request",
    [ISOMessageType.StatusResponse]: "Status Response",
    [ISOMessageType.ReturnRequest]: "Return Request",
    [ISOMessageType.ReturnResponse]: "Return Response",
    [ISOMessageType.InvalidMessageType]: "ISO Message",
};