import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// Remove the default App.css import if it exists
// import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    // Add Tailwind classes for basic layout and styling
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">CPU Scheduling Visualizer</h1>
      {/* Placeholder for Input Form */}
      <div className="bg-white p-6 rounded shadow-md mb-8 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Process Input</h2>
        {/* Input form components will go here */}
        <p className="text-gray-500">Input form placeholder...</p>
      </div>

      {/* Placeholder for Gantt Chart */}
      <div className="bg-white p-6 rounded shadow-md w-full max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">Gantt Chart</h2>
        {/* Gantt chart component will go here */}
        <p className="text-gray-500">Gantt chart placeholder...</p>
      </div>

      {/* Example Vite counter (optional, can be removed) */}
      <div className="mt-10 flex items-center space-x-4">
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="h-10" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="h-10 animate-spin" alt="React logo" />
        </a>
      </div>
      <p className="mt-4 text-gray-700">Vite + React</p>
      <div className="mt-4 p-4 border rounded bg-gray-50">
        <button className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600" onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p className="mt-2 text-sm text-gray-600">
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="mt-4 text-xs text-gray-500">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
