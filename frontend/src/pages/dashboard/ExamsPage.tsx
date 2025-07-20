import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { dashboardService } from '../../services/dashboardService';
import { useModal } from '../../contexts/ModalContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface Exam {
  id: number;
  exam_type: string;
  exam_date: string;
  student_name: string;
  result: string;
  score?: number;
  max_score?: number;
  exam_location?: string;
  examiner_notes?: string;
  attempt_number: number;
  is_paid: boolean;
  exam_fee?: number;
  created_at: string;
}

interface ExamStats {
  total_exams: number;
  passed_exams: number;
  failed_exams: number;
  pending_exams: number;
  success_rate: number;
  average_score: number;
  exams_this_month: number;
  upcoming_exams: number;
}

const ExamsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isExamModalOpen, closeExamModal } = useModal();
  const { t } = useLanguage();
  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState<ExamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    student: '',
    instructor: '',
    exam_type: 'theory',
    exam_date: '',
    exam_location: '',
    examiner_notes: '',
    exam_fee: '',
    registration_number: ''
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
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    fetchExams();
    fetchExamStats();
    fetchStudents();
    fetchInstructors();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getExams();


      // Vérifier si data est un tableau, sinon utiliser un tableau vide
      if (Array.isArray(data)) {
        setExams(data);
      } else if (data && Array.isArray(data.results)) {
        // Si c'est une réponse paginée
        setExams(data.results);
      } else {
        console.warn('⚠️ Format de données inattendu:', data);
        setExams([]);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des examens:', error);
      toast.error('Erreur lors du chargement des examens');
      setExams([]); // S'assurer qu'on a un tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const fetchExamStats = async () => {
    try {
      const data = await dashboardService.getExamStats();
      setStats(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await dashboardService.getStudents();


      let studentsArray = [];
      if (Array.isArray(data)) {
        studentsArray = data;
      } else if (data && Array.isArray(data.results)) {
        studentsArray = data.results;
      } else if (data && data.students) {
        studentsArray = data.students;
      }


      setStudents(studentsArray);
    } catch (error: any) {
      console.error('Erreur lors du chargement des étudiants:', error);
      setStudents([]);
    }
  };

  const fetchInstructors = async () => {
    try {
      const data = await dashboardService.getInstructorsForSchedule();
      setInstructors(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des instructeurs:', error);
    }
  };

  const createExam = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Selon le backend, seuls ces champs sont acceptés pour la création
      const examData = {
        student: parseInt(formData.student),
        exam_type: formData.exam_type,
        exam_date: formData.exam_date,
        exam_location: formData.exam_location || null,
        examiner_notes: formData.examiner_notes || null
      };



      await dashboardService.createExam(examData);
      toast.success('Examen créé avec succès');
      setShowCreateModal(false);
      closeExamModal();
      resetForm();
      fetchExams();
      fetchExamStats();
    } catch (error: any) {
      console.error('❌ Erreur lors de la création de l\'examen:', error);
      console.error('❌ Réponse du serveur:', error.response?.data);
      toast.error(error.message || 'Erreur lors de la création de l\'examen');
    }
  };

  const resetForm = () => {
    setFormData({
      student: '',
      instructor: '',
      exam_type: 'theory',
      exam_date: '',
      exam_location: '',
      examiner_notes: '',
      exam_fee: '',
      registration_number: ''
    });
  };

  const deleteExam = async (examId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
      return;
    }

    try {
      await dashboardService.deleteExam(examId);
      toast.success('Examen supprimé avec succès');
      fetchExams();
      fetchExamStats();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression de l\'examen');
    }
  };

  const filteredExams = Array.isArray(exams) ? exams.filter(exam => {
    const matchesSearch = exam.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         EXAM_TYPES[exam.exam_type as keyof typeof EXAM_TYPES]?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || exam.exam_type === filterType;
    const matchesResult = !filterResult || exam.result === filterResult;

    return matchesSearch && matchesType && matchesResult;
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Examens
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestion des examens et résultats
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Nouvel examen
        </button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total examens</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total_exams}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Taux de réussite</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.success_rate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">En attente</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pending_exams}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">À venir (7j)</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.upcoming_exams}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un candidat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tous les types</option>
            {Object.entries(EXAM_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tous les résultats</option>
            {Object.entries(EXAM_RESULTS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FunnelIcon className="h-4 w-4 mr-2" />
            {filteredExams.length} résultat(s)
          </div>
        </div>
      </div>

      {/* Tableau des examens */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Liste des examens
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Candidat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type d'examen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Résultat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tentative
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredExams.map((exam) => (
                <motion.tr
                  key={exam.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {exam.student_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {EXAM_TYPES[exam.exam_type as keyof typeof EXAM_TYPES]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(exam.exam_date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultColor(exam.result)}`}>
                      {getResultIcon(exam.result)}
                      {EXAM_RESULTS[exam.result as keyof typeof EXAM_RESULTS]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {exam.score && exam.max_score ? (
                        <span>
                          {exam.score}/{exam.max_score}
                          <span className="text-gray-500 ml-1">
                            ({((exam.score / exam.max_score) * 100).toFixed(1)}%)
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {exam.attempt_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/exams/${exam.id}`)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Voir les détails"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => deleteExam(exam.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredExams.length === 0 && (
            <div className="text-center py-12">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun examen</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Commencez par créer un nouvel examen.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de création d'examen */}
      {(showCreateModal || isExamModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Nouvel examen
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  closeExamModal();
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={createExam} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Candidat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Candidat *
                  </label>
                  <select
                    value={formData.student}
                    onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Sélectionner un candidat ({students.length} disponible{students.length > 1 ? 's' : ''})</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || `Candidat ${student.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type d'examen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type d'examen *
                  </label>
                  <select
                    value={formData.exam_type}
                    onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {Object.entries(EXAM_TYPES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Date et heure */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date et heure *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.exam_date}
                    onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Note: Le moniteur superviseur sera ajouté plus tard via une mise à jour */}
                <div className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  ℹ️ Le moniteur superviseur et les frais peuvent être ajoutés après la création de l'examen.
                </div>

                {/* Lieu d'examen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lieu d'examen
                  </label>
                  <input
                    type="text"
                    value={formData.exam_location}
                    onChange={(e) => setFormData({ ...formData, exam_location: e.target.value })}
                    placeholder="Ex: Centre d'examen de Tunis"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

              </div>

              {/* Notes de l'examinateur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes de l'examinateur
                </label>
                <textarea
                  value={formData.examiner_notes}
                  onChange={(e) => setFormData({ ...formData, examiner_notes: e.target.value })}
                  rows={3}
                  placeholder="Notes ou commentaires sur l'examen..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Boutons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    closeExamModal();
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Créer l'examen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsPage;
