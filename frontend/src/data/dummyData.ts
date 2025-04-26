import { SchedulerData } from '../services/parser';

export const dummySchedulerData: SchedulerData = {
  "gantt_chart": [
    {
      "process_id": 1,
      "start_time": 0,
      "end_time": 4,
      "ready_queue": [1]
    },
	{
		"process_id": -1,
		"start_time": 4,
		"end_time": 6,
		"ready_queue": []
	},
    {
      "process_id": 2,
      "start_time": 6,
      "end_time": 8,
      "ready_queue": [1, 2]
    },
    {
      "process_id": 1,
      "start_time": 8,
      "end_time": 10,
      "ready_queue": [3, 1]
    },
    {
      "process_id": 3,
      "start_time": 10,
      "end_time": 14,
      "ready_queue": [1, 3]
    },
    {
      "process_id": 1,
      "start_time": 14,
      "end_time": 16,
      "ready_queue": [1]
    }
  ],
  "process_stats": [
    {
      "process_id": 1,
      "arrival_time": 0,
      "burst_time": 10,
      "completion_time": 16,
      "turnaround_time": 16,
      "waiting_time": 6
    },
    {
      "process_id": 2,
      "arrival_time": 2,
      "burst_time": 4,
      "completion_time": 8,
      "turnaround_time": 6,
      "waiting_time": 2
    },
    {
      "process_id": 3,
      "arrival_time": 4,
      "burst_time": 4,
      "completion_time": 14,
      "turnaround_time": 10,
      "waiting_time": 6
    }
  ],
  "scheduling_algorithm": "Round Robin"
};

export const largeDataset: SchedulerData = {
  "gantt_chart": [
    { "process_id": 1, "start_time": 0, "end_time": 3, "ready_queue": [1] },
    { "process_id": 2, "start_time": 3, "end_time": 7, "ready_queue": [2, 3, 4] },
    { "process_id": 3, "start_time": 7, "end_time": 10, "ready_queue": [3, 4, 1] },
    { "process_id": 4, "start_time": 10, "end_time": 14, "ready_queue": [4, 1, 5] },
    { "process_id": 1, "start_time": 14, "end_time": 17, "ready_queue": [1, 5, 6] },
    { "process_id": 5, "start_time": 17, "end_time": 21, "ready_queue": [5, 6, 7] },
    { "process_id": 6, "start_time": 21, "end_time": 26, "ready_queue": [6, 7, 8] },
    { "process_id": 7, "start_time": 26, "end_time": 30, "ready_queue": [7, 8, 9] },
    { "process_id": 8, "start_time": 30, "end_time": 34, "ready_queue": [8, 9, 10] },
    { "process_id": 9, "start_time": 34, "end_time": 39, "ready_queue": [9, 10] },
    { "process_id": 10, "start_time": 39, "end_time": 44, "ready_queue": [10, 1] },
    { "process_id": 1, "start_time": 44, "end_time": 47, "ready_queue": [1] }
  ],
  "process_stats": [
    { "process_id": 1, "arrival_time": 0, "burst_time": 9, "completion_time": 47, "turnaround_time": 47, "waiting_time": 38 },
    { "process_id": 2, "arrival_time": 1, "burst_time": 4, "completion_time": 7, "turnaround_time": 6, "waiting_time": 2 },
    { "process_id": 3, "arrival_time": 2, "burst_time": 3, "completion_time": 10, "turnaround_time": 8, "waiting_time": 5 },
    { "process_id": 4, "arrival_time": 3, "burst_time": 4, "completion_time": 14, "turnaround_time": 11, "waiting_time": 7 },
    { "process_id": 5, "arrival_time": 4, "burst_time": 4, "completion_time": 21, "turnaround_time": 17, "waiting_time": 13 },
    { "process_id": 6, "arrival_time": 5, "burst_time": 5, "completion_time": 26, "turnaround_time": 21, "waiting_time": 16 },
    { "process_id": 7, "arrival_time": 6, "burst_time": 4, "completion_time": 30, "turnaround_time": 24, "waiting_time": 20 },
    { "process_id": 8, "arrival_time": 7, "burst_time": 4, "completion_time": 34, "turnaround_time": 27, "waiting_time": 23 },
    { "process_id": 9, "arrival_time": 8, "burst_time": 5, "completion_time": 39, "turnaround_time": 31, "waiting_time": 26 },
    { "process_id": 10, "arrival_time": 9, "burst_time": 5, "completion_time": 44, "turnaround_time": 35, "waiting_time": 30 }
  ],
  "scheduling_algorithm": "Shortest Job First"
};

export const veryLargeDataset: SchedulerData = {
  "gantt_chart": [
    ...Array(50).fill(0).map((_, i) => {
      const pid = (i % 15) + 1;
      const startTime = i * 3;
      const endTime = startTime + 3;
      const queueSize = Math.min(5, 15 - pid);
      const readyQueue = Array.from({length: queueSize}, (_, j) => ((pid + j) % 15) + 1);
      
      return {
        "process_id": pid,
        "start_time": startTime,
        "end_time": endTime,
        "ready_queue": readyQueue
      };
    })
  ],
  "process_stats": Array(15).fill(0).map((_, i) => {
    const pid = i + 1;
    const arrivalTime = i;
    const burstTime = 9 + (i % 5);
    const completionTime = 130 + (i * 2);
    const turnaroundTime = completionTime - arrivalTime;
    const waitingTime = turnaroundTime - burstTime;
    
    return {
      "process_id": pid,
      "arrival_time": arrivalTime,
      "burst_time": burstTime,
      "completion_time": completionTime,
      "turnaround_time": turnaroundTime,
      "waiting_time": waitingTime
    };
  }),
  "scheduling_algorithm": "Multi-Level Feedback Queue"
};
