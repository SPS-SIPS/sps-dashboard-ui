import styles from "../styles/docs.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ComponentPropsWithoutRef } from "react";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/(^-|-$)/g, "");

interface MarkdownRendererProps {
  markdown: string;
}

const MarkdownRenderer = ({ markdown }: MarkdownRendererProps) => {
  return (
    <div className={styles.container}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({
            children,
            ...props
          }: ComponentPropsWithoutRef<"h1">) => (
            <h1 id={slugify(String(children))} {...props}>
              {children}
            </h1>
          ),

          h2: ({
            children,
            ...props
          }: ComponentPropsWithoutRef<"h2">) => (
            <h2 id={slugify(String(children))} {...props}>
              {children}
            </h2>
          ),

          h3: ({
            children,
            ...props
          }: ComponentPropsWithoutRef<"h3">) => (
            <h3 id={slugify(String(children))} {...props}>
              {children}
            </h3>
          ),

          a: ({
            href,
            children,
            ...props
          }: ComponentPropsWithoutRef<"a">) => {
            if (href?.startsWith("#")) {
              return (
                <a
                  href={href}
                  {...props}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(href.slice(1))
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {children}
                </a>
              );
            }

            return (
              <a
                href={href}
                {...props}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
