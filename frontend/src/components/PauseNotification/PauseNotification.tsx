import React from 'react';

interface PauseNotificationProps {
  pausedTime: number;
}

const PauseNotification: React.FC<PauseNotificationProps> = ({ pausedTime }) => {
  // Ensure pausedTime is a valid number to prevent toFixed errors
  const safeTime = typeof pausedTime === 'number' && !isNaN(pausedTime) ? pausedTime : 0;
  
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-5">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Simulation paused at time {safeTime.toFixed(1)}. Add new processes below and reschedule.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PauseNotification;