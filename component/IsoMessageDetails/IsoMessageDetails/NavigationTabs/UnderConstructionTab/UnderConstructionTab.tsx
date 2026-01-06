import React from "react";
import styles from "./UnderConstructionTab.module.css";

interface UnderConstructionTabProps {
    title: string;
}

const UnderConstructionTab: React.FC<UnderConstructionTabProps> = ({ title }) => {
    return (
        <div className={styles.container}>
            <h4 className={styles.heading}>{title}</h4>
            <p className={styles.message}>This section is currently under construction.</p>
        </div>
    );
};

export default UnderConstructionTab;
