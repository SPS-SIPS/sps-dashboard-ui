import React, { createContext, useContext, useEffect, useState } from "react";
import Keycloak from "keycloak-js";
import {AppConfig, getAppConfig} from "../utils/config";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  keycloak: Keycloak | null;
  login: () => void;
  logout: () => void;
  userName: string | null;
  authToken: string | null;
  roles: string[];
  config: AppConfig | null;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const KeycloakAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    const initKeycloak = async () => {
      const cfg = await getAppConfig();
      setConfig(cfg);

      const keycloakInstance = new Keycloak({
        url: cfg.keycloak.url,
        realm: cfg.keycloak.realm,
        clientId: cfg.keycloak.clientId,
      });

      try {
        const authenticated = await keycloakInstance.init({
          onLoad: "check-sso",
          checkLoginIframe: false,
          pkceMethod: 'S256',
          // silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
        });

        setIsAuthenticated(authenticated);
        setKeycloak(keycloakInstance);

        if (!authenticated) {
          await keycloakInstance.login();
        }

        if (authenticated) {
          const parsedToken = keycloakInstance.tokenParsed;
          setUserName(parsedToken?.name || null);
          setAuthToken(keycloakInstance.token || null);

          // const clientId = keycloakInstance.clientId;
          const clientRoles =
            parsedToken?.resource_access?.[
              process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!
            ]?.roles || [];
          const realmRoles = parsedToken?.realm_access?.roles || [];
          setRoles([...clientRoles, ...realmRoles]);
        }
      } catch (error) {
        console.error("Keycloak initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void initKeycloak();
  }, []);

  const login = () => keycloak?.login();
  const logout = () => keycloak?.logout();

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        keycloak,
        login,
        logout,
        userName,
        authToken,
        roles,
        config,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthentication = () => useContext(AuthContext);
