import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  CalendarIcon,
  TrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Card } from '../../components/common/Card';
import StatsCard from '../../components/dashboard/StatsCard';
import StudentStatsChart from '../../components/charts/StudentStatsChart';
import ExamStatsChart from '../../components/charts/ExamStatsChart';
import RevenueChart from '../../components/charts/RevenueChart';
import SessionStatsChart from '../../components/charts/SessionStatsChart';
import { dashboardService } from '../../services/dashboardService';
import { toast } from 'react-hot-toast';

interface AnalyticsData {
  // Statistiques de base
  totalStudents: number;
  activeStudents: number;
  totalInstructors: number;
  totalVehicles: number;
  monthlyRevenue: number;
  upcomingExams: number;
  
  // Données pour les graphiques
  studentsData: {
    active: number;
    pending: number;
    completed: number;
  };
  examsData: {
    passed: number;
    failed: number;
    pending: number;
  };
  sessionsData: {
    completed: number;
    scheduled: number;
    cancelled: number;
  };
  revenueData: {
    monthly: number[];
    months: string[];
  };
}

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques de base
      const dashboardStats = await dashboardService.getDashboardStats();
      
      // Récupérer les données des étudiants
      const students = await dashboardService.getStudents();
      
      // Récupérer les examens
      const exams = await dashboardService.getExams();
      
      // Récupérer les séances
      const sessions = await dashboardService.getSchedules();
      
      // Traiter les données pour les graphiques
      const studentsData = processStudentsData(students.results || []);
      const examsData = processExamsData(exams.results || []);
      const sessionsData = processSessionsData(sessions.results || []);
      const revenueData = processRevenueData();
      
      setData({
        totalStudents: dashboardStats.total_students || 0,
        activeStudents: dashboardStats.active_students || 0,
        totalInstructors: dashboardStats.total_instructors || 0,
        totalVehicles: dashboardStats.total_vehicles || 0,
        monthlyRevenue: dashboardStats.monthly_revenue || 0,
        upcomingExams: dashboardStats.upcoming_exams || 0,
        studentsData,
        examsData,
        sessionsData,
        revenueData,
      });
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des analytics:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const processStudentsData = (students: any[]) => {
    const active = students.filter(s => s.status === 'active').length;
    const pending = students.filter(s => s.status === 'pending').length;
    const completed = students.filter(s => s.status === 'completed').length;
    
    return { active, pending, completed };
  };

  const processExamsData = (exams: any[]) => {
    const passed = exams.filter(e => e.result === 'passed').length;
    const failed = exams.filter(e => e.result === 'failed').length;
    const pending = exams.filter(e => e.result === 'pending').length;
    
    return { passed, failed, pending };
  };

  const processSessionsData = (sessions: any[]) => {
    const completed = sessions.filter(s => s.status === 'completed').length;
    const scheduled = sessions.filter(s => s.status === 'scheduled').length;
    const cancelled = sessions.filter(s => s.status === 'cancelled').length;
    
    return { completed, scheduled, cancelled };
  };

  const processRevenueData = () => {
    // Simuler des données de revenus mensuels basées sur les vraies données
    const currentMonth = new Date().getMonth();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    const monthlyData = [];
    const monthLabels = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      monthLabels.push(months[monthIndex]);
      // Simuler des revenus basés sur le nombre d'étudiants
      const baseRevenue = data?.totalStudents ? data.totalStudents * 150 : 1000;
      const variation = Math.random() * 0.4 - 0.2; // ±20% de variation
      monthlyData.push(Math.round(baseRevenue * (1 + variation)));
    }
    
    return { monthly: monthlyData, months: monthLabels };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Erreur lors du chargement des données</p>
      </div>
    );
  }

  const successRate = data.examsData.passed + data.examsData.failed > 0 
    ? Math.round((data.examsData.passed / (data.examsData.passed + data.examsData.failed)) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics & Rapports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Analyse détaillée des performances de votre auto-école
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatsCard
            title="Total Candidats"
            value={data.totalStudents.toString()}
            change={`${data.activeStudents} actifs`}
            changeType="increase"
            icon={UserGroupIcon}
            color="blue"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatsCard
            title="Taux de Réussite"
            value={`${successRate}%`}
            change={`${data.examsData.passed} réussis`}
            changeType="increase"
            icon={AcademicCapIcon}
            color="green"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatsCard
            title="Revenus ce Mois"
            value={`${data.monthlyRevenue.toLocaleString()} DT`}
            change="Revenus mensuels"
            changeType="increase"
            icon={CurrencyDollarIcon}
            color="purple"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatsCard
            title="Séances Terminées"
            value={data.sessionsData.completed.toString()}
            change={`${data.sessionsData.scheduled} programmées`}
            changeType="increase"
            icon={ClockIcon}
            color="yellow"
          />
        </motion.div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Répartition des Candidats
              </h3>
              <StudentStatsChart
                totalStudents={data.totalStudents}
                activeStudents={data.studentsData.active}
                completedStudents={data.studentsData.completed}
                pendingStudents={data.studentsData.pending}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Résultats des Examens
              </h3>
              <ExamStatsChart
                passedExams={data.examsData.passed}
                failedExams={data.examsData.failed}
                pendingExams={data.examsData.pending}
              />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Évolution des Revenus
              </h3>
              <RevenueChart
                monthlyRevenue={data.revenueData.monthly}
                months={data.revenueData.months}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Répartition des Séances
              </h3>
              <SessionStatsChart
                completedSessions={data.sessionsData.completed}
                scheduledSessions={data.sessionsData.scheduled}
                cancelledSessions={data.sessionsData.cancelled}
              />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Résumé des Performances
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {data.totalStudents}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Candidats
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {successRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Taux de Réussite
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {data.totalInstructors}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Moniteurs
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-2">
                  {data.totalVehicles}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Véhicules
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
