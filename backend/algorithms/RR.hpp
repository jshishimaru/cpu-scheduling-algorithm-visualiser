#ifndef RR_HPP
#define RR_HPP
#pragma once
#include <algorithm>
#include <vector>
#include <queue>
#include <string>
#include "../json.hpp"
#include "../Type.hpp"

using namespace std;

class RR {
public:
    nlohmann::json schedule(const vector<Process>& processes, int time_slice) {
        vector<Process> sorted = processes;
        sort(sorted.begin(), sorted.end(), [](const auto &a, const auto &b) {
            return a.arrival_time < b.arrival_time;
        });

        nlohmann::json result;
        nlohmann::json gantt_chart = nlohmann::json::array();
        nlohmann::json process_stats = nlohmann::json::array();
        
        if (sorted.empty()) {
            return result;
        }

        int n = sorted.size();
        int current_time = 0;
        
        vector<int> remaining_time(n);
        for (int i = 0; i < n; i++) {
            remaining_time[i] = sorted[i].burst_time;
        }
        
        vector<bool> completed(n, false);
        vector<int> completion_time(n, 0);
        int completed_count = 0;
        
        queue<int> ready_queue;
        int current_process_index = -1;
        
        if (sorted[0].arrival_time > 0) {
            nlohmann::json idle_row;
            idle_row["process_id"] = -1; 
            idle_row["start_time"] = 0;
            idle_row["end_time"] = sorted[0].arrival_time;
            idle_row["ready_queue"] = nlohmann::json::array();
            gantt_chart.push_back(idle_row);
            current_time = sorted[0].arrival_time;
        }
        
        for (int i = 0; i < n; i++) {
            if (sorted[i].arrival_time <= current_time) {
                ready_queue.push(i);
            }
        }
        
        while (completed_count < n) {
            if (ready_queue.empty()) {
                int next_arrival_time = INT_MAX;
                for (int i = 0; i < n; i++) {
                    if (!completed[i] && sorted[i].arrival_time > current_time && 
                        sorted[i].arrival_time < next_arrival_time) {
                        next_arrival_time = sorted[i].arrival_time;
                    }
                }
                
                if (next_arrival_time != INT_MAX) {
                    nlohmann::json idle_row;
                    idle_row["process_id"] = -1;
                    idle_row["start_time"] = current_time;
                    idle_row["end_time"] = next_arrival_time;
                    idle_row["ready_queue"] = nlohmann::json::array();
                    gantt_chart.push_back(idle_row);
                    
                    current_time = next_arrival_time;
                    
                    for (int i = 0; i < n; i++) {
                        if (!completed[i] && sorted[i].arrival_time <= current_time) {
                            ready_queue.push(i);
                        }
                    }
                } else {
                    break;
                }
            } else {
                current_process_index = ready_queue.front();
                ready_queue.pop();
                
                int execute_time = min(time_slice, remaining_time[current_process_index]);
                int start_time = current_time;
                int end_time = current_time + execute_time;
                
                vector<int> arrival_points;
                arrival_points.push_back(start_time);
                
                for (int i = 0; i < n; i++) {
                    if (!completed[i] && 
                        sorted[i].arrival_time > start_time && 
                        sorted[i].arrival_time < end_time) {
                        arrival_points.push_back(sorted[i].arrival_time);
                    }
                }
                
                arrival_points.push_back(end_time);
                
                sort(arrival_points.begin(), arrival_points.end());
                arrival_points.erase(unique(arrival_points.begin(), arrival_points.end()), 
                                   arrival_points.end());
                
                for (size_t i = 0; i < arrival_points.size() - 1; i++) {
                    int segment_start = arrival_points[i];
                    int segment_end = arrival_points[i + 1];
                    
                    vector<int> current_ready_queue;
                    
                    queue<int> temp_queue = ready_queue;
                    while (!temp_queue.empty()) {
                        int proc_idx = temp_queue.front();
                        temp_queue.pop();
                        current_ready_queue.push_back(sorted[proc_idx].p_id);
                    }
                    
                    nlohmann::json gantt_row;
                    gantt_row["process_id"] = sorted[current_process_index].p_id;
                    gantt_row["start_time"] = segment_start;
                    gantt_row["end_time"] = segment_end;
                    gantt_row["ready_queue"] = current_ready_queue;
                    gantt_chart.push_back(gantt_row);
                    
                    for (int j = 0; j < n; j++) {
                        if (!completed[j] && sorted[j].arrival_time == segment_end) {
                            ready_queue.push(j);
                        }
                    }
                }
                
                current_time = end_time;
                remaining_time[current_process_index] -= execute_time;
                
                if (remaining_time[current_process_index] == 0) {
                    completed[current_process_index] = true;
                    completed_count++;
                    completion_time[current_process_index] = current_time;
                } else {
                    ready_queue.push(current_process_index);
                }
                
                for (int i = 0; i < n; i++) {
                    if (!completed[i] && 
                        sorted[i].arrival_time > start_time && 
                        sorted[i].arrival_time <= current_time &&
                        i != current_process_index) {
                    }
                }
            }
        }
        
        for (int i = 0; i < n; i++) {
            int comp_time = completion_time[i];
            int turn_around = comp_time - sorted[i].arrival_time;
            int waiting = turn_around - sorted[i].burst_time;
            
            nlohmann::json stats_row;
            stats_row["process_id"] = sorted[i].p_id;
            stats_row["arrival_time"] = sorted[i].arrival_time;
            stats_row["burst_time"] = sorted[i].burst_time;
            stats_row["priority"] = sorted[i].priority;
            stats_row["completion_time"] = comp_time;
            stats_row["turnaround_time"] = turn_around;
            stats_row["waiting_time"] = waiting;
            
            process_stats.push_back(stats_row);
        }
        
        result["gantt_chart"] = gantt_chart;
        result["process_stats"] = process_stats;
        return result;
    }
};

#endif