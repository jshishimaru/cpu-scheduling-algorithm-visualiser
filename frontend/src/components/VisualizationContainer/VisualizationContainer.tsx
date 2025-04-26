import React, { useState, useEffect } from 'react';
import GanttChart from '../GanttChart/GanttChart';
import ReadyQueue from '../Queue/ReadyQueue';
import MultiLevelQueue from '../Queue/MultiLevelQueue';
import { GanttChartEntry, SchedulerData } from '../../services/parser';

interface VisualizationContainerProps {
  schedulerData: SchedulerData;
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  ganttData?: GanttChartEntry[];
  onPause?: (currentTime: number) => void;
  onResume?: () => void;
  onReset?: () => void; // Add reset handler prop
}

const VisualizationContainer: React.FC<VisualizationContainerProps> = ({ 
  schedulerData,
  ganttData,
  onPause,
  onResume,
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
    setIsPaused(true);
    
    // Call parent reset handler if provided
    if (onReset) {
      onReset();
    }
  };

  const handlePause = () => {
    setInternalPaused(true);
    if (onPause) {
      onPause();
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
      <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
        {algorithmName} Visualization
      </h1>
      
      {/* Algorithm Information */}
      {/* <div className="mb-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-medium mb-3 text-gray-800">Algorithm Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm"><span className="font-medium">Algorithm:</span> {algorithmName}</p>
            <p className="text-sm"><span className="font-medium">Total Processes:</span> {schedulerData.processes?.length || 0}</p>
            <p className="text-sm"><span className="font-medium">Avg. Turnaround Time:</span> {schedulerData.average_turnaround_time?.toFixed(2) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm"><span className="font-medium">Total Runtime:</span> {chartData[chartData.length - 1]?.end_time || 0} time units</p>
            <p className="text-sm"><span className="font-medium">Avg. Waiting Time:</span> {schedulerData.average_waiting_time?.toFixed(2) || 'N/A'}</p>
            <p className="text-sm"><span className="font-medium">CPU Utilization:</span> {schedulerData.cpu_utilization ? `${(schedulerData.cpu_utilization * 100).toFixed(2)}%` : 'N/A'}</p>
          </div>
        </div>
      </div> */}
      
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
              {schedulerData.processes?.map((process) => (
                <tr key={process.process_id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">P{process.process_id}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{process.arrival_time}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{process.burst_time}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{process.completion_time}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{process.turnaround_time}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{process.waiting_time}</td>
                  {isMultiLevelQueue && (
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {process.priority !== undefined ? `Queue ${process.priority}` : 'N/A'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Explanation of the Algorithm */}
      <div className="mt-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-medium mb-3 text-gray-800">About {algorithmName}</h2>
        <div className="text-sm text-gray-600 space-y-2">
          {isMultiLevelQueue ? (
            <>
              <p><span className="font-medium">Multi-Level Queue (MLQ):</span> A scheduling algorithm that partitions the ready queue into several separate queues based on process priority.</p>
              <p>- Each queue has its own scheduling algorithm.</p>
              <p>- Processes are permanently assigned to a queue based on their priority, memory size, or type (system/user process).</p>
              <p>- Higher priority queues are absolutely prioritized over lower priority queues.</p>
            </>
          ) : schedulerData.scheduling_algorithm?.toUpperCase().includes('FCFS') ? (
            <p><span className="font-medium">First Come First Served (FCFS):</span> The simplest scheduling algorithm that schedules processes in the order they arrive in the ready queue.</p>
          ) : schedulerData.scheduling_algorithm?.toUpperCase().includes('SJF') ? (
            <p><span className="font-medium">Shortest Job First (SJF):</span> A scheduling algorithm that schedules processes with the shortest CPU burst time first.</p>
          ) : schedulerData.scheduling_algorithm?.toUpperCase().includes('PRIORITY') ? (
            <p><span className="font-medium">Priority Scheduling:</span> Schedules processes based on priority. Higher priority processes are executed first.</p>
          ) : schedulerData.scheduling_algorithm?.toUpperCase().includes('RR') ? (
            <p><span className="font-medium">Round Robin (RR):</span> Each process is assigned a fixed time slice called a quantum. Processes are executed in a circular manner.</p>
          ) : (
            <p>A CPU scheduling algorithm determines which processes run when there are multiple ready processes.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizationContainer;