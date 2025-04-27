#ifndef FCFS_HPP
#define FCFS_HPP
#pragma once
#include <algorithm>
#include <vector>
#include <string>
#include "../json.hpp"
#include "../Type.hpp"

using namespace std;

class FCFS {
public:
    nlohmann::json schedule(const vector<Process>& processes) {
        vector<Process> sorted = processes;
        sort(sorted.begin(), sorted.end(), [](const auto &a, const auto &b) {
            return a.arrival_time < b.arrival_time;
        });

        nlohmann::json result;
        nlohmann::json gantt_chart = nlohmann::json::array();
        nlohmann::json process_stats = nlohmann::json::array();

        int current_time = 0;
        vector<int> completion_time(sorted.size(), 0);
        
        
        if (sorted.empty()) {
            return result;
        }
    
        if (sorted[0].arrival_time > 0) {
            nlohmann::json idle_row;
            idle_row["process_id"] = -1; 
            idle_row["start_time"] = 0;
            idle_row["end_time"] = sorted[0].arrival_time;
            idle_row["ready_queue"] = nlohmann::json::array();
            gantt_chart.push_back(idle_row);
            current_time = sorted[0].arrival_time;
        }
        
        for (size_t i = 0; i < sorted.size(); i++) {
            if (current_time < sorted[i].arrival_time) {
                nlohmann::json idle_row;
                idle_row["process_id"] = -1;  
                idle_row["start_time"] = current_time;
                idle_row["end_time"] = sorted[i].arrival_time;
                idle_row["ready_queue"] = nlohmann::json::array();
                gantt_chart.push_back(idle_row);
                current_time = sorted[i].arrival_time;
            }
            
            int process_start_time = current_time;
            int process_end_time = process_start_time + sorted[i].burst_time;
            
            vector<int> arrival_points;
            vector<vector<int>> ready_queues;
            
            vector<int> current_ready_queue;
            for (size_t j = i + 1; j < sorted.size(); j++) {
                if (sorted[j].arrival_time <= current_time) {
                    current_ready_queue.push_back(sorted[j].p_id);
                }
            }
            arrival_points.push_back(process_start_time);
            ready_queues.push_back(current_ready_queue);
            
            for (size_t j = 0; j < sorted.size(); j++) {
                int arrival = sorted[j].arrival_time;
                if (arrival > process_start_time && arrival < process_end_time) {
                    arrival_points.push_back(arrival);
                }
            }
            
            sort(arrival_points.begin(), arrival_points.end());
            
            arrival_points.erase(unique(arrival_points.begin(), arrival_points.end()), 
                              arrival_points.end());
            
            for (size_t j = 1; j < arrival_points.size(); j++) {
                vector<int> ready_queue;
                for (size_t k = i + 1; k < sorted.size(); k++) {
                    if (sorted[k].arrival_time <= arrival_points[j]) {
                        ready_queue.push_back(sorted[k].p_id);
                    }
                }
                ready_queues.push_back(ready_queue);
            }
            
            arrival_points.push_back(process_end_time);
            
            for (size_t j = 0; j < arrival_points.size() - 1; j++) {
                nlohmann::json gantt_row;
                gantt_row["process_id"] = sorted[i].p_id;
                gantt_row["start_time"] = arrival_points[j];
                gantt_row["end_time"] = arrival_points[j + 1];
                gantt_row["ready_queue"] = ready_queues[j];
                gantt_chart.push_back(gantt_row);
            }
            
            current_time = process_end_time;
            completion_time[i] = process_end_time;
        }

        for (size_t i = 0; i < sorted.size(); i++) {
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