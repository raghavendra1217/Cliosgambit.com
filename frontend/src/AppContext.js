import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; // We need to install this!

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        console.log('AppContext: Token changed, current token:', token ? 'exists' : 'null');
        try {
            if (token) {
                console.log('AppContext: Decoding token...');
                const decoded = jwtDecode(token);
                console.log('AppContext: Token decoded successfully:', decoded);
                
                // Check if the token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    console.log('AppContext: Token expired, logging out');
                    logout();
                } else {
                    console.log('AppContext: Setting user from token:', decoded.user);
                    setUser(decoded.user);
                }
            } else {
                console.log('AppContext: No token, user should be null');
                setUser(null);
            }
        } catch (error) {
            console.error("AppContext: Error decoding token:", error);
            logout(); // Clear bad token
        } finally {
            setIsAuthLoading(false);
        }
    }, [token]);
    
    const login = (newToken) => {
        console.log('AppContext: Login called with token:', newToken ? 'exists' : 'null');
        localStorage.setItem('token', newToken);
        setToken(newToken);
        console.log('AppContext: Token saved to localStorage and state');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        token,
        user,
        isAuthLoading,
        isAuthenticated: !!user,
        login,
        logout,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook to easily use the context
export const useAuth = () => {
    return useContext(AppContext);
};