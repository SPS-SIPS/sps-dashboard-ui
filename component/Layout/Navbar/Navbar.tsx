import React, { useState, useRef, useEffect } from 'react';
import styles from './Navbar.module.css';
import Image from 'next/image';
import { AvatarDropdown } from "./AvatarDropdown/AvatarDropdown";
import Link from "next/link";
import { FiMenu } from 'react-icons/fi';
import {useAuthentication} from "../../../auth/AuthProvider";
import SystemHealthIndicator from '../../SystemHealth/SystemHealthIndicator';
import ParticipantLiveIndicator from '../../LiveParticipants/ParticipantLiveIndicator';

interface NavbarProps {
    onMenuToggle: () => void;
    isMobile: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({onMenuToggle, isMobile }) => {
    const { userName } = useAuthentication();
    const [, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (
        <header className={styles.navbar}>
            <div className={styles.leftSection}>
                {/* Mobile Burger Menu - Only shows on mobile */}
                {isMobile && (
                    <button
                        className={styles.menuButton}
                        onClick={onMenuToggle}
                        aria-label="Toggle menu"
                    >
                        <FiMenu size={24} />
                    </button>
                )}

                <Link href="/" passHref>
                    <div className={styles.logoContainer}>
                        <Image
                            src="/images/logo-footer-01.svg"
                            alt="SPS Logo"
                            width={120}
                            height={40}
                            className={styles.logo}
                            priority
                        />
                    </div>
                </Link>
            </div>

            <div className={`${styles.rightSection} relative flex items-center gap-4`}>
                <ParticipantLiveIndicator />
               <SystemHealthIndicator />
                <AvatarDropdown firstName={userName!} />
               
            </div>
        </header>
    );
};