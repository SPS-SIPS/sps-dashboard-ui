import styles from '../../styles/Status.module.css';
import ApiRequestTester from "../../component/ApiRequestTester/ApiRequestTester";

const Status= () => {

    return (
        <div className={styles.container}>
            <ApiRequestTester
                title={"API Status Request Tester "}
                placeholder={"https://example.com/api/v1/Gateway/Status"}
                selectedRequest={"StatusRequest"}
            />
        </div>
    );
};

export default Status;