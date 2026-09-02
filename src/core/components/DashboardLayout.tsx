import { useState } from "react";
import { Outlet } from "react-router";
import { Menu } from "lucide-react";
import Sidebar from "../components/sidebar.tsx";
import { useLogo } from "../providers/LogoProvider";
import AuthErrorModal from "./AuthErrorModal";
import SmartImage from "./SmartImage";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { logoUrl } = useLogo();

  return (
    <div className="flex overflow-x-clip bg-background min-h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className={`flex-1 min-w-0 transition-all duration-300 ml-0 ${isSidebarCollapsed ? 'min-[1201px]:ml-20' : 'min-[1201px]:ml-64'}`}>
        <nav className="max-[1200px]:flex min-[1201px]:hidden p-4 bg-sidebar dark:bg-background-secondary border-b border-border items-center gap-4 fixed top-0 left-0 right-0 z-40">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg shrink-0 cursor-pointer transition-colors duration-100 ease-out text-background dark:text-foreground hover:bg-sidebar-hover"
          >
            <Menu size={24} />
          </button>
          <SmartImage
            src={logoUrl || ''}
            alt="Logo"
            className="w-8 h-8 bg-foreground/10 rounded-lg flex items-center justify-center shrink-0 p-1.5 dark:bg-background"
            imgClassName="w-full h-full object-contain"
          />
          <span className="font-semibold text-background dark:text-foreground">Sistema de Dosimetría</span>
        </nav>
        <div className="max-[1200px]:pt-20 min-[1201px]:pt-6">
          <div className="p-8 max-w-[90rem] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
      <AuthErrorModal />
    </div>
  );
}