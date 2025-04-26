import React, { useState, useEffect } from 'react';
import GanttChart from '../GanttChart/GanttChart';
import ReadyQueue from '../Queue/ReadyQueue';
import { GanttChartEntry, SchedulerData } from '../../services/parser';

interface VisualizationContainerProps {
  schedulerData: SchedulerData;
  // Allow passing specific gantt data if needed, but primarily use schedulerData
  ganttData?: GanttChartEntry[];
}

const VisualizationContainer: React.FC<VisualizationContainerProps> = ({ 
  schedulerData,
  ganttData 
}) => {
  // Use the provided gantt data or extract from schedulerData
  const chartData = ganttData || schedulerData.gantt_chart || [];
  const algorithmName = schedulerData.scheduling_algorithm || 'CPU Scheduling Algorithm';
  
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(true);

  // Calculate total execution time
  const totalExecutionTime = chartData.length > 0 
    ? Math.max(...chartData.map(entry => entry.end_time))
    : 0;

  // Effect to log available data for debugging
  useEffect(() => {
    console.log("VisualizationContainer mounted with data:", chartData);
    console.log("Algorithm:", algorithmName);
  }, [chartData, algorithmName]);

  // Handler for when Gantt Chart is paused
  const handlePause = (time: number) => {
    setCurrentTime(time);
    setIsPaused(true);
  };

  // Handler for when Gantt Chart is resumed
  const handleResume = () => {
    setIsPaused(false);
  };
  
  // Handler for time updates during animation (new function)
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  // If chartData is missing, show a fallback UI
  if (!chartData || chartData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          {algorithmName} Visualization
        </h1>
        <div className="p-8 bg-white rounded-lg shadow-md">
          <p className="text-lg text-gray-600">No scheduling data available to visualize.</p>
          <p className="mt-2 text-gray-500">Please ensure you have configured and run the scheduling algorithm.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
        {algorithmName} Visualization
      </h1>
      
      {/* Stats summary */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-lg font-medium mb-3 text-gray-800">Algorithm Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-500">Algorithm Type</p>
            <p className="text-lg font-bold text-indigo-600">{algorithmName}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-500">Total Processes</p>
            <p className="text-lg font-bold text-indigo-600">{schedulerData.process_stats?.length || 0}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-500">Total Execution Time</p>
            <p className="text-lg font-bold text-indigo-600">{totalExecutionTime}</p>
          </div>
        </div>
      </div>
      
      {/* Wrapper for visualization components */}
      <div className="space-y-8">
        {/* Gantt Chart */}
        <GanttChart 
          ganttData={chartData} 
          initialTime={currentTime}
          onPause={handlePause}
          onResume={handleResume}
          onTimeUpdate={handleTimeUpdate}
        />
        
        {/* Ready Queue */}
        <ReadyQueue 
          ganttData={chartData} 
          currentTime={currentTime} 
          isPaused={isPaused}
        />
      </div>
      
      {/* Process Stats Table */}
      <div className="mt-12 p-4 bg-white rounded-lg shadow-md">
        <h3 className="font-medium text-lg mb-3 text-gray-700">Process Statistics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Process ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Burst Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turnaround Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waiting Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedulerData.process_stats?.map((process) => (
                <tr key={`process-${process.process_id}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">P{process.process_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{process.arrival_time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{process.burst_time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{process.completion_time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{process.turnaround_time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{process.waiting_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Visualization Guide */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg shadow-sm">
        <h3 className="font-medium text-lg mb-2 text-gray-700">Visualization Guide</h3>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Use the play/pause button to control the animation</li>
          <li>Adjust the slider to move to a specific time point</li>
          <li>The ready queue shows processes waiting for CPU time</li>
          <li>The speed slider controls the animation pace</li>
          <li>Process ID -1 represents system idle time (no active process)</li>
        </ul>
      </div>
    </div>
  );
};

export default VisualizationContainer;