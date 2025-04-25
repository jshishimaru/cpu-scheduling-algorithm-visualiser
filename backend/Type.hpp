#ifndef TYPE_HPP
#define TYPE_HPP

#include <string>
using namespace std;

struct Process {
    string p_id;
    int arrival_time;
    int burst_time;
    int priority;
};

#endif