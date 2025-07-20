import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, CalendarIcon, XMarkIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { toast } from 'react-hot-toast';
import { dashboardService } from '../../services/dashboardService';
import { ScheduleCreate, SESSION_TYPES, SESSION_COLORS } from '../../types/schedule';
import { useAuth } from '../../contexts/AuthContext';

// Types de session pour la formation (sans les examens)
const TRAINING_SESSION_TYPES = {
  theory: 'Code',
  practical: 'Conduite'
} as const;

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  cin: string;
  phone: string;
  license_type: string;
  formation_status: string;
  progress_percentage: number;
  registration_date: string;
  photo?: string;
}

interface Schedule {
  id: number;
  student: number;
  student_name: string;
  instructor: number;
  instructor_name: string;
  vehicle?: number;
  vehicle_info?: string;
  date: string;
  start_time: string;
  end_time: string;
  session_type: string;
  status: string;
  notes?: string;
}

const StudentSchedulePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [hoveredEvent, setHoveredEvent] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hiddenSessions, setHiddenSessions] = useState<Set<number>>(new Set());

  // Détecter si c'est l'étudiant qui consulte son propre planning
  const isOwnSchedule = user?.user_type === 'student' && user?.student_profile?.id === parseInt(studentId || '0');

  // États pour la création de séances
  const [showModal, setShowModal] = useState(false);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedDateInfo, setSelectedDateInfo] = useState<{
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);

  // Utilisation des types de session importés qui incluent les examens

  // Couleurs selon le statut
  const getStatusColor = (status: string) => {
    const colors = {
      'scheduled': '#3B82F6', // Bleu
      'in_progress': '#F59E0B', // Orange
      'completed': '#10B981', // Vert
      'cancelled': '#EF4444' // Rouge
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  // Convertir les événements en format FullCalendar
  const convertSchedulesToEvents = () => {


    if (!calendarEvents || calendarEvents.length === 0) {

      return [];
    }

    // Filtrer les événements masqués (seulement pour les séances, pas les examens)
    const visibleEvents = calendarEvents.filter(event => {
      if (event.extendedProps?.type === 'schedule') {
        const scheduleId = parseInt(event.id.replace('schedule_', ''));
        return !hiddenSessions.has(scheduleId);
      }
      return true; // Garder tous les examens visibles
    });



    const events = visibleEvents.map(event => {


      // Pour les séances, ajouter les données de la séance dans extendedProps.schedule
      if (event.extendedProps?.type === 'schedule') {
        const scheduleId = parseInt(event.id.replace('schedule_', ''));
        const schedule = schedules.find(s => s.id === scheduleId);

        return {
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          backgroundColor: event.backgroundColor,
          borderColor: event.borderColor,
          textColor: event.textColor,
          extendedProps: {
            ...event.extendedProps,
            schedule: schedule // Ajouter les données de la séance pour compatibilité
          }
        };
      }

      // Pour les examens, garder tel quel
      return {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
        textColor: event.textColor,
        extendedProps: event.extendedProps
      };
    });


    return events;
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
      fetchStudentSchedule();
      fetchInstructors();
      fetchVehicles();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      const studentData = await dashboardService.getStudent(parseInt(studentId!));
      setStudent(studentData);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données de l\'étudiant:', error);
      toast.error('Erreur lors du chargement des données de l\'étudiant');
    }
  };

  const fetchStudentSchedule = async () => {
    try {
      setLoading(true);

      let eventsData;

      if (isOwnSchedule) {
        // Pour les étudiants : récupérer séances + examens mais avec l'endpoint avec examens

        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const endDate = new Date(now.getFullYear(), now.getMonth() + 6, 0).toISOString(); // 6 mois pour voir plus d'examens

        eventsData = await dashboardService.getStudentScheduleWithExams(
          parseInt(studentId!),
          startDate,
          endDate
        );
      } else {
        // Pour les auto-écoles : utiliser l'endpoint avec examens
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString();



        eventsData = await dashboardService.getStudentScheduleWithExams(
          parseInt(studentId!),
          startDate,
          endDate
        );
      }



      // Convertir les événements en format compatible avec l'interface existante
      const schedules = eventsData
        .filter(event => event.extendedProps?.type === 'schedule')
        .map(event => ({
          id: parseInt(event.id.replace('schedule_', '')),
          student: parseInt(studentId!),
          student_name: event.extendedProps.student_name,
          instructor: event.extendedProps.instructor_name ? 1 : 0, // Approximation
          instructor_name: event.extendedProps.instructor_name || '',
          vehicle: event.extendedProps.vehicle ? 1 : null,
          vehicle_info: event.extendedProps.vehicle || '',
          date: event.start.split('T')[0],
          start_time: event.start.split('T')[1].substring(0, 5),
          end_time: event.end.split('T')[1].substring(0, 5),
          session_type: event.extendedProps.session_type,
          status: event.extendedProps.status,
          notes: event.extendedProps.notes
        }));

      // Stocker les événements bruts pour le calendrier (incluant examens)
      setCalendarEvents(eventsData);
      setSchedules(schedules);



    } catch (error: any) {
      console.error('Erreur lors du chargement du planning:', error);
      toast.error('Erreur lors du chargement du planning');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    // Ne charger les moniteurs que si ce n'est pas l'étudiant qui consulte son propre planning
    if (isOwnSchedule) {

      setInstructors([]);
      return;
    }

    try {
      const data = await dashboardService.getInstructorsForSchedule();

      setInstructors(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des moniteurs:', error);
      setInstructors([]);
    }
  };

  const fetchVehicles = async () => {
    // Ne charger les véhicules que si ce n'est pas l'étudiant qui consulte son propre planning
    if (isOwnSchedule) {

      setVehicles([]);
      return;
    }

    try {
      const data = await dashboardService.getVehicles();
      setVehicles(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des véhicules:', error);
      setVehicles([]);
    }
  };



  const hideSession = (scheduleId: number) => {
    setHiddenSessions(prev => new Set([...prev, scheduleId]));
    toast.success('Séance masquée de l\'affichage');
  };

  const updateScheduleStatus = async (scheduleId: number, status: string) => {
    try {

      const result = await dashboardService.updateScheduleStatus(scheduleId, status);


      await fetchStudentSchedule();
      toast.success('Statut mis à jour avec succès');
    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour:', error);

      try {
        await fetchStudentSchedule();
        toast.success('Statut mis à jour (avec avertissement)');
      } catch (refreshError) {
        toast.error(error.message || 'Erreur lors de la mise à jour du statut');
      }
    }
  };

  const deleteSchedule = async (scheduleId: number) => {
    try {

      await dashboardService.deleteSchedule(scheduleId);
      await fetchStudentSchedule();
      toast.success('Séance supprimée avec succès');
    } catch (error: any) {
      console.error('❌ Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la séance');
    }
  };

  const canCompleteSession = (schedule: any) => {
    const now = new Date();
    const sessionDate = new Date(schedule.date);
    const [endHour, endMinute] = schedule.end_time.split(':').map(Number);

    const sessionEndTime = new Date(sessionDate);
    sessionEndTime.setHours(endHour, endMinute, 0, 0);

    return now >= sessionEndTime;
  };

  // Gestionnaires d'événements FullCalendar
  const handleDateSelect = (selectInfo: any) => {
    const startDate = new Date(selectInfo.start);
    const now = new Date();

    // Vérifier si la sélection est dans le passé
    if (startDate < now) {
      toast.error('Impossible de créer une séance dans le passé');
      return;
    }

    const date = selectInfo.startStr.split('T')[0];
    const startTime = selectInfo.startStr.split('T')[1].substring(0, 5);
    const endTime = selectInfo.endStr.split('T')[1].substring(0, 5);

    setSelectedDateInfo({ date, startTime, endTime });
    setShowModal(true);
  };

  const handleEventClick = (clickInfo: any) => {
    // Fermer le tooltip si ouvert
    setShowTooltip(false);

    // Vérifier si c'est un examen ou une séance
    const eventType = clickInfo.event.extendedProps.type;

    if (eventType === 'exam') {
      // Pour les examens, ne pas naviguer si c'est l'étudiant qui consulte son propre planning
      if (isOwnSchedule) {
        // Afficher juste les détails de l'examen
        const examProps = clickInfo.event.extendedProps;
        toast.info(`Examen: ${examProps.exam_type} - ${examProps.result || 'En attente'}`);
        return;
      }
      // Pour les auto-écoles, naviguer vers la page de détails de l'examen
      const examId = clickInfo.event.id.replace('exam_', '');
      navigate(`/dashboard/exams/${examId}`);
      return;
    }

    // Pour les séances de formation
    const schedule = clickInfo.event.extendedProps.schedule;
    if (!schedule) {
      console.warn('Aucune donnée de séance trouvée');
      return;
    }

    if (isOwnSchedule) {
      // Pour les étudiants : seulement masquer les séances annulées ou afficher les détails
      if (schedule.status === 'cancelled') {
        // Pour les séances annulées, afficher le popup avec option de masquage seulement
        const rect = clickInfo.el.getBoundingClientRect();
        setSelectedEvent(schedule);
        setPopupPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        setShowActionPopup(true);
      } else {
        // Pour les autres statuts, afficher juste les détails
        const sessionType = SESSION_TYPES[schedule.session_type as keyof typeof SESSION_TYPES] || schedule.session_type;
        toast.info(`Séance: ${schedule.instructor_name} - ${sessionType} (${schedule.status})`);
      }
    } else {
      // Pour les auto-écoles : comportement normal avec toutes les actions
      if (schedule.status === 'scheduled' || schedule.status === 'in_progress') {
        const rect = clickInfo.el.getBoundingClientRect();
        setSelectedEvent(schedule);
        setPopupPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        setShowActionPopup(true);
      } else if (schedule.status === 'cancelled') {
        // Pour les séances annulées, afficher le popup avec option de masquage
        const rect = clickInfo.el.getBoundingClientRect();
        setSelectedEvent(schedule);
        setPopupPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        setShowActionPopup(true);
      } else {
        // Pour les autres statuts (completed), afficher juste les détails
        toast.info(`Séance: ${schedule.instructor_name} - ${SESSION_TYPES[schedule.session_type as keyof typeof SESSION_TYPES]} (${schedule.status})`);
      }
    }
  };

  const handleEventDrop = async (dropInfo: any) => {
    // Empêcher le déplacement des examens
    const eventType = dropInfo.event.extendedProps.type;
    if (eventType === 'exam') {
      dropInfo.revert();
      toast.error('Les examens ne peuvent pas être déplacés depuis cette interface');
      return;
    }

    const newDate = dropInfo.event.startStr.split('T')[0];
    const newStartTime = dropInfo.event.startStr.split('T')[1].substring(0, 5);

    const now = new Date();
    const newDateTime = new Date(`${newDate}T${newStartTime}:00`);

    if (newDateTime < now) {
      dropInfo.revert();
      toast.error('Impossible de déplacer une séance dans le passé');
      return;
    }

    const newEndTime = dropInfo.event.endStr.split('T')[1].substring(0, 5);
    // Extraire l'ID correct pour les séances (format: schedule_123)
    const scheduleId = parseInt(dropInfo.event.id.replace('schedule_', ''));

    try {
      await dashboardService.updateSchedule(scheduleId, {
        date: newDate,
        start_time: newStartTime,
        end_time: newEndTime
      });

      await fetchStudentSchedule();
      toast.success('Séance déplacée avec succès');
    } catch (error: any) {
      dropInfo.revert();
      console.error('Erreur lors du déplacement:', error);
      toast.error('Erreur lors du déplacement de la séance');
    }
  };

  const handleEventResize = async (resizeInfo: any) => {
    // Empêcher le redimensionnement des examens
    const eventType = resizeInfo.event.extendedProps.type;
    if (eventType === 'exam') {
      resizeInfo.revert();
      toast.error('Les examens ne peuvent pas être redimensionnés');
      return;
    }

    const newEndTime = resizeInfo.event.endStr.split('T')[1].substring(0, 5);
    // Extraire l'ID correct pour les séances (format: schedule_123)
    const scheduleId = parseInt(resizeInfo.event.id.replace('schedule_', ''));

    try {
      await dashboardService.updateSchedule(scheduleId, {
        end_time: newEndTime
      });

      await fetchStudentSchedule();
      toast.success('Durée de la séance modifiée');
    } catch (error: any) {
      resizeInfo.revert();
      toast.error('Erreur lors de la modification de la durée');
    }
  };

  const handleEventMouseEnter = (mouseEnterInfo: any) => {
    const schedule = mouseEnterInfo.event.extendedProps.schedule;
    const rect = mouseEnterInfo.el.getBoundingClientRect();
    
    setHoveredEvent(schedule);
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setShowTooltip(true);
  };

  const handleEventMouseLeave = () => {
    setShowTooltip(false);
    setHoveredEvent(null);
  };

  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  // Composant popup d'actions
  const ActionPopup = () => {
    if (!showActionPopup || !selectedEvent) return null;
    const canComplete = canCompleteSession(selectedEvent);

    return (
      <>
        {/* Overlay pour fermer le popup */}
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowActionPopup(false)}
        />

        {/* Popup d'actions */}
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="text-center mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              {selectedEvent.instructor_name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {SESSION_TYPES[selectedEvent.session_type as keyof typeof SESSION_TYPES]}
            </p>
          </div>

          <div className="flex gap-1 flex-wrap">
            {isOwnSchedule ? (
              // Pour les étudiants : seulement l'option masquer pour les séances annulées
              selectedEvent.status === 'cancelled' && (
                <button
                  onClick={() => {
                    hideSession(selectedEvent.id);
                    setShowActionPopup(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-xs font-medium transition-colors"
                  title="Masquer cette séance de l'affichage"
                >
                  👁️‍🗨️ Masquer
                </button>
              )
            ) : (
              // Pour les auto-écoles : toutes les options
              selectedEvent.status === 'cancelled' ? (
                // Boutons pour les séances annulées
                <>
                  <button
                    onClick={() => {
                      hideSession(selectedEvent.id);
                      setShowActionPopup(false);
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-xs font-medium transition-colors"
                    title="Masquer cette séance de l'affichage"
                  >
                    👁️‍🗨️ Masquer
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer cette séance annulée ?')) {
                        deleteSchedule(selectedEvent.id);
                        setShowActionPopup(false);
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-900 text-white rounded-md text-xs font-medium transition-colors"
                    title="Supprimer définitivement cette séance"
                  >
                    🗑️ Supprimer
                  </button>
                </>
              ) : (
              // Boutons pour les séances actives
              <>
                <button
                  onClick={() => {
                    if (canComplete) {
                      updateScheduleStatus(selectedEvent.id, 'completed');
                      setShowActionPopup(false);
                    } else {
                      toast.warning('La séance ne peut être terminée qu\'après son heure de fin');
                    }
                  }}
                  disabled={!canComplete}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    canComplete
                      ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                  title={canComplete ? 'Terminer la séance' : 'La séance ne peut être terminée qu\'après son heure de fin'}
                >
                  ✅ Terminer
                </button>

                <button
                  onClick={() => {
                    updateScheduleStatus(selectedEvent.id, 'cancelled');
                    setShowActionPopup(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors"
                >
                  ❌ Annuler
                </button>

                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
                      deleteSchedule(selectedEvent.id);
                      setShowActionPopup(false);
                    }
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-900 text-white rounded-md text-xs font-medium transition-colors"
                >
                  🗑️ Supprimer
                </button>
              </>
              )
            )}
          </div>
        </div>
      </>
    );
  };

  // Composant tooltip pour le hover
  const EventTooltip = () => {
    if (!showTooltip || !hoveredEvent) return null;

    const getStatusText = (status: string) => {
      const statusMap = {
        'scheduled': 'Programmée',
        'in_progress': 'En cours',
        'completed': 'Terminée',
        'cancelled': 'Annulée'
      };
      return statusMap[status as keyof typeof statusMap] || status;
    };

    const getStatusColor = (status: string) => {
      const colorMap = {
        'scheduled': 'text-blue-600',
        'in_progress': 'text-yellow-600',
        'completed': 'text-green-600',
        'cancelled': 'text-red-600'
      };
      return colorMap[status as keyof typeof colorMap] || 'text-gray-600';
    };

    return (
      <div 
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 max-w-xs"
        style={{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`,
          transform: 'translate(-50%, -100%)',
          pointerEvents: 'none'
        }}
      >
        <div className="space-y-2">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {hoveredEvent.instructor_name}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {SESSION_TYPES[hoveredEvent.session_type as keyof typeof SESSION_TYPES]}
            </p>
          </div>
          
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Horaire:</span>
              <span className="font-medium">{hoveredEvent.start_time} - {hoveredEvent.end_time}</span>
            </div>
            
            {hoveredEvent.vehicle_info && (
              <div className="flex justify-between">
                <span className="text-gray-500">Véhicule:</span>
                <span className="font-medium">{hoveredEvent.vehicle_info}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-500">Statut:</span>
              <span className={`font-medium ${getStatusColor(hoveredEvent.status)}`}>
                {getStatusText(hoveredEvent.status)}
              </span>
            </div>

            {(hoveredEvent.status === 'scheduled' || hoveredEvent.status === 'in_progress') && (
              <div className="flex justify-between">
                <span className="text-gray-500">Action:</span>
                <span className={`font-medium text-xs ${canCompleteSession(hoveredEvent) ? 'text-green-600' : 'text-orange-600'}`}>
                  {canCompleteSession(hoveredEvent) ? '✅ Peut être terminée' : '⏳ En attente de fin'}
                </span>
              </div>
            )}
            
            {hoveredEvent.notes && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Notes:</span> {hoveredEvent.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
          {!isOwnSchedule && (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/students')}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Retour aux candidats
              </button>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Emploi du temps - {student ? `${student.first_name} ${student.last_name}` : 'Candidat'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isOwnSchedule
                ? 'Consultez vos séances de formation programmées'
                : 'Cliquez sur le calendrier pour créer une nouvelle séance'
              }
            </p>
          </div>
        </div>

        {/* Emploi du temps avec FullCalendar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Emploi du temps - {student ? `${student.first_name} ${student.last_name}` : 'Candidat'}
            </h3>
          </div>

          {/* Légende des couleurs */}
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-gray-700 dark:text-gray-300">Séances programmées</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-gray-700 dark:text-gray-300">Séances terminées</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span className="text-gray-700 dark:text-gray-300">Séances annulées</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span className="text-gray-700 dark:text-gray-300">Examens</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement du calendrier...</span>
              </div>
            ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            locale="fr"
            timeZone="local"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            buttonText={{
              today: "Aujourd'hui",
              month: 'Mois',
              week: 'Semaine',
              day: 'Jour'
            }}
            height="auto"
            events={convertSchedulesToEvents()}
            editable={!isOwnSchedule}
            selectable={!isOwnSchedule}
            selectMirror={!isOwnSchedule}
            dayMaxEvents={true}
            weekends={true}
            eventClick={handleEventClick}
            eventMouseEnter={handleEventMouseEnter}
            eventMouseLeave={handleEventMouseLeave}
            select={!isOwnSchedule ? handleDateSelect : undefined}
            eventDrop={!isOwnSchedule ? handleEventDrop : undefined}
            eventResize={!isOwnSchedule ? handleEventResize : undefined}
            allDaySlot={false}
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
          />
            )}
          </div>
        </div>

        {/* Statistiques de la semaine */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total séances</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {schedules.filter(s => {
                    const scheduleDate = new Date(s.date);
                    const weekDates = getCurrentWeekDates();
                    return scheduleDate >= weekDates[0] && scheduleDate <= weekDates[6];
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CheckIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Terminées</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {schedules.filter(s => {
                    const scheduleDate = new Date(s.date);
                    const weekDates = getCurrentWeekDates();
                    return scheduleDate >= weekDates[0] && scheduleDate <= weekDates[6] && s.status === 'completed';
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Programmées</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {schedules.filter(s => {
                    const scheduleDate = new Date(s.date);
                    const weekDates = getCurrentWeekDates();
                    return scheduleDate >= weekDates[0] && scheduleDate <= weekDates[6] && s.status === 'scheduled';
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <XMarkIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Annulées</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {schedules.filter(s => {
                    const scheduleDate = new Date(s.date);
                    const weekDates = getCurrentWeekDates();
                    return scheduleDate >= weekDates[0] && scheduleDate <= weekDates[6] && s.status === 'cancelled';
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Popup d'actions */}
        <ActionPopup />

        {/* Tooltip au hover */}
        <EventTooltip />

        {/* Modal Nouvelle séance - seulement pour les auto-écoles */}
        {showModal && !isOwnSchedule && (
          <ScheduleModal
            studentId={studentId!}
            instructors={instructors}
            vehicles={vehicles}
            selectedDateInfo={selectedDateInfo}
            onClose={() => {
              setShowModal(false);
              setSelectedDateInfo(null);
            }}
            onSuccess={() => {
              setShowModal(false);
              setSelectedDateInfo(null);
              fetchStudentSchedule();
            }}
          />
        )}
    </div>
  );
};

// Composant Modal pour créer une séance
interface ScheduleModalProps {
  studentId: string;
  instructors: any[];
  vehicles: any[];
  selectedDateInfo?: {
    date: string;
    startTime: string;
    endTime: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  studentId,
  instructors,
  vehicles,
  selectedDateInfo,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<ScheduleCreate>({
    student: parseInt(studentId),
    instructor: 0,
    vehicle: null,
    date: selectedDateInfo?.date || '',
    start_time: selectedDateInfo?.startTime || '',
    end_time: selectedDateInfo?.endTime || '',
    session_type: 'practical',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{ available: boolean; conflicts?: any[] } | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Fonction pour gérer la sélection automatique du véhicule
  const getAvailableVehicles = (instructorId: number) => {
    return vehicles.filter(vehicle =>
      vehicle.assigned_instructor === instructorId
    );
  };

  const handleInstructorChange = (instructorId: string) => {
    if (instructorId) {
      const availableVehicles = getAvailableVehicles(parseInt(instructorId));

      if (availableVehicles.length === 1) {
        // Auto-sélectionner le véhicule unique
        setFormData(prev => ({
          ...prev,
          instructor: parseInt(instructorId),
          vehicle: availableVehicles[0].id
        }));
      } else if (availableVehicles.length === 0) {
        // Aucun véhicule assigné
        setFormData(prev => ({
          ...prev,
          instructor: parseInt(instructorId),
          vehicle: null
        }));
      } else {
        // Plusieurs véhicules disponibles
        setFormData(prev => ({
          ...prev,
          instructor: parseInt(instructorId),
          vehicle: null
        }));
      }
    }
  };

  const availableVehicles = formData.instructor ? getAvailableVehicles(formData.instructor) : [];

  // Vérification automatique de la disponibilité
  const checkAvailabilityAuto = async () => {
    // Vérifier que tous les champs requis sont remplis (moniteur optionnel)
    if (!formData.date || !formData.start_time || !formData.end_time) {
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
      console.error('Erreur lors de la vérification automatique:', error);
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

  // Auto-sélection du véhicule au chargement
  useEffect(() => {
    if (formData.instructor) {
      handleInstructorChange(formData.instructor.toString());
    }
  }, [vehicles, formData.instructor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier si la séance est dans le passé
    if (formData.date && formData.start_time) {
      const now = new Date();
      const sessionDateTime = new Date(`${formData.date}T${formData.start_time}:00`);

      if (sessionDateTime < now) {
        toast.error('Impossible de créer une séance dans le passé');
        return;
      }
    }

    // Vérifier s'il y a des conflits
    if (availabilityResult && !availabilityResult.available) {
      toast.error('Impossible de créer la séance : conflits détectés');
      return;
    }

    // Si la vérification n'a pas été faite, la faire maintenant (seulement si un moniteur est sélectionné)
    if (!availabilityChecked && formData.instructor && formData.date && formData.start_time && formData.end_time) {
      toast.error('Vérification de disponibilité en cours...');
      await checkAvailabilityAuto();
      return;
    }

    setLoading(true);

    try {
      // Préparer les données en gérant le cas où aucun moniteur n'est sélectionné
      const scheduleData = {
        ...formData,
        instructor: formData.instructor > 0 ? formData.instructor : null,
        vehicle: formData.instructor > 0 && formData.vehicle ? formData.vehicle : null
      };

      await dashboardService.createSchedule(scheduleData);
      toast.success('Séance créée avec succès');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de la séance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Nouvelle séance
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Moniteur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Moniteur
            </label>
            <select
              value={formData.instructor}
              onChange={(e) => {
                const instructorId = e.target.value;
                setFormData({ ...formData, instructor: parseInt(instructorId) || 0 });
                if (instructorId) {
                  handleInstructorChange(instructorId);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>Aucun moniteur (séance libre)</option>
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.full_name || `${instructor.first_name} ${instructor.last_name}`}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date * {selectedDateInfo && <span className="text-blue-600 text-xs">(sélectionnée depuis le calendrier)</span>}
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              readOnly={!!selectedDateInfo}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                selectedDateInfo ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''
              }`}
            />
          </div>

          {/* Heure début */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Heure de début * {selectedDateInfo && <span className="text-blue-600 text-xs">(sélectionnée depuis le calendrier)</span>}
            </label>
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
              readOnly={!!selectedDateInfo}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                selectedDateInfo ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''
              }`}
            />
          </div>

          {/* Heure fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Heure de fin * {selectedDateInfo && <span className="text-blue-600 text-xs">(sélectionnée depuis le calendrier)</span>}
            </label>
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              required
              readOnly={!!selectedDateInfo}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                selectedDateInfo ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''
              }`}
            />
          </div>

          {/* Type de séance */}
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
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* Véhicule (seulement si un moniteur est sélectionné) */}
          {formData.instructor > 0 && availableVehicles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Véhicule {availableVehicles.length === 1 ? '(Auto-sélectionné)' : '*'}
              </label>
              {availableVehicles.length === 1 ? (
                <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-800 dark:text-green-300">
                  ✓ {availableVehicles[0].brand} {availableVehicles[0].model} - {availableVehicles[0].license_plate}
                </div>
              ) : (
                <select
                  value={formData.vehicle || ''}
                  onChange={(e) => setFormData({ ...formData, vehicle: parseInt(e.target.value) })}
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
              )}
            </div>
          )}

          {/* Notes */}
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

          {/* Affichage du statut de disponibilité (seulement si un moniteur est sélectionné) */}
          {formData.instructor && formData.instructor > 0 && formData.date && formData.start_time && formData.end_time && (
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
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
                                  {session.student_name && ` avec ${session.student_name}`}
                                  {session.instructor_name && ` (${session.instructor_name})`}
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

          {/* Boutons */}
          <div className="flex justify-between pt-4">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
                {loading ? 'Création...' :
                 checkingAvailability ? 'Vérification...' :
                 (availabilityResult && !availabilityResult.available) ? 'Conflits détectés' :
                 'Créer la séance'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentSchedulePage;
