import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PageLoader } from "../Common/Loader";

interface ProtectedRouteProps {
  children?: React.ReactNode; // Made optional to support Layout/Outlet style
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // 1. Handle the "White Flash" check
  if (loading) {
    return <PageLoader />;
  }

  // 2. Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Redirect if admin role is missing
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. If children exist (Wrapper style), render them.
  // Otherwise, render the Outlet (Layout style).
  return children ? <>{children}</> : <Outlet />;
};
