import React, {useState} from 'react';
import useSecretManagement, {EncryptDecryptResponse} from '../../../api/hooks/useSecretManagement';
import Input from "../../../component/common/Input/Input";
import ActionButton from "../../../component/common/ActionButton/ActionButton";
import RoleGuard from "../../../auth/RoleGuard";
import styles from '../../../styles/Single.module.css';

const Single: React.FC = () => {
    const {encryptValue, decryptValue} = useSecretManagement();

    const [service, setService] = useState<'encrypt' | 'decrypt'>('encrypt');
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [result, setResult] = useState<EncryptDecryptResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError(null);
        setResult(null);
        setLoading(true);

        try {
            const response =
                service === 'encrypt'
                    ? await encryptValue({key, value})
                    : await decryptValue({key, value});

            setResult(response);
        } catch (err: any) {
            setError(
                err?.response?.data?.error ||
                `${service === 'encrypt' ? 'Encryption' : 'Decryption'} failed`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleServiceChange = (newService: 'encrypt' | 'decrypt') => {
        setService(newService);
        setValue('');
        setResult(null);
        setError(null);
    };

    const isButtonDisabled = loading || !key.trim() || !value.trim();

    return (
        <RoleGuard allowedRoles={['Admin']}>
            <div className={styles.container}>
                <h2>Secret Management</h2>

                {/* Instructions */}
                <div className={styles.instructions}>
                    <h3>How to use this tool:</h3>
                    <ul>
                        <li>Select whether you want to <strong>Encrypt</strong> or <strong>Decrypt</strong> a secret.
                        </li>
                        <li>Enter a <strong>Secret Key</strong> used in your configuration (e.g., appsettings.json).
                        </li>
                        <li>Enter the <strong>Secret Value</strong>.</li>
                        <li>Click the action button to process the secret.</li>
                        <li><strong>Warning:</strong> Decrypted values are sensitive.</li>
                    </ul>
                </div>

                {/* Service Selector */}
                <div className={styles.serviceSelector}>
                    <label>
                        <input
                            type="radio"
                            name="service"
                            checked={service === 'encrypt'}
                            onChange={() => handleServiceChange('encrypt')}
                        />
                        Encrypt
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="service"
                            checked={service === 'decrypt'}
                            onChange={() => handleServiceChange('decrypt')}
                        />
                        Decrypt
                    </label>
                </div>

                {/* Inputs */}
                <Input
                    label="Secret Key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    type="text"
                    required
                    placeholder="Enter secret key"
                />

                <Input
                    label="Secret Value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    type="text"
                    required
                    placeholder={`Enter value to ${service}`}
                />

                {/* Action Button */}
                <div className={styles.buttons}>
                    <ActionButton onClick={handleSubmit} disabled={isButtonDisabled}>
                        {loading
                            ? service === 'encrypt'
                                ? 'Encrypting...'
                                : 'Decrypting...'
                            : service === 'encrypt'
                                ? 'Encrypt'
                                : 'Decrypt'}
                    </ActionButton>
                </div>

                {/* Error */}
                {error && <div className={styles.error}>{error}</div>}

                {/* Result */}
                {result && (
                    <div className={styles.result}>
                        {result.encrypted && (
                            <div>
                                <strong>Encrypted:</strong> {result.encrypted}
                            </div>
                        )}
                        {result.decrypted && (
                            <div>
                                <strong>Decrypted:</strong> {result.decrypted}
                            </div>
                        )}
                        {result.message && (
                            <div>
                                <strong>Message:</strong> {result.message}
                            </div>
                        )}
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

export default Single;
