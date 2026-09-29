import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { Building2, LogOut, Sun, Moon } from "lucide-react";
import { useLogo } from "../providers/LogoProvider";
import { PerfilProvider, usePerfil } from "../providers/PerfilProvider";
import { useTheme } from "../providers/ThemeProvider";
import { usePrecision } from "../providers/PrecisionProvider";
import { logout } from "../../features/auth/services/auth.ts";
import AuthErrorModal from "./AuthErrorModal";
import SmartImage from "./SmartImage";
import AlertasDropdown from "../../features/alertas/components/AlertasDropdown";

export default function DashboardLayout() {
  return (
    <PerfilProvider>
      <DashboardLayoutContent />
    </PerfilProvider>
  );
}

function DashboardLayoutContent() {
  const { perfil } = usePerfil();
  const fotoUrl = perfil?.foto_url ?? null;
  const [fotoError, setFotoError] = useState(false);
  const { logoUrl } = useLogo();
  const { theme, setTheme } = useTheme();
  const { aproximar, toggleAproximar } = usePrecision();
  const navigate = useNavigate();

  useEffect(() => {
    setFotoError(false);
  }, [fotoUrl]);

  const sessionData = localStorage.getItem('dosimetria_session');
  const userData = sessionData ? JSON.parse(sessionData) : null;
  const userName = userData?.nombre || 'Usuario';
  const userApellido = userData?.apellido || '';
  const fullName = `${userName} ${userApellido}`.trim();
  const initials = `${userName.charAt(0).toUpperCase()}${userApellido.charAt(0).toUpperCase()}`.trim() || userName.charAt(0).toUpperCase();

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
            fallback={<Building2 size={16} className="text-background dark:text-foreground" />}
          />
          <span className="font-semibold text-background dark:text-foreground truncate hidden min-[400px]:inline">
            Sistema de Dosimetría
          </span>

          {/* Datos del usuario logueado */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {fotoUrl && !fotoError ? (
                <img
                  src={fotoUrl.startsWith('http') ? fotoUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${fotoUrl}`}
                  alt={fullName}
                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                  onError={() => setFotoError(true)}
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
            <AlertasDropdown />
            <button
              onClick={toggleAproximar}
              className="px-2 py-1.5 rounded-lg shrink-0 cursor-pointer transition-colors duration-100 ease-out text-xs font-semibold border text-background dark:text-foreground border-background/40 hover:bg-sidebar-hover"
              title={aproximar ? 'Mostrar valores exactos' : 'Aproximar a 5 decimales'}
            >
              {aproximar ? 'Modo: Aproximado' : 'Modo: Exacto'}
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg shrink-0 cursor-pointer transition-colors duration-100 ease-out text-background dark:text-foreground hover:bg-sidebar-hover"
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
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