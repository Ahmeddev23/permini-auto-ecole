import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Car,
  CheckCircle,
  ArrowRight,
  Star,
  Wrench,
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  Calendar,
  MapPin,
  Fuel
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

export const FleetManagementPage: React.FC = () => {
  const features = [
    {
      icon: Car,
      title: 'Suivi des Véhicules',
      description: 'Surveillez l\'état, la localisation et l\'utilisation de chaque véhicule en temps réel.',
      details: [
        'Géolocalisation en temps réel',
        'Historique des trajets',
        'Consommation de carburant',
        'État technique du véhicule'
      ]
    },
    {
      icon: Wrench,
      title: 'Maintenance Préventive',
      description: 'Planifiez et suivez les maintenances pour éviter les pannes et optimiser la durée de vie.',
      details: [
        'Calendrier de maintenance automatique',
        'Alertes préventives',
        'Historique des interventions',
        'Coûts de maintenance'
      ]
    },
    {
      icon: Calendar,
      title: 'Réservations Véhicules',
      description: 'Gérez les réservations et l\'attribution des véhicules aux moniteurs et élèves.',
      details: [
        'Planning de réservation',
        'Attribution automatique',
        'Gestion des conflits',
        'Optimisation des trajets'
      ]
    },
    {
      icon: AlertTriangle,
      title: 'Contrôles Techniques',
      description: 'Suivez les échéances des contrôles techniques et assurances.',
      details: [
        'Alertes d\'échéance',
        'Documents numériques',
        'Rappels automatiques',
        'Conformité réglementaire'
      ]
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Réduction des Coûts',
      description: 'Diminuez vos coûts de maintenance de 30%'
    },
    {
      icon: TrendingUp,
      title: 'Disponibilité +25%',
      description: 'Augmentez la disponibilité de votre flotte'
    },
    {
      icon: Fuel,
      title: 'Économie Carburant',
      description: 'Réduisez la consommation de 15% avec l\'optimisation'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100 dark:from-gray-900 dark:via-orange-900/20 dark:to-amber-900/20 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ 
              rotate: { duration: 50, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -top-40 -right-40 w-80 h-80 border border-orange-200/30 dark:border-orange-800/30 rounded-full"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Contenu gauche */}
            <div>
              <FloatingElement delay={0.2}>
                <div className="inline-flex items-center px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium mb-6">
                  <Car className="w-4 h-4 mr-2" />
                  Gestion de Flotte
                </div>
              </FloatingElement>

              <FloatingElement delay={0.4}>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                  Gestion
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400">
                    de Flotte
                  </span>
                </h1>
              </FloatingElement>

              <FloatingElement delay={0.6}>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  Optimisez la gestion de votre flotte de véhicules avec un suivi en temps réel, 
                  une maintenance préventive et une planification intelligente.
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
                      className="inline-flex items-center px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
                      className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-500 font-semibold rounded-lg transition-all duration-200"
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Voir la démo
                    </Link>
                  </motion.div>
                </div>
              </FloatingElement>
            </div>

            {/* Visuel droite - Dashboard flotte */}
            <FloatingElement delay={1.0} className="relative">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Flotte Auto-École</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">8/10 Disponibles</span>
                    </div>
                  </div>
                  
                  {/* Véhicules */}
                  <div className="space-y-3">
                    {[
                      { id: 'VH001', model: 'Peugeot 208', status: 'En cours', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200', km: '45,230' },
                      { id: 'VH002', model: 'Renault Clio', status: 'Disponible', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200', km: '32,150' },
                      { id: 'VH003', model: 'Citroën C3', status: 'Maintenance', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200', km: '67,890' },
                      { id: 'VH004', model: 'Ford Fiesta', status: 'Disponible', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200', km: '28,450' }
                    ].map((vehicle, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        className={`p-4 rounded-lg ${vehicle.color} flex items-center justify-between`}
                      >
                        <div className="flex items-center space-x-3">
                          <Car className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{vehicle.id}</div>
                            <div className="text-sm opacity-75">{vehicle.model}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs px-2 py-1 bg-white/20 rounded mb-1">
                            {vehicle.status}
                          </div>
                          <div className="text-xs opacity-75">{vehicle.km} km</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Statistiques */}
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {[
                      { label: 'Disponibles', value: '8/10', color: 'text-green-600' },
                      { label: 'Maintenance', value: '1', color: 'text-orange-600' },
                      { label: 'Utilisation', value: '85%', color: 'text-blue-600' }
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.6 + index * 0.1 }}
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
              Gestion Complète de Votre Flotte
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              De la maintenance préventive au suivi en temps réel, optimisez chaque aspect de votre flotte.
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
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mr-4">
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
                      <CheckCircle className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
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
              Optimisez Vos Coûts et Performances
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Une gestion intelligente de votre flotte pour des économies substantielles.
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
                className="text-center p-8 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
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
      <section className="py-20 bg-gradient-to-br from-orange-600 to-amber-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Prêt à optimiser votre flotte ?
            </h2>
            <p className="text-xl text-orange-100 mb-10">
              Réduisez vos coûts, améliorez la disponibilité et optimisez l'utilisation 
              de vos véhicules avec Permini.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200"
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
