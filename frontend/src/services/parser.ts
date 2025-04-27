import { SchedulerData, MLQSchedulerData, SchedulerInput , MLQGanttChartEntry , GanttChartEntry , ProcessStats} from './types'

export class Parser {
  private data: SchedulerData | null = null;
  private mlqData: MLQSchedulerData | null = null;
  private isMLQType: boolean = false;
  
  /**
   * Parse the JSON data from backend
   * @param jsonData - JSON string or object from backend
   * @returns true if parsing was successful, false otherwise
   */
  parse(jsonData: string | object): boolean {
    try {
      // Reset state on each parse
      this.data = null;
      this.mlqData = null;
      this.isMLQType = false;
      
      // Parse the data based on its type
      const parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // Check if it's MLQ/MLFQ format by examining the first gantt chart entry
      if (parsedData.gantt_chart && 
          parsedData.gantt_chart.length > 0 && 
          'queues' in parsedData.gantt_chart[0]) {
        this.isMLQType = true;
        this.mlqData = parsedData as MLQSchedulerData;
      } else {
        this.data = parsedData as SchedulerData;
      }
      
      return this.validate();
    } catch (error) {
      console.error('Failed to parse scheduler data:', error);
      return false;
    }
  }

  /**
   * Parse specifically MLQ/MLFQ format data
   * @param jsonData - JSON string or object from backend in MLQ format
   * @returns true if parsing was successful, false otherwise
   */
  parseMLQ(jsonData: string | object): boolean {
    try {
      this.data = null;
      this.isMLQType = true;
      
      if (typeof jsonData === 'string') {
        this.mlqData = JSON.parse(jsonData) as MLQSchedulerData;
      } else {
        this.mlqData = jsonData as MLQSchedulerData;
      }
      
      return this.validateMLQ();
    } catch (error) {
      console.error('Failed to parse MLQ scheduler data:', error);
      return false;
    }
  }

  /**
   * Validate that the parsed data has the expected structure
   * @returns true if data is valid, false otherwise
   */
  private validate(): boolean {
    if (this.isMLQType) {
      return this.validateMLQ();
    }
    
    if (!this.data) return false;
    if (!Array.isArray(this.data.gantt_chart) || !Array.isArray(this.data.process_stats)) {
      return false;
    }
    return true;
  }
  
  /**
   * Validate MLQ/MLFQ data structure
   * @returns true if MLQ data is valid, false otherwise
   */
  private validateMLQ(): boolean {
    if (!this.mlqData) return false;
    if (!Array.isArray(this.mlqData.gantt_chart) || !Array.isArray(this.mlqData.process_stats)) {
      return false;
    }
    
    // Verify the first entry has the expected MLQ properties
    if (this.mlqData.gantt_chart.length > 0) {
      const firstEntry = this.mlqData.gantt_chart[0];
      return 'queues' in firstEntry && 'queue_level' in firstEntry;
    }
    
    return true;
  }

  /**
   * Get the parsed gantt chart data
   * @returns Array of GanttChartEntry or empty array if data is not available
   */
  getGanttChart(): GanttChartEntry[] {
    if (this.isMLQType && this.mlqData) {
      // Convert MLQ gantt entries to standard format for visualization
      return this.mlqData.gantt_chart.map(entry => {
        // Create a properly typed entry with both formats
        const ganttEntry: GanttChartEntry = {
          process_id: entry.process_id,
          start_time: entry.start_time,
          end_time: entry.end_time,
          queue_level: entry.queue_level,
          // Keep the original queues array for direct access
          queues: entry.queues,
          // Use the active queue for this level as the ready queue
          ready_queue: entry.queues[entry.queue_level] || [],
          // Convert the queues array to the ready_queues object format
          ready_queues: entry.queues.reduce((acc: {[key: string]: number[]}, queue: number[], index: number) => {
            acc[index] = queue;
            return acc;
          }, {})
        };
        return ganttEntry;
      });
    }
    
    return this.data?.gantt_chart || [];
  }

  /**
   * Get the parsed MLQ/MLFQ gantt chart data in its original format
   * @returns Array of MLQGanttChartEntry or empty array if data is not available
   */
  getMLQGanttChart(): MLQGanttChartEntry[] {
    return this.mlqData?.gantt_chart || [];
  }

  /**
   * Get the parsed process statistics
   * @returns Array of ProcessStats or empty array if data is not available
   */
  getProcessStats(): ProcessStats[] {
    if (this.isMLQType) {
      return this.mlqData?.process_stats || [];
    }
    return this.data?.process_stats || [];
  }
  
  /**
   * Check if the parsed data is in MLQ/MLFQ format
   * @returns boolean indicating if the data is in MLQ format
   */
  isMLQFormat(): boolean {
    return this.isMLQType;
  }
  
  /**
   * Get the algorithm type
   * @returns string with the algorithm name or empty string
   */
  getAlgorithm(): string {
    if (this.isMLQType) {
      return this.mlqData?.scheduling_algorithm || '';
    }
    return this.data?.scheduling_algorithm || '';
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
