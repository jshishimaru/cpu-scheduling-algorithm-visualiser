#include "Parser.hpp"
#include <iostream>
using namespace std;

int main() {
    string json_file_path = "../io/input.json";

    try {
        vector<Process> processes = Parser::getProcesses(json_file_path);
        cout << "Processes:\n";
        for (const auto& process : processes) {
            cout << "Process ID: " << process.p_id
                      << ", Arrival Time: " << process.arrival_time
                      << ", Burst Time: " << process.burst_time
                      << ", Priority: " << process.priority << "\n";
        }

        int time_slice = Parser::getTimeSlice(json_file_path);
        cout << "Time Slice: " << time_slice << "\n";

        int num_of_queues = Parser::getNumOfQueues(json_file_path);
        cout << "Number of Queues: " << num_of_queues << "\n";

        string scheduling_algorithm = Parser::getSchedulingAlgorithm(json_file_path);
        cout << "Scheduling Algorithm: " << scheduling_algorithm << "\n";

    } catch (const exception& e) {
        cerr << "Error: " << e.what() << "\n";
    }

    return 0;
}