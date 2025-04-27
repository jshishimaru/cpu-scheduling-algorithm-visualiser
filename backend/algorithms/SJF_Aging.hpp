#ifndef SJF_AGING_HPP
#define SJF_AGING_HPP
#pragma once
#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>
#include <cfloat>
#include "../Type.hpp"
#include "../json.hpp"

using namespace std;
using json = nlohmann::json;

class SJF_Aging {
public:
    json schedule(const vector<Process>& processes, int aging_threshold = 50) {
        vector<json> gantt_chart;
        vector<json> process_stats;

        // Calculate aging factor based on threshold (0-100)
        // Higher threshold means slower aging, lower threshold means faster aging
        const float AGING_FACTOR = static_cast<float>(aging_threshold) / 100.0f;

        vector<Process> sorted_processes = processes;
        sort(sorted_processes.begin(), sorted_processes.end(), [](const Process& a, const Process& b) {
            return a.arrival_time < b.arrival_time;
        });

        int current_time = 0;
        int completed = 0;
        int n = sorted_processes.size();
        vector<int> remaining_burst_time(n);
        vector<int> wait_time(n, 0);
        vector<bool> is_completed(n, false);

        for (int i = 0; i < n; i++) {
            remaining_burst_time[i] = sorted_processes[i].burst_time;
        }

        int last_process_id = -1;

        while (completed < n) {
            int selected_index = -1;
            float min_adjusted_remaining_time = FLT_MAX;

            for (int i = 0; i < n; i++) {
                if (sorted_processes[i].arrival_time <= current_time && !is_completed[i]) {
                    float adjusted_time = remaining_burst_time[i] - (AGING_FACTOR * wait_time[i]);
                    
                    adjusted_time = max(adjusted_time, 0.5f);

                    if (adjusted_time < min_adjusted_remaining_time) {
                        min_adjusted_remaining_time = adjusted_time;
                        selected_index = i;
                    }
                }
            }

            if (selected_index == -1) {
                if (last_process_id != -1 && last_process_id != -2) {
                    gantt_chart.back()["end_time"] = current_time;
                    gantt_chart.push_back({
                        {"process_id", -1},
                        {"start_time", current_time},
                        {"ready_queue", json::array()}
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

            if (last_process_id != sorted_processes[selected_index].p_id) {
                if (last_process_id >= 0) {
                    gantt_chart.back()["end_time"] = current_time;
                }
                gantt_chart.push_back({
                    {"process_id", sorted_processes[selected_index].p_id},
                    {"start_time", current_time},
                    {"ready_queue", json::array()}
                });

                for (int i = 0; i < n; i++) {
                    if (!is_completed[i] && sorted_processes[i].arrival_time <= current_time && 
                        i != selected_index) {
                        gantt_chart.back()["ready_queue"].push_back(sorted_processes[i].p_id);
                    }
                }
            }

            last_process_id = sorted_processes[selected_index].p_id;

            remaining_burst_time[selected_index]--;
            current_time++;

            for (int i = 0; i < n; i++) {
                if (!is_completed[i] && sorted_processes[i].arrival_time <= current_time && i != selected_index) {
                    wait_time[i]++;
                }
            }

            bool new_arrival = false;
            for (int i = 0; i < n; i++) {
                if (sorted_processes[i].arrival_time == current_time && !is_completed[i]) {
                    new_arrival = true;
                    break;
                }
            }
            
            if (new_arrival) {
                gantt_chart.back()["end_time"] = current_time;
                gantt_chart.push_back({
                    {"process_id", sorted_processes[selected_index].p_id},
                    {"start_time", current_time},
                    {"ready_queue", json::array()}
                });
                
                for (int j = 0; j < n; j++) {
                    if (!is_completed[j] && sorted_processes[j].arrival_time <= current_time && 
                        j != selected_index) {
                        gantt_chart.back()["ready_queue"].push_back(sorted_processes[j].p_id);
                    }
                }
            }

            if (remaining_burst_time[selected_index] == 0) {
                is_completed[selected_index] = true;
                completed++;

                int completion_time = current_time;
                int turnaround_time = completion_time - sorted_processes[selected_index].arrival_time;
                int waiting_time = turnaround_time - sorted_processes[selected_index].burst_time;

                process_stats.push_back({
                    {"process_id", sorted_processes[selected_index].p_id},
                    {"arrival_time", sorted_processes[selected_index].arrival_time},
                    {"burst_time", sorted_processes[selected_index].burst_time},
                    {"priority", sorted_processes[selected_index].priority},
                    {"completion_time", completion_time},
                    {"turnaround_time", turnaround_time},
                    {"waiting_time", waiting_time},
                    {"aging_wait_time", wait_time[selected_index]}
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