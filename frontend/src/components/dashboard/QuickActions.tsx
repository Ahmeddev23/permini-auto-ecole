import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  UserPlusIcon,
  TruckIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useModal } from '../../contexts/ModalContext';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
}

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { openStudentModal, openVehicleModal, openExamModal } = useModal();

  const quickActions: QuickAction[] = [
    {
      title: 'Nouveau candidat',
      description: 'Inscrire un nouveau candidat',
      icon: UserPlusIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => {
        navigate('/dashboard/students');
        setTimeout(() => openStudentModal(), 100);
      }
    },
    {
      title: 'Ajouter véhicule',
      description: 'Enregistrer un nouveau véhicule',
      icon: TruckIcon,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        navigate('/dashboard/vehicles');
        setTimeout(() => openVehicleModal(), 100);
      }
    },
    {
      title: 'Planifier examen',
      description: 'Programmer un nouvel examen',
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => {
        navigate('/dashboard/exams');
        setTimeout(() => openExamModal(), 100);
      }
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Actions rapides
        </h3>
        <PlusIcon className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.action}
            className="w-full flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
          >
            <div className={`
              ${action.color} 
              p-2 rounded-lg mr-4 transition-colors duration-200
            `}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {action.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {action.description}
              </p>
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/dashboard/help')}
          className="w-full flex items-center justify-center p-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Besoin d'aide ?
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
