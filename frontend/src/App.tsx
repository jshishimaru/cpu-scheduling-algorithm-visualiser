import React, { useState, useEffect } from 'react';
import { Parser } from './services/parser';
import { dummySchedulerData, largeDataset } from './data/dummyData';
import VisualizationContainer from './components/VisualizationContainer/VisualizationContainer';
import NewProcessForm, { NewProcessData } from './components/NewProcessForm/NewProcessForm';
import NewProcessTable from './components/NewProcessTable/NewProcessTable';
import PauseNotification from './components/PauseNotification/PauseNotification';
import RescheduleButton from './components/RescheduleButton/RescheduleButton';
import ReadyQueue from './components/Queue/ReadyQueue';
// import InputForm from './components/InputForm/InputForm';
// import { Parser } from './services/parser';
// import { dummySchedulerData, largeDataset } from './data/dummyData';
import GraphsContainer from './components/Graphs/GraphsContainer';

function App() {
  const [parser, setParser] = useState<Parser | null>(null);
  const [selectedChart, setSelectedChart] = useState<string>('turnaround'); // Default chart type
  const [parsedData, setParsedData] = useState<any>(null);
  const [isPaused, setIsPaused] = useState<boolean>(true); // Set paused to true by default
  const [pausedTime, setPausedTime] = useState<number>(0);
  const [needsReschedule, setNeedsReschedule] = useState<boolean>(false);
  const [newProcesses, setNewProcesses] = useState<NewProcessData[]>([]);
  
  // Effect to load initial data
  useEffect(() => {
    fetchAndParseData();
  }, []);
  
  // Effect to handle rescheduling
  useEffect(() => {
    if (needsReschedule) {
      fetchAndParseData();
      setNeedsReschedule(false);
      // Resume the chart after rescheduling
      setIsPaused(false);
    }
  }, [needsReschedule]);
  
  const fetchAndParseData = () => {
    // In a real app, you would fetch data from the backend
    // For now, use the dummy data to test the component
    console.log("New processes to send to backend:", newProcesses);
    
    const parser = new Parser();
    const success = parser.parse(dummySchedulerData);
    
    if (success) {
      setParsedData({
        ganttChart: parser.getGanttChart(),
        processStats: parser.getProcessStats(),
      });
      setParser(parser);
      
      // Clear the new processes list after rescheduling
      setNewProcesses([]);
    } else {
      console.error("Failed to parse scheduler data");
    }
  };
  
  const handleChartPause = (currentTime: number) => {
    setPausedTime(currentTime);
    setIsPaused(true);
  };
  
  const handleChartResume = () => {
    setIsPaused(false);
  };
  
  const handleAddProcess = (newProcess: NewProcessData) => {
    setNewProcesses(prev => [...prev, newProcess]);
  };
  
  const handleReschedule = () => {
    setNeedsReschedule(true);
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
  
  // Get algorithm name from parser
  const algorithmName = parser?.getGanttChart() && parser.getGanttChart().length > 0 
    ? dummySchedulerData.scheduling_algorithm 
    : 'CPU Scheduling Algorithm';
  
  return (
    <div className="App">
      <header className="bg-gray-800 text-white p-4 mb-6">
        <h1 className="text-3xl font-bold">CPU Scheduler Simulator</h1>
        {/* {algorithmName && (
          <p className="text-lg mt-2">Algorithm: <span className="font-semibold">{algorithmName}</span></p>
        )} */}
      </header>
      
      <main className="container mx-auto px-4">
        {/* Simulation paused notification */}
        {isPaused && <PauseNotification pausedTime={pausedTime} />}
        
        {/* New Process Form - only visible when paused */}
        {isPaused && (
          <NewProcessForm 
            currentTime={pausedTime} 
            onAddProcess={handleAddProcess} 
            isVisible={true} 
          />
        )}
        
        {/* Reschedule button - only visible when paused with new processes */}
        {isPaused && newProcesses.length > 0 && (
          <RescheduleButton onClick={handleReschedule} />
        )}

        {/* New processes table */}
        <NewProcessTable processes={newProcesses} />
        
        {/* Visualization Container */}
        {parsedData && (
          <VisualizationContainer
            schedulerData={dummySchedulerData}
            // ganttData={parsedData.ganttChart}
          />
        )}
        
        {/* Graphs container for analytics */}
        {parser && (
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
        
        {!parsedData && (
          <div className="my-10 text-center p-8 bg-gray-50 rounded-lg shadow-md">
            <p className="text-lg text-gray-600">Loading scheduling data...</p>
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