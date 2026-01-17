import React, {useState} from 'react';
import useSecretManagement, {
    EncryptAllResponse,
    DecryptAllResponse
} from "../../../api/hooks/useSecretManagement";
import styles from '../../../styles/Single.module.css';
import ActionButton from "../../../component/common/ActionButton/ActionButton";
import RoleGuard from "../../../auth/RoleGuard";

type Service = 'encrypt-all' | 'decrypt-all';

const All: React.FC = () => {
    const {encryptAll, decryptAll} = useSecretManagement();

    const [service, setService] = useState<Service>('encrypt-all');
    const [result, setResult] = useState<EncryptAllResponse | DecryptAllResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError(null);
        setResult(null);
        setLoading(true);

        try {
            const response =
                service === 'encrypt-all'
                    ? await encryptAll()
                    : await decryptAll();

            setResult(response);
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleServiceChange = (newService: Service) => {
        setService(newService);
        setResult(null);
        setError(null);
    };

    return (
        <RoleGuard allowedRoles={['Admin']}>
            <div className={styles.container}>
                <h2>Bulk Secret Management</h2>

                {/* Instructions */}
                <div className={styles.instructions}>
                    <h3>How this works:</h3>
                    <ul>
                        <li><strong>Encrypt All</strong> will encrypt all plaintext secrets
                            in <code>appsettings.json</code>.
                        </li>
                        <li><strong>Decrypt All</strong> will decrypt all encrypted secrets for debugging purposes.</li>
                        <li>A backup file will be created automatically.</li>
                        <li><strong>Application restart is required</strong> after encryption.</li>
                        <li className={styles.warning}>
                            ⚠️ Decrypting secrets exposes sensitive data. Use with extreme caution.
                        </li>
                    </ul>
                </div>

                {/* Service Selector */}
                <div className={styles.serviceSelector}>
                    <label>
                        <input
                            type="radio"
                            name="service"
                            checked={service === 'encrypt-all'}
                            onChange={() => handleServiceChange('encrypt-all')}
                        />
                        Encrypt All Secrets
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="service"
                            checked={service === 'decrypt-all'}
                            onChange={() => handleServiceChange('decrypt-all')}
                        />
                        Decrypt All Secrets
                    </label>
                </div>

                {/* Action Button */}
                <div className={styles.buttons}>
                    <ActionButton onClick={handleSubmit} disabled={loading}>
                        {loading
                            ? service === 'encrypt-all'
                                ? 'Encrypting...'
                                : 'Decrypting...'
                            : service === 'encrypt-all'
                                ? 'Encrypt All'
                                : 'Decrypt All'}
                    </ActionButton>
                </div>

                {/* Error */}
                {error && <div className={styles.error}>{error}</div>}

                {/* Result */}
                {result && (
                    <div className={styles.result}>
                        <div>
                            <strong>Status:</strong> {result.success ? 'Success' : 'Failed'}
                        </div>

                        <div>
                            <strong>Message:</strong> {result.message}
                        </div>

                        {'encryptedKeys' in result && result.encryptedKeys && (
                            <div>
                                <strong>Affected Keys:</strong>
                                <ul>
                                    {result.encryptedKeys.map((key) => (
                                        <li key={key}>{key}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result.backupPath && (
                            <div>
                                <strong>Backup Path:</strong> {result.backupPath}
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

export default All;
