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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AlgorithmMetrics {
  name: string;
  avgTurnaroundTime: number;
  avgWaitingTime: number;
  avgResponseTime: number;
}

interface AverageMetricsComparisonProps {
  algorithmsMetrics: AlgorithmMetrics[];
}

const AverageMetricsComparison: React.FC<AverageMetricsComparisonProps> = ({ 
  algorithmsMetrics 
}) => {
  const data = {
    labels: algorithmsMetrics.map(metric => metric.name),
    datasets: [
      {
        label: 'Avg. Turnaround Time',
        data: algorithmsMetrics.map(metric => metric.avgTurnaroundTime),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Avg. Waiting Time',
        data: algorithmsMetrics.map(metric => metric.avgWaitingTime),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
      {
        label: 'Avg. Response Time',
        data: algorithmsMetrics.map(metric => metric.avgResponseTime),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
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
        text: 'Average Metrics Comparison Across Algorithms',
        font: {
          size: 16,
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
          text: 'Scheduling Algorithm',
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

export default AverageMetricsComparison;