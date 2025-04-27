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
import { GanttChartEntry, ProcessStats } from '../../services/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ResponseTimeBarChartProps {
  processStats: ProcessStats[];
  ganttChart: GanttChartEntry[];
}

const ResponseTimeBarChart: React.FC<ResponseTimeBarChartProps> = ({ processStats, ganttChart }) => {
  // Calculate response time for each process (first time process gets CPU - arrival time)
  const calculateResponseTimes = () => {
    const responseTimes = new Map<number, number>();
    const sortedGantt = [...ganttChart].sort((a, b) => a.start_time - b.start_time);
    
    // Get first appearance of each process in gantt chart
    processStats.forEach(process => {
      const firstExecution = sortedGantt.find(entry => entry.process_id === process.process_id);
      if (firstExecution) {
        const responseTime = firstExecution.start_time - process.arrival_time;
        responseTimes.set(process.process_id, responseTime);
      }
    });
    
    return responseTimes;
  };

  const responseTimes = calculateResponseTimes();
  const sortedStats = [...processStats].sort((a, b) => a.process_id - b.process_id);
  
  const data = {
    labels: sortedStats.map(process => `P${process.process_id}`),
    datasets: [
      {
        label: 'Response Time',
        data: sortedStats.map(process => responseTimes.get(process.process_id) || 0),
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
        text: 'Response Time by Process',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Response Time: ${context.raw} time units`,
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

export default ResponseTimeBarChart;