// pages/403.tsx
import React from "react";
import Head from "next/head";
import { FiAlertTriangle, FiLock } from "react-icons/fi";
import { useRouter } from "next/router";
import ActionButton from "../component/common/ActionButton/ActionButton";
import styles from "../styles/Unauthorized.module.css";

const ForbiddenPage = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>403 - Forbidden</title>
        <meta
          name="description"
          content="This page is only accessible in the development environment."
        />
      </Head>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.iconContainer}>
            <FiLock className={styles.lockIcon} />
            <FiAlertTriangle className={styles.alertIcon} />
          </div>

          <h1 className={styles.title}>403 — Forbidden</h1>

          <p className={styles.message}>
            This page can only be accessed in the <strong>development
            environment</strong>.
            <br />
            Please switch to the correct environment or contact your system
            administrator.
          </p>

          <div className={styles.buttonContainer}>
            <ActionButton onClick={() => router.push("/")} type="button">
              Return to Home
            </ActionButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForbiddenPage;
