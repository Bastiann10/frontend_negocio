import { Link, useNavigate, useLocation } from 'react-router';
import { Home, LogOut, Sun, Moon, Monitor, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { useLogo } from '../providers/LogoProvider';
import { logout } from '../../features/auth/services/auth.ts';
import SmartImage from './SmartImage';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const menuItems = [
  { to: '/inicio', icon: Home, label: 'Inicio' },
];

export default function Sidebar({ isOpen = false, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { logoUrl } = useLogo();
  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const sessionData = localStorage.getItem('dosimetria_session');
  const userData = sessionData ? JSON.parse(sessionData) : null;
  const userName = userData?.nombre || 'Usuario';
  const userApellido = userData?.apellido || '';

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
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 max-[1200px]:block min-[1201px]:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-0 z-50 h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } min-[1201px]:translate-x-0 bg-sidebar dark:bg-background-secondary text-background dark:text-foreground overflow-hidden`}>
        <div className="p-4 border-b border-border bg-background">
          <div className="flex items-center gap-4">
            {logoUrl && (
              <SmartImage
                src={logoUrl}
                alt="Logo"
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 p-1.5 dark:bg-background"
                imgClassName="w-full h-full object-contain"
              />
            )}
            {!isCollapsed && (
              <div className="flex-1 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white dark:text-foreground">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-foreground text-sm font-medium">{userName} {userApellido}</p>
                  <p className="text-foreground-secondary text-xs">{currentDate}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`py-2 px-4 border-b border-border ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`p-2 rounded-lg transition-colors duration-100 ease-out cursor-pointer ${theme === 'light' ? 'bg-sidebar-hover' : 'hover:bg-sidebar-hover'}`}
              title="Modo claro"
            >
              <Sun size={18} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-2 rounded-lg transition-colors duration-100 ease-out cursor-pointer ${theme === 'dark' ? 'bg-sidebar-hover' : 'hover:bg-sidebar-hover'}`}
              title="Modo oscuro"
            >
              <Moon size={18} />
            </button>
            {!isCollapsed && (
              <button
                onClick={() => setTheme('system')}
                className={`p-2 rounded-lg transition-colors duration-100 ease-out cursor-pointer ${theme === 'system' ? 'bg-sidebar-hover' : 'hover:bg-sidebar-hover'}`}
                title="Sistema"
              >
                <Monitor size={18} />
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1 flex flex-col h-full">
            {menuItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-100 ease-out ${
                    location.pathname === to ? 'bg-sidebar-hover font-medium' : 'hover:bg-sidebar-hover'
                  }`}
                  title={label}
                >
                  <Icon size={20} className="shrink-0" />
                  {!isCollapsed && <span>{label}</span>}
                </Link>
              </li>
            ))}
            <li className="mt-auto">
              <button
                onClick={onToggleCollapse}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-hover transition-colors duration-100 ease-out w-full cursor-pointer"
                title={isCollapsed ? 'Expandir' : 'Colapsar'}
              >
                {isCollapsed ? <PanelLeftOpen size={20} className="shrink-0" /> : <PanelLeftClose size={20} className="shrink-0" />}
                {!isCollapsed && <span>Colapsar</span>}
              </button>
            </li>
          </ul>
        </nav>

        <div className={`p-4 border-t border-border ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-background dark:text-foreground hover:text-slate-300 dark:hover:text-foreground-secondary transition-colors duration-100 ease-out cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
