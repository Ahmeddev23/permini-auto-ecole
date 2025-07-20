import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ClockIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  AcademicCapIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import StatsCard from '../../components/dashboard/StatsCard';

interface StudentStats {
  total_theory_hours: number;
  total_practical_hours: number;
  completed_theory_hours: number;
  completed_practical_hours: number;
  theory_progress: number;
  practical_progress: number;
  total_payments: number;
  pending_payments: number;
  next_exam_date: string | null;
  last_lesson_date: string | null;
}

interface StudentData {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  license_type: string;
  status: string;
  theory_hours_completed: number;
  practical_hours_completed: number;
  total_amount: number;
  paid_amount: number;
}

const StudentOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [upcomingSchedules, setUpcomingSchedules] = useState<any[]>([]);
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.student_profile?.id) {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const studentId = user!.student_profile!.id;

      // Charger les données en parallèle
      const [student, stats, schedules, exams] = await Promise.all([
        dashboardService.getStudent(studentId),
        dashboardService.getStudentStats(studentId),
        dashboardService.getStudentSchedule(studentId),
        dashboardService.getStudentExams(studentId)
      ]);

      setStudentData(student);
      setStudentStats(stats);

      // Debug: voir les données reçues

      
      // Filtrer les séances à venir (prochaines 7 jours)
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = schedules.filter((schedule: any) => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate >= now && scheduleDate <= nextWeek && schedule.status === 'scheduled';
      }).slice(0, 5); // Limiter à 5 séances
      setUpcomingSchedules(upcoming);

      // Prendre les 3 derniers examens
      setRecentExams(exams.slice(0, 3));

    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getExamResultIcon = (result: string) => {
    switch (result) {
      case 'passed': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default: return <ClockIcon className="h-5 w-5 text-orange-500" />;
    }
  };

  const getExamResultLabel = (result: string) => {
    switch (result) {
      case 'passed': return 'Réussi';
      case 'failed': return 'Échoué';
      default: return 'En attente';
    }
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'theory': return 'Code';
      case 'practical': return 'Conduite';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!studentData || !studentStats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Erreur lors du chargement des données</p>
      </div>
    );
  }

  const remainingAmount = studentData.total_amount - studentData.paid_amount;
  const paymentProgress = studentData.total_amount > 0 ? (studentData.paid_amount / studentData.total_amount) * 100 : 0;

  // Liens personnalisés pour l'étudiant
  const studentId = user?.student_profile?.id;
  const examsLink = `/dashboard/students/${studentId}/exams`;
  const paymentsLink = `/dashboard/students/${studentId}/payments`;
  const settingsLink = `/dashboard/students/${studentId}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bonjour, {studentData.full_name.split(' ')[0]} ! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Voici un aperçu de votre progression en formation
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Permis</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {studentData.license_type}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatsCard
            title="Heures de code"
            value={`${studentStats.completed_theory_hours}h`}
            change="Heures effectuées"
            changeType="neutral"
            icon={AcademicCapIcon}
            color="blue"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatsCard
            title="Heures de conduite"
            value={`${studentStats.completed_practical_hours}h`}
            change="Heures effectuées"
            changeType="neutral"
            icon={ClockIcon}
            color="green"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatsCard
            title="Examens passés"
            value={recentExams.length.toString()}
            change={recentExams.filter(e => e.result === 'passed').length > 0 ? "Examens réussis" : "En cours"}
            changeType={recentExams.filter(e => e.result === 'passed').length > 0 ? "increase" : "neutral"}
            icon={TrophyIcon}
            color="purple"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatsCard
            title="Paiements"
            value={`${studentData.paid_amount} DT`}
            change={remainingAmount > 0 ? `${remainingAmount} DT restants` : "Soldé"}
            changeType={remainingAmount === 0 ? "increase" : "neutral"}
            icon={CreditCardIcon}
            color="orange"
          />
        </motion.div>
      </div>



      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Schedules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Prochaines séances</h3>
            <Link
              to="/dashboard/schedule"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Voir tout
            </Link>
          </div>
          
          {upcomingSchedules.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune séance programmée</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Vos prochaines séances apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSchedules.map((schedule, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${schedule.session_type === 'theory' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {getSessionTypeLabel(schedule.session_type)} - {schedule.instructor_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(`${schedule.date}T${schedule.start_time}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Exams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Mes examens</h3>
            <Link
              to={examsLink}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Voir tout
            </Link>
          </div>
          
          {recentExams.length === 0 ? (
            <div className="text-center py-8">
              <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun examen</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Vos examens passés apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExams.map((exam, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0">
                    {getExamResultIcon(exam.result)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {exam.exam_type === 'theory' ? 'Code de la route' : 'Conduite'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(exam.exam_date)} - {getExamResultLabel(exam.result)}
                      {exam.score && ` (${exam.score}/20)`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/dashboard/schedule"
            className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <CalendarDaysIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Mon planning</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Voir mes séances</p>
            </div>
          </Link>

          <Link
            to={examsLink}
            className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <TrophyIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">Mes examens</p>
              <p className="text-xs text-green-600 dark:text-green-400">Voir mes résultats</p>
            </div>
          </Link>

          <Link
            to={paymentsLink}
            className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <CreditCardIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Mes paiements</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">Voir mes factures</p>
            </div>
          </Link>

          <Link
            to={settingsLink}
            className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <ChartBarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Mon profil</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">Modifier mes infos</p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentOverviewPage;
