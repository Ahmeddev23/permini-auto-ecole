import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlusIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { dashboardService } from '../../services/dashboardService';
import { toast } from 'react-hot-toast';

interface Activity {
  id: string;
  type: 'student_registered' | 'payment_received' | 'exam_scheduled' | 'exam_completed' | 'exam_failed' | 'vehicle_added' | 'instructor_added' | 'session_completed';
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
  status?: 'success' | 'warning' | 'error';
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'UserPlusIcon':
      return UserPlusIcon;
    case 'CreditCardIcon':
      return CreditCardIcon;
    case 'ClipboardDocumentListIcon':
      return ClipboardDocumentListIcon;
    case 'TruckIcon':
      return TruckIcon;
    case 'CheckCircleIcon':
      return CheckCircleIcon;
    case 'XCircleIcon':
      return XCircleIcon;
    case 'AcademicCapIcon':
      return AcademicCapIcon;
    case 'CalendarDaysIcon':
      return CalendarDaysIcon;
    default:
      return ClockIcon;
  }
};

const formatTimeAgo = (isoString: string) => {
  try {
    // Créer la date en gérant différents formats
    let date: Date;

    // Si c'est déjà un timestamp ou une date valide
    if (isoString.includes('T') || isoString.includes('Z')) {
      date = new Date(isoString);
    } else {
      // Si c'est juste une date (YYYY-MM-DD), ajouter l'heure
      date = new Date(isoString + 'T00:00:00');
    }

    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      console.warn('Date invalide:', isoString);
      return 'Date invalide';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Si la différence est négative (date dans le futur), l'afficher différemment
    if (diffInSeconds < 0) {
      const futureDiff = Math.abs(diffInSeconds);
      if (futureDiff < 3600) return `Dans ${Math.floor(futureDiff / 60)} minutes`;
      if (futureDiff < 86400) return `Dans ${Math.floor(futureDiff / 3600)} heures`;
      if (futureDiff < 604800) return `Dans ${Math.floor(futureDiff / 86400)} jours`;
      return `Le ${date.toLocaleDateString('fr-FR')}`;
    }

    // Formatage pour les dates passées
    if (diffInSeconds < 60) return 'Il y a moins d\'une minute';
    if (diffInSeconds < 120) return 'Il y a 1 minute';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 7200) return 'Il y a 1 heure';
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;
    if (diffInSeconds < 172800) return 'Il y a 1 jour';
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`;
    if (diffInSeconds < 1209600) return 'Il y a 1 semaine';
    if (diffInSeconds < 2629746) return `Il y a ${Math.floor(diffInSeconds / 604800)} semaines`;

    // Pour les dates plus anciennes, afficher la date complète
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error, isoString);
    return 'Date invalide';
  }
};

const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getRecentActivities();

      // Vérifier que data est un tableau
      const activitiesArray = Array.isArray(data) ? data : [];

      // Transformer les données pour ajouter le formatage du temps
      const formattedActivities = activitiesArray.map((activity: any) => ({
        ...activity,
        time: formatTimeAgo(activity.time)
      }));

      setActivities(formattedActivities);
    } catch (error: any) {
      console.error('Erreur lors du chargement des activités:', error);
      toast.error('Erreur lors du chargement des activités récentes');

      // En cas d'erreur, vider la liste
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Activité récente
        </h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Activité récente
        </h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadActivities}
            disabled={loading}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 disabled:opacity-50"
            title="Actualiser"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            Voir tout
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 group"
          >
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
              ${activity.color.includes('blue') ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
              ${activity.color.includes('green') ? 'bg-green-100 dark:bg-green-900/30' : ''}
              ${activity.color.includes('emerald') ? 'bg-emerald-100 dark:bg-emerald-900/30' : ''}
              ${activity.color.includes('purple') ? 'bg-purple-100 dark:bg-purple-900/30' : ''}
              ${activity.color.includes('orange') ? 'bg-orange-100 dark:bg-orange-900/30' : ''}
              ${activity.color.includes('red') ? 'bg-red-100 dark:bg-red-900/30' : ''}
              ${activity.color.includes('indigo') ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}
            `}>
              {React.createElement(getIconComponent(activity.icon), {
                className: `h-5 w-5 ${activity.color}`
              })}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {activity.title}
                </p>
                {getStatusIcon(activity.status)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {activity.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune activité récente
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
