import React from 'react';
import {QRParser} from "../../../component/QRParser/QRParser";
import {useApiRequest} from "../../../utils/apiService";
import RoleGuard from "../../../auth/RoleGuard";
import {useAuthentication} from "../../../auth/AuthProvider";

const PersonalQRParser: React.FC = () => {
    const {makeApiRequest} = useApiRequest();
    const {config} = useAuthentication();
    const baseURL = config?.api.baseUrl;
    const handleParse = async (qrCode: string) => {
        return await makeApiRequest({
            url: `${baseURL}/api/v1/somqr/ParsePersonQR?code=${encodeURIComponent(qrCode)}`,
            method: 'get',
        });
    };

    return (
        <RoleGuard allowedRoles={['som_qr']}>
            <QRParser
                title="Scan Personal SOMQR"
                subtitle="Use this tool to scan and view details from your personal SOMQR code."
                // @ts-ignore: ignore TS2322 type error
                onParse={handleParse}
                qrType={'personal'}
            />

        </RoleGuard>
    );
};
export default PersonalQRParser;