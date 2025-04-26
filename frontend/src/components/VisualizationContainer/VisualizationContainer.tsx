import React, { useState, useEffect } from 'react';
import GanttChart from '../GanttChart/GanttChart';
import ReadyQueue from '../Queue/ReadyQueue';
import { GanttChartEntry, SchedulerData } from '../../services/parser';

interface VisualizationContainerProps {
  schedulerData: SchedulerData;
  // Allow passing specific gantt data if needed, but primarily use schedulerData
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
    
    // Notify parent component if callback is provided
    if (onPause) {
      onPause(time);
    }
  };

  // Handler for when Gantt Chart is resumed
  const handleResume = () => {
    setIsPaused(false);
    
    // Notify parent component if callback is provided
    if (onResume) {
      onResume();
    }
  };
  
  // Handler for time updates during animation
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
        
        {/* Ready Queue */}
        <ReadyQueue 
          ganttData={chartData} 
          currentTime={currentTime} 
          isPaused={isPaused}
        />
      </div>
    </div>
  );
};

export default VisualizationContainer;