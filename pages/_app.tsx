import React from "react";
import type {AppProps} from "next/app";
import "../styles/global.css";
import {AuthProvider} from "../auth/AuthProvider";
import {Layout} from "../component/Layout";
import Head from "next/head";

function MyApp({Component, pageProps}: AppProps) {
    return (
        <>
            <Head>
                <title>SPS Connect Platform</title>
                <link rel="icon" href="/icons/icon.png"/>
                <meta name="description" content="SPS Connect Platform facilitates seamless transactions between SIPS SVIP and local banking systems through secure ISO 20022 message translation and integration with local banking JSON APIs." />
            </Head>
            <AuthProvider>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </AuthProvider>
        </>
    );
}

export default MyApp;
