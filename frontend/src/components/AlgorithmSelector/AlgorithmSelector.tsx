import React, { useState, useEffect } from 'react';

interface AlgorithmSelectorProps {
  selectedAlgorithm: string;
  onAlgorithmChange: (algorithm: string, params?: AlgorithmParams) => void;
  disabled?: boolean;
}

export interface AlgorithmParams {
  timeQuantum?: number;
  numberOfQueues?: number;
  requiresPriority?: boolean;
  maxPriority?: number;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  selectedAlgorithm,
  onAlgorithmChange,
  disabled = false
}) => {
  const [timeQuantum, setTimeQuantum] = useState<number>(1);
  const [numberOfQueues, setNumberOfQueues] = useState<number>(3);

  // Determine if the current algorithm requires priority
  const requiresPriority = selectedAlgorithm === 'Priority' || selectedAlgorithm === 'MLQ' || selectedAlgorithm === 'MLFQ';
  
  // Determine if the algorithm requires time quantum
  const requiresTimeQuantum = selectedAlgorithm === 'RR' || selectedAlgorithm === 'MLFQ' || selectedAlgorithm === 'MLQ';
  
  // Determine if the algorithm requires number of queues
  const requiresQueues = selectedAlgorithm === 'MLQ' || selectedAlgorithm === 'MLFQ';
  
  // Update params whenever relevant values change
  useEffect(() => {
    const params: AlgorithmParams = {};
    
    if (requiresTimeQuantum) {
      params.timeQuantum = timeQuantum;
    }
    
    if (requiresQueues) {
      params.numberOfQueues = numberOfQueues;
      params.maxPriority = numberOfQueues; // In MLQ/MLFQ, priority cannot exceed number of queues
    }
    
    if (requiresPriority) {
      params.requiresPriority = true;
      if (selectedAlgorithm === 'MLQ' || selectedAlgorithm === 'MLFQ') {
        params.maxPriority = numberOfQueues;
      }
    }
    
    onAlgorithmChange(selectedAlgorithm, params);
  }, [selectedAlgorithm, timeQuantum, numberOfQueues, requiresPriority, requiresTimeQuantum, requiresQueues, onAlgorithmChange]);

  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onAlgorithmChange(e.target.value);
  };
  
  const handleTimeQuantumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setTimeQuantum(value);
    }
  };
  
  const handleNumberOfQueuesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setNumberOfQueues(value);
    }
  };
  
  return (
    <div className="w-full max-w-lg mx-auto p-5 border border-gray-200 rounded-lg shadow-sm bg-white my-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Select Scheduling Algorithm</h3>
      
      <div className="mb-4">
        <label htmlFor="algorithm" className="block text-sm font-medium text-gray-700 mb-2">
          Algorithm:
        </label>
        <select
          id="algorithm"
          value={selectedAlgorithm}
          onChange={handleAlgorithmChange}
          disabled={disabled}
          className={`w-full p-2 border border-gray-300 rounded-md ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        >
          <option value="FCFS">First Come First Serve (FCFS)</option>
          <option value="SJF">Shortest Job First (SJF)</option>
          <option value="RR">Round Robin (RR)</option>
          <option value="MLQ">Multi-Level Queue (MLQ)</option>
          <option value="MLFQ">Multi-Level Feedback Queue (MLFQ)</option>
          <option value="Priority">Priority Scheduling</option>
        </select>
      </div>
      
      {/* Algorithm specific parameters */}
      <div className="space-y-4">
        {/* Time Quantum for RR, MLQ and MLFQ */}
        {requiresTimeQuantum && (
          <div>
            <label htmlFor="timeQuantum" className="block text-sm font-medium text-gray-700 mb-2">
              Time Quantum:
            </label>
            <input
              id="timeQuantum"
              type="number"
              min="1"
              value={timeQuantum}
              onChange={handleTimeQuantumChange}
              disabled={disabled}
              className={`w-full p-2 border border-gray-300 rounded-md ${
                disabled ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>
        )}
        
        {/* Number of Queues for MLQ and MLFQ */}
        {requiresQueues && (
          <div>
            <label htmlFor="numberOfQueues" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Queues:
            </label>
            <input
              id="numberOfQueues"
              type="number"
              min="1"
              value={numberOfQueues}
              onChange={handleNumberOfQueuesChange}
              disabled={disabled}
              className={`w-full p-2 border border-gray-300 rounded-md ${
                disabled ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            {requiresQueues && (
              <p className="mt-1 text-sm text-gray-500">
                For MLQ/MLFQ, process priority should not exceed the number of queues ({numberOfQueues}).
              </p>
            )}
          </div>
        )}
        
        {requiresQueues && requiresTimeQuantum && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> {selectedAlgorithm === 'MLQ' ? 'Multi-Level Queue' : 'Multi-Level Feedback Queue'} requires both time quantum and number of queues settings.
            </p>
          </div>
        )}
        
        {/* Help text for algorithms that require priority */}
        {requiresPriority && !requiresQueues && (
          <div className="text-sm text-blue-600">
            <p>This algorithm requires priority values for each process.</p>
          </div>
        )}
      </div>
      
      {disabled && (
        <div className="mt-4 text-sm text-amber-600">
          Clear new processes before changing the scheduling algorithm.
        </div>
      )}
    </div>
  );
};

export default AlgorithmSelector;
