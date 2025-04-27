#ifndef MLQ_HPP
#define MLQ_HPP
#pragma once
#include <vector>
#include <algorithm>
#include <queue>
#include <deque>
#include <climits>
#include "../Type.hpp"
#include "../json.hpp"

using namespace std;
using json = nlohmann::json;

class MLQ {
public:
    json schedule(const vector<Process>& processes, int num_queues, int base_quantum) {
        // Validate input
        if (num_queues <= 0 || base_quantum <= 0) {
            return json({
                {"status", "error"},
                {"message", "Invalid number of queues or base quantum"}
            });
        }

        // Create the result JSON
        json result;
        vector<json> gantt_chart;
        vector<json> process_stats;

        // Sort processes by arrival time
        vector<Process> sorted_processes = processes;
        sort(sorted_processes.begin(), sorted_processes.end(), [](const Process& a, const Process& b) {
            return a.arrival_time < b.arrival_time;
        });

        int n = sorted_processes.size();
        if (n == 0) {
            result["gantt_chart"] = gantt_chart;
            result["process_stats"] = process_stats;
            return result;
        }

        // Create queues for the MLQ
        vector<deque<int>> queues(num_queues);
        vector<int> time_quanta(num_queues);
        
        // Set the time quantum for each queue
        for (int i = 0; i < num_queues; i++) {
            time_quanta[i] = base_quantum * (1 << i); // Double the quantum for each subsequent queue
        }

        // Initialize process tracking variables
        vector<int> remaining_burst_time(n);
        vector<bool> is_completed(n, false);
        vector<int> completion_time(n, 0);
        vector<int> queue_assignment(n, 0); // Which queue each process is assigned to
        
        for (int i = 0; i < n; i++) {
            remaining_burst_time[i] = sorted_processes[i].burst_time;
            // Assign processes to queues based on priority (if available)
            queue_assignment[i] = min(sorted_processes[i].priority % num_queues, num_queues - 1);
        }

        int current_time = 0;
        int completed = 0;
        int current_process_id = -1;
        int last_process_id = -1;
        int time_in_current_process = 0;

        // Start with an idle slot if no process arrives at time 0
        if (sorted_processes[0].arrival_time > 0) {
            json idle_slot = {
                {"process_id", -1},
                {"start_time", 0},
                {"end_time", sorted_processes[0].arrival_time},
                {"queues", json::array()},
                {"queue_level", -1}  // Indicate no queue is running
            };
            gantt_chart.push_back(idle_slot);
            current_time = sorted_processes[0].arrival_time;
        }

        // Main scheduling loop
        while (completed < n) {
            // Check for new arrivals and add them to appropriate queues
            for (int i = 0; i < n; i++) {
                if (!is_completed[i] && sorted_processes[i].arrival_time <= current_time && 
                    find(queues[queue_assignment[i]].begin(), queues[queue_assignment[i]].end(), i) == queues[queue_assignment[i]].end()) {
                    queues[queue_assignment[i]].push_back(i);
                }
            }

            // Find the highest priority non-empty queue
            int active_queue = -1;
            for (int i = 0; i < num_queues; i++) {
                if (!queues[i].empty()) {
                    active_queue = i;
                    break;
                }
            }

            // If all queues are empty but not all processes have arrived
            if (active_queue == -1) {
                // Find the next arriving process
                int next_arrival_time = INT_MAX;
                for (int i = 0; i < n; i++) {
                    if (!is_completed[i] && sorted_processes[i].arrival_time > current_time &&
                        sorted_processes[i].arrival_time < next_arrival_time) {
                        next_arrival_time = sorted_processes[i].arrival_time;
                    }
                }

                if (next_arrival_time == INT_MAX) {
                    // All processes have completed
                    break;
                }

                // Add idle slot to gantt chart
                if (last_process_id != -1) {
                    gantt_chart.back()["end_time"] = current_time;
                }

                json idle_slot = {
                    {"process_id", -1},
                    {"start_time", current_time},
                    {"end_time", next_arrival_time},
                    {"queues", json::array()},
                    {"queue_level", -1}  // Indicate no queue is running
                };
                gantt_chart.push_back(idle_slot);
                current_time = next_arrival_time;
                last_process_id = -1;
                continue;
            }

            // Get the next process to execute from the active queue
            int process_index = queues[active_queue].front();
            queues[active_queue].pop_front();
            current_process_id = sorted_processes[process_index].p_id;

            // If this is a different process from the previous one, start a new gantt chart entry
            if (current_process_id != last_process_id) {
                if (last_process_id != -1) {
                    gantt_chart.back()["end_time"] = current_time;
                }

                // Create a snapshot of all queues for the gantt chart
                json queues_snapshot = json::array();
                for (int i = 0; i < num_queues; i++) {
                    json queue_snapshot = json::array();
                    for (int process_idx : queues[i]) {
                        queue_snapshot.push_back(sorted_processes[process_idx].p_id);
                    }
                    queues_snapshot.push_back(queue_snapshot);
                }

                json new_segment = {
                    {"process_id", current_process_id},
                    {"start_time", current_time},
                    {"queues", queues_snapshot},
                    {"queue_level", active_queue}  // Add the current queue level
                };
                gantt_chart.push_back(new_segment);
                time_in_current_process = 0;
            }

            last_process_id = current_process_id;

            // Execute the process for the quantum or until completion
            int quantum = time_quanta[active_queue];
            int execution_time = min(quantum, remaining_burst_time[process_index]);
            current_time += execution_time;
            remaining_burst_time[process_index] -= execution_time;
            time_in_current_process += execution_time;

            // Check if the process has completed
            if (remaining_burst_time[process_index] == 0) {
                is_completed[process_index] = true;
                completed++;
                completion_time[process_index] = current_time;

                // Calculate process stats
                int turnaround_time = completion_time[process_index] - sorted_processes[process_index].arrival_time;
                int waiting_time = turnaround_time - sorted_processes[process_index].burst_time;

                json stats = {
                    {"process_id", sorted_processes[process_index].p_id},
                    {"arrival_time", sorted_processes[process_index].arrival_time},
                    {"burst_time", sorted_processes[process_index].burst_time},
                    {"priority", sorted_processes[process_index].priority},
                    {"completion_time", completion_time[process_index]},
                    {"turnaround_time", turnaround_time},
                    {"waiting_time", waiting_time},
                    {"queue", active_queue}
                };
                process_stats.push_back(stats);
            }
            // If the process still has remaining time, put it back in its queue
            else if (remaining_burst_time[process_index] > 0) {
                queues[active_queue].push_back(process_index);
            }

            // Check for any process that might have arrived during this execution
            bool new_arrival = false;
            for (int i = 0; i < n; i++) {
                if (!is_completed[i] && sorted_processes[i].arrival_time > current_time - execution_time &&
                    sorted_processes[i].arrival_time <= current_time) {
                    new_arrival = true;
                    if (find(queues[queue_assignment[i]].begin(), queues[queue_assignment[i]].end(), i) == queues[queue_assignment[i]].end()) {
                        queues[queue_assignment[i]].push_back(i);
                    }
                }
            }

            // If there's a new arrival and its queue has higher priority, preempt current process
            if (new_arrival) {
                // Check if any new arrival is in a higher priority queue
                bool higher_priority_arrival = false;
                for (int i = 0; i < active_queue; i++) {
                    if (!queues[i].empty()) {
                        higher_priority_arrival = true;
                        break;
                    }
                }
                
                if (higher_priority_arrival) {
                    // End the current segment and start a new one
                    gantt_chart.back()["end_time"] = current_time;
                    last_process_id = -1;  // Force creation of a new segment
                }
            }
        }

        // Complete the last gantt chart entry
        if (!gantt_chart.empty() && !gantt_chart.back().contains("end_time")) {
            gantt_chart.back()["end_time"] = current_time;
        }

        result["gantt_chart"] = gantt_chart;
        result["process_stats"] = process_stats;
        return result;
    }
};

#endif