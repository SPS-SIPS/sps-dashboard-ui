export const verificationMethods = [
    {value: "ACCT", label: "Account"},
    {value: "EWLT", label: "Wallet"},
    {value: "MSIS", label: "Phone Number"},
    {value: "IBAN", label: "IBAN"},
];

export const paymentMethods = [
    {value: "P2P", label: "P2P - (Person to Person)"},
    {value: "P2M", label: "P2M - (Person to Merchant)"},
    {value: "P2G", label: "P2G - (Person to Government)"},
    {value: "G2P", label: "G2P - (Government to Person)"},
];

export const categoryPurposeOptions = [
    {value: "C2CCRT", label: "C2C Credit Transfer"},
    {value: "C2BSQR", label: "C2B Static QR Payment"},
    {value: "C2BDQR", label: "C2B Dynamic QR Payment"},
];

export const bicOptionsDev = [
    { value: "AGROSOS0", label: "Agro Bank Somalia" },
    { value: "AALLSOS0", label: "Amal Bank Ltd" },
    { value: "AMBKSOS0", label: "Amana Bank" },
    { value: "BDBKSOS0", label: "Bulsho Development Bank" },
    { value: "BUHBSOS0", label: "Bushra Business Bank" },
    { value: "DAHISOS0", label: "Dahabshil Bank International" },
    { value: "DARYSOS0", label: "Daryeel Bank" },
    { value: "GLXYSOS0", label: "Galaxy International Bank" },
    { value: "IDMNSOS0", label: "Idman Community Bank" },
    { value: "IBOSSOS0", label: "International Bank Of Somalia" },
    { value: "MYBASOS0", label: "MyBank Limited" },
    { value: "PBSMSOS0", label: "Premier Bank Ltd" },
    { value: "SSBMSOS0", label: "Salam Somali Bank" },
    { value: "SOMNSOS0", label: "Sombank Ltd" },
    { value: "ZKBASOS0", label: "Ziraat Katilim Bank Somalia" },
    { value: "ZKPASOS0", label: "Z-Pay" },
];

export const bicOptionsProd = [
    { value: "AGROSOSM", label: "Agro Bank" },
    { value: "AALLSOSG", label: "Amal Bank" },
    { value: "AMBKSOSM", label: "Amana Bank" },
    { value: "BDBKSOSM", label: "Bulsho Development Bank" },
    { value: "BUHBSOSM", label: "Bushra Business Bank" },
    { value: "DAHISOSM", label: "Dahabshil Bank International" },
    { value: "DARYSOSG", label: "Daryeel Bank" },
    { value: "GLXYSOSM", label: "Galaxy International Bank" },
    { value: "IBOSSOSM", label: "IBS Bank" },
    { value: "IDMNSOSM", label: "Idman Community Bank" },
    { value: "MYBASOSM", label: "MyBank" },
    { value: "PBSMSOSM", label: "Premier Bank" },
    { value: "SSBMSOSM", label: "Salaam Somali Bank" },
    { value: "SOMNSOSM", label: "SomBank Ltd" },
];

export const getBicFromAcqId = (
    acqId: string,
    env: "dev" | "prod"
) => {
    return env === "dev"
        ? acqIdToBicDev[acqId]
        : acqIdToBicProd[acqId];
};

export const extractBankCodeFromIBAN = (iban: string): string | null => {

    if (!iban.startsWith("SO") || iban.length < 23) {
        return null;
    }

    return iban.substring(4, 8);
};

export const acqIdToBicDev: Record<string, string> = {
    "0001": "SSBMSOS0",
    "0002": "DAHISOS0",
    "0003": "AALLSOS0",
    "0004": "IBOSSOS0",
    "0005": "PBSMSOS0",
    "0006": "DARYSOS0",
    "0007": "SOMNSOS0",
    "0008": "MYBASOS0",
    "0009": "AMBKSOS0",
    "0010": "AGROSOS0",
    "0011": "GLXYSOS0",
    "0012": "IDMNSOS0",
    "0013": "BUHBSOS0",
    "0014": "ZKBASOS0",
    "0015": "BDBKSOS0",
};

export const acqIdToBicProd: Record<string, string> = {
    "0001": "SSBMSOSM",
    "0002": "DAHISOSM",
    "0003": "AALLSOSG",
    "0004": "IBOSSOSM",
    "0005": "PBSMSOSM",
    "0006": "DARYSOSG",
    "0007": "SOMNSOSM",
    "0008": "MYBASOSM",
    "0009": "AMBKSOSM",
    "0010": "AGROSOSM",
    "0011": "GLXYSOSM",
    "0012": "IDMNSOSM",
    "0013": "BUHBSOSM",
    "0014": "ZKBASOS0",
    "0015": "BDBKSOSM",
};

