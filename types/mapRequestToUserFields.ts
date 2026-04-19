import { FieldMapping } from "../api/hooks/useEndpoints";

export const mapRequestToUserFields = (
    data: Record<string, any>,
    mappings: FieldMapping[]
) => {

    const result: Record<string, any> = {};

    mappings.forEach(m => {

        const value = data[m.internalField];

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            result[m.userField] = value;
        }

    });

    return result;
};