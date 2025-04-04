import React, {createContext, useState, useContext, ReactNode, useEffect} from 'react';
import BubbleLoading from "../component/Loading/BubbleLoading/BubbleLoading";

interface AuthContextType {
    authToken: string | null;
    setAuthToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
    authToken: null,
    setAuthToken: () => {},
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({children}: AuthProviderProps) => {
    const [authToken, setAuthTokenState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const setAuthToken = (token: string | null) => {
        setAuthTokenState(token);
    };


    useEffect(() => {
        let isMounted = true;

        const refreshToken = async () => {
            try {
                // const response = await axios.post('/api/v1/auth/refresh-token', {}, {
                //     withCredentials: true
                // });
                if (isMounted) {
                    const newAccessToken = "mock_api_key_12345:mock_api_secret_67890";
                    setAuthToken(newAccessToken);
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                if (isMounted) {
                    setAuthToken(null,);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        refreshToken();

        return () => {
            isMounted = false;
        };
    }, []);

    if (isLoading) {
        return <BubbleLoading/>;
    }


    return (
        <AuthContext.Provider value={{authToken, setAuthToken}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthentication = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthentication must be used within an AuthProvider');
    }
    return context;
};