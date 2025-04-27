import React, { useState, useEffect, useRef } from 'react';
import { GanttChartEntry } from '../../services/types';

interface GanttChartProps {
  ganttData: GanttChartEntry[];
  speed?: number; // Animation speed in milliseconds per time unit
  initialTime?: number; // Time to resume from when chart loads
  onPause?: (currentTime: number) => void; // Callback when chart is paused
  onResume?: () => void; // Callback when chart is resumed
  onTimeUpdate?: (currentTime: number) => void; // Callback for continuous time updates
  onReset?: () => void; // Add reset handler prop
}

// Function to generate a color based on process ID - modern color palette with transparency
const getProcessColor = (processId: number): string => {
  // Special case for idle process (process ID -1)
  if (processId === -1) {
    return 'bg-gray-200';
  }
  
  const colors = [
    'bg-indigo-500/60',   // Indigo 
    'bg-pink-500/60',     // Pink 
    'bg-teal-500/60',     // Teal 
    'bg-amber-500/60',    // Amber 
    'bg-emerald-500/60',  // Emerald 
    'bg-violet-500/60',   // Violet 
    'bg-rose-500/60',     // Rose 
    'bg-lime-500/60',     // Lime 
    'bg-sky-500/60',      // Sky 
    'bg-orange-500/60',   // Orange
    'bg-cyan-500/60',     // Cyan
    'bg-fuchsia-500/60',  // Fuchsia
    'bg-red-500/60',      // Red
    'bg-blue-500/60',     // Blue
    'bg-green-500/60',    // Green
  ];
  
  return colors[processId % colors.length];
};

// Function to get border color to match the translucent fill
const getBorderColor = (processId: number): string => {
  // Special case for idle process (process ID -1)
  if (processId === -1) {
    return 'border-gray-400';
  }
  
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
    'border-orange-600',
    'border-cyan-600',
    'border-fuchsia-600',
    'border-red-600',
    'border-blue-600',
    'border-green-600',
  ];
  
  return colors[processId % colors.length];
};

// Get queue level color
const getQueueLevelColor = (level: number): string => {
  const colors = [
    'bg-red-200',    // Level 0: High priority
    'bg-yellow-200', // Level 1: Medium priority
    'bg-green-200',  // Level 2: Low priority
    'bg-blue-200',   // Level 3
    'bg-purple-200', // Level 4
  ];
  
  return colors[level % colors.length];
};

const GanttChart: React.FC<GanttChartProps> = ({ 
  ganttData, 
  speed = 300, 
  initialTime = 0,
  onPause,
  onResume,
  onTimeUpdate,
  onReset
}) => {
  const [currentTime, setCurrentTime] = useState<number>(initialTime);
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // Start paused by default
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
  
  // Initialize with the provided initialTime
  useEffect(() => {
    setCurrentTime(initialTime);
  }, [initialTime]);
  
  // Check if chart is complete
  useEffect(() => {
    // Notify parent when chart is completed (treat as paused)
    if (currentTime >= totalExecutionTime && onPause) {
      setIsPlaying(false);
      onPause(totalExecutionTime);
    }
  }, [currentTime, totalExecutionTime, onPause]);
    
  // Process the gantt data to create segments (merging consecutive same process)
  useEffect(() => {
    if (!ganttData || ganttData.length === 0) return;
    
    const segments: {
      processId: number;
      startTime: number;
      endTime: number;
      queueLevel: number | undefined;
      readyQueue: number[] | undefined;
      readyQueues: { [key: string]: number[] } | undefined;
    }[] = [];
    
    // Check the first entry to determine the data format
    const firstEntry = ganttData[0];
    const isMultiLevelQueue = firstEntry.ready_queues !== undefined;
    
    // Start with the first entry
    let currentSegment = {
      processId: firstEntry.process_id,
      startTime: firstEntry.start_time,
      endTime: firstEntry.end_time,
      queueLevel: firstEntry.queue_level,
      readyQueue: firstEntry.ready_queue ? [...firstEntry.ready_queue] : undefined,
      readyQueues: firstEntry.ready_queues ? { ...firstEntry.ready_queues } : undefined
    };
    
    for (let i = 1; i < ganttData.length; i++) {
      const entry = ganttData[i];
      
      // If this entry continues the same process, extend the current segment
      if (entry.process_id === currentSegment.processId && entry.queue_level === currentSegment.queueLevel) {
        currentSegment.endTime = entry.end_time;
        
        // Update ready queue information
        if (isMultiLevelQueue && entry.ready_queues) {
          currentSegment.readyQueues = { ...entry.ready_queues };
        } else if (entry.ready_queue) {
          currentSegment.readyQueue = [...entry.ready_queue];
        }
      } else {
        // Otherwise, save the current segment and start a new one
        segments.push({ ...currentSegment });
        currentSegment = {
          processId: entry.process_id,
          startTime: entry.start_time,
          endTime: entry.end_time,
          queueLevel: entry.queue_level,
          readyQueue: entry.ready_queue ? [...entry.ready_queue] : undefined,
          readyQueues: entry.ready_queues ? { ...entry.ready_queues } : undefined
        };
      }
    }
    
    // Add the last segment
    segments.push({ ...currentSegment });
    
    setProcessSegments(segments);
    
    // Update visible segments based on current time
    updateVisibleSegments(segments, currentTime);
  }, [ganttData]);
  
  // Update visible segments as time progresses
  const updateVisibleSegments = (segments: any[], time: number) => {
    // Only show segments that have started by the current time
    const visible = segments.filter(segment => 
      segment.startTime <= time
    );
    setVisibleSegments(visible);
  };
  
  useEffect(() => {
    updateVisibleSegments(processSegments, currentTime);
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
      
      // Notify parent when chart completes (treat as paused)
      if (currentTime >= totalExecutionTime && onPause) {
        onPause(totalExecutionTime);
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
          
          // Notify parent about time update during animation
          if (onTimeUpdate) {
            onTimeUpdate(newTime);
          }
          
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
  }, [isPlaying, currentTime, totalExecutionTime, animationSpeed, onPause, onTimeUpdate]);
  
  // Effect to notify parent component when chart is paused
  useEffect(() => {
    if (!isPlaying && onPause && currentTime > 0) {
      onPause(currentTime);
    }
  }, [isPlaying, currentTime, onPause]);
  
  // Notify parent about initial paused state on component mount
  useEffect(() => {
    if (onPause) {
      onPause(currentTime);
    }
  }, []);
  
  // Find current process
  const currentProcess = ganttData.find(
    entry => currentTime >= entry.start_time && currentTime < entry.end_time
  );
  
  const handlePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    if (newPlayingState && onResume) {
      // Notify parent component when resuming
      onResume();
    } else if (!newPlayingState && onPause) {
      // Notify parent component when pausing
      onPause(currentTime);
    }
  };
  
  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false); // Start paused after reset
    
    if (onPause) {
      onPause(0);
    }
    
    // Also notify about time update on reset
    if (onTimeUpdate) {
      onTimeUpdate(0);
    }
    
    // Call parent reset handler if provided
    if (onReset) {
      onReset();
    }
  };
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    // Update visible segments right away
    updateVisibleSegments(processSegments, newTime);
    
    // Notify parent about time update
    if (onTimeUpdate) {
      onTimeUpdate(newTime);
    }
    
    // Pause playback when slider is manually changed
    if (isPlaying) {
      setIsPlaying(false);
      if (onPause) {
        onPause(newTime);
      }
    }
  };
  
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(e.target.value, 10);
    setAnimationSpeed(newSpeed);
  };
  
  return (
    <div className="w-full max-w-full mx-auto my-2 p-3 rounded-lg shadow-sm bg-white">
      <h2 className="text-center text-base font-semibold mb-2 text-gray-800">Process Execution Gantt Chart</h2>
      
      <div className="flex flex-wrap items-center mb-2 gap-2">
        <button 
          onClick={handlePlayPause}
          className={`px-2 py-1 text-xs text-white rounded-md transition-colors font-medium focus:outline-none focus:ring-1 focus:ring-offset-1 ${isPlaying 
            ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' 
            : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'}`}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button 
          onClick={handleReset}
          className="px-2 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-offset-1"
        >
          Reset
        </button>
        <div className="ml-auto text-sm font-medium">
          Time: {currentTime.toFixed(1)} / {totalExecutionTime}
        </div>
      </div>
      
      {/* Speed controls */}
      <div className="flex items-center mb-2 gap-2">
        <span className="text-xs font-medium text-gray-700">Speed:</span>
        <div className="flex items-center flex-1 gap-1">
          <span className="text-xs text-gray-500">Faster</span>
          <input
            type="range"
            min="50"
            max="800"
            step="50"
            value={animationSpeed}
            onChange={handleSpeedChange}
            className="w-full h-1 rounded-lg appearance-none bg-gray-300 cursor-pointer"
          />
          <span className="text-xs text-gray-500">Slower</span>
        </div>
        <span className="text-xs font-medium w-10 text-right">{animationSpeed}ms</span>
      </div>
      
      {/* Time slider */}
      <div className="mb-2">
        <input
          type="range"
          min="0"
          max={totalExecutionTime}
          step="0.1"
          value={currentTime}
          onChange={handleSliderChange}
          className="w-full h-1 rounded-lg appearance-none bg-gray-300 cursor-pointer"
        />
      </div>
      
      <div className="flex justify-center mb-2 p-2 bg-gray-50 rounded-md shadow-sm">
        {currentProcess ? (
          <div className="text-sm font-medium">
            Current Process: <span className="font-bold text-indigo-700">
              {currentProcess.process_id === -1 
                ? 'Idle (CPU waiting)' 
                : `P${currentProcess.process_id}`}
            </span>
            {currentProcess.queue_level !== undefined && (
              <span className="ml-2 text-gray-600">(Queue {currentProcess.queue_level})</span>
            )}
          </div>
        ) : (
          <div className="text-sm font-medium text-center">
            {currentTime === 0 ? 'Ready to Start' : 'Execution Complete'}
          </div>
        )}
      </div>
      
      {/* Scrollable container for chart */}
      <div className="relative w-full overflow-x-auto pb-4 rounded-lg px-2" ref={chartContainerRef}>
        <div 
          className="relative h-24 bg-gray-50 rounded-lg shadow-inner border border-gray-200"
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
            const queueLevelClass = segment.queueLevel !== undefined ? getQueueLevelColor(segment.queueLevel) : '';
                
            return (
              <div 
                key={index}
                className={`absolute h-[30px] top-[12px] rounded-md overflow-hidden border-2 ${borderColorClass} shadow-sm bg-white/80`}
                style={{
                  width: `${segmentWidth}%`,
                  left: `${segmentLeft}%`,
                }}
                title={`Process ${segment.processId === -1 ? 'Idle' : segment.processId}: ${segment.startTime} - ${segment.endTime}${segment.queueLevel !== undefined ? ` (Queue ${segment.queueLevel})` : ''}`}
              >
                {/* Filled portion with translucent color */}
                <div 
                  className={`absolute h-full ${processColorClass} backdrop-blur-sm transition-all duration-300 ease-out`}
                  style={{ width: `${filledWidth}%` }}
                />
                
                {/* Queue level indicator (if available) */}
                {segment.queueLevel !== undefined && (
                  <div className="absolute top-0 right-0 px-1 text-[10px] rounded-bl bg-gray-100 text-gray-700 z-10">
                    Q{segment.queueLevel}
                  </div>
                )}
                
                {/* Process label */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-800 font-bold z-10 text-sm">
                  {segment.processId === -1 ? 'Idle' : `P${segment.processId}`}
                </div>
              </div>
            );
          })}
          
          {/* Separate Time Bars Section with adjusted positioning */}
          <div className="absolute top-[55px] left-0 right-0 h-12 px-8">
            {/* Create a set of unique time points to avoid duplicates */}
            {(() => {
              const timePoints = new Set<number>();
              
              // Add start and end times from all segments
              processSegments.forEach(segment => {
                timePoints.add(segment.startTime);
                timePoints.add(segment.endTime);
              });
              
              // Convert to sorted array
              const sortedTimes = Array.from(timePoints).sort((a, b) => a - b);
              
              // If too many time points, filter to reasonable number
              const filteredTimes = sortedTimes.length > 20 
                ? sortedTimes.filter((_, idx) => idx % Math.ceil(sortedTimes.length / 20) === 0)
                : sortedTimes;
              
              // Always include start and end points
              if (sortedTimes.length > 0 && !filteredTimes.includes(sortedTimes[0])) {
                filteredTimes.unshift(sortedTimes[0]);
              }
              if (sortedTimes.length > 0 && !filteredTimes.includes(sortedTimes[sortedTimes.length - 1])) {
                filteredTimes.push(sortedTimes[sortedTimes.length - 1]);
              }
              
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
                  <div className="absolute top-0 w-0.5 h-3 bg-gray-500 rounded"></div>
                  
                  {/* Time label */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                    <div className="px-1 py-0.5 bg-white text-[10px] font-medium text-gray-700 border border-gray-300 rounded shadow-sm whitespace-nowrap">
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
            <div className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 text-[10px] text-white font-bold bg-rose-600 px-1 py-0.5 rounded-md shadow-sm">
              {currentTime.toFixed(1)}
            </div>
          </div>
        
        </div>
      </div>
      
      {/* Legend for process colors */}
      <div className="mt-2 flex flex-wrap gap-1 justify-center">
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded-md">
          <div className="w-3 h-3 bg-gray-200 border border-gray-400 rounded"></div>
          <span className="text-[10px] text-gray-600">Idle</span>
        </div>
        {Array.from(new Set(ganttData.map(entry => entry.process_id)))
          .filter(pid => pid !== -1)
          .sort((a, b) => a - b)
          .map(pid => (
            <div key={`legend-${pid}`} className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded-md">
              <div className={`w-3 h-3 ${getProcessColor(pid)} border ${getBorderColor(pid)} rounded`}></div>
              <span className="text-[10px] text-gray-600">P{pid}</span>
            </div>
          ))
        }
      </div>
      
      {/* Queue level legend (if MLQ/MLFQ) */}
      {ganttData.some(entry => entry.queue_level !== undefined) && (
        <div className="mt-1 flex flex-wrap gap-1 justify-center">
          <span className="text-[10px] text-gray-600 mr-1">Queue Levels:</span>
          {Array.from(new Set(ganttData.filter(entry => entry.queue_level !== undefined).map(entry => entry.queue_level)))
            .sort((a, b) => a! - b!)
            .map(level => (
              <div key={`level-${level}`} className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded-md">
                <div className={`w-3 h-3 ${getQueueLevelColor(level!)} border border-gray-400 rounded`}></div>
                <span className="text-[10px] text-gray-600">Q{level}</span>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
};

export default GanttChart;