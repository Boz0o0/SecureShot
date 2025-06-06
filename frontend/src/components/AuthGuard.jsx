import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';

const AuthGuard = ({ children }) => {
  const { user, loading } = useSupabase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthGuard;