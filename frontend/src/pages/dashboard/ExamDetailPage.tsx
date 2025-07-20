import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PencilIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { dashboardService } from '../../services/dashboardService';

interface ExamDetail {
  id: number;
  exam_type: string;
  exam_date: string;
  student_name: string;
  instructor_name?: string;
  result: string;
  score?: number;
  max_score?: number;
  exam_location?: string;
  examiner_notes?: string;
  attempt_number: number;
  is_paid: boolean;
  exam_fee?: number;
  registration_number?: string;
  created_at: string;
  updated_at: string;
}

const ExamDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    result: '',
    score: '',
    max_score: '',
    examiner_notes: '',
    exam_location: '',
    attempt_number: ''
  });

  const EXAM_TYPES = {
    'theory': 'Code de la route',
    'practical_circuit': 'Circuit',
    'practical_park': 'Parking'
  };

  const EXAM_RESULTS = {
    'pending': 'En attente',
    'passed': 'Réussi',
    'failed': 'Échoué',
    'absent': 'Absent'
  };

  const getResultColor = (result: string) => {
    const colors = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'passed': 'text-green-600 bg-green-100',
      'failed': 'text-red-600 bg-red-100',
      'absent': 'text-gray-600 bg-gray-100'
    };
    return colors[result as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'passed':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  useEffect(() => {
    if (!examId || isNaN(parseInt(examId))) {
      console.error('❌ ID d\'examen invalide:', examId);
      toast.error('ID d\'examen invalide');
      navigate('/dashboard/exams');
      return;
    }
    fetchExamDetail();
  }, [examId, navigate]);

  const fetchExamDetail = async () => {
    try {
      setLoading(true);


      if (!examId || isNaN(parseInt(examId))) {
        throw new Error('ID d\'examen invalide');
      }

      const data = await dashboardService.getExam(parseInt(examId));


      setExam(data);
      setEditData({
        result: data.result || '',
        score: data.score?.toString() || '',
        max_score: data.max_score?.toString() || '',
        examiner_notes: data.examiner_notes || '',
        exam_location: data.exam_location || '',
        attempt_number: data.attempt_number?.toString() || '1'
      });
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement de l\'examen:', error);
      console.error('❌ Détails de l\'erreur:', error.response?.data);
      toast.error('Erreur lors du chargement de l\'examen');
      navigate('/dashboard/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!exam) return;

    try {
      // Utiliser les vrais noms des champs du modèle Exam
      const updateData = {
        result: editData.result,
        score: editData.score ? parseInt(editData.score) : null,
        max_score: editData.max_score ? parseInt(editData.max_score) : null,
        examiner_notes: editData.examiner_notes || null,  // vrai nom du champ
        exam_location: editData.exam_location || null,    // vrai nom du champ
        attempt_number: editData.attempt_number ? parseInt(editData.attempt_number) : 1
      };



      await dashboardService.updateExam(exam.id, updateData);
      toast.success('Examen mis à jour avec succès');
      setIsEditing(false);
      fetchExamDetail();
    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'examen');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (exam) {
      setEditData({
        result: exam.result || '',
        score: exam.score?.toString() || '',
        max_score: exam.max_score?.toString() || '',
        examiner_notes: exam.examiner_notes || '',
        exam_location: exam.exam_location || '',
        attempt_number: exam.attempt_number?.toString() || '1'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Examen non trouvé</h3>
        <button
          onClick={() => navigate('/dashboard/exams')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Retour aux examens
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard/exams')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Retour aux examens
          </button>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <PencilIcon className="h-5 w-5" />
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Détails de l'examen
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {exam.student_name} - {EXAM_TYPES[exam.exam_type as keyof typeof EXAM_TYPES]}
        </p>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations de base */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <AcademicCapIcon className="h-5 w-5 mr-2" />
            Informations de base
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Candidat:</span>
              <span className="font-medium text-gray-900 dark:text-white">{exam.student_name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Type d'examen:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {EXAM_TYPES[exam.exam_type as keyof typeof EXAM_TYPES]}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Date et heure:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(exam.exam_date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Tentative n°:</span>
              {!isEditing ? (
                <span className="font-medium text-gray-900 dark:text-white">{exam.attempt_number}</span>
              ) : (
                <input
                  type="number"
                  min="1"
                  value={editData.attempt_number}
                  onChange={(e) => setEditData({ ...editData, attempt_number: e.target.value })}
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-center"
                />
              )}
            </div>
            
            {exam.instructor_name && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Moniteur:</span>
                <span className="font-medium text-gray-900 dark:text-white">{exam.instructor_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Résultats */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Résultats
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Statut:</span>
              {!isEditing ? (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultColor(exam.result)}`}>
                  {getResultIcon(exam.result)}
                  {EXAM_RESULTS[exam.result as keyof typeof EXAM_RESULTS]}
                </span>
              ) : (
                <select
                  value={editData.result}
                  onChange={(e) => setEditData({ ...editData, result: e.target.value })}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  {Object.entries(EXAM_RESULTS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Score:</span>
              {!isEditing ? (
                <span className="font-medium text-gray-900 dark:text-white">
                  {exam.score && exam.max_score ? (
                    <>
                      {exam.score}/{exam.max_score}
                      <span className="text-gray-500 ml-1">
                        ({((exam.score / exam.max_score) * 100).toFixed(1)}%)
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </span>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={editData.score}
                    onChange={(e) => setEditData({ ...editData, score: e.target.value })}
                    placeholder="Score"
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  <span className="self-center">/</span>
                  <input
                    type="number"
                    value={editData.max_score}
                    onChange={(e) => setEditData({ ...editData, max_score: e.target.value })}
                    placeholder="Max"
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lieu et Notes */}
      <div className="grid grid-cols-1 gap-6">
        {/* Lieu d'examen */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2" />
            Lieu d'examen
          </h3>

          {!isEditing ? (
            <p className="text-gray-900 dark:text-white">
              {exam.exam_location || <span className="text-gray-400">Non spécifié</span>}
            </p>
          ) : (
            <input
              type="text"
              value={editData.exam_location}
              onChange={(e) => setEditData({ ...editData, exam_location: e.target.value })}
              placeholder="Ex: Centre d'examen de Tunis"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          )}
        </div>

        {/* Notes de l'examinateur */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Notes de l'examinateur
          </h3>

          {!isEditing ? (
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {exam.examiner_notes || <span className="text-gray-400">Aucune note</span>}
            </p>
          ) : (
            <textarea
              value={editData.examiner_notes}
              onChange={(e) => setEditData({ ...editData, examiner_notes: e.target.value })}
              rows={4}
              placeholder="Notes ou commentaires sur l'examen..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          )}
        </div>

        {/* Informations système */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Informations système
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">Créé le:</span> {new Date(exam.created_at).toLocaleDateString('fr-FR')}
            </div>
            <div>
              <span className="font-medium">Modifié le:</span> {new Date(exam.updated_at).toLocaleDateString('fr-FR')}
            </div>
            {exam.registration_number && (
              <div>
                <span className="font-medium">N° d'inscription:</span> {exam.registration_number}
              </div>
            )}
            {exam.exam_fee && (
              <div>
                <span className="font-medium">Frais:</span> {exam.exam_fee} DT
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailPage;
