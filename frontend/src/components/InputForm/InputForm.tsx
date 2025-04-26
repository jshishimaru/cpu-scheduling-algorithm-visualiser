import React, { useState } from 'react';
import { Parser, SchedulerInput } from '../../services/parser';

// Define types
type SchedulingType = 'FCFS' | 'SJF' | 'Priority' | 'RoundRobin' | 'MLFQ';

interface Process {
  p_id: string;
  arrival_time: number;
  burst_time: number;
  priority: number;
}

interface FormData {
  scheduling_type: SchedulingType;
  time_slice: number;
  num_of_queues: number;
  processes: Process[];
}

const InputForm: React.FC = () => {
  // Initial form state
  const [formData, setFormData] = useState<FormData>({
    scheduling_type: 'FCFS',
    time_slice: 2,
    num_of_queues: 0,
    processes: [
      { p_id: 'P1', arrival_time: 0, burst_time: 5, priority: 1 }
    ]
  });

  // Handle scheduling algorithm change
  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SchedulingType;
    setFormData({
      ...formData,
      scheduling_type: value,
      // Reset num_of_queues to 0 if not MLFQ
      num_of_queues: value === 'MLFQ' ? formData.num_of_queues : 0
    });
  };

  // Handle time slice change
  const handleTimeSliceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      time_slice: parseInt(e.target.value) || 0
    });
  };

  // Handle queue count change for MLFQ
  const handleQueueCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      num_of_queues: parseInt(e.target.value) || 0
    });
  };

  // Add new process
  const addProcess = () => {
    const newProcessId = `P${formData.processes.length + 1}`;
    setFormData({
      ...formData,
      processes: [
        ...formData.processes,
        { p_id: newProcessId, arrival_time: 0, burst_time: 1, priority: 1 }
      ]
    });
  };

  // Remove process
  const removeProcess = (index: number) => {
    if (formData.processes.length > 1) {
      const updatedProcesses = [...formData.processes];
      updatedProcesses.splice(index, 1);
      
      // Renumber process IDs
      const renumberedProcesses = updatedProcesses.map((process, idx) => ({
        ...process,
        p_id: `P${idx + 1}`
      }));
      
      setFormData({
        ...formData,
        processes: renumberedProcesses
      });
    }
  };

  // Update process field
  const updateProcess = (index: number, field: keyof Process, value: string) => {
    const updatedProcesses = [...formData.processes];
    if (field === 'p_id') {
      updatedProcesses[index][field] = value;
    } else {
      updatedProcesses[index][field] = parseInt(value) || 0;
    }
    setFormData({
      ...formData,
      processes: updatedProcesses
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a copy of the form data to conform to SchedulerInput type
    const schedulerInput: SchedulerInput = {
      scheduling_type: formData.scheduling_type,
      processes: formData.processes.map((p) => ({
        p_id: p.p_id,
        arrival_time: p.arrival_time,
        burst_time: p.burst_time,
        priority: p.priority
      }))
    };
    
    // Add time_slice only if using Round Robin or MLFQ
    if (formData.scheduling_type === 'RoundRobin' || formData.scheduling_type === 'MLFQ') {
      schedulerInput.time_slice = formData.time_slice;
    }
    
    // Add num_of_queues only if using MLFQ
    if (formData.scheduling_type === 'MLFQ') {
      schedulerInput.num_of_queues = formData.num_of_queues;
    }

    // Display the input data in console for debugging
    console.log(JSON.stringify(schedulerInput, null, 2));
    
    // Save the data to a JSON file
    const filename = `${formData.scheduling_type.toLowerCase()}_scheduler_input.json`;
    Parser.saveInputToFile(schedulerInput, filename);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">CPU Scheduling Configuration</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Algorithm Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Scheduling Algorithm
          </label>
          <select
            value={formData.scheduling_type}
            onChange={handleAlgorithmChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="FCFS">First Come First Serve (FCFS)</option>
            <option value="SJF">Shortest Job First (SJF)</option>
            <option value="Priority">Priority Scheduling</option>
            <option value="RoundRobin">Round Robin</option>
            <option value="MLFQ">Multi-Level Feedback Queue (MLFQ)</option>
          </select>
        </div>

        {/* Time Slice (for Round Robin) */}
        {(formData.scheduling_type === 'RoundRobin' || formData.scheduling_type === 'MLFQ') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Slice (Quantum)
            </label>
            <input
              type="number"
              min="1"
              value={formData.time_slice}
              onChange={handleTimeSliceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Number of Queues (for MLFQ) */}
        {formData.scheduling_type === 'MLFQ' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Queues
            </label>
            <input
              type="number"
              min="2"
              max="5"
              value={formData.num_of_queues}
              onChange={handleQueueCountChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Processes Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Processes</h3>
            <button
              type="button"
              onClick={addProcess}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Process
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b">Process ID</th>
                  <th className="py-2 px-4 border-b">Arrival Time</th>
                  <th className="py-2 px-4 border-b">Burst Time</th>
                  <th className="py-2 px-4 border-b">Priority</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formData.processes.map((process, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="text"
                        value={process.p_id}
                        onChange={(e) => updateProcess(index, 'p_id', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="number"
                        min="0"
                        value={process.arrival_time}
                        onChange={(e) => updateProcess(index, 'arrival_time', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="number"
                        min="1"
                        value={process.burst_time}
                        onChange={(e) => updateProcess(index, 'burst_time', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="number"
                        min="0"
                        value={process.priority}
                        onChange={(e) => updateProcess(index, 'priority', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={formData.scheduling_type !== 'Priority'}
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        type="button"
                        onClick={() => removeProcess(index)}
                        disabled={formData.processes.length <= 1}
                        className={`px-3 py-1 rounded-md focus:outline-none ${
                          formData.processes.length <= 1
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Schedule
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;
