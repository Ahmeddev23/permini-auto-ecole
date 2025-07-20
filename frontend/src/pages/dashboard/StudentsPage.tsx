import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CalendarIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import dashboardService, { Student } from '../../services/dashboardService';
import StudentModal from '../../components/dashboard/StudentModal';
import { useModal } from '../../contexts/ModalContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const StudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isStudentModalOpen, closeStudentModal } = useModal();
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [licenseFilter, setLicenseFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStudents();
      setStudents(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des candidats');
    } finally {
      setLoading(false);
    }
  };



  const handleStatusChange = async (studentId: number, newStatus: string) => {
    try {
      await dashboardService.updateStudent(studentId, { formation_status: newStatus });
      setStudents(prev => prev.map(student =>
        student.id === studentId
          ? { ...student, formation_status: newStatus as any }
          : student
      ));
      toast.success('Statut mis à jour avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const StatusDropdown: React.FC<{ student: Student }> = ({ student }) => {
    const statusOptions = [
      { value: 'registered', label: 'Inscrit', color: 'bg-gray-100 text-gray-800' },
      { value: 'theory_in_progress', label: 'Code en cours', color: 'bg-blue-100 text-blue-800' },
      { value: 'theory_passed', label: 'Code réussi', color: 'bg-green-100 text-green-800' },
      { value: 'practical_in_progress', label: 'Conduite en cours', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'practical_passed', label: 'Conduite réussie', color: 'bg-emerald-100 text-emerald-800' },
      { value: 'completed', label: 'Terminé', color: 'bg-purple-100 text-purple-800' },
      { value: 'suspended', label: 'Suspendu', color: 'bg-red-100 text-red-800' }
    ];

    const currentStatus = statusOptions.find(option => option.value === student.formation_status);

    return (
      <select
        value={student.formation_status}
        onChange={(e) => handleStatusChange(student.id, e.target.value)}
        className={`px-2 py-1 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${currentStatus?.color || 'bg-gray-100 text-gray-800'}`}
        style={{ appearance: 'none', backgroundImage: 'none' }}
      >
        {statusOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  const getLicenseTypeBadge = (type: string) => {
    const colors = {
      'A': 'bg-red-100 text-red-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-green-100 text-green-800',
      'D': 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type as keyof typeof colors] || colors.B}`}>
        Permis {type}
      </span>
    );
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.cin?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.formation_status === statusFilter;
    const matchesLicense = licenseFilter === 'all' || student.license_type === licenseFilter;
    
    return matchesSearch && matchesStatus && matchesLicense;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <UserGroupIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.user_type === 'instructor' ? t('students.title.instructor') : t('students.title.admin')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('students.count', { count: filteredStudents.length, plural: filteredStudents.length > 1 ? 's' : '' })}
            </p>
          </div>
        </div>
        {user?.user_type !== 'instructor' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('students.add_new')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('students.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none"
            >
              <option value="all">{t('students.filter.status.all')}</option>
              <option value="registered">{t('students.filter.status.registered')}</option>
              <option value="theory_in_progress">{t('students.filter.status.theory_in_progress')}</option>
              <option value="theory_passed">{t('students.filter.status.theory_passed')}</option>
              <option value="practical_in_progress">{t('students.filter.status.practical_in_progress')}</option>
              <option value="practical_passed">{t('students.filter.status.practical_passed')}</option>
              <option value="completed">{t('students.filter.status.completed')}</option>
              <option value="suspended">{t('students.filter.status.suspended')}</option>
            </select>
          </div>

          {/* License Filter */}
          <div className="relative">
            <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none"
            >
              <option value="all">{t('students.filter.license.all')}</option>
              <option value="A">{t('students.filter.license.A')}</option>
              <option value="B">{t('students.filter.license.B')}</option>
              <option value="C">{t('students.filter.license.C')}</option>
              <option value="D">{t('students.filter.license.D')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('students.table.candidate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('students.table.license')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('students.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('students.table.registration')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('students.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {student.photo ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={student.photo}
                              alt={student.full_name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <UserGroupIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.full_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getLicenseTypeBadge(student.license_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusDropdown student={student} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(student.registration_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {user?.user_type !== 'instructor' && (
                          <button
                            onClick={() => navigate(`/dashboard/students/${student.id}/payments`)}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            title="Paiements"
                          >
                            <CreditCardIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/dashboard/students/${student.id}/schedule`)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Emploi du temps"
                        >
                          <CalendarIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/students/${student.id}`)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Aucun candidat trouvé
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || licenseFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche.'
                : user?.user_type === 'instructor'
                  ? 'Aucun élève ne vous a été assigné pour le moment.'
                  : 'Commencez par ajouter votre premier candidat.'}
            </p>
          </div>
        )}
      </div>

      {/* Modales */}
      <StudentModal
        isOpen={showCreateModal || isStudentModalOpen}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedStudent(null);
          closeStudentModal();
        }}
        student={selectedStudent}
        onSuccess={loadStudents}
      />


    </div>
  );
};

export default StudentsPage;
