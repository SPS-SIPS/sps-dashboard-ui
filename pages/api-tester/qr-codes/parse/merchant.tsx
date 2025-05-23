import React from 'react';
import {QRParser} from "../../../../component/QRParser/QRParser";
import { baseURL } from "../../../../constants/constants";
import RoleGuard from "../../../../auth/RoleGuard";
import {useApiRequest} from "../../../../utils/apiService";

const MerchantQRParser: React.FC = () => {
    const { makeApiRequest } = useApiRequest();

    const handleParse = async (qrCode: string) => {
        const response = await makeApiRequest({
            url: `${baseURL}/api/v1/SomQR/ParseMerchantQR?code=${encodeURIComponent(qrCode)}`,
            method: 'get',
        });
        return response.data;
    };

    return (
        <RoleGuard allowedRoles={['som_qr']}>
            <QRParser
                title="Merchant QR Code Parser"
                subtitle="Parse merchant QR codes to view transaction details"
                onParse={handleParse}
                qrType={'merchant'}
            />
        </RoleGuard>
    );
};

export default MerchantQRParser;