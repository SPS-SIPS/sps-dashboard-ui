import useAxiosPrivate from "./useAxiosPrivate";

export type ConfigurationsXade = {
  certificatePath: string;
  privateKeyPath: string;
  privateKeyPassphrase: string;
  chainPath: string;
  algorithms: string[];
  verificationWindowMinutes: number;
  baseDN: string;
  bic: string;
  withoutPKI: boolean;
};

const BASE_URL = "api/v1/Configurations/Xades";

const useConfigurationsXade = () => {
  const axiosPrivate = useAxiosPrivate();

  const getConfigurations = async (): Promise<ConfigurationsXade> => {
    try {
      const response = await axiosPrivate.get<ConfigurationsXade>(BASE_URL);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateConfigurations = async (
    data: ConfigurationsXade
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

export default useConfigurationsXade;
