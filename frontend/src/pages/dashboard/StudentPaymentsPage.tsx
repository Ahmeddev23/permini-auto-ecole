import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CreditCardIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../contexts/AuthContext';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  payment_type: string;
  total_amount?: number;
  total_sessions?: number;
  paid_amount: number;
  paid_sessions: number;
}

interface PaymentLog {
  id: number;
  amount: string;
  sessions_count: number;
  description?: string;
  created_at: string;
  created_by?: string;
}

const StudentPaymentsPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Détecter si c'est l'étudiant qui consulte ses propres paiements
  const isOwnPayments = user?.user_type === 'student' && user?.student_profile?.id === parseInt(studentId || '0');
  const [student, setStudent] = useState<Student | null>(null);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSetupPricing, setShowSetupPricing] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [pricingForm, setPricingForm] = useState({
    payment_type: 'fixed',
    total_amount: '',
    total_sessions: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    sessions_count: '',
    description: ''
  });

  useEffect(() => {
    if (studentId) {
      fetchStudent();
      fetchPaymentLogs();
    }
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      const data = await dashboardService.getStudent(parseInt(studentId!));
      setStudent(data);

      // Vérifier si la tarification est configurée
      const needsSetup = !data.payment_type || (data.payment_type === 'fixed' && !data.total_amount);

      if (needsSetup) {
        setShowSetupPricing(true);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement du candidat:', error);
      toast.error('Erreur lors du chargement du candidat');
      navigate('/dashboard/students');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentLogs = async () => {
    try {


      const data = await dashboardService.getPaymentLogs(parseInt(studentId!));

      setPaymentLogs(data);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement de l\'historique:', error);
      toast.error('Erreur lors du chargement de l\'historique des paiements');
    }
  };

  const setupPricing = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        payment_type: pricingForm.payment_type,
        total_amount: pricingForm.payment_type === 'fixed' ? parseFloat(pricingForm.total_amount) : null
      };

      await dashboardService.setupStudentPricing(parseInt(studentId!), data);
      toast.success('Tarification configurée avec succès');
      setShowSetupPricing(false);
      fetchStudent();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la configuration');
    }
  };

  const addPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        amount: parseFloat(paymentForm.amount),
        sessions_count: student?.payment_type === 'hourly' ? parseInt(paymentForm.sessions_count) || 0 : 0,
        description: paymentForm.description || ''
      };

      await dashboardService.addStudentPayment(parseInt(studentId!), data);
      toast.success('Paiement ajouté avec succès');
      setShowAddPayment(false);
      resetPaymentForm();
      fetchStudent();
      fetchPaymentLogs();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout du paiement');
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: '',
      sessions_count: '',
      description: ''
    });
  };

  const formatAmount = (amount: any) => {
    const num = parseFloat(amount) || 0;
    return num.toFixed(3);
  };

  const getProgressPercentage = () => {
    if (student?.payment_type === 'fixed' && student.total_amount) {
      return Math.min((student.paid_amount / student.total_amount) * 100, 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Candidat non trouvé</h3>
        {!isOwnPayments && (
          <button
            onClick={() => navigate('/dashboard/students')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Retour aux candidats
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {!isOwnPayments && (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard/students')}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Retour aux candidats
            </button>
          </div>
        )}

        {student && student.payment_type && (student.payment_type === 'hourly' || student.total_amount) && (
          <div className="flex gap-2">
            {!isOwnPayments && (
              <button
                onClick={() => setShowAddPayment(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Ajouter un paiement
              </button>
            )}

            <button
              onClick={() => setShowLogs(true)}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ClipboardDocumentListIcon className="h-5 w-5" />
              Historique
            </button>
          </div>
        )}
      </div>

      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isOwnPayments ? 'Mes Paiements' : `Paiements - ${student.full_name}`}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isOwnPayments
            ? `Votre tarification: ${student.payment_type === 'fixed' ? 'Tarif fixe' : 'Par séance'}`
            : `Type de tarification: ${student.payment_type === 'fixed' ? 'Tarif fixe' : 'Par séance'}`
          }
        </p>
      </div>

      {/* Affichage selon le type de tarification */}
      {student.payment_type === 'fixed' && student.total_amount ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Paiement fixe</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Montant total: {formatAmount(student.total_amount)} DT
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {formatAmount(student.paid_amount)} DT
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">payé</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progression</span>
              <span className="text-sm font-medium text-blue-600">
                {getProgressPercentage().toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Payé: {formatAmount(student.paid_amount)} DT</span>
            <span>Restant: {formatAmount(student.total_amount - student.paid_amount)} DT</span>
          </div>
        </div>
      ) : student.payment_type === 'hourly' ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Paiement par séances</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Comptage au fur et à mesure
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {student.paid_sessions}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">séances payées</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatAmount(student.paid_amount)} DT
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total payé</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal de configuration de tarification */}
      {showSetupPricing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Configurer la tarification
              </h3>
              <button
                onClick={() => setShowSetupPricing(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={setupPricing} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de tarification *
                </label>
                <select
                  value={pricingForm.payment_type}
                  onChange={(e) => setPricingForm({ ...pricingForm, payment_type: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="fixed">Tarif fixe</option>
                  <option value="hourly">Par séance</option>
                </select>
              </div>

              {pricingForm.payment_type === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Montant total (DT) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={pricingForm.total_amount}
                    onChange={(e) => setPricingForm({ ...pricingForm, total_amount: e.target.value })}
                    required
                    placeholder="Ex: 1500.000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              {pricingForm.payment_type === 'hourly' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Paiement par séance :</strong> Les séances seront comptées au fur et à mesure des paiements. Aucune limite n'est fixée.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSetupPricing(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Configurer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'ajout de paiement - seulement pour les auto-écoles */}
      {showAddPayment && !isOwnPayments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Ajouter un paiement
              </h3>
              <button
                onClick={() => {
                  setShowAddPayment(false);
                  resetPaymentForm();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={addPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Montant (DT) *
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                  placeholder="Ex: 150.000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {student?.payment_type === 'hourly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de séances *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={paymentForm.sessions_count}
                    onChange={(e) => setPaymentForm({ ...paymentForm, sessions_count: e.target.value })}
                    required
                    placeholder="Ex: 5"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  rows={3}
                  placeholder="Description du paiement (optionnel)..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPayment(false);
                    resetPaymentForm();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'historique des paiements */}
      {showLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Historique des paiements
              </h3>
              <button
                onClick={() => setShowLogs(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {paymentLogs.length > 0 ? (
                <div className="space-y-4">
                  {paymentLogs.map((log) => (
                    <div key={log.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-green-600">
                            +{formatAmount(log.amount)} DT
                          </span>
                          {log.sessions_count > 0 && (
                            <span className="text-sm text-blue-600">
                              / {log.sessions_count} séance(s)
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(log.created_at).toLocaleDateString('fr-FR')} à {new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {log.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {log.description}
                        </p>
                      )}
                      {log.created_by && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Ajouté par: {log.created_by}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun historique</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isOwnPayments
                      ? 'Vos paiements effectués apparaîtront ici.'
                      : 'Les paiements ajoutés apparaîtront ici.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPaymentsPage;
