import React, { useState, useEffect } from 'react';

interface NewProcessFormProps {
  currentTime: number;
  onAddProcess: (newProcess: NewProcessData) => void;
  isVisible: boolean;
  nextProcessId: number;
}

export interface NewProcessData {
  id: number;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
}

const NewProcessForm: React.FC<NewProcessFormProps> = ({ 
  currentTime, 
  onAddProcess, 
  isVisible, 
  nextProcessId 
}) => {
  const [processId, setProcessId] = useState<number>(nextProcessId);
  const [arrivalTime, setArrivalTime] = useState<number>(Math.ceil(currentTime));
  const [burstTime, setBurstTime] = useState<number>(1);
  const [priority, setPriority] = useState<number>(1);
  const [error, setError] = useState<string>('');
  
  // Update process ID when nextProcessId changes
  useEffect(() => {
    setProcessId(nextProcessId);
  }, [nextProcessId]);
  
  // Update arrival time when currentTime changes
  useEffect(() => {
    setArrivalTime(Math.ceil(currentTime));
  }, [currentTime]);

  // Don't render anything if not visible
  if (!isVisible) {
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (arrivalTime < currentTime) {
      setError(`Arrival time must be at least ${Math.ceil(currentTime)}`);
      return;
    }
    
    if (burstTime <= 0) {
      setError('Burst time must be greater than 0');
      return;
    }
    
    // Add the new process
    onAddProcess({
      id: processId,
      arrivalTime,
      burstTime,
      priority
    });
    
    // Reset form fields except for the process ID (which will be updated via the prop)
    setArrivalTime(Math.ceil(currentTime));
    setBurstTime(1);
    setPriority(1);
    setError('');
  };
  
  return (
    <div className="w-full mx-auto p-3 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h3 className="text-base font-semibold mb-2 text-gray-800">Add New Process</h3>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-2 rounded text-xs">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label htmlFor="processId" className="block text-xs font-medium text-gray-700 mb-1">
              Process ID
            </label>
            <input
              id="processId"
              type="number"
              value={processId}
              onChange={(e) => setProcessId(parseInt(e.target.value))}
              className="w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="arrivalTime" className="block text-xs font-medium text-gray-700 mb-1">
              Arrival Time (≥ {Math.ceil(currentTime)})
            </label>
            <input
              id="arrivalTime"
              type="number"
              min={Math.ceil(currentTime)}
              value={arrivalTime}
              onChange={(e) => setArrivalTime(parseInt(e.target.value))}
              className="w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="burstTime" className="block text-xs font-medium text-gray-700 mb-1">
              Burst Time
            </label>
            <input
              id="burstTime"
              type="number"
              min="1"
              value={burstTime}
              onChange={(e) => setBurstTime(parseInt(e.target.value))}
              className="w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-xs font-medium text-gray-700 mb-1">
              Priority
            </label>
            <input
              id="priority"
              type="number"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
              className="w-full py-1 px-2 text-sm border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-offset-1"
        >
          Add Process
        </button>
      </form>
    </div>
  );
};

export default NewProcessForm;
