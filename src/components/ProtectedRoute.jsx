import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    if (!isLoggedIn) {
        // Redirect to home if not logged in
        // Ideally, we might want to pop up the login modal, but for routing security, redirect is safer.
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
