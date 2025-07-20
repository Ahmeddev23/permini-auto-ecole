import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../contexts/AuthContext';

interface Exam {
  id: number;
  exam_type: string;
  exam_date: string;
  result: string;
  score?: number;
  attempt_number: number;
  exam_location?: string;
  instructor_name?: string;
  notes?: string;
}

const StudentExamsPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Détecter si c'est l'étudiant qui consulte ses propres examens
  const isOwnExams = user?.user_type === 'student' && user?.student_profile?.id === parseInt(studentId || '0');

  useEffect(() => {
    if (studentId) {
      fetchExams();
    }
  }, [studentId]);

  const fetchExams = async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      const data = await dashboardService.getStudentExams(parseInt(studentId));
      setExams(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des examens:', error);
      toast.error('Erreur lors du chargement des examens');
    } finally {
      setLoading(false);
    }
  };

  const getExamTypeLabel = (type: string) => {
    switch (type) {
      case 'theory': return 'Code de la route';
      case 'practical_circuit': return 'Conduite - Circuit';
      case 'practical_park': return 'Conduite - Parking';
      default: return type;
    }
  };

  const getResultLabel = (result: string) => {
    switch (result) {
      case 'passed': return 'Réussi';
      case 'failed': return 'Échoué';
      case 'pending': return 'En attente';
      default: return result;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'passed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'failed': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'pending': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'passed': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending': return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mes Examens
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Consultez l'historique de vos examens et résultats
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{exams.length}</span> examen(s) au total
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{exams.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Réussis</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {exams.filter(e => e.result === 'passed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Échoués</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {exams.filter(e => e.result === 'failed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En attente</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {exams.filter(e => e.result === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des examens */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Historique des examens
          </h2>
        </div>
        
        {exams.length === 0 ? (
          <div className="p-8 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun examen</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Vous n'avez pas encore d'examens programmés.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                onClick={() => setSelectedExam(exam)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getResultIcon(exam.result)}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {getExamTypeLabel(exam.exam_type)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(exam.exam_date)}
                      </p>
                      {exam.exam_location && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          📍 {exam.exam_location}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultColor(exam.result)}`}>
                      {getResultLabel(exam.result)}
                    </span>
                    
                    {exam.score !== undefined && exam.score !== null && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {exam.score}/20
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Tentative #{exam.attempt_number}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de détails de l'examen */}
      {selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Détails de l'examen
              </h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type d'examen</label>
                <p className="text-gray-900 dark:text-white">{getExamTypeLabel(selectedExam.exam_type)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date et heure</label>
                <p className="text-gray-900 dark:text-white">{formatDate(selectedExam.exam_date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Résultat</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultColor(selectedExam.result)}`}>
                  {getResultLabel(selectedExam.result)}
                </span>
              </div>
              {selectedExam.score !== undefined && selectedExam.score !== null && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Score</label>
                  <p className="text-gray-900 dark:text-white">{selectedExam.score}/20</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de tentative</label>
                <p className="text-gray-900 dark:text-white">#{selectedExam.attempt_number}</p>
              </div>
              {selectedExam.exam_location && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lieu</label>
                  <p className="text-gray-900 dark:text-white">{selectedExam.exam_location}</p>
                </div>
              )}
              {selectedExam.instructor_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Moniteur</label>
                  <p className="text-gray-900 dark:text-white">{selectedExam.instructor_name}</p>
                </div>
              )}
              {selectedExam.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                  <p className="text-gray-900 dark:text-white">{selectedExam.notes}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setSelectedExam(null)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentExamsPage;
