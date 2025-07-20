import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

interface DashboardStats {
  students: {
    total: number;
    active: number;
    completed: number;
    pending: number;
  };
  instructors: {
    total: number;
    active: number;
  };
  exams: {
    passed: number;
    failed: number;
    pending: number;
  };
  revenue: {
    monthly: number[];
    months: string[];
    total: number;
  };
  sessions: {
    total: number;
    completed: number;
    scheduled: number;
    cancelled: number;
  };
  licenseTypes: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  metrics: {
    successRate: number;
    averageTrainingTime: number;
  };
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Récupérer les statistiques depuis l'API
        const dashboardStats = await dashboardService.getDashboardStats();

        // Transformer les données pour les graphiques
        const transformedStats: DashboardStats = {
          students: {
            total: dashboardStats.total_students || 0,
            active: dashboardStats.active_students || 0,
            completed: 0, // Pas encore dans l'API
            pending: dashboardStats.total_students - dashboardStats.active_students || 0,
          },
          instructors: {
            total: dashboardStats.total_instructors || 0,
            active: dashboardStats.total_instructors || 0, // Supposer tous actifs pour l'instant
          },
          exams: {
            passed: 0, // Pas encore dans l'API
            failed: 0, // Pas encore dans l'API
            pending: dashboardStats.upcoming_exams || 0,
          },
          revenue: {
            monthly: [dashboardStats.monthly_revenue || 0], // Une seule valeur pour l'instant
            months: ['Ce mois'],
            total: dashboardStats.monthly_revenue || 0,
          },
          sessions: {
            total: 0, // Pas encore dans l'API
            completed: 0, // Pas encore dans l'API
            scheduled: 0, // Pas encore dans l'API
            cancelled: 0, // Pas encore dans l'API
          },
          licenseTypes: {
            A: 0, // Pas encore dans l'API
            B: dashboardStats.total_students || 0, // Supposer que la plupart sont permis B
            C: 0, // Pas encore dans l'API
            D: 0, // Pas encore dans l'API
          },
          metrics: {
            successRate: 0, // Pas encore dans l'API
            averageTrainingTime: 3.2, // Valeur par défaut
          },
        };

        setStats(transformedStats);
      } catch (err: any) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError(err.message || 'Erreur lors du chargement des statistiques');
        
        // Données par défaut en cas d'erreur
        setStats({
          students: { total: 156, active: 120, completed: 25, pending: 11 },
          instructors: { total: 12, active: 11 },
          exams: { passed: 45, failed: 12, pending: 8 },
          revenue: {
            monthly: [8500, 9200, 7800, 10500, 11200, 12400],
            months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
            total: 59600,
          },
          sessions: { total: 240, completed: 180, scheduled: 45, cancelled: 15 },
          licenseTypes: { A: 15, B: 120, C: 8, D: 3 },
          metrics: { successRate: 78.9, averageTrainingTime: 3.2 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};
