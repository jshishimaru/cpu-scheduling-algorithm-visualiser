import axios from 'axios';
import { SchedulerInput, SchedulerData, Parser } from './parser';

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
      const response = await axios.post(
        `${this.baseUrl}/schedule`,
        schedulerInput,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

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
   * Change the base URL for API requests
   * @param newUrl - New base URL to use
   */
  setBaseUrl(newUrl: string): void {
    this.baseUrl = newUrl;
  }
}

// Export a default instance for convenience
export default new ApiService();