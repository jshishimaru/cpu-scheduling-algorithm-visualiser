import React from 'react';
import { NewProcessData } from '../NewProcessForm/NewProcessForm';

interface NewProcessTableProps {
  processes: NewProcessData[];
}

const NewProcessTable: React.FC<NewProcessTableProps> = ({ processes }) => {
  if (processes.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 mb-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Burst Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processes.map((process, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">P{process.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{process.arrivalTime}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{process.burstTime}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{process.priority || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewProcessTable;
