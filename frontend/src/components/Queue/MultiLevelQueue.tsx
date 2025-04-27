import React, { useMemo } from 'react';
import { GanttChartEntry, MLQGanttChartEntry } from '../../services/types';

interface MultiLevelQueueProps {
  ganttData: GanttChartEntry[];
  currentTime: number;
  isPaused?: boolean;
}

const MultiLevelQueue: React.FC<MultiLevelQueueProps> = ({ 
  ganttData, 
  currentTime,
  isPaused = true 
}) => {
  // Enhanced debugging - log the full gantt data
  React.useEffect(() => {
    console.log("MultiLevelQueue - Full gantt data:", ganttData);
    if (ganttData.length > 0) {
      console.log("First entry structure:", ganttData[0]);
    }
  }, [ganttData]);

  // Find the entry for the current time
  const currentEntry = useMemo(() => {
    const entry = ganttData.find(
      entry => currentTime >= entry.start_time && currentTime < entry.end_time
    );
    console.log("Current entry found:", entry);
    return entry || null;
  }, [ganttData, currentTime]);

  // Determine queue levels - handle both queues array and ready_queues object
  const queueLevels = useMemo(() => {
    if (!currentEntry) return [];

    // Direct access to queues array (preferred for MLQ)
    if (currentEntry.queues && Array.isArray(currentEntry.queues)) {
      console.log("Using queues array format:", currentEntry.queues);
      // Create a range of numbers from 0 to queues.length-1
      return Array.from({ length: currentEntry.queues.length }, (_, i) => i);
    }

    // Fallback to ready_queues object format
    if (currentEntry.ready_queues) {
      console.log("Using ready_queues object format:", currentEntry.ready_queues);
      return Array.from(new Set(Object.keys(currentEntry.ready_queues).map(Number))).sort((a, b) => a - b);
    }
    
    console.log("No queue data found in either format");
    return [];
  }, [currentEntry]);

  // Get processes for a specific queue level
  const getQueuedProcesses = (level: number) => {
    if (!currentEntry) return [];
    
    // Direct access to queues array (preferred for MLQ)
    if (currentEntry.queues && Array.isArray(currentEntry.queues) && level < currentEntry.queues.length) {
      return currentEntry.queues[level] || [];
    }
    
    // Fallback to ready_queues object format
    if (currentEntry.ready_queues && currentEntry.ready_queues[level]) {
      return currentEntry.ready_queues[level];
    }
    
    return [];
  };

  // Generate color for each process box
  const getProcessColor = (processId: number): string => {
    const colors = [
      'bg-indigo-500/70',
      'bg-pink-500/70',
      'bg-teal-500/70',
      'bg-amber-500/70',
      'bg-emerald-500/70',
      'bg-violet-500/70',
      'bg-rose-500/70',
      'bg-lime-500/70',
      'bg-sky-500/70',
      'bg-orange-500/70',
      'bg-cyan-500/70',
      'bg-fuchsia-500/70',
      'bg-red-500/70',
      'bg-blue-500/70',
      'bg-green-500/70',
    ];
    
    return colors[processId % colors.length];
  };

  // Generate border color to match the fill color
  const getBorderColor = (processId: number): string => {
    const colors = [
      'border-indigo-600',
      'border-pink-600',
      'border-teal-600',
      'border-amber-600',
      'border-emerald-600',
      'border-violet-600',
      'border-rose-600',
      'border-lime-600',
      'border-sky-600',
      'border-orange-600',
      'border-cyan-600',
      'border-fuchsia-600',
      'border-red-600',
      'border-blue-600',
      'border-green-600',
    ];
    
    return colors[processId % colors.length];
  };

  // Determine if a process is currently executing
  const isProcessExecuting = (pid: number, level: number): boolean => {
    return currentEntry?.process_id === pid && currentEntry?.queue_level === level;
  };

  // Queue level priority labels
  const getQueueTypeLabel = (level: number): string => {
    switch (level) {
      case 0: return "High Priority";
      case 1: return "Medium Priority";
      case 2: return "Low Priority";
      default: return `Priority Level ${level}`;
    }
  };

  if (!currentEntry) {
    return (
      <div className="w-full max-w-4xl mx-auto my-5 p-5 rounded-lg shadow-md bg-white">
        <h2 className="text-center text-xl font-bold mb-5 text-gray-800">
          Multi-Level Queue Status
        </h2>
        <div className="text-center py-8 text-gray-500">No queue data available at this time.</div>
      </div>
    );
  }

  // Check if any queue data exists - check both formats
  const hasQueueData = 
    (currentEntry.queues && Array.isArray(currentEntry.queues) && currentEntry.queues.length > 0) || 
    (currentEntry.ready_queues && Object.keys(currentEntry.ready_queues).length > 0);

  if (!hasQueueData || queueLevels.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto my-5 p-5 rounded-lg shadow-md bg-white">
        <h2 className="text-center text-xl font-bold mb-5 text-gray-800">
          Multi-Level Queue Status
        </h2>
        <div className="mb-3 flex justify-between items-center">
          <div className="text-sm font-medium text-gray-500">
            Current Time: {currentTime.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">
            {currentEntry?.process_id !== undefined && currentEntry.process_id >= 0 ? (
              <span>
                Executing: <span className="font-bold text-indigo-700">P{currentEntry.process_id}</span> 
                {currentEntry.queue_level !== undefined && ` (Queue ${currentEntry.queue_level})`}
              </span>
            ) : currentEntry?.process_id === -1 ? (
              <span className="font-medium text-amber-600">CPU Idle</span>
            ) : (
              <span className="font-medium text-gray-500">
                {currentTime === 0 ? 'Ready to Start' : 'Execution Complete'}
              </span>
            )}
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">Queue data structure not recognized. Check browser console for logs.</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-5 p-5 rounded-lg shadow-md bg-white">
      <h2 className="text-center text-xl font-bold mb-5 text-gray-800">
        Multi-Level Queue Status
      </h2>
      
      <div className="mb-3 flex justify-between items-center">
        <div className="text-sm font-medium text-gray-500">
          Current Time: {currentTime.toFixed(1)}
        </div>
        <div className="text-sm text-gray-600">
          {currentEntry?.process_id !== undefined && currentEntry.process_id >= 0 ? (
            <span>
              Executing: <span className="font-bold text-indigo-700">P{currentEntry.process_id}</span> 
              {currentEntry.queue_level !== undefined && ` (Queue ${currentEntry.queue_level})`}
            </span>
          ) : currentEntry?.process_id === -1 ? (
            <span className="font-medium text-amber-600">CPU Idle</span>
          ) : (
            <span className="font-medium text-gray-500">
              {currentTime === 0 ? 'Ready to Start' : 'Execution Complete'}
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        {queueLevels.map(level => {
          const queuedProcesses = getQueuedProcesses(level);
          
          return (
            <div key={`queue-${level}`} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${level === 0 ? 'bg-red-500' : level === 1 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <h3 className="font-medium text-gray-800">Queue {level} ({getQueueTypeLabel(level)})</h3>
                </div>
                <div className="text-xs text-gray-500">
                  {queuedProcesses.length === 0 
                    ? "No processes waiting in queue"
                    : `${queuedProcesses.length} process${queuedProcesses.length !== 1 ? 'es' : ''} in queue`
                  }
                </div>
              </div>
              
              <div className="flex items-center w-full">
                {/* Queue Entry Point */}
                <div className="shrink-0 w-10 h-16 flex items-center justify-center border-2 border-gray-300 rounded-l-lg bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
                
                {/* Queue Items */}
                <div className="flex-1 flex items-center border-t-2 border-b-2 border-gray-300 h-16 overflow-x-auto">
                  {queuedProcesses.length > 0 ? (
                    <div className="flex space-x-2 p-2 min-w-full">
                      {queuedProcesses.map((pid, index) => (
                        <div 
                          key={`queue-${level}-${pid}-${index}`}
                          className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-md ${getProcessColor(pid)} border-2 ${getBorderColor(pid)} 
                          ${isProcessExecuting(pid, level) ? 'ring-2 ring-offset-2 ring-indigo-500' : ''} 
                          shadow-sm transition-all duration-300 hover:shadow-md`}
                          title={isProcessExecuting(pid, level) ? `Process ${pid} - Currently Executing` : `Process ${pid} - Waiting`}
                        >
                          <span className="text-lg font-bold text-gray-800">P{pid}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-center">
                      <span className="text-gray-400 italic">Queue Empty</span>
                    </div>
                  )}
                </div>
                
                {/* CPU Entry */}
                <div className="shrink-0 w-14 h-16 flex items-center justify-center border-2 border-gray-300 rounded-r-lg bg-gray-50">
                  <div className="text-xs font-medium text-gray-500 text-center">CPU</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Status indicator */}
      <div className="mt-4 text-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPaused ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
          <span className={`w-2 h-2 mr-1.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-green-400'}`}></span>
          {isPaused ? 'Paused' : 'Playing'}
        </span>
      </div>
      
      {/* Additional helpful information */}
      <div className="mt-4 bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
        <p className="mb-1"><span className="font-medium">Multi-Level Queue:</span> Processes in different priority queues waiting to be executed.</p>
        <p><span className="font-medium">Note:</span> Higher priority queues (lower numbers) are serviced first in MLQ and MLFQ scheduling.</p>
      </div>
    </div>
  );
};

export default MultiLevelQueue;