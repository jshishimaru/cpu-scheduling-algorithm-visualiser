# Real-Time CPU Scheduler

A comprehensive CPU scheduling algorithm simulator with visualization tools. This project demonstrates various scheduling algorithms used in operating systems and provides interactive visualizations to understand their behavior.

## Project Overview

This application simulates multiple CPU scheduling algorithms and visualizes their execution using Gantt charts and performance metrics. The project consists of a C++ backend that implements the scheduling algorithms and a React frontend that provides an interactive interface for users to interact with and visualize the scheduling processes.

## Features

- **Multiple Scheduling Algorithms**:
  - First-Come-First-Serve (FCFS)
  - Shortest Job First (SJF)
  - SJF with Aging
  - Round Robin (RR)
  - Priority Scheduling
  - Multi-Level Queue (MLQ)
  - Multi-Level Feedback Queue (MLFQ)
  - MLQ with Aging

- **Interactive Visualizations**:
  - Gantt Charts for process execution visualization
  - Ready Queue visualization
  - Multi-level Queue visualization
  - Real-time animation with customizable speed

- **Performance Analytics**:
  - Turnaround Time
  - Waiting Time
  - Response Time
  - CPU Utilization
  - Throughput
  - Context Switches
  - Normalized Performance Comparison

- **Process Management**:
  - Add custom processes with arrival time, burst time, and priority
  - Customize algorithm parameters (time quantum, number of queues, aging threshold)
  - Reset and reschedule with new configurations

## Project Structure

```
/
├── backend/               # C++ backend implementation
│   ├── algorithms/        # CPU scheduling algorithm implementations
│   │   ├── FCFS.hpp       # First-Come-First-Serve
│   │   ├── SJF.hpp        # Shortest Job First
│   │   ├── SJF_Aging.hpp  # SJF with Aging
│   │   ├── RR.hpp         # Round Robin
│   │   ├── Priority.hpp   # Priority Scheduling
│   │   ├── MLQ.hpp        # Multi-Level Queue
│   │   ├── MLFQ.hpp       # Multi-Level Feedback Queue
│   │   └── MLQ_Aging.hpp  # Multi-Level Queue with Aging
│   ├── APIHandler/        # REST API implementation using Crow
│   ├── json.hpp           # JSON library for C++
│   ├── Parser.hpp         # Input/output parsing utilities
│   ├── Type.hpp           # Core data structures
│   └── main.cpp           # Backend entry point
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── AlgorithmSelector/  # Algorithm selection UI
│   │   │   ├── GanttChart/         # Gantt chart visualization
│   │   │   ├── Graphs/             # Performance analytics graphs
│   │   │   ├── ProcessManager/     # Process management UI
│   │   │   ├── Queue/              # Queue visualizations
│   │   │   └── ...
│   │   ├── services/      # API and utility services
│   │   │   ├── apiservice.ts  # Backend API communication
│   │   │   ├── parser.ts      # Response parsing
│   │   │   └── types.ts       # TypeScript type definitions
│   │   ├── App.tsx        # Main React application
│   │   └── ...
│   └── ...
└── io/                    # Input/output sample JSON files for testing
```

## Technologies Used

### Backend
- C++
- [Crow](https://github.com/CrowCpp/Crow) - A C++ microframework for web services
- nlohmann/json - Modern C++ JSON library

### Frontend
- TypeScript
- React
- Chart.js - For data visualization
- TailwindCSS - For UI styling

## Getting Started

### Prerequisites
- C++ compiler (supporting C++11 or newer)
- Node.js and npm
- Git

### Setting up the Backend

#### Setting up Crow Framework
1. Download Crow's source code:
```bash
git clone https://github.com/CrowCpp/Crow.git
```

2. Build and install Crow:
```bash
cd Crow
mkdir build
cd build
cmake .. -DCROW_BUILD_EXAMPLES=OFF -DCROW_BUILD_TESTS=OFF
make install
```

#### Building the CPU Scheduler Backend
1. Navigate to the backend directory of the project:
```bash
cd backend
```

2. Compile the backend using g++:
```bash
g++ -o main main.cpp -lpthread
```

3. Run the backend server:
```bash
./main
```
The server will start on port 18080 by default.

### Setting Up the Frontend
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```
The frontend will be accessible at http://localhost:3000

## Usage

1. Open the application in your web browser
2. Add processes with arrival time, burst time, and priority (if applicable)
3. Select a scheduling algorithm and configure its parameters
4. Click "Schedule" to run the simulation
5. Explore the Gantt chart visualization and performance metrics
6. Try different algorithms and parameters to compare their performance

## API Endpoints

- `/api/schedule` - General scheduling endpoint for FCFS, SJF, RR, Priority
- `/api/mlq` - Endpoint for Multi-Level Queue scheduling
- `/api/mlfq` - Endpoint for Multi-Level Feedback Queue scheduling
- `/api/mlq-aging` - Endpoint for MLQ with aging
- `/api/sjf-aging` - Endpoint for SJF with aging

## License

This project is licensed under the terms of the LICENSE file included in the repository.

## Acknowledgments

- The project was created as part of an Operating Systems course
- Chart.js library for visualization components
- Crow C++ framework for the backend REST API