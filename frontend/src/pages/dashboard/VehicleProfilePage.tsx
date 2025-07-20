import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, PencilIcon, CameraIcon } from '@heroicons/react/24/outline';
import { dashboardService } from '../../services/dashboardService';
import { Vehicle, VehicleFormData } from '../../types/vehicle';
import { InstructorList } from '../../types/instructor';

const VehicleProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [instructors, setInstructors] = useState<InstructorList[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<VehicleFormData>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    vehicle_type: 'A',
    color: '',
    status: 'active',
    assigned_instructor: null,
    notes: ''
  });

  useEffect(() => {
    if (!id || isNaN(parseInt(id))) {
      console.error('❌ ID de véhicule invalide:', id);
      toast.error('ID de véhicule invalide');
      navigate('/dashboard/vehicles');
      return;
    }
    fetchVehicleData();
    fetchInstructors();
  }, [id, navigate]);

  const fetchVehicleData = async () => {
    try {
      const vehicleData = await dashboardService.getVehicle(parseInt(id!));
      setVehicle(vehicleData);
      setFormData({
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        license_plate: vehicleData.license_plate,
        vehicle_type: vehicleData.vehicle_type,
        color: vehicleData.color,
        status: vehicleData.status,
        assigned_instructor: vehicleData.assigned_instructor,
        notes: vehicleData.notes || ''
      });
      if (vehicleData.photo) {
        setPhotoPreview(vehicleData.photo);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement du véhicule');
      navigate('/dashboard/vehicles');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const instructorsData = await dashboardService.getInstructors();
      setInstructors(instructorsData);
    } catch (error: any) {
      console.error('Erreur lors du chargement des moniteurs:', error);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La photo ne doit pas dépasser 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image valide');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Mettre à jour les données du véhicule
      const updatedVehicle = await dashboardService.updateVehicle(parseInt(id!), formData);
      
      // Uploader la photo si elle a été modifiée
      if (photoFile) {
        await dashboardService.uploadVehiclePhoto(parseInt(id!), photoFile);
      }

      setVehicle(updatedVehicle);
      setIsEditing(false);
      setPhotoFile(null);
      toast.success('Véhicule modifié avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (vehicle) {
      setFormData({
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        license_plate: vehicle.license_plate,
        vehicle_type: vehicle.vehicle_type,
        color: vehicle.color,
        status: vehicle.status,
        assigned_instructor: vehicle.assigned_instructor,
        notes: vehicle.notes || ''
      });
      setPhotoFile(null);
      setPhotoPreview(vehicle.photo || null);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Véhicule non trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/vehicles')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Retour aux véhicules
          </button>
        </div>
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Modifier
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="px-6 py-8 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Véhicule"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )}
              </div>
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors">
                  <CameraIcon className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-blue-100 mt-1">
                {vehicle.license_plate} • {vehicle.year}
              </p>
              <div className="flex items-center mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  vehicle.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : vehicle.status === 'inactive'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {vehicle.status === 'active' ? 'Actif' :
                   vehicle.status === 'inactive' ? 'Inactif' :
                   'En maintenance'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="px-6 py-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Modification de Véhicule {vehicle.brand} {vehicle.model}
          </h2>
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Informations du véhicule
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Marque */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Marque *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white py-2">{vehicle.brand}</p>
                  )}
                </div>

                {/* Modèle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Modèle *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white py-2">{vehicle.model}</p>
                  )}
                </div>

                {/* Année */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Année *
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white py-2">{vehicle.year}</p>
                  )}
                </div>

                {/* Plaque d'immatriculation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plaque d'immatriculation *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.license_plate}
                      onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white py-2 font-mono">{vehicle.license_plate}</p>
                  )}
                </div>

                {/* Type de véhicule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type de véhicule *
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.vehicle_type}
                      onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value as any })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="A">Moto</option>
                      <option value="B">Voiture</option>
                      <option value="C">Camion</option>
                      <option value="D">Bus</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-white py-2">
                      {vehicle.vehicle_type === 'A' ? 'Moto' :
                       vehicle.vehicle_type === 'B' ? 'Voiture' :
                       vehicle.vehicle_type === 'C' ? 'Camion' : 'Bus'}
                    </p>
                  )}
                </div>

                {/* Couleur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Couleur *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white py-2">{vehicle.color}</p>
                  )}
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut *
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="active">Actif</option>
                      <option value="maintenance">En maintenance</option>
                      <option value="inactive">Inactif</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-white py-2">
                      {vehicle.status === 'active' ? 'Actif' :
                       vehicle.status === 'inactive' ? 'Inactif' :
                       'En maintenance'}
                    </p>
                  )}
                </div>

                {/* Moniteur assigné */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Moniteur assigné
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.assigned_instructor || ''}
                      onChange={(e) => setFormData({ ...formData, assigned_instructor: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Aucun moniteur assigné</option>
                      {instructors.map((instructor) => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.full_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-white py-2">
                      {vehicle.assigned_instructor_name || 'Aucun moniteur assigné'}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Notes optionnelles sur le véhicule..."
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">
                    {vehicle.notes || 'Aucune note'}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleProfilePage;
