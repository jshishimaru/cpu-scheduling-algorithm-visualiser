#include "APIHandler/APIHandler.hpp"

int main()
{
    // Create API handler
    APIHandler api;
    // Start the server
    api.run(18080, true);
    
    return 0;
}