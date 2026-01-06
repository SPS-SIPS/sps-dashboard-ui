import { FieldMapping } from "../api/hooks/useEndpoints";

export interface ReturnRequestSourceData {
    txId: string;
    endToEndId: string;
    reason: string;
    additionalInfo: string;
    returnIdInput: string;
}

export const mapReturnRequestPayload = (
    fieldMappings: FieldMapping[],
    data: ReturnRequestSourceData
): Record<string, string> => {
    const payload: Record<string, string> = {};

    fieldMappings.forEach((field) => {
        switch (field.internalField) {
            case "OriginalEndToEndId":
                payload[field.userField] = data.endToEndId;
                break;

            case "OriginalTxId":
                payload[field.userField] = data.txId;
                break;

            case "Reason":
                payload[field.userField] = data.reason;
                break;

            case "AdditionalInfo":
                payload[field.userField] = data.additionalInfo;
                break;

            case "ReturnId":
                payload[field.userField] = data.returnIdInput;
                break;

            default:
                payload[field.userField] = "";
        }
    });

    return payload;
};
