import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Phone,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Target,
  TrendingUp,
  MessageSquare,
  Mail,
  Bell,
  Users,
  Send
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

export const CommunicationPage: React.FC = () => {
  const features = [
    {
      icon: MessageSquare,
      title: 'SMS Automatiques',
      description: 'Envoyez des SMS automatiques pour les rappels de cours, confirmations et notifications importantes.',
      details: [
        'Rappels de rendez-vous automatiques',
        'Confirmations d\'inscription',
        'Notifications d\'annulation',
        'Messages personnalisés'
      ]
    },
    {
      icon: Mail,
      title: 'Emails Personnalisés',
      description: 'Créez et envoyez des emails avec des templates personnalisables pour chaque occasion.',
      details: [
        'Templates professionnels',
        'Personnalisation avancée',
        'Envoi en masse',
        'Suivi des ouvertures'
      ]
    },
    {
      icon: Bell,
      title: 'Notifications Push',
      description: 'Notifications instantanées sur mobile pour une communication en temps réel.',
      details: [
        'Notifications temps réel',
        'Alertes importantes',
        'Rappels personnalisés',
        'Accusés de réception'
      ]
    },
    {
      icon: Send,
      title: 'Templates Modulables',
      description: 'Bibliothèque de templates prêts à l\'emploi et entièrement personnalisables.',
      details: [
        'Bibliothèque complète',
        'Éditeur intuitif',
        'Variables dynamiques',
        'Prévisualisation en temps réel'
      ]
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Engagement +50%',
      description: 'Améliorez l\'engagement de vos élèves avec une communication efficace'
    },
    {
      icon: TrendingUp,
      title: 'Présence +30%',
      description: 'Réduisez les absences grâce aux rappels automatiques'
    },
    {
      icon: Users,
      title: 'Satisfaction Client',
      description: 'Améliorez la satisfaction avec une communication proactive'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-pink-50 via-rose-50 to-red-100 dark:from-gray-900 dark:via-pink-900/20 dark:to-rose-900/20 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ 
              rotate: { duration: 50, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -top-40 -right-40 w-80 h-80 border border-pink-200/30 dark:border-pink-800/30 rounded-full"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Contenu gauche */}
            <div>
              <FloatingElement delay={0.2}>
                <div className="inline-flex items-center px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 rounded-full text-sm font-medium mb-6">
                  <Phone className="w-4 h-4 mr-2" />
                  Communication Intégrée
                </div>
              </FloatingElement>

              <FloatingElement delay={0.4}>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                  Communication
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400">
                    Intégrée
                  </span>
                </h1>
              </FloatingElement>

              <FloatingElement delay={0.6}>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  Restez connecté avec vos élèves et moniteurs grâce à un système de communication 
                  multi-canal automatisé et personnalisé.
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
                      className="inline-flex items-center px-8 py-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
                      className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-pink-300 dark:hover:border-pink-500 font-semibold rounded-lg transition-all duration-200"
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Voir la démo
                    </Link>
                  </motion.div>
                </div>
              </FloatingElement>
            </div>

            {/* Visuel droite - Interface de communication */}
            <FloatingElement delay={1.0} className="relative">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Centre de Communication</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">En ligne</span>
                    </div>
                  </div>
                  
                  {/* Messages récents */}
                  <div className="space-y-3 mb-6">
                    {[
                      { 
                        type: 'SMS', 
                        recipient: 'Marie Dupont', 
                        message: 'Rappel: Cours de conduite demain à 14h', 
                        status: 'Envoyé',
                        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                      },
                      { 
                        type: 'Email', 
                        recipient: 'Ahmed Karim', 
                        message: 'Félicitations pour votre réussite !', 
                        status: 'Lu',
                        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                      },
                      { 
                        type: 'Push', 
                        recipient: 'Sophie Martin', 
                        message: 'Nouveau cours disponible', 
                        status: 'Livré',
                        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
                      }
                    ].map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        className={`p-4 rounded-lg ${msg.color}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium px-2 py-1 bg-white/20 rounded">
                              {msg.type}
                            </span>
                            <span className="text-sm font-medium">{msg.recipient}</span>
                          </div>
                          <span className="text-xs opacity-75">{msg.status}</span>
                        </div>
                        <p className="text-sm opacity-90">{msg.message}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Statistiques */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Envoyés', value: '1,247', color: 'text-blue-600' },
                      { label: 'Lus', value: '1,156', color: 'text-green-600' },
                      { label: 'Taux', value: '92.7%', color: 'text-pink-600' }
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
              Communication Multi-Canal
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Touchez vos élèves sur tous les canaux avec des messages personnalisés et automatisés.
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
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mr-4">
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
                      <CheckCircle className="w-5 h-5 text-pink-500 mr-3 flex-shrink-0" />
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
              Communication Efficace, Résultats Concrets
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Une communication proactive qui améliore l'engagement et la satisfaction.
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
                className="text-center p-8 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
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
      <section className="py-20 bg-gradient-to-br from-pink-600 to-rose-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Prêt à améliorer votre communication ?
            </h2>
            <p className="text-xl text-pink-100 mb-10">
              Connectez-vous efficacement avec vos élèves et améliorez leur expérience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-white text-pink-600 font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200"
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
