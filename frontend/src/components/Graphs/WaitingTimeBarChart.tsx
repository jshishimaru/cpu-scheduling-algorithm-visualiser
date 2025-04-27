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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WaitingTimeBarChartProps {
  processStats: ProcessStats[];
}

const WaitingTimeBarChart: React.FC<WaitingTimeBarChartProps> = ({ processStats }) => {
  // Sort processes by ID for consistent display
  const sortedStats = [...processStats].sort((a, b) => a.process_id - b.process_id);
  
  const data = {
    labels: sortedStats.map(process => `P${process.process_id}`),
    datasets: [
      {
        label: 'Waiting Time',
        data: sortedStats.map(process => process.waiting_time),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
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
        text: 'Waiting Time by Process',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Waiting Time: ${context.raw} time units`,
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

export default WaitingTimeBarChart;