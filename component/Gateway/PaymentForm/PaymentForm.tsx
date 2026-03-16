import React, { useState } from "react"
import SelectInput from "../../common/SelectInput/SelectInput"
import Input from "../../common/Input/Input"
import ActionButton from "../../common/ActionButton/ActionButton"

import { bicOptionsDev, verificationMethods } from "../../../constants/gatewayFormOptions"
import { currencyOptionsByCode } from "../../../data/currencyOptions"

import styles from "./PaymentFormModal.module.css"
import {AiOutlineClose} from "react-icons/ai";

type PrefilledPaymentData = {
    CreditorName: string
    CreditorAccount: string
    CreditorAccountType: string
    CreditorAgentBIC: string

    ToBIC: string
    LocalInstrument: string
    CategoryPurpose: string
    EndToEndId: string
    CreditorIssuer: string

    Amount?: number
    Currency?: string
    RemittanceInformation?: string
}

type PaymentRequest = {
    ToBIC: string
    LocalInstrument: string
    CategoryPurpose: string
    EndToEndId: string
    CreditorIssuer: string

    CreditorName: string
    CreditorAccount: string
    CreditorAccountType: string
    CreditorAgentBIC: string

    Amount: number
    Currency: string
    RemittanceInformation: string

    DebtorName: string
    DebtorAccount: string
    DebtorAccountType: string
}

type Props = {
    data: PrefilledPaymentData
    onSubmit: (payload: PaymentRequest) => void
    onClose: () => void
}

export default function PaymentForm({ data, onSubmit, onClose }: Props) {

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [step, setStep] = useState(1)

    const [form, setForm] = useState({
        CreditorName: data.CreditorName,
        CreditorAccount: data.CreditorAccount,
        CreditorAccountType: data.CreditorAccountType,
        CreditorAgentBIC: data.CreditorAgentBIC,

        Amount: data.Amount ?? 0,
        Currency: data.Currency ?? "USD",
        RemittanceInformation: data.RemittanceInformation ?? "",

        DebtorName: "",
        DebtorAccount: "",
        DebtorAccountType: "IBAN"
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

        const { name, value } = e.target

        setForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const validateStep = (currentStep: number) => {
        const errors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!form.CreditorName || form.CreditorName.trim() === "") {
                errors.CreditorName = "Recipient name is required";
            }

            if (!form.CreditorAccount || form.CreditorAccount.trim() === "") {
                errors.CreditorAccount = "Recipient account is required";
            }

            if (!form.CreditorAgentBIC || form.CreditorAgentBIC.trim() === "") {
                errors.CreditorAgentBIC = "Bank is required";
            }

            if (!form.Amount || Number(form.Amount) <= 0) {
                errors.Amount = "Amount must be greater than 0";
            }

            if (!form.Currency || form.Currency.trim() === "") {
                errors.Currency = "Currency is required";
            }

            if (!form.RemittanceInformation || form.RemittanceInformation.trim() === "") {
                errors.RemittanceInformation = "Remittance information is required";
            }
        }

        if (currentStep === 2) {
            if (!form.DebtorName || form.DebtorName.trim() === "") {
                errors.DebtorName = "Your name is required";
            }

            if (!form.DebtorAccount || form.DebtorAccount.trim() === "") {
                errors.DebtorAccount = "Your account is required";
            }

            if (!form.DebtorAccountType || form.DebtorAccountType.trim() === "") {
                errors.DebtorAccountType = "Account type is required";
            }
        }

        return errors;
    };

    const nextStep = () => {

        const stepErrors = validateStep(1)

        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors)
            return
        }

        setErrors({})
        setStep(2)
    }

    const prevStep = () => setStep(1)

    const handleSubmit = (e: React.FormEvent) => {

        e.preventDefault()

        const stepErrors = validateStep(2)

        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors)
            return
        }

        setErrors({})

        const normalizedAmount = Number(form.Amount)

        const payload: PaymentRequest = {
            ...data,
            ...form,
            Amount: normalizedAmount
        } as PaymentRequest

        onSubmit(payload)
    }

    const amountDisabled = data.Amount !== undefined && data.Amount !== 0
    const currencyDisabled = data.Currency !== undefined && data.Currency !== ""
    const remittanceDisabled = data.RemittanceInformation !== undefined && data.RemittanceInformation !== ""

    return (

        <div className={styles.overlay}>

            <div className={styles.modal}>

                <div className={`${styles.header} ${styles.modalHeaderContainer}`}>
                    <div className={styles.headerText}>
                        <h2 className={styles.title}>Send Payment</h2>
                        <p className={styles.subtitle}>
                            Review recipient details and complete your payment
                        </p>
                    </div>

                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                    >
                        <AiOutlineClose size={20} />
                    </button>
                </div>

                <div className={styles.stepIndicator}>
                    Step {step} of 2
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>

                    {step === 1 && (

                        <div className={styles.section}>

                            <h3 className={styles.sectionTitle}>
                                Recipient Information
                            </h3>

                            <Input
                                label="Recipient Name"
                                name="CreditorName"
                                type="text"
                                value={form.CreditorName}
                                onChange={handleChange}
                                disabled
                                required
                            />

                            <Input
                                label="Recipient Account"
                                name="CreditorAccount"
                                type="text"
                                value={form.CreditorAccount}
                                onChange={handleChange}
                                disabled
                                required
                            />

                            <SelectInput
                                label="Account Type"
                                name="CreditorAccountType"
                                value={form.CreditorAccountType}
                                onChange={handleChange}
                                options={verificationMethods}
                                disabled
                                required
                            />

                            <SelectInput
                                label="Bank"
                                name="CreditorAgentBIC"
                                value={form.CreditorAgentBIC}
                                onChange={handleChange}
                                options={bicOptionsDev}
                                disabled
                                required
                            />

                            <Input
                                label="Amount"
                                name="Amount"
                                type="number"
                                value={String(form.Amount)}
                                onChange={handleChange}
                                disabled={amountDisabled}
                                errorMessage={errors.Amount}
                                required
                            />

                            <SelectInput
                                label="Currency"
                                name="Currency"
                                options={currencyOptionsByCode}
                                value={form.Currency}
                                onChange={handleChange}
                                disabled={currencyDisabled}
                                errorMessage={errors.Currency}
                                required
                            />

                            <Input
                                label="Remittance Information"
                                name="RemittanceInformation"
                                type="text"
                                value={form.RemittanceInformation}
                                onChange={handleChange}
                                disabled={remittanceDisabled}
                                errorMessage={errors.RemittanceInformation}
                                required
                            />

                                <ActionButton type="button" onClick={nextStep}  className={styles.continueButton} >
                                    Continue
                                </ActionButton>

                        </div>
                    )}

                    {step === 2 && (

                        <div className={styles.section}>

                            <h3 className={styles.sectionTitle}>
                                Your Account Details
                            </h3>

                            <Input
                                label="Your Name"
                                name="DebtorName"
                                type="text"
                                value={form.DebtorName}
                                onChange={handleChange}
                                errorMessage={errors.DebtorName}
                                required
                            />

                            <Input
                                label="Your Account"
                                name="DebtorAccount"
                                type="text"
                                value={form.DebtorAccount}
                                onChange={handleChange}
                                errorMessage={errors.DebtorAccount}
                                required
                            />

                            <SelectInput
                                label="Account Type"
                                name="DebtorAccountType"
                                value={form.DebtorAccountType}
                                onChange={handleChange}
                                options={verificationMethods}
                                required
                            />

                            <div className={styles.formActions}>
                                <ActionButton
                                    type="button"
                                    onClick={prevStep}
                                    className={styles.backButton}
                                >
                                    Back
                                </ActionButton>

                                <ActionButton
                                    type="submit"
                                    className={styles.submitButton}
                                >
                                    Send Payment
                                </ActionButton>
                            </div>

                        </div>
                    )}

                </form>

            </div>

        </div>
    )
}