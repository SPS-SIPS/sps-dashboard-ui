import React from 'react';
import {useAuthentication} from "../../../../auth/AuthProvider";
import {QRParser} from "../../../../component/QRParser/QRParser";
import {makeApiRequest} from "../../../../utils/apiService";


 const PersonalQRParser: React.FC = () => {
    const { authToken } = useAuthentication();

    const handleParse = async (qrCode: string) => {
        const response = await makeApiRequest({
            url: `http://localhost:8080/api/v1/somqr/ParsePersonQR?code=${encodeURIComponent(qrCode)}`,
            method: 'GET',
            token: authToken!,
        });
        return response.data;
    };

    return (
        <QRParser
            title="Personal QR Code Parser"
            subtitle="Parse personal payment QR codes to view transaction details"
            onParse={handleParse}
      />
    );
};
 export default PersonalQRParser;