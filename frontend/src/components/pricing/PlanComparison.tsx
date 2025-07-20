import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Star, Crown } from 'lucide-react';

interface Feature {
  name: string;
  standard: boolean | string;
  premium: boolean | string;
  category: string;
}

export const PlanComparison: React.FC = () => {
  const features: Feature[] = [
    // Essai et candidats
    { name: 'Essai gratuit à l\'inscription', standard: true, premium: false, category: 'Essai' },
    { name: 'Nombre de candidats', standard: '200 (+50/renouvellement)', premium: 'Illimité', category: 'Candidats' },
    { name: 'Gestion complète des candidats avec progression automatique', standard: true, premium: true, category: 'Candidats' },

    // Gestion de base
    { name: 'Gestion des moniteurs - Ajout, modification et suivi', standard: true, premium: true, category: 'Gestion' },
    { name: 'Planning et séances - Planification des cours théoriques et pratiques', standard: true, premium: true, category: 'Gestion' },
    { name: 'Gestion des examens - Suivi des examens théoriques et pratiques', standard: true, premium: true, category: 'Gestion' },
    { name: 'Gestion des véhicules - Suivi des véhicules et de leur état', standard: true, premium: true, category: 'Gestion' },
    { name: 'Gestion des paiements - Suivi des paiements des candidats', standard: true, premium: true, category: 'Gestion' },

    // Statistiques et notifications
    { name: 'Statistiques de base - Tableaux de bord avec statistiques essentielles', standard: true, premium: true, category: 'Analytics' },
    { name: 'Notifications en temps réel - Alertes pour les événements importants', standard: true, premium: true, category: 'Analytics' },

    // Fonctionnalités avancées (Premium uniquement)
    { name: 'Comptabilité avancée - Gestion financière complète avec rapports', standard: false, premium: true, category: 'Avancé' },
    { name: 'Messagerie intégrée - Communication en temps réel entre tous les utilisateurs', standard: false, premium: true, category: 'Avancé' },
    { name: 'Dépenses véhicules - Suivi détaillé des coûts par véhicule', standard: false, premium: true, category: 'Avancé' },
    { name: 'Support prioritaire - Assistance technique prioritaire', standard: false, premium: true, category: 'Avancé' }
  ];

  const categories = [...new Set(features.map(f => f.category))];

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-400 mx-auto" />
      );
    }
    return <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>;
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Comparaison Détaillée des Plans
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Découvrez en détail ce qui est inclus dans chaque plan pour faire le meilleur choix.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          {/* Header du tableau */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Fonctionnalités
                </h3>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Star className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Standard
                  </h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">49 DT/mois</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                    Essai gratuit
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Premium
                  </h3>
                  <span className="inline-flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
                    Populaire
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">99 DT/mois</p>
              </div>
            </div>
          </div>

          {/* Contenu du tableau */}
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {categories.map((category, categoryIndex) => (
              <div key={category}>
                {/* Header de catégorie */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: categoryIndex * 0.1 }}
                  className="bg-gray-25 dark:bg-gray-750 px-6 py-3"
                >
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {category}
                  </h4>
                </motion.div>

                {/* Fonctionnalités de la catégorie */}
                {features
                  .filter(feature => feature.category === category)
                  .map((feature, featureIndex) => (
                    <motion.div
                      key={feature.name}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (categoryIndex * 0.1) + (featureIndex * 0.05) }}
                      className="grid grid-cols-3 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <div className="text-left">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature.name}
                        </span>
                      </div>
                      <div className="text-center">
                        {renderFeatureValue(feature.standard)}
                      </div>
                      <div className="text-center">
                        {renderFeatureValue(feature.premium)}
                      </div>
                    </motion.div>
                  ))}
              </div>
            ))}
          </div>

          {/* Footer avec CTA */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-6 border-t border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-3 gap-4">
              <div></div>
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Choisir Standard
                </motion.button>
              </div>
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Choisir Premium
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
