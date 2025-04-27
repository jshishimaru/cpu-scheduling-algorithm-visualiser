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
  parser: Parser | null;
  selectedChart?: string;
  onChartChange?: (chart: string) => void;
  chartOptions?: Array<{value: string, label: string}>;
}

const GraphsContainer: React.FC<GraphsContainerProps> = ({ 
  parser, 
  selectedChart = 'turnaround',
  onChartChange,
  chartOptions = []
}) => {
  // If parser is null, return nothing
  if (!parser) {
    return null;
  }

  const algorithmName = parser.getAlgorithm() || 'CPU Scheduling Algorithm';
  
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

  // Prepare data objects for the charts
  const algorithmMetrics = useMemo(() => [{
    name: algorithmName,
    avgTurnaroundTime: metrics.avgTurnaroundTime,
    avgWaitingTime: metrics.avgWaitingTime,
    avgResponseTime: 0
  }], [algorithmName, metrics]);
  
  const algorithmPerformance = useMemo(() => [{
    name: algorithmName,
    metrics: {
      avgTurnaroundTime: metrics.avgTurnaroundTime,
      avgWaitingTime: metrics.avgWaitingTime,
      avgResponseTime: 0,
      throughput: metrics.throughput,
      cpuUtilization: metrics.cpuUtilization,
      contextSwitches: metrics.contextSwitches
    }
  }], [algorithmName, metrics]);

  // If there are no processes, don't show any charts
  if (processStats.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      {/* Chart selection dropdown */}
      {chartOptions && chartOptions.length > 0 && onChartChange && (
        <div className="mb-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Chart Type:
          </label>
          <select
            value={selectedChart}
            onChange={(e) => onChartChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {chartOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Performance metrics summary */}
      <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Metrics Summary</h3>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="p-1 bg-blue-50 rounded border-l-2 border-blue-500">
            <p className="font-medium text-gray-500">Avg Turnaround</p>
            <p className="font-bold text-blue-700">{metrics.avgTurnaroundTime.toFixed(2)}</p>
          </div>
          <div className="p-1 bg-purple-50 rounded border-l-2 border-purple-500">
            <p className="font-medium text-gray-500">Avg Waiting</p>
            <p className="font-bold text-purple-700">{metrics.avgWaitingTime.toFixed(2)}</p>
          </div>
          <div className="p-1 bg-yellow-50 rounded border-l-2 border-yellow-500">
            <p className="font-medium text-gray-500">Throughput</p>
            <p className="font-bold text-yellow-700">{metrics.throughput.toFixed(4)}</p>
          </div>
          <div className="p-1 bg-green-50 rounded border-l-2 border-green-500">
            <p className="font-medium text-gray-500">CPU Utilization</p>
            <p className="font-bold text-green-700">{metrics.cpuUtilization.toFixed(2)}%</p>
          </div>
        </div>
      </div>
      
      {/* Chart display - made more compact */}
      <div className="mt-2 p-2 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="h-40"> {/* Fixed height for consistent size */}
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
    </div>
  );
};

export default GraphsContainer;