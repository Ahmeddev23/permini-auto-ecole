import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  TruckIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import dashboardService from '../../services/dashboardService';
import { ScheduleList, SESSION_TYPES, SESSION_STATUS } from '../../types/schedule';
import { StudentList } from '../../types/student';
import { InstructorList } from '../../types/instructor';
import { VehicleList } from '../../types/vehicle';
import { useLanguage } from '../../contexts/LanguageContext';


// Types de session pour la formation (sans les examens)
const TRAINING_SESSION_TYPES = {
  theory: 'Code',
  practical: 'Conduite'
} as const;

const SchedulePage: React.FC = () => {
  const { t } = useLanguage();
  const [schedules, setSchedules] = useState<ScheduleList[]>([]);
  const [students, setStudents] = useState<StudentList[]>([]);
  const [instructors, setInstructors] = useState<InstructorList[]>([]);
  const [vehicles, setVehicles] = useState<VehicleList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleList | null>(null);

  useEffect(() => {
    fetchSchedules();
    fetchStudents();
    fetchInstructors();
    fetchVehicles();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getSchedules();
      // Vérifier si data est un tableau ou un objet avec results
      const schedulesArray = Array.isArray(data) ? data : (data.results || []);
      setSchedules(schedulesArray);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des plannings');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await dashboardService.getStudents();
      const studentsArray = Array.isArray(data) ? data : (data.results || []);
      setStudents(studentsArray);
    } catch (error: any) {
      setStudents([]);
    }
  };

  const fetchInstructors = async () => {
    try {
      const data = await dashboardService.getInstructorsForSchedule();
      const instructorsArray = Array.isArray(data) ? data : (data.results || []);
      setInstructors(instructorsArray);
    } catch (error: any) {
      setInstructors([]);
    }
  };

  const fetchVehicles = async () => {
    try {
      const data = await dashboardService.getVehicles();
      const vehiclesArray = Array.isArray(data) ? data : (data.results || []);
      setVehicles(vehiclesArray);
    } catch (error: any) {
      setVehicles([]);
    }
  };

  const handleCreateSchedule = () => {
    setEditingSchedule(null);
    setShowModal(true);
  };

  const handleEditSchedule = (schedule: ScheduleList) => {
    setEditingSchedule(schedule);
    setShowModal(true);
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      return;
    }

    try {
      await dashboardService.deleteSchedule(id);
      toast.success('Séance supprimée avec succès');
      fetchSchedules();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await dashboardService.updateScheduleStatus(id, status);
      toast.success('Statut mis à jour avec succès');
      fetchSchedules();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  // Filtrage des plannings
  const filteredSchedules = (Array.isArray(schedules) ? schedules : []).filter(schedule => {
    const matchesSearch = schedule.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (schedule.instructor_name && schedule.instructor_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    const matchesType = typeFilter === 'all' || schedule.session_type === typeFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const scheduleDate = new Date(schedule.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = scheduleDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekFromNow = new Date(today);
          weekFromNow.setDate(today.getDate() + 7);
          matchesDate = scheduleDate >= today && scheduleDate <= weekFromNow;
          break;
        case 'month':
          const monthFromNow = new Date(today);
          monthFromNow.setMonth(today.getMonth() + 1);
          matchesDate = scheduleDate >= today && scheduleDate <= monthFromNow;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'no_show': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'theory': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'practical': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'exam_theory': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'exam_practical_circuit': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'exam_practical_park': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Planning & Emploi du temps
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez les séances de conduite et de code
          </p>
        </div>
        <button
          onClick={handleCreateSchedule}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouvelle séance
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Séances programmées</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {schedules.filter(s => s.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <CheckIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Séances terminées</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {schedules.filter(s => s.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <XMarkIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Séances annulées</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {schedules.filter(s => s.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absences</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {schedules.filter(s => s.status === 'no_show').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Nom du candidat ou moniteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(SESSION_STATUS).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de séance
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tous les types</option>
              {Object.entries(TRAINING_SESSION_TYPES).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Période
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des plannings */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Séances planifiées ({filteredSchedules.length})
          </h3>
        </div>

        {filteredSchedules.length === 0 ? (
          <div className="p-6 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune séance</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all'
                ? 'Aucune séance ne correspond aux filtres sélectionnés.'
                : 'Commencez par créer votre première séance.'}
            </p>
            {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && dateFilter === 'all' && (
              <button
                onClick={handleCreateSchedule}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Créer une séance
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date & Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Candidat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type de séance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Moniteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(schedule.date)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {schedule.student_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(schedule.session_type)}`}>
                        {SESSION_TYPES[schedule.session_type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {schedule.instructor_name || 'Non assigné'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {schedule.vehicle_info ? (
                          <>
                            <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900 dark:text-white">
                              {schedule.vehicle_info}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Non assigné</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={schedule.status}
                        onChange={(e) => handleStatusChange(schedule.id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(schedule.status)}`}
                      >
                        {Object.entries(SESSION_STATUS).map(([key, value]) => (
                          <option key={key} value={key}>{value}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditSchedule(schedule)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal pour créer/modifier une séance */}
      {showModal && (
        <ScheduleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchSchedules();
          }}
          schedule={editingSchedule}
          students={students}
          instructors={instructors}
          vehicles={vehicles}
        />
      )}
    </motion.div>
  );
};

// Composant Modal pour créer/modifier une séance
interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schedule?: ScheduleList | null;
  students: StudentList[];
  instructors: InstructorList[];
  vehicles: VehicleList[];
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  schedule,
  students,
  instructors,
  vehicles
}) => {
  const [formData, setFormData] = useState({
    student: schedule?.id || '',
    instructor: '',
    vehicle: '',
    session_type: schedule?.session_type || 'practical',
    date: schedule?.date || '',
    start_time: schedule?.start_time || '',
    end_time: schedule?.end_time || '',
    notes: schedule?.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{ available: boolean; conflicts?: any[] } | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Fonction pour gérer la sélection automatique du véhicule
  const handleInstructorChange = (instructorId: string) => {
    if (instructorId) {
      // Trouver le moniteur sélectionné
      const selectedInstructor = instructors.find(inst => inst.id.toString() === instructorId);

      if (selectedInstructor) {
        // Trouver tous les véhicules assignés à ce moniteur
        const instructorVehicles = vehicles.filter(vehicle =>
          vehicle.assigned_instructor === selectedInstructor.id
        );

        if (instructorVehicles.length === 1) {
          // Un seul véhicule → sélection automatique
          setFormData(prev => ({
            ...prev,
            instructor: instructorId,
            vehicle: instructorVehicles[0].id.toString()
          }));
        } else if (instructorVehicles.length > 1) {
          // Plusieurs véhicules → laisser le choix
          setFormData(prev => ({
            ...prev,
            instructor: instructorId,
            vehicle: ''
          }));
        } else {
          // Aucun véhicule assigné
          setFormData(prev => ({
            ...prev,
            instructor: instructorId,
            vehicle: ''
          }));
        }
      }
    } else {
      // Réinitialiser si pas de moniteur
      setFormData(prev => ({
        ...prev,
        instructor: '',
        vehicle: ''
      }));
    }
  };

  // Obtenir les véhicules disponibles pour le moniteur sélectionné
  const getAvailableVehicles = () => {
    if (!formData.instructor) return [];

    const selectedInstructor = instructors.find(inst => inst.id.toString() === formData.instructor);
    if (!selectedInstructor) return [];

    return vehicles.filter(vehicle =>
      vehicle.assigned_instructor === selectedInstructor.id
    );
  };

  const availableVehicles = getAvailableVehicles();

  // Vérification automatique de la disponibilité
  const checkAvailabilityAuto = async () => {
    // Vérifier que tous les champs requis sont remplis
    if (!formData.date || !formData.start_time || !formData.end_time || !formData.student) {
      setAvailabilityResult(null);
      setAvailabilityChecked(false);
      return;
    }

    setCheckingAvailability(true);
    try {
      const result = await dashboardService.checkAvailability({
        student_id: formData.student ? parseInt(formData.student as string) : undefined,
        instructor_id: formData.instructor ? parseInt(formData.instructor as string) : undefined,
        vehicle_id: formData.vehicle ? parseInt(formData.vehicle as string) : undefined,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time
      });

      setAvailabilityResult(result);
      setAvailabilityChecked(true);
    } catch (error: any) {
      setAvailabilityResult(null);
      setAvailabilityChecked(false);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Effet pour vérifier automatiquement la disponibilité
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkAvailabilityAuto();
    }, 500); // Délai de 500ms pour éviter trop d'appels API

    return () => clearTimeout(timeoutId);
  }, [formData.date, formData.start_time, formData.end_time, formData.student, formData.instructor, formData.vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier s'il y a des conflits
    if (availabilityResult && !availabilityResult.available) {
      toast.error('Impossible de créer la séance : conflits détectés');
      return;
    }

    // Si la vérification n'a pas été faite, la faire maintenant
    if (!availabilityChecked && formData.student && formData.date && formData.start_time && formData.end_time) {
      toast.error('Vérification de disponibilité en cours...');
      await checkAvailabilityAuto();
      return;
    }

    setLoading(true);

    try {
      const data = {
        student: parseInt(formData.student as string),
        instructor: formData.instructor ? parseInt(formData.instructor as string) : undefined,
        vehicle: formData.vehicle ? parseInt(formData.vehicle as string) : undefined,
        session_type: formData.session_type,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes
      };

      if (schedule) {
        await dashboardService.updateSchedule(schedule.id, data);
        toast.success('Séance modifiée avec succès');
      } else {
        await dashboardService.createSchedule(data);
        toast.success('Séance créée avec succès');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!formData.date || !formData.start_time || !formData.end_time) {
      toast.error('Veuillez remplir la date et les heures');
      return;
    }

    try {
      const result = await dashboardService.checkAvailability({
        instructor_id: formData.instructor ? parseInt(formData.instructor as string) : undefined,
        vehicle_id: formData.vehicle ? parseInt(formData.vehicle as string) : undefined,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time
      });

      if (result.available) {
        toast.success('Créneaux disponibles !');
        setAvailabilityChecked(true);
      } else {
        toast.error('Conflit détecté dans les créneaux');
        setAvailabilityChecked(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la vérification');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {schedule ? 'Modifier la séance' : 'Nouvelle séance'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="">Sélectionner un candidat</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de séance *
              </label>
              <select
                value={formData.session_type}
                onChange={(e) => setFormData({ ...formData, session_type: e.target.value as any })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {Object.entries(TRAINING_SESSION_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Moniteur
              </label>
              <select
                value={formData.instructor}
                onChange={(e) => handleInstructorChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Aucun moniteur</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Section véhicule - affichée seulement si nécessaire */}
            {formData.instructor && (
              <div>
                {availableVehicles.length === 0 ? (
                  // Aucun véhicule assigné au moniteur
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Aucun véhicule assigné
                        </h3>
                        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                          Ce moniteur n'a pas de véhicule assigné. La séance sera programmée sans véhicule spécifique.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : availableVehicles.length === 1 ? (
                  // Un seul véhicule - affichage informatif
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                          Véhicule assigné automatiquement
                        </h3>
                        <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                          <strong>{availableVehicles[0].brand} {availableVehicles[0].model}</strong> - {availableVehicles[0].license_plate}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Plusieurs véhicules - dropdown de choix
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Choisir un véhicule *
                    </label>
                    <select
                      value={formData.vehicle}
                      onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Sélectionner un véhicule</option>
                      {availableVehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.brand} {vehicle.model} - {vehicle.license_plate}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Ce moniteur a plusieurs véhicules assignés. Choisissez celui à utiliser pour cette séance.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Heure début *
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Heure fin *
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Affichage du statut de disponibilité */}
          {formData.student && formData.date && formData.start_time && formData.end_time && (
            <div className="space-y-3">
              {checkingAvailability && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Vérification de la disponibilité...
                    </p>
                  </div>
                </div>
              )}

              {availabilityResult && !checkingAvailability && (
                <div className={`p-4 border rounded-md ${
                  availabilityResult.available
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {availabilityResult.available ? (
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        availabilityResult.available
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-red-800 dark:text-red-200'
                      }`}>
                        {availabilityResult.available ? 'Créneaux disponibles' : 'Conflits détectés'}
                      </h3>

                      {!availabilityResult.available && availabilityResult.conflicts && (
                        <div className="mt-2 space-y-2">
                          {availabilityResult.conflicts.map((conflict, index) => (
                            <div key={index} className="text-sm text-red-700 dark:text-red-300">
                              <p className="font-medium">{conflict.message}</p>
                              {conflict.conflicting_sessions && conflict.conflicting_sessions.map((session: any, sessionIndex: number) => (
                                <p key={sessionIndex} className="ml-4 text-xs">
                                  • {session.start_time} - {session.end_time}
                                  {session.student && ` avec ${session.student}`}
                                  {session.instructor && ` (${session.instructor})`}
                                </p>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Notes optionnelles..."
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={checkAvailability}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
            >
              Vérifier disponibilité
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || (availabilityResult && !availabilityResult.available) || checkingAvailability}
                className={`px-4 py-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  (availabilityResult && !availabilityResult.available)
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Sauvegarde...' :
                 checkingAvailability ? 'Vérification...' :
                 (availabilityResult && !availabilityResult.available) ? 'Conflits détectés' :
                 (schedule ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchedulePage;
