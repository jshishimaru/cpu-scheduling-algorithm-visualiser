#ifndef PARSER_HPP
#define PARSER_HPP

#include <string>
#include <vector>
#include <fstream>
#include "json.hpp"
#include "Type.hpp"
using namespace std;

class Parser {
public:
    static vector<Process> getProcesses(const string& json_file_path) {
        nlohmann::json json_data = parseJsonFile(json_file_path);
        vector<Process> processes;

        for (const auto& process : json_data["processes"]) {
            Process p;
            p.p_id = process["p_id"];
            p.arrival_time = process["arrival_time"];
            p.burst_time = process["burst_time"];
            p.priority = process["priority"];
            processes.push_back(p);
        }

        return processes;
    }

    static int getTimeSlice(const string& json_file_path) {
        nlohmann::json json_data = parseJsonFile(json_file_path);
        return json_data["time_slice"];
    }

    static int getNumOfQueues(const string& json_file_path) {
        nlohmann::json json_data = parseJsonFile(json_file_path);
        return json_data.value("num_of_queues", 1);
    }

    static string getSchedulingAlgorithm(const string& json_file_path) {
        nlohmann::json json_data = parseJsonFile(json_file_path);
        return json_data["scheduling_type"];
    }

private:
    static nlohmann::json parseJsonFile(const string& json_file_path) {
        ifstream file(json_file_path);
        if (!file.is_open()) {
            throw runtime_error("Could not open JSON file: " + json_file_path);
        }

        nlohmann::json json_data;
        file >> json_data;
        return json_data;
    }
};

#endif