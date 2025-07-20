import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { dashboardService } from '../../services/dashboardService';
import { useLanguage } from '../../contexts/LanguageContext';

interface Student {
  id: number;
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

interface PaymentStats {
  total_students: number;
  configured_students: number;
  total_revenue: number;
  monthly_revenue: number;
  fixed_students: number;
  hourly_students: number;
  avg_payment_per_student: number;
}

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');



  const formatAmount = (amount: any) => {
    const num = parseFloat(amount) || 0;
    return num.toFixed(3);
  };

  const getProgressPercentage = (student: Student) => {
    if (student.payment_type === 'fixed' && student.total_amount) {
      return Math.min((student.paid_amount / student.total_amount) * 100, 100);
    }
    return 0;
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      fetchPaymentStats();
    }
  }, [students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStudents();
      const studentsArray = Array.isArray(data) ? data : data.results || [];
      setStudents(studentsArray);
    } catch (error: any) {
      console.error('Erreur lors du chargement des candidats:', error);
      toast.error('Erreur lors du chargement des candidats');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      // Calculer les statistiques à partir des candidats
      const totalStudents = students.length;
      const configuredStudents = students.filter(s => s.payment_type).length;
      const fixedStudents = students.filter(s => s.payment_type === 'fixed').length;
      const hourlyStudents = students.filter(s => s.payment_type === 'hourly').length;

      const totalRevenue = students.reduce((sum, s) => sum + (s.paid_amount || 0), 0);

      // Pour le revenu mensuel, on pourrait faire un appel API séparé
      // Pour l'instant, on utilise une estimation
      const monthlyRevenue = totalRevenue * 0.1; // Estimation

      const avgPaymentPerStudent = totalStudents > 0 ? totalRevenue / totalStudents : 0;

      setStats({
        total_students: totalStudents,
        configured_students: configuredStudents,
        total_revenue: totalRevenue,
        monthly_revenue: monthlyRevenue,
        fixed_students: fixedStudents,
        hourly_students: hourlyStudents,
        avg_payment_per_student: avgPaymentPerStudent
      });
    } catch (error: any) {
      console.error('Erreur lors du calcul des statistiques:', error);
    }
  };







  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Paiements
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Suivi des paiements et facturation des candidats
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/students')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <EyeIcon className="h-5 w-5" />
          Gérer les candidats
        </button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenus totaux</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatAmount(stats.total_revenue)} DT</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Candidats configurés</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.configured_students}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">sur {stats.total_students} candidats</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tarif fixe</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.fixed_students}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">candidats</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Par séance</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.hourly_students}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">candidats</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moyenne par candidat */}
      {stats && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Moyenne par candidat</h3>
            <span className="text-2xl font-bold text-green-600">{formatAmount(stats.avg_payment_per_student)} DT</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Revenus totaux répartis sur {stats.total_students} candidat(s)
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un candidat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-2">
              {students.filter(s => s.full_name.toLowerCase().includes(searchTerm.toLowerCase())).length} candidat(s)
            </span>
          </div>
        </div>
      </div>

      {/* Liste des candidats */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Candidats et leurs paiements
          </h3>
        </div>

        <div className="p-6">
          {students.filter(student =>
            student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
          ).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students
                .filter(student =>
                  student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((student) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/dashboard/students/${student.id}/payments`)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {student.full_name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.payment_type === 'fixed'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : student.payment_type === 'hourly'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                      {student.payment_type === 'fixed' ? 'Tarif fixe' :
                       student.payment_type === 'hourly' ? 'Par séance' : 'Non configuré'}
                    </span>
                  </div>

                  {student.payment_type === 'fixed' && student.total_amount ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Payé</span>
                        <span className="text-lg font-semibold text-green-600">
                          {formatAmount(student.paid_amount)} DT
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatAmount(student.total_amount)} DT
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(student)}%` }}
                        ></div>
                      </div>
                      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        {getProgressPercentage(student).toFixed(1)}% complété
                      </div>
                    </div>
                  ) : student.payment_type === 'hourly' ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Séances payées</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {student.paid_sessions}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total payé</span>
                        <span className="text-lg font-semibold text-green-600">
                          {formatAmount(student.paid_amount)} DT
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tarification non configurée
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/students/${student.id}/payments`);
                        }}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Configurer →
                      </button>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/students/${student.id}/payments`);
                      }}
                      className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <CreditCardIcon className="h-4 w-4" />
                      Gérer les paiements
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {searchTerm ? 'Aucun candidat trouvé' : 'Aucun candidat'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? 'Essayez de modifier votre recherche.'
                  : 'Commencez par ajouter des candidats pour gérer leurs paiements.'
                }
              </p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default PaymentsPage;
