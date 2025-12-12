import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from './services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {

                    await authAPI.validateToken();
                    setUser(JSON.parse(savedUser));
                } catch (error) {
                    console.error('Token validation failed:', error);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (login, password) => {
        try {
            const response = await authAPI.login(login, password);

            localStorage.setItem('authToken', response.token);
            const userData = {
                userId: response.userId,
                username: response.username,
                authority: response.authority,
            };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: error.response?.data || 'Login failed. Please check your credentials.'
            };
        }
    };

    const register = async (username, login, password) => {
        try {
            const response = await authAPI.register(username, login, password);

            localStorage.setItem('authToken', response.token);
            const userData = {
                userId: response.userId,
                username: response.username,
                authority: response.authority,
            };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (error) {
            console.error('Registration failed:', error);
            return {
                success: false,
                error: error.response?.data || 'Registration failed. Please try again.'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};