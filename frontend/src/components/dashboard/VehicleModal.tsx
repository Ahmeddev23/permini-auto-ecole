import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { dashboardService } from '../../services/dashboardService';
import { VehicleList, VehicleCreate, VehicleUpdate, VEHICLE_TYPES, VEHICLE_STATUS } from '../../types/vehicle';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicle?: VehicleList | null;
}

const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  vehicle
}) => {
  const [formData, setFormData] = useState<VehicleCreate>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    vehicle_type: 'B',
    color: '',
    engine_number: '',
    chassis_number: '',
    current_mileage: 0,
    technical_inspection_date: '',
    insurance_expiry_date: '',
    status: 'active'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (vehicle) {
      // Mode édition - charger les données du véhicule
      setFormData({
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        license_plate: vehicle.license_plate,
        vehicle_type: vehicle.vehicle_type,
        color: vehicle.color,
        engine_number: '',
        chassis_number: '',
        current_mileage: 0,
        technical_inspection_date: '',
        insurance_expiry_date: '',
        status: vehicle.status
      });
      setCurrentPhoto(vehicle.photo || null);
    } else {
      // Mode création - réinitialiser le formulaire
      setFormData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        license_plate: '',
        vehicle_type: 'B',
        color: '',
        engine_number: '',
        chassis_number: '',
        current_mileage: 0,
        technical_inspection_date: '',
        insurance_expiry_date: '',
        status: 'active'
      });
      setCurrentPhoto(null);
    }
    setErrors({});
    setSelectedPhoto(null);
    setPhotoPreview(null);
  }, [vehicle]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'current_mileage' ? parseInt(value) || 0 : value
    }));

    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image valide');
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }

      setSelectedPhoto(file);

      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.brand.trim()) {
      newErrors.brand = 'La marque est requise';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Le modèle est requis';
    }

    if (!formData.license_plate.trim()) {
      newErrors.license_plate = 'La matriculation est requise';
    }

    if (!formData.color.trim()) {
      newErrors.color = 'La couleur est requise';
    }

    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Année invalide';
    }

    if (!formData.technical_inspection_date) {
      newErrors.technical_inspection_date = 'La date de visite technique est requise';
    }

    if (!formData.insurance_expiry_date) {
      newErrors.insurance_expiry_date = 'La date d\'expiration de l\'assurance est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let vehicleResult;

      if (vehicle) {
        // Mode édition
        const updateData: VehicleUpdate = {
          brand: formData.brand,
          model: formData.model,
          year: formData.year,
          color: formData.color,
          engine_number: formData.engine_number || undefined,
          chassis_number: formData.chassis_number || undefined,
          current_mileage: formData.current_mileage,
          technical_inspection_date: formData.technical_inspection_date,
          insurance_expiry_date: formData.insurance_expiry_date,
          status: formData.status
        };
        vehicleResult = await dashboardService.updateVehicle(vehicle.id, updateData);

        // Upload de la photo si une nouvelle photo est sélectionnée
        if (selectedPhoto) {
          await dashboardService.uploadVehiclePhoto(vehicle.id, selectedPhoto);
        }

        toast.success('Véhicule modifié avec succès');
      } else {
        // Mode création
        vehicleResult = await dashboardService.createVehicle(formData);

        // Upload de la photo si une photo est sélectionnée
        if (selectedPhoto) {
          await dashboardService.uploadVehiclePhoto(vehicleResult.id, selectedPhoto);
        }

        toast.success('Véhicule créé avec succès');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ zIndex: 9999 }}>
      <motion.div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ zIndex: -1 }}
      />
      
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <motion.div
          className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {vehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Section Photo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Photo du véhicule
                </label>
                <div className="flex items-center space-x-4">
                  {/* Aperçu de la photo */}
                  <div className="flex-shrink-0">
                    {photoPreview || currentPhoto ? (
                      <img
                        src={photoPreview || currentPhoto || ''}
                        alt="Aperçu"
                        className="h-20 w-20 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                        <span className="text-gray-400 text-xs text-center">Pas de photo</span>
                      </div>
                    )}
                  </div>

                  {/* Input file */}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        dark:file:bg-blue-900 dark:file:text-blue-300
                        dark:hover:file:bg-blue-800"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG, GIF jusqu'à 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Marque */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Marque *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${errors.brand ? 'border-red-300' : 'border-gray-300'} dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Ex: Peugeot"
                  />
                  {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
                </div>

                {/* Modèle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Modèle *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${errors.model ? 'border-red-300' : 'border-gray-300'} dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Ex: 208"
                  />
                  {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
                </div>

                {/* Année */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Année *
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className={`w-full rounded-md border ${errors.year ? 'border-red-300' : 'border-gray-300'} dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
                </div>

                {/* Matriculation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Matriculation *
                  </label>
                  <input
                    type="text"
                    name="license_plate"
                    value={formData.license_plate}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${errors.license_plate ? 'border-red-300' : 'border-gray-300'} dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Ex: 123 TUN 456"
                    disabled={!!vehicle} // Désactiver en mode édition
                  />
                  {errors.license_plate && <p className="text-red-500 text-xs mt-1">{errors.license_plate}</p>}
                </div>

                {/* Type de véhicule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type de véhicule *
                  </label>
                  <select
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(VEHICLE_TYPES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Couleur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Couleur *
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${errors.color ? 'border-red-300' : 'border-gray-300'} dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Ex: Blanc"
                  />
                  {errors.color && <p className="text-red-500 text-xs mt-1">{errors.color}</p>}
                </div>

                {/* Kilométrage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kilométrage actuel
                  </label>
                  <input
                    type="number"
                    name="current_mileage"
                    value={formData.current_mileage}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Statut
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(VEHICLE_STATUS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date visite technique */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date visite technique *
                  </label>
                  <input
                    type="date"
                    name="technical_inspection_date"
                    value={formData.technical_inspection_date}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${errors.technical_inspection_date ? 'border-red-300' : 'border-gray-300'} dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.technical_inspection_date && <p className="text-red-500 text-xs mt-1">{errors.technical_inspection_date}</p>}
                </div>

                {/* Date expiration assurance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date expiration assurance *
                  </label>
                  <input
                    type="date"
                    name="insurance_expiry_date"
                    value={formData.insurance_expiry_date}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${errors.insurance_expiry_date ? 'border-red-300' : 'border-gray-300'} dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.insurance_expiry_date && <p className="text-red-500 text-xs mt-1">{errors.insurance_expiry_date}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Numéro moteur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Numéro moteur
                  </label>
                  <input
                    type="text"
                    name="engine_number"
                    value={formData.engine_number}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optionnel"
                  />
                </div>

                {/* Numéro châssis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Numéro châssis
                  </label>
                  <input
                    type="text"
                    name="chassis_number"
                    value={formData.chassis_number}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optionnel"
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'En cours...' : (vehicle ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VehicleModal;
