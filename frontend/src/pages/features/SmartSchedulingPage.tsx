import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  ArrowRight,
  Star,
  Clock,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
  Settings,
  Users,
  Car
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

export const SmartSchedulingPage: React.FC = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Planification Automatique',
      description: 'Notre IA analyse les disponibilités et optimise automatiquement votre planning.',
      details: [
        'Algorithme d\'optimisation avancé',
        'Prise en compte des préférences',
        'Maximisation du taux d\'occupation',
        'Planification sur plusieurs semaines'
      ]
    },
    {
      icon: AlertCircle,
      title: 'Gestion des Conflits',
      description: 'Détection et résolution automatique des conflits d\'horaires.',
      details: [
        'Détection en temps réel',
        'Suggestions de résolution',
        'Notifications automatiques',
        'Historique des modifications'
      ]
    },
    {
      icon: Target,
      title: 'Optimisation des Créneaux',
      description: 'Maximisez l\'utilisation de vos ressources avec une optimisation intelligente.',
      details: [
        'Analyse des créneaux libres',
        'Optimisation des trajets',
        'Répartition équilibrée',
        'Suggestions d\'amélioration'
      ]
    },
    {
      icon: Settings,
      title: 'Synchronisation Calendrier',
      description: 'Synchronisez avec Google Calendar, Outlook et autres calendriers.',
      details: [
        'Synchronisation bidirectionnelle',
        'Mise à jour en temps réel',
        'Support multi-calendriers',
        'Notifications push'
      ]
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Gain de Temps',
      description: 'Économisez 3h par semaine sur la planification'
    },
    {
      icon: TrendingUp,
      title: 'Efficacité +40%',
      description: 'Augmentez votre taux d\'occupation de 40%'
    },
    {
      icon: Users,
      title: 'Satisfaction Client',
      description: 'Améliorez la satisfaction de 30% avec des créneaux optimaux'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ 
              rotate: { duration: 50, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -top-40 -right-40 w-80 h-80 border border-green-200/30 dark:border-green-800/30 rounded-full"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Contenu gauche */}
            <div>
              <FloatingElement delay={0.2}>
                <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium mb-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  Planning Intelligent
                </div>
              </FloatingElement>

              <FloatingElement delay={0.4}>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                  Planning
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
                    Intelligent
                  </span>
                </h1>
              </FloatingElement>

              <FloatingElement delay={0.6}>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  Optimisez automatiquement vos créneaux, évitez les conflits d'horaires et 
                  maximisez l'utilisation de vos ressources avec notre IA de planification avancée.
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
                      className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
                      className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-500 font-semibold rounded-lg transition-all duration-200"
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Voir la démo
                    </Link>
                  </motion.div>
                </div>
              </FloatingElement>
            </div>

            {/* Visuel droite - Calendrier mockup */}
            <FloatingElement delay={1.0} className="relative">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
                  {/* Header calendrier */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Planning Optimisé</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">IA Active</span>
                    </div>
                  </div>
                  
                  {/* Grille calendrier */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                      <div key={index} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Créneaux */}
                  <div className="space-y-2">
                    {[
                      { time: '09:00', student: 'Marie D.', type: 'Conduite', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
                      { time: '10:30', student: 'Ahmed K.', type: 'Code', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' },
                      { time: '14:00', student: 'Sophie L.', type: 'Conduite', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' },
                      { time: '15:30', student: 'Optimisé par IA', type: 'Libre', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' }
                    ].map((slot, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        className={`p-3 rounded-lg ${slot.color} flex items-center justify-between`}
                      >
                        <div>
                          <div className="font-medium">{slot.time}</div>
                          <div className="text-sm opacity-75">{slot.student}</div>
                        </div>
                        <div className="text-xs px-2 py-1 bg-white/20 rounded">
                          {slot.type}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Statistiques */}
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {[
                      { label: 'Taux', value: '95%' },
                      { label: 'Conflits', value: '0' },
                      { label: 'Optimisé', value: '100%' }
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.6 + index * 0.1 }}
                        className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{stat.value}</div>
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
              Intelligence Artificielle au Service de Votre Planning
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Notre IA analyse en permanence vos données pour optimiser automatiquement votre planning.
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
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
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
              Résultats Mesurables
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Découvrez l'impact concret de notre planning intelligent sur votre activité.
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
                className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
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
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Prêt à optimiser votre planning ?
            </h2>
            <p className="text-xl text-green-100 mb-10">
              Laissez notre IA gérer votre planning pendant que vous vous concentrez 
              sur l'enseignement de la conduite.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200"
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
