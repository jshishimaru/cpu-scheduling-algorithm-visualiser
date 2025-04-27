import axios from 'axios';
import {Parser} from './parser'
import { SchedulerInput, SchedulerData, MLQSchedulerData } from './types';

/**
 * Service for handling API requests to the scheduler backend
 */
export class ApiService {
  private baseUrl: string;
  private parser: Parser;

  /**
   * Initialize the API service
   * @param baseUrl - Base URL for the API (defaults to placeholder)
   */
  constructor(baseUrl: string = 'http://0.0.0.0:18080') {
    this.baseUrl = baseUrl;
    this.parser = new Parser();
  }

  /**
   * Send process data to the backend and get scheduling results
   * @param schedulerInput - The input data containing processes and scheduling configuration
   * @returns Promise with the parsed scheduler data
   */
  async scheduleProcesses(schedulerInput: SchedulerInput): Promise<SchedulerData | null> {
    try {
      console.log('Sending request to backend:', schedulerInput);
	
      const response = await axios.post(
        `${this.baseUrl}/api/schedule`,
        schedulerInput,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Received response from backend:', response.data);

      if (response.status === 200 && this.parser.parse(response.data)) {
        return {
          gantt_chart: this.parser.getGanttChart(),
          process_stats: this.parser.getProcessStats(),
          scheduling_algorithm: response.data.scheduling_algorithm || schedulerInput.scheduling_type
        };
      } else {
        console.error('Failed to parse response data');
        return null;
      }
    } catch (error) {
      console.error('Error sending process data to backend:', error);
      return null;
    }
  }
  
  /**
   * Convert NewProcessData to the format expected by the backend API
   * @param processes - Array of process data from the UI
   * @param algorithmType - Selected scheduling algorithm
   * @param timeQuantum - Optional time quantum for RR, MLQ, MLFQ
   * @param numOfQueues - Optional number of queues for MLQ, MLFQ
   * @param agingThreshold - Optional aging threshold for aging algorithms
   * @returns Properly formatted SchedulerInput object
   */
  prepareSchedulerInput(
    processes: any[],
    algorithmType: string,
    timeQuantum?: number,
    numOfQueues?: number,
    agingThreshold?: number
  ): SchedulerInput {
    return {
      scheduling_type: algorithmType,
      quantum: timeQuantum,
      num_of_queues: numOfQueues,
      aging_threshold: agingThreshold,
      processes: processes.map(p => ({
        p_id: parseInt(p.id.toString()), // Convert to number to ensure consistency with backend
        arrival_time: p.arrivalTime,
        burst_time: p.burstTime,
        priority: p.priority || 0
      }))
    };
  }
  
  /**
   * Send process data to the backend for Multi-Level Queue scheduling
   * @param schedulerInput - The input data containing processes and MLQ configuration
   * @returns Promise with the parsed MLQ scheduler data
   */
  async scheduleMLQ(schedulerInput: SchedulerInput): Promise<MLQSchedulerData | null> {
    return this.scheduleMultiLevelQueue(schedulerInput, '/api/mlq');
  }

  /**
   * Send process data to the backend for Multi-Level Feedback Queue scheduling
   * @param schedulerInput - The input data containing processes and MLFQ configuration
   * @returns Promise with the parsed MLFQ scheduler data
   */
  async scheduleMLFQ(schedulerInput: SchedulerInput): Promise<MLQSchedulerData | null> {
    return this.scheduleMultiLevelQueue(schedulerInput, '/api/mlfq');
  }
  
  /**
   * Send process data to the backend for Multi-Level Queue with Aging scheduling
   * @param schedulerInput - The input data containing processes and MLQ configuration with aging
   * @returns Promise with the parsed MLQ scheduler data
   */
  async scheduleMLQAging(schedulerInput: SchedulerInput): Promise<MLQSchedulerData | null> {
    return this.scheduleMultiLevelQueue(schedulerInput, '/api/mlq-aging');
  }
  
  /**
   * Send process data to the backend for SJF with Aging scheduling
   * @param schedulerInput - The input data containing processes and SJF configuration with aging
   * @returns Promise with the parsed scheduler data
   */
  async scheduleSJFAging(schedulerInput: SchedulerInput): Promise<SchedulerData | null> {
    try {
      console.log('Sending SJF Aging request to backend:', schedulerInput);
	
      const response = await axios.post(
        `${this.baseUrl}/api/sjf-aging`,
        schedulerInput,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Received response from SJF Aging endpoint:', response.data);

      if (response.status === 200 && this.parser.parse(response.data)) {
        return {
          gantt_chart: this.parser.getGanttChart(),
          process_stats: this.parser.getProcessStats(),
          scheduling_algorithm: response.data.scheduling_algorithm || schedulerInput.scheduling_type
        };
      } else {
        console.error('Failed to parse SJF Aging response data');
        return null;
      }
    } catch (error) {
      console.error('Error sending process data to SJF Aging endpoint:', error);
      return null;
    }
  }

  /**
   * Helper method to handle both MLQ and MLFQ scheduling requests
   * @param schedulerInput - The input data containing processes and queue configuration
   * @param endpoint - The specific API endpoint for MLQ or MLFQ
   * @returns Promise with the parsed multi-level queue scheduler data
   */
  private async scheduleMultiLevelQueue(
    schedulerInput: SchedulerInput, 
    endpoint: string
  ): Promise<MLQSchedulerData | null> {
    try {
      console.log(`Sending ${endpoint} request to backend:`, schedulerInput);
      
      const response = await axios.post(
        `${this.baseUrl}${endpoint}`,
        schedulerInput,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`Received response from ${endpoint}:`, response.data);

      if (response.status === 200) {
        // Use the specialized MLQ parser
        if (this.parser.parseMLQ(response.data)) {
          return {
            gantt_chart: this.parser.getMLQGanttChart(),
            process_stats: this.parser.getProcessStats(),
            scheduling_algorithm: response.data.scheduling_algorithm || schedulerInput.scheduling_type
          };
        }
        console.error('Failed to parse multi-level queue response data');
        return null;
      } else {
        console.error('Multi-level queue scheduling request failed');
        return null;
      }
    } catch (error) {
      console.error(`Error sending process data to ${endpoint}:`, error);
      return null;
    }
  }
  
  /**
   * Change the base URL for API requests
   * @param newUrl - New base URL to use
   */
  setBaseUrl(newUrl: string): void {
    this.baseUrl = newUrl;
  }
}

// Export a default instance for convenience
export default new ApiService();