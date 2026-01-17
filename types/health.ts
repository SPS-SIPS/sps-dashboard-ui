export type ComponentHealth = {
    name: string;
    status: string;
    endpointStatus: string;
    httpResult: string;
    lastChecked: string;
    errorMessage?: string;
};

export type HealthCheckResponse = {
    status: 'ok' | 'degraded' | 'error';
    components: ComponentHealth[];
};
