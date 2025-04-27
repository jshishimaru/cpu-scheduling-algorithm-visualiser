import React, { useState, useEffect } from 'react';
import { Parser } from './services/parser';
import { dummySchedulerData } from './data/dummyData';
import ProcessManager from './components/ProcessManager/ProcessManager';
import { NewProcessData } from './components/NewProcessForm/NewProcessForm';
import GraphsContainer from './components/Graphs/GraphsContainer';
import apiService from './services/apiservice';

function App() {
  const [parser, setParser] = useState<Parser | null>(null);
  const [selectedChart, setSelectedChart] = useState<string>('turnaround'); // Default chart type
  const [schedulerData, setSchedulerData] = useState<any>(dummySchedulerData);
  const [resetKey, setResetKey] = useState<number>(0); // Add a key for resetting components
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Effect to load initial data
  useEffect(() => {
    // Use dummy data for initial render
    const initialParser = new Parser();
    if (initialParser.parse(dummySchedulerData)) {
      setParser(initialParser);
    }
  }, []);
  
  const fetchAndParseData = async (newProcesses?: NewProcessData[], algorithm?: string, timeQuantum?: number, numOfQueues?: number) => {
    if (!newProcesses || newProcesses.length === 0) {
      console.warn("No processes provided for rescheduling");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Prepare the data for the API
      const schedulerInput = apiService.prepareSchedulerInput(
        newProcesses,
        algorithm || 'FCFS',
        timeQuantum,
        numOfQueues
      );
      
      let result = null;
      
      // Choose the appropriate API method based on algorithm type
      if (algorithm === 'MLQ') {
        result = await apiService.scheduleMLQ(schedulerInput);
      } else if (algorithm === 'MLFQ') {
        result = await apiService.scheduleMLFQ(schedulerInput);
      } else {
        result = await apiService.scheduleProcesses(schedulerInput);
      }
      
      if (result) {
        // Update the scheduler data with the response
        setSchedulerData(result);
        
        // Create a new parser to parse the result
        const newParser = new Parser();
        if (newParser.parse(result)) {
          setParser(newParser);
        }
      } else {
        setError("Failed to retrieve scheduling data from the server");
      }
    } catch (err) {
      console.error("Error during scheduling:", err);
      setError("An error occurred while communicating with the scheduler server");
    } finally {
      setLoading(false);
    }
  };
  
  const handleReschedule = (newProcesses: NewProcessData[], algorithm?: string, params?: any) => {
    console.log("Rescheduling with:", { newProcesses, algorithm, params });
    fetchAndParseData(
      newProcesses, 
      algorithm, 
      params?.timeQuantum, 
      params?.numberOfQueues
    );
  };
  
  // Add a reset function that forces component re-rendering
  const handleReset = () => {
    // Increment key to force ProcessManager to remount
    setResetKey(prev => prev + 1);
    
    // Create empty scheduler data instead of using dummy data
    const emptyData = {
      scheduling_algorithm: "",
      gantt_chart: [],
      process_stats: []
    };
    
    // Reset to empty data
    const initialParser = new Parser();
    if (initialParser.parse(emptyData)) {
      setSchedulerData(emptyData);
      setParser(initialParser);
    }
  };
  
  const chartOptions = [
    { value: 'turnaround', label: 'Turnaround Time' },
    { value: 'waiting', label: 'Waiting Time' },
    { value: 'response', label: 'Response Time' },
    { value: 'cpu', label: 'CPU Utilization' },
    { value: 'throughput', label: 'Throughput' },
    { value: 'context', label: 'Context Switches' },
    { value: 'average', label: 'Average Metrics' },
    { value: 'radar', label: 'Normalized Performance' }
  ];
  
  // Get algorithm name from scheduler data
  const algorithmName = schedulerData?.scheduling_algorithm || 'CPU Scheduling Algorithm';
  
  return (
    <div className="App">
      <header className="bg-gray-800 text-white p-4 mb-6">
        <h1 className="text-3xl font-bold">CPU Scheduler Simulator</h1>
      </header>
      
      <main className="container mx-auto px-4">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center items-center p-8 mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-lg text-indigo-600">Processing...</span>
          </div>
        )}
        
        {/* Process Manager - handles form, table and visualization */}
        <ProcessManager 
          key={resetKey} // Add key to force remount on reset
          schedulerData={schedulerData}
          onReschedule={handleReschedule}
          onReset={handleReset} // Pass down reset handler
          loading={loading}
        />
        
        {/* Graphs container for analytics */}
        {parser && !loading && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Performance Analytics</h2>
            
            {/* Chart selector */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Chart Type:
              </label>
              <select
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {chartOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <GraphsContainer
              parser={parser}
              algorithmName={algorithmName}
              selectedChart={selectedChart}
            />
          </div>
        )}
      </main>
      
      <footer className="mt-12 p-4 bg-gray-100 text-center text-gray-600">
        <p>CPU Scheduling Simulator &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;