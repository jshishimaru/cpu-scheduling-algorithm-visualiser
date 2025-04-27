#ifndef MLQ_AGING_HPP
#define MLQ_AGING_HPP
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

class MLQAging {
private:
    const int AGING_THRESHOLD = 50;

public:
    json schedule(const vector<Process>& processes, int num_queues, int base_quantum) {
        if (num_queues <= 0 || base_quantum <= 0) {
            return json({
                {"status", "error"},
                {"message", "Invalid number of queues or base quantum"}
            });
        }
        json result;
        vector<json> gantt_chart;
        vector<json> process_stats;

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

        vector<deque<int>> queues(num_queues);
        vector<int> time_quanta(num_queues);
        
        for (int i = 0; i < num_queues; i++) {
            time_quanta[i] = base_quantum * (1 << i);
        }

        vector<int> remaining_burst_time(n);
        vector<bool> is_completed(n, false);
        vector<int> completion_time(n, 0);
        vector<int> queue_assignment(n);
        vector<int> waiting_since(n, 0);
        vector<int> total_wait_time(n, 0);
        
        for (int i = 0; i < n; i++) {
            remaining_burst_time[i] = sorted_processes[i].burst_time;
            queue_assignment[i] = min(sorted_processes[i].priority, num_queues - 1);
            waiting_since[i] = sorted_processes[i].arrival_time;
        }

        int current_time = 0;
        int completed = 0;
        int current_process_index = -1;
        bool need_new_gantt_entry = true;

        while (completed < n) {
            bool queue_changed = false;
            
            for (int i = 0; i < n; i++) {
                if (!is_completed[i] && sorted_processes[i].arrival_time == current_time) {
                    queues[queue_assignment[i]].push_back(i);
                    queue_changed = true;
                }
            }

            for (int q = 1; q < num_queues; q++) { 
                vector<int> to_promote;
                for (auto it = queues[q].begin(); it != queues[q].end(); ++it) {
                    int i = *it;
                    int wait_time = current_time - waiting_since[i];
                    if (wait_time >= AGING_THRESHOLD) {
                        to_promote.push_back(i);
                        queue_changed = true;
                    }
                }

                for (int i : to_promote) {
                    queues[q].erase(remove(queues[q].begin(), queues[q].end(), i), queues[q].end());
                    queues[q-1].push_back(i);
                    queue_assignment[i] = q-1;
                    waiting_since[i] = current_time;
                }
            }

            if (queue_changed && !gantt_chart.empty()) {
                gantt_chart.back()["end_time"] = current_time;
                need_new_gantt_entry = true;
            }

            int active_queue = -1;
            for (int i = 0; i < num_queues; i++) {
                if (!queues[i].empty()) {
                    active_queue = i;
                    break;
                }
            }

            if (active_queue == -1) {
                if (need_new_gantt_entry || gantt_chart.empty() || gantt_chart.back()["process_id"] != -1) {
                    if (!gantt_chart.empty()) {
                        gantt_chart.back()["end_time"] = current_time;
                    }

                    json queues_snapshot = json::array();
                    for (int i = 0; i < num_queues; i++) {
                        json queue_snapshot = json::array();
                        for (int idx : queues[i]) {
                            queue_snapshot.push_back(sorted_processes[idx].p_id);
                        }
                        queues_snapshot.push_back(queue_snapshot);
                    }

                    json idle_segment = {
                        {"process_id", -1},
                        {"start_time", current_time},
                        {"queues", queues_snapshot},
                        {"queue_level", -1}
                    };
                    gantt_chart.push_back(idle_segment);
                    need_new_gantt_entry = false;
                }

                int next_arrival = INT_MAX;
                for (int i = 0; i < n; i++) {
                    if (!is_completed[i] && sorted_processes[i].arrival_time > current_time) {
                        next_arrival = min(next_arrival, sorted_processes[i].arrival_time);
                    }
                }

                if (next_arrival == INT_MAX) {
                    break;
                }

                current_time = next_arrival;
                continue;
            }

            int process_index = queues[active_queue].front();
            queues[active_queue].pop_front();
            
            if (need_new_gantt_entry || current_process_index != process_index || gantt_chart.empty() || 
                gantt_chart.back()["process_id"] != sorted_processes[process_index].p_id || 
                gantt_chart.back()["queue_level"] != active_queue) {
                
                if (!gantt_chart.empty()) {
                    gantt_chart.back()["end_time"] = current_time;
                }

                json queues_snapshot = json::array();
                for (int i = 0; i < num_queues; i++) {
                    json queue_snapshot = json::array();
                    for (int idx : queues[i]) {
                        queue_snapshot.push_back(sorted_processes[idx].p_id);
                    }
                    queues_snapshot.push_back(queue_snapshot);
                }

                json new_segment = {
                    {"process_id", sorted_processes[process_index].p_id},
                    {"start_time", current_time},
                    {"queues", queues_snapshot},
                    {"queue_level", active_queue}
                };
                gantt_chart.push_back(new_segment);
                need_new_gantt_entry = false;
            }

            current_process_index = process_index;

            current_time++;
            remaining_burst_time[process_index]--;

            for (int i = 0; i < n; i++) {
                if (!is_completed[i] && i != process_index && sorted_processes[i].arrival_time < current_time) {
                    total_wait_time[i]++;
                }
            }

            if (remaining_burst_time[process_index] == 0) {
                is_completed[process_index] = true;
                completed++;
                completion_time[process_index] = current_time;

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
                    {"final_queue", queue_assignment[process_index]}
                };
                process_stats.push_back(stats);
                need_new_gantt_entry = true;
            } else {
                int time_slice = time_quanta[active_queue];
                int process_runtime = sorted_processes[process_index].burst_time - remaining_burst_time[process_index];
                
                if (process_runtime % time_slice == 0) {
                    queues[active_queue].push_back(process_index);
                    waiting_since[process_index] = current_time;
                    need_new_gantt_entry = true;
                } else {
                    queues[active_queue].push_front(process_index);
                }
            }

            bool promotion_occurred = false;
            for (int q = 1; q < num_queues; q++) {
                for (auto it = queues[q].begin(); it != queues[q].end();) {
                    int i = *it;
                    if (current_time - waiting_since[i] >= AGING_THRESHOLD) {
                        it = queues[q].erase(it);
                        queue_assignment[i] = q - 1;
                        queues[q-1].push_back(i);
                        waiting_since[i] = current_time; 
                        promotion_occurred = true;
                    } else {
                        ++it;
                    }
                }
            }
            
            if (promotion_occurred) {
                need_new_gantt_entry = true;
            }
        }

        if (!gantt_chart.empty() && !gantt_chart.back().contains("end_time")) {
            gantt_chart.back()["end_time"] = current_time;
        }

        result["gantt_chart"] = gantt_chart;
        result["process_stats"] = process_stats;
        return result;
    }
};

#endif