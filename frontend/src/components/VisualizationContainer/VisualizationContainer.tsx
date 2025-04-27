import React, { useState, useEffect } from 'react';
import GanttChart from '../GanttChart/GanttChart';
import ReadyQueue from '../Queue/ReadyQueue';
import MultiLevelQueue from '../Queue/MultiLevelQueue';
import { GanttChartEntry, ProcessStats, SchedulerData } from '../../services/types';

interface VisualizationContainerProps {
  schedulerData: SchedulerData;
  isPaused?: boolean;
  onPause?: (currentTime?: number) => void;
  onResume?: () => void;
  ganttData?: GanttChartEntry[];
  onReset?: () => void; // Add reset handler prop
}

const VisualizationContainer: React.FC<VisualizationContainerProps> = ({ 
  schedulerData,
  isPaused = false,
  onPause,
  onResume,
  ganttData,
  onReset
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [internalPaused, setInternalPaused] = useState(isPaused);
  
  // Use the externally provided gantt data if available, otherwise use from scheduler data
  const chartData = ganttData || schedulerData.gantt_chart;
  

  
  const algorithmName = schedulerData.scheduling_algorithm
                        ? schedulerData.scheduling_algorithm
                        :'Scheduling Algorithm';

  useEffect(() => {
    setInternalPaused(isPaused);
  }, [isPaused]);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };
  
  // Handler for reset
  const handleReset = () => {
    setCurrentTime(0);
    setInternalPaused(true);
    
    // Call parent reset handler if provided
    if (onReset) {
      onReset();
    }
  };

  const handlePause = () => {
    setInternalPaused(true);
    if (onPause) {
      onPause(currentTime);
    }
  };

  const handleResume = () => {
    setInternalPaused(false);
    if (onResume) {
      onResume();
    }
  };

  // Check if this is a multi-level queue algorithm
  const isMultiLevelQueue = 
    schedulerData.scheduling_algorithm?.toUpperCase().includes('MLQ') || 
    schedulerData.scheduling_algorithm?.toUpperCase().includes('MLFQ') ||
    schedulerData.scheduling_algorithm?.toUpperCase().includes('MULTI');

  return (
    <div className="container mx-auto px-4 py-8">      
      {/* Wrapper for visualization components */}
      <div className="space-y-8">
        {/* Gantt Chart */}
        <GanttChart 
          ganttData={chartData} 
          initialTime={currentTime}
          onPause={handlePause}
          onResume={handleResume}
          onTimeUpdate={handleTimeUpdate}
          onReset={handleReset} // Pass down the reset handler
        />
        
        {/* Conditionally render either Ready Queue or Multi-Level Queue */}
        {isMultiLevelQueue ? (
          <MultiLevelQueue 
            ganttData={chartData} 
            currentTime={currentTime} 
            isPaused={internalPaused}
          />
        ) : (
          <ReadyQueue 
            ganttData={chartData} 
            currentTime={currentTime} 
            isPaused={internalPaused}
          />
        )}
      </div>
      
      {/* Process Information Table */}
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-3 text-gray-800">Process Details</h2>
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Process ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Time</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Burst Time</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Time</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turnaround Time</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waiting Time</th>
                {isMultiLevelQueue && (
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority Level</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schedulerData.process_stats?.map((process: ProcessStats) => (
                <tr key={process.process_id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">P{process.process_id}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{process.arrival_time}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{process.burst_time}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{process.completion_time}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{process.turnaround_time}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{process.waiting_time}</td>
                  {isMultiLevelQueue && (
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {process.final_queue_level !== undefined ? `Queue ${process.final_queue_level}` : 'N/A'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default VisualizationContainer;