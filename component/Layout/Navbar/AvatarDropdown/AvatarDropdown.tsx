import React, {useEffect, useRef, useState} from 'react';
import {FiChevronDown, FiLogOut, FiSettings, FiUser} from 'react-icons/fi';
import styles from '../Navbar.module.css';
import {useAuthentication} from "../../../../auth/AuthProvider";
import {useRouter} from "next/router";
import ConfigUpdateModal from "../../../ConfigUpdateModal/ConfigUpdateModal";
import {getAppConfig} from "../../../../utils/config";

interface AvatarDropdownProps {
    firstName: string;
}

export const AvatarDropdown: React.FC<AvatarDropdownProps> = ({firstName}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const {logout} = useAuthentication();
    const config = getAppConfig();

    const initialValues = {
        baseUrl: config.api.baseUrl,
        keycloakUrl: config.keycloak.url,
        keycloakRealm: config.keycloak.realm,
        keycloakClientId: config.keycloak.clientId,
        profile: config.profile,
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const goToProfile = () => {
        void router.push('/profile');
    };

    const getFirstLetter = (name: string) => name.charAt(0).toUpperCase();
    const getDisplayName = (name: string) => name.length > 10 ? `${name.substring(0, 8)}...` : name;

    return (
        <div className={styles.avatarDropdown} ref={dropdownRef}>
            <button
                className={styles.avatarButton}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-label="User menu"
            >
                <div className={styles.avatar}>
                    {getFirstLetter(firstName)}
                </div>
                <span className={styles.userName} title={firstName}>
          {getDisplayName(firstName)}
        </span>
                <FiChevronDown className={`${styles.chevron} ${isDropdownOpen ? styles.rotated : ''}`}/>
            </button>

            {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                    <button className={styles.dropdownItem} onClick={goToProfile}>
                        <FiUser className={styles.dropdownIcon}/>
                        <span>Profile</span>
                    </button>
                    <button
                        className={styles.dropdownItem}
                        onClick={() => {
                            setShowConfigModal(true);
                            setIsDropdownOpen(false);
                        }}
                    >
                        <FiSettings className={styles.dropdownIcon} />
                        <span>Integration Config</span>
                    </button>
                    <button className={styles.dropdownItem} onClick={logout}>
                        <FiLogOut className={styles.dropdownIcon}/>
                        <span>Logout</span>
                    </button>
                </div>
            )}

            {showConfigModal && (
                <ConfigUpdateModal
                    popup={true}
                    initialValues={initialValues}
                    showCloseButton={true}
                    onClose={() => setShowConfigModal(false)}
                />
            )}
        </div>
    );
};