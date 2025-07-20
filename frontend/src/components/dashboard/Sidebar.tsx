import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlanPermissions } from '../../hooks/usePlanPermissions';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { dashboardService } from '../../services/dashboardService';
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  StarIcon,
  CalculatorIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  TruckIcon as TruckIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  StarIcon as StarIconSolid,
  CalculatorIcon as CalculatorIconSolid,
  QuestionMarkCircleIcon as QuestionMarkCircleIconSolid
} from '@heroicons/react/24/solid';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconSolid: React.ComponentType<{ className?: string }>;
  badge?: number;
}

// Navigation pour auto-école
const drivingSchoolNavigation: NavigationItem[] = [
  {
    name: 'Vue d\'ensemble',
    href: '/dashboard',
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
  },
  // Note: Cette navigation statique n'est plus utilisée, remplacée par getNavigationItems()
  {
    name: 'Moniteurs',
    href: '/dashboard/instructors',
    icon: AcademicCapIcon,
    iconSolid: AcademicCapIconSolid,
  },
  // Note: Cette navigation statique n'est plus utilisée, remplacée par getNavigationItems()
  {
    name: 'Planning',
    href: '/dashboard/schedule',
    icon: CalendarDaysIcon,
    iconSolid: CalendarDaysIconSolid,
  },
  // Note: Cette navigation statique n'est plus utilisée, remplacée par getNavigationItems()
  {
    name: 'Paiements',
    href: '/dashboard/payments',
    icon: CreditCardIcon,
    iconSolid: CreditCardIconSolid,
  },
  {
    name: 'Statistiques',
    href: '/dashboard/analytics',
    icon: ChartBarIcon,
    iconSolid: ChartBarIconSolid,
  },
  {
    name: 'Abonnement',
    href: '/dashboard/subscription',
    icon: StarIcon,
    iconSolid: StarIconSolid,
  },
  {
    name: 'Support',
    href: '/dashboard/support',
    icon: QuestionMarkCircleIcon,
    iconSolid: QuestionMarkCircleIconSolid,
  },
  {
    name: 'Paramètres',
    href: '/dashboard/settings',
    icon: Cog6ToothIcon,
    iconSolid: Cog6ToothIconSolid,
  },
];

// Navigation pour moniteur
const instructorNavigation: NavigationItem[] = [
  {
    name: 'Vue d\'ensemble',
    href: '/dashboard',
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
  },
  {
    name: 'Mes candidats',
    href: '/dashboard/students',
    icon: UserGroupIcon,
    iconSolid: UserGroupIconSolid,
  },
  // Note: Cette navigation statique n'est plus utilisée, remplacée par getNavigationItems()
  {
    name: 'Mon planning',
    href: '/dashboard/instructor-schedule',
    icon: CalendarDaysIcon,
    iconSolid: CalendarDaysIconSolid,
  },
  {
    name: 'Paramètres',
    href: '/dashboard/settings',
    icon: Cog6ToothIcon,
    iconSolid: Cog6ToothIconSolid,
  },
];

// Navigation pour candidat
const studentNavigation: NavigationItem[] = [
  {
    name: 'Vue d\'ensemble',
    href: '/dashboard',
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
  },
  {
    name: 'Mon planning',
    href: '/dashboard/schedule',
    icon: CalendarDaysIcon,
    iconSolid: CalendarDaysIconSolid,
  },
  {
    name: 'Mes examens',
    href: '/dashboard/mes-examens',
    icon: ClipboardDocumentListIcon,
    iconSolid: ClipboardDocumentListIconSolid,
  },
  {
    name: 'Mes paiements',
    href: '/dashboard/payments',
    icon: CreditCardIcon,
    iconSolid: CreditCardIconSolid,
  },
  {
    name: 'Paramètres',
    href: '/dashboard/settings',
    icon: Cog6ToothIcon,
    iconSolid: Cog6ToothIconSolid,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { hasFeature, permissions } = usePlanPermissions();
  const { t } = useLanguage();
  const [urgentReminders, setUrgentReminders] = useState(0);

  // Charger les rappels urgents
  useEffect(() => {
    const fetchUrgentReminders = async () => {
      try {
        const vehicles = await dashboardService.getVehicles();
        const urgentCount = vehicles.filter((vehicle: any) => {
          const today = new Date().getTime();

          // Vérifier l'assurance
          const insuranceDate = new Date(vehicle.insurance_expiry_date);
          const insuranceDays = vehicle.insurance_expiry_date && !isNaN(insuranceDate.getTime())
            ? Math.ceil((insuranceDate.getTime() - today) / (1000 * 60 * 60 * 24))
            : 999;

          // Vérifier la visite technique
          const technicalDate = new Date(vehicle.technical_inspection_date);
          const technicalDays = vehicle.technical_inspection_date && !isNaN(technicalDate.getTime())
            ? Math.ceil((technicalDate.getTime() - today) / (1000 * 60 * 60 * 24))
            : 999;

          return insuranceDays <= 7 || technicalDays <= 7;
        }).length;
        setUrgentReminders(urgentCount);
      } catch (error) {
        console.error('Erreur lors du chargement des rappels:', error);
      }
    };

    fetchUrgentReminders();

    // Écouter les mises à jour des dates de véhicules
    const handleVehicleDatesUpdate = () => {
      fetchUrgentReminders();
    };

    window.addEventListener('vehicleDatesUpdated', handleVehicleDatesUpdate);

    return () => {
      window.removeEventListener('vehicleDatesUpdated', handleVehicleDatesUpdate);
    };
  }, []);

  // Navigation dynamique basée sur le rôle utilisateur avec traductions
  const getNavigationItems = (): NavigationItem[] => {
    let baseNavigation: NavigationItem[] = [];

    // Sélectionner la navigation basée sur le rôle
    switch (user?.user_type) {
      case 'driving_school':
        baseNavigation = [
          { name: t('nav.dashboard'), href: '/dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
          { name: t('nav.students'), href: '/dashboard/students', icon: UserGroupIcon, iconSolid: UserGroupIconSolid },
          { name: t('nav.instructors'), href: '/dashboard/instructors', icon: AcademicCapIcon, iconSolid: AcademicCapIconSolid },
          { name: t('nav.vehicles'), href: '/dashboard/vehicles', icon: TruckIcon, iconSolid: TruckIconSolid },
          { name: t('nav.schedule'), href: '/dashboard/schedule', icon: CalendarDaysIcon, iconSolid: CalendarDaysIconSolid },
          { name: t('nav.exams'), href: '/dashboard/exams', icon: ClipboardDocumentListIcon, iconSolid: ClipboardDocumentListIconSolid },
          { name: t('nav.payments'), href: '/dashboard/payments', icon: CreditCardIcon, iconSolid: CreditCardIconSolid },
          { name: t('nav.analytics'), href: '/dashboard/analytics', icon: ChartBarIcon, iconSolid: ChartBarIconSolid },
          { name: t('nav.subscription'), href: '/dashboard/subscription', icon: StarIcon, iconSolid: StarIconSolid },
          { name: t('nav.support'), href: '/dashboard/support', icon: QuestionMarkCircleIcon, iconSolid: QuestionMarkCircleIconSolid },
          { name: t('nav.settings'), href: '/dashboard/settings', icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid },
        ];
        break;
      case 'instructor':
        baseNavigation = [
          { name: t('nav.dashboard'), href: '/dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
          { name: t('nav.my.students'), href: '/dashboard/students', icon: UserGroupIcon, iconSolid: UserGroupIconSolid },
          { name: t('nav.schedule'), href: '/dashboard/schedule', icon: CalendarDaysIcon, iconSolid: CalendarDaysIconSolid },
          { name: t('nav.exams'), href: '/dashboard/exams', icon: ClipboardDocumentListIcon, iconSolid: ClipboardDocumentListIconSolid },
          { name: t('nav.settings'), href: '/dashboard/settings', icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid },
        ];
        break;
      case 'student':
        // Pour les étudiants, personnaliser les liens avec leur ID
        const studentId = user?.student_profile?.id;
        baseNavigation = [
          { name: t('nav.dashboard'), href: '/dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
          { name: t('nav.progress'), href: '/dashboard/progress', icon: ChartBarIcon, iconSolid: ChartBarIconSolid },
          { name: t('nav.schedule'), href: '/dashboard/schedule', icon: CalendarDaysIcon, iconSolid: CalendarDaysIconSolid },
          { name: t('nav.my.exams'), href: studentId ? `/dashboard/students/${studentId}/exams` : '/dashboard/mes-examens', icon: ClipboardDocumentListIcon, iconSolid: ClipboardDocumentListIconSolid },
          { name: t('nav.my.payments'), href: studentId ? `/dashboard/students/${studentId}/payments` : '/dashboard/payments', icon: CreditCardIcon, iconSolid: CreditCardIconSolid },
          { name: t('nav.profile'), href: studentId ? `/dashboard/students/${studentId}` : '/dashboard/settings', icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid },
        ];
        break;
      default:
        baseNavigation = [
          { name: t('nav.dashboard'), href: '/dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
          { name: t('nav.students'), href: '/dashboard/students', icon: UserGroupIcon, iconSolid: UserGroupIconSolid },
          { name: t('nav.settings'), href: '/dashboard/settings', icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid },
        ];
        break;
    }

    // Ajouter la comptabilité seulement pour les auto-écoles
    if (user?.user_type === 'driving_school') {
      const accountingItem: NavigationItem = {
        name: t('nav.accounting'),
        href: '/dashboard/accounting',
        icon: CalculatorIcon,
        iconSolid: CalculatorIconSolid,
      };

      // Insérer avant les paramètres
      const settingsIndex = baseNavigation.findIndex(item => item.href === '/dashboard/settings');
      if (settingsIndex !== -1) {
        baseNavigation.splice(settingsIndex, 0, accountingItem);
      } else {
        baseNavigation.push(accountingItem);
      }
    }

    return baseNavigation;
  };

  const navigationItems = getNavigationItems();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Permini
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {t('nav.dashboard')}
            </p>
          </div>
        </motion.div>

        {isMobile && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/80 transition-all duration-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </motion.button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-6 space-y-1 overflow-y-auto">
        {navigationItems.map((item, index) => {
          const active = isActive(item.href);
          const Icon = active ? item.iconSolid : item.icon;

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.href}
                onClick={isMobile ? onClose : undefined}
                className={({ isActive }) => `
                  group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 relative
                  ${active
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 shadow-md border border-blue-200/50 dark:border-blue-700/50'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white hover:shadow-sm'
                  }
              `}
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200/50 dark:border-blue-700/50"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <div className="relative flex items-center w-full">
                  <Icon className={`
                    flex-shrink-0 h-5 w-5 mr-3 transition-all duration-200
                    ${active
                      ? 'text-blue-600 dark:text-blue-400 scale-110'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 group-hover:scale-105'
                    }
                  `} />

                  <span className="flex-1 font-medium">{item.name}</span>

                  {item.name === t('nav.accounting') && !hasFeature('finances') && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-2 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-200 shadow-sm"
                    >
                      ⭐ Premium
                    </motion.span>
                  )}

                  {item.name === t('nav.vehicles') && urgentReminders > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-2 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-200 shadow-sm"
                    >
                      🚨 {urgentReminders}
                    </motion.span>
                  )}

                  {item.badge && item.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`
                        ml-2 px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm
                        ${active
                          ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-800/50 text-blue-700 dark:text-blue-300'
                          : 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-700/50 dark:to-slate-700/50 text-gray-600 dark:text-gray-400'
                        }
                      `}
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </div>
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      {permissions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 border-t border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-xl p-4 shadow-sm border border-blue-100/50 dark:border-blue-800/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {permissions.currentPlan === 'premium' ? '⭐' : permissions.currentPlan === 'standard' ? '🚀' : '🆓'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Plan {permissions.currentPlan === 'standard' ? 'Standard' : permissions.currentPlan === 'premium' ? 'Premium' : 'Gratuit'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {permissions.daysRemaining} jours restants
                </p>
              </div>
            </div>
            {permissions.currentPlan !== 'premium' && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-3"
              >
                <Link
                  to="/dashboard/subscription"
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 transition-all duration-200 text-center block shadow-md hover:shadow-lg"
                >
                  ⚡ {t('pricing.cta.trial.button')}
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Sidebar;
