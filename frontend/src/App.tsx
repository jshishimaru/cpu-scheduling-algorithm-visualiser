function App() {
  return (
    // Changed to dark background gradient
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-10">
        CPU Scheduling Visualizer
      </h1>
      
      {/* Dark themed Input Form Card */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-10 w-full max-w-md border border-gray-700 hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-bold mb-6 text-gray-200 border-b border-gray-700 pb-2">Process Input</h2>
        {/* Input form components will go here */}
        <p className="text-gray-400 italic">Input form placeholder...</p>
      </div>

      {/* Updated Gantt Chart Card (already dark) */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-4xl border border-gray-700 hover:shadow-2xl transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 text-gray-200 border-b border-gray-600 pb-2">Gantt Chart</h2>
        <p className="text-gray-400 italic">Gantt chart placeholder...</p>
      </div>	

      {/* Footer with just copyright - removing all Vite/React logos and example code */}
      <div className="mt-16">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} CPU Scheduling Visualizer
        </p>
      </div>
    </div>
  )
}

export default App
