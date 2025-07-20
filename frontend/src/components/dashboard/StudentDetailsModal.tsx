import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  MapPinIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import dashboardService, { Student } from '../../services/dashboardService';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ isOpen, onClose, student }) => {
  const [studentStats, setStudentStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student && isOpen) {
      loadStudentStats();
    }
  }, [student, isOpen]);

  const loadStudentStats = async () => {
    if (!student) return;
    
    try {
      setLoading(true);
      const stats = await dashboardService.getStudentStats(student.id);
      setStudentStats(stats);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'registered': { color: 'bg-gray-100 text-gray-800', label: 'Inscrit', icon: UserIcon },
      'theory_in_progress': { color: 'bg-blue-100 text-blue-800', label: 'Code en cours', icon: ClockIcon },
      'theory_passed': { color: 'bg-green-100 text-green-800', label: 'Code réussi', icon: CheckCircleIcon },
      'practical_in_progress': { color: 'bg-yellow-100 text-yellow-800', label: 'Conduite en cours', icon: ClockIcon },
      'practical_passed': { color: 'bg-emerald-100 text-emerald-800', label: 'Conduite réussie', icon: CheckCircleIcon },
      'completed': { color: 'bg-purple-100 text-purple-800', label: 'Terminé', icon: CheckCircleIcon },
      'suspended': { color: 'bg-red-100 text-red-800', label: 'Suspendu', icon: XCircleIcon }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.registered;
    const IconComponent = config.icon;
    
    return (
      <div className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        <IconComponent className="h-4 w-4 mr-2" />
        {config.label}
      </div>
    );
  };

  const getLicenseTypeBadge = (type: string) => {
    const colors = {
      'A': 'bg-red-100 text-red-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-green-100 text-green-800',
      'D': 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      'A': 'Permis A (Moto)',
      'B': 'Permis B (Voiture)',
      'C': 'Permis C (Camion)',
      'D': 'Permis D (Bus)'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${colors[type as keyof typeof colors] || colors.B}`}>
        <AcademicCapIcon className="h-4 w-4 mr-2" />
        {labels[type as keyof typeof labels] || `Permis ${type}`}
      </span>
    );
  };

  if (!isOpen || !student) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Détails du candidat
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Informations complètes et progression du candidat
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Section */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="text-center">
                    <div className="mx-auto h-24 w-24 mb-4">
                      {student.photo ? (
                        <img
                          className="h-24 w-24 rounded-full object-cover mx-auto"
                          src={student.photo}
                          alt={student.full_name}
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mx-auto">
                          <UserIcon className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {student.full_name}
                    </h4>
                    <div className="space-y-2">
                      {getStatusBadge(student.formation_status)}
                      {getLicenseTypeBadge(student.license_type)}
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <EnvelopeIcon className="h-5 w-5 mr-3" />
                      {student.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <PhoneIcon className="h-5 w-5 mr-3" />
                      {student.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <IdentificationIcon className="h-5 w-5 mr-3" />
                      {student.cin}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CalendarDaysIcon className="h-5 w-5 mr-3" />
                      {new Date(student.date_of_birth).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                      <MapPinIcon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{student.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Formation Progress */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Progression de la formation
                  </h5>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Progression globale
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {student.progress_percentage || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${student.progress_percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {student.theory_hours_completed || 0}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Heures de code
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {student.practical_hours_completed || 0}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Heures de conduite
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {student.theory_exam_attempts || 0}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Tentatives code
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {student.practical_exam_attempts || 0}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Tentatives conduite
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Informations de paiement
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Type de paiement:</span>
                      <div className="mt-1">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          student.payment_type === 'fixed' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {student.payment_type === 'fixed' ? 'Tarif fixe' : 'Par heure'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Montant:</span>
                      <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                        {student.payment_type === 'fixed' 
                          ? `${student.fixed_price || 0} DT` 
                          : `${student.hourly_rate || 0} DT/h`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Information */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Informations d'inscription
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Date d'inscription:</span>
                      <div className="mt-1 text-gray-900 dark:text-white">
                        {new Date(student.registration_date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Statut:</span>
                      <div className="mt-1">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          student.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Fermer
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StudentDetailsModal;
