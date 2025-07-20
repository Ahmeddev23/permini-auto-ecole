import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Brain,
  Eye,
  Download
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

export const ReportsAnalyticsPage: React.FC = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Tableaux de Bord',
      description: 'Visualisez toutes vos métriques importantes sur des tableaux de bord interactifs et personnalisables.',
      details: [
        'Métriques en temps réel',
        'Widgets personnalisables',
        'Vues multi-périodes',
        'Alertes automatiques'
      ]
    },
    {
      icon: Brain,
      title: 'Analytics Avancés',
      description: 'Analysez en profondeur vos données avec des outils d\'analyse powered by IA.',
      details: [
        'Analyse prédictive',
        'Détection de tendances',
        'Corrélations automatiques',
        'Recommandations IA'
      ]
    },
    {
      icon: PieChart,
      title: 'Rapports Personnalisés',
      description: 'Créez des rapports sur mesure pour chaque aspect de votre auto-école.',
      details: [
        'Générateur de rapports',
        'Templates prêts à l\'emploi',
        'Planification automatique',
        'Export multi-formats'
      ]
    },
    {
      icon: Eye,
      title: 'Insights IA',
      description: 'Obtenez des insights intelligents pour optimiser vos performances.',
      details: [
        'Analyse comportementale',
        'Prédictions de performance',
        'Optimisations suggérées',
        'Benchmarking intelligent'
      ]
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Décisions Éclairées',
      description: 'Prenez des décisions basées sur des données concrètes'
    },
    {
      icon: TrendingUp,
      title: 'Performance +25%',
      description: 'Améliorez vos performances grâce aux insights'
    },
    {
      icon: Download,
      title: 'Rapports Automatisés',
      description: 'Économisez du temps avec la génération automatique'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-100 dark:from-gray-900 dark:via-indigo-900/20 dark:to-blue-900/20 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ 
              rotate: { duration: 50, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -top-40 -right-40 w-80 h-80 border border-indigo-200/30 dark:border-indigo-800/30 rounded-full"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Contenu gauche */}
            <div>
              <FloatingElement delay={0.2}>
                <div className="inline-flex items-center px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium mb-6">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Rapports & Analytics
                </div>
              </FloatingElement>

              <FloatingElement delay={0.4}>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                  Rapports &
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
                    Analytics
                  </span>
                </h1>
              </FloatingElement>

              <FloatingElement delay={0.6}>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  Transformez vos données en insights actionables avec des tableaux de bord 
                  intelligents et des analyses powered by IA.
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
                      className="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
                      className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-500 font-semibold rounded-lg transition-all duration-200"
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Voir la démo
                    </Link>
                  </motion.div>
                </div>
              </FloatingElement>
            </div>

            {/* Visuel droite - Dashboard analytics */}
            <FloatingElement delay={1.0} className="relative">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard Analytics</h3>
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">IA Active</span>
                    </div>
                  </div>
                  
                  {/* Métriques principales */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { label: 'Revenus', value: '€45,230', change: '+12%', color: 'text-green-600' },
                      { label: 'Élèves', value: '156', change: '+8%', color: 'text-blue-600' },
                      { label: 'Taux réussite', value: '87%', change: '+5%', color: 'text-purple-600' },
                      { label: 'Satisfaction', value: '4.8/5', change: '+0.3', color: 'text-orange-600' }
                    ].map((metric, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{metric.label}</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
                        <div className={`text-sm ${metric.color} flex items-center`}>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {metric.change}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Graphique simulé */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Évolution mensuelle</span>
                      <LineChart className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="h-24 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-lg flex items-end justify-between p-2">
                      {[40, 65, 45, 80, 60, 90, 75].map((height, index) => (
                        <motion.div
                          key={index}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 1.6 + index * 0.1, duration: 0.5 }}
                          className="bg-gradient-to-t from-indigo-500 to-blue-500 rounded-sm"
                          style={{ width: '8px' }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Insights IA */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Brain className="w-4 h-4 text-indigo-600 mr-2" />
                      <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Insight IA</span>
                    </div>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      Vos cours du matin ont un taux de réussite 15% supérieur. 
                      Considérez augmenter ces créneaux.
                    </p>
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
              Intelligence Artificielle au Service de Vos Données
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Transformez vos données brutes en insights actionables pour optimiser votre auto-école.
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
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
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
                      <CheckCircle className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
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
              Des Données qui Transforment Votre Business
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Utilisez la puissance de l'analytics pour optimiser chaque aspect de votre auto-école.
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
                className="text-center p-8 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
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
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Prêt à exploiter vos données ?
            </h2>
            <p className="text-xl text-indigo-100 mb-10">
              Découvrez des insights cachés et optimisez vos performances avec notre IA.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200"
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
