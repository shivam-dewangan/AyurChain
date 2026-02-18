import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authAPI } from "@/api/client";

const ProtectedRoute = ({ children, allowedRole }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (!authAPI.isAuthenticated()) {
        setLoading(false);
        return;
      }

      const result = await authAPI.getCurrentUser();
      if (result.success) {
        setUser(result.data.user);
      } else {
        authAPI.logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authAPI.logout();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;