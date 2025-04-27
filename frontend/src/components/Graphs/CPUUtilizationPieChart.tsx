import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { GanttChartEntry } from '../../services/types';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface CPUUtilizationPieChartProps {
  ganttChart: GanttChartEntry[];
  totalExecutionTime: number;
}

const CPUUtilizationPieChart: React.FC<CPUUtilizationPieChartProps> = ({ 
  ganttChart, 
  totalExecutionTime 
}) => {
  // Calculate CPU utilization
  const calculateCPUUtilization = () => {
    // Sum of all process execution times
    let busyTime = 0;
    ganttChart.forEach(entry => {
        if (entry.process_id >= 0) {
            busyTime += entry.end_time - entry.start_time;
        }
    });
    
    const busyPercentage = (busyTime / totalExecutionTime) * 100;
    const idlePercentage = 100 - busyPercentage;
    
    return {
      busyPercentage: Math.round(busyPercentage * 100) / 100,
      idlePercentage: Math.round(idlePercentage * 100) / 100
    };
  };
  
  const { busyPercentage, idlePercentage } = calculateCPUUtilization();
  
  const data = {
    labels: ['CPU Busy', 'CPU Idle'],
    datasets: [
      {
        data: [busyPercentage, idlePercentage],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
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
        text: 'CPU Utilization',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.raw}%`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <Pie data={data} options={options} />
      <div className="text-center mt-4 font-semibold text-blue-600">
        CPU Utilization: {busyPercentage}%
      </div>
    </div>
  );
};

export default CPUUtilizationPieChart;