import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedAdminRoute = ({ children }) => {
    const { isLoggedIn, user, openLoginModal } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            openLoginModal();
        }
    }, [isLoggedIn, openLoginModal]); // Dependencies needed

    if (!isLoggedIn) {
        // Optionally render a loading spinner or just return null while the modal opens
        return <div className="text-center py-5">Please login as Admin...</div>;
        // Alternatively, redirect to home if you don't want to show the empty state
        // return <Navigate to="/" />; 
    }

    if (user?.role !== 'admin') {
        return <div className="text-center py-5 text-danger"><h3>Access Denied</h3><p>You do not have permission to view this page.</p></div>;
    }

    return children;
};

export default ProtectedAdminRoute;
