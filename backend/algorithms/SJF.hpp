#include <iostream>
#include <vector>
#include <algorithm>
#include <queue>
#include "../Type.hpp"
#include "../json.hpp"
#include <climits>

using namespace std;
using json = nlohmann::json;

json simulateSJF(const vector<Process>& processes) {
    vector<json> gantt_chart;
    vector<json> process_stats;

    vector<Process> sorted_processes = processes;
    sort(sorted_processes.begin(), sorted_processes.end(), [](const Process& a, const Process& b) {
        return a.arrival_time < b.arrival_time;
    });

    int current_time = 0;
    int completed = 0;
    int n = sorted_processes.size();
    vector<int> remaining_burst_time(n);
    vector<bool> is_completed(n, false);

    for (int i = 0; i < n; i++) {
        remaining_burst_time[i] = sorted_processes[i].burst_time;
    }

    int last_process_id = -1;

    while (completed < n) {
        int shortest_index = -1;
        int min_remaining_time = INT_MAX;

        // Find the process with the shortest remaining burst time that has arrived
        for (int i = 0; i < n; i++) {
            if (sorted_processes[i].arrival_time <= current_time && !is_completed[i] &&
                remaining_burst_time[i] < min_remaining_time) {
                min_remaining_time = remaining_burst_time[i];
                shortest_index = i;
            }
        }

        if (shortest_index == -1) {
            // Processor is idle
            if (last_process_id != -1) {
                gantt_chart.back()["end_time"] = current_time;
            }
            gantt_chart.push_back({
                {"process_id", -1},
                {"start_time", current_time},
                {"ready_queue", vector<int>()}
            });
            current_time++;
            last_process_id = -1;
            continue;
        }

        if (last_process_id != sorted_processes[shortest_index].p_id) {
            if (last_process_id != -1) {
                gantt_chart.back()["end_time"] = current_time;
            }
            gantt_chart.push_back({
                {"process_id", sorted_processes[shortest_index].p_id},
                {"start_time", current_time},
                {"ready_queue", vector<int>()}
            });
            for (int i = 0; i < n; i++) {
                if (!is_completed[i] && sorted_processes[i].arrival_time <= current_time) {
                    gantt_chart.back()["ready_queue"].push_back(sorted_processes[i].p_id);
                }
            }
        }

        last_process_id = sorted_processes[shortest_index].p_id;

        // Execute the process for 1 unit of time
        remaining_burst_time[shortest_index]--;
        current_time++;

        // Check if a new process arrives during execution
        for (int i = 0; i < n; i++) {
            if (sorted_processes[i].arrival_time == current_time && !is_completed[i]) {
                // Split the current Gantt chart entry
                gantt_chart.back()["end_time"] = current_time;
                gantt_chart.push_back({
                    {"process_id", sorted_processes[shortest_index].p_id},
                    {"start_time", current_time},
                    {"ready_queue", vector<int>()}
                });
                for (int j = 0; j < n; j++) {
                    if (!is_completed[j] && sorted_processes[j].arrival_time <= current_time) {
                        gantt_chart.back()["ready_queue"].push_back(sorted_processes[j].p_id);
                    }
                }
                break;
            }
        }

        // If the process is completed
        if (remaining_burst_time[shortest_index] == 0) {
            is_completed[shortest_index] = true;
            completed++;

            int completion_time = current_time;
            int turnaround_time = completion_time - sorted_processes[shortest_index].arrival_time;
            int waiting_time = turnaround_time - sorted_processes[shortest_index].burst_time;

            process_stats.push_back({
                {"process_id", sorted_processes[shortest_index].p_id},
                {"arrival_time", sorted_processes[shortest_index].arrival_time},
                {"burst_time", sorted_processes[shortest_index].burst_time},
                {"completion_time", completion_time},
                {"turnaround_time", turnaround_time},
                {"waiting_time", waiting_time}
            });
        }
    }

    if (!gantt_chart.empty()) {
        gantt_chart.back()["end_time"] = current_time;
    }

    return {
        {"gantt_chart", gantt_chart},
        {"process_stats", process_stats}
    };
}