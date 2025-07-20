import React from 'react';
import { motion } from 'framer-motion';
import { 
  LockClosedIcon, 
  StarIcon, 
  ArrowUpIcon 
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface PlanRestrictionProps {
  feature: string;
  requiredPlan: 'standard' | 'premium';
  currentPlan: string;
  description?: string;
  className?: string;
}

const PlanRestriction: React.FC<PlanRestrictionProps> = ({
  feature,
  requiredPlan,
  currentPlan,
  description,
  className = ''
}) => {
  const planHierarchy = { standard: 1, premium: 2 };
  const currentLevel = planHierarchy[currentPlan as keyof typeof planHierarchy] || 1;
  const requiredLevel = planHierarchy[requiredPlan];

  // Si l'utilisateur a déjà accès à cette fonctionnalité
  if (currentLevel >= requiredLevel) {
    return null;
  }

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'standard': return 'Standard';
      case 'premium': return 'Premium';
      default: return plan;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'standard': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'premium': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-600">
            <LockClosedIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {feature}
          </h3>
          
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {description}
            </p>
          )}
          
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Disponible avec le plan
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(requiredPlan)}`}>
              <StarIcon className="h-3 w-3 mr-1" />
              {getPlanName(requiredPlan)}
            </span>
          </div>
          
          <Link
            to="/dashboard/subscription"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <ArrowUpIcon className="h-4 w-4 mr-2" />
            Mettre à niveau
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PlanRestriction;
