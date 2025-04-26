import React, { useState, useEffect, useRef } from 'react';
import { GanttChartEntry } from '../../services/parser';

interface GanttChartProps {
  ganttData: GanttChartEntry[];
  speed?: number; // Animation speed in milliseconds per time unit
}

// Function to generate a color based on process ID - modern color palette with transparency
const getProcessColor = (processId: number): string => {
  const colors = [
    'bg-indigo-500/70',   // Indigo with transparency
    'bg-pink-500/70',     // Pink with transparency
    'bg-teal-500/70',     // Teal with transparency
    'bg-amber-500/70',    // Amber with transparency
    'bg-emerald-500/70',  // Emerald with transparency
    'bg-violet-500/70',   // Violet with transparency
    'bg-rose-500/70',     // Rose with transparency
    'bg-lime-500/70',     // Lime with transparency
    'bg-sky-500/70',      // Sky with transparency
  ];
  
  return colors[processId % colors.length];
};

// Function to get border color to match the translucent fill
const getBorderColor = (processId: number): string => {
  const colors = [
    'border-indigo-600',
    'border-pink-600',
    'border-teal-600',
    'border-amber-600',
    'border-emerald-600',
    'border-violet-600',
    'border-rose-600',
    'border-lime-600',
    'border-sky-600',
  ];
  
  return colors[processId % colors.length];
};

const GanttChart: React.FC<GanttChartProps> = ({ ganttData, speed = 300 }) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [processSegments, setProcessSegments] = useState<any[]>([]);
  const [visibleSegments, setVisibleSegments] = useState<any[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(speed);
  const [chartWidth, setChartWidth] = useState<number>(100); // percentage of container width
  const animationRef = useRef<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Calculate total execution time
  const totalExecutionTime = ganttData.length > 0 
    ? Math.max(...ganttData.map(entry => entry.end_time))
    : 0;
    
  // Process the gantt data to create segments (merging consecutive same process)
  useEffect(() => {
    if (!ganttData || ganttData.length === 0) return;
    
    const segments: {
      processId: number;
      startTime: number;
      endTime: number;
      readyQueue: number[];
    }[] = [];
    
    let currentSegment = {
      processId: ganttData[0].process_id,
      startTime: ganttData[0].start_time,
      endTime: ganttData[0].end_time,
      readyQueue: [...ganttData[0].ready_queue]
    };
    
    for (let i = 1; i < ganttData.length; i++) {
      const entry = ganttData[i];
      
      // If this entry continues the same process, extend the current segment
      if (entry.process_id === currentSegment.processId) {
        currentSegment.endTime = entry.end_time;
        currentSegment.readyQueue = [...entry.ready_queue];
      } else {
        // Otherwise, save the current segment and start a new one
        segments.push({ ...currentSegment });
        currentSegment = {
          processId: entry.process_id,
          startTime: entry.start_time,
          endTime: entry.end_time,
          readyQueue: [...entry.ready_queue]
        };
      }
    }
    
    // Add the last segment
    segments.push({ ...currentSegment });
    
    setProcessSegments(segments);
    // Start with empty visible segments
    setVisibleSegments([]);
  }, [ganttData]);
  
  // Update visible segments as time progresses
  useEffect(() => {
    // Only show segments that have started by the current time
    const visible = processSegments.filter(segment => 
      segment.startTime <= currentTime
    );
    setVisibleSegments(visible);
  }, [currentTime, processSegments]);
  
  // Determine chart width based on number of segments and their duration
  useEffect(() => {
    if (processSegments.length > 0) {
      // For many processes or long total duration, make the chart wider
      const segmentCount = processSegments.length;
      // Base width starts at 100%, increases with more segments
      let width = 100;
      
      if (segmentCount > 10) {
        // Each segment over 10 adds 8% width
        width += (segmentCount - 10) * 8;
      }
      
      // Cap at reasonable maximum (500%)
      setChartWidth(Math.min(Math.max(width, 100), 500));
    } else {
      setChartWidth(100);
    }
  }, [processSegments]);
  
  // Animation logic with adjustable speed
  useEffect(() => {
    if (!isPlaying || currentTime >= totalExecutionTime) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    let lastTime = performance.now();
    let elapsed = 0;
    const timeStep = 0.05; // Smaller step for smoother animation
    
    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      elapsed += deltaTime;
      
      // Use smaller time increments for smoother animation
      if (elapsed >= animationSpeed) {
        const increment = (elapsed / animationSpeed) * timeStep;
        
        setCurrentTime(prev => {
          const newTime = Math.min(prev + increment, totalExecutionTime);
          return newTime;
        });
        
        elapsed = 0;
        lastTime = time;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime, totalExecutionTime, animationSpeed]);
  
  // Find current process
  const currentProcess = ganttData.find(
    entry => currentTime >= entry.start_time && currentTime < entry.end_time
  );
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleReset = () => {
    setCurrentTime(0);
    setVisibleSegments([]);
    setIsPlaying(true);
  };
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };
  
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(e.target.value, 10);
    setAnimationSpeed(newSpeed);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto my-5 p-5 rounded-lg shadow-md bg-white">
      <h2 className="text-center text-xl font-bold mb-5 text-gray-800">Process Execution Gantt Chart</h2>
      
      <div className="flex flex-wrap items-center mb-3 gap-2">
        <button 
          onClick={handlePlayPause}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Reset
        </button>
        <div className="ml-auto font-medium">
          Time: {currentTime.toFixed(1)} / {totalExecutionTime}
        </div>
      </div>
      
      {/* Speed controls */}
      <div className="flex items-center mb-5 gap-3">
        <span className="text-sm font-medium text-gray-700">Speed:</span>
        <div className="flex items-center flex-1 gap-2">
          <span className="text-sm text-gray-500">Faster</span>
          <input
            type="range"
            min="50"
            max="800"
            step="50"
            value={animationSpeed}
            onChange={handleSpeedChange}
            className="w-full h-2 rounded-lg appearance-none bg-gray-300 cursor-pointer"
          />
          <span className="text-sm text-gray-500">Slower</span>
        </div>
        <span className="text-sm font-medium w-14 text-right">{animationSpeed}ms</span>
      </div>
      
      {/* Time slider */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={totalExecutionTime}
          step="0.1"
          value={currentTime}
          onChange={handleSliderChange}
          className="w-full h-2 rounded-lg appearance-none bg-gray-300 cursor-pointer"
        />
      </div>
      
      <div className="flex justify-center mb-4 p-3 bg-gray-50 rounded-md shadow-sm">
        {currentProcess ? (
          <div className="font-medium">
            Current Process: <span className="font-bold text-indigo-700">P{currentProcess.process_id}</span>
          </div>
        ) : (
          <div className="font-medium text-center">
            {currentTime === 0 ? 'Ready to Start' : 'Execution Complete'}
          </div>
        )}
      </div>
      
      {/* Scrollable container for chart */}
      <div className="relative w-full overflow-x-auto pb-6 rounded-lg px-4" ref={chartContainerRef}>
        <div 
          className="relative h-36 bg-gray-50 rounded-lg shadow-inner border border-gray-200"
		  style={{
            // Add padding before first segment and after last segment (5% on each side)
            paddingLeft: '5%',
            paddingRight: '5%',
            width: `${chartWidth + 10}%`  // Add 10% to accommodate the padding
          }}
        >
          {/* Main Process Segments */}
          {visibleSegments.map((segment, index) => {
            const segmentWidth = ((segment.endTime - segment.startTime) / totalExecutionTime) * 100;
            const segmentLeft = (segment.startTime / totalExecutionTime) * 100;
            
            const filledWidth = currentTime <= segment.startTime
              ? 0
              : currentTime >= segment.endTime
                ? 100
                : ((currentTime - segment.startTime) / (segment.endTime - segment.startTime)) * 100;
                
            const processColorClass = getProcessColor(segment.processId);
            const borderColorClass = getBorderColor(segment.processId);
                
            return (
              <div 
                key={index}
                className={`absolute h-[40px] top-[15px] rounded-md overflow-hidden border-2 ${borderColorClass} shadow-md bg-white/80`}
                style={{
                  width: `${segmentWidth}%`,
                  left: `${segmentLeft}%`,
                }}
                title={`Process ${segment.processId}: ${segment.startTime} - ${segment.endTime}`}
              >
                {/* Filled portion with translucent color */}
                <div 
                  className={`absolute h-full ${processColorClass} backdrop-blur-sm transition-all duration-300 ease-out`}
                  style={{ width: `${filledWidth}%` }}
                />
                
                {/* Process label */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-800 font-bold z-10 text-lg">
                  P{segment.processId}
                </div>
              </div>
            );
          })}
          
          {/* Separate Time Bars Section with adjusted positioning */}
          <div className="absolute top-[70px] left-0 right-0 h-20 px-8">
            {/* Create a set of unique time points to avoid duplicates */}
            {(() => {
              const timePoints = new Set<number>();
              
              // Add start and end times from all segments
              visibleSegments.forEach(segment => {
                timePoints.add(segment.startTime);
                timePoints.add(segment.endTime);
              });
              
              // Convert to sorted array
              const sortedTimes = Array.from(timePoints).sort((a, b) => a - b);
              
              // If too many time points, filter to reasonable number
              const filteredTimes = sortedTimes.length > 20 
                ? sortedTimes.filter((_, idx) => idx % Math.ceil(sortedTimes.length / 20) === 0)
                : sortedTimes;
              
              // Render time markers for each unique time point
              return filteredTimes.map((time, index) => (
                <div 
                  key={`time-${index}`}
                  className="absolute"
                  style={{
                    left: `${(time / totalExecutionTime) * 100}%`,
                  }}
                >
                  {/* Time line */}
                  <div className="absolute top-0 w-0.5 h-5 bg-gray-500 rounded"></div>
                  
                  {/* Time label */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                    <div className="px-1.5 py-0.5 bg-white text-xs font-medium text-gray-700 border border-gray-300 rounded shadow-sm whitespace-nowrap">
                      {time.toFixed(1)}
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
          
          {/* Current time indicator - adjusted for container padding */}
          <div 
            className="absolute top-0 h-full w-0.5 bg-rose-600 z-20 transition-all duration-100 ease-linear"
            style={{ 
              left: `${(currentTime / totalExecutionTime) * 100}%`,
            }}
          >
            <div className="absolute top-[-18px] left-1/2 transform -translate-x-1/2 text-xs text-white font-bold bg-rose-600 px-2 py-0.5 rounded-md shadow-sm">
              {currentTime.toFixed(1)}
            </div>
          </div>
          
          {/* Time markers at the bottom - filter if too many */}
          {/* <div className="absolute w-full h-5 bottom-[-25px] px-8">
            {(() => {
              // Limit number of time markers based on total execution time
              const maxMarkers = Math.min(Math.ceil(totalExecutionTime) + 1, 30);
              const step = Math.max(1, Math.ceil(totalExecutionTime / 29));
              
              return Array.from({ length: maxMarkers }, (_, i) => {
                const value = i * step;
                if (value > totalExecutionTime) return null;
                
                return (
                  <div 
                    key={i} 
                    className="absolute h-2.5 w-px bg-gray-400"
                    style={{ left: `${(value / totalExecutionTime) * 100}%` }}
                  >
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                      {value}
                    </div>
                  </div>
                );
              }).filter(Boolean);
            })()}
          </div> */}
        </div>
      </div>
      
      {/* Scroll indicator - show only when chart is wider than container */}
      {/* {chartWidth > 100 && (
        <div className="flex justify-center mt-2 text-sm text-gray-500">
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Scroll horizontally to view the complete chart
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      )} */}
    </div>
  );
};

export default GanttChart;
