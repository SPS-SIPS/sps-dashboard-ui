import React, { useState } from 'react';
import useSecretManagement, { GetSecretResponse } from "../../../api/hooks/useSecretManagement";
import Input from "../../../component/common/Input/Input";
import ActionButton from "../../../component/common/ActionButton/ActionButton";
import styles from '../../../styles/Single.module.css';
import RoleGuard from "../../../auth/RoleGuard";

const All: React.FC = () => {
    const { getSecret } = useSecretManagement();

    const [key, setKey] = useState('');
    const [result, setResult] = useState<GetSecretResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError(null);
        setResult(null);
        setLoading(true);

        try {
            const response = await getSecret(key);
            setResult(response);
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to retrieve secret');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyChange = (value: string) => {
        setKey(value);
        setResult(null);
        setError(null);
    };

    const isButtonDisabled = loading || !key.trim();

    return (
       <RoleGuard allowedRoles={['Admin']}>
           <div className={styles.container}>
               <h2>Get Secret</h2>

               {/* Instructions */}
               <div className={styles.instructions}>
                   <h3>How this works:</h3>
                   <ul>
                       <li>Enter the full secret key path (e.g. <code>ConnectionStrings:Default</code>).</li>
                       <li>The secret will be returned <strong>decrypted</strong>.</li>
                       <li>The system will also tell you if the stored value was encrypted.</li>
                       <li className={styles.warning}>
                           ⚠️ This operation exposes sensitive data. Use only when necessary.
                       </li>
                   </ul>
               </div>

               {/* Input */}
               <Input
                   label="Secret Key"
                   value={key}
                   onChange={(e) => handleKeyChange(e.target.value)}
                   type="text"
                   required
                   placeholder="e.g. ConnectionStrings:Default"
               />

               {/* Action Button */}
               <div className={styles.buttons}>
                   <ActionButton onClick={handleSubmit} disabled={isButtonDisabled}>
                       {loading ? 'Retrieving...' : 'Get Secret'}
                   </ActionButton>
               </div>

               {/* Error */}
               {error && <div className={styles.error}>{error}</div>}

               {/* Result */}
               {result && (
                   <div className={styles.result}>
                       <div>
                           <strong>Key:</strong> {result.key}
                       </div>

                       <div>
                           <strong>Value:</strong>
                           <div className={styles.resultValue}>
                               {result.value}
                           </div>
                       </div>

                       <div>
                           <strong>Encrypted in storage:</strong> {result.isEncrypted ? 'Yes' : 'No'}
                       </div>

                       {result.warning && (
                           <div className={styles.warning}>
                               <strong>Warning:</strong> {result.warning}
                           </div>
                       )}
                   </div>
               )}
           </div>
       </RoleGuard>
    );
};

export default All;
