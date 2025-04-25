#include "Parser.hpp"
#include "algorithms/FCFS.hpp"
#include "json.hpp"
#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    string json_file_path = "../io/input.json";

    try {
        vector<Process> processes = Parser::getProcesses(json_file_path);

        FCFS fcfs;
        nlohmann::json schedule_result = fcfs.schedule(processes);

        cout << schedule_result.dump(4) << endl;
    } catch (const exception& e) {
        cerr << "Error: " << e.what() << "\n";
    }

    return 0;
}