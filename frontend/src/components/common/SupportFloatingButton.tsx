import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QuestionMarkCircleIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { dashboardService } from '../../services/dashboardService';
import { usePlanPermissions } from '../../hooks/usePlanPermissions';
import { toast } from 'react-hot-toast';

interface SupportFloatingButtonProps {
  className?: string;
}

const SupportFloatingButton: React.FC<SupportFloatingButtonProps> = ({ className = '' }) => {
  const { permissions } = usePlanPermissions();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Fonction pour déterminer la priorité automatique selon le plan
  const getAutomaticPriority = (): 'low' | 'medium' | 'high' | 'urgent' => {
    const currentPlan = permissions?.currentPlan;

    switch (currentPlan) {
      case 'premium':
        return 'high';      // Premium → Priorité Élevée
      case 'standard':
        return 'medium';    // Standard → Priorité Moyenne
      case 'free':
      default:
        return 'low';       // Free → Priorité Faible
    }
  };

  // Définir la priorité automatiquement au chargement
  useEffect(() => {
    const automaticPriority = getAutomaticPriority();
    setFormData(prev => ({ ...prev, priority: automaticPriority }));
  }, [permissions?.currentPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await dashboardService.submitSupportRequest(formData);
      
      setTicketId(response.ticket_id);
      setIsSubmitted(true);
      toast.success('Votre demande de support a été envoyée avec succès !');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ subject: '', message: '', priority: 'medium' });
        setIsOpen(false);
      }, 3000);
      
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi de la demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsSubmitted(false);
    const automaticPriority = getAutomaticPriority();
    setFormData({ subject: '', message: '', priority: automaticPriority });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Faible';
      case 'medium': return 'Moyenne';
      case 'high': return 'Élevée';
      case 'urgent': return 'Urgente';
      default: return 'Moyenne';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'premium': return 'Premium';
      case 'standard': return 'Standard';
      case 'free': return 'Gratuit';
      default: return 'Standard';
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <QuestionMarkCircleIcon className="h-6 w-6" />
      </motion.button>

      {/* Modal de support */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Support Technique
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Décrivez votre problème ou question
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Contenu */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {isSubmitted ? (
                  /* Message de confirmation */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Demande envoyée !
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Votre demande de support a été transmise à notre équipe.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Numéro de ticket: <span className="font-mono font-medium">{ticketId}</span>
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                      Nous vous répondrons dans les plus brefs délais.
                    </p>
                  </motion.div>
                ) : (
                  /* Formulaire */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Information sur la priorité automatique */}
                    <div className="mb-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(getAutomaticPriority()).split(' ')[1]}`}></div>
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Plan {getPlanLabel(permissions?.currentPlan || 'free')} → Priorité {getPriorityLabel(getAutomaticPriority())}
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                          Votre demande sera traitée avec une priorité {getPriorityLabel(getAutomaticPriority()).toLowerCase()}
                        </p>
                      </div>

                      {/* Information sur les avantages des plans supérieurs */}
                      {permissions?.currentPlan === 'free' && (
                        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded text-xs">
                          <p className="text-amber-800 dark:text-amber-200">
                            💡 <strong>Astuce :</strong> Avec le plan Standard, vos demandes sont traitées plus rapidement !
                          </p>
                        </div>
                      )}

                      {permissions?.currentPlan === 'standard' && (
                        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded text-xs">
                          <p className="text-amber-800 dark:text-amber-200">
                            💡 <strong>Astuce :</strong> Avec le plan Premium, vos demandes sont traitées en priorité élevée automatiquement !
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Sujet */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sujet *
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Résumez votre problème en quelques mots"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description détaillée *
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Décrivez votre problème en détail. Plus vous donnez d'informations, plus nous pourrons vous aider efficacement."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                        required
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !formData.subject.trim() || !formData.message.trim()}
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Envoi...</span>
                          </>
                        ) : (
                          <>
                            <PaperAirplaneIcon className="h-4 w-4" />
                            <span>Envoyer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportFloatingButton;
