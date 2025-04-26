import React, { useMemo } from 'react';
import { GanttChartEntry } from '../../services/parser';

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
  // Find the entry for the current time
  const currentEntry = useMemo(() => {
    return ganttData.find(
      entry => currentTime >= entry.start_time && currentTime < entry.end_time
    ) || null;
  }, [ganttData, currentTime]);

  // Get queue levels from the ready_queues object
  const queueLevels = useMemo(() => {
    if (currentEntry?.ready_queues) {
      return Object.keys(currentEntry.ready_queues).map(Number).sort((a, b) => a - b);
    }
    return [];
  }, [currentEntry]);

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

  if (!currentEntry || !currentEntry.ready_queues) {
    return null;
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
              Executing: <span className="font-bold text-indigo-700">P{currentEntry.process_id}</span> (Queue {currentEntry.queue_level})
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
          const queuedProcesses = currentEntry.ready_queues?.[level] || [];
          
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