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

export async function getAppConfig(): Promise<AppConfig> {
    if (cachedConfig) return cachedConfig;

    let config: AppConfig;

    const res = await fetch("/api/config");
    const json = await res.json();
    config = json.data;

    if (!isAppConfig(config)) {
        throw new Error("Invalid or missing config");
    }

    cachedConfig = config;
    return config;
}
