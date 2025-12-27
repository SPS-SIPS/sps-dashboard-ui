import React, {useState} from "react";
import styles from "./TransactionStatus.module.css";
import {APIError, APIResponse} from "../../types/types";
import {AiOutlineClose} from "react-icons/ai";

interface Props {
    open: boolean;
    loading: boolean;
    response: APIResponse | null;
    error: APIError | null;
    onClose: () => void;
}

const TransactionStatusModal: React.FC<Props> = ({
                                                     open,
                                                     loading,
                                                     response,
                                                     error,
                                                     onClose,
                                                 }) => {
    if (!open) return null;
    const data = (response?.data ?? null) as any;
    const fields = [
        {label: "Local ID", value: data?.localId},
        {label: "Reason", value: data?.reason},
        {label: "Additional Info", value: data?.additionalInfo},
        {label: "Acceptance Date", value: data?.acceptanceDate},
        {label: "Transaction ID", value: data?.transactionId},
        {label: "Transaction Status", value: data?.status},
    ];
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(response ? JSON.stringify(response.data, null, 2) : "")
            .then(() => {
                setCopied(true); // show "Copied!" message
                setTimeout(() => setCopied(false), 2000);
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
            });
    };

    return (
        <div
            className="fixed inset-0 z-9999 backdrop-blur-[6px] bg-[rgba(15_23_42/0.73)] flex items-center justify-center p-3">
            <div
                className="  bg-[#f5f8fa]
    rounded-xl
    w-full max-w-187.5 max-h-[90vh]
    flex flex-col
   shadow-[0_8px_16px_rgba(0_0_0/0.2)]
    border border-[#e2e8f0]
    overflow-hidden
    animate-[slideIn_0.3s_ease-out] 
    px-4 pt-4
             "
            >
                <div className="flex justify-between items-center">
                    <h1 className=" text-xl font-bold mr-4">Transaction Status</h1>
                    <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 bg-green-600 text-white
                            rounded-md text-sm font-medium shadow-sm
                             hover:bg-green-700 focus:outline-none 
                             focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                             -mr-4
                             
                             "
                    >
                        Copy Response
                    </button>
                    {copied && <span className={styles.copiedText}>Copied!</span>}
                    <button
                        onClick={onClose}
                        className=" w-9 h-9
    rounded-full
    bg-white
    border border-slate-300
    flex items-center justify-center
    cursor-pointer
    text-slate-500
    transition-all duration-200
    hover:text-red-300 hover:border-amber-300 hover:rotate-90
    "
                        aria-label="Close modal"
                    >
                        <AiOutlineClose size={24}/>
                    </button>
                </div>

                <div className="p-xl overflow-y-auto mt-4 mb-4 flex-1">
                    <div className="flex flex-col gap-6">
                        {loading ? (
                            <div>Loading...</div>
                        ) : error ? (
                            <div className={styles.error}>
                                {error.message ?? "An error occurred"}
                            </div>
                        ) : (
                            <div className="border-b border-b-[#f5f8fa] pb-3">
                                <h4 className={styles.sectionTitle}>
                                    {data?.status ?? "No status"}
                                </h4>

                                <div className={styles.fieldGrid}>
                                    {fields.map((field) => {
                                        if (
                                            field.value === undefined ||
                                            field.value === null ||
                                            field.value === ""
                                        )
                                            return null;
                                        return (
                                            <div key={field.label} className={styles.fieldRow}>
                                                <span className={styles.fieldLabel}>{field.label}</span>
                                                <span className={styles.fieldValue}>{field.value}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionStatusModal;
