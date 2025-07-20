import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  CalendarIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import dashboardService from '../../services/dashboardService';
import { Instructor, InstructorUpdate } from '../../types/instructor';
import { LICENSE_TYPES } from '../../types/instructor';

const InstructorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [editData, setEditData] = useState<InstructorUpdate>({});

  // Détecter si c'est le propre profil du moniteur
  const isOwnProfile = user?.user_type === 'instructor' &&
                      user?.instructor_profile?.id?.toString() === id;

  useEffect(() => {
    if (!id || isNaN(parseInt(id))) {
      console.error('❌ ID de moniteur invalide:', id);
      toast.error('ID de moniteur invalide');
      navigate('/dashboard/instructors');
      return;
    }
    fetchInstructor();
  }, [id, navigate]);

  const fetchInstructor = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getInstructor(parseInt(id!));
      setInstructor(data);
      setEditData({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        license_types: data.license_types,
        salary: data.salary,
        is_active: data.is_active,
      });
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement du moniteur');
      navigate('/dashboard/instructors');
    } finally {
      setLoading(false);
    }
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

  const handleLicenseTypeChange = (licenseType: string) => {
    const currentTypes = editData.license_types?.split(',').map(t => t.trim()) || [];
    const newTypes = currentTypes.includes(licenseType)
      ? currentTypes.filter(type => type !== licenseType)
      : [...currentTypes, licenseType];
    
    setEditData(prev => ({
      ...prev,
      license_types: newTypes.join(', ')
    }));
  };

  const handleSave = async () => {
    if (!instructor) return;

    setSaving(true);
    try {
      // Upload photo if selected
      if (selectedPhoto) {
        const photoFormData = new FormData();
        photoFormData.append('photo', selectedPhoto);
        await dashboardService.updateInstructorPhoto(instructor.id, photoFormData);
      }

      // Update other data (excluding protected fields)
      const updateData: Partial<InstructorUpdate> = {};
      
      if (editData.first_name !== instructor.first_name) updateData.first_name = editData.first_name;
      if (editData.last_name !== instructor.last_name) updateData.last_name = editData.last_name;
      if (editData.phone !== instructor.phone) updateData.phone = editData.phone;
      if (editData.license_types !== instructor.license_types) updateData.license_types = editData.license_types;
      if (editData.salary !== instructor.salary) updateData.salary = editData.salary;
      if (editData.is_active !== instructor.is_active) updateData.is_active = editData.is_active;

      if (Object.keys(updateData).length > 0) {
        await dashboardService.updateInstructor(instructor.id, updateData);
      }

      toast.success('Moniteur modifié avec succès');
      setEditing(false);
      setSelectedPhoto(null);
      setPhotoPreview(null);
      await fetchInstructor(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!instructor) return;
    
    setEditData({
      first_name: instructor.first_name,
      last_name: instructor.last_name,
      phone: instructor.phone,
      license_types: instructor.license_types,
      salary: instructor.salary,
      is_active: instructor.is_active,
    });
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setEditing(false);
  };

  const getLicenseTypesBadges = (licenseTypes: string) => {
    if (!licenseTypes) return null;
    
    const types = licenseTypes.split(',');
    return types.map((type, index) => (
      <span
        key={index}
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-1 mb-1"
      >
        Permis {type.trim()}
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Moniteur non trouvé
        </h3>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {!isOwnProfile && (
          <button
            onClick={() => navigate('/dashboard/instructors')}
            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour aux moniteurs
          </button>
        )}
        
        <div className="flex space-x-3">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Modifier
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
      >
        {/* Cover and Profile Photo */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="relative px-6 pb-6">
          <div className="flex items-end -mt-16 mb-6">
            <div className="relative">
              {photoPreview || instructor.photo ? (
                <img
                  src={photoPreview || instructor.photo}
                  alt={instructor.full_name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border-4 border-white dark:border-gray-800">
                  <UserIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
              
              {editing && (
                <div className="absolute bottom-0 right-0">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </label>
                </div>
              )}
            </div>
            
            <div className="ml-6 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {instructor.full_name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Moniteur d'auto-école
                  </p>
                </div>
                
                <div className="flex items-center">
                  {instructor.is_active ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Inactif
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Information Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
        >
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Informations personnelles
          </h2>

          <div className="space-y-4">
            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prénom
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editData.first_name || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900 dark:text-white">{instructor.first_name}</span>
                </div>
              )}
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editData.last_name || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900 dark:text-white">{instructor.last_name}</span>
                </div>
              )}
            </div>

            {/* Email (non modifiable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900 dark:text-white">{instructor.email}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(non modifiable)</span>
              </div>
            </div>

            {/* CIN (non modifiable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CIN
              </label>
              <div className="flex items-center">
                <IdentificationIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900 dark:text-white">{instructor.cin}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(non modifiable)</span>
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Téléphone
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={editData.phone || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900 dark:text-white">{instructor.phone}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Informations professionnelles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
        >
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Informations professionnelles
          </h2>

          <div className="space-y-4">
            {/* Types de permis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Types de permis
              </label>
              {editing ? (
                <div className="grid grid-cols-2 gap-2">
                  {LICENSE_TYPES.map((license) => (
                    <label
                      key={license.value}
                      className="flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={editData.license_types?.includes(license.value) || false}
                        onChange={() => handleLicenseTypeChange(license.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {license.label}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {getLicenseTypesBadges(instructor.license_types)}
                </div>
              )}
            </div>

            {/* Date d'embauche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date d'embauche
              </label>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900 dark:text-white">
                  {new Date(instructor.hire_date).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            {/* Salaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salaire
              </label>
              {editing ? (
                <input
                  type="number"
                  value={editData.salary || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, salary: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <div className="flex items-center">
                  <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900 dark:text-white">
                    {instructor.salary ? `${instructor.salary} DT` : 'Non défini'}
                  </span>
                </div>
              )}
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut
              </label>
              {editing ? (
                <select
                  value={editData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setEditData(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              ) : (
                <div className="flex items-center">
                  {instructor.is_active ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="text-gray-900 dark:text-white">
                    {instructor.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InstructorProfilePage;
