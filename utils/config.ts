import db from "../db.json";

export type AppConfig = {
    api: {
        baseUrl: string;
    };
    keycloak: {
        url: string;
        realm: string;
        clientId: string;
    };
    profile: string;
    uiGuards: {
        forceFormCompletion: boolean;
        setupConfirmed: boolean;
    };
};

function isAppConfig(value: unknown): value is AppConfig {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as any).api?.baseUrl === "string" &&
        typeof (value as any).keycloak?.url === "string" &&
        typeof (value as any).keycloak?.realm === "string" &&
        typeof (value as any).keycloak?.clientId === "string" &&
        ["dev", "test", "prod"].includes((value as any).profile) &&
        typeof (value as any).uiGuards?.forceFormCompletion === "boolean" &&
        typeof (value as any).uiGuards?.setupConfirmed === "boolean"
    );
}

let cachedConfig: AppConfig | null = null;

export function getAppConfig(): AppConfig {
    if (cachedConfig !== null) {
        return cachedConfig;
    }

    const config: AppConfig = db.config;

    if (!isAppConfig(config)) {
        throw new Error("Invalid or missing config in db.json");
    }

    cachedConfig = config;
    return config;
}
