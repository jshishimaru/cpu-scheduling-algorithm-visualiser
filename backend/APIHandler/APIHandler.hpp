#pragma once

#include "crow.h"
#include "../json.hpp"
#include "../Parser.hpp"
#include "../Type.hpp"
#include "../algorithms/FCFS.hpp"
#include "../algorithms/SJF.hpp"
#include "../algorithms/RR.hpp"
#include "../algorithms/Priority.hpp"
#include "../algorithms/MLQ.hpp"
#include <vector>
#include <string>

using json = nlohmann::json;

class APIHandler {
private:
    crow::SimpleApp app;

public:
    APIHandler() {
        setupRoutes();
    }
    
    // Initialize and set up all routes
    void setupRoutes() {
        // Root endpoint
        CROW_ROUTE(app, "/")([](){
            return APIHandler::handleRoot();
        });

        // Test endpoint
        CROW_ROUTE(app, "/test")([](){
            return APIHandler::handleTest();
        });

        // POST endpoint to receive scheduling data and return results
        CROW_ROUTE(app, "/api/schedule")
        .methods("POST"_method)
        ([](const crow::request& req) {
            return APIHandler::handleSchedule(req);
        });
    }
    
    // Start the server
    void run(int port = 18080, bool multithreaded = true) {
        if (multithreaded) {
            app.port(port).multithreaded().run();
        } else {
            app.port(port).run();
        }
    }
    
    // Route handler methods
    static crow::response handleRoot() {
        json response_json = {
            {"status", "success"},
            {"message", "CPU Scheduling Algorithm Visualiser API"}
        };
        return crow::response(response_json.dump());
    }
    
    static crow::response handleTest() {
        json response_json = {
            {"status", "success"},
            {"message", "Test endpoint working"}
        };
        return crow::response(response_json.dump());
    }
    
    static crow::response handleSchedule(const crow::request& req) {
        try {
            // Parse JSON from request body
            auto req_body = crow::json::load(req.body);
            if (!req_body) {
                json error_json = {
                    {"status", "error"},
                    {"message", "Invalid JSON data"}
                };
                return crow::response(400, error_json.dump());
            }

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
            } else if (algorithm == "SJF") {
                SJF sjf;
                result = sjf.schedule(processes);
            } else if (algorithm == "RR") {
                int quantum = input_json.value("quantum", 1);  // Default quantum to 1 if not provided
                // RR rr(quantum);
                // result = rr.schedule(processes);
            } else if (algorithm == "Priority") {
                // Priority priority;
                // result = priority.schedule(processes);
            } else if (algorithm == "MLQ") {
                // MLQ mlq;
                // result = mlq.schedule(processes);
            } else {
                json error_json = {
                    {"status", "error"},
                    {"message", "Unsupported scheduling algorithm"}
                };
                return crow::response(400, error_json.dump());
            }

            // Ensure the result has the correct status
            result["status"] = "success";
            
            // Return the result as JSON
            return crow::response(result.dump());
        } catch (const std::exception& e) {
            json error_json = {
                {"status", "error"},
                {"message", std::string("Server error: ") + e.what()}
            };
            return crow::response(500, error_json.dump());
        }
    }
};