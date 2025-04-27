// Interfaces representing the data structure from backend
export interface GanttChartEntry {
  process_id: number;
  start_time: number;
  end_time: number;
  ready_queue?: number[];
  queue_level?: number;
  ready_queues?: {
    [key: string]: number[];
  };
}

export interface ProcessStats {
  process_id: number;
  arrival_time: number;
  burst_time: number;
  completion_time: number;
  turnaround_time: number;
  waiting_time: number;
  final_queue_level?: number; 
  priority?: number;
  
}

export interface SchedulerData {
  gantt_chart: GanttChartEntry[];
  process_stats: ProcessStats[];
  scheduling_algorithm: string;
}

export interface MLQGanttChartEntry {
  process_id: number;
  start_time: number;
  end_time: number;
  queues: number[][];
  queue_level: number;
}

export interface MLQSchedulerData {
  gantt_chart: MLQGanttChartEntry[];
  process_stats: ProcessStats[];
  scheduling_algorithm: string;
}

// Interface for input data to be saved
export interface SchedulerInput {
  scheduling_type: string;
  quantum?: number;
  num_of_queues?: number;
  aging?: boolean; 
  processes: {
    p_id: number; 
    arrival_time: number;
    burst_time: number;
    priority: number;
  }[];
}
