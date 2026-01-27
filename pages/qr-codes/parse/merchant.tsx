import React from 'react';
import {QRParser} from "../../../component/QRParser/QRParser";
import RoleGuard from "../../../auth/RoleGuard";
import {useApiRequest} from "../../../utils/apiService";
import {useAuthentication} from "../../../auth/AuthProvider";

const MerchantQRParser: React.FC = () => {
    const {makeApiRequest} = useApiRequest();
    const {config} = useAuthentication();
    const baseURL = config?.api.baseUrl;
    const handleParse = async (qrCode: string) => {
        return await makeApiRequest({
            url: `${baseURL}/api/v1/SomQR/ParseMerchantQR?code=${encodeURIComponent(qrCode)}`,
            method: 'get',
        });
    };

    return (
        <RoleGuard allowedRoles={['som_qr']}>
            <QRParser
                title="Scan Merchant SOMQR"
                subtitle="Use this tool to scan and view details from your merchant SOMQR code."
                onParse={handleParse}
                qrType={'merchant'}
            />
        </RoleGuard>
    );
};

export default MerchantQRParser;