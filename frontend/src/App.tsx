import React, { useState, useEffect } from 'react';
import GanttChart from './components/GanttChart/GanttChart';
import { Parser } from './services/parser';
import { dummySchedulerData } from './data/dummyData';

function App() {
  const [parsedData, setParsedData] = useState<any>(null);
  
  useEffect(() => {
    // In a real app, you would fetch data from the backend
    // For now, use the dummy data to test the component
    const parser = new Parser();
    const success = parser.parse(dummySchedulerData);
    
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
    <div className="text-center font-sans">
      <header className="bg-gray-800 p-5 text-white">
        <h1 className="text-2xl font-bold">Real-Time Process Scheduler</h1>
      </header>
      
      <main className="max-w-6xl mx-auto p-5">
        {parsedData ? (
          <GanttChart ganttData={parsedData.ganttChart} />
        ) : (
          <div className="my-10 text-lg text-gray-600">Loading data...</div>
        )}
      </main>
    </div>
  );
}

export default App;
