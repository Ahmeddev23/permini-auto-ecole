import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  UserIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CheckIcon,
  XMarkIcon,
  KeyIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_active: boolean;
  date_joined: string;
  last_login: string;
  driving_school_name?: string;
}

interface Filters {
  user_type: string;
  is_active: string;
  search: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    user_type: '',
    is_active: '',
    search: ''
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    is_active: true,
    user_type: 'student'
  });
  const [deleteInfo, setDeleteInfo] = useState<{
    dependencies: any[];
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: 20,
        ...filters
      };

      const response = await adminService.getUsers(params);

      setUsers(response.results);
      setTotalCount(response.count);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des utilisateurs:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id)
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    );
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      is_active: user.is_active,
      user_type: user.user_type
    });
    setShowEditModal(true);
  };

  const handleDelete = async (user: User) => {
    setSelectedUser(user);

    try {
      // Faire une requête DELETE pour vérifier les dépendances
      const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${user.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `AdminSession ${JSON.parse(localStorage.getItem('admin_session') || '{}').session_key}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Suppression réussie
        toast.success('Utilisateur supprimé avec succès');
        fetchUsers();
      } else {
        // Erreur - vérifier s'il y a des dépendances
        const errorData = await response.json();
        if (errorData.dependencies) {
          setDeleteInfo({
            dependencies: errorData.dependencies,
            message: errorData.message
          });
          setShowDeleteModal(true);
        } else {
          toast.error(errorData.error || 'Erreur lors de la suppression');
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await adminService.activateUser(id);
      toast.success('Utilisateur activé avec succès');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de l\'activation');
    }
  };

  const handleDeactivate = async (id: string) => {
    const reason = prompt('Raison de la désactivation:');
    if (!reason) return;

    try {
      await adminService.deactivateUser(id, reason);
      toast.success('Utilisateur désactivé avec succès');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de la désactivation');
    }
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowResetPasswordModal(true);
  };

  const submitResetPassword = async () => {
    if (!selectedUser || !newPassword.trim()) {
      toast.error('Veuillez saisir un mot de passe');
      return;
    }

    try {
      // Utiliser l'API de mise à jour pour changer le mot de passe
      await adminService.updateUser(selectedUser.id, { password: newPassword });
      toast.success('Mot de passe réinitialisé avec succès');
      setShowResetPasswordModal(false);
      setNewPassword('');
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation');
    }
  };

  const handleExport = async () => {
    try {
      const csvData = users.map(user => ({
        'Nom': user.full_name,
        'Email': user.email,
        'Type': user.user_type,
        'Statut': user.is_active ? 'Actif' : 'Inactif',
        'Auto-école': user.driving_school_name || 'N/A',
        'Date de création': new Date(user.date_joined).toLocaleDateString('fr-FR'),
        'Dernière connexion': user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais'
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `utilisateurs-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success('Export réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };



  const submitEdit = async () => {
    if (!selectedUser) return;

    try {
      await adminService.updateUser(selectedUser.id, formData);
      toast.success('Utilisateur mis à jour avec succès');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await adminService.deleteUser(selectedUser.id);
      toast.success('Utilisateur supprimé avec succès');
      setShowDeleteModal(false);
      setDeleteInfo(null);
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleBulkActivate = async () => {
    try {
      for (const userId of selectedUsers) {
        await adminService.activateUser(userId);
      }
      toast.success(`${selectedUsers.length} utilisateur(s) activé(s)`);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de l\'activation en lot');
    }
  };

  const handleBulkDeactivate = async () => {
    const reason = prompt('Raison de la désactivation:');
    if (!reason) return;

    try {
      for (const userId of selectedUsers) {
        await adminService.deactivateUser(userId, reason);
      }
      toast.success(`${selectedUsers.length} utilisateur(s) désactivé(s)`);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de la désactivation en lot');
    }
  };

  const handleBulkExport = () => {
    const selectedData = users.filter(user => selectedUsers.includes(user.id));

    const csvData = selectedData.map(user => ({
      'Nom': user.full_name,
      'Email': user.email,
      'Type': user.user_type,
      'Statut': user.is_active ? 'Actif' : 'Inactif',
      'Auto-école': user.driving_school_name || 'N/A',
      'Date de création': new Date(user.date_joined).toLocaleDateString('fr-FR'),
      'Dernière connexion': user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais'
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `utilisateurs-selection-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Export de la sélection réussi');
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'driving_school':
        return <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />;
      case 'instructor':
        return <AcademicCapIcon className="h-5 w-5 text-green-600" />;
      case 'student':
        return <UserIcon className="h-5 w-5 text-purple-600" />;
      case 'admin':
      case 'administrateur':
        return <ShieldCheckIcon className="h-5 w-5 text-red-600" />;
      default:
        return <UserIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getUserTypeBadge = (userType: string) => {
    const typeConfig = {
      driving_school: { color: 'bg-blue-100 text-blue-800', text: 'Auto-école' },
      instructor: { color: 'bg-green-100 text-green-800', text: 'Moniteur' },
      student: { color: 'bg-purple-100 text-purple-800', text: 'Étudiant' },
      admin: { color: 'bg-red-100 text-red-800', text: 'Admin' },
      administrateur: { color: 'bg-red-100 text-red-800', text: 'Admin' }
    };

    const config = typeConfig[userType as keyof typeof typeConfig] || 
                  { color: 'bg-gray-100 text-gray-800', text: userType };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {getUserTypeIcon(userType)}
        <span className="ml-1">{config.text}</span>
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Actif' : 'Inactif'}
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
              <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-600 mt-1">
              {totalCount} utilisateur{totalCount > 1 ? 's' : ''} au total
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
                    placeholder="Nom, email, username..."
                    className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'utilisateur
                </label>
                <select
                  value={filters.user_type}
                  onChange={(e) => handleFilterChange('user_type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les types</option>
                  <option value="driving_school">Auto-écoles</option>
                  <option value="instructor">Moniteurs</option>
                  <option value="student">Étudiants</option>
                  <option value="admin">Administrateurs</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={filters.is_active}
                  onChange={(e) => handleFilterChange('is_active', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="true">Actifs</option>
                  <option value="false">Inactifs</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ user_type: '', is_active: '', search: '' });
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
      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedUsers.length} utilisateur{selectedUsers.length > 1 ? 's' : ''} sélectionné{selectedUsers.length > 1 ? 's' : ''}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkActivate}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Activer
              </button>
              <button
                onClick={handleBulkDeactivate}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Désactiver
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
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auto-école
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscrit le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          {getUserTypeIcon(user.user_type)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getUserTypeBadge(user.user_type)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user.is_active)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.driving_school_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString('fr-FR')
                      : 'Jamais'
                    }
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.date_joined).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleView(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir les détails"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-green-600 hover:text-green-900"
                        title="Modifier"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      {user.is_active ? (
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Désactiver"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(user.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Activer"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleResetPassword(user)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Réinitialiser le mot de passe"
                      >
                        <KeyIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-5 w-5" />
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
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
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



      {/* Modal de visualisation */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Détails de {selectedUser.full_name}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type d'utilisateur</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.user_type === 'driving_school' ? 'Auto-école' :
                       selectedUser.user_type === 'instructor' ? 'Instructeur' :
                       selectedUser.user_type === 'student' ? 'Étudiant' :
                       selectedUser.user_type}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </p>
                  </div>
                </div>

                {selectedUser.driving_school_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Auto-école</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.driving_school_name}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date d'inscription</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedUser.date_joined).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dernière connexion</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.last_login
                        ? new Date(selectedUser.last_login).toLocaleDateString('fr-FR')
                        : 'Jamais'
                      }
                    </p>
                  </div>
                </div>
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
                    handleEdit(selectedUser);
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

      {/* Modal de modification */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Modifier {selectedUser.full_name}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type d'utilisateur
                    </label>
                    <select
                      value={formData.user_type}
                      onChange={(e) => setFormData({...formData, user_type: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="student">Étudiant</option>
                      <option value="instructor">Instructeur</option>
                      <option value="driving_school">Auto-école</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <select
                      value={formData.is_active ? 'true' : 'false'}
                      onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Actif</option>
                      <option value="false">Inactif</option>
                    </select>
                  </div>
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

      {/* Modal de réinitialisation de mot de passe */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
                <KeyIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4 text-center">
                Réinitialiser le mot de passe
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 text-center mb-4">
                  Nouveau mot de passe pour <strong>{selectedUser.full_name}</strong>
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Saisir le nouveau mot de passe"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setNewPassword('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={submitResetPassword}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression avec dépendances */}
      {showDeleteModal && selectedUser && deleteInfo && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4 text-center">
                Supprimer l'utilisateur
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 text-center mb-4">
                  <strong>{selectedUser.full_name}</strong> a des données liées qui seront également supprimées :
                </p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">
                    ⚠️ Éléments qui seront supprimés :
                  </h4>
                  {deleteInfo.dependencies.map((dep, index) => (
                    <div key={index} className="mb-2">
                      <p className="text-sm text-yellow-700 font-medium">
                        {dep.model} ({dep.count} élément{dep.count > 1 ? 's' : ''})
                      </p>
                      <ul className="text-xs text-yellow-600 ml-4">
                        {dep.items.map((item: string, itemIndex: number) => (
                          <li key={itemIndex}>• {item}</li>
                        ))}
                        {dep.count > dep.items.length && (
                          <li>• ... et {dep.count - dep.items.length} autre{dep.count - dep.items.length > 1 ? 's' : ''}</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-red-600 text-center font-medium">
                  Cette action est irréversible !
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteInfo(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Supprimer définitivement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
