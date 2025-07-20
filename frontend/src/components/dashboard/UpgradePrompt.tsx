import React from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon, 
  ArrowUpIcon, 
  SparklesIcon,
  TruckIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { usePlanPermissions } from '../../hooks/usePlanPermissions';

const UpgradePrompt: React.FC = () => {
  const { permissions } = usePlanPermissions();

  // Ne pas afficher si l'utilisateur a déjà le plan premium
  if (!permissions || permissions.currentPlan === 'premium') {
    return null;
  }

  const getUpgradeMessage = () => {
    if (permissions.currentPlan === 'standard') {
      return {
        title: 'Passez au niveau supérieur avec Premium',
        subtitle: 'Accédez aux statistiques avancées et à la gestion financière complète',
        features: ['Candidats illimités', 'Statistiques avancées', 'Gestion financière']
      };
    } else {
      return {
        title: 'Découvrez nos plans premium',
        subtitle: 'Choisissez le plan qui correspond le mieux à vos besoins',
        features: ['Gestion complète', 'Support prioritaire', 'Fonctionnalités avancées']
      };
    }
  };

  const { title, subtitle, features } = getUpgradeMessage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
        <SparklesIcon className="h-24 w-24" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <StarIcon className="h-6 w-6 text-yellow-300" />
              <span className="text-sm font-medium text-blue-100">
                {permissions.currentPlan === 'standard' ? 'Plan Standard (30j gratuits)' : 'Plan Premium'}
              </span>
            </div>
            
            <h3 className="text-xl font-bold mb-2">
              {title}
            </h3>
            
            <p className="text-blue-100 mb-4">
              {subtitle}
            </p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {feature.includes('véhicules') && <TruckIcon className="h-4 w-4 text-green-300" />}
                  {feature.includes('Statistiques') && <ChartBarIcon className="h-4 w-4 text-green-300" />}
                  {feature.includes('financière') && <CurrencyDollarIcon className="h-4 w-4 text-green-300" />}
                  {!feature.includes('véhicules') && !feature.includes('Statistiques') && !feature.includes('financière') && 
                    <StarIcon className="h-4 w-4 text-green-300" />}
                  <span className="text-sm text-blue-100">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/dashboard/subscription"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            <ArrowUpIcon className="h-5 w-5 mr-2" />
            Voir les Plans
          </Link>
          
          {permissions.daysRemaining <= 7 && (
            <div className="flex items-center space-x-2 text-yellow-200 text-sm">
              <span className="animate-pulse">⚠️</span>
              <span>Votre plan expire dans {permissions.daysRemaining} jour(s)</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UpgradePrompt;
