import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Mail, Phone, FileText } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const RegistrationSuccessPage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Icône de succès */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {t('registration.success.title')}
          </motion.h1>

          {/* Message de confirmation */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 dark:text-gray-300 mb-8"
          >
            {t('registration.success.subtitle')}
          </motion.p>

          {/* Statut de traitement */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mr-3" />
              <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-300">
                {t('registration.success.processing.title')}
              </h3>
            </div>
            <p className="text-yellow-700 dark:text-yellow-300">
              {t('registration.success.processing.description')}
            </p>
          </motion.div>

          {/* Prochaines étapes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-left mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
              {t('registration.success.next_steps')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{t('registration.success.step1.title')}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {t('registration.success.step1.description')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{t('registration.success.step2.title')}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {t('registration.success.step2.description')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-green-600 dark:text-green-400 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{t('registration.success.step3.title')}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {t('registration.success.step3.description')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Informations de contact */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('registration.success.help.title')}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('registration.success.help.email')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">support@permini.tn</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('registration.success.help.phone')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">+216 XX XXX XXX</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 text-center"
            >
              {t('registration.success.back_home')}
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-medium rounded-xl transition-colors duration-200 text-center"
            >
              {t('registration.success.go_login')}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
