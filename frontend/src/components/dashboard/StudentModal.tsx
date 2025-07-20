import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, IdentificationIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import dashboardService, { Student } from '../../services/dashboardService';
import { useRealTimeValidation } from '../../hooks/useRealTimeValidation';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
  onSuccess: () => void;
}

const StudentModal: React.FC<StudentModalProps> = ({ isOpen, onClose, student, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    cin: '',
    date_of_birth: '',
    address: '',
    license_type: 'B',
    formation_status: 'registered',
    payment_type: 'fixed',
    fixed_price: '',
    hourly_rate: '',
    theory_hours_completed: 0,
    practical_hours_completed: 0,
    theory_exam_attempts: 0,
    practical_exam_attempts: 0,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hook pour la vérification en temps réel
  const { emailCheck, cinCheck, checkEmail, checkCin, resetChecks } = useRealTimeValidation();

  useEffect(() => {
    if (student) {
      setFormData({
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        email: student.email || '',
        phone: student.phone || '',
        cin: student.cin || '',
        date_of_birth: student.date_of_birth || '',
        address: student.address || '',
        license_type: student.license_type || 'B',
        formation_status: student.formation_status || 'registered',
        payment_type: student.payment_type || 'fixed',
        fixed_price: student.fixed_price?.toString() || '',
        hourly_rate: student.hourly_rate?.toString() || '',
        theory_hours_completed: student.theory_hours_completed || 0,
        practical_hours_completed: student.practical_hours_completed || 0,
        theory_exam_attempts: student.theory_exam_attempts || 0,
        practical_exam_attempts: student.practical_exam_attempts || 0,
        is_active: student.is_active !== undefined ? student.is_active : true
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        cin: '',
        date_of_birth: '',
        address: '',
        license_type: 'B',
        formation_status: 'registered',
        payment_type: 'fixed',
        fixed_price: '',
        hourly_rate: '',
        theory_hours_completed: 0,
        practical_hours_completed: 0,
        theory_exam_attempts: 0,
        practical_exam_attempts: 0,
        is_active: true
      });
    }
    setErrors({});
    resetChecks(); // Réinitialiser les vérifications
  }, [student, isOpen]); // Retirer resetChecks des dépendances

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Vérifier si email ou CIN existe déjà pour les nouveaux candidats
    if (!student) {
      if (emailCheck.exists === true) {
        toast.error('Cet email existe déjà');
        setLoading(false);
        return;
      }
      if (cinCheck.exists === true) {
        toast.error('Ce CIN existe déjà');
        setLoading(false);
        return;
      }
    }

    try {
      let submitData;

      if (student) {
        // Mode modification - envoyer tous les champs
        submitData = {
          ...formData,
          fixed_price: formData.fixed_price ? parseFloat(formData.fixed_price) : null,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          theory_hours_completed: parseInt(formData.theory_hours_completed.toString()) || 0,
          practical_hours_completed: parseInt(formData.practical_hours_completed.toString()) || 0,
          theory_exam_attempts: parseInt(formData.theory_exam_attempts.toString()) || 0,
          practical_exam_attempts: parseInt(formData.practical_exam_attempts.toString()) || 0
        };

        // En mode modification, ne pas envoyer email et cin (protégés)
        const { email, cin, ...updateData } = submitData;
        await dashboardService.updateStudent(student.id, updateData);
        toast.success('Candidat modifié avec succès');
      } else {
        // Mode création - envoyer seulement les champs essentiels avec des valeurs par défaut
        submitData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          cin: formData.cin,
          license_type: formData.license_type,
          // Valeurs par défaut pour les champs requis mais non visibles
          date_of_birth: '2000-01-01', // Date par défaut
          address: 'À compléter', // Adresse par défaut
          payment_type: 'fixed',
          fixed_price: 1000.00, // Prix par défaut
        };

        await dashboardService.createStudent(submitData);
        toast.success('Candidat créé avec succès');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Vérification en temps réel pour email et CIN
    if (name === 'email' && !student) { // Seulement pour les nouveaux candidats
      checkEmail(value);
    } else if (name === 'cin' && !student) { // Seulement pour les nouveaux candidats
      checkCin(value);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-[10000]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {student ? 'Modifier le candidat' : 'Nouveau candidat'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {student ? 'Modifiez les informations du candidat' : 'Ajoutez un nouveau candidat à votre auto-école'}
                  </p>
                  {student && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      ⚠️ L'email et le CIN ne peuvent pas être modifiés
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prénom *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Prénom du candidat"
                    />
                  </div>
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Nom du candidat"
                    />
                  </div>
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={!!student} // Désactiver en mode modification
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } ${student ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
                      placeholder="email@exemple.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                  {/* Indicateur de vérification email */}
                  {!student && formData.email && (
                    <div className="mt-1 flex items-center text-sm">
                      {emailCheck.isChecking ? (
                        <div className="flex items-center text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                          Vérification...
                        </div>
                      ) : emailCheck.exists === true ? (
                        <div className="flex items-center text-red-600">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {emailCheck.message}
                        </div>
                      ) : emailCheck.exists === false ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          {emailCheck.message}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="+216 XX XXX XXX"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CIN *
                  </label>
                  <div className="relative">
                    <IdentificationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="cin"
                      value={formData.cin}
                      onChange={handleChange}
                      required
                      disabled={!!student} // Désactiver en mode modification
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.cin ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } ${student ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
                      placeholder="Numéro CIN"
                    />
                  </div>
                  {errors.cin && (
                    <p className="mt-1 text-sm text-red-600">{errors.cin}</p>
                  )}
                  {/* Indicateur de vérification CIN */}
                  {!student && formData.cin && (
                    <div className="mt-1 flex items-center text-sm">
                      {cinCheck.isChecking ? (
                        <div className="flex items-center text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                          Vérification...
                        </div>
                      ) : cinCheck.exists === true ? (
                        <div className="flex items-center text-red-600">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {cinCheck.message}
                        </div>
                      ) : cinCheck.exists === false ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          {cinCheck.message}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Date de naissance - seulement en mode modification */}
                {student && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de naissance *
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.date_of_birth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.date_of_birth && (
                      <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Adresse - seulement en mode modification */}
              {student && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Adresse complète"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type de permis *
                  </label>
                  <select
                    name="license_type"
                    value={formData.license_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="A">Permis A (Moto)</option>
                    <option value="B">Permis B (Voiture)</option>
                    <option value="C">Permis C (Camion)</option>
                    <option value="D">Permis D (Bus)</option>
                  </select>
                </div>

                {/* Type de paiement - seulement en mode modification */}
                {student && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type de paiement *
                    </label>
                    <select
                      name="payment_type"
                      value={formData.payment_type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="fixed">Tarif fixe</option>
                      <option value="hourly">Par heure</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Champs de prix - seulement en mode modification */}
              {student && formData.payment_type === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prix fixe (DT) *
                  </label>
                  <input
                    type="number"
                    name="fixed_price"
                    value={formData.fixed_price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              )}

              {student && formData.payment_type === 'hourly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tarif horaire (DT) *
                  </label>
                  <input
                    type="number"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              )}

              {/* Statut de formation - seulement en mode modification */}
              {student && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut de formation
                  </label>
                  <select
                    name="formation_status"
                    value={formData.formation_status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="registered">Inscrit</option>
                    <option value="theory_in_progress">Code en cours</option>
                    <option value="theory_passed">Code réussi</option>
                    <option value="practical_in_progress">Conduite en cours</option>
                    <option value="practical_passed">Conduite réussie</option>
                    <option value="completed">Formation terminée</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </div>
              )}

              {/* Progression - seulement en mode modification */}
              {student && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Heures de code effectuées
                    </label>
                    <input
                      type="number"
                      name="theory_hours_completed"
                      value={formData.theory_hours_completed}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Heures de conduite effectuées
                    </label>
                    <input
                      type="number"
                      name="practical_hours_completed"
                      value={formData.practical_hours_completed}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {/* Tentatives d'examen - seulement en mode modification */}
              {student && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tentatives examen code
                    </label>
                    <input
                      type="number"
                      name="theory_exam_attempts"
                      value={formData.theory_exam_attempts}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tentatives examen conduite
                    </label>
                    <input
                      type="number"
                      name="practical_exam_attempts"
                      value={formData.practical_exam_attempts}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {/* Statut actif - seulement en mode modification */}
              {student && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Candidat actif
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{loading ? 'Sauvegarde...' : (student ? 'Modifier' : 'Créer')}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StudentModal;
