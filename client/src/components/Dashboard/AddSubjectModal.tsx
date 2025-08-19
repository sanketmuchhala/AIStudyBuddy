import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Subject, StudyTechnique } from '../../types';

interface AddSubjectModalProps {
  onAdd: (subject: Omit<Subject, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function AddSubjectModal({ onAdd, onClose }: AddSubjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    deadline: '',
    priority: 2 as 1 | 2 | 3,
    difficulty: 3 as 1 | 2 | 3 | 4 | 5,
    estimatedHours: 10,
    completedHours: 0,
    topics: [],
    studyTechniques: ['active-recall'] as StudyTechnique[],
    retentionRate: 0.8,
    cognitiveLoad: 3
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      deadline: new Date(formData.deadline)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add New Subject</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({...prev, deadline: e.target.value}))}
              className="input-field"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({...prev, priority: parseInt(e.target.value) as 1 | 2 | 3}))}
                className="input-field"
              >
                <option value={1}>High</option>
                <option value={2}>Medium</option>
                <option value={3}>Low</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({...prev, difficulty: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5}))}
                className="input-field"
              >
                <option value={1}>Very Easy</option>
                <option value={2}>Easy</option>
                <option value={3}>Medium</option>
                <option value={4}>Hard</option>
                <option value={5}>Very Hard</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Estimated Hours</label>
            <input
              type="number"
              value={formData.estimatedHours}
              onChange={(e) => setFormData(prev => ({...prev, estimatedHours: parseInt(e.target.value)}))}
              className="input-field"
              min="1"
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Add Subject
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}