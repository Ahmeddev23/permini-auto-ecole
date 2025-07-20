import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Messenger from '../components/messenger/Messenger';
import SupportFloatingButton from '../components/common/SupportFloatingButton';
import { useAuth } from '../contexts/AuthContext';
import { usePlanPermissions } from '../hooks/usePlanPermissions';
import { MessagingProvider } from '../contexts/MessagingContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import websocketService from '../services/websocketService';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { permissions } = usePlanPermissions();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [refreshKey, setRefreshKey] = useState(0);

  // Vérifier si l'utilisateur a accès à la messagerie (plan premium)
  const hasMessagingAccess = permissions?.currentPlan === 'premium';

  // Initialiser WebSocket pour la messagerie
  React.useEffect(() => {
    // Forcer la connexion WebSocket pour tester (même sans accès messagerie)
    if (user) {
      websocketService.connect();

      return () => {
        websocketService.disconnect();
      };
    }
  }, [user]);

  // Forcer le re-rendu quand l'utilisateur change
  React.useEffect(() => {
    if (user) {
      // Délai plus court pour une mise à jour plus rapide
      const timer = setTimeout(() => {
        // Force un re-render complet en changeant la clé
        setRefreshKey(prev => prev + 1);
      }, 50);

      return () => clearTimeout(timer);
    } else {
      // Reset quand l'utilisateur se déconnecte
      setRefreshKey(0);
    }
  }, [user]);

  // Effet supplémentaire pour forcer la mise à jour immédiatement
  React.useEffect(() => {
    if (user) {
      // Force immédiatement une mise à jour
      setRefreshKey(prev => prev + 1);
    }
  }, [user?.id, user?.user_type, user?.username]);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <NotificationProvider>
      <MessagingProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar Navigation (gauche) */}
      <AnimatePresence mode="wait">
        {(isMobile ? sidebarOpen : true) && (
          <motion.div
            initial={isMobile ? { x: -280, opacity: 0 } : false}
            animate={isMobile ? { x: 0, opacity: 1 } : { width: sidebarOpen ? 256 : 0 }}
            exit={isMobile ? { x: -280, opacity: 0 } : { width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`
              ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'relative'}
              ${!isMobile && !sidebarOpen ? 'overflow-hidden' : ''}
              transition-all duration-300 ease-in-out
            `}
            style={!isMobile ? { width: sidebarOpen ? '256px' : '0px' } : undefined}
          >
            <div className={`${!isMobile && !sidebarOpen ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
              <Sidebar
                key={`sidebar-${refreshKey}`}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isMobile={isMobile}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <DashboardHeader
          key={`header-${refreshKey}`}
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto"
            >
              {children || <Outlet />}
            </motion.div>
          </div>
        </main>
      </div>

        {/* Sidebar Messenger (droite) - seulement pour les plans premium */}
        {hasMessagingAccess && <Messenger />}

        {/* Bouton flottant de support */}
        <SupportFloatingButton />
      </div>
      </MessagingProvider>
    </NotificationProvider>
  );
};

export default DashboardLayout;
