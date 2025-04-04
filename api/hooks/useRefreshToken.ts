const useRefreshToken = () => {
    // For now, return the hardcoded mock token
    const refresh = async () => {
        return "mock_api_key_12345:mock_api_secret_67890";
    };

    return { refresh };
};

export default useRefreshToken;