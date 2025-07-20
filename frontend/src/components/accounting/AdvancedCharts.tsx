import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { Card } from '../common/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FinancialSummary {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  monthly_data: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
  expense_by_category: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  revenue_by_category: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

interface AdvancedChartsProps {
  summary: FinancialSummary;
}

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ summary }) => {
  // Configuration des couleurs
  const colors = {
    primary: '#3B82F6',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#06B6D4',
    purple: '#8B5CF6',
    pink: '#EC4899',
    indigo: '#6366F1'
  };

  // Données pour le graphique d'évolution mensuelle
  const monthlyChartData = {
    labels: summary.monthly_data.map(item => item.month),
    datasets: [
      {
        label: 'Revenus',
        data: summary.monthly_data.map(item => item.revenue),
        backgroundColor: colors.success + '20',
        borderColor: colors.success,
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Dépenses',
        data: summary.monthly_data.map(item => item.expenses),
        backgroundColor: colors.danger + '20',
        borderColor: colors.danger,
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Bénéfice',
        data: summary.monthly_data.map(item => item.profit),
        backgroundColor: colors.primary + '20',
        borderColor: colors.primary,
        borderWidth: 3,
        fill: false,
        tension: 0.4
      }
    ]
  };

  // Données pour le graphique en barres comparatif
  const comparisonChartData = {
    labels: summary.monthly_data.map(item => item.month),
    datasets: [
      {
        label: 'Revenus',
        data: summary.monthly_data.map(item => item.revenue),
        backgroundColor: colors.success,
        borderRadius: 4
      },
      {
        label: 'Dépenses',
        data: summary.monthly_data.map(item => item.expenses),
        backgroundColor: colors.danger,
        borderRadius: 4
      }
    ]
  };

  // Données pour le graphique en secteurs des dépenses
  const expensesPieData = {
    labels: summary.expense_by_category.map(item => item.category),
    datasets: [
      {
        data: summary.expense_by_category.map(item => item.amount),
        backgroundColor: [
          colors.danger,
          colors.warning,
          colors.info,
          colors.purple,
          colors.pink,
          colors.indigo,
          '#F97316',
          '#84CC16'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // Données pour le graphique en secteurs des revenus
  const revenuePieData = {
    labels: summary.revenue_by_category.map(item => item.category),
    datasets: [
      {
        data: summary.revenue_by_category.map(item => item.amount),
        backgroundColor: [
          colors.success,
          colors.primary,
          colors.info,
          colors.purple,
          colors.pink,
          colors.indigo
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // Options communes pour les graphiques
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    }
  };

  const lineChartOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value: any) {
            return value + ' DT';
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' DT';
          }
        }
      }
    }
  };

  const pieChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return context.label + ': ' + context.parsed.toFixed(2) + ' DT (' + percentage + '%)';
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Évolution mensuelle */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Évolution financière mensuelle
          </h3>
          <div className="h-80">
            <Line data={monthlyChartData} options={lineChartOptions} />
          </div>
        </div>
      </Card>

      {/* Comparaison revenus/dépenses */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Comparaison revenus vs dépenses
          </h3>
          <div className="h-80">
            <Bar data={comparisonChartData} options={lineChartOptions} />
          </div>
        </div>
      </Card>

      {/* Graphiques en secteurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Répartition des dépenses
            </h3>
            <div className="h-80">
              <Doughnut data={expensesPieData} options={pieChartOptions} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Répartition des revenus
            </h3>
            <div className="h-80">
              <Pie data={revenuePieData} options={pieChartOptions} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedCharts;
