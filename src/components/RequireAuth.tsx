import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types/auth";

export function RequireAuth({ allowedRoles }: { allowedRoles?: Role[] }) {
  const { user, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles?.length && !hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
