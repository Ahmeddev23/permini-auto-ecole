import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Target,
  TrendingUp,
  Award,
  BarChart3,
  FileText,
  Clock,
  Users,
  Brain
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

export const ExamsEvaluationsPage: React.FC = () => {
  const features = [
    {
      icon: FileText,
      title: 'Examens Blancs',
      description: 'Créez et gérez des examens blancs personnalisés pour préparer vos élèves efficacement.',
      details: [
        'Banque de questions actualisée',
        'Examens personnalisables',
        'Correction automatique',
        'Simulation conditions réelles'
      ]
    },
    {
      icon: BarChart3,
      title: 'Suivi des Résultats',
      description: 'Analysez les performances de vos élèves avec des statistiques détaillées.',
      details: [
        'Historique des résultats',
        'Analyse par thématique',
        'Progression individuelle',
        'Comparaison de groupe'
      ]
    },
    {
      icon: TrendingUp,
      title: 'Statistiques Détaillées',
      description: 'Obtenez des insights précis sur les points forts et faibles de chaque élève.',
      details: [
        'Graphiques de progression',
        'Points faibles identifiés',
        'Recommandations personnalisées',
        'Prédiction de réussite'
      ]
    },
    {
      icon: Brain,
      title: 'Préparation Personnalisée',
      description: 'Adaptez la préparation selon les besoins spécifiques de chaque élève.',
      details: [
        'Plans de révision adaptés',
        'Exercices ciblés',
        'Rappels automatiques',
        'Suivi des objectifs'
      ]
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Taux de Réussite +35%',
      description: 'Améliorez significativement le taux de réussite de vos élèves'
    },
    {
      icon: Clock,
      title: 'Gain de Temps',
      description: 'Automatisez la correction et économisez 5h par semaine'
    },
    {
      icon: Award,
      title: 'Préparation Optimale',
      description: 'Préparez vos élèves dans les meilleures conditions'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/20 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ 
              rotate: { duration: 50, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -top-40 -right-40 w-80 h-80 border border-purple-200/30 dark:border-purple-800/30 rounded-full"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Contenu gauche */}
            <div>
              <FloatingElement delay={0.2}>
                <div className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium mb-6">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Examens & Évaluations
                </div>
              </FloatingElement>

              <FloatingElement delay={0.4}>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                  Examens &
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400">
                    Évaluations
                  </span>
                </h1>
              </FloatingElement>

              <FloatingElement delay={0.6}>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  Préparez vos élèves au succès avec des examens blancs personnalisés, 
                  un suivi détaillé des performances et des recommandations intelligentes.
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
                      className="inline-flex items-center px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
                      className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500 font-semibold rounded-lg transition-all duration-200"
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Voir la démo
                    </Link>
                  </motion.div>
                </div>
              </FloatingElement>
            </div>

            {/* Visuel droite - Interface d'examen */}
            <FloatingElement delay={1.0} className="relative">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
                  {/* Header examen */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Examen Blanc - Code</h3>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">25:30</span>
                    </div>
                  </div>
                  
                  {/* Question mockup */}
                  <div className="mb-6">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        Question 15/40: À quelle distance minimale devez-vous vous arrêter derrière un véhicule ?
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="bg-purple-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '37.5%' }}
                          transition={{ duration: 1, delay: 1.2 }}
                        />
                      </div>
                    </div>
                    
                    {/* Options */}
                    <div className="space-y-2">
                      {[
                        { text: 'A. 1 mètre', correct: false },
                        { text: 'B. 2 mètres', correct: true },
                        { text: 'C. 3 mètres', correct: false },
                        { text: 'D. 5 mètres', correct: false }
                      ].map((option, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.3 + index * 0.1 }}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            option.correct 
                              ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700' 
                              : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500'
                          }`}
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">{option.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Statistiques */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Bonnes', value: '12', color: 'text-green-600' },
                      { label: 'Mauvaises', value: '3', color: 'text-red-600' },
                      { label: 'Score', value: '80%', color: 'text-purple-600' }
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.7 + index * 0.1 }}
                        className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                      </motion.div>
                    ))}
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
              Préparation Complète aux Examens
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Tous les outils nécessaires pour préparer vos élèves dans les meilleures conditions.
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
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mr-4">
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
                      <CheckCircle className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
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
              Résultats Exceptionnels
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Une préparation optimale pour des résultats qui dépassent vos attentes.
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
                className="text-center p-8 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6">
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
      <section className="py-20 bg-gradient-to-br from-purple-600 to-violet-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Prêt à améliorer vos résultats ?
            </h2>
            <p className="text-xl text-purple-100 mb-10">
              Donnez à vos élèves tous les outils pour réussir leur examen du premier coup.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200"
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
