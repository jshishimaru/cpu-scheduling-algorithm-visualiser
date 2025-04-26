import React from 'react';

interface RescheduleButtonProps {
  onClick: () => void;
  loading?: boolean;
}

const RescheduleButton: React.FC<RescheduleButtonProps> = ({ onClick, loading = false }) => {
  return (
    <div className="my-4 flex justify-center">
      <button
        onClick={onClick}
        disabled={loading}
        className={`px-6 py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          loading 
            ? 'bg-blue-400 text-white cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        ) : (
          'Reschedule with New Processes'
        )}
      </button>
    </div>
  );
};

export default RescheduleButton;
