import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { Logo } from '../../components/common/Logo';
import {
  Building2,
  User,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const loginOptions = [
    {
      title: t('auth.login.school'),
      description: t('auth.login.school.desc'),
      subtitle: t('auth.login.school.subtitle'),
      icon: Building2,
      path: '/login/driving-school',
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-700',
      hoverBorderColor: 'hover:border-blue-300 dark:hover:border-blue-500',
      features: [t('auth.features.student.management'), t('auth.features.smart.planning'), t('auth.features.progress.tracking')]
    },
    {
      title: t('auth.login.student'),
      description: t('auth.login.student.desc'),
      subtitle: t('auth.login.student.subtitle'),
      icon: User,
      path: '/login/student',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-700',
      hoverBorderColor: 'hover:border-green-300 dark:hover:border-green-500',
      features: [t('auth.features.course.tracking'), t('auth.features.personal.planning'), t('auth.features.exam.results')]
    },
    {
      title: t('auth.login.instructor'),
      description: t('auth.login.instructor.desc'),
      subtitle: t('auth.login.instructor.subtitle'),
      icon: GraduationCap,
      path: '/login/instructor',
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-700',
      hoverBorderColor: 'hover:border-purple-300 dark:hover:border-purple-500',
      features: [t('auth.features.course.management'), t('auth.features.student.evaluation'), t('auth.features.optimized.planning')]
    }
  ];

  return (
    <div className="pt-20 pb-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-start justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-200 overflow-hidden relative">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-6xl w-full space-y-12 mt-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="flex justify-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Logo size="lg" />
            </motion.div>
          </div>

          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            {t('auth.secure.connection')}
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('auth.login.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('auth.login.subtitle')}
          </p>
        </motion.div>

        {/* Login Options */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {loginOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: index * 0.15 + 0.4,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{
                y: -10,
                scale: 1.03,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(option.path)}
              className="group cursor-pointer"
            >
              <div className={`relative p-8 bg-gradient-to-br ${option.bgGradient} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 ${option.borderColor} ${option.hoverBorderColor} overflow-hidden`}>
                {/* Effet de brillance au hover */}
                <motion.div
                  className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />

                <div className="relative z-10">
                  {/* Icône et titre */}
                  <div className="text-center mb-6">
                    <motion.div
                      className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${option.gradient} text-white mb-4 shadow-lg`}
                      whileHover={{
                        rotate: [0, -5, 5, 0],
                        scale: 1.1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <option.icon className="w-8 h-8" />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {option.title}
                    </h3>
                    <p className={`text-sm font-medium ${option.textColor} mb-3`}>
                      {option.subtitle}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {option.description}
                    </p>
                  </div>

                  {/* Fonctionnalités */}
                  <div className="space-y-2 mb-6">
                    {option.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 + 0.6 + featureIndex * 0.1 }}
                        className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                      >
                        <Shield className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </motion.div>
                    ))}
                  </div>

                  {/* Bouton de connexion */}
                  <motion.div
                    className={`inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r ${option.gradient} text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Se connecter
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Register Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white mb-4"
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Nouvelle Auto-école ?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Rejoignez des centaines d'auto-écoles qui nous font déjà confiance
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Building2 className="w-5 h-5 mr-2" />
                Créer un compte auto-école
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Essai gratuit • Sans engagement • Support inclus
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom spacing */}
      <div className="pb-24"></div>
    </div>
  );
};