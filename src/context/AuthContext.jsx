import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const isLoggedIn = !!user;
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Check if user is logged in (verify token)
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await api.get('/auth/me');
                    setUser(data);
                } catch (error) {
                    console.error('Auth Check Failed:', error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const register = async (userData) => {
        try {
            const { data } = await api.post('/auth/register', userData);
            localStorage.setItem('token', data.token);
            setUser(data.user || data); // Adjust based on backend response structure
            return { success: true, message: 'Registration successful!' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed.'
            };
        }
    };

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setUser(data); // Backend returns { _id, name, email, token, ... }
            return { success: true, message: 'Login successful!' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Invalid email or password.'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateUser = (userData) => {
        // Optimistic UI update, ideal would be to have an API endpoint for this
        setUser(prev => ({ ...prev, ...userData }));
    };

    const openLoginModal = () => setShowLoginModal(true);
    const closeLoginModal = () => setShowLoginModal(false);

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            user,
            loading,
            login,
            register,
            logout,
            updateUser,
            showLoginModal,
            openLoginModal,
            closeLoginModal
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

