import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Mail, Phone, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/common/Button';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const PendingApprovalPage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Logout Button - Fixed Position */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
        >
          Déconnexion
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full space-y-8"
      >
        {/* Logo */}
        <div className="text-center">
          <Logo size="lg" />
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 space-y-6 border border-gray-100 dark:border-gray-700"
        >
          {/* Status Icon */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4"
            >
              <Clock className="h-10 w-10 text-orange-600 dark:text-orange-400" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Demande en cours de traitement
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300">
              Votre demande d'inscription d'auto-école est actuellement en cours d'examen par notre équipe.
            </p>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informations de votre demande
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {user?.email}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {user?.first_name} {user?.last_name}
                </span>
              </div>
              
              {user?.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {user.phone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Process Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Étapes du processus
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Inscription soumise avec succès
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Vérification des documents en cours
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">
                  Validation finale (en attente)
                </span>
              </div>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Temps de traitement
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Le processus de vérification prend généralement 2-5 jours ouvrables. 
                  Vous recevrez un email de confirmation une fois votre demande approuvée.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Des questions ? Contactez notre équipe support
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <a 
                href="mailto:support@permini.tn" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                support@permini.tn
              </a>
              <span className="text-gray-400">•</span>
              <a 
                href="tel:+21612345678" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                +216 12 345 678
              </a>
            </div>
          </div>
        </motion.div>

        {/* Bottom spacing */}
        <div className="pb-16"></div>
      </motion.div>
    </div>
  );
};
