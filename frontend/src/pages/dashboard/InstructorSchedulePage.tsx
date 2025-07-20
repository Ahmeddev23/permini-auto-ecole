import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  TruckIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dashboardService from '../../services/dashboardService';
import { ScheduleList, SESSION_TYPES, SESSION_STATUS, ScheduleCreate } from '../../types/schedule';
import '../../styles/fullcalendar-dark.css';
import { InstructorList } from '../../types/instructor';
import { StudentList } from '../../types/student';
import { VehicleList } from '../../types/vehicle';
import { useAuth } from '../../contexts/AuthContext';

const InstructorSchedulePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const instructorId = searchParams.get('instructor');

  // Determine if the current user is viewing their own schedule
  const isOwnSchedule = user?.user_type === 'instructor' &&
                       user?.instructor_profile?.id?.toString() === instructorId;
  
  const [schedules, setSchedules] = useState<ScheduleList[]>([]);
  const [instructor, setInstructor] = useState<InstructorList | null>(null);
  const [students, setStudents] = useState<StudentList[]>([]);
  const [vehicles, setVehicles] = useState<VehicleList[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedDateInfo, setSelectedDateInfo] = useState<{
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [hoveredEvent, setHoveredEvent] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hiddenSessions, setHiddenSessions] = useState<Set<number>>(new Set());

  // Fonction pour obtenir la couleur selon le type de séance
  const getColorBySessionType = (sessionType: string) => {
    const colors = {
      'practical': '#3B82F6', // Bleu
      'theory': '#10B981',     // Vert
      'exam': '#F59E0B',       // Orange
      'evaluation': '#8B5CF6', // Violet
      'makeup': '#EF4444'      // Rouge
    };
    return colors[sessionType as keyof typeof colors] || '#6B7280';
  };

  // Fonction pour obtenir la couleur selon le statut
  const getColorByStatus = (status: string) => {
    const colors = {
      'scheduled': '#3B82F6',  // Bleu
      'completed': '#10B981',  // Vert
      'cancelled': '#EF4444',  // Rouge
      'no_show': '#F59E0B'     // Orange
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  // Convertir les séances en événements FullCalendar
  const convertSchedulesToEvents = () => {


    if (!schedules || schedules.length === 0) {

      return [];
    }

    // Filtrer seulement les séances masquées (garder les annulées mais masquer celles explicitement cachées)
    const visibleSchedules = schedules.filter(schedule => !hiddenSessions.has(schedule.id));


    const events = visibleSchedules.map(schedule => {
      // Formater les heures pour s'assurer qu'elles sont au bon format ISO
      const formatTime = (time: string) => {
        if (time.length === 5) return `${time}:00`; // HH:MM -> HH:MM:SS
        if (time.length === 8) return time; // HH:MM:SS
        return `${time}:00`; // Par défaut
      };

      const startTime = formatTime(schedule.start_time);
      const endTime = formatTime(schedule.end_time);

      // Créer les dates complètes avec fuseau horaire local explicite
      const startDateTime = `${schedule.date}T${startTime}`;
      const endDateTime = `${schedule.date}T${endTime}`;

      // Vérifier que les dates sont valides
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('❌ Dates invalides pour la séance:', schedule);
        return null;
      }

      if (startDate >= endDate) {
        console.error('❌ Heure de fin antérieure ou égale à l\'heure de début:', schedule);
        return null;
      }

      const event = {
        id: schedule.id.toString(),
        title: `${schedule.student_name} - ${SESSION_TYPES[schedule.session_type]}`,
        start: startDate, // Utiliser l'objet Date directement
        end: endDate,     // Utiliser l'objet Date directement
        backgroundColor: getColorByStatus(schedule.status),
        borderColor: getColorBySessionType(schedule.session_type),
        extendedProps: {
          schedule: schedule,
          student: schedule.student_name,
          instructor: schedule.instructor_name,
          vehicle: schedule.vehicle_info,
          sessionType: schedule.session_type,
          status: schedule.status,
          notes: schedule.notes
        }
      };


      return event;
    }).filter(event => event !== null); // Filtrer les événements invalides


    return events;
  };

  useEffect(() => {
    if (instructorId) {

      // D'abord récupérer les infos du moniteur, puis les séances
      fetchInstructorInfo().then((instructorInfo) => {
        fetchInstructorSchedule(instructorInfo);
      });
      fetchStudents();
      fetchVehicles();
    } else {

      // Si pas d'instructorId et que c'est un moniteur, on attend la redirection
      if (isOwnSchedule && user?.instructor_profile?.id) {

      }
    }
  }, [instructorId, weekOffset, isOwnSchedule, user]);

  const fetchInstructorSchedule = async (instructorInfo?: any) => {
    try {
      setLoading(true);
      const response = await dashboardService.getSchedules();


      // Gérer la structure de données de l'API (tableau direct ou objet avec results)
      const data = Array.isArray(response) ? response : (response.results || []);


      // Debug: afficher la structure complète d'une séance
      if (data.length > 0) {

      }

      // Récupérer les infos du moniteur si pas fournies
      let currentInstructor = instructorInfo;
      if (!currentInstructor) {
        // Si c'est le propre planning du moniteur, utiliser ses infos
        if (isOwnSchedule && user?.instructor_profile) {
          currentInstructor = {
            id: user.instructor_profile.id,
            full_name: user.instructor_profile.full_name,
            first_name: user.instructor_profile.first_name,
            last_name: user.instructor_profile.last_name,
            driving_school_name: user.instructor_profile.driving_school_name
          };
        } else {
          // Sinon, récupérer via l'API (pour les auto-écoles)
          try {
            const instructorsResponse = await dashboardService.getInstructorsForSchedule();
            const instructors = Array.isArray(instructorsResponse) ? instructorsResponse : (instructorsResponse.results || []);
            currentInstructor = instructors.find(inst => inst.id.toString() === instructorId);
          } catch (error) {
            console.error('Erreur lors de la récupération des moniteurs:', error);
            // Si l'API échoue et que c'est un moniteur, utiliser ses infos
            if (isOwnSchedule && user?.instructor_profile) {
              currentInstructor = {
                id: user.instructor_profile.id,
                full_name: user.instructor_profile.full_name,
                first_name: user.instructor_profile.first_name,
                last_name: user.instructor_profile.last_name,
                driving_school_name: user.instructor_profile.driving_school_name
              };
            }
          }
        }
      }

      // Filtrer les séances pour ce moniteur spécifique


      const instructorSchedules = data.filter(schedule => {


        // Filtrer par ID du moniteur (plus fiable)
        if (schedule.instructor_id) {
          const match = schedule.instructor_id.toString() === instructorId;

          return match;
        }

        // Fallback: filtrer par nom du moniteur si pas d'ID
        const nameMatch = currentInstructor && schedule.instructor_name === currentInstructor.full_name;

        return nameMatch;
      });


      setSchedules(instructorSchedules);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement:', error);
      toast.error(error.message || 'Erreur lors du chargement de l\'emploi du temps');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorInfo = async () => {
    try {
      // Si l'utilisateur est un moniteur qui consulte son propre planning
      if (isOwnSchedule && user?.instructor_profile) {
        const instructorInfo = {
          id: user.instructor_profile.id,
          full_name: user.instructor_profile.full_name,
          first_name: user.instructor_profile.first_name,
          last_name: user.instructor_profile.last_name,
          driving_school_name: user.instructor_profile.driving_school_name
        };
        setInstructor(instructorInfo);
        return instructorInfo;
      }

      // Sinon, récupérer via l'API (pour les auto-écoles)
      const instructorsResponse = await dashboardService.getInstructorsForSchedule();
      const instructors = Array.isArray(instructorsResponse) ? instructorsResponse : (instructorsResponse.results || []);
      const instructorInfo = instructors.find(inst => inst.id.toString() === instructorId);
      setInstructor(instructorInfo || null);
      return instructorInfo;
    } catch (error: any) {
      console.error('Erreur lors du chargement des informations du moniteur:', error);

      // Fallback pour les moniteurs si l'API échoue
      if (isOwnSchedule && user?.instructor_profile) {
        const instructorInfo = {
          id: user.instructor_profile.id,
          full_name: user.instructor_profile.full_name,
          first_name: user.instructor_profile.first_name,
          last_name: user.instructor_profile.last_name,
          driving_school_name: user.instructor_profile.driving_school_name
        };
        setInstructor(instructorInfo);
        return instructorInfo;
      }

      return null;
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await dashboardService.getStudents();
      setStudents(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des étudiants:', error);
      setStudents([]);
    }
  };

  const fetchVehicles = async () => {
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


      // Recharger les données
      await fetchInstructorSchedule();
      toast.success('Statut mis à jour avec succès');
    } catch (error: any) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      console.error('❌ Détails de l\'erreur:', error.response?.data);

      // Même en cas d'erreur, essayons de recharger les données
      // car parfois l'API met à jour mais retourne une erreur
      try {
        await fetchInstructorSchedule();
        toast.success('Statut mis à jour (avec avertissement)');
      } catch (refreshError) {
        toast.error(error.message || 'Erreur lors de la mise à jour du statut');
      }
    }
  };

  const deleteSchedule = async (scheduleId: number) => {
    try {

      await dashboardService.deleteSchedule(scheduleId);
      await fetchInstructorSchedule();
      toast.success('Séance supprimée avec succès');
    } catch (error: any) {
      console.error('❌ Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la séance');
    }
  };

  // Gestionnaires d'événements FullCalendar
  const handleEventClick = (clickInfo: any) => {
    const schedule = clickInfo.event.extendedProps.schedule;

    // Fermer le tooltip si ouvert
    setShowTooltip(false);

    // Si la séance peut être modifiée (scheduled ou in_progress), afficher le popup d'actions
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
      toast.info(`Séance: ${schedule.student_name} - ${SESSION_TYPES[schedule.session_type]} (${schedule.status})`);
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

  const handleDateSelect = (selectInfo: any) => {
    // Extraire les informations de sélection
    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end);
    const now = new Date();

    // Vérifier si la sélection est dans le passé
    if (startDate < now) {
      toast.error('Impossible de créer une séance dans le passé');
      return;
    }

    const selectedDate = startDate.toISOString().split('T')[0];
    const startTime = startDate.toTimeString().substring(0, 5);
    const endTime = endDate.toTimeString().substring(0, 5);



    // Stocker les informations de sélection
    setSelectedDateInfo({
      date: selectedDate,
      startTime,
      endTime
    });

    setShowModal(true);
  };

  const handleEventDrop = async (dropInfo: any) => {
    const schedule = dropInfo.event.extendedProps.schedule;
    const newDate = dropInfo.event.startStr.split('T')[0];
    const newStartTime = dropInfo.event.startStr.split('T')[1].substring(0, 5);
    const newEndTime = dropInfo.event.endStr.split('T')[1].substring(0, 5);

    // Vérifier si la nouvelle date/heure est dans le passé
    const now = new Date();
    const newDateTime = new Date(`${newDate}T${newStartTime}:00`);

    if (newDateTime < now) {
      dropInfo.revert(); // Annuler le déplacement
      toast.error('Impossible de déplacer une séance dans le passé');
      return;
    }

    try {
      await dashboardService.updateSchedule(schedule.id, {
        ...schedule,
        date: newDate,
        start_time: newStartTime,
        end_time: newEndTime
      });
      await fetchInstructorSchedule();
      toast.success('Séance déplacée avec succès');
    } catch (error: any) {
      dropInfo.revert(); // Annuler le déplacement
      toast.error(error.message || 'Erreur lors du déplacement de la séance');
    }
  };

  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1 + (weekOffset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const getSchedulesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return schedules.filter(schedule => schedule.date === dateString);
  };

  const getSchedulesForDateTime = (date: Date, hour: number) => {
    const dateString = date.toISOString().split('T')[0];
    const daySchedules = schedules.filter(schedule => {
      if (schedule.date !== dateString) return false;
      const startHour = parseInt(schedule.start_time.split(':')[0]);
      const endHour = parseInt(schedule.end_time.split(':')[0]);

      // Afficher la séance si elle commence à cette heure ou si elle s'étend sur cette heure
      return startHour === hour || (startHour < hour && endHour > hour);
    });

    // Debug: log pour voir les séances trouvées
    if (daySchedules.length > 0) {

    }

    return daySchedules;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 5; hour <= 23; hour++) {
      slots.push(hour);
    }
    return slots;
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'no_show': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const weekDates = getCurrentWeekDates();
  const timeSlots = generateTimeSlots();

  // Éviter le loading infini quand on attend la redirection pour un moniteur
  const shouldShowLoading = loading && !(isOwnSchedule && !instructorId);

  if (shouldShowLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si c'est un moniteur sans instructorId, on attend la redirection
  if (isOwnSchedule && !instructorId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirection vers votre planning...</p>
        </div>
      </div>
    );
  }

  // Fonction pour vérifier si une séance peut être terminée
  const canCompleteSession = (schedule: any) => {
    const now = new Date();
    const sessionDate = new Date(schedule.date);
    const [endHour, endMinute] = schedule.end_time.split(':').map(Number);

    // Créer la date/heure de fin de la séance
    const sessionEndTime = new Date(sessionDate);
    sessionEndTime.setHours(endHour, endMinute, 0, 0);

    // Vérifier si l'heure actuelle est après la fin de la séance
    return now >= sessionEndTime;
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
              {selectedEvent.student_name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {SESSION_TYPES[selectedEvent.session_type]}
            </p>
          </div>

          <div className="flex gap-1 flex-wrap">
            {selectedEvent.status === 'cancelled' ? (
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
              {hoveredEvent.student_name}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {SESSION_TYPES[hoveredEvent.session_type]}
            </p>
          </div>

          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Horaire:</span>
              <span className="font-medium">{hoveredEvent.start_time} - {hoveredEvent.end_time}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Moniteur:</span>
              <span className="font-medium">{hoveredEvent.instructor_name}</span>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {!isOwnSchedule && (
            <button
              onClick={() => navigate('/dashboard/instructors')}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Retour aux moniteurs
            </button>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isOwnSchedule ? 'Mon Planning' : `Emploi du temps - ${instructor?.full_name || 'Moniteur'}`}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isOwnSchedule
              ? 'Gérez votre emploi du temps et vos séances'
              : 'Cliquez sur le calendrier pour créer une nouvelle séance'
            }
          </p>
        </div>
      </div>



      {/* Emploi du temps avec FullCalendar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Emploi du temps - {instructor?.full_name || 'Moniteur'}
          </h3>
        </div>

        <div className="p-6">

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement du calendrier...</span>
            </div>
          ) : (
            <div className="fullcalendar-container">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                locale="fr"
                timeZone="local"
                height="auto"
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
            eventDidMount={(info) => {


              const schedule = info.event.extendedProps?.schedule;

              // Vérifier que schedule existe et a un statut
              if (!schedule || !schedule.status) {
                console.warn('⚠️ Schedule ou status manquant:', schedule);
                return;
              }

              // TEMPORAIRE: Désactiver les boutons pour tester la hauteur des événements
              if (false && (schedule.status === 'scheduled' || schedule.status === 'in_progress')) {
                const eventElement = info.el;

                // Créer le conteneur des boutons d'action
                const actionsContainer = document.createElement('div');
                actionsContainer.className = 'event-actions';
                actionsContainer.style.cssText = `
                  position: absolute;
                  top: 2px;
                  right: 2px;
                  display: flex;
                  gap: 2px;
                  z-index: 10;
                `;

                // Bouton Terminer (✅)
                const completeBtn = document.createElement('button');
                completeBtn.innerHTML = '✅';
                completeBtn.title = 'Marquer comme terminée';
                completeBtn.style.cssText = `
                  background: rgba(34, 197, 94, 0.9);
                  border: none;
                  border-radius: 3px;
                  color: white;
                  font-size: 12px;
                  width: 20px;
                  height: 20px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                `;
                completeBtn.onclick = (e) => {
                  e.stopPropagation();
                  updateScheduleStatus(schedule.id, 'completed');
                };

                // Bouton Annuler (❌)
                const cancelBtn = document.createElement('button');
                cancelBtn.innerHTML = '❌';
                cancelBtn.title = 'Annuler la séance';
                cancelBtn.style.cssText = `
                  background: rgba(239, 68, 68, 0.9);
                  border: none;
                  border-radius: 3px;
                  color: white;
                  font-size: 12px;
                  width: 20px;
                  height: 20px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                `;
                cancelBtn.onclick = (e) => {
                  e.stopPropagation();
                  updateScheduleStatus(schedule.id, 'cancelled');
                };

                actionsContainer.appendChild(completeBtn);
                actionsContainer.appendChild(cancelBtn);

                // Ajouter le conteneur à l'événement
                eventElement.style.position = 'relative';
                eventElement.appendChild(actionsContainer);
              }
            }}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            eventClick={handleEventClick}
            eventMouseEnter={handleEventMouseEnter}
            eventMouseLeave={handleEventMouseLeave}
            select={handleDateSelect}
            eventDrop={handleEventDrop}
            eventResize={handleEventDrop}
            allDaySlot={false}
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            snapDuration="00:30:00"
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            nowIndicator={true}
            eventBackgroundColor="#3B82F6"
            eventBorderColor="#1E40AF"
            eventTextColor="#FFFFFF"
            expandRows={true}
            stickyHeaderDates={true}
            eventOverlap={true}
            slotEventOverlap={false}
            dayHeaderFormat={{ weekday: 'long', day: 'numeric', month: 'short' }}
              />
            </div>
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
                  return scheduleDate >= weekDates[0] && scheduleDate <= weekDates[6] && s.status === 'cancelled';
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nouvelle séance */}
      {showModal && (
        <ScheduleModal
          instructorId={instructorId!}
          students={students}
          vehicles={vehicles}
          selectedDateInfo={selectedDateInfo}
          onClose={() => {
            setShowModal(false);
            setSelectedDateInfo(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setSelectedDateInfo(null);
            fetchInstructorSchedule();
          }}
        />
      )}

      {/* Popup d'actions */}
      <ActionPopup />

      {/* Tooltip au hover */}
      <EventTooltip />
    </div>
  );
};

// Composant Modal pour créer une séance
interface ScheduleModalProps {
  instructorId: string;
  students: StudentList[];
  vehicles: VehicleList[];
  selectedDateInfo?: {
    date: string;
    startTime: string;
    endTime: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  instructorId,
  students,
  vehicles,
  selectedDateInfo,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<ScheduleCreate>({
    student: 0,
    instructor: parseInt(instructorId),
    vehicle: null,
    date: selectedDateInfo?.date || '',
    start_time: selectedDateInfo?.startTime || '',
    end_time: selectedDateInfo?.endTime || '',
    session_type: 'theory',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{ available: boolean; conflicts?: any[] } | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Fonction pour gérer la sélection automatique du véhicule
  const getAvailableVehicles = () => {
    return vehicles.filter(vehicle =>
      vehicle.assigned_instructor === parseInt(instructorId)
    );
  };

  const handleInstructorChange = (instructorId: string) => {
    if (instructorId) {
      const availableVehicles = getAvailableVehicles();

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
    handleInstructorChange(instructorId);
  }, [vehicles, instructorId]);

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

    // Si la vérification n'a pas été faite, la faire maintenant
    if (!availabilityChecked && formData.student && formData.date && formData.start_time && formData.end_time) {
      toast.error('Vérification de disponibilité en cours...');
      await checkAvailabilityAuto();
      return;
    }

    setLoading(true);

    try {
      await dashboardService.createSchedule(formData);
      toast.success('Séance créée avec succès');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de la séance');
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
        student_id: formData.student ? parseInt(formData.student as string) : undefined,
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
          {/* Étudiant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Étudiant *
            </label>
            <select
              value={formData.student}
              onChange={(e) => setFormData({ ...formData, student: parseInt(e.target.value) })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>Sélectionner un étudiant</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name}
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
              <option value="theory">Code</option>
              <option value="practical">Conduite</option>
            </select>
          </div>

          {/* Véhicule */}
          {availableVehicles.length > 0 && (
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

export default InstructorSchedulePage;
