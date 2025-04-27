import React, { useState, useEffect } from 'react';
import { SchedulerData } from '../../services/types';
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
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);
  const [nextProcessId, setNextProcessId] = useState<number>(
    schedulerData.process_stats ? 
    Math.max(...schedulerData.process_stats.map(p => p.process_id), 0) + 1 : 
    0
  );
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(
    schedulerData.scheduling_algorithm || 'FCFS'
  );
  const [algorithmParams, setAlgorithmParams] = useState<AlgorithmParams>({});
  // Track all processes - both existing and newly added
  const [allProcesses, setAllProcesses] = useState<NewProcessData[]>([]);

  // Initialize allProcesses from scheduler data when it changes
  useEffect(() => {
    // Convert existing processes from the scheduler data to NewProcessData format
    const existingProcesses: NewProcessData[] = 
      (schedulerData.process_stats && schedulerData.process_stats.length > 0) 
        ? schedulerData.process_stats.map(p => ({
            id: p.process_id,
            arrivalTime: p.arrival_time,
            burstTime: p.burst_time,
            priority: p.priority || 0,
          }))
        : [];
    
    // Combine existing processes with any new processes that were added
    setAllProcesses([...existingProcesses, ...newProcesses]);
  }, [schedulerData, newProcesses]);

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
  
  const handleChartPause = (currentTime?: number) => {
    const safeTime = typeof currentTime === 'number' && !isNaN(currentTime) ? currentTime : 0;
    setPausedTime(safeTime);
    setIsPaused(true);
  };
  
  const handleChartResume = () => {
    setIsPaused(false);
  };
  
  const handleAddProcess = (newProcess: NewProcessData) => {
    console.log("Adding new process:", newProcess);
    setNewProcesses(prev => {
      const updated = [...prev, newProcess];
      console.log("Updated newProcesses:", updated);
      return updated;
    });
    // Increment the next process ID for the form
    setNextProcessId(prevId => prevId + 1);
  };
  
  const handleReschedule = () => {
    if (allProcesses.length === 0 && newProcesses.length === 0) {
      console.warn("Cannot reschedule without processes");
      return;
    }
    
    setIsRescheduling(true);

    // If we have new processes, reschedule using all processes
    if (newProcesses.length > 0) {
      console.log("Rescheduling with all processes:", 
        { existing: allProcesses.length - newProcesses.length, new: newProcesses.length, total: allProcesses.length });
      
      onReschedule(allProcesses, selectedAlgorithm, algorithmParams);
      setNewProcesses([]); // Clear new processes after successful rescheduling
    } else {
      // Otherwise just use the existing processes
      console.log("Rescheduling with existing processes only:", { total: allProcesses.length });
      onReschedule(allProcesses, selectedAlgorithm, algorithmParams);
    }

    setIsRescheduling(false);
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
      // Clear all processes
      setAllProcesses([]);
      // Reset the next process ID to 1 (starting fresh)
      setNextProcessId(1);
      // Reset to initial state
      onReset();
    }
  };
  
  // Clear processes after successful scheduling
  useEffect(() => {
    // Only when scheduling is done (loading changes from true to false) and we had processes before, clear them
    if (!loading && newProcesses.length > 0) {
      // This was clearing the newProcesses immediately after adding them
      // We should only clear them after a successful reschedule operation
      // The rescheduling state can be tracked by checking if the loading state has changed from true to false
      console.log("Loading finished, preserving new processes until reschedule");
    }
  }, [loading]);

  return (
    <div className="container mx-auto px-4 py-4">
      {isPaused && <PauseNotification pausedTime={pausedTime} />}
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Column - Algorithm selector and New Process Form */}
        <div className="w-full md:w-1/3 lg:w-1/4 space-y-4">
          {/* Algorithm selector - always visible */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <AlgorithmSelector
              selectedAlgorithm={selectedAlgorithm}
              onAlgorithmChange={handleAlgorithmChange}
              disabled={allProcesses.length > 0}
            />
          </div>
        
          {/* New Process Form - always visible */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <NewProcessForm 
              currentTime={pausedTime} 
              onAddProcess={handleAddProcess}
              isVisible={true}
              nextProcessId={nextProcessId}
            />
          </div>
          
          {/* Reschedule button */}
          <div className="mt-4">
            <RescheduleButton onClick={handleReschedule} loading={loading} />
          </div>
        </div>
        
        {/* Right Column - Process Table and Visualization */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          {/* All processes table - always visible if there are any processes */}
          {allProcesses.length > 0 && (
            <div className="mb-4 bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">All Processes</h2>
              <NewProcessTable processes={allProcesses} />
            </div>
          )}
          
          
          {/* Visualization Container */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <VisualizationContainer
              schedulerData={schedulerData}
              onPause={handleChartPause}
              onResume={handleChartResume}
              onReset={handleReset} // Pass down the reset handler
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessManager;
