import QRForm from "../../../component/QRForm/QRForm";
import {currencyOptions} from "../../../data/currencyOptions";
import {mccOptions} from "../../../data/mccOptions";
import {baseURL} from "../../../constants/constants";
import RoleGuard from "../../../auth/RoleGuard";

const Merchant = () => {
    const merchantInitialData = {
        type: "1",
        method: "1",
        merchantId: "",
        merchantCategoryCode: "",
        currencyCode: "",
        merchantName: "",
        merchantCity: "",
        postalCode: "",
        storeLabel: "",
        terminalLabel: "",
        amount: "",
    };

    const typeOptions = [
        {value: "1", label: "Static QR"},
        {value: "2", label: "Dynamic QR"},
    ];

    const methodOptions = [
        {value: "1", label: "Dynamic Initialization (1)"},
    ];

    const merchantFormFields = [
        {
            label: "Type",
            name: "type",
            type: "select",
            options: typeOptions,
            required: true,
        },
        {
            label: "Method",
            name: "method",
            type: "select",
            options: methodOptions,
            required: true,
        },
        {label: "Merchant ID", name: "merchantId", type: "text", required: true, maxLength: 100},
        {label: "Merchant Category", name: "merchantCategoryCode", type: "select", options: mccOptions, required: true},
        {label: "Amount", name: "amount", type: "number", required: true},
        {label: "Currency Code", name: "currencyCode", type: "select", options: currencyOptions, required: true},
        {label: "Merchant Name", name: "merchantName", type: "text", required: true, maxLength: 25},
        {label: "Merchant City", name: "merchantCity", type: "text", required: true, maxLength: 15},
        {label: "Postal Code", name: "postalCode", type: "text", required: false},
        {label: "Store Label", name: "storeLabel", type: "text", required: false},
        {label: "Terminal Label", name: "terminalLabel", type: "text", required: false},

    ];

    return (
        <RoleGuard allowedRoles={["som_qr"]}>
            <QRForm
                title="SOMQR Merchant QR Generator"
                subtitle="Generate an EMV-compliant merchant QR code under the Central Bank of Somalia SOMQR standard"
                apiEndpoint={`${baseURL}/api/v1/SomQR/GenerateMerchantQR`}
                initialData={merchantInitialData}
                formFields={merchantFormFields}
            />
        </RoleGuard>
    );
};

export default Merchant;
