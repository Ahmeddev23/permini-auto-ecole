import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Car,
  CheckCircle,
  Phone,
  TrendingUp,
  Shield,
  Zap,
  Clock,
  Award,
  Star,
  ArrowRight,
  Sparkles,
  Target,
  BarChart3,
  MessageSquare,
  CreditCard,
  FileText,
  Settings,
  Globe,
  Smartphone
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';


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

export const FeaturesPage: React.FC = () => {
  const { t } = useLanguage();

  const mainFeatures = [
    {
      icon: Users,
      title: t('features.student.management.title'),
      description: t('features.student.management.desc'),
      features: [t('features.student.management.feature1'), t('features.student.management.feature2'), t('features.student.management.feature3'), t('features.student.management.feature4')],
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700',
      textColor: 'text-blue-600 dark:text-blue-400',
      detailLink: '/features/student-management'
    },
    {
      icon: Calendar,
      title: t('features.planning.title'),
      description: t('features.planning.description'),
      features: [t('features.planning.feature1'), t('features.planning.feature2'), t('features.planning.feature3'), t('features.planning.feature4')],
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-700',
      textColor: 'text-green-600 dark:text-green-400',
      detailLink: '/features/smart-scheduling'
    },
    {
      icon: Car,
      title: t('features.fleet.title'),
      description: t('features.fleet.description'),
      features: [t('features.fleet.feature1'), t('features.fleet.feature2'), t('features.fleet.feature3'), t('features.fleet.feature4')],
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-700',
      textColor: 'text-orange-600 dark:text-orange-400',
      detailLink: '/features/fleet-management'
    },
    {
      icon: CheckCircle,
      title: t('features.exams.title'),
      description: t('features.exams.description'),
      features: [t('features.exams.feature1'), t('features.exams.feature2'), t('features.exams.feature3'), t('features.exams.feature4')],
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-700',
      textColor: 'text-purple-600 dark:text-purple-400',
      detailLink: '/features/exams-evaluations'
    },
    {
      icon: Phone,
      title: t('features.communication.title'),
      description: t('features.communication.description'),
      features: [t('features.communication.feature1'), t('features.communication.feature2'), t('features.communication.feature3'), t('features.communication.feature4')],
      color: 'pink',
      gradient: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      borderColor: 'border-pink-200 dark:border-pink-700',
      textColor: 'text-pink-600 dark:text-pink-400',
      detailLink: '/features/communication'
    },
    {
      icon: TrendingUp,
      title: t('features.reports.title'),
      description: t('features.reports.description'),
      features: [t('features.reports.feature1'), t('features.reports.feature2'), t('features.reports.feature3'), t('features.reports.feature4')],
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-700',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      detailLink: '/features/reports-analytics'
    }
  ];

  const additionalFeatures = [
    { icon: CreditCard, title: t('features.additional.payments'), description: t('features.additional.payments.desc') },
    { icon: MessageSquare, title: t('features.additional.chat'), description: t('features.additional.chat.desc') },
    { icon: FileText, title: t('features.additional.documents'), description: t('features.additional.documents.desc') },
    { icon: Settings, title: t('features.additional.customization'), description: t('features.additional.customization.desc') },
    { icon: Globe, title: t('features.additional.multilang'), description: t('features.additional.multilang.desc') },
    { icon: Smartphone, title: t('features.additional.mobile'), description: t('features.additional.mobile.desc') }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
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
              <Sparkles className="w-4 h-4 mr-2" />
              {t('features.badge')}
            </div>
          </FloatingElement>

          {/* Titre principal */}
          <FloatingElement delay={0.4}>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              {t('features.hero.title.part1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                {t('features.hero.title.part2')}
              </span>
            </h1>
          </FloatingElement>

          {/* Description */}
          <FloatingElement delay={0.6}>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mb-12">
              {t('features.hero.description')}
            </p>
          </FloatingElement>

          {/* Statistiques rapides */}
          <FloatingElement delay={0.8}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { value: '15+', label: t('features.stats.features') },
                { value: '99%', label: t('features.stats.uptime') },
                { value: '24/7', label: t('features.stats.support') },
                { value: '100%', label: t('features.stats.secure') }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 + index * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </FloatingElement>
        </div>
      </section>

      {/* Fonctionnalités principales */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header de section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('features.main.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('features.main.subtitle')}
            </p>
          </motion.div>

          {/* Grille de fonctionnalités */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="group cursor-pointer"
              >
                <div className={`relative h-full p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 ${feature.borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                  
                  {/* Effet de fond au hover */}
                  <motion.div
                    className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    initial={false}
                  />

                  <div className="relative z-10">
                    {/* Icône */}
                    <motion.div
                      className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-6 shadow-lg`}
                      whileHover={{ 
                        rotate: [0, -10, 10, 0],
                        scale: 1.1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon className="w-8 h-8" />
                    </motion.div>

                    {/* Titre */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                      {feature.description}
                    </p>

                    {/* Liste des fonctionnalités */}
                    <ul className="space-y-2 mb-6">
                      {feature.features.map((item, itemIndex) => (
                        <motion.li
                          key={itemIndex}
                          className="flex items-center text-sm text-gray-500 dark:text-gray-400"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 + itemIndex * 0.05 }}
                        >
                          <CheckCircle className={`w-4 h-4 mr-2 ${feature.textColor}`} />
                          {item}
                        </motion.li>
                      ))}
                    </ul>

                    {/* Bouton En savoir plus */}
                    <Link to={feature.detailLink}>
                      <motion.div
                        className={`flex items-center ${feature.textColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer`}
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                      >
                        <span className="text-sm font-medium mr-2">{t('features.learn.more')}</span>
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités additionnelles */}
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
              {t('features.additional.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('features.additional.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <motion.div
                  className="inline-flex p-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-6 h-6" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Sécurité et Conformité */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4 mr-2" />
                {t('features.security.badge')}
              </div>

              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t('features.security.title')}
              </h2>

              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                {t('features.security.description')}
              </p>

              <div className="space-y-4">
                {[
                  { icon: Shield, title: t('features.security.ssl.title'), description: t('features.security.ssl.desc') },
                  { icon: Award, title: t('features.security.gdpr.title'), description: t('features.security.gdpr.desc') },
                  { icon: Clock, title: t('features.security.backup.title'), description: t('features.security.backup.desc') },
                  { icon: Target, title: t('features.security.access.title'), description: t('features.security.access.desc') }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: t('features.security.stats.uptime'), value: '99.9%', color: 'text-green-600' },
                    { label: t('features.security.stats.security'), value: 'A+', color: 'text-blue-600' },
                    { label: t('features.security.stats.support'), value: '24/7', color: 'text-purple-600' },
                    { label: t('features.security.stats.compliance'), value: '100%', color: 'text-orange-600' }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              {t('features.cta.title')}
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              {t('features.cta.description')}
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
                  {t('features.cta.trial')}
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/demo"
                  className="inline-flex items-center px-8 py-4 border-2 border-white/50 text-white font-semibold text-lg rounded-full backdrop-blur-sm hover:bg-white/10 transition-all duration-200"
                >
                  <Star className="w-6 h-6 mr-3" />
                  {t('features.cta.demo')}
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
