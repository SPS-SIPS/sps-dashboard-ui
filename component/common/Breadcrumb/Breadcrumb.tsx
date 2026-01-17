import React from "react";
import styles from "./Breadcrumb.module.css";
import Link from "next/link";
import {FiChevronRight} from "react-icons/fi";

interface Breadcrumb {
    label: string;
    link: string;
}

interface BreadcrumbProps {
    breadcrumbs: Breadcrumb[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({breadcrumbs}) => {
    return (
        <nav className={styles.breadcrumb}>
            {breadcrumbs.map((breadcrumb, index) => (
                <span key={index} className={styles.breadcrumbItem}>
                        <Link href={breadcrumb.link} className={styles.breadcrumbLink}>
                            {breadcrumb.label}
                        </Link>
                    {index < breadcrumbs.length - 1 && (
                        <FiChevronRight className={styles.separatorIcon} />
                    )}
                    </span>
            ))}
        </nav>
    )
}
export default Breadcrumb;