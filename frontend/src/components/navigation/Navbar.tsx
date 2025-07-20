import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Globe,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, languages } from '../../contexts/LanguageContext';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { ThemeToggle } from '../common/ThemeToggle';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Effet de scroll pour le header
  const headerBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)']
  );

  const headerBackgroundDark = useTransform(
    scrollY,
    [0, 100],
    ['rgba(17, 24, 39, 0)', 'rgba(17, 24, 39, 0.95)']
  );

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
    return unsubscribe;
  }, [scrollY]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavItems = () => {
    // Navigation pour les utilisateurs non connectés (pages publiques)
    if (!user) {
      return [
        { name: t('nav.home'), href: '/' },
        { name: t('nav.features'), href: '/features' },
        { name: t('nav.pricing'), href: '/pricing' },
        { name: t('nav.about'), href: '/about' },
        { name: t('nav.contact'), href: '/contact' },
      ];
    }

    const baseItems = [
      { name: t('nav.dashboard'), href: '/dashboard' },
    ];

    switch (user.role) {
      case 'super-admin':
        return [
          ...baseItems,
          { name: t('nav.driving.schools'), href: '/driving-schools' },
          { name: t('nav.users'), href: '/users' },
          { name: t('nav.reports'), href: '/reports' },
        ];
      case 'admin':
        return [
          ...baseItems,
          { name: t('nav.driving.schools'), href: '/driving-schools' },
          { name: t('nav.approvals'), href: '/approvals' },
          { name: t('nav.reports'), href: '/reports' },
        ];
      case 'driving-school':
        return [
          ...baseItems,
          { name: t('nav.students'), href: '/students' },
          { name: t('nav.instructors'), href: '/instructors' },
          { name: t('nav.lessons'), href: '/lessons' },
          { name: t('nav.payments'), href: '/payments' },
        ];
      case 'instructor':
        return [
          ...baseItems,
          { name: t('nav.my.students'), href: '/my-students' },
          { name: t('nav.schedule'), href: '/schedule' },
          { name: t('nav.lessons'), href: '/lessons' },
        ];
      case 'student':
        return [
          ...baseItems,
          { name: t('nav.my.lessons'), href: '/my-lessons' },
          { name: t('nav.progress'), href: '/progress' },
          { name: t('nav.my.payments'), href: '/my-payments' },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: headerBackground,
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(229, 231, 235, 0.2)' : 'none'
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background overlay pour dark mode */}
      <motion.div
        className="absolute inset-0 bg-gray-900 dark:block hidden"
        style={{ backgroundColor: headerBackgroundDark }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20" dir={currentLanguage.code === 'ar' ? 'rtl' : 'ltr'}>

          {/* Logo avec animation */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/" className="flex-shrink-0">
              <motion.div
                animate={{
                  rotate: [0, 5, 0],
                  scale: [1, 1.02, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Logo size="md" />
              </motion.div>
            </Link>
          </motion.div>
            
          {/* Navigation Desktop avec animations */}
          {user && (
            <motion.div
              className={`hidden md:flex md:items-center ${
                currentLanguage.code === 'ar'
                  ? 'md:space-x-reverse md:space-x-1 md:mr-8'
                  : 'md:space-x-1 md:ml-8'
              }`}
              initial={{ opacity: 0, x: currentLanguage.code === 'ar' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                >
                  <Link
                    to={item.href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      location.pathname === item.href
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {item.name}

                    {/* Indicateur de page active */}
                    {location.pathname === item.href && (
                      <motion.div
                        className="absolute bottom-0 left-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                        layoutId="activeIndicator"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{ x: '-50%' }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Navigation pour utilisateurs non connectés */}
          {!user && (
            <motion.div
              className={`hidden md:flex md:items-center ${
                currentLanguage.code === 'ar'
                  ? 'md:space-x-reverse md:space-x-6 md:mr-8'
                  : 'md:space-x-6 md:ml-8'
              }`}
              initial={{ opacity: 0, x: currentLanguage.code === 'ar' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {[
                { name: t('nav.features'), href: '/features' },
                { name: t('nav.pricing'), href: '/pricing' },
                { name: t('nav.about'), href: '/about' },
                { name: t('nav.contact'), href: '/contact' }
              ].map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                >
                  <Link
                    to={item.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Section droite avec animations */}
          <motion.div
            className={`flex items-center ${
              currentLanguage.code === 'ar'
                ? 'space-x-reverse space-x-3'
                : 'space-x-3'
            }`}
            initial={{ opacity: 0, x: currentLanguage.code === 'ar' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Theme Toggle avec animation */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThemeToggle />
            </motion.div>

            {/* Notifications avec badge animé */}
            {user && (
              <motion.button
                className="relative p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Bell className="h-5 w-5" />
                </motion.div>
                <motion.span
                  className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  3
                </motion.span>
              </motion.button>
            )}

            {/* Language Selector avec animation */}
            <div className="relative">
              <motion.button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className={`flex items-center p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  currentLanguage.code === 'ar'
                    ? 'space-x-reverse space-x-1'
                    : 'space-x-1'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm">
                  {currentLanguage.flagComponent || currentLanguage.flag}
                </span>
                <motion.div
                  animate={{ rotate: showLangMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-3 w-3" />
                </motion.div>
              </motion.button>
              
              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700 ${
                      currentLanguage.code === 'ar' ? 'left-0' : 'right-0'
                    }`}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang);
                          setShowLangMenu(false);
                        }}
                        className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                          currentLanguage.code === 'ar'
                            ? 'space-x-reverse space-x-3'
                            : 'space-x-3'
                        } ${
                          currentLanguage.code === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="flex-shrink-0">
                          {lang.flagComponent || lang.flag}
                        </span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 ${
                    currentLanguage.code === 'ar'
                      ? 'space-x-reverse space-x-2'
                      : 'space-x-2'
                  }`}
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=3B82F6&color=fff`}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.firstName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700 ${
                        currentLanguage.code === 'ar' ? 'left-0' : 'right-0'
                      }`}
                    >
                      <Link
                        to="/profile"
                        className={`flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          currentLanguage.code === 'ar'
                            ? 'space-x-reverse space-x-2'
                            : 'space-x-2'
                        }`}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>{t('nav.profile')}</span>
                      </Link>
                      <Link
                        to="/settings"
                        className={`flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          currentLanguage.code === 'ar'
                            ? 'space-x-reverse space-x-2'
                            : 'space-x-2'
                        }`}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>{t('nav.settings')}</span>
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className={`flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ${
                          currentLanguage.code === 'ar'
                            ? 'space-x-reverse space-x-2'
                            : 'space-x-2'
                        }`}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                className={`flex items-center ${
                  currentLanguage.code === 'ar'
                    ? 'space-x-reverse space-x-3'
                    : 'space-x-3'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                {/* Bouton Connexion */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200"
                  >
                    {t('auth.login')}
                  </button>
                </motion.div>

                {/* Bouton Inscription avec effet */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <button
                    onClick={() => navigate('/register')}
                    className="relative overflow-hidden px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
                  >
                    {/* Effet de brillance */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />

                    <div className="relative z-10 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t('auth.free.trial')}
                      <motion.div
                        className="ml-2"
                        whileHover={{ x: 3 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* Mobile menu button avec animation */}
            <motion.button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {showMobileMenu ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Navigation Links */}
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-base font-medium"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>

                {/* Language Selector Mobile */}
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('nav.language')}
                    </span>
                    <div className="flex space-x-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            changeLanguage(lang);
                            setShowMobileMenu(false);
                          }}
                          className={`px-2 py-1 text-xs rounded ${
                            currentLanguage.code === lang.code
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {lang.flag} {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Auth Buttons Mobile */}
                {!user && (
                  <div className="px-3 py-2 space-y-2">
                    <button
                      onClick={() => {
                        navigate('/login');
                        setShowMobileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200"
                    >
                      {t('auth.login')}
                    </button>
                    <button
                      onClick={() => {
                        navigate('/register');
                        setShowMobileMenu(false);
                      }}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t('auth.free.trial')}
                    </button>
                  </div>
                )}

                {/* User Menu Mobile */}
                {user && (
                  <div className="px-3 py-2 space-y-2">
                    <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=3B82F6&color=fff`}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      {t('nav.profile')}
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      {t('nav.settings')}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setShowMobileMenu(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};