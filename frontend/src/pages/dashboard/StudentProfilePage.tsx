import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  UserIcon,
  AcademicCapIcon,
  CreditCardIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { dashboardService, Student } from '../../services/dashboardService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Détecter si c'est l'étudiant qui consulte son propre profil
  const isOwnProfile = user?.user_type === 'student' && user?.student_profile?.id === parseInt(id || '0');
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  const [historyData, setHistoryData] = useState<{
    payments: any[];
    exams: any[];
    sessions: any[];
  }>({ payments: [], exams: [], sessions: [] });

  useEffect(() => {
    if (!id || isNaN(parseInt(id))) {
      console.error('❌ ID de candidat invalide:', id);
      toast.error('ID de candidat invalide');
      navigate('/dashboard/students');
      return;
    }
    fetchStudent(parseInt(id));
  }, [id, navigate]);

  const fetchStudent = async (studentId: number) => {
    try {
      const data = await dashboardService.getStudent(studentId);
      setStudent(data);
      setFormData(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement du candidat');
      navigate('/dashboard/students');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (studentId: number) => {
    try {


      // Récupérer les paiements
      const payments = await dashboardService.getStudentPayments(studentId);

      // Récupérer les examens
      const exams = await dashboardService.getStudentExams(studentId);

      // Récupérer les séances terminées
      const sessions = await dashboardService.getStudentSessions(studentId);

      setHistoryData({ payments, exams, sessions });

    } catch (error: any) {
      console.error('❌ Erreur lors du chargement de l\'historique:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    }
  };

  const handleSave = async () => {
    if (!student || !id) return;

    try {
      // Préparer les données de base (sans la photo)
      const { email, cin, user, driving_school_name, full_name, age, progress_percentage, photo, ...updateData } = formData;

      // Si une nouvelle photo a été sélectionnée, l'uploader d'abord
      if (selectedPhoto) {
        const photoFormData = new FormData();
        photoFormData.append('photo', selectedPhoto);

        // Uploader la photo séparément
        await dashboardService.updateStudentPhoto(parseInt(id), photoFormData);
      }

      // Mettre à jour les autres données
      await dashboardService.updateStudent(parseInt(id), updateData);

      // Recharger les données
      await fetchStudent(parseInt(id));
      setEditMode(false);
      setSelectedPhoto(null);
      setPhotoPreview(null);
      toast.success('Candidat modifié avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la modification');
    }
  };

  const handleCancel = () => {
    setFormData(student || {});
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setEditMode(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image');
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La taille de l\'image ne doit pas dépasser 5MB');
        return;
      }

      setSelectedPhoto(file);

      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'registered': { color: 'bg-gray-100 text-gray-800', label: 'Inscrit' },
      'theory_in_progress': { color: 'bg-blue-100 text-blue-800', label: 'Code en cours' },
      'theory_passed': { color: 'bg-green-100 text-green-800', label: 'Code réussi' },
      'practical_in_progress': { color: 'bg-yellow-100 text-yellow-800', label: 'Conduite en cours' },
      'practical_passed': { color: 'bg-emerald-100 text-emerald-800', label: 'Conduite réussie' },
      'completed': { color: 'bg-purple-100 text-purple-800', label: 'Terminé' },
      'suspended': { color: 'bg-red-100 text-red-800', label: 'Suspendu' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.registered;
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };



  const getLicenseTypeBadge = (type: string) => {
    const typeConfig = {
      'A': { color: 'bg-red-100 text-red-800', label: 'Permis A (Moto)' },
      'B': { color: 'bg-blue-100 text-blue-800', label: 'Permis B (Voiture)' },
      'C': { color: 'bg-green-100 text-green-800', label: 'Permis C (Camion)' },
      'D': { color: 'bg-purple-100 text-purple-800', label: 'Permis D (Bus)' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.B;
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Candidat non trouvé</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {user?.user_type !== 'instructor' && !isOwnProfile && (
            <button
              onClick={() => navigate('/dashboard/students')}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editMode
                ? (isOwnProfile ? 'Modification de mon profil' : 'Modification de Candidat')
                : (isOwnProfile ? 'Mon Profil' : 'Profil du Candidat')
              }
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{student.full_name}</p>
          </div>
        </div>
        
        {user?.user_type !== 'instructor' && (
          <div className="flex items-center space-x-3">
            {editMode ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Modifier</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Tabs - Masquer pour les moniteurs */}
      {user?.user_type !== 'instructor' && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Informations
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                if (id) fetchHistory(parseInt(id));
              }}
              className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Historique
            </button>
          </nav>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(activeTab === 'info' || user?.user_type === 'instructor') ? (
          // Contenu des informations (existant)
          <>
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <UserIcon className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informations personnelles</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Utilisateur
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {student.email} (Candidat)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Auto-école
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {student.driving_school_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prénom
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">{student.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">{student.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CIN
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{student.cin}</p>
                  {editMode && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ Non modifiable
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de naissance
                </label>
                {editMode ? (
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(student.date_of_birth).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Téléphone
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">{student.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Courriel
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                  {editMode && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ Non modifiable
                    </span>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adresse
                </label>
                {editMode ? (
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">{student.address}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Formation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <AcademicCapIcon className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Formation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type de permis
                </label>
                {editMode ? (
                  <select
                    name="license_type"
                    value={formData.license_type || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="A">Permis A (Moto)</option>
                    <option value="B">Permis B (Voiture)</option>
                    <option value="C">Permis C (Camion)</option>
                    <option value="D">Permis D (Bus)</option>
                  </select>
                ) : (
                  <div>{getLicenseTypeBadge(student.license_type)}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut de formation
                </label>
                {editMode ? (
                  <select
                    name="formation_status"
                    value={formData.formation_status || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="registered">Inscrit</option>
                    <option value="theory_in_progress">Code en cours</option>
                    <option value="theory_passed">Code réussi</option>
                    <option value="practical_in_progress">Conduite en cours</option>
                    <option value="practical_passed">Conduite réussie</option>
                    <option value="completed">Terminé</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                ) : (
                  <div>{getStatusBadge(student.formation_status)}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date d'inscription
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(student.registration_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Paiement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CreditCardIcon className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Paiements</h2>
              </div>
              <button
                onClick={() => navigate(`/dashboard/students/${id}/payments`)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <CreditCardIcon className="h-4 w-4" />
                Gérer les paiements
              </button>
            </div>

            {student && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Type de tarification</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {student.payment_type === 'fixed' ? 'Tarif fixe' :
                     student.payment_type === 'hourly' ? 'Par séance' : 'Non configuré'}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Montant payé</div>
                  <div className="text-lg font-semibold text-green-600">
                    {student.paid_amount ? `${parseFloat(student.paid_amount).toFixed(3)} DT` : '0.000 DT'}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {student.payment_type === 'hourly' ? 'Séances payées' : 'Progression'}
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {student.payment_type === 'hourly'
                      ? `${student.paid_sessions || 0} séances`
                      : student.total_amount
                        ? `${Math.min(((student.paid_amount || 0) / student.total_amount) * 100, 100).toFixed(1)}%`
                        : 'N/A'
                    }
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Séances et Progression */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Séances et Progression</h2>
              </div>
              <button
                onClick={() => navigate(`/dashboard/students/${id}/schedule`)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <CalendarIcon className="h-4 w-4" />
                Voir le planning
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Heures de code effectuées
                </label>
                {editMode ? (
                  <input
                    type="number"
                    name="theory_hours_completed"
                    value={formData.theory_hours_completed || 0}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-900 dark:text-white">{student.theory_hours_completed || 0} heures</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      (Basé sur les séances terminées)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Heures de conduite effectuées
                </label>
                {editMode ? (
                  <input
                    type="number"
                    name="practical_hours_completed"
                    value={formData.practical_hours_completed || 0}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-900 dark:text-white">{student.practical_hours_completed || 0} heures</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      (Basé sur les séances terminées)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tentatives examen code
                </label>
                {editMode ? (
                  <input
                    type="number"
                    name="theory_exam_attempts"
                    value={formData.theory_exam_attempts || 0}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">{student.theory_exam_attempts || 0}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tentatives examen conduite
                </label>
                {editMode ? (
                  <input
                    type="number"
                    name="practical_exam_attempts"
                    value={formData.practical_exam_attempts || 0}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">{student.practical_exam_attempts}</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Photo</h3>
            <div className="text-center">
              {photoPreview || student.photo ? (
                <img
                  src={photoPreview || student.photo}
                  alt={student.full_name}
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-4 border-gray-300 dark:border-gray-500">
                  <UserIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
              {editMode && (
                <div className="mt-4">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    {selectedPhoto ? 'Changer la photo' : 'Ajouter une photo'}
                  </label>
                  {selectedPhoto && (
                    <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                      ✓ Nouvelle photo sélectionnée
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statut</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Actif
                </label>
                {editMode ? (
                  <select
                    name="is_active"
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    {student.is_active ? (
                      <>
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">Actif</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">Inactif</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Formation
                </label>
                <div>{getStatusBadge(student.formation_status)}</div>
              </div>
            </div>
          </motion.div>
        </div>
        </>
        ) : (
          // Contenu de l'historique
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Historique des paiements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <CreditCardIcon className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Paiements</h3>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {historyData.payments.length > 0 ? (
                    historyData.payments.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.amount} DT
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(payment.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {payment.status === 'completed' ? 'Payé' : 'En attente'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucun paiement enregistré</p>
                  )}
                </div>
              </motion.div>

              {/* Historique des examens */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Examens</h3>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {historyData.exams.length > 0 ? (
                    historyData.exams.map((exam, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {exam.exam_type === 'theory' ? 'Code' : 'Conduite'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(exam.date).toLocaleDateString('fr-FR')} - Tentative {exam.attempt_number}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          exam.status === 'passed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : exam.status === 'failed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {exam.status === 'passed' ? 'Réussi' : exam.status === 'failed' ? 'Échoué' : 'En attente'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucun examen passé</p>
                  )}
                </div>
              </motion.div>

              {/* Historique des séances */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <CalendarIcon className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Séances terminées</h3>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {historyData.sessions.length > 0 ? (
                    historyData.sessions.filter(session => session.status === 'completed').map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {session.session_type === 'theory' ? 'Théorie' : 'Conduite'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(session.date).toLocaleDateString('fr-FR')} - {session.instructor_name || 'Auto-école'}
                          </p>
                          {session.vehicle && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {session.vehicle}
                            </p>
                          )}
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Terminée
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucune séance terminée</p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfilePage;
