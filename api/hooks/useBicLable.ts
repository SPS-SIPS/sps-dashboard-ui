import {useCallback} from "react";
import useParticipants from "../../api/hooks/useParticipants";

// Exported reusable hook
export const useBicLabel = () => {
    const {bicOptions} = useParticipants();

    return useCallback(
        (bic?: string) => {
            const option = bicOptions.find((o) => o.value === bic);
            return option ? option.label : bic || "-";
        },
        [bicOptions]
    );
};
