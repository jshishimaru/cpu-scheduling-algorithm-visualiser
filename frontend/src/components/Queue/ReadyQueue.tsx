import React, { useState, useEffect } from 'react';

interface ReadyQueueProps {
  ganttData: GanttChartEntry[];
  currentTime: number;
}

const ReadyQueue: React.FC<ReadyQueueProps> = ({ ganttData, currentTime }) => {
  const [queuedProcesses, setQueuedProcesses] = useState<number[]>([]);
  
  // Update the ready queue whenever current time changes
  useEffect(() => {
    // Find the current gantt chart entry for this time point
    const currentEntry = ganttData.find(
      entry => currentTime >= entry.start_time && currentTime < entry.end_time
    );
    
    // Update the queue state with the current ready queue
    if (currentEntry) {
      setQueuedProcesses(currentEntry.ready_queue);
    } else if (currentTime === 0 && ganttData.length > 0) {
      // Show initial queue at time 0
      setQueuedProcesses(ganttData[0].ready_queue);
    } else if (currentTime >= Math.max(...ganttData.map(entry => entry.end_time))) {
      // At or past the end of execution, clear the queue
      setQueuedProcesses([]);
    }
  }, [currentTime, ganttData]);

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
    ];
    
    return colors[processId % colors.length];
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-5 p-5 rounded-lg shadow-md bg-white">
      <h2 className="text-center text-xl font-bold mb-5 text-gray-800">
        Ready Queue
      </h2>
      
      <div className="flex flex-col">
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-500">
            Current Ready Queue (Time: {currentTime.toFixed(1)})
          </div>
        </div>
        
        <div className="flex items-center w-full">
          {/* Queue Entry Point */}
          <div className="shrink-0 w-10 h-20 flex items-center justify-center border-2 border-gray-300 rounded-l-lg bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          
          {/* Queue Items */}
          <div className="flex-1 flex items-center border-t-2 border-b-2 border-gray-300 h-20 overflow-x-auto">
            {queuedProcesses.length > 0 ? (
              <div className="flex space-x-2 p-2 min-w-full">
                {queuedProcesses.map((pid, index) => (
                  <div 
                    key={`queue-${pid}-${index}`}
                    className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-md ${getProcessColor(pid)} border-2 ${getBorderColor(pid)} shadow-sm transition-all duration-300 hover:shadow-md`}
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
          <div className="shrink-0 w-14 h-20 flex items-center justify-center border-2 border-gray-300 rounded-r-lg bg-gray-50">
            <div className="text-xs font-medium text-gray-500 text-center">CPU</div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-500">
            {queuedProcesses.length === 0 
              ? "No processes waiting in queue"
              : `${queuedProcesses.length} process${queuedProcesses.length !== 1 ? 'es' : ''} in queue`
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadyQueue;