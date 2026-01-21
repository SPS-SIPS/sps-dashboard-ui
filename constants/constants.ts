import {getAppConfig} from "../utils/config";
const config = getAppConfig();

export const baseURL = config.api.baseUrl;
