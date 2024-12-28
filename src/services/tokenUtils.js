const TOKEN_KEY = 'jwtToken';

export const saveToken = (token) => {
    sessionStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
    return sessionStorage.getItem(TOKEN_KEY);
};

export const clearToken = () => {
    sessionStorage.removeItem(TOKEN_KEY);
};