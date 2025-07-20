import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Check,
  X,
  Star,
  Zap,
  Crown,
  ArrowRight,
  Users,
  Calendar,
  Car,
  CheckCircle,
  Phone,
  TrendingUp,
  Shield,
  Clock,
  MessageSquare,
  CreditCard,
  BarChart3,
  Bell,
  Calculator,
  Headphones
} from 'lucide-react';
import { PlanComparison } from '../components/pricing/PlanComparison';


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

export const PricingPage: React.FC = () => {
  const { t } = useLanguage();

  const plans = [
    {
      name: t('pricing.plan.standard'),
      description: t('pricing.plan.standard.desc'),
      price: 49,
      currency: 'DT',
      period: t('pricing.plan.month'),
      popular: false,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      hasFreeTrial: true,
      features: [
        { name: t('pricing.features.candidates.200'), icon: Users, included: true },
        { name: t('pricing.features.management'), icon: TrendingUp, included: true },
        { name: t('pricing.features.instructors'), icon: Users, included: true },
        { name: t('pricing.features.planning'), icon: Calendar, included: true },
        { name: t('pricing.features.exams'), icon: CheckCircle, included: true },
        { name: t('pricing.features.vehicles'), icon: Car, included: true },
        { name: t('pricing.features.payments'), icon: CreditCard, included: true },
        { name: t('pricing.features.stats'), icon: BarChart3, included: true },
        { name: t('pricing.features.notifications'), icon: Bell, included: true },
        { name: t('pricing.features.accounting'), icon: Calculator, included: false },
        { name: t('pricing.features.messaging'), icon: MessageSquare, included: false },
        { name: t('pricing.features.expenses'), icon: Car, included: false },
        { name: t('pricing.features.support'), icon: Headphones, included: false }
      ]
    },
    {
      name: t('pricing.plan.premium'),
      description: t('pricing.plan.premium.desc'),
      price: 99,
      currency: 'DT',
      period: t('pricing.plan.month'),
      popular: true,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      hasFreeTrial: false,
      features: [
        { name: t('pricing.features.candidates.unlimited'), icon: Users, included: true },
        { name: t('pricing.features.management'), icon: TrendingUp, included: true },
        { name: t('pricing.features.instructors'), icon: Users, included: true },
        { name: t('pricing.features.planning'), icon: Calendar, included: true },
        { name: t('pricing.features.exams'), icon: CheckCircle, included: true },
        { name: t('pricing.features.vehicles'), icon: Car, included: true },
        { name: t('pricing.features.payments'), icon: CreditCard, included: true },
        { name: t('pricing.features.stats'), icon: BarChart3, included: true },
        { name: t('pricing.features.notifications'), icon: Bell, included: true },
        { name: t('pricing.features.accounting'), icon: Calculator, included: true },
        { name: t('pricing.features.messaging'), icon: MessageSquare, included: true },
        { name: t('pricing.features.expenses'), icon: Car, included: true },
        { name: t('pricing.features.support'), icon: Headphones, included: true }
      ]
    }
  ];

  const faq = [
    {
      question: t('pricing.faq.q1'),
      answer: t('pricing.faq.a1')
    },
    {
      question: t('pricing.faq.q2'),
      answer: t('pricing.faq.a2')
    },
    {
      question: t('pricing.faq.q3'),
      answer: t('pricing.faq.a3')
    },
    {
      question: t('pricing.faq.q4'),
      answer: t('pricing.faq.a4')
    },
    {
      question: t('pricing.faq.q5'),
      answer: t('pricing.faq.a5')
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative pt-24 lg:pt-32 pb-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 overflow-hidden">
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
          <motion.div
            animate={{ rotate: -360, scale: [1, 0.9, 1] }}
            transition={{ 
              rotate: { duration: 40, repeat: Infinity, ease: "linear" },
              scale: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }
            }}
            className="absolute -bottom-40 -left-40 w-96 h-96 border border-indigo-200/20 dark:border-indigo-800/20 rounded-full"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <FloatingElement delay={0.2}>
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-8">
              <Crown className="w-4 h-4 mr-2" />
              {t('pricing.badge')}
            </div>
          </FloatingElement>

          {/* Titre principal */}
          <FloatingElement delay={0.4}>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              {t('pricing.hero.title.part1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                {t('pricing.hero.title.part2')}
              </span>
            </h1>
          </FloatingElement>

          {/* Description */}
          <FloatingElement delay={0.6}>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mb-12">
              {t('pricing.hero.description')}
            </p>
          </FloatingElement>


        </div>
      </section>

      {/* Plans de tarification */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className={`relative ${plan.popular ? 'lg:scale-105' : ''}`}
              >
                {/* Badge populaire */}
                {plan.popular && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                  >
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      <Star className="w-4 h-4 inline mr-1" />
                      Populaire
                    </div>
                  </motion.div>
                )}

                <div className={`relative p-6 bg-gradient-to-br ${plan.bgGradient} rounded-2xl border-2 ${
                  plan.popular ? 'border-yellow-300 dark:border-yellow-600' : 'border-gray-200 dark:border-gray-700'
                } shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                  
                  {/* Effet de fond au hover */}
                  <motion.div
                    className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />

                  <div className="relative z-10">
                    {/* Header du plan */}
                    <div className="text-center mb-6">
                      <motion.div
                        className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${plan.gradient} text-white mb-4 shadow-lg`}
                        whileHover={{ 
                          rotate: [0, -5, 5, 0],
                          scale: 1.1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {plan.name === 'Standard' ? <Zap className="w-8 h-8" /> : <Crown className="w-8 h-8" />}
                      </motion.div>

                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {plan.name}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {plan.description}
                      </p>

                      {/* Prix */}
                      <div className="mb-6">
                        <div className="flex items-baseline justify-center">
                          <span className="text-5xl font-bold text-gray-900 dark:text-white">
                            {plan.price}
                          </span>
                          <span className="text-xl text-gray-500 dark:text-gray-400 ml-1">
                            {plan.currency}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            /{plan.period}
                          </span>
                        </div>
                      </div>

                      {/* Bouton CTA */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mb-6"
                      >
                        <Link
                          to="/register"
                          className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                            plan.popular
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-xl'
                              : `bg-gradient-to-r ${plan.gradient} text-white shadow-lg hover:shadow-xl`
                          }`}
                        >
                          {plan.hasFreeTrial ? (
                            <>
                              <Shield className="w-5 h-5 mr-2" />
                              Essai gratuit à l'inscription
                            </>
                          ) : (
                            <>
                              <Crown className="w-5 h-5 mr-2" />
                              Commencer maintenant
                            </>
                          )}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                      </motion.div>

                      {/* Badge essai gratuit */}
                      {plan.hasFreeTrial && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 }}
                          className="mb-3"
                        >
                          <div className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                            <Zap className="w-4 h-4 mr-1" />
                            Essai gratuit inclus
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Liste des fonctionnalités */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Fonctionnalités incluses :
                      </h4>

                      <div className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <motion.div
                            key={featureIndex}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * featureIndex }}
                            className="flex items-center space-x-3"
                          >
                            <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                              feature.included
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                              {feature.included ? (
                                <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                              ) : (
                                <X className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                            <span className={`text-sm ${
                              feature.included
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-400 dark:text-gray-500 line-through'
                            }`}>
                              {feature.name}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparaison détaillée */}
      <PlanComparison />

      {/* Garanties et avantages */}
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
              Pourquoi choisir Permini ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Nous nous engageons à vous offrir la meilleure expérience possible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: '30 jours gratuits',
                description: 'Essayez toutes les fonctionnalités sans engagement',
                color: 'text-green-600 dark:text-green-400'
              },
              {
                icon: Clock,
                title: 'Support 24/7',
                description: 'Assistance technique disponible quand vous en avez besoin',
                color: 'text-blue-600 dark:text-blue-400'
              },
              {
                icon: TrendingUp,
                title: 'Mises à jour gratuites',
                description: 'Nouvelles fonctionnalités incluses automatiquement',
                color: 'text-purple-600 dark:text-purple-400'
              },
              {
                icon: Users,
                title: 'Formation incluse',
                description: 'Formation complète de votre équipe incluse',
                color: 'text-orange-600 dark:text-orange-400'
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <motion.div
                  className={`inline-flex p-3 rounded-lg bg-gray-100 dark:bg-gray-800 ${benefit.color} mb-4`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <benefit.icon className="w-6 h-6" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Questions Fréquentes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Tout ce que vous devez savoir sur nos tarifs et services.
            </p>
          </motion.div>

          <div className="space-y-6">
            {faq.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {item.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Prêt à transformer votre auto-école ?
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Rejoignez les centaines d'auto-écoles qui nous font déjà confiance.
              Plan Standard avec essai gratuit ou Premium pour toutes les fonctionnalités.
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
                  Commencer l'essai gratuit
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/contact"
                  className="inline-flex items-center px-8 py-4 border-2 border-white/50 text-white font-semibold text-lg rounded-full backdrop-blur-sm hover:bg-white/10 transition-all duration-200"
                >
                  <Phone className="w-6 h-6 mr-3" />
                  Nous contacter
                </Link>
              </motion.div>
            </div>

            {/* Garanties finales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-blue-100"
            >
              {[
                { icon: Shield, text: "Essai gratuit (Standard)" },
                { icon: X, text: "Sans engagement" },
                { icon: Crown, text: "Premium complet" },
                { icon: Headphones, text: "Support inclus" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bottom spacing */}
      <div className="pb-16"></div>
    </div>
  );
};
