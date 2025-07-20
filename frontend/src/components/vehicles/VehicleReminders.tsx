import React from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import { Card } from '../common/Card';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  license_plate: string;
  insurance_expiry_date: string;
  technical_inspection_date: string;
}

interface VehicleRemindersProps {
  vehicles: Vehicle[];
}

const VehicleReminders: React.FC<VehicleRemindersProps> = ({ vehicles }) => {
  // Fonction pour calculer les jours restants
  const getDaysUntilExpiry = (dateString: string): number => {
    if (!dateString) return 999; // Retourner une valeur élevée pour les dates non définies

    const today = new Date();
    const expiryDate = new Date(dateString);

    // Vérifier si la date est valide
    if (isNaN(expiryDate.getTime())) return 999;

    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Fonction pour obtenir le statut et la couleur selon les jours restants
  const getStatusInfo = (days: number) => {
    if (days < 0) {
      return {
        status: 'expired',
        label: 'Expiré',
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: ExclamationTriangleIcon,
        priority: 'critical'
      };
    } else if (days <= 3) {
      return {
        status: 'critical',
        label: 'Urgent',
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/10',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: BellAlertIcon,
        priority: 'critical'
      };
    } else if (days <= 7) {
      return {
        status: 'warning',
        label: 'Attention',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/10',
        borderColor: 'border-orange-200 dark:border-orange-800',
        icon: ExclamationTriangleIcon,
        priority: 'warning'
      };
    } else if (days <= 30) {
      return {
        status: 'info',
        label: 'À prévoir',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/10',
        borderColor: 'border-blue-200 dark:border-blue-800',
        icon: ClockIcon,
        priority: 'info'
      };
    } else {
      return {
        status: 'ok',
        label: 'OK',
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/10',
        borderColor: 'border-green-200 dark:border-green-800',
        icon: ShieldCheckIcon,
        priority: 'ok'
      };
    }
  };

  // Créer la liste des rappels
  const reminders = vehicles.flatMap(vehicle => {
    const insuranceDays = getDaysUntilExpiry(vehicle.insurance_expiry_date);
    const technicalDays = getDaysUntilExpiry(vehicle.technical_inspection_date);

    const items = [];

    // Rappel assurance (seulement si la date est valide et dans les 30 jours)
    if (vehicle.insurance_expiry_date && insuranceDays <= 30 && insuranceDays !== 999) {
      const insuranceStatus = getStatusInfo(insuranceDays);
      items.push({
        id: `insurance-${vehicle.id}`,
        vehicle,
        type: 'insurance',
        typeLabel: 'Assurance',
        icon: ShieldCheckIcon,
        days: insuranceDays,
        date: vehicle.insurance_expiry_date,
        ...insuranceStatus
      });
    }
    
    // Rappel visite technique (seulement si la date est valide et dans les 30 jours)
    if (vehicle.technical_inspection_date && technicalDays <= 30 && technicalDays !== 999) {
      const technicalStatus = getStatusInfo(technicalDays);
      items.push({
        id: `technical-${vehicle.id}`,
        vehicle,
        type: 'technical',
        typeLabel: 'Visite technique',
        icon: WrenchScrewdriverIcon,
        days: technicalDays,
        date: vehicle.technical_inspection_date,
        ...technicalStatus
      });
    }
    
    return items;
  });

  // Trier par priorité et jours restants
  const sortedReminders = reminders.sort((a, b) => {
    const priorityOrder = { critical: 0, warning: 1, info: 2, ok: 3 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    }
    return a.days - b.days;
  });

  // Statistiques des rappels
  const stats = {
    critical: reminders.filter(r => r.priority === 'critical').length,
    warning: reminders.filter(r => r.priority === 'warning').length,
    info: reminders.filter(r => r.priority === 'info').length,
    total: reminders.length
  };

  if (reminders.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center">
          <ShieldCheckIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Tous les véhicules sont à jour
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune échéance d'assurance ou de visite technique dans les 30 prochains jours.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques des rappels */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Critiques</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.warning}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Attention</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.info}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">À prévoir</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
          </div>
        </Card>
      </div>

      {/* Liste des rappels */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <BellAlertIcon className="h-5 w-5 mr-2" />
            Rappels d'échéances
          </h3>
          
          <div className="space-y-3">
            {sortedReminders.map((reminder, index) => {
              const Icon = reminder.icon;
              const TypeIcon = reminder.type === 'insurance' ? ShieldCheckIcon : WrenchScrewdriverIcon;
              
              return (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${reminder.borderColor} ${reminder.bgColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <TypeIcon className={`h-6 w-6 ${reminder.color}`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {reminder.vehicle.brand} {reminder.vehicle.model}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({reminder.vehicle.license_plate})
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {reminder.typeLabel} • {new Date(reminder.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reminder.color} ${reminder.bgColor}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {reminder.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {reminder.days < 0 
                          ? `Expiré depuis ${Math.abs(reminder.days)} jour(s)`
                          : reminder.days === 0 
                            ? "Expire aujourd'hui"
                            : `Dans ${reminder.days} jour(s)`
                        }
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VehicleReminders;
