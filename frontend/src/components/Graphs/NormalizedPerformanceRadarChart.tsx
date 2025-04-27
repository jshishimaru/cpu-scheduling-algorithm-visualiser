import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface AlgorithmPerformance {
  name: string;
  metrics: {
    avgTurnaroundTime: number;
    avgWaitingTime: number;
    avgResponseTime: number;
    throughput: number;
    cpuUtilization: number;
    contextSwitches: number;
  };
}

interface NormalizedPerformanceRadarChartProps {
  algorithmsPerformance: AlgorithmPerformance[];
}

const NormalizedPerformanceRadarChart: React.FC<NormalizedPerformanceRadarChartProps> = ({ 
  algorithmsPerformance 
}) => {
  // Normalize metrics for better radar chart visualization
  // Lower is better for turnaround, waiting, response times, and context switches
  // Higher is better for throughput and CPU utilization
  const normalizeMetrics = () => {
    if (algorithmsPerformance.length === 0) return [];
    
    // Find the max and min values for each metric
    const maxValues = {
      avgTurnaroundTime: Math.max(...algorithmsPerformance.map(a => a.metrics.avgTurnaroundTime)),
      avgWaitingTime: Math.max(...algorithmsPerformance.map(a => a.metrics.avgWaitingTime)),
      avgResponseTime: Math.max(...algorithmsPerformance.map(a => a.metrics.avgResponseTime)),
      throughput: Math.max(...algorithmsPerformance.map(a => a.metrics.throughput)),
      cpuUtilization: Math.max(...algorithmsPerformance.map(a => a.metrics.cpuUtilization)),
      contextSwitches: Math.max(...algorithmsPerformance.map(a => a.metrics.contextSwitches)),
    };
    
    // Normalize values (0-1 range where 1 is better performance)
    return algorithmsPerformance.map(algo => {
      const normalizedMetrics = {
        // For metrics where lower is better, normalize and invert (1 - normalized value)
        avgTurnaroundTime: maxValues.avgTurnaroundTime ? 
          1 - (algo.metrics.avgTurnaroundTime / maxValues.avgTurnaroundTime) : 0,
        avgWaitingTime: maxValues.avgWaitingTime ? 
          1 - (algo.metrics.avgWaitingTime / maxValues.avgWaitingTime) : 0,
        avgResponseTime: maxValues.avgResponseTime ? 
          1 - (algo.metrics.avgResponseTime / maxValues.avgResponseTime) : 0,
        contextSwitches: maxValues.contextSwitches ? 
          1 - (algo.metrics.contextSwitches / maxValues.contextSwitches) : 0,
        
        // For metrics where higher is better, normalize directly
        throughput: maxValues.throughput ? 
          algo.metrics.throughput / maxValues.throughput : 0,
        cpuUtilization: maxValues.cpuUtilization ? 
          algo.metrics.cpuUtilization / maxValues.cpuUtilization : 0,
      };
      
      return {
        name: algo.name,
        normalizedMetrics,
      };
    });
  };
  
  const normalizedAlgorithms = normalizeMetrics();
  
  // Create a random color for each algorithm
  const getRandomColor = (index: number) => {
    const colors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
    ];
    
    return colors[index % colors.length];
  };
  
  const data = {
    labels: [
      'Turnaround Time',
      'Waiting Time',
      'Response Time',
      'Throughput',
      'CPU Utilization',
      'Context Switches',
    ],
    datasets: normalizedAlgorithms.map((algo, index) => ({
      label: algo.name,
      data: [
        algo.normalizedMetrics.avgTurnaroundTime * 100,
        algo.normalizedMetrics.avgWaitingTime * 100,
        algo.normalizedMetrics.avgResponseTime * 100,
        algo.normalizedMetrics.throughput * 100,
        algo.normalizedMetrics.cpuUtilization * 100,
        algo.normalizedMetrics.contextSwitches * 100,
      ],
      backgroundColor: getRandomColor(index).replace('0.6', '0.2'),
      borderColor: getRandomColor(index).replace('0.6', '1'),
      borderWidth: 2,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Normalized Performance Comparison',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw.toFixed(1);
            return `${label}: ${value}%`;
          },
        },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: function (tickValue: string | number) {
            return `${tickValue}%`;
          },
        },
        pointLabels: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <Radar data={data} options={options} />
    </div>
  );
};

export default NormalizedPerformanceRadarChart;