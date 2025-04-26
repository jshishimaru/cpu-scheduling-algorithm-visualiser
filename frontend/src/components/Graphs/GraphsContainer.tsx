import React, { useMemo } from 'react';
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
  const processStats = parser.getProcessStats().filter(ps => ps.process_id >= 0); // Filter out idle processes
  
  // Calculate total execution time (for throughput and CPU utilization)
  const totalExecutionTime = useMemo(() => {
    return ganttChart.length > 0 
      ? Math.max(...ganttChart.map(entry => entry.end_time))
      : 0;
  }, [ganttChart]);

  // Calculate metrics for the summary section
  // These calculations are needed for the Performance Summary cards
  const metrics = useMemo(() => {
    // Calculate CPU utilization (accounting for idle time)
    let busyTime = 0;
    ganttChart.forEach(entry => {
      if (entry.process_id >= 0) { // Only count non-idle processes
        busyTime += entry.end_time - entry.start_time;
      }
    });
    const cpuUtilization = totalExecutionTime > 0 ? (busyTime / totalExecutionTime) * 100 : 0;

    // Calculate context switches
    const contextSwitches = ganttChart.length <= 1 ? 0 : 
      ganttChart.reduce((count, entry, index) => {
        // Only count switches between actual processes or from idle to process
        if (index > 0 && entry.process_id !== ganttChart[index-1].process_id && entry.process_id >= 0) {
          return count + 1;
        }
        return count;
      }, 0);

    // Basic stats that are directly available
    const avgTurnaroundTime = processStats.length > 0
      ? processStats.reduce((sum, proc) => sum + proc.turnaround_time, 0) / processStats.length
      : 0;
    
    const avgWaitingTime = processStats.length > 0
      ? processStats.reduce((sum, proc) => sum + proc.waiting_time, 0) / processStats.length
      : 0;

    const throughput = totalExecutionTime > 0
      ? processStats.length / totalExecutionTime
      : 0;

    return {
      avgTurnaroundTime,
      avgWaitingTime,
      cpuUtilization,
      throughput,
      contextSwitches
    };
  }, [ganttChart, processStats, totalExecutionTime]);

  // Prepare data objects for the charts that need aggregate data
  const algorithmMetrics = useMemo(() => [{
    name: algorithmName,
    avgTurnaroundTime: metrics.avgTurnaroundTime,
    avgWaitingTime: metrics.avgWaitingTime,
    // Response time calculated in the ResponseTimeBarChart component
    avgResponseTime: 0 // This will be calculated properly in the individual chart
  }], [algorithmName, metrics]);
  
  const algorithmPerformance = useMemo(() => [{
    name: algorithmName,
    metrics: {
      avgTurnaroundTime: metrics.avgTurnaroundTime,
      avgWaitingTime: metrics.avgWaitingTime,
      avgResponseTime: 0, // This will be calculated properly in the individual chart
      throughput: metrics.throughput,
      cpuUtilization: metrics.cpuUtilization,
      contextSwitches: metrics.contextSwitches
    }
  }], [algorithmName, metrics]);

  return (
    <div className="mt-8">
        <div className="mt-6 p-4 bg-white rounded-lg shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500 shadow-sm hover:shadow-md transition duration-300">
            <p className="text-sm font-medium text-gray-500">Avg Turnaround Time</p>
            <p className="text-2xl font-bold text-blue-700">{metrics.avgTurnaroundTime.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500 shadow-sm hover:shadow-md transition duration-300">
            <p className="text-sm font-medium text-gray-500">Avg Waiting Time</p>
            <p className="text-2xl font-bold text-purple-700">{metrics.avgWaitingTime.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition duration-300">
            <p className="text-sm font-medium text-gray-500">Throughput</p>
            <p className="text-2xl font-bold text-yellow-700">{metrics.throughput.toFixed(4)}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-500 shadow-sm hover:shadow-md transition duration-300">
            <p className="text-sm font-medium text-gray-500">CPU Utilization</p>
            <p className="text-2xl font-bold text-green-700">{metrics.cpuUtilization.toFixed(2)}%</p>
          </div>
        </div>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-100 gap-4">
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
      
      
    </div>
  );
};

export default GraphsContainer;