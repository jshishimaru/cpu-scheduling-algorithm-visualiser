import React, { useState, useEffect } from 'react';
// import './App.css';
import GanttChart from './components/GanttChart/GanttChart';
import InputForm from './components/InputForm/InputForm';
import { Parser } from './services/parser';
import { dummySchedulerData, largeDataset } from './data/dummyData';

function App() {
  const [parsedData, setParsedData] = useState<any>(null);
  
  useEffect(() => {
    // In a real app, you would fetch data from the backend
    // For now, use the dummy data to test the component
    const parser = new Parser();
    const success = parser.parse(largeDataset);
    
    if (success) {
      setParsedData({
        ganttChart: parser.getGanttChart(),
        processStats: parser.getProcessStats(),
      });
    } else {
      console.error("Failed to parse scheduler data");
    }
  }, []);
  
  return (
    <div className="App">
      <header className="bg-gray-800 text-white p-4 mb-6">
        <h1 className="text-3xl font-bold">CPU Scheduler Simulator</h1>
      </header>
      <main className="container mx-auto px-4">
        <InputForm />
        {parsedData ? (
          <GanttChart ganttData={parsedData.ganttChart} />
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
