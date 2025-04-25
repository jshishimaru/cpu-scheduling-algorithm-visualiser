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
      "process_id": 2,
      "start_time": 4,
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
  ]
};
