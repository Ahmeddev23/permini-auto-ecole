import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import StatsCard from '../../components/dashboard/StatsCard';
import { Card } from '../../components/common/Card';
import StudentStatsChart from '../../components/charts/StudentStatsChart';
import ExamStatsChart from '../../components/charts/ExamStatsChart';
import RevenueChart from '../../components/charts/RevenueChart';
import SessionStatsChart from '../../components/charts/SessionStatsChart';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import dashboardService from '../../services/dashboardService';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const renderDashboardByRole = () => {
    switch (user?.user_type) {
      case 'admin':
        return <AdminDashboard />;
      case 'driving_school':
        return <DrivingSchoolDashboard />;
      case 'instructor':
        return <InstructorDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.welcome')}, {user?.firstName} !
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Voici un aperçu de votre activité aujourd'hui
          </p>
        </motion.div>

        {renderDashboardByRole()}
      </div>
    </div>
  );
};

const SuperAdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Auto-écoles"
          value="42"
          change="+3 ce mois"
          changeType="increase"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Utilisateurs actifs"
          value="1,234"
          change="+12% vs mois dernier"
          changeType="increase"
          icon={UserCheck}
          color="green"
        />
        <StatsCard
          title="Revenus totaux"
          value="47,500 TND"
          change="+8.2%"
          changeType="increase"
          icon={DollarSign}
          color="yellow"
        />
        <StatsCard
          title="Taux de réussite"
          value="89%"
          change="+2.1%"
          changeType="increase"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Dernières auto-écoles inscrites
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Auto-École Tunis Centre', date: '2024-01-15', status: 'En attente' },
              { name: 'École de Conduite Sfax', date: '2024-01-14', status: 'Approuvée' },
              { name: 'Permis Plus Sousse', date: '2024-01-13', status: 'Approuvée' }
            ].map((school, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{school.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{school.date}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  school.status === 'Approuvée' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                    : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                }`}>
                  {school.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Statistiques par région
          </h3>
          <div className="space-y-4">
            {[
              { region: 'Tunis', schools: 15, students: 450 },
              { region: 'Sfax', schools: 8, students: 240 },
              { region: 'Sousse', schools: 6, students: 180 },
              { region: 'Nabeul', schools: 5, students: 150 }
            ].map((region, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{region.region}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{region.schools} auto-écoles</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600 dark:text-blue-400">{region.students}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">étudiants</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const DrivingSchoolDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    console.warn('Utilisation des données par défaut:', error);
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('dashboard.stats.students')}
          value={stats?.students.total.toString() || "0"}
          change={`${stats?.students.active || 0} actifs`}
          changeType="increase"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title={t('dashboard.stats.instructors')}
          value={stats?.instructors.total.toString() || "0"}
          change={`${stats?.instructors.active || 0} actifs`}
          changeType="neutral"
          icon={UserCheck}
          color="green"
        />
        <StatsCard
          title="Véhicules"
          value={stats?.instructors.total.toString() || "0"}
          change="Flotte disponible"
          changeType="neutral"
          icon={Calendar}
          color="yellow"
        />
        <StatsCard
          title="Revenus ce mois"
          value={`${stats?.revenue.total.toLocaleString() || "0"} DT`}
          change="Revenus mensuels"
          changeType="increase"
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <StudentStatsChart
              totalStudents={stats?.students.total || 0}
              activeStudents={stats?.students.active || 0}
              completedStudents={stats?.students.completed || 0}
              pendingStudents={stats?.students.pending || 0}
            />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <ExamStatsChart
              passedExams={stats?.exams.passed || 0}
              failedExams={stats?.exams.failed || 0}
              pendingExams={stats?.exams.pending || 0}
            />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <RevenueChart
              monthlyRevenue={stats?.revenue.monthly || []}
              months={stats?.revenue.months || []}
            />
          </Card>
        </motion.div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <SessionStatsChart
              completedSessions={stats?.sessions.completed || 0}
              scheduledSessions={stats?.sessions.scheduled || 0}
              cancelledSessions={stats?.sessions.cancelled || 0}
            />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Résumé Mensuel
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Nouveaux candidats</span>
                  <span className="font-semibold text-green-600">+{stats?.students.pending || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Examens réussis</span>
                  <span className="font-semibold text-blue-600">{stats?.exams.passed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Taux de réussite</span>
                  <span className="font-semibold text-purple-600">
                    {stats?.exams.passed && stats?.exams.failed
                      ? Math.round((stats.exams.passed / (stats.exams.passed + stats.exams.failed)) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Revenus ce mois</span>
                  <span className="font-semibold text-green-600">
                    {stats?.revenue.monthly[stats.revenue.monthly.length - 1]?.toLocaleString() || 0} DT
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Today's Schedule and Recent Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Planning d'aujourd'hui
          </h3>
          <div className="space-y-3">
            {[
              { time: '09:00', student: 'Ahmed Ben Ali', instructor: 'Mme Fatma', type: 'Pratique' },
              { time: '10:30', student: 'Yasmine Trabelsi', instructor: 'M. Mohamed', type: 'Théorie' },
              { time: '14:00', student: 'Karim Sfaxi', instructor: 'M. Sami', type: 'Pratique' },
              { time: '15:30', student: 'Leila Hamdi', instructor: 'Mme Naima', type: 'Examen' }
            ].map((lesson, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white">{lesson.time}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      lesson.type === 'Pratique' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' :
                      lesson.type === 'Théorie' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                      'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400'
                    }`}>
                      {lesson.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{lesson.student}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{lesson.instructor}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Nouveaux étudiants
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Amira Bouazizi', date: '2024-01-15', progress: 15 },
              { name: 'Mehdi Gharbi', date: '2024-01-14', progress: 8 },
              { name: 'Sara Ben Salem', date: '2024-01-13', progress: 22 }
            ].map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${student.name}&background=3B82F6&color=fff`}
                    alt={student.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Inscrit le {student.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{student.progress}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">progression</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const StudentDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Heures théoriques"
          value="18/30"
          change="60% complété"
          changeType="increase"
          icon={Clock}
          color="blue"
        />
        <StatsCard
          title="Heures pratiques"
          value="12/25"
          change="48% complété"
          changeType="increase"
          icon={Calendar}
          color="green"
        />
        <StatsCard
          title="Examens passés"
          value="1/2"
          change="Code réussi"
          changeType="increase"
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* Upcoming Lessons and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Prochains cours
          </h3>
          <div className="space-y-3">
            {[
              { date: '2024-01-16', time: '14:00', type: 'Pratique', instructor: 'M. Mohamed' },
              { date: '2024-01-18', time: '10:00', type: 'Théorie', instructor: 'Mme Fatma' },
              { date: '2024-01-20', time: '15:00', type: 'Pratique', instructor: 'M. Mohamed' }
            ].map((lesson, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{lesson.date} à {lesson.time}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.type} avec {lesson.instructor}</p>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  lesson.type === 'Pratique' 
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' 
                    : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                }`}>
                  {lesson.type}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ma progression
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Formation théorique</span>
                <span>18/30 heures</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Formation pratique</span>
                <span>12/25 heures</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '48%' }}></div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Examen du code réussi</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-500 mt-2">
                <AlertCircle className="h-5 w-5" />
                <span>Examen de conduite à venir</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const InstructorDashboard: React.FC = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [recentSchedule, setRecentSchedule] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadInstructorData();
  }, []);

  const loadInstructorData = async () => {
    try {
      setLoading(true);
      const [statsData, scheduleData] = await Promise.all([
        dashboardService.getMyInstructorStats(),
        dashboardService.getMyRecentSchedule()
      ]);
      setStats(statsData);
      setRecentSchedule(scheduleData);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Mes candidats"
          value={stats?.total_students?.toString() || "0"}
          change={`${stats?.total_students || 0} candidats actifs`}
          changeType="neutral"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Séances aujourd'hui"
          value={stats?.sessions_today?.toString() || "0"}
          change={stats?.sessions_today > 0 ? "Planning actif" : "Aucune séance"}
          changeType={stats?.sessions_today > 0 ? "neutral" : "neutral"}
          icon={Calendar}
          color="green"
        />
        <StatsCard
          title="Heures ce mois"
          value={`${stats?.hours_this_month || 0}h`}
          change={`${stats?.hours_change >= 0 ? '+' : ''}${stats?.hours_change || 0}h vs dernier mois`}
          changeType={stats?.hours_change > 0 ? "increase" : stats?.hours_change < 0 ? "decrease" : "neutral"}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Taux de réussite"
          value={`${stats?.success_rate || 0}%`}
          change={`${stats?.completed_sessions || 0}/${stats?.total_sessions || 0} séances terminées`}
          changeType={stats?.success_rate >= 80 ? "increase" : "neutral"}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Recent Schedule */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Mes séances récentes
        </h3>
        {recentSchedule.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSchedule.map((session, index) => {
              const sessionDate = new Date(session.date);
              const today = new Date();
              const isToday = sessionDate.toDateString() === today.toDateString();
              const isFuture = sessionDate > today;
              const isPast = sessionDate < today;

              return (
                <div key={index} className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                  isToday ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/10' :
                  isFuture ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/10' :
                  'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {session.start_time?.substring(0, 5)}-{session.end_time?.substring(0, 5)}
                      </span>
                      <span className={`text-xs ${
                        isToday ? 'text-blue-600 dark:text-blue-400 font-medium' :
                        isFuture ? 'text-green-600 dark:text-green-400' :
                        'text-gray-500 dark:text-gray-400'
                      }`}>
                        {isToday ? 'Aujourd\'hui' :
                         isFuture ? sessionDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) :
                         sessionDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      session.session_type === 'practical' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                      session.session_type === 'theory' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' :
                      'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400'
                    }`}>
                      {session.session_type === 'practical' ? 'Conduite' :
                       session.session_type === 'theory' ? 'Code' :
                       session.session_type}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{session.student_name}</p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <p>Statut: {
                      session.status === 'scheduled' ? 'Programmée' :
                      session.status === 'completed' ? 'Terminée' :
                      session.status === 'cancelled' ? 'Annulée' :
                      session.status === 'no_show' ? 'Absence' :
                      session.status
                    }</p>
                    {session.notes && <p>Notes: {session.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Aucune séance récente</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Vos séances apparaîtront ici une fois programmées
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  return <SuperAdminDashboard />;
};

const DefaultDashboard: React.FC = () => {
  return (
    <Card>
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Bienvenue sur Permini
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Votre tableau de bord sera disponible après configuration de votre profil.
        </p>
      </div>
    </Card>
  );
};