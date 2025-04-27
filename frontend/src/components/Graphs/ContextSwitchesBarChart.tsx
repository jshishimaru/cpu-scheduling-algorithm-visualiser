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
import { GanttChartEntry } from '../../services/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ContextSwitchesBarChartProps {
  ganttChart: GanttChartEntry[];
  algorithmName: string;
}

const ContextSwitchesBarChart: React.FC<ContextSwitchesBarChartProps> = ({ 
  ganttChart, 
  algorithmName 
}) => {
  // Calculate context switches
  const calculateContextSwitches = () => {
    if (ganttChart.length <= 1) return 0;
    
    let switches = 0;
    for (let i = 1; i < ganttChart.length; i++) {
      // If the current process is different from the previous one, it's a context switch
      if (ganttChart[i].process_id !== ganttChart[i-1].process_id && ganttChart[i].process_id >= 0) {
        switches++;
      }
    }
    
    return switches;
  };
  
  const contextSwitches = calculateContextSwitches();
  
  const data = {
    labels: [algorithmName],
    datasets: [
      {
        label: 'Context Switches',
        data: [contextSwitches],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
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
        text: 'Context Switches Analysis',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Context Switches: ${context.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Switches',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <Bar data={data} options={options} />
      <div className="text-center mt-4 font-semibold text-pink-600">
        Total Context Switches: {contextSwitches}
      </div>
    </div>
  );
};

export default ContextSwitchesBarChart;