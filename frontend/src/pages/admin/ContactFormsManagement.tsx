import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { adminService, ContactForm } from '../../services/adminService';
import { toast } from 'react-hot-toast';

interface Filters {
  status: string;
  priority: string;
  search: string;
}

const ContactFormsManagement: React.FC = () => {
  const [contactForms, setContactForms] = useState<ContactForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    priority: '',
    search: ''
  });
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForm, setSelectedForm] = useState<ContactForm | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchContactForms();
  }, [currentPage, filters]);

  const fetchContactForms = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: 20,
        ...filters
      };
      
      const response = await adminService.getContactForms(params);
      setContactForms(response.results);
      setTotalCount(response.count);
    } catch (error: any) {
      console.error('Erreur lors du chargement des formulaires:', error);
      toast.error('Erreur lors du chargement des formulaires');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedForms.length === contactForms.length) {
      setSelectedForms([]);
    } else {
      setSelectedForms(contactForms.map(form => form.id));
    }
  };

  const handleSelectForm = (id: string) => {
    setSelectedForms(prev => 
      prev.includes(id) 
        ? prev.filter(formId => formId !== id)
        : [...prev, id]
    );
  };

  const handleView = (form: ContactForm) => {
    setSelectedForm(form);
    setShowViewModal(true);
  };

  const handleRespond = (form: ContactForm) => {
    setSelectedForm(form);
    setResponseText(form.admin_response || '');
    setShowResponseModal(true);
  };

  const submitResponse = async () => {
    if (!selectedForm || !responseText.trim()) return;

    try {
      await adminService.updateContactForm(selectedForm.id, {
        admin_response: responseText,
        status: 'resolved'
      });
      
      toast.success('Réponse envoyée avec succès');
      setShowResponseModal(false);
      setSelectedForm(null);
      setResponseText('');
      fetchContactForms();
    } catch (error: any) {
      toast.error('Erreur lors de l\'envoi de la réponse');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', text: 'Nouveau', icon: ExclamationTriangleIcon },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', text: 'En cours', icon: ClockIcon },
      resolved: { color: 'bg-green-100 text-green-800', text: 'Résolu', icon: CheckCircleIcon },
      closed: { color: 'bg-gray-100 text-gray-800', text: 'Fermé', icon: XCircleIcon }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', text: 'Faible' },
      medium: { color: 'bg-blue-100 text-blue-800', text: 'Moyenne' },
      high: { color: 'bg-orange-100 text-orange-800', text: 'Élevée' },
      urgent: { color: 'bg-red-100 text-red-800', text: 'Urgente' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    
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
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 mr-3" />
              Formulaires de Contact
            </h1>
            <p className="text-gray-600 mt-1">
              {totalCount} formulaire{totalCount > 1 ? 's' : ''} au total
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
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center">
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Exporter
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
                    placeholder="Nom, email, sujet..."
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
                  <option value="new">Nouveau</option>
                  <option value="in_progress">En cours</option>
                  <option value="resolved">Résolu</option>
                  <option value="closed">Fermé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les priorités</option>
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ status: '', priority: '', search: '' });
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
      {selectedForms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedForms.length} formulaire{selectedForms.length > 1 ? 's' : ''} sélectionné{selectedForms.length > 1 ? 's' : ''}
            </span>
            <div className="flex space-x-2">
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                Marquer comme résolu
              </button>
              <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                En cours
              </button>
              <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
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
                    checked={selectedForms.length === contactForms.length && contactForms.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sujet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigné à
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contactForms.map((form) => (
                <motion.tr
                  key={form.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedForms.includes(form.id)}
                      onChange={() => handleSelectForm(form.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{form.name}</div>
                      <div className="text-sm text-gray-500">{form.email}</div>
                      {form.phone && (
                        <div className="text-xs text-gray-400">{form.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {form.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(form.status)}
                  </td>
                  <td className="px-6 py-4">
                    {getPriorityBadge(form.priority)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {form.assigned_to_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(form.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleView(form)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir les détails"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleRespond(form)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
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

      {/* Modal de réponse */}
      {showResponseModal && selectedForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Répondre à {selectedForm.name}
              </h3>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Message original:</h4>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Sujet:</strong> {selectedForm.subject}
                </p>
                <p className="text-sm text-gray-700">
                  {selectedForm.message}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre réponse:
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tapez votre réponse ici..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setSelectedForm(null);
                    setResponseText('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={submitResponse}
                  disabled={!responseText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Envoyer la réponse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {showViewModal && selectedForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Détails du formulaire de contact
                </h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedForm(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Informations de contact */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Informations de contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom</label>
                      <p className="text-sm text-gray-900">{selectedForm.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedForm.email}</p>
                    </div>
                    {selectedForm.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                        <p className="text-sm text-gray-900">{selectedForm.phone}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedForm.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Message</h4>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">Sujet</label>
                    <p className="text-sm text-gray-900">{selectedForm.subject}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contenu</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedForm.message}</p>
                  </div>
                </div>

                {/* Statut et priorité */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Statut et priorité</h4>
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                      {getStatusBadge(selectedForm.status)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                      {getPriorityBadge(selectedForm.priority)}
                    </div>
                  </div>
                  {selectedForm.assigned_to_name && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700">Assigné à</label>
                      <p className="text-sm text-gray-900">{selectedForm.assigned_to_name}</p>
                    </div>
                  )}
                </div>

                {/* Réponse admin si elle existe */}
                {selectedForm.admin_response && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Réponse de l'administrateur</h4>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedForm.admin_response}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleRespond(selectedForm);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Répondre
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedForm(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactFormsManagement;
