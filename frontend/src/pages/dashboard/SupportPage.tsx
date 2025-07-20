import React from 'react';
import { motion } from 'framer-motion';
import SupportTickets from '../../components/support/SupportTickets';
import SupportFloatingButton from '../../components/common/SupportFloatingButton';

const SupportPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Support Technique
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos demandes de support et consultez les réponses de notre équipe
          </p>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <SupportTickets />
      </motion.div>

      {/* Informations d'aide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6"
      >
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Conseils pour une demande de support efficace
        </h3>
        <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
          <li>• Décrivez clairement le problème rencontré</li>
          <li>• Mentionnez les étapes que vous avez déjà essayées</li>
          <li>• Indiquez quand le problème survient (toujours, parfois, etc.)</li>
          <li>• Ajoutez des détails sur votre environnement si pertinent</li>
        </ul>
      </motion.div>

      {/* Le bouton flottant sera toujours visible */}
    </div>
  );
};

export default SupportPage;
