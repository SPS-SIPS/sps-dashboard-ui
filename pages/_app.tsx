import React from "react";
import type {AppProps} from "next/app";
import "../styles/global.css";
import {KeycloakAuthProvider} from "../auth/AuthProvider";
import {Layout} from "../component/Layout";
import Head from "next/head";
import {useRouter} from "next/router";
import ProtectedAuthRoute from "../component/common/ProtectedAuthRoute";
import ProtectedRoute from "../component/common/ProtectedRoute";
import {getAppConfig} from "../utils/config";
import ConfigUpdateModal from "../component/ConfigUpdateModal/ConfigUpdateModal";

function MyApp({Component, pageProps}: AppProps) {
    const router = useRouter();
    const config = getAppConfig();
    const isAuthRoute = router.pathname.startsWith("/auth");
    const isSetupRoute = router.pathname.endsWith("/setup-config");
    const forceConfigUpdate = config.uiGuards.forceFormCompletion;

    return (
        <>
            <Head>
                <title>SPS Connect Platform</title>
                <link rel="icon" href="/icons/icon.png"/>
                <meta name="description" content="SPS Connect Platform..."/>
            </Head>
            <>
                {isSetupRoute ? (
                    <Component {...pageProps} />
                ) : forceConfigUpdate ? (
                    <ConfigUpdateModal popup={true}/>
                ) : (
                    <KeycloakAuthProvider>
                        {isAuthRoute ? (
                            <ProtectedAuthRoute>
                                <Component {...pageProps} />
                            </ProtectedAuthRoute>
                        ) : (
                            <ProtectedRoute>
                                <Layout>
                                    <Component {...pageProps} />
                                </Layout>
                            </ProtectedRoute>
                        )}
                    </KeycloakAuthProvider>
                )}
            </>
        </>
    );
}

export default MyApp;