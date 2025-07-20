import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { adminService, DrivingSchool } from '../../services/adminService';
import { toast } from 'react-hot-toast';

interface Filters {
  status: string;
  plan: string;
  search: string;
}

const DrivingSchoolsManagement: React.FC = () => {
  const [drivingSchools, setDrivingSchools] = useState<DrivingSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    plan: '',
    search: ''
  });
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<DrivingSchool | null>(null);
  const [planFormData, setPlanFormData] = useState({
    current_plan: '',
    days_remaining: 0,
    max_accounts: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    current_plan: 'standard'
  });

  useEffect(() => {
    fetchDrivingSchools();
  }, [currentPage, filters]);

  const fetchDrivingSchools = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: 20,
        ...filters
      };
      
      const response = await adminService.getDrivingSchools(params);
      setDrivingSchools(response.results);
      setTotalCount(response.count);
    } catch (error: any) {
      console.error('Erreur lors du chargement des auto-écoles:', error);
      toast.error('Erreur lors du chargement des auto-écoles');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveDrivingSchool(id);
      toast.success('Auto-école approuvée avec succès');
      fetchDrivingSchools();
    } catch (error: any) {
      toast.error('Erreur lors de l\'approbation');
    }
  };

  const handleSuspend = async (id: string) => {
    const reason = prompt('Raison de la suspension:');
    if (!reason) return;

    try {
      await adminService.suspendDrivingSchool(id, reason);
      toast.success('Auto-école suspendue avec succès');
      fetchDrivingSchools();
    } catch (error: any) {
      toast.error('Erreur lors de la suspension');
    }
  };

  const handleReactivate = async (id: string) => {
    const confirmed = confirm('Êtes-vous sûr de vouloir réactiver cette auto-école ?');
    if (!confirmed) return;

    try {
      await adminService.reactivateDrivingSchool(id);
      toast.success('Auto-école réactivée avec succès');
      fetchDrivingSchools();
    } catch (error: any) {
      toast.error('Erreur lors de la réactivation');
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedSchools.length === drivingSchools.length) {
      setSelectedSchools([]);
    } else {
      setSelectedSchools(drivingSchools.map(school => school.id));
    }
  };

  const handleSelectSchool = (id: string) => {
    setSelectedSchools(prev =>
      prev.includes(id)
        ? prev.filter(schoolId => schoolId !== id)
        : [...prev, id]
    );
  };

  const handleView = (school: DrivingSchool) => {
    setSelectedSchool(school);
    setShowViewModal(true);
  };

  const handleEdit = (school: DrivingSchool) => {
    setSelectedSchool(school);
    setFormData({
      name: school.name,
      email: school.email,
      phone: school.phone,
      address: school.address,
      current_plan: school.current_plan
    });
    setShowEditModal(true);
  };

  const handleChangePlan = (school: DrivingSchool) => {
    setSelectedSchool(school);
    // Calculer les jours restants
    const daysRemaining = school.plan_end_date
      ? Math.max(0, Math.ceil((new Date(school.plan_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    setPlanFormData({
      current_plan: school.current_plan,
      days_remaining: daysRemaining,
      max_accounts: school.max_accounts
    });
    setShowChangePlanModal(true);
  };

  const handleChangePlanSubmit = async () => {
    if (!selectedSchool) return;

    try {
      // Calculer la nouvelle date de fin basée sur les jours restants
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + planFormData.days_remaining);

      // Définir max_accounts selon le plan
      const maxAccounts = planFormData.current_plan === 'premium' ? 999999 : planFormData.max_accounts;

      await adminService.updateDrivingSchool(selectedSchool.id, {
        current_plan: planFormData.current_plan,
        max_accounts: maxAccounts,
        plan_end_date: newEndDate.toISOString()
      });

      toast.success('Plan mis à jour avec succès');
      setShowChangePlanModal(false);
      fetchDrivingSchools();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du plan');
    }
  };

  const handleExport = async () => {
    try {
      // Créer les données CSV
      const csvData = drivingSchools.map(school => ({
        'Nom': school.name,
        'Email': school.email,
        'Téléphone': school.phone,
        'Adresse': school.address,
        'Propriétaire': school.owner_name,
        'Email Propriétaire': school.owner_email,
        'Statut': school.status,
        'Plan': school.current_plan,
        'Comptes': `${school.current_accounts}/${school.max_accounts}`,
        'Date de création': new Date(school.created_at).toLocaleDateString('fr-FR')
      }));

      // Convertir en CSV
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');

      // Télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `auto-ecoles-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success('Export réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleBulkApprove = async () => {
    try {
      for (const schoolId of selectedSchools) {
        await adminService.approveDrivingSchool(schoolId);
      }
      toast.success(`${selectedSchools.length} auto-école(s) approuvée(s)`);
      setSelectedSchools([]);
      fetchDrivingSchools();
    } catch (error) {
      toast.error('Erreur lors de l\'approbation en lot');
    }
  };

  const handleBulkSuspend = async () => {
    const reason = prompt('Raison de la suspension:');
    if (!reason) return;

    try {
      for (const schoolId of selectedSchools) {
        await adminService.suspendDrivingSchool(schoolId, reason);
      }
      toast.success(`${selectedSchools.length} auto-école(s) suspendue(s)`);
      setSelectedSchools([]);
      fetchDrivingSchools();
    } catch (error) {
      toast.error('Erreur lors de la suspension en lot');
    }
  };

  const handleBulkReactivate = async () => {
    const confirmed = confirm(`Êtes-vous sûr de vouloir réactiver ${selectedSchools.length} auto-école(s) ?`);
    if (!confirmed) return;

    try {
      for (const schoolId of selectedSchools) {
        await adminService.reactivateDrivingSchool(schoolId);
      }
      toast.success(`${selectedSchools.length} auto-école(s) réactivée(s)`);
      setSelectedSchools([]);
      fetchDrivingSchools();
    } catch (error) {
      toast.error('Erreur lors de la réactivation en lot');
    }
  };

  const handleBulkExport = () => {
    const selectedData = drivingSchools.filter(school => selectedSchools.includes(school.id));

    const csvData = selectedData.map(school => ({
      'Nom': school.name,
      'Email': school.email,
      'Téléphone': school.phone,
      'Adresse': school.address,
      'Propriétaire': school.owner_name,
      'Email Propriétaire': school.owner_email,
      'Statut': school.status,
      'Plan': school.current_plan,
      'Comptes': `${school.current_accounts}/${school.max_accounts}`,
      'Date de création': new Date(school.created_at).toLocaleDateString('fr-FR')
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auto-ecoles-selection-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Export de la sélection réussi');
  };

  const submitEdit = async () => {
    if (!selectedSchool) return;

    try {
      await adminService.updateDrivingSchool(selectedSchool.id, formData);
      toast.success('Auto-école mise à jour avec succès');
      setShowEditModal(false);
      fetchDrivingSchools();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleResetPassword = async (school: DrivingSchool) => {
    const confirmed = confirm(`Réinitialiser le mot de passe de ${school.owner_name} ?`);
    if (!confirmed) return;

    try {
      // Simuler la réinitialisation du mot de passe
      toast.success('Mot de passe réinitialisé. Nouveau mot de passe: temp123');
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'En attente' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approuvée' },
      suspended: { color: 'bg-red-100 text-red-800', text: 'Suspendue' },
      rejected: { color: 'bg-gray-100 text-gray-800', text: 'Rejetée' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const planConfig = {
      standard: { color: 'bg-blue-100 text-blue-800', text: 'Standard' },
      premium: { color: 'bg-purple-100 text-purple-800', text: 'Premium' }
    };

    const config = planConfig[plan as keyof typeof planConfig] || planConfig.standard;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const totalPages = Math.ceil(totalCount / 20);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
              Gestion des Auto-écoles
            </h1>
            <p className="text-gray-600 mt-1">
              {totalCount} auto-école{totalCount > 1 ? 's' : ''} au total
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filtres
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Exporter
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 bg-gray-50 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recherche
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Nom, email..."
                    className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvée</option>
                  <option value="suspended">Suspendue</option>
                  <option value="rejected">Rejetée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan
                </label>
                <select
                  value={filters.plan}
                  onChange={(e) => handleFilterChange('plan', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les plans</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ status: '', plan: '', search: '' });
                    setCurrentPage(1);
                  }}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Actions en lot */}
      {selectedSchools.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedSchools.length} auto-école{selectedSchools.length > 1 ? 's' : ''} sélectionnée{selectedSchools.length > 1 ? 's' : ''}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkApprove}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Approuver
              </button>
              <button
                onClick={handleBulkSuspend}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Suspendre
              </button>
              <button
                onClick={handleBulkReactivate}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Réactiver
              </button>
              <button
                onClick={handleBulkExport}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Exporter
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tableau */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedSchools.length === drivingSchools.length && drivingSchools.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auto-école
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propriétaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comptes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créée le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drivingSchools.map((school) => (
                <motion.tr
                  key={school.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedSchools.includes(school.id)}
                      onChange={() => handleSelectSchool(school.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{school.name}</div>
                      <div className="text-sm text-gray-500">{school.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{school.owner_name}</div>
                      <div className="text-sm text-gray-500">{school.owner_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(school.status)}
                  </td>
                  <td className="px-6 py-4">
                    {getPlanBadge(school.current_plan)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {school.current_accounts}/{school.max_accounts}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(school.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleView(school)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir les détails"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(school)}
                        className="text-green-600 hover:text-green-900"
                        title="Modifier"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      {school.status === 'pending' && (
                        <button
                          onClick={() => handleApprove(school.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approuver"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                      )}
                      {school.status === 'approved' && (
                        <button
                          onClick={() => handleSuspend(school.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Suspendre"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                      {school.status === 'suspended' && (
                        <button
                          onClick={() => handleReactivate(school.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Réactiver"
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleChangePlan(school)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Changer de plan"
                      >
                        <ShieldCheckIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> à{' '}
                  <span className="font-medium">{Math.min(currentPage * 20, totalCount)}</span> sur{' '}
                  <span className="font-medium">{totalCount}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Modal de modification */}
      {showEditModal && selectedSchool && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Modifier {selectedSchool.name}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'auto-école
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan d'abonnement
                  </label>
                  <select
                    value={formData.current_plan}
                    onChange={(e) => setFormData({...formData, current_plan: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={submitEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {showViewModal && selectedSchool && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Détails de {selectedSchool.name}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSchool.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSchool.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSchool.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plan</label>
                    <p className="mt-1 text-sm text-gray-900">{getPlanBadge(selectedSchool.current_plan)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Adresse</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSchool.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Propriétaire</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSchool.owner_name}</p>
                    <p className="text-xs text-gray-500">{selectedSchool.owner_email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <p className="mt-1 text-sm text-gray-900">{getStatusBadge(selectedSchool.status)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Comptes utilisés</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedSchool.current_accounts} / {selectedSchool.max_accounts === 999999 ? '∞' : selectedSchool.max_accounts}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de création</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedSchool.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {selectedSchool.plan_end_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plan expire le</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedSchool.plan_end_date).toLocaleDateString('fr-FR')}
                      <span className="ml-2 text-xs text-gray-500">
                        ({selectedSchool.days_remaining} jours restants)
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(selectedSchool);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de changement de plan */}
      {showChangePlanModal && selectedSchool && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Modifier le plan d'abonnement
              </h3>
              <button
                onClick={() => setShowChangePlanModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Informations de l'auto-école */}
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-gray-900">{selectedSchool.name}</h4>
                <p className="text-sm text-gray-600">{selectedSchool.email}</p>
              </div>

              {/* Sélection du plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan d'abonnement
                </label>
                <select
                  value={planFormData.current_plan}
                  onChange={(e) => {
                    const newPlan = e.target.value;
                    setPlanFormData({
                      ...planFormData,
                      current_plan: newPlan,
                      max_accounts: newPlan === 'premium' ? 999999 : (planFormData.max_accounts || 200)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="standard">Standard (49 TND/mois)</option>
                  <option value="premium">Premium (99 TND/mois)</option>
                </select>
              </div>

              {/* Jours restants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jours restants
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={planFormData.days_remaining}
                  onChange={(e) => setPlanFormData({...planFormData, days_remaining: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre de jours restants"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Date d'expiration: {new Date(Date.now() + planFormData.days_remaining * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
                </p>
              </div>

              {/* Nombre de comptes (seulement pour Standard) */}
              {planFormData.current_plan === 'standard' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre maximum de comptes
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={planFormData.max_accounts}
                    onChange={(e) => setPlanFormData({...planFormData, max_accounts: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre maximum de comptes"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Plan Standard: généralement 200 comptes + 50 par renouvellement
                  </p>
                </div>
              )}

              {planFormData.current_plan === 'premium' && (
                <div className="bg-yellow-50 p-3 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Plan Premium:</strong> Comptes illimités
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowChangePlanModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleChangePlanSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrivingSchoolsManagement;
