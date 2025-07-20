import React from 'react';
import StatsChart from './StatsChart';

interface SessionStatsChartProps {
  completedSessions: number;
  scheduledSessions: number;
  cancelledSessions: number;
}

const SessionStatsChart: React.FC<SessionStatsChartProps> = ({
  completedSessions,
  scheduledSessions,
  cancelledSessions,
}) => {
  const data = {
    labels: ['Terminées', 'Programmées', 'Annulées'],
    datasets: [
      {
        data: [completedSessions, scheduledSessions, cancelledSessions],
        backgroundColor: [
          '#10B981', // Green for completed
          '#3B82F6', // Blue for scheduled
          '#EF4444', // Red for cancelled
        ],
        borderColor: [
          '#059669',
          '#2563EB',
          '#DC2626',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="h-64">
      <StatsChart
        type="doughnut"
        data={data}
        options={options}
        title="Répartition des Séances"
      />
    </div>
  );
};

export default SessionStatsChart;
