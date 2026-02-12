import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Logo } from '@/components/Logo';
import {
  Home,
  BookOpen,
  FileText,
  MessageCircle,
  Gamepad2,
  Users,
  Activity,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  key: string;
  icon: React.ElementType;
  path: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'patient' | 'doctor' | 'admin';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role }) => {
  const { t, isRTL } = useLanguage();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'patient':
        return [
          { key: 'nav.home', icon: Home, path: '/patient' },
          { key: 'nav.education', icon: BookOpen, path: '/patient/education' },
          { key: 'nav.healthForm', icon: FileText, path: '/patient/health-form' },
          { key: 'nav.chat', icon: MessageCircle, path: '/patient/chat' },
          { key: 'nav.games', icon: Gamepad2, path: '/patient/games' },
        ];
      case 'doctor':
        return [
          { key: 'nav.home', icon: Home, path: '/doctor' },
          { key: 'nav.patients', icon: Users, path: '/doctor/patients' },
          { key: 'nav.chat', icon: MessageCircle, path: '/doctor/chat' },
          { key: 'nav.dialysisTracking', icon: Activity, path: '/doctor/tracking' },
        ];
      case 'admin':
        return [
          { key: 'nav.home', icon: Home, path: '/admin' },
          { key: 'nav.analytics', icon: BarChart3, path: '/admin/analytics' },
          { key: 'nav.userManagement', icon: Users, path: '/admin/users' },
          { key: 'nav.statistics', icon: Activity, path: '/admin/statistics' },
          { key: 'nav.monitoring', icon: Settings, path: '/admin/monitoring' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/');
  };



  const getRoleTitle = () => {
    switch (role) {
      case 'patient':
        return t('auth.patient');
      case 'doctor':
        return t('auth.doctor');
      case 'admin':
        return t('auth.admin');
    }
  };

  return (
    <div className={cn('min-h-screen bg-background flex', isRTL && 'flex-row-reverse')}>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'fixed top-4 z-50 lg:hidden',
          isRTL ? 'right-4' : 'left-4'
        )}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 z-40 w-64 bg-sidebar transition-transform duration-300 lg:translate-x-0 flex flex-col',
          isRTL ? 'right-0' : 'left-0',
          sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Logo size="md" />
          <p className="text-xs text-sidebar-foreground/70 mt-1 pl-10">{getRoleTitle()}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/patient` || item.path === '/doctor' || item.path === '/admin'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-primary font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm text-sidebar-foreground">{user?.name || 'User'}</span>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>{t('nav.logout')}</span>
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-end px-6 gap-4">
          <LanguageSwitcher />
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
