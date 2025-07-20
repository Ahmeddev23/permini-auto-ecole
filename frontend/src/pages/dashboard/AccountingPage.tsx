import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  PlusIcon,
  FunnelIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/common/Card';
import { dashboardService } from '../../services/dashboardService';
import { usePlanPermissions } from '../../hooks/usePlanPermissions';
import PlanRestriction from '../../components/common/PlanRestriction';
import AdvancedCharts from '../../components/accounting/AdvancedCharts';
import AdvancedStats from '../../components/accounting/AdvancedStats';
import AdvancedFilters from '../../components/accounting/AdvancedFilters';

interface AccountingEntry {
  id: string;
  entry_type: 'expense' | 'revenue';
  category: string;
  description: string;
  amount: number;
  date: string;
  notes?: string;
  vehicle_expense?: {
    vehicle: {
      brand: string;
      model: string;
      license_plate: string;
    };
  };
}

interface FinancialSummary {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  monthly_data: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
  expense_by_category: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  revenue_by_category: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

const AccountingPage: React.FC = () => {
  const { hasFeature, getRequiredPlan, permissions } = usePlanPermissions();
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'revenues'>('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'expense' | 'revenue'>('expense');
  
  // Filtres
  const [dateFilter, setDateFilter] = useState('month');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filtres avancés
  const [expenseFilters, setExpenseFilters] = useState({
    search: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    sortBy: 'date',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  const [revenueFilters, setRevenueFilters] = useState({
    search: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    sortBy: 'date',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Formulaire
  const [formData, setFormData] = useState({
    entry_type: 'expense' as 'expense' | 'revenue',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Catégories
  const EXPENSE_CATEGORIES = {
    vehicle: 'Véhicule',
    subscription: 'Abonnement',
    rent: 'Loyer',
    salary: 'Salaire',
    utilities: 'Services publics',
    office: 'Fournitures bureau',
    marketing: 'Marketing',
    insurance: 'Assurance',
    other: 'Autre'
  };

  const REVENUE_CATEGORIES = {
    student_fees: 'Frais étudiants',
    exam_fees: 'Frais examens',
    additional_services: 'Services supplémentaires',
    other: 'Autre'
  };

  useEffect(() => {
    if (permissions) {
      if (permissions.canManageFinances) {
        fetchData();
      } else {
        setLoading(false);
      }
    }
  }, [permissions]);

  // Recharger les données quand le filtre de date change
  useEffect(() => {
    if (permissions?.canManageFinances) {
      fetchData();
    }
  }, [dateFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesData, summaryData] = await Promise.all([
        dashboardService.getAccountingEntries(dateFilter),
        dashboardService.getFinancialSummary(dateFilter)
      ]);
      setEntries(entriesData);
      setSummary(summaryData);
    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données comptables');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.description || !formData.amount) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await dashboardService.createAccountingEntry(formData);
      toast.success('Écriture comptable ajoutée avec succès');
      setShowModal(false);
      resetForm();
      // Recharger les données
      const [entriesData, summaryData] = await Promise.all([
        dashboardService.getAccountingEntries(dateFilter),
        dashboardService.getFinancialSummary(dateFilter)
      ]);
      setEntries(entriesData);
      setSummary(summaryData);
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      toast.error(error.message || 'Erreur lors de la création de l\'écriture comptable');
    }
  };

  const resetForm = () => {
    setFormData({
      entry_type: modalType,
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const openModal = (type: 'expense' | 'revenue') => {
    setModalType(type);
    setFormData({
      ...formData,
      entry_type: type
    });
    setShowModal(true);
  };

  const handleRefreshData = async () => {
    try {
      setLoading(true);
      // Recharger les données (la synchronisation se fait automatiquement côté backend)
      const [entriesData, summaryData] = await Promise.all([
        dashboardService.getAccountingEntries(dateFilter),
        dashboardService.getFinancialSummary(dateFilter)
      ]);
      setEntries(entriesData);
      setSummary(summaryData);
      toast.success('Données actualisées avec succès');
    } catch (error: any) {
      console.error('Erreur lors de l\'actualisation:', error);
      toast.error(error.message || 'Erreur lors de l\'actualisation des données');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour filtrer et trier les entrées
  const filterAndSortEntries = (entries: AccountingEntry[], filters: any, entryType: 'expense' | 'revenue') => {
    let filtered = entries.filter(entry => entry.entry_type === entryType);

    // Filtrage par recherche
    if (filters.search) {
      filtered = filtered.filter(entry =>
        entry.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        (entry.notes && entry.notes.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Filtrage par catégorie
    if (filters.category) {
      filtered = filtered.filter(entry => entry.category === filters.category);
    }

    // Filtrage par date
    if (filters.dateFrom) {
      filtered = filtered.filter(entry => entry.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(entry => entry.date <= filters.dateTo);
    }

    // Filtrage par montant
    if (filters.amountMin) {
      filtered = filtered.filter(entry => entry.amount >= parseFloat(filters.amountMin));
    }
    if (filters.amountMax) {
      filtered = filtered.filter(entry => entry.amount <= parseFloat(filters.amountMax));
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'date':
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Données filtrées
  const filteredExpenses = filterAndSortEntries(entries, expenseFilters, 'expense');
  const filteredRevenues = filterAndSortEntries(entries, revenueFilters, 'revenue');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Vérifier les permissions Premium
  if (!permissions?.canManageFinances) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Comptabilité
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestion complète de votre comptabilité d'auto-école
          </p>
        </div>

        {/* Aperçu des fonctionnalités Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="p-6 text-center">
              <ChartBarIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Graphiques avancés
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Visualisez vos données financières avec des graphiques interactifs
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <CalculatorIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Analyses automatiques
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Synchronisation automatique des revenus et dépenses
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <DocumentChartBarIcon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Rapports détaillés
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Filtres avancés et statistiques de performance
              </p>
            </div>
          </Card>
        </div>

        <PlanRestriction
          feature="Module Comptabilité"
          requiredPlan={getRequiredPlan('finances')}
          currentPlan={permissions?.currentPlan || 'free'}
          description="Accédez à un module comptable complet avec suivi des revenus, dépenses, analyses financières et rapports détaillés."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Comptabilité
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestion complète de votre comptabilité d'auto-école
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal('expense')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowTrendingDownIcon className="h-4 w-4 mr-2" />
            Ajouter dépense
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal('revenue')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
            Ajouter revenu
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefreshData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <DocumentChartBarIcon className="h-4 w-4 mr-2" />
            )}
            Actualiser
          </motion.button>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Tableau de bord', icon: ChartBarIcon },
            { id: 'expenses', label: 'Dépenses', icon: ArrowTrendingDownIcon },
            { id: 'revenues', label: 'Revenus', icon: ArrowTrendingUpIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'dashboard' && summary && (
        <div className="space-y-6">
          {/* Statistiques avancées */}
          <AdvancedStats entries={entries} summary={summary} />

          {/* Graphiques avancés */}
          <AdvancedCharts summary={summary} />

          {/* KPIs principaux */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Revenus totaux
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {summary.total_revenue.toFixed(2)} DT
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ArrowTrendingDownIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Dépenses totales
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {summary.total_expenses.toFixed(2)} DT
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className={`h-8 w-8 ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Bénéfice net
                      </dt>
                      <dd className={`text-lg font-medium ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {summary.net_profit.toFixed(2)} DT
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Graphiques et analyses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Répartition des dépenses */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Répartition des dépenses
                </h3>
                <div className="space-y-3">
                  {summary.expense_by_category.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 bg-red-${(index % 3 + 4) * 100}`}></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.amount.toFixed(2)} DT
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Répartition des revenus */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Répartition des revenus
                </h3>
                <div className="space-y-3">
                  {summary.revenue_by_category.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 bg-green-${(index % 3 + 4) * 100}`}></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.amount.toFixed(2)} DT
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Évolution mensuelle */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Évolution mensuelle
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Mois
                      </th>
                      <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Revenus
                      </th>
                      <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Dépenses
                      </th>
                      <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Bénéfice
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.monthly_data.map((month, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 text-sm text-gray-900 dark:text-white">
                          {month.month}
                        </td>
                        <td className="py-2 text-sm text-right text-green-600">
                          {month.revenue.toFixed(2)} DT
                        </td>
                        <td className="py-2 text-sm text-right text-red-600">
                          {month.expenses.toFixed(2)} DT
                        </td>
                        <td className={`py-2 text-sm text-right font-medium ${
                          month.profit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {month.profit.toFixed(2)} DT
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Onglet Dépenses */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* Filtres avancés pour les dépenses */}
          <AdvancedFilters
            filters={expenseFilters}
            onFiltersChange={setExpenseFilters}
            categories={EXPENSE_CATEGORIES}
            entryType="expense"
          />

          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Liste des dépenses
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredExpenses.length} dépense(s) trouvée(s) • Total: {filteredExpenses.reduce((sum, entry) => sum + entry.amount, 0).toFixed(2)} DT
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openModal('expense')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Ajouter dépense
                </motion.button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Montant
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredExpenses.map((entry) => (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(entry.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                            {EXPENSE_CATEGORIES[entry.category as keyof typeof EXPENSE_CATEGORIES] || entry.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {entry.description}
                          </div>
                          {entry.notes && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {entry.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            -{entry.amount.toFixed(2)} DT
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {filteredExpenses.length === 0 && (
                  <div className="text-center py-12">
                    <ArrowTrendingDownIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Aucune dépense trouvée
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Commencez par ajouter une dépense.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Onglet Revenus */}
      {activeTab === 'revenues' && (
        <div className="space-y-6">
          {/* Filtres avancés pour les revenus */}
          <AdvancedFilters
            filters={revenueFilters}
            onFiltersChange={setRevenueFilters}
            categories={REVENUE_CATEGORIES}
            entryType="revenue"
          />

          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Liste des revenus
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredRevenues.length} revenu(s) trouvé(s) • Total: {filteredRevenues.reduce((sum, entry) => sum + entry.amount, 0).toFixed(2)} DT
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openModal('revenue')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Ajouter revenu
                </motion.button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Montant
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredRevenues.map((entry) => (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(entry.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                            {REVENUE_CATEGORIES[entry.category as keyof typeof REVENUE_CATEGORIES] || entry.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {entry.description}
                          </div>
                          {entry.notes && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {entry.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            +{entry.amount.toFixed(2)} DT
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {filteredRevenues.length === 0 && (
                  <div className="text-center py-12">
                    <ArrowTrendingUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Aucun revenu trouvé
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Commencez par ajouter un revenu.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal d'ajout d'écriture comptable */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Ajouter {modalType === 'expense' ? 'une dépense' : 'un revenu'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {Object.entries(modalType === 'expense' ? EXPENSE_CATEGORIES : REVENUE_CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder={modalType === 'expense' ? 'Ex: Loyer bureau, Salaire moniteur...' : 'Ex: Inscription étudiant, Examen permis...'}
                    required
                  />
                </div>

                {/* Montant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Montant (DT) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Notes (optionnel) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    placeholder="Notes supplémentaires..."
                  />
                </div>

                {/* Boutons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      modalType === 'expense'
                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    }`}
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingPage;
