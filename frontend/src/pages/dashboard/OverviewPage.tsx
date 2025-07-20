import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  AcademicCapIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { DashboardPage } from './DashboardPage';
import StudentOverviewPage from './StudentOverviewPage';
import dashboardService, { DashboardStats, SubscriptionInfo } from '../../services/dashboardService';
import StatsCard from '../../components/dashboard/StatsCard';
import QuickActions from '../../components/dashboard/QuickActions';
import RecentActivity from '../../components/dashboard/RecentActivity';
import UpcomingEvents from '../../components/dashboard/UpcomingEvents';
import UpgradePrompt from '../../components/dashboard/UpgradePrompt';

const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Pour les étudiants, utiliser la page Vue d'ensemble spécifique
  if (user?.user_type === 'student') {
    return <StudentOverviewPage />;
  }

  // Si l'utilisateur n'est pas une auto-école, utiliser le DashboardPage avec rôles
  if (user?.user_type !== 'driving_school') {
    return <DashboardPage />;
  }

  // Pour les auto-écoles, utiliser l'ancienne vue d'ensemble
  return <DrivingSchoolOverview />;
};

const DrivingSchoolOverview: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, subscriptionData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getSubscriptionInfo()
      ]);

      setStats(statsData);
      setSubscription(subscriptionData);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.overview.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('dashboard.overview.subtitle')}
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <CalendarDaysIcon className="h-4 w-4" />
            <span>Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('dashboard.overview.refresh')}
          </button>
        </div>
      </div>

      {/* Subscription Alert */}
      {subscription && subscription.days_remaining <= 7 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4"
        >
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {t('dashboard.overview.subscription.expires', { plan: subscription.current_plan, days: subscription.days_remaining })}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                {t('dashboard.overview.subscription.upgrade')}
              </p>
            </div>
            <Link
              to="/dashboard/subscription"
              className="ml-4 px-3 py-1 bg-yellow-600 text-white text-xs font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              {t('dashboard.overview.subscription.upgrade_button')}
            </Link>
          </div>
        </motion.div>
      )}

      {/* Plan Information */}
      {subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('dashboard.overview.subscription.title')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.overview.subscription.current_plan')}</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                    {subscription.current_plan}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.overview.subscription.accounts_used')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {subscription.current_accounts} / {subscription.max_accounts === 999999 ? '∞' : subscription.max_accounts}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.overview.subscription.accounts_remaining')}</span>
                  <span className={`text-sm font-medium ${
                    subscription.max_accounts === 999999 ? 'text-green-600 dark:text-green-400' :
                    (subscription.max_accounts - subscription.current_accounts) <= 2
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {subscription.max_accounts === 999999 ? '∞' : subscription.max_accounts - subscription.current_accounts}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.overview.subscription.expires_in')}</span>
                  <span className={`text-sm font-medium ${
                    subscription.days_remaining <= 7
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {subscription.days_remaining} jours
                  </span>
                </div>
              </div>
            </div>
            {subscription.can_upgrade && (
              <Link
                to="/dashboard/subscription"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                {t('dashboard.overview.subscription.manage')}
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Candidats',
            value: stats?.total_students || 0,
            icon: UserGroupIcon,
            color: 'blue'
          },
          {
            title: 'Moniteurs',
            value: stats?.total_instructors || 0,
            icon: AcademicCapIcon,
            color: 'green'
          },
          {
            title: 'Véhicules',
            value: stats?.total_vehicles || 0,
            icon: TruckIcon,
            color: 'purple'
          },
          {
            title: 'Examens à venir',
            value: stats?.upcoming_exams || 0,
            icon: ClipboardDocumentListIcon,
            color: 'orange'
          }
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Upgrade Prompt */}
      <UpgradePrompt />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1"
        >
          <QuickActions />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <RecentActivity />
        </motion.div>
      </div>

      {/* Upcoming Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <UpcomingEvents />
      </motion.div>
    </div>
  );
};

export default OverviewPage;
