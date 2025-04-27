import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ProcessStats } from '../../services/types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TurnaroundTimeBarChartProps {
  processStats: ProcessStats[];
}

const TurnaroundTimeBarChart: React.FC<TurnaroundTimeBarChartProps> = ({ processStats }) => {
  // Sort processes by ID for consistent display
  const sortedStats = [...processStats].sort((a, b) => a.process_id - b.process_id);
  
  const data = {
    labels: sortedStats.map(process => `P${process.process_id}`),
    datasets: [
      {
        label: 'Turnaround Time',
        data: sortedStats.map(process => process.turnaround_time),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Turnaround Time by Process',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Turnaround Time: ${context.raw} time units`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Time Units',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Process ID',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <Bar data={data} options={options} />
    </div>
  );
};

export default TurnaroundTimeBarChart;