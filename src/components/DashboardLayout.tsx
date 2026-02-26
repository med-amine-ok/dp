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
  User,
} from 'lucide-react';

interface NavItem {
  key: string;
  icon: React.ElementType;
  path: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'patient' | 'doctor' | 'admin';
  headerContent?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role, headerContent }) => {
  const { t, isRTL } = useLanguage();
  const { logout, user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
      // Note: Sessions nav item removed
      case 'doctor':
        return [
          { key: 'nav.home', icon: Home, path: '/doctor' },
          { key: 'nav.patients', icon: Users, path: '/doctor/patients' },
          { key: 'nav.chat', icon: MessageCircle, path: '/doctor/chat' },
          { key: 'nav.healthForm', icon: FileText, path: '/doctor/health-forms' },
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
    <div className={cn('h-screen bg-background flex overflow-hidden', isRTL && 'flex-row-reverse')}>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'fixed top-4 z-50 lg:hidden bg-card/85 backdrop-blur-md border border-border/70 card-shadow',
          isRTL ? 'right-4' : 'left-4'
        )}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 inset-y-0 z-40 w-72 bg-sidebar/95 border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0 flex flex-col h-screen backdrop-blur-xl',
          isRTL ? 'right-0' : 'left-0',
          sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border/80">
          <Logo size="md" />
          <p className="text-xs text-sidebar-foreground/70 mt-1 pl-10 tracking-wide">{getRoleTitle()}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/patient` || item.path === '/doctor' || item.path === '/admin'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 interactive-lift border border-transparent',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground font-semibold border-sidebar-border/70 shadow-[0_10px_18px_-14px_hsl(var(--primary)/0.8)]'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground hover:border-sidebar-border/60'
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
        <div className="p-4 border-t border-sidebar-border/80 space-y-2.5">
          <button
            onClick={() => { if (role === 'patient') { navigate('/patient/profile'); setSidebarOpen(false); } }}
            className={`flex items-center gap-3 px-4 py-2.5 w-full rounded-2xl transition-all duration-200 border border-transparent ${role === 'patient' ? 'hover:bg-sidebar-accent/70 hover:border-sidebar-border/60 cursor-pointer' : 'cursor-default'
              }`}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-sidebar-primary/40"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-primary font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex flex-col items-start">
              <span className="text-sm text-sidebar-foreground font-medium leading-tight">{user?.name || 'User'}</span>
              {role === 'patient' && (
                <span className="text-[10px] text-sidebar-primary/70">Mon profil →</span>
              )}
            </div>
          </button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-destructive hover:bg-destructive/10 rounded-2xl"
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
          className="fixed inset-0 bg-slate-900/35 backdrop-blur-[1px] z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={cn('flex-1 flex flex-col h-screen overflow-hidden', isRTL ? 'lg:mr-72' : 'lg:ml-72')}>
        {/* Top Bar */}
        <header dir="ltr" className="h-20 bg-card/75 border-b border-border/75 backdrop-blur-md flex items-center px-5 md:px-8 gap-4 flex-shrink-0">
          {isRTL ? (
            <>
              <LanguageSwitcher />
              {headerContent && (
                <div className="flex min-w-0 items-center ml-auto">
                  {headerContent}
                </div>
              )}
            </>
          ) : (
            <>
              {headerContent && (
                <div className="flex min-w-0 items-center">
                  {headerContent}
                </div>
              )}
              <div className="ml-auto">
                <LanguageSwitcher />
              </div>
            </>
          )}
        </header>

        {/* Page Content */}
        <div className="flex-1 p-5 md:p-8 overflow-auto min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
