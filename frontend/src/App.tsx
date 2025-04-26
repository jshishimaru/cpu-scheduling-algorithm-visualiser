import React, { useState, useEffect } from 'react';
// import './App.css';
import GanttChart from './components/GanttChart/GanttChart';
import InputForm from './components/InputForm/InputForm';
import { Parser } from './services/parser';
import { dummySchedulerData, largeDataset } from './data/dummyData';
import GraphsContainer from './components/Graphs/GraphsContainer';

function App() {
  const [parsedData, setParsedData] = useState<any>(null);
  const [parser, setParser] = useState<Parser | null>(null);
  const [selectedChart, setSelectedChart] = useState<string>('turnaround'); // Default chart type
  
  useEffect(() => {
    // In a real app, you would fetch data from the backend
    // For now, use the dummy data to test the component
    const parser = new Parser();
    const success = parser.parse(largeDataset);
    
    if (success) {
      setParsedData({
        ganttChart: parserInstance.getGanttChart(),
        processStats: parserInstance.getProcessStats(),
      });
      setParser(parserInstance);
    } else {
      console.error("Failed to parse scheduler data");
    }
  }, []);
  
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
  
  return (
    <div className="App">
      <header className="bg-gray-800 text-white p-4 mb-6">
        <h1 className="text-3xl font-bold">CPU Scheduler Simulator</h1>
      </header>
      
      <main className="max-w-6xl mx-auto p-5">
        {parsedData && parser ? (
          <>
            <GanttChart ganttData={parsedData.ganttChart} />
            
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-5">Performance Metrics</h2>
              
              <div className="mb-6">
                <label htmlFor="chart-select" className="font-medium text-gray-700 mr-3">
                  Select Chart Type:
                </label>
                <select
                  id="chart-select"
                  value={selectedChart}
                  onChange={(e) => setSelectedChart(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                algorithmName="FCFS" // You might want to make this dynamic based on your actual algorithm
                selectedChart={selectedChart} 
              />
            </div>
          </>
        ) : (
          <div className="my-10 text-lg text-gray-600">Loading data...</div>
        )}
      </main>
      <footer className="mt-12 p-4 bg-gray-100 text-center text-gray-600">
        <p>Real-time CPU Scheduler Simulator &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;