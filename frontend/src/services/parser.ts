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
  scheduling_algorithm: string;
}

// Interface for input data to be saved
export interface SchedulerInput {
  scheduling_type: string;
  time_slice?: number;
  num_of_queues?: number;
  processes: {
    p_id: string;
    arrival_time: number;
    burst_time: number;
    priority: number;
  }[];
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
   * Save input data to a JSON file
   * @param inputData - The scheduler input data
   * @param filename - Name of the file to save (optional)
   * @returns true if successful, false otherwise
   */
  static saveInputToFile(inputData: SchedulerInput, filename: string = 'scheduler_input.json'): boolean {
    try {
      // Check if running in browser environment
      if (typeof window !== 'undefined') {
        // Create a blob with the JSON data
        const jsonContent = JSON.stringify(inputData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        
        // Create download link and trigger download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        return true;
      } else {
        // For Node.js environment (if applicable)
        console.error('File saving in Node.js environment requires the fs module');
        return false;
      }
    } catch (error) {
      console.error('Failed to save input data:', error);
      return false;
    }
  }
}
