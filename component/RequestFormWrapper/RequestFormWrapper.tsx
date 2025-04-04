import React, { useEffect, useState } from 'react';
import RequestForm from '../RequestForm/RequestForm';
import useEndpoints from "../../api/hooks/useEndpoints";


interface RequestFormWrapperProps {
    selectedRequest: string;
    onSubmit: (data: Record<string, string>) => void;
}

const RequestFormWrapper: React.FC<RequestFormWrapperProps> = ({ selectedRequest, onSubmit }) => {
    const { endpoints, loading, error } = useEndpoints();
    const [fieldMappings, setFieldMappings] = useState<any[]>([]);

    useEffect(() => {
        if (endpoints && selectedRequest) {
            const selectedEndpoint = endpoints[selectedRequest];
            if (selectedEndpoint) {
                setFieldMappings(selectedEndpoint.fieldMappings);
            }
        }
    }, [selectedRequest, endpoints]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Handle case when there are no matching endpoints or selectedRequest is invalid
    if (!fieldMappings.length) {
        return <div>No fields available for the selected request</div>;
    }

    return (
        <RequestForm
            requestType={selectedRequest}
            fieldMappings={fieldMappings}
            onSubmit={onSubmit}
            buttonText={"Send Request"}
        />
    );
};

export default RequestFormWrapper;
