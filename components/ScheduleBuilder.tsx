import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { NeoButton, NeoCard, NeoInput, NeoToast } from './NeoComponents';
import { generateId, formatTimeDisplay, getMinutesFromMidnight, hasTimeOverlap, playErrorSound } from '../utils';
import { Plus, Trash2, Play, RotateCcw } from 'lucide-react';

interface ScheduleBuilderProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  onStartDay: () => void;
}

export const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({ tasks, setTasks, onStartDay }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [isResetConfirming, setIsResetConfirming] = useState(false);

  // Sort tasks automatically whenever they change
  useEffect(() => {
    const sorted = [...tasks].sort((a, b) => 
      getMinutesFromMidnight(a.startTime) - getMinutesFromMidnight(b.startTime)
    );
    // Only update if order is different to avoid infinite loop
    if (JSON.stringify(sorted) !== JSON.stringify(tasks)) {
      setTasks(sorted);
    }
  }, [tasks, setTasks]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    if (type === 'error') playErrorSound();
  };

  const handleAddTask = () => {
    // 1. Basic Validation
    if (!newTaskTitle.trim()) {
      showToast("Name your task!", 'error');
      return;
    }
    if (!startTime || !endTime) {
      showToast("Set start and end times!", 'error');
      return;
    }

    // 2. Logic Validation
    const startMins = getMinutesFromMidnight(startTime);
    const endMins = getMinutesFromMidnight(endTime);

    if (startMins >= endMins) {
      showToast("End time must be after start!", 'error');
      return;
    }

    // 3. Overlap Validation
    if (hasTimeOverlap(startTime, endTime, tasks)) {
      showToast("Time overlaps with another task!", 'error');
      return;
    }

    const colors: Task['color'][] = ['purple', 'green', 'pink', 'yellow', 'blue'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newTask: Task = {
      id: generateId(),
      title: newTaskTitle,
      startTime,
      endTime,
      color: randomColor,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setStartTime(endTime); // UX: Set next start time to previous end time
    setEndTime('');
    showToast("Block added!", 'success');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleClearAll = () => {
    if (isResetConfirming) {
      setTasks([]);
      setIsResetConfirming(false);
      showToast("Schedule cleared!", 'info');
    } else {
      setIsResetConfirming(true);
      // Auto-reset confirmation state after 3 seconds
      setTimeout(() => setIsResetConfirming(false), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 pb-20 relative">
      {toast && <NeoToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Build Your Day</h1>
        <p className="font-bold text-gray-500">Plan it. Set it. Crush it.</p>
      </div>

      {/* Input Section */}
      <NeoCard className="flex flex-col gap-4">
        <h2 className="font-black text-xl uppercase">Add Block</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NeoInput 
            label="Activity" 
            placeholder="e.g. Deep Work, Gym, Lunch" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <div className="grid grid-cols-2 gap-2">
            <NeoInput 
              label="Start" 
              type="time" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <NeoInput 
              label="End" 
              type="time" 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <NeoButton onClick={handleAddTask} className="w-full flex items-center justify-center gap-2">
          <Plus size={20} /> Add to Schedule
        </NeoButton>
      </NeoCard>

      {/* List Section */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center p-10 border-2 border-dashed border-neo-black opacity-50 rounded-lg">
            <p className="font-bold text-xl uppercase">No routine set yet</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div key={task.id} className="relative group">
              {/* Connector Line */}
              {index !== tasks.length - 1 && (
                <div className="absolute left-[26px] top-[50%] bottom-[-20px] w-1 bg-neo-black -z-10"></div>
              )}
              
              <NeoCard color={task.color} className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-neo-black text-white font-mono text-sm p-1 rounded min-w-[60px] text-center font-bold">
                    {formatTimeDisplay(task.startTime)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-lg uppercase leading-tight">{task.title}</span>
                    <span className="text-xs font-bold opacity-70">Until {formatTimeDisplay(task.endTime)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 hover:bg-black/10 rounded-full transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </NeoCard>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-neo-white/90 backdrop-blur-sm border-t-2 border-neo-black flex items-center justify-between gap-4 z-40">
        <button 
          onClick={handleClearAll} 
          className={`p-3 font-bold hover:underline flex items-center gap-2 transition-colors ${isResetConfirming ? 'text-red-600 bg-red-100 border-2 border-red-600' : 'text-red-500'}`}
        >
          <RotateCcw size={18} /> {isResetConfirming ? 'Sure?' : 'Reset'}
        </button>
        <NeoButton 
          variant="secondary" 
          size="lg" 
          disabled={tasks.length === 0}
          onClick={onStartDay}
          className="flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play fill="currentColor" /> START ROUTINE
        </NeoButton>
      </div>
    </div>
  );
};