import { SchedulerData } from '../services/types';

export const dummySchedulerData: SchedulerData = {
  "scheduling_algorithm": "MLQ",
  "gantt_chart": [
    {
      "process_id": 1,
      "start_time": 0,
      "end_time": 4,
      "queue_level": 1,
      "ready_queues": {
        "1": [],
        "2": [2],
        "3": [3],
      }
    },
	{
		"process_id": -1,
		"start_time": 4,
		"end_time": 6,
		"queue_level": 2,
      "ready_queues": {
        "1": [1],
        "2": [2,4],
        "3": [3],
      }
	},
    {
      "process_id": 2,
      "start_time": 6,
      "end_time": 8,
      "queue_level": 2,
      "ready_queues": {
        "1": [1],
        "2": [4],
        "3": [3],
      }
    },
    {
      "process_id": 1,
      "start_time": 8,
      "end_time": 10,
      "queue_level": 1,
      "ready_queues": {
        "1": [1],
        "2": [4],
        "3": [3],
      }
    },
    {
      "process_id": 3,
      "start_time": 10,
      "end_time": 14,
      "queue_level": 3,
      "ready_queues": {
        "1": [1],
        "2": [4],
        "3": [],
      }
    },
    {
      "process_id": 1,
      "start_time": 14,
      "end_time": 16,
      "queue_level": 1,
      "ready_queues": {
        "1": [],
        "2": [4],
        "3": [],
      }
    }
  ],
  "process_stats": [
    {
      "process_id": 1,
      "arrival_time": 0,
      "burst_time": 10,
      "completion_time": 16,
      "turnaround_time": 16,
      "final_queue_level": 1,
      "waiting_time": 6
    },
    {
      "process_id": 2,
      "arrival_time": 2,
      "burst_time": 4,
      "completion_time": 8,
      "turnaround_time": 6,
      "final_queue_level": 1,
      "waiting_time": 2
    },
    {
      "process_id": 3,
      "arrival_time": 4,
      "burst_time": 4,
      "completion_time": 14,
      "turnaround_time": 10,
      "final_queue_level": 2,
      "waiting_time": 6
    }
  ],
};

