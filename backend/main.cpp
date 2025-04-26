#include "crow.h"
#include "json.hpp"
#include "Parser.hpp"
#include "Type.hpp"
#include "algorithms/FCFS.hpp"
#include "algorithms/SJF.hpp"
#include "algorithms/RR.hpp"
#include "algorithms/Priority.hpp"
#include "algorithms/MLQ.hpp"
#include <vector>
#include <string>

using json = nlohmann::json;

int main()
{
    crow::SimpleApp app; //define your crow application

    // Root endpoint
    CROW_ROUTE(app, "/")([](){
        return "CPU Scheduling Algorithm Visualiser API";
    });

    // Test endpoint
    CROW_ROUTE(app, "/test")([](){
        return "Test endpoint working";
    });

    // POST endpoint to receive scheduling data and return results
    CROW_ROUTE(app, "/api/schedule")
    .methods("POST"_method)
    ([](const crow::request& req) {
        try {
            // Parse JSON from request body
            auto req_body = crow::json::load(req.body);
            if (!req_body)
                return crow::response(400, "Invalid JSON data");

            // Convert from crow::json to nlohmann::json
            json input_json = json::parse(req.body);
            
            // Extract processes
            std::vector<Process> processes;
            for (const auto& process : input_json["processes"]) {
                Process p;
                p.p_id = process["p_id"];
                p.arrival_time = process["arrival_time"];
                p.burst_time = process["burst_time"];
                p.priority = process.value("priority", 0);  // Default priority to 0 if not provided
                processes.push_back(p);
            }

            // Get scheduling algorithm type
            std::string algorithm = input_json["scheduling_type"];
            
            // Run appropriate algorithm
            json result;
            if (algorithm == "FCFS") {
                FCFS fcfs;
                result = fcfs.schedule(processes);
            } else {
                // Placeholder until other algorithms are implemented
                return crow::response(400, "Only FCFS algorithm is currently implemented");
            }

            // Return the result as JSON
            return crow::response(result.dump());
        } catch (const std::exception& e) {
            return crow::response(500, std::string("Server error: ") + e.what());
        }
    });

    // Set the port, set the app to run on multiple threads, and run the app
    app.port(18080).multithreaded().run();
}