import React, {useEffect, useState} from "react";
import useParticipants from "../api/hooks/useParticipants";
import {ParticipantStatus, IsParticipantLiveResult} from "../types/participants";
import SelectInput from "../component/common/SelectInput/SelectInput";
import AlertModal from "../component/common/AlertModal/AlertModal";
import styles from "../styles/ParticipantsDashboard.module.css";
import SpinLoading from "../component/Loading/SpinLoading/SpinLoading";

const ParticipantsDashboard = () => {
    const {getLiveParticipants, isParticipantLive, getAvailableParticipantBics} = useParticipants();

    const [participants, setParticipants] = useState<ParticipantStatus[]>([]);
    const [availableBics, setAvailableBics] = useState<string[]>([]);

    const [participantsLoading, setParticipantsLoading] = useState(false);
    const [participantsError, setParticipantsError] = useState<string | null>(null);

    const [bicsLoading, setBicsLoading] = useState(false);
    const [bicsError, setBicsError] = useState<string | null>(null);

    const [filterStatus, setFilterStatus] = useState<string>("");

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [modalError, setModalError] = useState(false);

    const fetchParticipants = async (isLive?: boolean) => {
        try {
            setParticipantsLoading(true);
            setParticipantsError(null);
            const data = await getLiveParticipants(isLive);
            setParticipants(data);
        } catch {
            setParticipantsError("Failed to load participants");
        } finally {
            setParticipantsLoading(false);
        }
    };

    const fetchBics = async () => {
        try {
            setBicsLoading(true);
            setBicsError(null);
            const bics = await getAvailableParticipantBics();
            setAvailableBics(bics);
        } catch {
            setBicsError("Failed to load available BICs");
        } finally {
            setBicsLoading(false);
        }
    };


    useEffect(() => {
        void fetchParticipants();
    }, []);

    const handleCheckLive = async (bic: string) => {
        try {
            const result: IsParticipantLiveResult = await isParticipantLive(bic);
            setModalTitle("Participant Status");
            setModalMessage(`${bic} is ${result.isLive ? "LIVE" : "DOWN"}`);
            setModalError(!result.isLive);
            setModalOpen(true);
        } catch {
            setModalTitle("Error");
            setModalMessage(`Failed to check live status for ${bic}`);
            setModalError(true);
            setModalOpen(true);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterStatus(e.target.value);
        if (e.target.value === "true") void fetchParticipants(true);
        else if (e.target.value === "false") void fetchParticipants(false);
        else void fetchParticipants();
    };

    return (
        <div className={styles.dashboard}>
            <h2 className={styles.title}>Participant Status</h2>

            <div className={styles.filterWrapper}>
                <SelectInput
                    label="Filter by status"
                    value={filterStatus}
                    onChange={handleFilterChange}
                    options={[
                        {value: "", label: "All"},
                        {value: "true", label: "Live"},
                        {value: "false", label: "Down"},
                    ]}
                    placeholder="-- Select Status --"
                />
            </div>

            {participantsLoading ? (
                <div className={styles.loadingWrapper}>
                    <SpinLoading/>
                    <p>Loading participants...</p>
                </div>
            ) : participantsError ? (
                <div className={styles.errorWrapper}>
                    <p className={styles.error}>{participantsError}</p>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead className={styles.tableHead}>
                        <tr>
                            <th>BIC</th>
                            <th>Name</th>
                            <th>Live</th>
                            <th>Last Checked</th>
                            <th>Status Changed</th>
                            <th>Failures</th>
                            <th>Successes</th>
                            <th>Last Error</th>
                            <th>Current Balance</th>
                            <th>Available Balance</th>
                            <th>Can Send</th>
                            <th>Min Send Balance</th>
                            <th>Action</th>
                        </tr>
                        </thead>

                        <tbody>
                        {participants.map((p) => (
                            <tr key={p.institutionBic} className={styles.tableRow}>
                                <td>{p.institutionBic}</td>
                                <td>{p.institutionName}</td>

                                <td>
                                 <span
                                     className={p.isLive ? styles.liveStatus : styles.downStatus}
                                 >
                                   {p.isLive ? "LIVE" : "DOWN"}
                                 </span>
                                </td>

                                <td>{new Date(p.lastCheckedAt).toLocaleString()}</td>
                                <td>{new Date(p.lastStatusChangeAt).toLocaleString()}</td>

                                <td>{p.consecutiveFailures}</td>
                                <td>{p.consecutiveSuccesses}</td>

                                <td>{p.lastError || "-"}</td>

                                <td>
                                    {p.currentBalance !== null && p.currentBalance !== undefined
                                        ? p.currentBalance.toLocaleString()
                                        : "-"}
                                </td>

                                <td>
                                    {p.availableBalance !== null && p.availableBalance !== undefined
                                        ? p.availableBalance.toLocaleString()
                                        : "-"}
                                </td>

                                <td>
                                      <span
                                          className={p.canSend ? styles.canSendYes : styles.canSendNo}
                                      >
                                        {p.canSend ? "YES" : "NO"}
                                      </span>
                                </td>

                                <td>
                                    {p.minimumSendBalance !== null && p.minimumSendBalance !== undefined
                                        ? p.minimumSendBalance.toLocaleString()
                                        : "-"}
                                </td>

                                <td>
                                    <button
                                        onClick={() => handleCheckLive(p.institutionBic)}
                                        className={styles.actionButton}
                                    >
                                        Check Status
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>

                    </table>
                </div>
            )}

            {/* Available BICs Section */}
            <div className={styles.bicsSection}>
                <h2 className={styles.sectionTitle}>Available Participant BICs</h2>
                <p className={styles.sectionSubtitle}>
                    Click the button below to fetch the list of participant BICs currently available.
                </p>

                <button onClick={fetchBics} className={styles.getBicsButton}>
                    Get Available BICs
                </button>

                {bicsLoading ? (
                    <div className={styles.loadingWrapper}>
                        <SpinLoading/>
                        <p>Loading participants...</p>
                    </div>
                ) : bicsError ? (
                    <div className={styles.errorWrapper}>
                        <p className={styles.error}>{bicsError}</p>
                    </div>
                ) : (
                    <div className={styles.bicsWrapper}>
                        {availableBics.length > 0 && (
                            <div className={styles.bicsList}>
                                <h3 className={styles.bicsTitle}>Fetched BICs</h3>
                                <ul className={styles.bicsItems}>
                                    {availableBics.map((bic) => (
                                        <li key={bic} className={styles.bicItem}>
                                            {bic}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>


            {/* Alert modal */}
            {modalOpen && (
                <AlertModal
                    title={modalTitle}
                    message={modalMessage}
                    error={modalError}
                    onConfirm={() => setModalOpen(false)}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ParticipantsDashboard;
