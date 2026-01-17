import React, { useState } from 'react';
import ActionButton from "../common/ActionButton/ActionButton";
import styles from './XmlViewerModal.module.css';
import { AiOutlineClose } from "react-icons/ai";

interface XmlViewerModalProps {
    content: string;
    title: string;
    onClose: () => void;
}

const XmlViewerModal: React.FC<XmlViewerModalProps> = ({ content, title, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content)
            .then(() => {
                setCopied(true); // show "Copied!" message
                setTimeout(() => setCopied(false), 2000);
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
            });
    };

    const formatXml = (xmlString: string) => {
        const PADDING = '  '; // 2-space indentation
        const reg = /(>)(<)(\/*)/g;
        let formatted = '';
        let pad = 0;

        xmlString = xmlString.replace(reg, '$1\r\n$2$3');
        xmlString.split('\r\n').forEach((node) => {
            let indent = 0;
            if (node.match(/.+<\/\w[^>]*>$/)) {
                indent = 0;
            } else if (node.match(/^<\/\w/)) {
                if (pad !== 0) pad -= 1;
            } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                indent = 1;
            } else {
                indent = 0;
            }

            formatted += PADDING.repeat(pad) + node + '\r\n';
            pad += indent;
        });

        return formatted.trim();
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h4>{title}</h4>
                    <div className={styles.modalActions}>
                        <ActionButton
                            onClick={handleCopy}
                            className={styles.copyButton}
                        >
                            Copy Message
                        </ActionButton>
                        {copied && <span className={styles.copiedText}>Copied!</span>}
                        <button
                            onClick={onClose}
                            className={styles.closeButton}
                        >
                            <AiOutlineClose size={24} />
                        </button>
                    </div>
                </div>
                <pre className={styles.xmlPreview}>
                    {formatXml(content)}
                </pre>
            </div>
        </div>
    );
};

export default XmlViewerModal;
