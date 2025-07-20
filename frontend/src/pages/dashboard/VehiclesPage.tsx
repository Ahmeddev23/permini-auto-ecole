import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { dashboardService } from '../../services/dashboardService';
import { VehicleList, VEHICLE_TYPES, VEHICLE_STATUS } from '../../types/vehicle';
import { InstructorList } from '../../types/instructor';
import VehicleModal from '../../components/dashboard/VehicleModal';
import { usePlanPermissions } from '../../hooks/usePlanPermissions';
import { useLanguage } from '../../contexts/LanguageContext';
import { useModal } from '../../contexts/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import PlanRestriction from '../../components/common/PlanRestriction';
import VehicleReminders from '../../components/vehicles/VehicleReminders';
import InlineDateEditor from '../../components/vehicles/InlineDateEditor';

const VehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isVehicleModalOpen, closeVehicleModal } = useModal();
  const [vehicles, setVehicles] = useState<VehicleList[]>([]);
  const [instructors, setInstructors] = useState<InstructorList[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'reminders'>('vehicles');
  const { hasFeature, getRequiredPlan, permissions } = usePlanPermissions();

  // Fonction pour vérifier les expirations
  const getExpirationWarnings = (vehicle: VehicleList) => {
    const warnings = [];
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Vérifier l'expiration de l'assurance
    if (vehicle.insurance_expiry) {
      const insuranceDate = new Date(vehicle.insurance_expiry);
      if (insuranceDate <= sevenDaysFromNow && insuranceDate >= today) {
        const daysLeft = Math.ceil((insuranceDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        warnings.push({
          type: 'insurance',
          message: `Assurance expire dans ${daysLeft} jour(s)`,
          urgent: daysLeft <= 3
        });
      }
    }

    // Vérifier l'expiration de la visite technique
    if (vehicle.technical_inspection_expiry) {
      const inspectionDate = new Date(vehicle.technical_inspection_expiry);
      if (inspectionDate <= sevenDaysFromNow && inspectionDate >= today) {
        const daysLeft = Math.ceil((inspectionDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        warnings.push({
          type: 'inspection',
          message: `Visite technique expire dans ${daysLeft} jour(s)`,
          urgent: daysLeft <= 3
        });
      }
    }

    return warnings;
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleList | null>(null);

  useEffect(() => {
    fetchVehicles();
    fetchInstructors();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getVehicles();

      setVehicles(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des véhicules');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const data = await dashboardService.getInstructors();
      setInstructors(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des instructeurs:', error);
      setInstructors([]);
    }
  };

  const handleCreateVehicle = () => {
    setEditingVehicle(null);
    setShowModal(true);
  };

  const handleEditVehicle = (vehicle: VehicleList) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const handleDeleteVehicle = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      return;
    }

    try {
      await dashboardService.deleteVehicle(id);
      toast.success('Véhicule supprimé avec succès');
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleAssignmentChange = async (vehicleId: number, instructorId: number | null) => {
    try {
      await dashboardService.assignVehicleInstructor(vehicleId, instructorId);
      toast.success('Assignation mise à jour avec succès');
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'assignation');
    }
  };

  const handleUpdateVehicleDate = async (vehicleId: number, dateType: 'insurance' | 'technical', newDate: string) => {
    try {
      const updateData = dateType === 'insurance'
        ? { insurance_expiry_date: newDate }
        : { technical_inspection_date: newDate };

      await dashboardService.updateVehicleDates(vehicleId, updateData);

      // Mettre à jour la liste des véhicules
      await fetchVehicles();

      // Actualiser les rappels urgents dans la sidebar si nécessaire
      window.dispatchEvent(new CustomEvent('vehicleDatesUpdated'));

      // Pas besoin de toast ici car le composant InlineDateEditor s'en charge
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la date:', error);
      throw error; // Relancer l'erreur pour que le composant InlineDateEditor puisse la gérer
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingVehicle(null);
  };

  const handleModalSuccess = () => {
    fetchVehicles();
    handleModalClose();
  };

  // Filtrage des véhicules
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesType = typeFilter === 'all' || vehicle.vehicle_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'A': return '🏍️';
      case 'B': return '🚗';
      case 'C': return '🚛';
      case 'D': return '🚌';
      default: return '🚗';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // La gestion des véhicules est maintenant disponible pour tous les plans

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.user_type === 'instructor' ? 'Mes Véhicules' : 'Gestion des Véhicules'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {user?.user_type === 'instructor'
              ? 'Véhicules qui vous sont assignés'
              : 'Gérez votre flotte de véhicules d\'auto-école'
            }
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/vehicle-expenses')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
            Dépenses
            {!permissions?.canManageFinances && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                Premium
              </span>
            )}
          </motion.button>

          {user?.user_type !== 'instructor' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateVehicle}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Ajouter un véhicule
            </motion.button>
          )}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{vehicles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold">✓</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Actifs</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {vehicles.filter(v => v.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Maintenance</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {vehicles.filter(v => v.status === 'maintenance').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-semibold">✕</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inactifs</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {vehicles.filter(v => v.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(VEHICLE_STATUS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Tous les types</option>
            {Object.entries(VEHICLE_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FunnelIcon className="h-4 w-4 mr-1" />
            {filteredVehicles.length} véhicule(s)
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vehicles'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Véhicules ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'reminders'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Rappels d'échéances
            {(() => {
              const urgentCount = vehicles.filter(vehicle => {
                const today = new Date().getTime();

                // Vérifier l'assurance
                const insuranceDate = new Date(vehicle.insurance_expiry_date);
                const insuranceDays = vehicle.insurance_expiry_date && !isNaN(insuranceDate.getTime())
                  ? Math.ceil((insuranceDate.getTime() - today) / (1000 * 60 * 60 * 24))
                  : 999;

                // Vérifier la visite technique
                const technicalDate = new Date(vehicle.technical_inspection_date);
                const technicalDays = vehicle.technical_inspection_date && !isNaN(technicalDate.getTime())
                  ? Math.ceil((technicalDate.getTime() - today) / (1000 * 60 * 60 * 24))
                  : 999;

                return insuranceDays <= 7 || technicalDays <= 7;
              }).length;

              return urgentCount > 0 ? (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                  {urgentCount}
                </span>
              ) : null;
            })()}
          </button>
        </nav>
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'vehicles' && (
        <>
          {/* Tableau des véhicules */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Véhicule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Matriculation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Moniteur assigné
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Assurance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Visite technique
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredVehicles.map((vehicle) => (
                <motion.tr
                  key={vehicle.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {vehicle.photo ? (
                        <img
                          src={vehicle.photo}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="h-12 w-12 rounded-lg object-cover mr-3"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-2xl">{getTypeIcon(vehicle.vehicle_type)}</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {vehicle.brand} {vehicle.model}
                          </span>
                          {getExpirationWarnings(vehicle).map((warning, index) => (
                            <span
                              key={index}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                warning.urgent
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                              }`}
                              title={warning.message}
                            >
                              {warning.type === 'insurance' ? '🛡️' : '🔧'}
                              {warning.urgent ? '!' : ''}
                            </span>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {vehicle.year} • {vehicle.color}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {VEHICLE_TYPES[vehicle.vehicle_type]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {vehicle.license_plate}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                      {VEHICLE_STATUS[vehicle.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <InstructorAssignment
                      vehicle={vehicle}
                      instructors={instructors}
                      onAssignmentChange={handleAssignmentChange}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <InlineDateEditor
                      value={vehicle.insurance_expiry_date}
                      onSave={(newDate) => handleUpdateVehicleDate(vehicle.id, 'insurance', newDate)}
                      label="Date d'expiration de l'assurance"
                      vehicleInfo={`${vehicle.brand} ${vehicle.model} (${vehicle.license_plate})`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <InlineDateEditor
                      value={vehicle.technical_inspection_date}
                      onSave={(newDate) => handleUpdateVehicleDate(vehicle.id, 'technical', newDate)}
                      label="Date de visite technique"
                      vehicleInfo={`${vehicle.brand} ${vehicle.model} (${vehicle.license_plate})`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/dashboard/vehicles/${vehicle.id}`)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Voir"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun véhicule</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Aucun véhicule ne correspond aux critères de recherche.'
                : user?.user_type === 'instructor'
                  ? 'Aucun véhicule ne vous a été assigné. Contactez votre auto-école pour l\'assignation de véhicules.'
                  : 'Commencez par ajouter votre premier véhicule.'
              }
            </p>
          </div>
        )}
      </div>
        </>
      )}

      {/* Onglet Rappels */}
      {activeTab === 'reminders' && (
        <VehicleReminders vehicles={vehicles} />
      )}

      {/* Modal */}
      {(showModal || isVehicleModalOpen) && (
        <VehicleModal
          isOpen={showModal || isVehicleModalOpen}
          onClose={() => {
            setShowModal(false);
            closeVehicleModal();
          }}
          onSuccess={() => {
            setShowModal(false);
            closeVehicleModal();
            fetchVehicles();
          }}
          vehicle={editingVehicle}
        />
      )}
    </div>
  );
};

// Composant pour l'assignation des moniteurs
interface InstructorAssignmentProps {
  vehicle: VehicleList;
  instructors: InstructorList[];
  onAssignmentChange: (vehicleId: number, instructorId: number | null) => void;
}

const InstructorAssignment: React.FC<InstructorAssignmentProps> = ({ vehicle, instructors, onAssignmentChange }) => {

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const instructorId = e.target.value ? parseInt(e.target.value) : null;
    onAssignmentChange(vehicle.id, instructorId);
  };

  return (
    <select
      value={vehicle.assigned_instructor || ''}
      onChange={handleAssignmentChange}
      className="text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
    >
      <option value="">Aucun moniteur</option>
      {instructors.map((instructor) => (
        <option key={instructor.id} value={instructor.id}>
          {instructor.full_name}
        </option>
      ))}
    </select>
  );
};

export default VehiclesPage;
