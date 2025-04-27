import React, { useState } from 'react';
import { NewProcessData } from '../NewProcessForm/NewProcessForm';

interface NewProcessTableProps {
  processes: NewProcessData[];
  onEditProcess?: (processId: number, updatedProcess: NewProcessData) => void;
  onDeleteProcess?: (processId: number) => void;
}

const NewProcessTable: React.FC<NewProcessTableProps> = ({ processes, onEditProcess, onDeleteProcess }) => {
  const [editingProcess, setEditingProcess] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<NewProcessData | null>(null);

  if (processes.length === 0) {
    return null;
  }

  const handleEditClick = (process: NewProcessData) => {
    setEditingProcess(process.id);
    setEditForm({ ...process });
  };

  const handleCancelEdit = () => {
    setEditingProcess(null);
    setEditForm(null);
  };

  const handleSaveEdit = (processId: number) => {
    if (editForm && onEditProcess) {
      onEditProcess(processId, editForm);
      setEditingProcess(null);
      setEditForm(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editForm) return;
    
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: parseInt(value, 10) || 0,
    });
  };

  return (
    <div className="mt-2 mb-2">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Burst</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              {(onEditProcess || onDeleteProcess) && (
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processes.map((process) => (
              <tr key={process.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">P{process.id}</td>
                
                {editingProcess === process.id ? (
                  <>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="number"
                        name="arrivalTime"
                        value={editForm?.arrivalTime || 0}
                        onChange={handleInputChange}
                        className="w-14 px-1 py-0.5 text-xs border rounded"
                        min="0"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="number"
                        name="burstTime"
                        value={editForm?.burstTime || 0}
                        onChange={handleInputChange}
                        className="w-14 px-1 py-0.5 text-xs border rounded"
                        min="1"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="number"
                        name="priority"
                        value={editForm?.priority || 0}
                        onChange={handleInputChange}
                        className="w-14 px-1 py-0.5 text-xs border rounded"
                        min="0"
                      />
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 space-x-1">
                      <button 
                        onClick={() => handleSaveEdit(process.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Save"
                      >
                        {/* Save icon */}
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-900"
                        title="Cancel"
                      >
                        {/* Cancel icon */}
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{process.arrivalTime}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{process.burstTime}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{process.priority || 'N/A'}</td>
                    
                    {(onEditProcess || onDeleteProcess) && (
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500 space-x-1">
                        {onEditProcess && (
                          <button 
                            onClick={() => handleEditClick(process)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            {/* Edit icon */}
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {onDeleteProcess && (
                          <button 
                            onClick={() => onDeleteProcess(process.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            {/* Delete icon */}
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewProcessTable;
