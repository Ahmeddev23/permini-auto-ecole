import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  MapPinIcon,
  PaintBrushIcon,
  PhotoIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Card } from '../../components/common/Card';
import { dashboardService } from '../../services/dashboardService';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DrivingSchoolData {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null;
  theme_color: string;
  owner_name: string;
}

const THEME_COLORS = [
  { name: 'Bleu', value: '#3B82F6', class: 'bg-blue-500' },
  { name: 'Vert', value: '#10B981', class: 'bg-green-500' },
  { name: 'Violet', value: '#8B5CF6', class: 'bg-purple-500' },
  { name: 'Rouge', value: '#EF4444', class: 'bg-red-500' },
  { name: 'Orange', value: '#F59E0B', class: 'bg-yellow-500' },
  { name: 'Rose', value: '#EC4899', class: 'bg-pink-500' },
  { name: 'Indigo', value: '#6366F1', class: 'bg-indigo-500' },
  { name: 'Teal', value: '#14B8A6', class: 'bg-teal-500' },
];

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DrivingSchoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{
    logo?: File;
  }>({});

  const { theme, toggleTheme } = useTheme();

  // Si l'utilisateur est un moniteur, rediriger vers sa page de profil
  React.useEffect(() => {
    if (user?.user_type === 'instructor' && user?.instructor_profile?.id) {
      navigate(`/dashboard/instructors/${user.instructor_profile.id}`, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // Ne charger les données que si ce n'est pas un moniteur
    if (user?.user_type !== 'instructor') {
      fetchDrivingSchoolData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDrivingSchoolData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDrivingSchoolProfile();

      setData(response);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DrivingSchoolData, value: any) => {
    if (data) {
      setData({ ...data, [field]: value });
    }
  };

  const handleFileChange = (type: 'logo', file: File | null) => {
    if (file) {
      setSelectedFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleSave = async () => {
    if (!data) return;

    try {
      setSaving(true);

      // Test avec des données simples d'abord
      const testData = {
        name: data.name,
        address: data.address,
        phone: data.phone,
        theme_color: data.theme_color
      };



      // Créer FormData pour les fichiers
      const formData = new FormData();

      // Ajouter les données de base
      formData.append('name', data.name);
      formData.append('address', data.address);
      formData.append('phone', data.phone);
      formData.append('theme_color', data.theme_color);

      // Ajouter les fichiers s'ils sont sélectionnés
      if (selectedFiles.logo) {
        formData.append('logo', selectedFiles.logo);
      }



      await dashboardService.updateDrivingSchoolProfile(formData);
      toast.success('Paramètres mis à jour avec succès');

      // Recharger les données
      await fetchDrivingSchoolData();
      setSelectedFiles({});

    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      toast.error(`Erreur lors de la sauvegarde: ${error.response?.data?.error || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Si c'est un moniteur, afficher un loading pendant la redirection
  if (user?.user_type === 'instructor') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirection vers votre profil...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Erreur lors du chargement des données</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Paramètres
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Personnalisez les paramètres de votre auto-école
        </p>
      </div>

      {/* Informations de base */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <BuildingOfficeIcon className="h-6 w-6 mr-2" />
              Informations de base
            </h2>
            
            <div className="space-y-6">
              {/* Propriétaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Propriétaire :
                </label>
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{data.email} (Auto-école)</span>
                </div>
              </div>

              {/* Nom de l'auto-école */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom de l'auto-école :
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo :
                </label>
                <div className="flex items-center space-x-4">
                  {data.logo && (
                    <img
                      src={`http://127.0.0.1:8000${data.logo}`}
                      alt="Logo actuel"
                      className="h-16 w-16 object-cover rounded-lg border"
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('logo', e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {selectedFiles.logo && (
                      <p className="text-sm text-green-600 mt-1">Nouveau fichier sélectionné: {selectedFiles.logo.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <PhoneIcon className="h-6 w-6 mr-2" />
              Contact
            </h2>

            <div className="space-y-6">
              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse :
                </label>
                <div className="flex items-start space-x-2">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <textarea
                    value={data.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone :
                </label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Email (non modifiable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Courriel :
                </label>
                <input
                  type="email"
                  value={data.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  L'email ne peut pas être modifié
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>



      {/* Personnalisation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <PaintBrushIcon className="h-6 w-6 mr-2" />
              Personnalisation
            </h2>

            <div className="space-y-6">
              {/* Couleur du thème */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Couleur du thème :
                </label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleInputChange('theme_color', color.value)}
                      className={`relative w-12 h-12 rounded-lg ${color.class} hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      title={color.name}
                    >
                      {data.theme_color === color.value && (
                        <CheckIcon className="absolute inset-0 m-auto h-6 w-6 text-white" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Couleur actuelle: {THEME_COLORS.find(c => c.value === data.theme_color)?.name || 'Personnalisée'}
                </p>
              </div>


            </div>
          </div>
        </Card>
      </motion.div>

      {/* Bouton de sauvegarde */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end"
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            saving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          } text-white`}
        >
          {saving ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sauvegarde...</span>
            </div>
          ) : (
            'Sauvegarder les modifications'
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
