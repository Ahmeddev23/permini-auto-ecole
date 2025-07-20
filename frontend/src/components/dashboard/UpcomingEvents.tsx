import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { dashboardService } from '../../services/dashboardService';
import { toast } from 'react-hot-toast';

interface UpcomingEvent {
  id: string;
  type: 'exam' | 'session' | 'reminder';
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  icon: string;
  color: string;
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'ClipboardDocumentListIcon':
      return ClipboardDocumentListIcon;
    case 'CalendarDaysIcon':
      return CalendarDaysIcon;
    case 'ExclamationTriangleIcon':
      return ExclamationTriangleIcon;
    default:
      return CalendarDaysIcon;
  }
};

const UpcomingEvents: React.FC = () => {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'exam' | 'session' | 'reminder'>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getUpcomingEvents();
      setEvents(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des événements:', error);
      toast.error('Erreur lors du chargement des événements à venir');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.type === filter);

  const getEventColor = (type: string) => {
    if (type === 'exam') return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
    if (type === 'session') return 'border-green-200 bg-green-50 dark:bg-green-900/20';
    if (type === 'reminder') return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
    return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
  };

  const getIconBgColor = (type: string) => {
    if (type === 'exam') return 'bg-blue-100 dark:bg-blue-800/50';
    if (type === 'session') return 'bg-green-100 dark:bg-green-800/50';
    if (type === 'reminder') return 'bg-yellow-100 dark:bg-yellow-800/50';
    return 'bg-gray-100 dark:bg-gray-800/50';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Demain';
    } else {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Événements à venir
        </h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
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
          Événements à venir
        </h3>
        
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous</option>
            <option value="exam">Examens</option>
            <option value="session">Séances</option>
            <option value="reminder">Rappels</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEvents.map((event, index) => {
          const Icon = getIconComponent(event.icon);

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-4 rounded-lg border transition-all duration-200 hover:shadow-md
                ${getEventColor(event.type)}
              `}
            >
              <div className="flex items-start space-x-4">
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                  ${getIconBgColor(event.type)}
                `}>
                  <Icon className={`h-5 w-5 ${event.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h4>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200">
                      Programmé
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {event.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {event.time}
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-8">
          <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucun événement à venir
          </p>
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
