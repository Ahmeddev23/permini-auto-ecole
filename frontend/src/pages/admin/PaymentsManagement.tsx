import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  BanknotesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

interface Payment {
  id: string;
  driving_school_id: string;
  driving_school_name: string;
  plan_type: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'approved' | 'rejected';
  transaction_reference: string;
  payment_proof_file?: string;
  transfer_date?: string;
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  admin_notes?: string;
}

interface Filters {
  status: string;
  payment_method: string;
  plan_type: string;
  driving_school: string;
  date_from: string;
  date_to: string;
}

const PaymentsManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    payment_method: '',
    plan_type: '',
    driving_school: '',
    date_from: '',
    date_to: ''
  });
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [currentPage, filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: 20,
        ...filters
      };
      
      const response = await adminService.getPayments(params);
      setPayments(response.results);
      setTotalCount(response.count);
    } catch (error: any) {
      console.error('Erreur lors du chargement des paiements:', error);
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSelectPayment = (id: string) => {
    setSelectedPayments(prev => 
      prev.includes(id) 
        ? prev.filter(paymentId => paymentId !== id)
        : [...prev, id]
    );
  };

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const handleApprove = (payment: Payment) => {
    setSelectedPayment(payment);
    setAdminNotes('');
    setShowApproveModal(true);
  };

  const handleReject = (payment: Payment) => {
    setSelectedPayment(payment);
    setAdminNotes('');
    setShowRejectModal(true);
  };

  const submitApprove = async () => {
    if (!selectedPayment) return;

    try {
      await adminService.approvePayment(selectedPayment.id, adminNotes);
      toast.success('Paiement approuvé avec succès');
      setShowApproveModal(false);
      fetchPayments();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'approbation');
    }
  };

  const submitReject = async () => {
    if (!selectedPayment || !adminNotes.trim()) {
      toast.error('Veuillez saisir une raison de rejet');
      return;
    }

    try {
      await adminService.rejectPayment(selectedPayment.id, adminNotes);
      toast.success('Paiement rejeté avec succès');
      setShowRejectModal(false);
      fetchPayments();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du rejet');
    }
  };

  const handleExport = async () => {
    try {
      const csvData = payments.map(payment => ({
        'Auto-école': payment.driving_school_name,
        'Plan': payment.plan_type,
        'Montant': `${payment.amount} TND`,
        'Méthode': payment.payment_method,
        'Statut': payment.status,
        'Référence': payment.transaction_reference,
        'Date': new Date(payment.created_at).toLocaleDateString('fr-FR'),
        'Notes': payment.admin_notes || ''
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `paiements-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success('Export réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPayments.length === 0) return;

    try {
      const promises = selectedPayments.map(id =>
        adminService.approvePayment(id, 'Approbation en lot')
      );
      await Promise.all(promises);

      toast.success(`${selectedPayments.length} paiement(s) approuvé(s) avec succès`);
      setSelectedPayments([]);
      fetchPayments();
    } catch (error) {
      toast.error('Erreur lors de l\'approbation en lot');
    }
  };

  const handleBulkReject = async () => {
    if (selectedPayments.length === 0) return;

    const reason = prompt('Raison du rejet en lot:');
    if (!reason) return;

    try {
      const promises = selectedPayments.map(id =>
        adminService.rejectPayment(id, reason)
      );
      await Promise.all(promises);

      toast.success(`${selectedPayments.length} paiement(s) rejeté(s) avec succès`);
      setSelectedPayments([]);
      fetchPayments();
    } catch (error) {
      toast.error('Erreur lors du rejet en lot');
    }
  };

  const handleExportSelected = async () => {
    if (selectedPayments.length === 0) return;

    try {
      const selectedData = payments
        .filter(payment => selectedPayments.includes(payment.id))
        .map(payment => ({
          'Auto-école': payment.driving_school_name,
          'Plan': payment.plan_type,
          'Montant': `${payment.amount} TND`,
          'Méthode': payment.payment_method,
          'Statut': payment.status,
          'Référence': payment.transaction_reference,
          'Date': new Date(payment.created_at).toLocaleDateString('fr-FR'),
          'Notes': payment.admin_notes || ''
        }));

      const headers = Object.keys(selectedData[0]);
      const csvContent = [
        headers.join(','),
        ...selectedData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `paiements-selection-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success('Export de la sélection réussi');
    } catch (error) {
      toast.error('Erreur lors de l\'export de la sélection');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'En attente' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approuvé' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejeté' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { color: 'bg-gray-100 text-gray-800', text: status };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodConfig = {
      bank_transfer: { color: 'bg-blue-100 text-blue-800', text: 'Virement bancaire' },
      credit_card: { color: 'bg-purple-100 text-purple-800', text: 'Carte bancaire' },
      cash: { color: 'bg-green-100 text-green-800', text: 'Espèces' }
    };

    const config = methodConfig[method as keyof typeof methodConfig] || 
                  { color: 'bg-gray-100 text-gray-800', text: method };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const totalPages = Math.ceil(totalCount / 20);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CreditCardIcon className="h-8 w-8 mr-3 text-blue-600" />
            Gestion des Paiements
          </h1>
          <p className="text-gray-600 mt-1">
            {totalCount} paiement{totalCount !== 1 ? 's' : ''} au total
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
          className="p-4 bg-gray-50 rounded-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                <option value="approved">Approuvé</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Méthode de paiement
              </label>
              <select
                value={filters.payment_method}
                onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les méthodes</option>
                <option value="bank_transfer">Virement bancaire</option>
                <option value="credit_card">Carte bancaire</option>
                <option value="cash">Espèces</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de plan
              </label>
              <select
                value={filters.plan_type}
                onChange={(e) => handleFilterChange('plan_type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les plans</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auto-école
              </label>
              <input
                type="text"
                value={filters.driving_school}
                onChange={(e) => handleFilterChange('driving_school', e.target.value)}
                placeholder="Nom de l'auto-école"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions en lot */}
      {selectedPayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-medium">
              {selectedPayments.length} paiement{selectedPayments.length !== 1 ? 's' : ''} sélectionné{selectedPayments.length !== 1 ? 's' : ''}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkApprove}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Approuver en lot
              </button>
              <button
                onClick={handleBulkReject}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Rejeter en lot
              </button>
              <button
                onClick={handleExportSelected}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Exporter sélection
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tableau des paiements */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedPayments.length === payments.length && payments.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPayments(payments.map(p => p.id));
                        } else {
                          setSelectedPayments([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auto-école
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
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
                {payments.map((payment) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={() => handleSelectPayment(payment.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.driving_school_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {payment.driving_school_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.plan_type === 'premium' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {payment.plan_type === 'premium' ? 'Premium' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <BanknotesIcon className="h-4 w-4 mr-1 text-green-600" />
                        {payment.amount} TND
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentMethodBadge(payment.payment_method)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(payment)}
                          className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                handleApprove(payment);
                              }}
                              className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors cursor-pointer"
                              title="Approuver"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                handleReject(payment);
                              }}
                              className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Rejeter"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} sur {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {showViewModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Détails du paiement
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Informations de base */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Auto-école</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.driving_school_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plan demandé</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{selectedPayment.plan_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Montant</label>
                  <p className="mt-1 text-sm text-gray-900 font-semibold">{selectedPayment.amount} DT</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Méthode de paiement</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.payment_method}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Référence de transaction</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPayment.transaction_reference}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de création</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedPayment.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {selectedPayment.approved_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date d'approbation</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedPayment.approved_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
                {selectedPayment.rejected_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de rejet</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedPayment.rejected_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes administratives */}
              {selectedPayment.admin_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes administratives</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedPayment.admin_notes}
                  </p>
                </div>
              )}

              {/* Preuve de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preuve de paiement</label>
                {selectedPayment.payment_proof_file ? (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Fichier joint:</span>
                      <a
                        href={selectedPayment.payment_proof_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Télécharger
                      </a>
                    </div>
                    {/* Informations du virement */}
                    {selectedPayment.transfer_date && (
                      <div className="mb-2 text-sm text-gray-600">
                        <span className="font-medium">Date du virement:</span> {new Date(selectedPayment.transfer_date).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                    {/* Aperçu de l'image si c'est une image */}
                    {selectedPayment.payment_proof_file.match(/\.(jpg|jpeg|png|gif)$/i) && (
                      <div className="mt-2">
                        <img
                          src={selectedPayment.payment_proof_file}
                          alt="Preuve de paiement"
                          className="max-w-full h-auto max-h-64 object-contain border rounded"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Aucune preuve de paiement fournie</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              {selectedPayment.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleApprove(selectedPayment);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleReject(selectedPayment);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Rejeter
                  </button>
                </>
              )}
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'approbation */}
      {showApproveModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Approuver le paiement
              </h3>
              <button
                onClick={() => setShowApproveModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Vous êtes sur le point d'approuver le paiement de <strong>{selectedPayment.driving_school_name}</strong>
                pour le plan <strong>{selectedPayment.plan_type}</strong> d'un montant de <strong>{selectedPayment.amount} DT</strong>.
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes administratives (optionnel)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ajouter des notes..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={submitApprove}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Approuver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rejet */}
      {showRejectModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Rejeter le paiement
              </h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Vous êtes sur le point de rejeter le paiement de <strong>{selectedPayment.driving_school_name}</strong>
                pour le plan <strong>{selectedPayment.plan_type}</strong> d'un montant de <strong>{selectedPayment.amount} DT</strong>.
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison du rejet <span className="text-red-500">*</span>
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Expliquez la raison du rejet..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={submitReject}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Rejeter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsManagement;
