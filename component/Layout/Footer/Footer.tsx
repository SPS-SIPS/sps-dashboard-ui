import { FaHeart } from "react-icons/fa";
import styles from "./Footer.module.css";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.footerBottom}>
                <p>© {currentYear} Somali Payment Switch. All rights reserved.</p>
                <p className={styles.developedBy}>
                    Developed with <FaHeart className={styles.heartIcon} /> by SPS Team
                </p>
            </div>
        </footer>
    );
};

export default Footer;
