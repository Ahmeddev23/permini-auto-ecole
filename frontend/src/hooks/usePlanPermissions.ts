import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../contexts/AuthContext';

interface PlanPermissions {
  canManageVehicles: boolean;
  canAccessAdvancedStats: boolean;
  canManageFinances: boolean;
  canAccessPrioritySupport: boolean;
  canUseMessaging: boolean;
  canExportData: boolean;
  maxStudents: number;
  currentPlan: string;
  daysRemaining: number;
  isExpired: boolean;
  // Enhanced plan details from database
  planDetails?: {
    displayName: string;
    price: number;
    features: Record<string, boolean>;
  };
}

export const usePlanPermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<PlanPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!user) return; // Attendre que l'utilisateur soit chargé

    // Réinitialiser fetched si l'utilisateur change
    setFetched(false);

    const fetchPermissions = async () => {
      if (fetched) return; // Éviter les appels multiples pour le même utilisateur

      try {
        setLoading(true);
        setFetched(true);

        // Utiliser l'endpoint approprié selon le type d'utilisateur
        let subscriptionData;
        if (user?.user_type === 'instructor' || user?.user_type === 'student') {
          // Moniteurs et étudiants utilisent le même endpoint qui fonctionne
          subscriptionData = await dashboardService.getInstructorSubscriptionInfo();
        } else {
          subscriptionData = await dashboardService.getSubscriptionInfo();
        }

        // Use enhanced plan details if available, fallback to legacy logic
        const planDetails = subscriptionData.plan_details;
        const features = planDetails?.features || {};

        const planPermissions: PlanPermissions = {
          currentPlan: subscriptionData.current_plan,
          daysRemaining: subscriptionData.days_remaining,
          isExpired: subscriptionData.is_plan_expired,
          maxStudents: subscriptionData.max_accounts,
          // Use database features if available, fallback to legacy logic
          canManageVehicles: features.can_manage_vehicles ?? ['free', 'standard', 'premium'].includes(subscriptionData.current_plan),
          canAccessAdvancedStats: features.can_access_advanced_stats ?? (subscriptionData.current_plan === 'premium'),
          canManageFinances: features.can_manage_finances ?? (subscriptionData.current_plan === 'premium'),
          canAccessPrioritySupport: features.can_access_priority_support ?? ['standard', 'premium'].includes(subscriptionData.current_plan),
          canUseMessaging: features.can_use_messaging ?? (subscriptionData.current_plan === 'premium'),
          canExportData: features.can_export_data ?? true,
          // Enhanced plan details
          planDetails: planDetails ? {
            displayName: planDetails.display_name,
            price: planDetails.price,
            features: planDetails.features
          } : undefined
        };
        
        setPermissions(planPermissions);
      } catch (err: any) {
        console.error('Erreur lors du chargement des permissions:', err);
        setError(err.message);
        
        // Permissions par défaut en cas d'erreur (plan standard)
        setPermissions({
          currentPlan: 'standard',
          daysRemaining: 0,
          isExpired: true,
          maxStudents: 200, // Updated to match current Standard plan
          canManageVehicles: true,
          canAccessAdvancedStats: false,
          canManageFinances: false,
          canAccessPrioritySupport: true, // Standard has support
          canUseMessaging: false,
          canExportData: true,
          planDetails: {
            displayName: 'Standard',
            price: 49,
            features: {
              can_manage_vehicles: true,
              can_access_advanced_stats: false,
              can_manage_finances: false,
              can_access_priority_support: true,
              can_use_messaging: false,
              can_export_data: true
            }
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  const hasFeature = useCallback((feature: string): boolean => {
    if (!permissions) return false;

    switch (feature) {
      case 'vehicles':
        return permissions.canManageVehicles;
      case 'vehicle_expenses':
        return permissions.canManageFinances; // Même permission que finances
      case 'advanced_stats':
        return permissions.canAccessAdvancedStats;
      case 'finances':
        return permissions.canManageFinances;
      case 'priority_support':
        return permissions.canAccessPrioritySupport;
      default:
        return true; // Fonctionnalités de base disponibles pour tous
    }
  }, [permissions]);

  const getRequiredPlan = (feature: string): 'standard' | 'premium' => {
    switch (feature) {
      case 'priority_support':
        return 'standard';
      case 'advanced_stats':
      case 'finances':
      case 'vehicle_expenses':
        return 'premium';
      default:
        return 'standard';
    }
  };

  return {
    permissions,
    loading,
    error,
    hasFeature,
    getRequiredPlan,
  };
};
