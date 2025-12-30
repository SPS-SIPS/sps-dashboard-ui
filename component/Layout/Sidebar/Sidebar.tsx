import React, {useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {
    FiHome,
    FiChevronRight,
    FiChevronDown,
    FiX, FiCreditCard, FiActivity, FiCpu,
} from 'react-icons/fi';

import styles from './Sidebar.module.css'
import {
    FaCogs, FaEnvelopeOpenText,
    FaFileAlt,
    FaLock,
    FaPlusCircle,
    FaQrcode,
    FaRocket,
    FaTools
} from "react-icons/fa";
import {useAuthentication} from "../../../auth/AuthProvider";
import {AiOutlineDatabase, AiOutlineDoubleLeft, AiOutlineDoubleRight, AiOutlineRadarChart} from "react-icons/ai";
import {FaCodeCompare} from "react-icons/fa6";
import {LuScanBarcode} from "react-icons/lu";

interface NavItem {
    title: string;
    path: string;
    icon: React.ReactNode;
    roles?: string[];
    items?: NavItem[];
}

interface SideNavProps {
    isOpen: boolean;
    onClose: () => void;
    isMobile: boolean;
}

const Sidebar: React.FC<SideNavProps> = ({isOpen, onClose, isMobile}) => {
    const router = useRouter();
    const {roles} = useAuthentication();
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    const activeProfile = process.env.NEXT_PUBLIC_ACTIVE_PROFILE;

    const navItems: NavItem[] = [
        {
            title: 'Dashboard',
            path: '/',
            icon: <FiHome className={styles.icon}/>,
            roles: ['transactions', 'iso_messages', 'configuration', 'som_qr', 'offline_access', 'gateway', "Admin", "recon"]
        },
        {
            title: 'Live Participants',
            path: '/participants',
            icon: <AiOutlineRadarChart className={styles.icon}/>,
        },
        {
            title: 'Documentation',
            path: '/docs',
            icon: <FaFileAlt className={styles.icon}/>,
            roles: ['transactions', 'iso_messages', 'configuration', 'som_qr', 'offline_access', 'gateway', "Admin", "recon"],
            items: [
                {
                    title: 'Getting Started',
                    path: '/docs/getting-started',
                    icon: <FiChevronRight className={styles.icon}/>,
                    roles: ['transactions', 'iso_messages', 'configuration', 'som_qr', 'offline_access', 'gateway', "Admin", "recon"],
                },
                {
                    title: 'Certificate Generation & Validation',
                    path: '/docs/pki',
                    icon: <FiChevronRight className={styles.icon}/>,
                    roles: ['transactions', 'iso_messages', 'configuration', 'som_qr', 'offline_access', 'gateway', "Admin", "recon"],
                },
                {
                    title: 'Data Protection Key Security Guide',
                    path: '/docs/data-protection-keys',
                    icon: <FiChevronRight className={styles.icon}/>,
                    roles: ['transactions', 'iso_messages', 'configuration', 'som_qr', 'offline_access', 'gateway', "Admin", "recon"],
                },
                {
                    title: 'Test Cases & Security Test Scenarios',
                    path: '/docs/test-cases',
                    icon: <FiChevronRight className={styles.icon}/>,
                    roles: ['transactions', 'iso_messages', 'configuration', 'som_qr', 'offline_access', 'gateway', "Admin", "recon"],
                }, {
                    title: 'Test Scripts',
                    path: '/docs/TestScripts/',
                    icon: <FaCodeCompare className={styles.icon}/>,
                    items: [
                        {
                            title: 'Overview',
                            path: '/docs/testScripts/getting-started',
                            icon: <FiChevronRight className={styles.icon}/>
                        },
                        {
                            title: 'Quick Start Guide',
                            path: '/docs/testScripts/quick-start',
                            icon: <FiChevronRight className={styles.icon}/>
                        },
                        {
                            title: 'Automated Testing',
                            path: '/docs/testScripts/automated-testing',
                            icon: <FiChevronRight className={styles.icon}/>,
                        },
                        {
                            title: 'JSON Payloads',
                            path: '/docs/testScripts/JSON-payloads',
                            icon: <FiChevronRight className={styles.icon}/>,
                        },
                        {
                            title: 'Payload Update',
                            path: '/docs/testScripts/payload-update',
                            icon: <FiChevronRight className={styles.icon}/>,
                        },
                        {
                            title: 'Quick Reference',
                            path: '/docs/testScripts/quick-reference',
                            icon: <FiChevronRight className={styles.icon}/>,
                        },
                        {
                            title: 'Test Runner Guide',
                            path: '/docs/testScripts/test-runner-guide',
                            icon: <FiChevronRight className={styles.icon}/>,
                        },
                        {
                            title: 'Test Scenarios',
                            path: '/docs/testScripts/test-scenarios',
                            icon: <FiChevronRight className={styles.icon}/>,
                        },
                        {
                            title: 'Troubleshooting',
                            path: '/docs/testScripts/troubleshooting',
                            icon: <FiChevronRight className={styles.icon}/>,
                        },
                    ],
                },
            ],
        },
        {
            title: 'Configurations',
            path: '/config',
            icon: <FaCogs className={styles.icon}/>,
            roles: ['configuration'],
            items: [
                {
                    title: 'API Adapters',
                    path: '/config/endpoint',
                    icon: <FiChevronRight className={styles.icon}/>
                },
                {
                    title: 'API Keys',
                    path: '/config/apiKeys',
                    icon: <FiChevronRight className={styles.icon}/>,
                },
                {
                    title: 'Core',
                    path: '/config/core',
                    icon: <FiChevronRight className={styles.icon}/>,
                },
                {
                    title: 'EMV',
                    path: '/config/emv',
                    icon: <FiChevronRight className={styles.icon}/>,
                },
                {
                    title: 'Hosts',
                    path: '/config/hosts',
                    icon: <FiChevronRight className={styles.icon}/>,
                },
                {
                    title: 'ISO 20022',
                    path: '/config/iso20022',
                    icon: <FiChevronRight className={styles.icon}/>,
                },
                {
                    title: 'Origins',
                    path: '/config/origins',
                    icon: <FiChevronRight className={styles.icon}/>,
                },
                {
                    title: 'XAdES',
                    path: '/config/xades',
                    icon: <FiChevronRight className={styles.icon}/>,
                },
            ],
        },
        {
            title: 'Secret Management',
            path: '/admin/secrets',
            icon: <FaLock className={styles.icon}/>,
            roles: ['Admin'],
            items: [
                {
                    title: 'Encrypt / Decrypt Secret',
                    path: '/admin/secrets/single',
                    icon: <FiChevronRight className={styles.icon}/>,
                },
                {
                    title: 'Encrypt / Decrypt All Secrets',
                    path: '/admin/secrets/all',
                    icon: <FiChevronRight className={styles.icon}/>,
                },
                {
                    title: 'View Secret',
                    path: '/admin/secrets/get',
                    icon: <FiChevronRight className={styles.icon}/>,
                },
            ],
        },
        {
            title: 'Transactions',
            path: '/transactions',
            icon: <FiCreditCard className={styles.icon}/>,
            roles: ['transactions']
        },
        {
            title: 'ISO Messages',
            path: '/iso-messages',
            icon: <FaEnvelopeOpenText className={styles.icon}/>,
            roles: ['iso_messages']
        },
        ...(activeProfile !== 'prod' ? [{
            title: 'API Tester',
            path: '/api-tester',
            icon: <FaRocket className={styles.icon}/>,
            roles: ['gateway'],
            items: [
                {
                    title: 'Verify Receiver',
                    path: '/api-tester/verify',
                    icon: <FiChevronRight className={styles.icon}/>
                },
                {
                    title: 'Send Payment',
                    path: '/api-tester/payment',
                    icon: <FiChevronRight className={styles.icon}/>
                }
            ],
        }] : []),
        {
            title: 'SOMQR',
            path: '/qr-codes',
            icon: <FaQrcode className={styles.icon}/>,
            roles: ['som_qr'],
            items: [
                {
                    title: 'Generate SOMQR',
                    path: '/qr-codes/generate',
                    icon: <FaPlusCircle className={styles.icon}/>,
                    items: [
                        {
                            title: 'Merchant QR',
                            path: '/qr-codes/generate/merchant',
                            icon: <FiChevronRight className={styles.icon}/>
                        },
                        {
                            title: 'Person QR',
                            path: '/qr-codes/generate/personal',
                            icon: <FiChevronRight className={styles.icon}/>
                        }
                    ],
                },
                {
                    title: 'Scan SOMQR',
                    path: '/qr-codes/parse',
                    icon: <LuScanBarcode className={styles.icon}/>,
                    items: [
                        {
                            title: 'Merchant QR',
                            path: '/qr-codes/parse/merchant',
                            icon: <FiChevronRight className={styles.icon}/>
                        },
                        {
                            title: 'Person QR',
                            path: '/qr-codes/parse/personal',
                            icon: <FiChevronRight className={styles.icon}/>
                        }
                    ],
                }
            ],
        },
        {
            title: 'Request Builder',
            path: '/request-builder',
            icon: <FaTools className={styles.icon}/>,
            roles: ['gateway'],
        },
        {
            title: 'System Health',
            path: '/health',
            icon: <FiActivity className={styles.icon}/>,
        }
    ];

    const toggleExpand = (title: string) => {
        setExpandedItems((prev) => ({...prev, [title]: !prev[title]}));
    };

    const isActive = (path: string) => {
        return router.pathname === path || router.pathname.startsWith(`${path}/`);
    };

    const handleItemClick = (path: string) => {
        void router.replace(path);
        if (isMobile) onClose();
    };

    const renderNavItem = (item: NavItem, depth = 0) => {
        const hasChildren = item.items && item.items.length > 0;
        const isExpanded = expandedItems[item.title];

        if (item.roles && !item.roles.some(role => roles.includes(role))) {
            return null;
        }
        return (
            <>

                <div key={item.path} className={styles.navItemContainer}>
                    <div
                        className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                        style={{paddingLeft: `${1 + depth}rem`}}
                        onClick={() => hasChildren ? toggleExpand(item.title) : handleItemClick(item.path)}
                    >

                        <span className={styles.iconWrapper}>{item.icon}</span>
                        <span className={styles.navText}>{item.title}</span>
                        {hasChildren && (

                            <span className={styles.chevron}>
                            
              {isExpanded ? <FiChevronDown/> : <FiChevronRight/>}
            </span>
                        )}
                    </div>

                    {hasChildren && isExpanded && (
                        <>

                            <div className={styles.subItems}>
                                {item.items?.map(subItem => renderNavItem(subItem, depth + 1))}
                            </div>
                        </>
                    )}
                </div>
            </>
        );
    };

    function handleToggle() {
        onClose();
    }

    return (
        <nav className={styles.navigationContainer}>
            <div className={`${styles.sideNav} ${isOpen ? styles.open : styles.closed}`}>

                {isMobile && (
                    <div className={styles.mobileHeader}>

                        <div className={styles.logoContainer}>
                            <Link href="/" passHref>
                                <span className={styles.logo}>SPS</span>
                            </Link>
                        </div>
                        <button
                            className={styles.closeButton}
                            onClick={onClose}
                            aria-label="Close menu"
                        >
                            <FiX size={24}/>
                        </button>
                    </div>
                )}
                <div className={styles.navItems}>
                    {navItems.map(item => renderNavItem(item))}
                </div>
                {/* For non-mobile devices the toggleButton is rendered within the sidebar */}
                {!isMobile && isOpen && (
                    <>
                        <div className={styles.productBadge}>
                            <FiCpu className={styles.badgeIcon} />
                            <div className={styles.badgeText}>
                                <span className={styles.brandName}>Shaam</span>
                                <span className={styles.versionTag}>v1.0.4-stable</span>
                            </div>
                        </div>
                        <div
                            className={`${styles.toggleButton} ${isOpen ? styles.openButton : ''}`}
                            aria-label="Toggle sidebar"
                            onClick={handleToggle}
                        >

                            <AiOutlineDoubleLeft/>
                        </div>
                    </>
                )}
            </div>
            {/* When sidebar is closed, the toggleButton is rendered separately */}
            {!isMobile && !isOpen && (
                <>
                    <div
                        className={`${styles.toggleButton} ${!isOpen ? styles.closedButton : ''}`}
                        aria-label="Toggle sidebar"
                        onClick={handleToggle}
                    >
                        {/* <h1 className='text-white'>SH v1</h1> */}
                        <AiOutlineDoubleRight/>
                    </div>
                </>
            )}
        </nav>
    );
};

export default Sidebar;
