import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
  // Verificar sesión en localStorage (JSON con datos del usuario)
  const sessionData = localStorage.getItem('dosimetria_session');
  const isAuthenticated = !!sessionData; // Si existe algo, está autenticado

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}