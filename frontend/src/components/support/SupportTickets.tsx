import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { dashboardService } from '../../services/dashboardService';
import { SupportTicket } from '../../types/support';
import { toast } from 'react-hot-toast';

const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getSupportTickets();
      setTickets(response.tickets);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'in_progress':
        return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />;
      case 'resolved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'closed':
        return <CheckCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <TicketIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TicketIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Mes Tickets de Support
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Consultez vos demandes de support et les réponses de notre équipe
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Liste des tickets */}
      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <TicketIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun ticket de support
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Vous n'avez pas encore envoyé de demande de support.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTicketClick(ticket)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(ticket.status)}
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {ticket.subject}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {ticket.message.split('\n\n')[ticket.message.split('\n\n').length - 1]}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">
                        {formatDate(ticket.created_at)}
                      </span>
                    </div>
                    
                    {ticket.admin_response && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        <span>Réponse reçue</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                    {ticket.status_display}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority_display}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de détail du ticket */}
      <AnimatePresence>
        {showModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedTicket.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedTicket.subject}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Ticket #{selectedTicket.id.slice(-8)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenu */}
              <div className="p-6 max-h-96 overflow-y-auto space-y-6">
                {/* Informations du ticket */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status_display}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(selectedTicket.priority)}`}>
                      Priorité {selectedTicket.priority_display}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(selectedTicket.created_at)}
                  </div>
                </div>

                {/* Message original */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Votre message:
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedTicket.message.split('\n\n')[selectedTicket.message.split('\n\n').length - 1]}
                    </p>
                  </div>
                </div>

                {/* Réponse admin */}
                {selectedTicket.admin_response && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <UserIcon className="h-4 w-4 text-blue-500" />
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Réponse de notre équipe:
                      </h4>
                      {selectedTicket.responded_by_name && (
                        <span className="text-xs text-gray-500">
                          par {selectedTicket.responded_by_name}
                        </span>
                      )}
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedTicket.admin_response}
                      </p>
                      {selectedTicket.responded_at && (
                        <p className="text-xs text-gray-500 mt-2">
                          Répondu le {formatDate(selectedTicket.responded_at)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Message si pas de réponse */}
                {!selectedTicket.admin_response && selectedTicket.status === 'new' && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                      ⏳ Votre demande est en attente de traitement. Notre équipe vous répondra dans les plus brefs délais.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportTickets;
