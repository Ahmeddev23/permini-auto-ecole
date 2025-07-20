import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  BarChart3,
  FileText,
  Calendar,
  Award,
  Target,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';

// Composant pour les éléments flottants
const FloatingElement: React.FC<{ delay: number; children: React.ReactNode; className?: string }> = ({ delay, children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StudentManagementPage: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: 'Dossiers Élèves Complets',
      description: 'Centralisez toutes les informations de vos élèves dans des dossiers numériques complets et sécurisés.',
      details: [
        'Informations personnelles et contacts',
        'Documents administratifs numérisés',
        'Historique complet des interactions',
        'Notes et commentaires personnalisés'
      ]
    },
    {
      icon: BarChart3,
      title: 'Suivi des Progrès',
      description: 'Suivez en temps réel les progrès de chaque élève avec des indicateurs visuels clairs.',
      details: [
        'Graphiques de progression détaillés',
        'Évaluations par compétences',
        'Objectifs personnalisés',
        'Alertes de performance'
      ]
    },
    {
      icon: Calendar,
      title: 'Historique des Cours',
      description: 'Consultez l\'historique complet des cours de chaque élève avec tous les détails.',
      details: [
        'Calendrier des cours passés',
        'Durée et type de chaque leçon',
        'Évaluations post-cours',
        'Statistiques de présence'
      ]
    },
    {
      icon: Award,
      title: 'Notes et Évaluations',
      description: 'Système d\'évaluation complet pour suivre les compétences et la progression.',
      details: [
        'Grilles d\'évaluation personnalisables',
        'Notes par compétences',
        'Commentaires détaillés',
        'Rapports de progression'
      ]
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Efficacité Accrue',
      description: 'Réduisez le temps administratif de 60% grâce à l\'automatisation'
    },
    {
      icon: TrendingUp,
      title: 'Meilleur Suivi',
      description: 'Améliorez le taux de réussite de vos élèves de 25%'
    },
    {
      icon: Clock,
      title: 'Gain de Temps',
      description: 'Économisez 2h par jour sur la gestion administrative'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ 
              rotate: { duration: 50, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -top-40 -right-40 w-80 h-80 border border-blue-200/30 dark:border-blue-800/30 rounded-full"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Contenu gauche */}
            <div>
              <FloatingElement delay={0.2}>
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-6">
                  <Users className="w-4 h-4 mr-2" />
                  Gestion des Élèves
                </div>
              </FloatingElement>

              <FloatingElement delay={0.4}>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                  Gestion Complète
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    des Élèves
                  </span>
                </h1>
              </FloatingElement>

              <FloatingElement delay={0.6}>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  Centralisez toutes les informations de vos élèves, suivez leurs progrès en temps réel 
                  et optimisez leur parcours d'apprentissage avec notre système de gestion avancé.
                </p>
              </FloatingElement>

              <FloatingElement delay={0.8}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Essayer gratuitement
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/demo"
                      className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500 font-semibold rounded-lg transition-all duration-200"
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Voir la démo
                    </Link>
                  </motion.div>
                </div>
              </FloatingElement>
            </div>

            {/* Visuel droite */}
            <FloatingElement delay={1.0} className="relative">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="space-y-6">
                    {/* Header mockup */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dossier Élève</h3>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Profile mockup */}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-24"></div>
                      </div>
                    </div>
                    
                    {/* Progress bars */}
                    <div className="space-y-4">
                      {[
                        { label: 'Code de la route', progress: 85, color: 'bg-green-500' },
                        { label: 'Conduite', progress: 65, color: 'bg-blue-500' },
                        { label: 'Manœuvres', progress: 40, color: 'bg-orange-500' }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 + index * 0.1 }}
                        >
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                            <span className="text-gray-900 dark:text-white font-medium">{item.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                              className={`h-2 rounded-full ${item.color}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ duration: 1, delay: 1.4 + index * 0.1 }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </FloatingElement>
          </div>
        </div>
      </section>

      {/* Fonctionnalités détaillées */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Fonctionnalités Détaillées
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Découvrez tous les outils disponibles pour une gestion optimale de vos élèves.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {feature.description}
                </p>
                
                <ul className="space-y-3">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bénéfices */}
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
              Les Bénéfices Concrets
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Découvrez l'impact positif de notre système de gestion des élèves sur votre auto-école.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Prêt à optimiser la gestion de vos élèves ?
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Commencez votre essai gratuit dès aujourd'hui et découvrez comment Permini peut 
              transformer la gestion de votre auto-école.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200"
                >
                  <Zap className="w-6 h-6 mr-3" />
                  Essai gratuit 30 jours
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom spacing */}
      <div className="pb-16"></div>
    </div>
  );
};
