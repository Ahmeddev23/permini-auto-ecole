import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface InlineDateEditorProps {
  value: string;
  onSave: (newDate: string) => Promise<void>;
  label: string;
  vehicleInfo: string;
  isExpiringSoon?: boolean;
}

const InlineDateEditor: React.FC<InlineDateEditorProps> = ({
  value,
  onSave,
  label,
  vehicleInfo,
  isExpiringSoon = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus sur l'input quand on entre en mode édition
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Réinitialiser la valeur quand la prop change
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);

    // Si pas de date définie, proposer une date dans 1 an
    if (!value || isNaN(new Date(value).getTime())) {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setEditValue(nextYear.toISOString().split('T')[0]);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
    setError(null);
  };

  const validateDate = (dateString: string): string | null => {
    if (!dateString) {
      return 'La date est requise';
    }

    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      return 'La date doit être dans le futur';
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateDate(editValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(editValue);
      setIsEditing(false);
      toast.success(`${label} mise à jour avec succès pour ${vehicleInfo}`);
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError(error.message || 'Erreur lors de la sauvegarde');
      toast.error(`Erreur lors de la mise à jour de ${label.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Calculer les jours restants
  const getDaysUntilExpiry = (dateString: string): number => {
    if (!dateString) return 0;

    const today = new Date();
    const expiryDate = new Date(dateString);

    // Vérifier si la date est valide
    if (isNaN(expiryDate.getTime())) return 0;

    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Fonction pour formater la date d'affichage
  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return 'Cliquez pour définir';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date invalide - Cliquez pour corriger';

    return date.toLocaleDateString('fr-FR');
  };

  // Fonction pour formater le message des jours restants
  const formatDaysMessage = (days: number): string => {
    if (!value || isNaN(new Date(value).getTime())) {
      return 'Cliquez pour ajouter une date';
    }

    if (days < 0) {
      return `Expiré depuis ${Math.abs(days)} jour(s)`;
    } else if (days === 0) {
      return "Expire aujourd'hui";
    } else {
      return `Dans ${days} jour(s)`;
    }
  };

  const daysRemaining = getDaysUntilExpiry(value);
  const isExpired = daysRemaining < 0;
  const isCritical = daysRemaining <= 3 && daysRemaining >= 0;
  const isWarning = daysRemaining <= 7 && daysRemaining > 3;

  const getStatusColor = () => {
    if (!value || isNaN(new Date(value).getTime())) return 'text-blue-600';
    if (isExpired) return 'text-red-600';
    if (isCritical) return 'text-red-600';
    if (isWarning) return 'text-orange-600';
    if (daysRemaining <= 30) return 'text-blue-600';
    return 'text-green-600';
  };

  const getStatusBg = () => {
    if (!value || isNaN(new Date(value).getTime())) return 'bg-blue-50 dark:bg-blue-900/10 border-2 border-dashed border-blue-200 dark:border-blue-800';
    if (isExpired) return 'bg-red-50 dark:bg-red-900/10';
    if (isCritical) return 'bg-red-50 dark:bg-red-900/10';
    if (isWarning) return 'bg-orange-50 dark:bg-orange-900/10';
    if (daysRemaining <= 30) return 'bg-blue-50 dark:bg-blue-900/10';
    return 'bg-green-50 dark:bg-green-900/10';
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <CalendarIcon className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className={`pl-8 w-full text-sm rounded border ${
                error 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              } dark:bg-gray-700 dark:text-white`}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSave}
              disabled={isLoading}
              className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
              title="Sauvegarder"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              ) : (
                <CheckIcon className="h-4 w-4" />
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCancel}
              disabled={isLoading}
              className="p-1 text-gray-600 hover:text-gray-700 disabled:opacity-50"
              title="Annuler"
            >
              <XMarkIcon className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
        
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center space-x-1 text-red-600 text-xs"
            >
              <ExclamationTriangleIcon className="h-3 w-3" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`group cursor-pointer p-2 rounded-md transition-colors ${getStatusBg()}`}
      onClick={handleEdit}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-sm font-medium ${getStatusColor()}`}>
            {formatDisplayDate(value)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatDaysMessage(daysRemaining)}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {!value || isNaN(new Date(value).getTime()) ? (
            <CalendarIcon className="h-4 w-4 text-blue-500 group-hover:text-blue-600" />
          ) : (isExpired || isCritical) ? (
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
          ) : (
            <PencilIcon className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InlineDateEditor;
