import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { useLogo } from "../providers/LogoProvider";
import { getPerfil } from "../../features/perfil/services/perfil.ts";
import { logout } from "../../features/auth/services/auth.ts";
import AuthErrorModal from "./AuthErrorModal";
import SmartImage from "./SmartImage";

export default function DashboardLayout() {
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const { logoUrl } = useLogo();
  const navigate = useNavigate();

  const sessionData = localStorage.getItem('dosimetria_session');
  const userData = sessionData ? JSON.parse(sessionData) : null;
  const userName = userData?.nombre || 'Usuario';
  const userApellido = userData?.apellido || '';
  const fullName = `${userName} ${userApellido}`.trim();
  const initials = `${userName.charAt(0).toUpperCase()}${userApellido.charAt(0).toUpperCase()}`.trim() || userName.charAt(0).toUpperCase();

  useEffect(() => {
    getPerfil()
      .then((data) => setFotoUrl(data.perfil.foto_url ?? null))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('dosimetria_session');
      navigate('/login');
    }
  };

  return (
    <div className="flex overflow-x-clip bg-background min-h-screen">
      {/* <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      /> */}

      <main className="flex-1 min-w-0 transition-all duration-300 ml-0">
        <nav className="flex p-3 sm:p-4 bg-sidebar dark:bg-background-secondary border-b border-border items-center gap-3 sm:gap-4 fixed top-0 left-0 right-0 z-40">
          <SmartImage
            src={logoUrl || ''}
            alt="Logo"
            className="w-8 h-8 bg-foreground/10 rounded-lg flex items-center justify-center shrink-0 p-1.5 dark:bg-background"
            imgClassName="w-full h-full object-contain"
          />
          <span className="font-semibold text-background dark:text-foreground truncate hidden min-[400px]:inline">
            Sistema de Dosimetría
          </span>

          {/* Datos del usuario logueado */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {fotoUrl ? (
                <img
                  src={fotoUrl.startsWith('http') ? fotoUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${fotoUrl}`}
                  alt={fullName}
                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white dark:text-foreground">{initials}</span>
                </div>
              )}
              <span className="text-sm font-medium text-background dark:text-foreground truncate max-w-24 min-[400px]:max-w-32 hidden min-[360px]:inline">
                {fullName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg shrink-0 cursor-pointer transition-colors duration-100 ease-out text-background dark:text-foreground hover:bg-sidebar-hover"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </nav>
        <div className="pt-20">
          <div className="p-8 max-w-[90rem] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
      <AuthErrorModal />
    </div>
  );
}