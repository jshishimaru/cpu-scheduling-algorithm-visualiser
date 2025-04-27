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
  agingThreshold?: number;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  selectedAlgorithm,
  onAlgorithmChange,
  disabled = false
}) => {
  const [timeQuantum, setTimeQuantum] = useState<number>(1);
  const [numberOfQueues, setNumberOfQueues] = useState<number>(3);
  const [agingThreshold, setAgingThreshold] = useState<number>(50);
  const [lastSelectedAlgorithm, setLastSelectedAlgorithm] = useState<string>(selectedAlgorithm);

  // Determine if the current algorithm requires priority
  const requiresPriority = selectedAlgorithm === 'Priority' || selectedAlgorithm === 'MLQ' || selectedAlgorithm === 'MLFQ' || 
                           selectedAlgorithm === 'MLQ_Aging';
  
  // Determine if the algorithm requires time quantum
  const requiresTimeQuantum = selectedAlgorithm === 'RR' || selectedAlgorithm === 'MLFQ' || selectedAlgorithm === 'MLQ' || 
                              selectedAlgorithm === 'MLQ_Aging';
  
  // Determine if the algorithm requires number of queues
  const requiresQueues = selectedAlgorithm === 'MLQ' || selectedAlgorithm === 'MLFQ' || selectedAlgorithm === 'MLQ_Aging';
  
  // Determine if the algorithm requires aging threshold
  const requiresAging = selectedAlgorithm === 'SJF_Aging' || selectedAlgorithm === 'MLQ_Aging';

  // Reset parameters when algorithm changes
  useEffect(() => {
    // Default values when switching algorithms
    if (!requiresTimeQuantum && timeQuantum !== 1) {
      setTimeQuantum(1);
    }
    
    if (!requiresQueues && numberOfQueues !== 3) {
      setNumberOfQueues(3);
    }
    
    if (!requiresAging && agingThreshold !== 50) {
      setAgingThreshold(50);
    }
  }, [selectedAlgorithm, requiresTimeQuantum, requiresQueues, requiresAging]);
  
  // Update params whenever relevant values change, but not on every render
  useEffect(() => {
    // Skip the initial render
    if (lastSelectedAlgorithm !== selectedAlgorithm) {
      setLastSelectedAlgorithm(selectedAlgorithm);
      return;
    }

    // Only update parameters when they actually change, not on every render
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
      if (selectedAlgorithm === 'MLQ' || selectedAlgorithm === 'MLFQ' || selectedAlgorithm === 'MLQ_Aging') {
        params.maxPriority = numberOfQueues;
      }
    }
    
    if (requiresAging) {
      params.agingThreshold = agingThreshold;
    }
    
    // Only call when parameters change, not when algorithm changes
    onAlgorithmChange(selectedAlgorithm, params);
  }, [timeQuantum, numberOfQueues, agingThreshold]);

  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAlgorithm = e.target.value;
    setLastSelectedAlgorithm(newAlgorithm);
    onAlgorithmChange(newAlgorithm);
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
  
  const handleAgingThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setAgingThreshold(value);
    }
  };
  
  return (
    <div className="w-full mx-auto p-3 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h3 className="text-base font-semibold mb-2 text-gray-800">Scheduling Algorithm</h3>
      
      <div className="mb-2">
        <label htmlFor="algorithm" className="block text-xs font-medium text-gray-700 mb-1">
          Algorithm:
        </label>
        <select
          id="algorithm"
          value={selectedAlgorithm}
          onChange={handleAlgorithmChange}
          disabled={disabled}
          className={`w-full py-1 px-2 text-sm border border-gray-300 rounded-md ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        >
          <option value="FCFS">First Come First Serve (FCFS)</option>
          <option value="SJF">Shortest Job First (SJF)</option>
          <option value="SJF_Aging">Shortest Job First with Aging</option>
          <option value="RR">Round Robin (RR)</option>
          <option value="MLQ">Multi-Level Queue (MLQ)</option>
          <option value="MLQ_Aging">Multi-Level Queue with Aging</option>
          <option value="MLFQ">Multi-Level Feedback Queue (MLFQ)</option>
          <option value="Priority">Priority Scheduling</option>
        </select>
      </div>
      
      {/* Algorithm specific parameters */}
      <div className="space-y-2">
        {/* Time Quantum for RR, MLQ and MLFQ */}
        {requiresTimeQuantum && (
          <div>
            <label htmlFor="timeQuantum" className="block text-xs font-medium text-gray-700 mb-1">
              Time Quantum:
            </label>
            <input
              id="timeQuantum"
              type="number"
              min="1"
              value={timeQuantum}
              onChange={handleTimeQuantumChange}
              disabled={disabled}
              className={`w-full py-1 px-2 text-sm border border-gray-300 rounded-md ${
                disabled ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>
        )}
        
        {/* Number of Queues for MLQ and MLFQ */}
        {requiresQueues && (
          <div>
            <label htmlFor="numberOfQueues" className="block text-xs font-medium text-gray-700 mb-1">
              Number of Queues:
            </label>
            <input
              id="numberOfQueues"
              type="number"
              min="1"
              value={numberOfQueues}
              onChange={handleNumberOfQueuesChange}
              disabled={disabled}
              className={`w-full py-1 px-2 text-sm border border-gray-300 rounded-md ${
                disabled ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            {requiresQueues && (
              <p className="mt-0.5 text-xs text-gray-500">
                Process priority should not exceed {numberOfQueues} queues.
              </p>
            )}
          </div>
        )}
        
        {/* Aging Threshold for algorithms with aging */}
        {requiresAging && (
          <div>
            <label htmlFor="agingThreshold" className="block text-xs font-medium text-gray-700 mb-1">
              Aging Threshold:
            </label>
            <input
              id="agingThreshold"
              type="number"
              min="1"
              max="100"
              value={agingThreshold}
              onChange={handleAgingThresholdChange}
              disabled={disabled}
              className={`w-full py-1 px-2 text-sm border border-gray-300 rounded-md ${
                disabled ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            <p className="mt-0.5 text-xs text-gray-500">
              {selectedAlgorithm === 'SJF_Aging' 
                ? 'Lower values make aging faster' 
                : 'Lower values make promotion between queues happen more quickly'}
            </p>
          </div>
        )}
        
        {requiresQueues && requiresTimeQuantum && (
          <div className="mt-1 p-1 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700">
              <span className="font-medium">Note:</span> {
                selectedAlgorithm === 'MLQ' ? 'MLQ' : 
                selectedAlgorithm === 'MLQ_Aging' ? 'MLQ with Aging' : 
                'MLFQ'
              } uses both time quantum and queue settings.
            </p>
          </div>
        )}
        
        {/* Help text for algorithms with aging */}
        {requiresAging && (
          <div className="mt-1 p-1 bg-green-50 border border-green-200 rounded-md">
            <p className="text-xs text-green-700">
              <span className="font-medium">Aging:</span> Prevents starvation by increasing priority over time.
            </p>
          </div>
        )}
        
        {/* Help text for algorithms that require priority */}
        {requiresPriority && !requiresQueues && (
          <div className="text-xs text-blue-600 mt-1">
            <p>This algorithm requires priority values for each process.</p>
          </div>
        )}
      </div>
      
      {disabled && (
        <div className="mt-2 text-xs text-amber-600">
          Clear new processes before changing algorithm.
        </div>
      )}
    </div>
  );
};

export default AlgorithmSelector;
