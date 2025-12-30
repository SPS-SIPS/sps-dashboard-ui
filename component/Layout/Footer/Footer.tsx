import React from 'react';
import styles from './Footer.module.css';
import Image from "next/image";
import Link from "next/link";
import {FacebookIcon, GitHubIcon, TwitterIcon, YouTubeIcon} from "../../../public/icons/SocialIcons";
import {EmailIcon, LocationIcon, PhoneIcon} from "../../../public/icons/ContactIcons.js";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
       <footer className={styles.footer}>
    <div className={styles.footerBottom}>
        <p>© {currentYear} Somali Payment Switch. All rights reserved.</p>
    </div>
</footer>
    );
};

export default Footer;