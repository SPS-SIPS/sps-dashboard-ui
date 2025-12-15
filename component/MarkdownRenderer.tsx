import styles from "../styles/docs.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
    markdown: string;
}

const MarkdownRenderer = ({ markdown }: MarkdownRendererProps) => {
    return (
        <div className={styles.container}>
            {/* <-- Add remarkGfm here --> */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
