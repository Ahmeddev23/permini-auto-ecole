import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ServerIcon,
  CircleStackIcon,
  CloudIcon,
  CurrencyDollarIcon,
  TruckIcon,
  AcademicCapIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { adminService, SystemStats } from '../../services/adminService';
import { toast } from 'react-hot-toast';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

// Couleurs pour les graphiques
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  // États pour les données de graphiques
  const [planDistribution, setPlanDistribution] = useState<ChartData[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<TimeSeriesData[]>([]);
  const [userGrowth, setUserGrowth] = useState<TimeSeriesData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<ChartData[]>([]);

  useEffect(() => {
    fetchStats();

    // Rafraîchissement automatique désactivé pour éviter les interruptions
    // const interval = setInterval(fetchStats, 30000);
    // return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);

      // Générer des données de graphiques avec de vraies données API
      await generateChartData(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = async (systemStats: SystemStats) => {
    try {
      // Récupérer les vraies données de graphiques depuis l'API
      const chartData = await adminService.getChartData();

      // Vérifier et utiliser les données reçues
      if (chartData.plan_distribution && chartData.plan_distribution.length > 0) {
        setPlanDistribution(chartData.plan_distribution);
      } else {
        setPlanDistribution([
          { name: 'Standard', value: systemStats.standard_schools || 1, color: COLORS[0] },
          { name: 'Premium', value: systemStats.premium_schools || 1, color: COLORS[1] }
        ]);
      }

      if (chartData.monthly_revenue && chartData.monthly_revenue.length > 0) {
        setMonthlyRevenue(chartData.monthly_revenue);
      } else {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
        setMonthlyRevenue(months.map((month, index) => ({
          date: month,
          value: 1500 + (index * 300)
        })));
      }

      if (chartData.user_growth && chartData.user_growth.length > 0) {
        setUserGrowth(chartData.user_growth);
      } else {
        setUserGrowth([
          { date: 'S1', value: 2 },
          { date: 'S2', value: 5 },
          { date: 'S3', value: 3 },
          { date: 'S4', value: 7 }
        ]);
      }

      if (chartData.payment_methods && chartData.payment_methods.length > 0) {
        setPaymentMethods(chartData.payment_methods);
      } else {
        setPaymentMethods([
          { name: 'Virement', value: 5, color: COLORS[0] },
          { name: 'Carte', value: 3, color: COLORS[1] },
          { name: 'Flouci', value: 2, color: COLORS[2] }
        ]);
      }

    } catch (error) {
      console.error('❌ Erreur lors du chargement des données de graphiques:', error);
      toast.error('Erreur lors du chargement des graphiques');

      // Fallback avec des données de démonstration
      setPlanDistribution([
        { name: 'Standard', value: systemStats.standard_schools || 2, color: COLORS[0] },
        { name: 'Premium', value: systemStats.premium_schools || 1, color: COLORS[1] }
      ]);

      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
      setMonthlyRevenue(months.map((month, index) => ({
        date: month,
        value: 1500 + (index * 300)
      })));

      setUserGrowth([
        { date: 'S1', value: 2 },
        { date: 'S2', value: 5 },
        { date: 'S3', value: 3 },
        { date: 'S4', value: 7 }
      ]);

      setPaymentMethods([
        { name: 'Virement', value: 5, color: COLORS[0] },
        { name: 'Carte', value: 3, color: COLORS[1] },
        { name: 'Flouci', value: 2, color: COLORS[2] }
      ]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
        <p className="mt-1 text-sm text-gray-500">Impossible de charger les statistiques</p>
        <button
          onClick={fetchStats}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const statCards: StatCard[] = [
    {
      title: 'Auto-écoles totales',
      value: stats.total_driving_schools,
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      change: `${stats.active_driving_schools} actives`,
      changeType: 'neutral'
    },
    {
      title: 'En attente d\'approbation',
      value: stats.pending_driving_schools || 0,
      icon: ClockIcon,
      color: 'bg-orange-500',
      change: 'Auto-écoles à approuver',
      changeType: stats.pending_driving_schools > 0 ? 'decrease' : 'neutral'
    },
    {
      title: 'Utilisateurs actifs',
      value: stats.active_users,
      icon: UserGroupIcon,
      color: 'bg-green-500',
      change: `${stats.total_users} au total`,
      changeType: 'increase'
    },
    {
      title: 'Paiements en attente',
      value: stats.pending_payments || 0,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      change: 'Nécessitent validation',
      changeType: 'neutral'
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Administrateur
            </h1>
            <p className="text-gray-600 mt-1">
              Vue d'ensemble du système Permini
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Dernière mise à jour</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date().toLocaleTimeString('fr-FR')}
              </p>
            </div>
            <button
              onClick={fetchStats}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Résumé rapide */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.total_driving_schools}</div>
            <div className="text-blue-100">Auto-écoles</div>
            <div className="text-sm text-blue-200">{stats.active_driving_schools} actives</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.total_users}</div>
            <div className="text-blue-100">Utilisateurs</div>
            <div className="text-sm text-blue-200">{stats.active_users} actifs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.pending_payments || 0}</div>
            <div className="text-blue-100">Paiements</div>
            <div className="text-sm text-blue-200">En attente</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.new_registrations_week}</div>
            <div className="text-blue-100">Nouvelles inscriptions</div>
            <div className="text-sm text-blue-200">Cette semaine</div>
          </div>
        </div>
      </div>

      {/* Alertes importantes */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.pending_driving_schools > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">
                    {stats.pending_driving_schools} auto-école(s) en attente
                  </h4>
                  <p className="text-sm text-blue-700">
                    Des inscriptions d'auto-écoles nécessitent votre approbation.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {stats.pending_payments > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    {stats.pending_payments} paiement(s) en attente
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Des demandes de mise à niveau nécessitent votre validation.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {stats.pending_contact_forms > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">
                    {stats.pending_contact_forms} formulaire(s) de contact
                  </h4>
                  <p className="text-sm text-blue-700">
                    Nouveaux messages à traiter.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${card.color} rounded-md p-3`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {card.value}
                    </dd>
                    {card.change && (
                      <dd className={`text-sm ${
                        card.changeType === 'increase' ? 'text-green-600' :
                        card.changeType === 'decrease' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {card.change}
                      </dd>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Informations détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <div className="flex items-center">
            <CircleStackIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Base de données</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.database_size}</p>
              <p className="text-sm text-gray-500">Taille totale</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <div className="flex items-center">
            <CloudIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Stockage</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.storage_used}</p>
              <p className="text-sm text-gray-500">Espace utilisé</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Plans Standard</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.standard_schools || 0}</p>
              <p className="text-sm text-gray-500">Auto-écoles</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <div className="flex items-center">
            <ServerIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Plans Premium</h3>
              <p className="text-2xl font-bold text-green-600">{stats.premium_schools || 0}</p>
              <p className="text-sm text-gray-500">Auto-écoles</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Graphiques et Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution des plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution des Plans</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Méthodes de paiement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Méthodes de Paiement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentMethods}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Graphiques temporels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenus mensuels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenus Mensuels (TND)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Croissance des utilisateurs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Nouvelles Inscriptions (Hebdomadaire)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white shadow rounded-lg p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/administrateur_permini/driving-schools')}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg text-left transition-colors"
          >
            <BuildingOfficeIcon className="h-6 w-6 mb-2" />
            <div className="font-medium">Gérer les auto-écoles</div>
            <div className="text-sm text-blue-600">Approuver, suspendre</div>
          </button>

          <button
            onClick={() => navigate('/administrateur_permini/payments')}
            className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg text-left transition-colors"
          >
            <CurrencyDollarIcon className="h-6 w-6 mb-2" />
            <div className="font-medium">Gérer les paiements</div>
            <div className="text-sm text-green-600">Approuver, rejeter</div>
          </button>

          <button
            onClick={() => navigate('/administrateur_permini/users')}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg text-left transition-colors"
          >
            <UserGroupIcon className="h-6 w-6 mb-2" />
            <div className="font-medium">Gérer les utilisateurs</div>
            <div className="text-sm text-purple-600">Voir, modifier, désactiver</div>
          </button>

          <button
            onClick={() => navigate('/administrateur_permini/contact-forms')}
            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-4 rounded-lg text-left transition-colors"
          >
            <ExclamationTriangleIcon className="h-6 w-6 mb-2" />
            <div className="font-medium">Formulaires de contact</div>
            <div className="text-sm text-yellow-600">Répondre aux demandes</div>
          </button>

          <button
            onClick={() => navigate('/administrateur_permini/logs')}
            className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-4 rounded-lg text-left transition-colors"
          >
            <ChartBarIcon className="h-6 w-6 mb-2" />
            <div className="font-medium">Voir les logs</div>
            <div className="text-sm text-orange-600">Activité système</div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
