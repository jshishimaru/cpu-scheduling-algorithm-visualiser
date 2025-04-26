import React, { useState, useEffect } from 'react';

interface NewProcessFormProps {
  currentTime: number;
  onAddProcess: (newProcess: NewProcessData) => void;
  isVisible: boolean;
}

export interface NewProcessData {
  id: number;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
}

const NewProcessForm: React.FC<NewProcessFormProps> = ({ currentTime, onAddProcess, isVisible }) => {
  const [processId, setProcessId] = useState<number>(0);
  const [arrivalTime, setArrivalTime] = useState<number>(Math.ceil(currentTime));
  const [burstTime, setBurstTime] = useState<number>(1);
  const [priority, setPriority] = useState<number>(1);
  const [error, setError] = useState<string>('');
  
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
    
    // Reset form
    setProcessId(prev => prev + 1);
    setArrivalTime(Math.ceil(currentTime));
    setBurstTime(1);
    setPriority(1);
    setError('');
  };
  
  return (
    <div className="w-full max-w-lg mx-auto p-5 border border-gray-200 rounded-lg shadow-sm bg-white my-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Add New Process</h3>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="processId" className="block text-sm font-medium text-gray-700 mb-1">
              Process ID
            </label>
            <input
              id="processId"
              type="number"
              value={processId}
              onChange={(e) => setProcessId(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="arrivalTime" className="block text-sm font-medium text-gray-700 mb-1">
              Arrival Time (must be ≥ {Math.ceil(currentTime)})
            </label>
            <input
              id="arrivalTime"
              type="number"
              min={Math.ceil(currentTime)}
              value={arrivalTime}
              onChange={(e) => setArrivalTime(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="burstTime" className="block text-sm font-medium text-gray-700 mb-1">
              Burst Time
            </label>
            <input
              id="burstTime"
              type="number"
              min="1"
              value={burstTime}
              onChange={(e) => setBurstTime(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority (optional)
            </label>
            <input
              id="priority"
              type="number"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Add Process
        </button>
      </form>
    </div>
  );
};

export default NewProcessForm;
