import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from './ui';
import type { Role } from '../types';

/**
 * Gate for authenticated routes.
 *
 * This is a UX guard, not a security boundary - every protected endpoint is
 * independently authorised on the server. Blocking here only saves the user a
 * pointless round trip to a page they cannot use.
 */
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for the refresh attempt to settle, otherwise a reload on a protected
  // page would bounce the user to /login before their session is restored.
  if (loading) return <Spinner label="Checking your session" />;

  if (!user) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
