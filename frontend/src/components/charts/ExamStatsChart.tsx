import React from 'react';
import StatsChart from './StatsChart';

interface ExamStatsChartProps {
  passedExams: number;
  failedExams: number;
  pendingExams: number;
}

const ExamStatsChart: React.FC<ExamStatsChartProps> = ({
  passedExams,
  failedExams,
  pendingExams,
}) => {
  const data = {
    labels: ['Réussis', 'Échoués', 'En attente'],
    datasets: [
      {
        label: 'Examens',
        data: [passedExams, failedExams, pendingExams],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // Green for passed
          'rgba(239, 68, 68, 0.8)',  // Red for failed
          'rgba(245, 158, 11, 0.8)', // Yellow for pending
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="h-64">
      <StatsChart
        type="bar"
        data={data}
        options={options}
        title="Résultats des Examens"
      />
    </div>
  );
};

export default ExamStatsChart;
