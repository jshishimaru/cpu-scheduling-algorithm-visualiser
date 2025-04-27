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

interface ThroughputBarChartProps {
  processStats: ProcessStats[];
  totalExecutionTime: number;
  algorithmName: string;
}

const ThroughputBarChart: React.FC<ThroughputBarChartProps> = ({ 
  processStats, 
  totalExecutionTime,
  algorithmName
}) => {
  // Calculate throughput (processes per unit time)
  const calculateThroughput = () => {
    if (totalExecutionTime === 0) return 0;
    return processStats.length / totalExecutionTime;
  };
  
  const throughput = calculateThroughput();
  
  // For comparison if we have multiple algorithms
  const data = {
    labels: [algorithmName],
    datasets: [
      {
        label: 'Throughput (processes/time unit)',
        data: [throughput],
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgba(255, 206, 86, 1)',
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
        text: 'Throughput Analysis',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Throughput: ${context.raw.toFixed(4)} processes/time unit`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Processes / Time Unit',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <Bar data={data} options={options} />
      <div className="text-center mt-4">
        <div className="font-semibold text-yellow-600">
          Processes completed: {processStats.length}
        </div>
        <div className="font-semibold text-yellow-600">
          Total Execution Time: {totalExecutionTime} time units
        </div>
        <div className="font-semibold text-yellow-800 text-lg mt-2">
          Throughput: {throughput.toFixed(4)} processes/time unit
        </div>
      </div>
    </div>
  );
};

export default ThroughputBarChart;