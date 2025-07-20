import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminNotificationProvider } from '../contexts/AdminNotificationContext';
import NotificationDropdown from '../components/admin/NotificationDropdown';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { adminService, AdminUser } from '../services/adminService';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  permission?: keyof AdminUser;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (!adminService.isAuthenticated()) {
        navigate('/administrateur_permini');
        return;
      }

      const user = await adminService.getCurrentUser();
      setAdminUser(user);
    } catch (error) {
      console.error('Erreur d\'authentification admin:', error);
      navigate('/administrateur_permini');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminService.logout();
      toast.success('Déconnexion réussie');
      navigate('/administrateur_permini');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      navigate('/administrateur_permini');
    }
  };

  const navigation: NavItem[] = [
    { name: t('admin.nav.dashboard'), href: '/administrateur_permini/dashboard', icon: HomeIcon },
    {
      name: t('admin.nav.driving_schools'),
      href: '/administrateur_permini/driving-schools',
      icon: BuildingOfficeIcon
    },
    {
      name: t('admin.nav.users'),
      href: '/administrateur_permini/users',
      icon: UserGroupIcon
    },
    {
      name: t('admin.nav.payments'),
      href: '/administrateur_permini/payments',
      icon: CreditCardIcon
    },
    {
      name: t('admin.nav.contact_forms'),
      href: '/administrateur_permini/contact-forms',
      icon: ExclamationTriangleIcon
    },
    {
      name: t('admin.nav.activity_logs'),
      href: '/administrateur_permini/logs',
      icon: DocumentTextIcon
    },
    {
      name: t('admin.nav.coupons'),
      href: '/administrateur_permini/coupons',
      icon: TicketIcon
    },
  ];

  // Pour l'instant, on affiche toute la navigation (on peut ajouter les permissions plus tard)
  const filteredNavigation = navigation;



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AdminNotificationProvider>
      <div className="min-h-screen bg-gray-100">
      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent
            navigation={filteredNavigation}
            currentPath={location.pathname}
            adminUser={adminUser}
            onLogout={handleLogout}
            navigate={navigate}
          />
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
          <SidebarContent
            navigation={filteredNavigation}
            currentPath={location.pathname}
            adminUser={adminUser}
            onLogout={handleLogout}
            navigate={navigate}
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>

            {/* Logo/Title (mobile) */}
            <div className="lg:hidden flex items-center">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">Admin Permini</span>
            </div>

            {/* Desktop title */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard Administrateur</h1>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <NotificationDropdown />

              <button
                onClick={handleLogout}
                className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      </div>
    </AdminNotificationProvider>
  );
};

// Composant pour le contenu de la sidebar
const SidebarContent: React.FC<{
  navigation: NavItem[];
  currentPath: string;
  adminUser: AdminUser | null;
  onLogout: () => void;
  navigate: (path: string) => void;
}> = ({ navigation, currentPath, adminUser, onLogout, navigate }) => {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
        <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
        <span className="ml-2 text-white text-lg font-semibold">Admin Permini</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <div key={item.name}>
                <button
                  onClick={() => {

                    navigate(item.href);
                  }}
                  className={`${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors w-full text-left cursor-pointer`}
                >
                  <item.icon
                    className={`${
                      isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  {item.name}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Profil admin */}
        <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {adminUser?.first_name} {adminUser?.last_name}
                </p>
                <p className="text-xs font-medium text-gray-300">
                  Administrateur
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="mt-3 w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
