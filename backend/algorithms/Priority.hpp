#ifndef PRIORITY_HPP
#define PRIORITY_HPP
#pragma once
#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>
#include "../Type.hpp"
#include "../json.hpp"

using namespace std;
using json = nlohmann::json;

class Priority {
public:
    json schedule(const vector<Process>& processes) {
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
        int idle_start_time = -1;

        while (completed < n) {
            int highest_priority_index = -1;
            int highest_priority = INT_MAX;

            for (int i = 0; i < n; i++) {
                if (sorted_processes[i].arrival_time <= current_time && !is_completed[i]) {
                    if (sorted_processes[i].priority < highest_priority ||
                       (sorted_processes[i].priority == highest_priority && 
                        sorted_processes[i].arrival_time < sorted_processes[highest_priority_index].arrival_time) ||
                       (sorted_processes[i].priority == highest_priority && 
                        sorted_processes[i].arrival_time == sorted_processes[highest_priority_index].arrival_time &&
                        remaining_burst_time[i] < remaining_burst_time[highest_priority_index])) {
                        highest_priority = sorted_processes[i].priority;
                        highest_priority_index = i;
                    }
                }
            }

            if (highest_priority_index == -1) {
                if (last_process_id != -1 && last_process_id != -2) {
                    gantt_chart.back()["end_time"] = current_time;
                    idle_start_time = current_time;
                    gantt_chart.push_back({
                        {"process_id", -1},
                        {"start_time", current_time},
                        {"ready_queue", vector<int>()}
                    });
                    last_process_id = -2;
                }
                current_time++;
                continue;
            } else {
                if (last_process_id == -2) {
                    gantt_chart.back()["end_time"] = current_time;
                    last_process_id = -1;
                }
            }

            if (last_process_id != sorted_processes[highest_priority_index].p_id) {
                if (last_process_id >= 0) {
                    gantt_chart.back()["end_time"] = current_time;
                }
                gantt_chart.push_back({
                    {"process_id", sorted_processes[highest_priority_index].p_id},
                    {"start_time", current_time},
                    {"ready_queue", vector<int>()}
                });
                for (int i = 0; i < n; i++) {
                    if (!is_completed[i] && sorted_processes[i].arrival_time <= current_time && 
                        i != highest_priority_index) {
                        gantt_chart.back()["ready_queue"].push_back(sorted_processes[i].p_id);
                    }
                }
            }

            last_process_id = sorted_processes[highest_priority_index].p_id;

            remaining_burst_time[highest_priority_index]--;
            current_time++;

            for (int i = 0; i < n; i++) {
                if (sorted_processes[i].arrival_time == current_time && !is_completed[i]) {
                    gantt_chart.back()["end_time"] = current_time;
                    gantt_chart.push_back({
                        {"process_id", sorted_processes[highest_priority_index].p_id},
                        {"start_time", current_time},
                        {"ready_queue", vector<int>()}
                    });
                    for (int j = 0; j < n; j++) {
                        if (!is_completed[j] && sorted_processes[j].arrival_time <= current_time && 
                            j != highest_priority_index) {
                            gantt_chart.back()["ready_queue"].push_back(sorted_processes[j].p_id);
                        }
                    }
                    break;
                }
            }

            if (remaining_burst_time[highest_priority_index] == 0) {
                is_completed[highest_priority_index] = true;
                completed++;

                int completion_time = current_time;
                int turnaround_time = completion_time - sorted_processes[highest_priority_index].arrival_time;
                int waiting_time = turnaround_time - sorted_processes[highest_priority_index].burst_time;

                process_stats.push_back({
                    {"process_id", sorted_processes[highest_priority_index].p_id},
                    {"arrival_time", sorted_processes[highest_priority_index].arrival_time},
                    {"burst_time", sorted_processes[highest_priority_index].burst_time},
                    {"priority", sorted_processes[highest_priority_index].priority},
                    {"completion_time", completion_time},
                    {"turnaround_time", turnaround_time},
                    {"waiting_time", waiting_time}
                });
            }
        }

        if (!gantt_chart.empty()) {
            gantt_chart.back()["end_time"] = current_time;
        }

        json result;
        result["gantt_chart"] = gantt_chart;
        result["process_stats"] = process_stats;
        return result;
    }
};

#endif