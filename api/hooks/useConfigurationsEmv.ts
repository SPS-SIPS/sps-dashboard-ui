import useAxiosPrivate from "./useAxiosPrivate";

export type Acquirer = {
    id: string;
    name: string;
    bic: string;
};

export type ConfigurationsEmv = {
    acquirerId: string;
    fiType: string;
    fiName: string;
    version: string;
    countryCode: string;
    tags: {
        merchantIdentifier: string;
        acquirerTag: string;
        merchantIdTag: string;
    };
    acquirers?: Acquirer[] | null;
};

const BASE_URL = "api/v1/Configurations/Emv";

const useConfigurationsEmv = () => {
    const axiosPrivate = useAxiosPrivate();

    const getConfigurations = async (): Promise<ConfigurationsEmv> => {
        try {
            const response = await axiosPrivate.get<ConfigurationsEmv>(BASE_URL);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const updateConfigurations = async (
        data: ConfigurationsEmv
    ): Promise<string> => {
        try {
            const response = await axiosPrivate.put<string>(BASE_URL, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    return {
        getConfigurations,
        updateConfigurations,
    };
};

export default useConfigurationsEmv;
