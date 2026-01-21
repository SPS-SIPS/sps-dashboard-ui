import React, { createContext, useContext, useEffect, useState } from "react";
import Keycloak from "keycloak-js";
import {getAppConfig} from "../utils/config";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  keycloak: Keycloak | null;
  login: () => void;
  logout: () => void;
  userName: string | null;
  authToken: string | null;
  roles: string[];
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

  useEffect(() => {
    const initKeycloak = async () => {
      const config = getAppConfig();
      const keycloakInstance = new Keycloak({
        url: config.keycloak.url,
        realm: config.keycloak.realm,
        clientId: config.keycloak.clientId,
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthentication = () => useContext(AuthContext);
