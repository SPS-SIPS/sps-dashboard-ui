import React from 'react';
import styles from './DashboardCard.module.css';

interface DashboardCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    colorVar?: string;
    isRawColor?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({title, value, description, icon, colorVar, isRawColor}) => {
    const cardStyle = colorVar
        ? {backgroundColor: isRawColor ? colorVar : `var(${colorVar})`}
        : {};

    return (
        <div className={styles.dashboardCard} style={cardStyle}>
            <div className={styles.cardHeader}>
                {icon && <div className={styles.cardIcon}>{icon}</div>}
                <h3 className={styles.cardTitle}>{title}</h3>
            </div>
            <div className={styles.cardContent}>
                <p className={styles.cardValue}>{value}</p>
                {description && <p className={styles.cardDescription}>{description}</p>}
            </div>
        </div>
    );
};

export default DashboardCard;