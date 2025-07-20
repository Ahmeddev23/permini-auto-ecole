import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const WaitingApprovalPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [approvalStatus, setApprovalStatus] = useState<string>('pending');

  useEffect(() => {
    // Vérifier le statut d'approbation
    const checkApprovalStatus = async () => {
      try {
        const response = await fetch('/api/driving-schools/status/', {
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setApprovalStatus(data.status);
          
          // Si approuvé, rediriger vers le dashboard
          if (data.status === 'approved') {
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
      }
    };

    checkApprovalStatus();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusConfig = () => {
    switch (approvalStatus) {
      case 'pending':
        return {
          icon: ClockIcon,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Demande en cours de traitement',
          message: 'Votre demande d\'inscription est en cours d\'examen par notre équipe. Vous recevrez une notification dès qu\'elle sera approuvée.',
          details: 'Délai habituel : 24-48 heures ouvrables'
        };
      case 'rejected':
        return {
          icon: XCircleIcon,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Demande rejetée',
          message: 'Votre demande d\'inscription a été rejetée. Veuillez contacter notre équipe pour plus d\'informations.',
          details: 'Contactez-nous pour connaître les raisons du rejet'
        };
      case 'suspended':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          title: 'Compte suspendu',
          message: 'Votre compte a été temporairement suspendu. Contactez notre équipe pour plus d\'informations.',
          details: 'Suspension temporaire - contactez le support'
        };
      default:
        return {
          icon: ClockIcon,
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Vérification en cours',
          message: 'Nous vérifions votre statut...',
          details: ''
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4"
          >
            <span className="text-white text-2xl font-bold">P</span>
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900">Permini</h1>
        </div>

        {/* Carte principale */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg p-6 shadow-lg`}
        >
          {/* Icône de statut */}
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: approvalStatus === 'pending' ? 360 : 0 }}
              transition={{ duration: 2, repeat: approvalStatus === 'pending' ? Infinity : 0, ease: "linear" }}
              className={`inline-flex items-center justify-center w-16 h-16 ${statusConfig.bgColor} rounded-full border-2 ${statusConfig.borderColor}`}
            >
              <StatusIcon className={`h-8 w-8 ${statusConfig.iconColor}`} />
            </motion.div>
          </div>

          {/* Titre et message */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {statusConfig.title}
            </h2>
            <p className="text-gray-600 mb-4">
              {statusConfig.message}
            </p>
            {statusConfig.details && (
              <p className="text-sm text-gray-500 italic">
                {statusConfig.details}
              </p>
            )}
          </div>

          {/* Informations utilisateur */}
          {user && (
            <div className="bg-white rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Informations de votre demande</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Nom :</span> {user.first_name} {user.last_name}</p>
                <p><span className="font-medium">Email :</span> {user.email}</p>
                <p><span className="font-medium">Type :</span> Auto-école</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {approvalStatus === 'pending' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <p className="text-sm text-gray-500 mb-3">
                  Cette page se met à jour automatiquement
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </motion.div>
            )}

            {(approvalStatus === 'rejected' || approvalStatus === 'suspended') && (
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Contactez-nous
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      support@permini.tn
                    </p>
                    <p className="flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      +216 XX XXX XXX
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Se déconnecter
            </button>
          </div>
        </motion.div>

        {/* Bottom spacing */}
        <div className="pb-16"></div>
      </motion.div>
    </div>
  );
};

export default WaitingApprovalPage;
