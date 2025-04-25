import React from 'react';
import { Parser } from '../../services/parser';
import TurnaroundTimeBarChart from './TurnaroundTimeBarChart';
import WaitingTimeBarChart from './WaitingTimeBarChart';
import ResponseTimeBarChart from './ResponseTimeBarChart';
import CPUUtilizationPieChart from './CPUUtilizationPieChart';
import ThroughputBarChart from './ThroughputBarChart';
import ContextSwitchesBarChart from './ContextSwitchesBarChart';
import AverageMetricsComparison from './AverageMetricsComparison';
import NormalizedPerformanceRadarChart from './NormalizedPerformanceRadarChart';

interface GraphsContainerProps {
  parser: Parser;
  algorithmName: string;
  selectedChart: string;
}

const GraphsContainer: React.FC<GraphsContainerProps> = ({ 
  parser, 
  algorithmName,
  selectedChart 
}) => {
  // Get data from parser
  const ganttChart = parser.getGanttChart();
  const processStats = parser.getProcessStats();
  
  // Calculate total execution time (for throughput and CPU utilization)
  const totalExecutionTime = ganttChart.length > 0 
    ? Math.max(...ganttChart.map(entry => entry.end_time))
    : 0;
  
  // Calculate metrics for performance summary
  const getAverageTurnaroundTime = () => {
    if (processStats.length === 0) return 0;
    return processStats.reduce((sum, proc) => sum + proc.turnaround_time, 0) / processStats.length;
  };
  
  const getAverageWaitingTime = () => {
    if (processStats.length === 0) return 0;
    return processStats.reduce((sum, proc) => sum + proc.waiting_time, 0) / processStats.length;
  };
  
  const getAverageResponseTime = () => {
    if (processStats.length === 0) return 0;
    
    const responseTimes = new Map<number, number>();
    const sortedGantt = [...ganttChart].sort((a, b) => a.start_time - b.start_time);
    
    processStats.forEach(process => {
      const firstExecution = sortedGantt.find(entry => entry.process_id === process.process_id);
      if (firstExecution) {
        const responseTime = firstExecution.start_time - process.arrival_time;
        responseTimes.set(process.process_id, responseTime);
      }
    });
    
    return Array.from(responseTimes.values()).reduce((sum, time) => sum + time, 0) / responseTimes.size;
  };
  
  const getThroughput = () => {
    if (totalExecutionTime === 0) return 0;
    return processStats.length / totalExecutionTime;
  };
  
  const getCPUUtilization = () => {
    let busyTime = 0;
    ganttChart.forEach(entry => {
      busyTime += entry.end_time - entry.start_time;
    });
    
    return totalExecutionTime > 0 ? (busyTime / totalExecutionTime) * 100 : 0;
  };
  
  // Prepare data for algorithm comparison charts
  const algorithmMetrics = [{
    name: algorithmName,
    avgTurnaroundTime: getAverageTurnaroundTime(),
    avgWaitingTime: getAverageWaitingTime(),
    avgResponseTime: getAverageResponseTime()
  }];
  
  const algorithmPerformance = [{
    name: algorithmName,
    metrics: {
      avgTurnaroundTime: getAverageTurnaroundTime(),
      avgWaitingTime: getAverageWaitingTime(),
      avgResponseTime: getAverageResponseTime(),
      throughput: getThroughput(),
      cpuUtilization: getCPUUtilization(),
      contextSwitches: ganttChart.length <= 1 ? 0 : 
        ganttChart.reduce((count, entry, index) => 
          index > 0 && entry.process_id !== ganttChart[index-1].process_id ? count + 1 : count, 0)
    }
  }];

  return (
    <div className="mt-8">
      <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-100">
        {selectedChart === 'turnaround' && (
          <TurnaroundTimeBarChart processStats={processStats} />
        )}
        
        {selectedChart === 'waiting' && (
          <WaitingTimeBarChart processStats={processStats} />
        )}
        
        {selectedChart === 'response' && (
          <ResponseTimeBarChart processStats={processStats} ganttChart={ganttChart} />
        )}
        
        {selectedChart === 'cpu' && (
          <CPUUtilizationPieChart ganttChart={ganttChart} totalExecutionTime={totalExecutionTime} />
        )}
        
        {selectedChart === 'throughput' && (
          <ThroughputBarChart 
            processStats={processStats} 
            totalExecutionTime={totalExecutionTime}
            algorithmName={algorithmName}
          />
        )}
        
        {selectedChart === 'context' && (
          <ContextSwitchesBarChart ganttChart={ganttChart} algorithmName={algorithmName} />
        )}
        
        {selectedChart === 'average' && (
          <AverageMetricsComparison algorithmsMetrics={algorithmMetrics} />
        )}
        
        {selectedChart === 'radar' && (
          <NormalizedPerformanceRadarChart algorithmsPerformance={algorithmPerformance} />
        )}
      </div>
      
      <div className="mt-6 p-4 bg-white rounded-lg shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500 shadow-sm hover:shadow-md transition duration-300">
            <p className="text-sm font-medium text-gray-500">Avg Turnaround Time</p>
            <p className="text-2xl font-bold text-blue-700">{getAverageTurnaroundTime().toFixed(2)}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500 shadow-sm hover:shadow-md transition duration-300">
            <p className="text-sm font-medium text-gray-500">Avg Waiting Time</p>
            <p className="text-2xl font-bold text-purple-700">{getAverageWaitingTime().toFixed(2)}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition duration-300">
            <p className="text-sm font-medium text-gray-500">Throughput</p>
            <p className="text-2xl font-bold text-yellow-700">{getThroughput().toFixed(4)}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-500 shadow-sm hover:shadow-md transition duration-300">
            <p className="text-sm font-medium text-gray-500">CPU Utilization</p>
            <p className="text-2xl font-bold text-green-700">{getCPUUtilization().toFixed(2)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphsContainer;