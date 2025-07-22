import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AppContext';
import { Spinner, Center } from '@chakra-ui/react';

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, user, isAuthLoading } = useAuth();

    if (isAuthLoading) {
        // Show a loading spinner while checking auth status
        return (
            <Center h="100vh">
                <Spinner size="xl" />
            </Center>
        );
    }
    
    // 1. Check if user is authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2. Check if the user has one of the allowed roles
    // Admin users have full access to everything
    const isAdmin = user && user.role === 'admin';
    const hasRequiredRole = user && (isAdmin || allowedRoles.includes(user.role));

    if (hasRequiredRole) {
        return <Outlet />; // User has access, render the child route
    } else {
        // User is logged in but doesn't have permission
        // You can redirect to a dedicated "Unauthorized" page or back to home
        return <Navigate to="/" replace />;
    }
};

export default ProtectedRoute;