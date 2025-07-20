import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  GlobeAltIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';
import { dashboardService } from '../../services/dashboardService';
import { usePlanPermissions } from '../../hooks/usePlanPermissions';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { useLanguage } from '../../contexts/LanguageContext';


interface DashboardHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onToggleSidebar,
  sidebarOpen
}) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [drivingSchoolData, setDrivingSchoolData] = useState<{
    name: string;
    logo: string | null;
  } | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { permissions } = usePlanPermissions();



  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Récupérer les données de l'auto-école
  useEffect(() => {
    const fetchDrivingSchoolData = async () => {
      try {
        console.log('🔄 Chargement des données auto-école pour:', user);
        setIsDataLoaded(false);
        setDrivingSchoolData(null); // Reset des données

        if (user?.driving_school) {
          // Pour les auto-écoles
          const profile = await dashboardService.getDrivingSchoolProfile();
          setDrivingSchoolData({
            name: profile.name,
            logo: profile.logo
          });
        } else if (user?.user_type === 'instructor') {
          console.log('👨‍🏫 Utilisateur moniteur détecté');
          // Pour les moniteurs, récupérer les données de leur auto-école
          const drivingSchoolInfo = await dashboardService.getMyDrivingSchoolInfo();
          console.log('✅ Info auto-école moniteur récupérée:', drivingSchoolInfo);
          setDrivingSchoolData({
            name: drivingSchoolInfo.name,
            logo: drivingSchoolInfo.logo
          });
        } else if (user?.user_type === 'student') {
          console.log('👨‍🎓 Utilisateur étudiant détecté');
          // Pour les étudiants, récupérer les données de leur auto-école
          const drivingSchoolInfo = await dashboardService.getMyStudentDrivingSchoolInfo();
          console.log('✅ Info auto-école étudiant récupérée:', drivingSchoolInfo);
          setDrivingSchoolData({
            name: drivingSchoolInfo.name,
            logo: drivingSchoolInfo.logo
          });
        } else {
          console.log('❓ Type d\'utilisateur non reconnu:', user?.user_type);
        }

        setIsDataLoaded(true);
      } catch (error) {
        console.error('❌ Erreur lors du chargement du profil de l\'auto-école:', error);
        setIsDataLoaded(true);
      }
    };

    if (user && user.id) {
      console.log('🚀 Démarrage du chargement des données auto-école');
      // Délai plus long pour s'assurer que l'utilisateur est complètement chargé
      const timer = setTimeout(() => {
        fetchDrivingSchoolData();
      }, 200);

      return () => clearTimeout(timer);
    } else {
      console.log('❌ Pas d\'utilisateur ou ID manquant, reset des données');
      setDrivingSchoolData(null);
      setIsDataLoaded(false);
    }
  }, [user?.id, user?.user_type]); // Dépendances plus spécifiques

  // Effet supplémentaire pour forcer le rechargement quand l'utilisateur change complètement
  useEffect(() => {
    if (user && user.id && !drivingSchoolData) {
      console.log('🔄 Rechargement forcé des données auto-école');
      const timer = setTimeout(() => {
        setIsDataLoaded(false);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [user, drivingSchoolData]);



  // Ne pas afficher le header si l'utilisateur n'est pas encore défini
  if (!user) {
    return (
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleSidebar}
              className="p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Bars3Icon className="h-5 w-5" />
            </motion.button>

            {/* Search Bar */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t('common.search')}
                  className="block w-64 pl-9 pr-3 py-2.5 border border-gray-200/60 rounded-xl leading-5 bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700/60 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Auto-école Info */}
            {drivingSchoolData && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:flex items-center space-x-3 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-blue-100 dark:border-gray-700/60 shadow-sm"
              >
                {drivingSchoolData.logo ? (
                  <img
                    className="h-9 w-9 rounded-lg object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                    src={drivingSchoolData.logo}
                    alt={drivingSchoolData.name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-sm">
                      {drivingSchoolData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {drivingSchoolData.name}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {t('nav.driving.schools')}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Plan Indicator */}
            {permissions && (
              <div className="hidden md:flex items-center space-x-3">
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm ${
                    permissions.currentPlan === 'premium'
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-200 border border-purple-200 dark:border-purple-700/50'
                      : permissions.currentPlan === 'standard'
                      ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-700/50'
                      : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 dark:from-gray-800/50 dark:to-slate-800/50 dark:text-gray-200 border border-gray-200 dark:border-gray-700/50'
                  }`}
                >
                  {permissions.currentPlan === 'premium' ? '⭐ Premium' :
                   permissions.currentPlan === 'standard' ? '🚀 Standard' :
                   '🆓 Gratuit'}
                  {(user?.user_type === 'instructor' || user?.user_type === 'student') && (
                    <span className="ml-1 text-xs opacity-75">(Auto-école)</span>
                  )}
                </motion.span>
                {permissions.daysRemaining <= 7 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-orange-600 dark:text-orange-400 font-medium"
                  >
                    {permissions.daysRemaining}j restants
                  </motion.span>
                )}
                {permissions.currentPlan !== 'premium' && user?.user_type !== 'instructor' && user?.user_type !== 'student' && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/dashboard/subscription"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      ⚡ {t('pricing.cta.trial.button')}
                    </Link>
                  </motion.div>
                )}
              </div>
            )}

            {/* Language Selector */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center space-x-2 p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <GlobeAltIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{currentLanguage.code.toUpperCase()}</span>
                <ChevronDownIcon className="h-3 w-3" />
              </motion.button>

              {/* Language Dropdown */}
              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50"
                  >
                    {[
                      { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
                      { code: 'ar' as const, name: 'العربية', flag: '🇹🇳' }
                    ].map((lang) => (
                      <motion.button
                        key={lang.code}
                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                        onClick={() => {
                          changeLanguage({
                            code: lang.code,
                            name: lang.name,
                            flag: lang.code === 'fr' ? 'fr' : 'tn',
                            flagComponent: <span>{lang.flag}</span>
                          });
                          setShowLanguageMenu(false);
                        }}
                        className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors ${
                          currentLanguage.code === lang.code
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        <span className="mr-3 text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                        {currentLanguage.code === lang.code && (
                          <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />



            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    {unreadCount === 1 ? (
                      // Point rouge pour 1 notification non lue
                      <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-sm"></div>
                    ) : (
                      // Badge avec nombre pour plusieurs notifications
                      <span className="h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </motion.div>
                )}
              </motion.button>

              <NotificationDropdown
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="flex-shrink-0">
                  {user?.user_type === 'instructor' ? (
                    // Pour les moniteurs : afficher leur photo
                    user?.instructor_profile?.photo ? (
                      <img
                        className="h-9 w-9 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                        src={`http://127.0.0.1:8000${user.instructor_profile.photo}`}
                        alt={`${user.first_name} ${user.last_name}`}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">
                          {user.first_name?.charAt(0).toUpperCase()}{user.last_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )
                  ) : user?.user_type === 'student' ? (
                    // Pour les étudiants : afficher leur photo
                    user?.student_profile?.photo ? (
                      <img
                        className="h-9 w-9 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                        src={`http://127.0.0.1:8000${user.student_profile.photo}`}
                        alt={`${user.first_name} ${user.last_name}`}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">
                          {user.first_name?.charAt(0).toUpperCase()}{user.last_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )
                  ) : (
                    // Pour les auto-écoles : afficher le logo ou initiales
                    drivingSchoolData?.logo ? (
                      <img
                        className="h-9 w-9 rounded-lg object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                        src={drivingSchoolData.logo}
                        alt={drivingSchoolData.name}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : drivingSchoolData?.name ? (
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">
                          {drivingSchoolData.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    ) : user?.photo ? (
                      <img
                        className="h-9 w-9 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                        src={user.photo}
                        alt={`${user.first_name} ${user.last_name}`}
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-sm">
                        <UserCircleIcon className="h-5 w-5 text-white" />
                      </div>
                    )
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.user_type === 'instructor' || user?.user_type === 'student'
                      ? `${user?.first_name} ${user?.last_name}`
                      : drivingSchoolData?.name || user?.driving_school?.name || `${user?.first_name} ${user?.last_name}`
                    }
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {user?.user_type === 'instructor' ? t('nav.instructors') :
                     user?.user_type === 'student' ? t('nav.students') :
                     user?.driving_school ? t('nav.driving.schools') :
                     user?.user_type}
                  </p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </motion.button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user?.user_type === 'instructor' || user?.user_type === 'student'
                          ? `${user?.first_name} ${user?.last_name}`
                          : drivingSchoolData?.name || user?.driving_school?.name || `${user?.first_name} ${user?.last_name}`
                        }
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-2">
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/dashboard/settings');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 transition-colors"
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                        {t('nav.settings')}
                      </motion.button>

                      <div className="my-2 border-t border-gray-200/50 dark:border-gray-700/50"></div>

                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 transition-colors"
                      >
                        <ArrowRightStartOnRectangleIcon className="h-4 w-4 mr-3" />
                        {t('nav.logout')}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showLanguageMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowLanguageMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default DashboardHeader;
