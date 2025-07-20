import React from 'react';
import StatsChart from './StatsChart';

interface RevenueChartProps {
  monthlyRevenue: number[];
  months: string[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  monthlyRevenue,
  months,
}) => {
  const data = {
    labels: months,
    datasets: [
      {
        label: 'Revenus (DT)',
        data: monthlyRevenue,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value + ' DT';
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Revenus: ${context.parsed.y} DT`;
          },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <StatsChart
        type="line"
        data={data}
        options={options}
        title="Évolution des Revenus"
      />
    </div>
  );
};

export default RevenueChart;
