import React, { useState, useEffect } from 'react';
import { Parser } from '../../services/parser';
import GraphsContainer from '../graphs/GraphsContainer';

function Scheduler() {
  const [parser, setParser] = useState<Parser | null>(null);
  const [algorithmName, setAlgorithmName] = useState<string>('FCFS');
  const [selectedChart, setSelectedChart] = useState<string>('turnaround');
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // In a real application, you would fetch data from your backend
    // For demonstration, let's create sample data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Sample data - in a real app, this would come from your backend
        const sampleData = {
          gantt_chart: [
            { process_id: 1, start_time: 0, end_time: 3, ready_queue: [2, 3, 4] },
            { process_id: 2, start_time: 3, end_time: 6, ready_queue: [3, 4] },
            { process_id: 3, start_time: 6, end_time: 10, ready_queue: [4] },
            { process_id: 4, start_time: 10, end_time: 14, ready_queue: [] },
          ],
          process_stats: [
            { process_id: 1, arrival_time: 0, burst_time: 3, completion_time: 3, turnaround_time: 3, waiting_time: 0 },
            { process_id: 2, arrival_time: 1, burst_time: 3, completion_time: 6, turnaround_time: 5, waiting_time: 2 },
            { process_id: 3, arrival_time: 2, burst_time: 4, completion_time: 10, turnaround_time: 8, waiting_time: 4 },
            { process_id: 4, arrival_time: 3, burst_time: 4, completion_time: 14, turnaround_time: 11, waiting_time: 7 },
          ]
        };
        
        // Initialize parser with sample data
        const newParser = new Parser();
        newParser.parse(sampleData);
        
        setParser(newParser);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching scheduler data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle algorithm change
  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAlgorithmName(e.target.value);
    // In a real app, you would fetch new data for the selected algorithm
  };
  
  // Handle chart selection change
  const handleChartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChart(e.target.value);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
          CPU Scheduling Algorithm Visualizer
        </h1>
        
        <div className="mb-8 flex flex-col md:flex-row justify-center gap-4">
          <div className="relative w-full md:w-64 group">
            <label htmlFor="algorithm-selector" className="block text-sm font-medium text-gray-700 mb-1">
              Scheduling Algorithm
            </label>
            <div className="relative">
              <select 
                id="algorithm-selector"
                value={algorithmName}
                onChange={handleAlgorithmChange}
                className="block appearance-none w-full bg-white text-gray-700 border border-blue-300 hover:border-blue-500 
                           px-4 py-2 pr-8 rounded-lg shadow transition duration-150 ease-in-out
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="FCFS">First Come First Serve (FCFS)</option>
                <option value="SJF">Shortest Job First (SJF)</option>
                <option value="SRTF">Shortest Remaining Time First (SRTF)</option>
                <option value="RR">Round Robin (RR)</option>
                <option value="Priority">Priority Scheduling</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-600">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="absolute hidden group-hover:block bg-blue-100 text-xs text-blue-800 p-2 rounded mt-1 shadow-lg">
              Select a CPU scheduling algorithm to visualize
            </div>
          </div>
          
          <div className="relative w-full md:w-64 group">
            <label htmlFor="chart-selector" className="block text-sm font-medium text-gray-700 mb-1">
              Visualization Type
            </label>
            <div className="relative">
              <select
                id="chart-selector"
                value={selectedChart}
                onChange={handleChartChange}
                className="block appearance-none w-full bg-white text-gray-700 border border-blue-300 hover:border-blue-500 
                           px-4 py-2 pr-8 rounded-lg shadow transition duration-150 ease-in-out
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="turnaround">Turnaround Time</option>
                <option value="waiting">Waiting Time</option>
                <option value="response">Response Time</option>
                <option value="cpu">CPU Utilization</option>
                <option value="throughput">Throughput</option>
                <option value="context">Context Switches</option>
                <option value="average">Average Metrics Comparison</option>
                <option value="radar">Performance Radar</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-600">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="absolute hidden group-hover:block bg-blue-100 text-xs text-blue-800 p-2 rounded mt-1 shadow-lg right-0">
              Choose the type of visualization to display
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading scheduler data...</p>
          </div>
        ) : parser ? (
          <GraphsContainer 
            parser={parser} 
            algorithmName={algorithmName} 
            selectedChart={selectedChart} 
          />
        ) : (
          <div className="text-center py-8 bg-red-100 rounded-lg">
            <p className="text-red-600">Failed to load scheduler data.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Scheduler;