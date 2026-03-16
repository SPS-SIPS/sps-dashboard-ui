import {SomQRMerchantData, SomQRPersonData, VerificationInternalResponse} from "../types/somqr";

export type QRValidationStep = {
    step: string;
    passed: boolean;
    message: string;
};

export type QRValidationResult = {
    type: "personal" | "merchant";
    steps: QRValidationStep[];
};

/* ==============================
   PERSONAL QR BASIC VALIDATION
================================ */
export const validatePersonalQrBasic = (
    data: SomQRPersonData,
): QRValidationResult => {
    const steps: QRValidationStep[] = [];

    /* Payload format indicator */
    const payloadCheck = data.payloadFormatIndicator === "02";
    steps.push({
        step: "Payload Format Indicator",
        passed: payloadCheck,
        message: payloadCheck
            ? "Valid payload format indicator."
            : "Invalid payload format indicator."
    });

    /* Scheme Identifier */
    const schemeCheck = ["01", "02"].includes(data.schemeIdentifier);
    steps.push({
        step: "Scheme Identifier",
        passed: schemeCheck,
        message: schemeCheck
            ? "Valid scheme identifier."
            : "Invalid scheme identifier."
    });

    // 3. accountNumber must be valid IBAN
    const accountCheck = data.accountNumber !== undefined && data.accountNumber.length >= 23;
    steps.push({
        step: "Account Number Validity",
        passed: accountCheck,
        message: accountCheck ? "Valid IBAN." : "Invalid IBAN in QR."
    });

    /* Account Name */
    const nameCheck = !!data.accountName;

    steps.push({
        step: "Account Name",
        passed: nameCheck,
        message: nameCheck
            ? "Account name present."
            : "Account name missing."
    });


    /* Static vs Dynamic QR Rules */
    if (data.pointOfInitializationMethod === "11") {
        const amountCheck =
            data.amount === null ||
            data.amount === 0;

        const particularsCheck = !data.particulars;

        steps.push({
            step: "Static Amount Check",
            passed: amountCheck,
            message: amountCheck ? "Static amount is valid." : "Static amount must be 0 or null."
        });

        steps.push({
            step: "Static Particulars Check",
            passed: particularsCheck,
            message: particularsCheck ? "Particulars are valid." : "Particulars must be null for static QR."
        });

    } else if (data.pointOfInitializationMethod === "12") {
        const amountCheck =
            data.amount !== null &&
            data.amount !== 0;

        const particularsCheck = !!data.particulars;

        steps.push({
            step: "Dynamic Amount Check",
            passed: amountCheck,
            message: amountCheck ? "Dynamic amount is valid." : "Dynamic amount must be provided and non-zero."
        });

        steps.push({
            step: "Dynamic Particulars Check",
            passed: particularsCheck,
            message: particularsCheck ? "Particulars are provided." : "Particulars must be provided for dynamic amount."
        });
    }
    /* CRC */
    const crcCheck =
        !!data.crc &&
        data.crc.length === 4;

    steps.push({
        step: "CRC",
        passed: crcCheck,
        message: crcCheck
            ? "CRC present."
            : "CRC missing or invalid."
    });

    return {
        type: "personal",
        steps: steps
    };
}

/* ==============================
   PERSONAL QR WITH VERIFICATION
================================ */
export const validatePersonalQRWithVerification = (
    data: SomQRPersonData,
    verificationResponse?: VerificationInternalResponse
): QRValidationResult => {

    const steps: QRValidationStep[] = [];

    if (!verificationResponse) {
        return {
            type: "personal",
            steps
        };
    }

    const verified = verificationResponse.IsVerified === true;

    steps.push({
        step: "Gateway Verification",
        passed: verified,
        message: verified
            ? "Account verified successfully."
            : `Gateway verification failed (${verificationResponse.Reason ?? "Unknown reason"}).`
    });

    if (!verified) {
        return {
            type: "personal",
            steps
        };
    }

    const accountMatch =
        verificationResponse.AccountNo != null &&
        data.accountNumber === verificationResponse.AccountNo;

    steps.push({
        step: "Account Number Match",
        passed: accountMatch,
        message: accountMatch
            ? "Account number matches verification."
            : "Account number mismatch."
    });

    /* Name match */

    const nameMatch =
        verificationResponse.Name != null &&
        data.accountName === verificationResponse.Name;

    steps.push({
        step: "Account Name Match",
        passed: nameMatch,
        message: nameMatch
            ? "Account name matches verification."
            : "Account name mismatch."
    });

    return {
        type: "personal",
        steps
    };
};

/* ==============================
   MERCHANT QR BASIC VALIDATION
================================ */
export const validateMerchantQrBasic = (
    data: SomQRMerchantData,
): QRValidationResult => {
    const steps: QRValidationStep[] = [];

    // 1. Payload Format Indicator must be "01"
    const payloadCheck =
        data.payloadFormatIndicator === "01";

    steps.push({
        step: "Payload Format Indicator",
        passed: payloadCheck,
        message: payloadCheck
            ? "Valid payload format."
            : "Invalid payload format."
    });

    /* Initialization Method */
    const initCheck =
        ["11", "12"].includes(
            data.pointOfInitializationMethod
        );

    steps.push({
        step: "Initialization Method",
        passed: initCheck,
        message: initCheck
            ? "Valid initialization method."
            : "Invalid initialization method."
    });

    /* Merchant account existence */

    const merchantAccountCheck =
        !!data.merchantAccount &&
        Object.keys(data.merchantAccount).length > 0;

    steps.push({
        step: "Merchant Account",
        passed: merchantAccountCheck,
        message: merchantAccountCheck
            ? "Merchant account information present."
            : "Merchant account missing."
    });

    /* Global Unique Identifier (SIPS) */

    let guiValid = false;

    Object.values(data.merchantAccount || {})
        .forEach(acc => {

            if (acc.globalUniqueIdentifier === "so.somqr.sips") {
                guiValid = true;
            }

        });

    steps.push({
        step: "Global Unique Identifier",
        passed: guiValid,
        message: guiValid
            ? "Valid SIPS identifier (so.somqr.sips)."
            : "Invalid or missing Global Unique Identifier."
    });

    /* Merchant ID (tag 44) */

    let merchantIdExists = false;

    Object.values(data.merchantAccount || {})
        .forEach(acc => {

            if (acc.paymentNetworkSpecific?.["44"]) {
                merchantIdExists = true;
            }

        });

    steps.push({
        step: "Merchant ID",
        passed: merchantIdExists,
        message: merchantIdExists
            ? "Merchant ID present."
            : "Merchant ID missing."
    });

    /* Acquirer ID (Tag 01 inside Tag 26) */

    let acquirerIdExists = false;

    Object.values(data.merchantAccount || {})
        .forEach(acc => {

            if (acc.paymentNetworkSpecific?.["1"]) {
                acquirerIdExists = true;
            }

        });

    steps.push({
        step: "Acquirer ID",
        passed: acquirerIdExists,
        message: acquirerIdExists
            ? "Acquirer ID present."
            : "Acquirer ID missing."
    });

    const mccCheck =
        data.merchantCategoryCode !== undefined &&
        data.merchantCategoryCode !== null;

    steps.push({
        step: "Merchant Category Code",
        passed: mccCheck,
        message: mccCheck
            ? "Merchant Category Code present."
            : "Merchant Category Code missing."
    });

    /* Country code */

    const countryCheck =
        data.countyCode === "SO";

    steps.push({
        step: "Country Code",
        passed: countryCheck,
        message: countryCheck
            ? "Country code valid."
            : "Country code invalid."
    });

    /* Merchant name */

    const merchantNameCheck =
        !!data.merchantName;

    steps.push({
        step: "Merchant Name",
        passed: merchantNameCheck,
        message: merchantNameCheck
            ? "Merchant name present."
            : "Merchant name missing."
    });


    /* Merchant city */

    const merchantCityCheck =
        !!data.merchantCity;

    steps.push({
        step: "Merchant City",
        passed: merchantCityCheck,
        message: merchantCityCheck
            ? "Merchant city present."
            : "Merchant city missing."
    });

    /* Transaction Amount Rules */
    if (data.pointOfInitializationMethod === "11") {

        const staticAmountCheck =
            data.transactionAmount === null ||
            data.transactionAmount === undefined;

        steps.push({
            step: "Static QR Amount",
            passed: staticAmountCheck,
            message: staticAmountCheck
                ? "Static QR does not contain amount."
                : "Static QR must not include transaction amount."
        });

        // const staticCurrencyCheck =
        //     data.transactionCurrency === 0 ||
        //     data.transactionCurrency === null ||
        //     data.transactionCurrency === undefined;
        //
        // steps.push({
        //     step: "Static QR Currency",
        //     passed: staticCurrencyCheck,
        //     message: staticCurrencyCheck
        //         ? "Static QR currency is valid (empty or 0)."
        //         : "Static QR must not include a currency."
        // });

    }else if (data.pointOfInitializationMethod === "12") {

        const dynamicAmountCheck =
            data.transactionAmount !== null &&
            data.transactionAmount !== undefined &&
            data.transactionAmount > 0;

        steps.push({
            step: "Dynamic QR Amount",
            passed: dynamicAmountCheck,
            message: dynamicAmountCheck
                ? "Dynamic QR contains valid amount."
                : "Dynamic QR must include a valid transaction amount."
        });

        const dynamicCurrencyCheck =
            data.transactionCurrency === 840;

        steps.push({
            step: "Dynamic QR Currency",
            passed: dynamicCurrencyCheck,
            message: dynamicCurrencyCheck
                ? "Dynamic QR currency is USD (840)."
                : "Dynamic QR must use USD currency code 840."
        });
    }

    /* CRC */
    const crcCheck =
        !!data.crc &&
        data.crc.length === 4;

    steps.push({
        step: "CRC",
        passed: crcCheck,
        message: crcCheck
            ? "CRC present."
            : "CRC missing or invalid."
    });

    return {
        type: "merchant",
        steps
    };
}

/* ==============================
   MERCHANT QR WITH VERIFICATION
================================ */
export const validateMerchantQRWithVerification = (
    data: SomQRMerchantData,
    verificationResponse?: VerificationInternalResponse
): QRValidationResult => {

    const steps: QRValidationStep[] = [];

    if (!verificationResponse) {
        return {
            type: "merchant",
            steps
        };
    }

    /* Gateway verification */

    const verified =
        verificationResponse.IsVerified === true;

    steps.push({
        step: "Gateway Verification",
        passed: verified,
        message: verified
            ? "Merchant verified successfully."
            : `Gateway verification failed (${verificationResponse.Reason ?? "Unknown reason"}).`
    });

    if (!verified) {
        return {
            type: "merchant",
            steps
        };
    }

    /* Merchant ID */
    // let merchantId: string | undefined;
    //
    // Object.values(data.merchantAccount || {})
    //     .forEach(acc => {
    //
    //         const id =
    //             acc.paymentNetworkSpecific?.["44"];
    //
    //         if (id) merchantId = id;
    //
    //     });
    //
    // const idMatch =
    //     verificationResponse.AccountNo
    //         ? merchantId === verificationResponse.AccountNo
    //         : true;
    //
    // steps.push({
    //     step: "Merchant ID Match",
    //     passed: idMatch,
    //     message: idMatch
    //         ? "Merchant ID matches verification."
    //         : "Merchant ID mismatch."
    // });


    /* Merchant name */

    const nameMatch =
        verificationResponse.Name
            ? data.merchantName === verificationResponse.Name
            : true;

    steps.push({
        step: "Merchant Name Match",
        passed: nameMatch,
        message: nameMatch
            ? "Merchant name matches verification."
            : "Merchant name mismatch."
    });

    return {
        type: "merchant",
        steps
    };
};