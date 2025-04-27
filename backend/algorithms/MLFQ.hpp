#ifndef MLFQ_HPP
#define MLFQ_HPP
#pragma once
#include <iostream>
#include <vector>
#include <algorithm>
#include <queue>
#include <climits>
#include "../Type.hpp"
#include "../json.hpp"

using namespace std;
using json = nlohmann::json;

class MLFQ {
private:
    int num_queues;
    int base_time_slice;
    
    int getTimeSliceForQueue(int queue_level) {
        if (queue_level == num_queues - 1) {
            return INT_MAX;
        }
        return base_time_slice * (1 << queue_level);
    }
    
public:
    MLFQ(int time_slice = 2, int num_of_queues = 3) : base_time_slice(time_slice), num_queues(num_of_queues) {}
    
    json schedule(const vector<Process>& processes) {
        vector<json> gantt_chart;
        vector<json> process_stats;
        
        vector<Process> sorted_processes = processes;
        sort(sorted_processes.begin(), sorted_processes.end(), [](const Process& a, const Process& b) {
            return a.arrival_time < b.arrival_time;
        });
        
        int n = sorted_processes.size();
        vector<int> remaining_burst_time(n);
        vector<bool> is_completed(n, false);
        vector<int> queue_level(n, 0); 
        vector<int> time_in_current_slice(n, 0);
        
        for (int i = 0; i < n; i++) {
            remaining_burst_time[i] = sorted_processes[i].burst_time;
        }
        
        int current_time = 0;
        int completed = 0;
        int last_process_id = -1;
        
        while (completed < n) {
            int selected_index = -1;
            int highest_priority_queue = num_queues; 
            
            for (int i = 0; i < n; i++) {
                if (!is_completed[i] && sorted_processes[i].arrival_time <= current_time) {
                    if (queue_level[i] < highest_priority_queue) {
                        highest_priority_queue = queue_level[i];
                        selected_index = i;
                    }
                }
            }
            
            if (selected_index == -1) {
                if (last_process_id != -1) {
                    gantt_chart.back()["end_time"] = current_time;
                }
                
                json queue_status;
                for (int q = 0; q < num_queues; q++) {
                    queue_status[to_string(q)] = json::array();
                }
                
                gantt_chart.push_back({
                    {"process_id", -1},
                    {"start_time", current_time},
                    {"queue_level", -1},
                    {"ready_queues", queue_status}
                });
                
                last_process_id = -1;
                current_time++;
                continue;
            }
            
            if (last_process_id != sorted_processes[selected_index].p_id) {
                if (last_process_id != -1) {
                    gantt_chart.back()["end_time"] = current_time;
                }
                
                json queue_status;
                for (int q = 0; q < num_queues; q++) {
                    queue_status[to_string(q)] = json::array();
                }
                
                for (int i = 0; i < n; i++) {
                    if (!is_completed[i] && sorted_processes[i].arrival_time <= current_time && i != selected_index) {
                        queue_status[to_string(queue_level[i])].push_back(sorted_processes[i].p_id);
                    }
                }
                
                gantt_chart.push_back({
                    {"process_id", sorted_processes[selected_index].p_id},
                    {"start_time", current_time},
                    {"queue_level", queue_level[selected_index]},
                    {"ready_queues", queue_status}
                });
                
                last_process_id = sorted_processes[selected_index].p_id;
            }
            
            remaining_burst_time[selected_index]--;
            time_in_current_slice[selected_index]++;
            current_time++;
            
            int current_time_slice = getTimeSliceForQueue(queue_level[selected_index]);
            if (time_in_current_slice[selected_index] >= current_time_slice && queue_level[selected_index] < num_queues - 1) {
                queue_level[selected_index]++;
                time_in_current_slice[selected_index] = 0;
                
                gantt_chart.back()["end_time"] = current_time;
                last_process_id = -1;
            }
            
            if (remaining_burst_time[selected_index] == 0) {
                is_completed[selected_index] = true;
                completed++;
                
                time_in_current_slice[selected_index] = 0;
                
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
                    {"final_queue_level", queue_level[selected_index]}
                });
                
                gantt_chart.back()["end_time"] = current_time;
                last_process_id = -1;
            }
            
            for (int i = 0; i < n; i++) {
                if (sorted_processes[i].arrival_time == current_time) {
                    if (last_process_id != -1) {
                        gantt_chart.back()["end_time"] = current_time;
                        
                        int running_index = -1;
                        for (int j = 0; j < n; j++) {
                            if (sorted_processes[j].p_id == last_process_id) {
                                running_index = j;
                                break;
                            }
                        }
                        
                        if (running_index != -1) {
                            json queue_status;
                            for (int q = 0; q < num_queues; q++) {
                                queue_status[to_string(q)] = json::array();
                            }
                            
                            for (int j = 0; j < n; j++) {
                                if (!is_completed[j] && sorted_processes[j].arrival_time <= current_time && 
                                    sorted_processes[j].p_id != last_process_id) {
                                    queue_status[to_string(queue_level[j])].push_back(sorted_processes[j].p_id);
                                }
                            }
                            
                            gantt_chart.push_back({
                                {"process_id", last_process_id},
                                {"start_time", current_time},
                                {"queue_level", queue_level[running_index]},
                                {"ready_queues", queue_status}
                            });
                        }
                    }
                    break;
                }
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