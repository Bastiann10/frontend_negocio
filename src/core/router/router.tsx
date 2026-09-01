import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";

const PublicLayout = lazy(() => import("../components/PublicLayout"));
const DashboardLayout = lazy(() => import("../components/DashboardLayout"));
const ProtectedRoute = lazy(() => import("../router/ProtectedRoutes"));

const LoginPage = lazy(() => import("../../features/auth/views/login"));
const InicioPage = lazy(() => import("../../features/auth/views/Inicio"));
const PerfilPage = lazy(() => import("../../features/perfil/views/Perfil"));
const EntidadesPage = lazy(() => import("../../features/entidades/views/ListaEntidad"));
const AreasPage = lazy(() => import("../../features/areas/views/Areas"));
const AlertasPage = lazy(() => import("../../features/alertas/views/Alertas"));
const AsignacionesPage = lazy(() => import("../../features/asignaciones/views/Asignaciones"));

const withSuspense = (element: React.ReactElement) => (
  <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
    {element}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: withSuspense(<PublicLayout />),
    children: [
      { path: "/", element: withSuspense(<LoginPage />) },
      { path: "/login", element: withSuspense(<LoginPage />) },
    ],
  },
  {
    element: withSuspense(<ProtectedRoute />),
    children: [
      {
        element: withSuspense(<DashboardLayout />),
        children: [
          { path: "/inicio", element: withSuspense(<InicioPage />) },
          { path: "/perfil", element: withSuspense(<PerfilPage />) },
          { path: "/entidades", element: withSuspense(<EntidadesPage />) },
          { path: "/areas", element: withSuspense(<AreasPage />) },
          { path: "/alertas", element: withSuspense(<AlertasPage />) },
          { path: "/asignaciones", element: withSuspense(<AsignacionesPage />) },
        ],
      },
    ],
  },
]);
