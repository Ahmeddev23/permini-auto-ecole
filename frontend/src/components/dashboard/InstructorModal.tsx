import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import dashboardService from '../../services/dashboardService';
import { InstructorCreate } from '../../types/instructor';
import { LICENSE_TYPES } from '../../types/instructor';

interface InstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstructorCreated: () => void;
}

const InstructorModal: React.FC<InstructorModalProps> = ({
  isOpen,
  onClose,
  onInstructorCreated,
}) => {
  const [formData, setFormData] = useState<InstructorCreate>({
    first_name: '',
    last_name: '',
    cin: '',
    phone: '',
    email: '',
    license_types: [],
    hire_date: new Date().toISOString().split('T')[0],
    salary: undefined,
  });

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [cinExists, setCinExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingCin, setCheckingCin] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        first_name: '',
        last_name: '',
        cin: '',
        phone: '',
        email: '',
        license_types: [],
        hire_date: new Date().toISOString().split('T')[0],
        salary: undefined,
      });
      setSelectedPhoto(null);
      setPhotoPreview(null);
      setEmailExists(false);
      setCinExists(false);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : undefined) : value
    }));
  };

  const handleLicenseTypeChange = (licenseType: string) => {
    setFormData(prev => ({
      ...prev,
      license_types: prev.license_types.includes(licenseType)
        ? prev.license_types.filter(type => type !== licenseType)
        : [...prev.license_types, licenseType]
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La taille de l\'image ne doit pas dépasser 5MB');
        return;
      }
      
      setSelectedPhoto(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Vérification email en temps réel
  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email && formData.email.includes('@')) {
        setCheckingEmail(true);
        try {
          const exists = await dashboardService.checkInstructorEmailExists(formData.email);
          setEmailExists(exists);
        } catch (error) {
          setEmailExists(false);
        } finally {
          setCheckingEmail(false);
        }
      } else {
        setEmailExists(false);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  // Vérification CIN en temps réel
  useEffect(() => {
    const checkCin = async () => {
      if (formData.cin && formData.cin.length >= 8) {
        setCheckingCin(true);
        try {
          const exists = await dashboardService.checkInstructorCinExists(formData.cin);
          setCinExists(exists);
        } catch (error) {
          setCinExists(false);
        } finally {
          setCheckingCin(false);
        }
      } else {
        setCinExists(false);
      }
    };

    const timeoutId = setTimeout(checkCin, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.cin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailExists || cinExists) {
      toast.error('Veuillez corriger les erreurs avant de continuer');
      return;
    }

    if (formData.license_types.length === 0) {
      toast.error('Veuillez sélectionner au moins un type de permis');
      return;
    }

    setLoading(true);
    try {
      const instructorData: InstructorCreate = {
        ...formData,
        photo: selectedPhoto || undefined,
      };

      await dashboardService.createInstructor(instructorData);
      toast.success('Moniteur créé avec succès');
      onInstructorCreated();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du moniteur');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ zIndex: 9999 }}>
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
            style={{ zIndex: -1 }}
          />

          {/* Modal content */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Ajouter un Moniteur
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo */}
                <div className="flex justify-center">
                  <div className="text-center">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Aperçu"
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-4 border-gray-300 dark:border-gray-500">
                        <UserIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="mt-2">
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        {selectedPhoto ? 'Changer' : 'Ajouter photo'}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Informations personnelles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Email et CIN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`w-full rounded-md shadow-sm focus:ring-blue-500 ${
                          emailExists
                            ? 'border-red-300 dark:border-red-600 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                        } dark:bg-gray-700 dark:text-white`}
                      />
                      {checkingEmail && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    {emailExists && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        ❌ Cet email existe déjà
                      </p>
                    )}
                    {formData.email && !emailExists && !checkingEmail && formData.email.includes('@') && (
                      <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                        ✅ Email disponible
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CIN *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cin"
                        value={formData.cin}
                        onChange={handleChange}
                        required
                        className={`w-full rounded-md shadow-sm focus:ring-blue-500 ${
                          cinExists
                            ? 'border-red-300 dark:border-red-600 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                        } dark:bg-gray-700 dark:text-white`}
                      />
                      {checkingCin && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    {cinExists && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        ❌ Ce CIN existe déjà
                      </p>
                    )}
                    {formData.cin && !cinExists && !checkingCin && formData.cin.length >= 8 && (
                      <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                        ✅ CIN disponible
                      </p>
                    )}
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Types de permis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Types de permis *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {LICENSE_TYPES.map((license) => (
                      <label
                        key={license.value}
                        className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={formData.license_types.includes(license.value)}
                          onChange={() => handleLicenseTypeChange(license.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {license.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formData.license_types.length === 0 && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      Veuillez sélectionner au moins un type de permis
                    </p>
                  )}
                </div>

                {/* Date d'embauche et salaire */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date d'embauche *
                    </label>
                    <input
                      type="date"
                      name="hire_date"
                      value={formData.hire_date}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salaire (DT)
                    </label>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading || emailExists || cinExists || formData.license_types.length === 0}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Création...' : 'Créer le moniteur'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default InstructorModal;
