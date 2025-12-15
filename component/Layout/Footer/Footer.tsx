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
            <div className={styles.footerContent}>
                <div className={styles.brandSection}>
                    <div className={styles.logo}>
                        <Link href="/" passHref aria-label="Go to homepage">
                            <Image src={"/images/logo-footer-01.svg"} alt="Somali Payment Switch Logo" width={200} height={40} />
                        </Link>
                    </div>
                    <p className={styles.tagline}>Powering Somalia&apos;s Digital Payments</p>
                    <div className={styles.socialLinks}>
                        <a href="https://www.facebook.com/SPSwitch247/" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                            <FacebookIcon className={styles.socialIcon} />
                        </a>
                        <a href="https://x.com/SPSwitch247" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                            <TwitterIcon className={styles.socialIcon} />
                        </a>
                        <a href="https://www.youtube.com/@centralbankofsomalia9572" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                            <YouTubeIcon className={styles.socialIcon} />
                        </a>
                        <a href="https://github.com/SPS-SIPS" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                            <GitHubIcon className={styles.socialIcon} />
                        </a>
                    </div>
                </div>

                <div className={styles.linkColumns}>
                    <div className={styles.linkColumn}>
                        <h4>Services</h4>
                        <ul>
                            <li><a href="https://sps.so/sips/" target="_blank" rel="noopener noreferrer">SIPS</a></li>
                            <li><a href="https://support.sps.so/" target="_blank" rel="noopener noreferrer">Support</a></li>
                            <li><a href="https://sps.so/frequently-asked-questions/" target="_blank" rel="noopener noreferrer">FAQ</a></li>
                        </ul>
                    </div>
                    <div className={styles.linkColumn}>
                        <h4>Company</h4>
                        <ul>
                            <li><a href="https://sps.so/about-us/" target="_blank" rel="noopener noreferrer">About</a></li>
                            <li><a href="https://sps.so/contact-us/" target="_blank" rel="noopener noreferrer">Contact</a></li>
                            <li><a href="https://sps.so/blog/" target="_blank" rel="noopener noreferrer">News & Updates</a></li>
                        </ul>
                    </div>
                    <div className={styles.linkColumn}>
                        <h4>Contact</h4>
                        <ul className={styles.contactList}>
                            <li>
                                <LocationIcon className={styles.contactIcon} />
                                SPS Offices, CBS HQ, 55 Corso Somalia, Mogadishu, Somalia
                            </li>
                            <li>
                                <PhoneIcon className={styles.contactIcon} />
                                <a href="tel:+252612363891">+252 61 236 3891</a>
                            </li>
                            <li>
                                <EmailIcon className={styles.contactIcon} />
                                <a href="mailto:info@sps.so">info@sps.so</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <p>© {currentYear} Somali Payment Switch. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;