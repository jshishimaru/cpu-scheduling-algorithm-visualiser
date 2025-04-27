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
#include "../algorithms/MLFQ.hpp"
#include "crow/middlewares/cors.h"
#include "../algorithms/MLQ_Aging.hpp"
#include "../algorithms/SJF_Aging.hpp"
#include <vector>
#include <string>

using json = nlohmann::json;

class APIHandler {
private:
	crow::App<crow::CORSHandler> app;

public:
    APIHandler() {
		auto& cors = app.get_middleware<crow::CORSHandler>();
        cors
            .global()
                .origin("*")
                .methods("POST"_method, "GET"_method, "OPTIONS"_method)
                .headers("Content-Type", "Authorization")
                .allow_credentials();
                
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

		CROW_ROUTE(app, "/api/mlq")
		.methods("POST"_method)(APIHandler::handleMLQSchedule);

        CROW_ROUTE(app, "/api/mlfq")
        .methods("POST"_method)
        ([](const crow::request& req) {
            return APIHandler::handleMLFQSchedule(req);
        });

        CROW_ROUTE(app, "/api/mlq-aging")
        .methods("POST"_method)
        ([](const crow::request& req) {
            return APIHandler::handleMLQAgingSchedule(req);
        });

        CROW_ROUTE(app, "/api/sjf-aging")
        .methods("POST"_method)
        ([](const crow::request& req) {
            return APIHandler::handleSJF_AgingSchedule(req);
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
                // Ensure p_id is handled as an integer
                if (process["p_id"].is_number()) {
                    p.p_id = process["p_id"].get<int>();
                } else if (process["p_id"].is_string()) {
                    // Handle string conversion to integer if necessary
                    try {
                        p.p_id = std::stoi(process["p_id"].get<std::string>());
                    } catch (const std::exception& e) {
                        json error_json = {
                            {"status", "error"},
                            {"message", "Invalid process ID format: must be convertible to integer"}
                        };
                        return crow::response(400, error_json.dump());
                    }
                } else {
                    json error_json = {
                        {"status", "error"},
                        {"message", "Process ID must be a number or string convertible to number"}
                    };
                    return crow::response(400, error_json.dump());
                }
                
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
                RR rr;
                result = rr.schedule(processes,quantum);
            } else if (algorithm == "Priority") {
                Priority priority;
                result = priority.schedule(processes);
            } else if (algorithm == "MLQ") {
				int num_queues = input_json.value("num_queues", 3);  // Default to 3 queues if not provided
				int base_quantum = input_json.value("quantum", 2);   // Default base quantum to 2 if not provided
				MLQ mlq;
				result = mlq.schedule(processes, num_queues, base_quantum);
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

	static crow::response handleMLQSchedule(const crow::request& req) {
		try {
			auto input_json = json::parse(req.body);
			
			// Validate input
			if (!input_json.contains("processes")) {
				return crow::response(400, "{\"status\": \"error\", \"message\": \"Missing processes field\"}");
			}
			
			// Parse processes
			vector<Process> processes;
			for (const auto& p : input_json["processes"]) {
				Process process;
                
                // Ensure p_id is handled as an integer
                if (p["p_id"].is_number()) {
                    process.p_id = p["p_id"].get<int>();
                } else if (p["p_id"].is_string()) {
                    // Handle string conversion to integer if necessary
                    try {
                        process.p_id = std::stoi(p["p_id"].get<std::string>());
                    } catch (const std::exception& e) {
                        json error_json = {
                            {"status", "error"},
                            {"message", "Invalid process ID format in MLQ request: must be convertible to integer"}
                        };
                        return crow::response(400, error_json.dump());
                    }
                } else {
                    json error_json = {
                        {"status", "error"},
                        {"message", "Process ID in MLQ request must be a number or string convertible to number"}
                    };
                    return crow::response(400, error_json.dump());
                }
				
				process.arrival_time = p["arrival_time"];
				process.burst_time = p["burst_time"];
				
				// Priority is important for MLQ
				if (p.contains("priority")) {
					process.priority = p["priority"];
				} else {
					process.priority = 0;
				}
				
				processes.push_back(process);
			}
			
			// Get MLQ specific parameters
			int num_queues = input_json.value("num_of_queues", 3);  // Default to 3 queues if not provided
			int base_quantum = input_json.value("quantum", 2);   // Default base quantum to 2 if not provided
			
			// Run MLQ algorithm
			MLQ mlq;
			json result = mlq.schedule(processes, num_queues, base_quantum);
			
			// Ensure the result has the correct status
			result["status"] = "success";
			
			return crow::response(200, result.dump());
		} catch (const std::exception& e) {
			json error_json = {
				{"status", "error"},
				{"message", std::string("Error processing MLQ request: ") + e.what()}
			};
			return crow::response(500, error_json.dump());
		}
	}

    static crow::response handleMLFQSchedule(const crow::request& req) {
        try {
            auto input_json = json::parse(req.body);
            
            // Validate input
            if (!input_json.contains("processes")) {
                return crow::response(400, "{\"status\": \"error\", \"message\": \"Missing processes field\"}");
            }
            
            // Parse processes
            vector<Process> processes;
            for (const auto& p : input_json["processes"]) {
                Process process;
                process.p_id = p["p_id"];
                process.arrival_time = p["arrival_time"];
                process.burst_time = p["burst_time"];
                
                // Priority is important for MLFQ
                if (p.contains("priority")) {
                    process.priority = p["priority"];
                } else {
                    process.priority = 0;
                }
                
                processes.push_back(process);
            }
            
            // Get MLFQ specific parameters
            int num_queues = input_json.value("num_queues", 3);  // Default to 3 queues if not provided
            int base_quantum = input_json.value("quantum", 2);   // Default base quantum to 2 if not provided
            
            // Run MLFQ algorithm
            MLFQ mlfq(base_quantum, num_queues);
            json result = mlfq.schedule(processes);
            
            // Ensure the result has the correct status
            result["status"] = "success";
            
            return crow::response(200, result.dump());
        } catch (const std::exception& e) {
            json error_json = {
                {"status", "error"},
                {"message", std::string("Error processing MLFQ request: ") + e.what()}
            };
            return crow::response(500, error_json.dump());
        }
    }

    static crow::response handleMLQAgingSchedule(const crow::request& req) {
        try {
            auto input_json = json::parse(req.body);
            
            // Validate input
            if (!input_json.contains("processes")) {
                return crow::response(400, "{\"status\": \"error\", \"message\": \"Missing processes field\"}");
            }
            
            // Parse processes
            vector<Process> processes;
            for (const auto& p : input_json["processes"]) {
                Process process;
                process.p_id = p["p_id"];
                process.arrival_time = p["arrival_time"];
                process.burst_time = p["burst_time"];
                
                // Priority is important for MLQ
                if (p.contains("priority")) {
                    process.priority = p["priority"];
                } else {
                    process.priority = 0;
                }
                
                processes.push_back(process);
            }
            
            // Get MLQ specific parameters
            int num_queues = input_json.value("num_queues", 3);  // Default to 3 queues if not provided
            int base_quantum = input_json.value("quantum", 2);   // Default base quantum to 2 if not provided
            
            // Run MLQ algorithm
            MLQAging mlq_aging;
            json result = mlq_aging.schedule(processes, num_queues, base_quantum);
            
            // Ensure the result has the correct status
            result["status"] = "success";
            
            return crow::response(200, result.dump());
        } catch (const std::exception& e) {
            json error_json = {
                {"status", "error"},
                {"message", std::string("Error processing MLQ request: ") + e.what()}
            };
            return crow::response(500, error_json.dump());
        }
    }

    static crow::response handleSJF_AgingSchedule(const crow::request& req) {
        try {
            auto input_json = json::parse(req.body);
            
            // Validate input
            if (!input_json.contains("processes")) {
                return crow::response(400, "{\"status\": \"error\", \"message\": \"Missing processes field\"}");
            }
            
            // Parse processes
            vector<Process> processes;
            for (const auto& p : input_json["processes"]) {
                Process process;
                process.p_id = p["p_id"];
                process.arrival_time = p["arrival_time"];
                process.burst_time = p["burst_time"];
                
                // Priority is important for MLQ
                if (p.contains("priority")) {
                    process.priority = p["priority"];
                } else {
                    process.priority = 0;
                }
                
                processes.push_back(process);
            }
            
            // Get SJF specific parameters
            int aging_threshold = input_json.value("aging_threshold", 50);  // Default to 50 if not provided
            
            // Run SJF algorithm
            SJF_Aging sjf_aging;
            json result = sjf_aging.schedule(processes, aging_threshold);
            
            // Ensure the result has the correct status
            result["status"] = "success";
            
            return crow::response(200, result.dump());
        } catch (const std::exception& e) {
            json error_json = {
                {"status", "error"},
                {"message", std::string("Error processing SJF request: ") + e.what()}
            };
            return crow::response(500, error_json.dump());
        }
    }
};