// Interfaces representing the data structure from backend
export interface GanttChartEntry {
  process_id: number;
  start_time: number;
  end_time: number;
  ready_queue: number[];
}

export interface ProcessStats {
  process_id: number;
  arrival_time: number;
  burst_time: number;
  completion_time: number;
  turnaround_time: number;
  waiting_time: number;
}

export interface SchedulerData {
  gantt_chart: GanttChartEntry[];
  process_stats: ProcessStats[];
}

export class Parser {
  private data: SchedulerData | null = null;
  
  /**
   * Parse the JSON data from backend
   * @param jsonData - JSON string or object from backend
   * @returns true if parsing was successful, false otherwise
   */
  parse(jsonData: string | object): boolean {
    try {
      if (typeof jsonData === 'string') {
        this.data = JSON.parse(jsonData);
      } else {
        this.data = jsonData as SchedulerData;
      }
      return this.validate();
    } catch (error) {
      console.error('Failed to parse scheduler data:', error);
      return false;
    }
  }

  /**
   * Validate that the parsed data has the expected structure
   * @returns true if data is valid, false otherwise
   */
  private validate(): boolean {
    if (!this.data) return false;
    if (!Array.isArray(this.data.gantt_chart) || !Array.isArray(this.data.process_stats)) {
      return false;
    }
    return true;
  }

  /**
   * Get the parsed gantt chart data
   * @returns Array of GanttChartEntry or empty array if data is not available
   */
  getGanttChart(): GanttChartEntry[] {
    return this.data?.gantt_chart || [];
  }

  /**
   * Get the parsed process statistics
   * @returns Array of ProcessStats or empty array if data is not available
   */
  getProcessStats(): ProcessStats[] {
    return this.data?.process_stats || [];
  }

  /**
   * Get process statistics for a specific process
   * @param processId - ID of the process
   * @returns ProcessStats object or null if not found
   */
  getProcessStatsById(processId: number): ProcessStats | null {
    return this.data?.process_stats.find(p => p.process_id === processId) || null;
  }

  /**
   * Get all unique process IDs from the data
   * @returns Array of unique process IDs
   */
  getUniqueProcessIds(): number[] {
    if (!this.data) return [];
    
    const processIds = new Set<number>();
    
    // Add process IDs from gantt chart
    this.data.gantt_chart.forEach(entry => {
      processIds.add(entry.process_id);
    });
    
    // Add process IDs from process stats
    this.data.process_stats.forEach(stats => {
      processIds.add(stats.process_id);
    });
    
    return Array.from(processIds).sort((a, b) => a - b);
  }

  /**
   * Calculate the total execution time from the gantt chart
   * @returns The total execution time (end time of last process)
   */
  getTotalExecutionTime(): number {
    if (!this.data?.gantt_chart.length) return 0;
    
    return Math.max(...this.data.gantt_chart.map(entry => entry.end_time));
  }

  /**
   * Get average turnaround time for all processes
   * @returns Average turnaround time
   */
  getAverageTurnaroundTime(): number {
    if (!this.data?.process_stats.length) return 0;
    
    const sum = this.data.process_stats.reduce(
      (acc, stats) => acc + stats.turnaround_time, 
      0
    );
    
    return sum / this.data.process_stats.length;
  }

  /**
   * Get average waiting time for all processes
   * @returns Average waiting time
   */
  getAverageWaitingTime(): number {
    if (!this.data?.process_stats.length) return 0;
    
    const sum = this.data.process_stats.reduce(
      (acc, stats) => acc + stats.waiting_time, 
      0
    );
    
    return sum / this.data.process_stats.length;
  }
}
