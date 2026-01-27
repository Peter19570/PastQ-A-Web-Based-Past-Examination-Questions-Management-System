import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const AdminRoute = () => {
  const { user, isAuthenticated } = useAuth();

  const isStaff = user?.is_admin || user?.is_moderator || user?.is_staff;

  if (!isAuthenticated || !isStaff) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
