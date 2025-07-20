import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentArrowUpIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  FireIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/common/Card';
import { dashboardService } from '../../services/dashboardService';
import { usePlanPermissions } from '../../hooks/usePlanPermissions';
import { useAuth } from '../../contexts/AuthContext';
import PlanRestriction from '../../components/common/PlanRestriction';

interface VehicleExpense {
  id: string;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    license_plate: string;
  };
  category: string;
  description: string;
  amount: number;
  date: string;
  odometer_reading?: number;
  receipt?: string;
  notes?: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  license_plate: string;
}

const EXPENSE_CATEGORIES = {
  fuel: { label: 'Carburant', icon: FireIcon, color: 'text-orange-600' },
  maintenance: { label: 'Entretien', icon: WrenchScrewdriverIcon, color: 'text-blue-600' },
  repair: { label: 'Réparation', icon: WrenchScrewdriverIcon, color: 'text-red-600' },
  insurance: { label: 'Assurance', icon: ShieldCheckIcon, color: 'text-green-600' },
  inspection: { label: 'Visite technique', icon: DocumentArrowUpIcon, color: 'text-purple-600' },
  other: { label: 'Autre', icon: CurrencyDollarIcon, color: 'text-gray-600' },
};

const VehicleExpensesPage: React.FC = () => {
  const { hasFeature, getRequiredPlan, permissions } = usePlanPermissions();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<VehicleExpense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Formulaire
  const [formData, setFormData] = useState({
    vehicle_id: '',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    odometer_reading: '',
    notes: '',
    receipt: null as File | null
  });

  useEffect(() => {
    // Simple: charger une seule fois quand les permissions sont disponibles
    if (permissions) {
      if (permissions.canManageFinances) {
        fetchData();
      } else {
        setLoading(false);
      }
    }
  }, [permissions]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesResponse, vehiclesData] = await Promise.all([
        dashboardService.getVehicleExpenses(),
        dashboardService.getVehicles()
      ]);

      // Gérer la nouvelle structure de réponse
      if (expensesResponse && typeof expensesResponse === 'object') {
        if (expensesResponse.expenses) {
          setExpenses(expensesResponse.expenses);
          setIsInstructor(expensesResponse.is_instructor || false);
        } else {
          // Fallback pour l'ancienne structure
          setExpenses(Array.isArray(expensesResponse) ? expensesResponse : []);
          setIsInstructor(user?.user_type === 'instructor');
        }
      } else {
        setExpenses([]);
        setIsInstructor(user?.user_type === 'instructor');
      }

      setVehicles(vehiclesData);
    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicle_id || !formData.category || !formData.description || !formData.amount) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          if (key === 'receipt' && value instanceof File) {
            submitData.append(key, value);
          } else {
            submitData.append(key, value.toString());
          }
        }
      });

      await dashboardService.createVehicleExpense(submitData);
      toast.success('Dépense ajoutée avec succès');
      setShowModal(false);
      resetForm();
      // Recharger les données
      const [expensesResponse] = await Promise.all([
        dashboardService.getVehicleExpenses()
      ]);

      // Gérer la nouvelle structure de réponse
      if (expensesResponse && typeof expensesResponse === 'object') {
        if (expensesResponse.expenses) {
          setExpenses(expensesResponse.expenses);
          setIsInstructor(expensesResponse.is_instructor || false);
        } else {
          // Fallback pour l'ancienne structure
          setExpenses(Array.isArray(expensesResponse) ? expensesResponse : []);
          setIsInstructor(user?.user_type === 'instructor');
        }
      } else {
        setExpenses([]);
        setIsInstructor(user?.user_type === 'instructor');
      }
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      toast.error(error.message || 'Erreur lors de la création de la dépense');
    }
  };

  const resetForm = () => {
    setFormData({
      vehicle_id: '',
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      odometer_reading: '',
      notes: '',
      receipt: null
    });
  };

  // Filtrage des dépenses - Protection contre les erreurs
  const filteredExpenses = (Array.isArray(expenses) ? expenses : []).filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesVehicle = vehicleFilter === 'all' || expense.vehicle.id === vehicleFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const expenseDate = new Date(expense.date);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = expenseDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = expenseDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = expenseDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesVehicle && matchesDate;
  });

  // Calculs des statistiques
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expensesByCategory = Object.keys(EXPENSE_CATEGORIES).map(category => ({
    category,
    amount: filteredExpenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0),
    count: filteredExpenses.filter(expense => expense.category === category).length
  }));

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
            Dépenses des Véhicules
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Suivez toutes les dépenses liées à vos véhicules
          </p>
        </div>
        
        <PlanRestriction
          feature="Gestion des Dépenses Véhicules"
          requiredPlan={getRequiredPlan('vehicle_expenses')}
          currentPlan={permissions?.currentPlan || 'free'}
          description="Suivez en détail tous les coûts liés à vos véhicules : carburant, entretien, réparations, assurances et plus encore."
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
            {isInstructor ? 'Dépenses de Mes Véhicules' : 'Dépenses des Véhicules'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isInstructor
              ? 'Gérez les dépenses des véhicules qui vous sont assignés'
              : 'Suivez toutes les dépenses liées à vos véhicules'
            }
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Ajouter une dépense
        </motion.button>
      </div>

      {/* Statistiques rapides - Masquées pour les moniteurs */}
      {!isInstructor && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total dépenses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {totalExpenses.toFixed(2)} DT
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
                <TruckIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Véhicules concernés
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {new Set(filteredExpenses.map(e => e.vehicle.id)).size}
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
                <DocumentArrowUpIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Nombre de dépenses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {filteredExpenses.length}
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
                <CalendarIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Moyenne mensuelle
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {(totalExpenses / Math.max(1, new Date().getMonth() + 1)).toFixed(2)} DT
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>
        </div>
      )}

      {/* Filtres */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              {Object.entries(EXPENSE_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>{category.label}</option>
              ))}
            </select>

            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">Tous les véhicules</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} ({vehicle.license_plate})
                </option>
              ))}
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>

            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <FunnelIcon className="h-4 w-4 mr-1" />
              {filteredExpenses.length} dépense(s)
            </div>
          </div>
        </div>
      </Card>

      {/* Liste des dépenses */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Véhicule
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Kilométrage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredExpenses.map((expense) => {
                const categoryInfo = EXPENSE_CATEGORIES[expense.category as keyof typeof EXPENSE_CATEGORIES];
                const CategoryIcon = categoryInfo?.icon || CurrencyDollarIcon;

                return (
                  <motion.tr
                    key={expense.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(expense.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {expense.vehicle.brand} {expense.vehicle.model}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {expense.vehicle.license_plate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CategoryIcon className={`h-5 w-5 mr-2 ${categoryInfo?.color || 'text-gray-600'}`} />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {categoryInfo?.label || expense.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {expense.description}
                      </div>
                      {expense.notes && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {expense.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {expense.amount.toFixed(2)} DT
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {expense.odometer_reading ? `${expense.odometer_reading.toLocaleString()} km` : '-'}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {filteredExpenses.length === 0 && (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Aucune dépense trouvée
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Commencez par ajouter une dépense pour vos véhicules.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Modal d'ajout de dépense */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Ajouter une dépense véhicule
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Sélection du véhicule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Véhicule *
                  </label>
                  <select
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner un véhicule</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} ({vehicle.license_plate})
                      </option>
                    ))}
                  </select>
                </div>

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
                    {Object.entries(EXPENSE_CATEGORIES).map(([key, category]) => (
                      <option key={key} value={key}>{category.label}</option>
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
                    placeholder="Ex: Plein d'essence, Vidange..."
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

                {/* Kilométrage (optionnel) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kilométrage (optionnel)
                  </label>
                  <input
                    type="number"
                    value={formData.odometer_reading}
                    onChange={(e) => setFormData({...formData, odometer_reading: e.target.value})}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ex: 125000"
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

                {/* Reçu/Facture (optionnel) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reçu/Facture (optionnel)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setFormData({...formData, receipt: e.target.files?.[0] || null})}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

export default VehicleExpensesPage;
