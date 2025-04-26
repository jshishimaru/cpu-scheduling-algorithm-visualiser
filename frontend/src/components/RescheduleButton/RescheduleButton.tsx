import React from 'react';

interface RescheduleButtonProps {
  onClick: () => void;
}

const RescheduleButton: React.FC<RescheduleButtonProps> = ({ onClick }) => {
  return (
    <div className="my-4 flex justify-center">
      <button
        onClick={onClick}
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Reschedule with New Processes
      </button>
    </div>
  );
};

export default RescheduleButton;
