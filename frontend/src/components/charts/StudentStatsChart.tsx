import React from 'react';
import StatsChart from './StatsChart';

interface StudentStatsChartProps {
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  pendingStudents: number;
}

const StudentStatsChart: React.FC<StudentStatsChartProps> = ({
  totalStudents,
  activeStudents,
  completedStudents,
  pendingStudents,
}) => {
  const data = {
    labels: ['Actifs', 'Terminés', 'En attente'],
    datasets: [
      {
        data: [activeStudents, completedStudents, pendingStudents],
        backgroundColor: [
          '#10B981', // Green for active
          '#3B82F6', // Blue for completed
          '#F59E0B', // Yellow for pending
        ],
        borderColor: [
          '#059669',
          '#2563EB',
          '#D97706',
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
        title="Répartition des Candidats"
      />
    </div>
  );
};

export default StudentStatsChart;
