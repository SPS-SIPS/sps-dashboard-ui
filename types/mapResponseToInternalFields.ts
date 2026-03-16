import { FieldMapping } from "../api/hooks/useEndpoints";

export const mapResponseToInternalFields = (
    data: Record<string, any>,
    mappings: FieldMapping[]
) => {
    const result: Record<string, any> = {};

    mappings.forEach((m) => {
        const value = data[m.userField];

        if (value !== undefined) {
            result[m.internalField] = value;
        }
    });

    return result;
};