export interface MerchantAccountDetails {
    globalUniqueIdentifier: string;
    paymentNetworkSpecific: Record<number, string>;
}

export interface MerchantAccountDictionary {
    [key: number]: MerchantAccountDetails;
}

export interface SomQRMerchantData {
    payloadFormatIndicator: string;
    pointOfInitializationMethod: string;
    merchantAccount: MerchantAccountDictionary;
    merchantCategoryCode: number;
    transactionCurrency: number;
    transactionAmount: number | null;
    tipOrConvenienceIndicator: number | null;
    valueOfConvenienceFeeFixed: number | null;
    valueOfConvenienceFeePercentage: number | null;
    countyCode: string;
    merchantName: string;
    merchantCity: string;
    postalCode: string | null;
    additionalData: any | null;
    merchantInformation: any | null;
    unreservedTemplate: any | null;
    crc: string;
}

export interface SomQRPersonData {
    payloadFormatIndicator: string;
    pointOfInitializationMethod: string;
    schemeIdentifier: string;
    fiName: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    particulars: string | null;
    crc: string;
}

export type VerificationInternalResponse = {
    IsVerified?: boolean;
    Reason?: string;
    AccountNo?: string;
    AccountType?: string;
    Address?: string;
    Name?: string;
    Currency?: string;
    SIPSRequestId?: string;
};

export interface PaymentRequest {
    ToBIC: string
    LocalInstrument: string
    CategoryPurpose: string
    EndToEndId: string
    CreditorIssuer: string

    DebtorName: string
    DebtorAccount: string
    DebtorAccountType: string
    // DebtorAddress: string

    CreditorName: string
    CreditorAccount: string
    CreditorAccountType: string
    // CreditorAddress: string
    CreditorAgentBIC: string
    Amount: number
    Currency: string
    RemittanceInformation: string
}

export interface PaymentResponse {
    EndToEndId: string
    Status: PaymentStatus
    Reason?: string | null
    AdditionalInfo?: string | null
    AcceptanceDate?: string | Date | null
    TxId?: string | null
}

export type PaymentStatus =
    | "ACTC"
    | "RJCT"
    | "ACCP"
    | "ACSP"
    | "ACSC"
