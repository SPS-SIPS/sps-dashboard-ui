import React from 'react';
import {QRParser} from "../../../component/QRParser/QRParser";
import {baseURL} from "../../../constants/constants";
import RoleGuard from "../../../auth/RoleGuard";
import {useApiRequest} from "../../../utils/apiService";

const MerchantQRParser: React.FC = () => {
    const { makeApiRequest } = useApiRequest();

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
                // @ts-ignore: ignore TS2322 type error
                onParse={handleParse}
                qrType={'merchant'}
            />
        </RoleGuard>
    );
};

export default MerchantQRParser;