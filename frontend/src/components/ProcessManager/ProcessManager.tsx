import React, { useState, useEffect } from 'react';
import { SchedulerData } from '../../services/parser';
import VisualizationContainer from '../VisualizationContainer/VisualizationContainer';
import NewProcessForm, { NewProcessData } from '../NewProcessForm/NewProcessForm';
import NewProcessTable from '../NewProcessTable/NewProcessTable';
import PauseNotification from '../PauseNotification/PauseNotification';
import RescheduleButton from '../RescheduleButton/RescheduleButton';
import AlgorithmSelector, { AlgorithmParams } from '../AlgorithmSelector/AlgorithmSelector';

interface ProcessManagerProps {
  schedulerData: SchedulerData;
  onReschedule: (newProcesses: NewProcessData[], algorithm?: string, params?: AlgorithmParams) => void;
  onReset?: () => void; // Add reset handler prop
  loading?: boolean; // Add loading prop
}

const ProcessManager: React.FC<ProcessManagerProps> = ({ 
  schedulerData, 
  onReschedule,
  onReset,
  loading = false
}) => {
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [pausedTime, setPausedTime] = useState<number>(0);
  const [newProcesses, setNewProcesses] = useState<NewProcessData[]>([]);
  const [nextProcessId, setNextProcessId] = useState<number>(
    schedulerData.process_stats ? 
    Math.max(...schedulerData.process_stats.map(p => p.process_id), 0) + 1 : 
    0
  );
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(
    schedulerData.scheduling_algorithm || 'FCFS'
  );
  const [algorithmParams, setAlgorithmParams] = useState<AlgorithmParams>({});

  // Update the next process ID when scheduler data changes
  useEffect(() => {
    if (schedulerData.process_stats && schedulerData.process_stats.length > 0) {
      const maxExistingId = Math.max(...schedulerData.process_stats.map(p => p.process_id));
      setNextProcessId(maxExistingId + 1);
    }
  }, [schedulerData]);

  useEffect(() => {
    if (schedulerData.scheduling_algorithm) {
      setSelectedAlgorithm(schedulerData.scheduling_algorithm);
    }
  }, [schedulerData]);
  
  const handleChartPause = (currentTime: number) => {
    const safeTime = typeof currentTime === 'number' && !isNaN(currentTime) ? currentTime : 0;
    setPausedTime(safeTime);
    setIsPaused(true);
  };
  
  const handleChartResume = () => {
    setIsPaused(false);
  };
  
  const handleAddProcess = (newProcess: NewProcessData) => {
    setNewProcesses(prev => [...prev, newProcess]);
    // Increment the next process ID for the form
    setNextProcessId(prevId => prevId + 1);
  };
  
  const handleReschedule = () => {
    if (newProcesses.length === 0) {
      console.warn("Cannot reschedule without processes");
      return;
    }
    
    onReschedule(newProcesses, selectedAlgorithm, algorithmParams);
    // Don't clear the processes here as we want to show what was sent to the backend
    // Processes will be cleared if/when user resets or the component remounts
  };

  const handleAlgorithmChange = (algorithm: string, params?: AlgorithmParams) => {
    setSelectedAlgorithm(algorithm);
    if (params) {
      setAlgorithmParams(params);
    }
  };
  
  // Pass the reset handler to the visualization container
  const handleReset = () => {
    if (onReset) {
      // Clear any new processes
      setNewProcesses([]);
      // Reset to initial state
      onReset();
    }
  };
  
  // Clear processes after successful scheduling
  useEffect(() => {
    // When scheduling is done (loading finishes) and we had processes before, clear them
    if (!loading && newProcesses.length > 0) {
      setNewProcesses([]);
    }
  }, [loading]);

  return (
    <div className="container mx-auto px-4 py-4">
      {/* New processes table - always visible if there are processes */}
      {newProcesses.length > 0 && (
        <NewProcessTable processes={newProcesses} />
      )}
      {isPaused && <PauseNotification pausedTime={pausedTime} />}
      
      {/* Algorithm selector - only visible when paused */}
      {isPaused && (
        <AlgorithmSelector
          selectedAlgorithm={selectedAlgorithm}
          onAlgorithmChange={handleAlgorithmChange}
          disabled={newProcesses.length > 0}
        />
      )}
    
      {/* New Process Form - only visible when paused */}
      {isPaused && (
        <NewProcessForm 
          currentTime={pausedTime} 
          onAddProcess={handleAddProcess}
          isVisible={true}
          nextProcessId={nextProcessId}
        />
      )}
      
      {/* Reschedule button - only visible when paused with new processes */}
      {isPaused && newProcesses.length > 0 && (
        <RescheduleButton onClick={handleReschedule} loading={loading} />
      )}
      
      {/* Visualization Container */}
      <VisualizationContainer
        schedulerData={schedulerData}
        onPause={handleChartPause}
        onResume={handleChartResume}
        onReset={handleReset} // Pass down the reset handler
      />
      
    </div>
  );
};

export default ProcessManager;
