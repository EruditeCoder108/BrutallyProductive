import React, { useState, useEffect } from 'react';
import { Task, AppView, DailyLog } from './types';
import { ScheduleBuilder } from './components/ScheduleBuilder';
import { FocusView } from './components/FocusView';
import { DailyReview } from './components/DailyReview';
import { getTodayString } from './utils';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('builder');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);

  // Load data from local storage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('bp_tasks');
    const savedDate = localStorage.getItem('bp_date');
    const savedLogs = localStorage.getItem('bp_logs');

    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }

    // If date is different from today, clear tasks for a fresh start
    const today = getTodayString();
    if (savedDate !== today) {
      localStorage.setItem('bp_date', today);
      setTasks([]);
      // Stay on builder view
    } else if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      setTasks(parsedTasks);
      // If we have tasks, assume the user might want to resume, 
      // but standard flow is to build first. Let's keep them on builder 
      // unless they actively switched, but for simplicity, default to builder.
      // However, if tasks exist, we enable the "Start" button.
    }
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    localStorage.setItem('bp_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleStartDay = () => {
    setView('focus');
  };

  const handleFinishDay = () => {
    setView('review');
  };

  const handleSaveRating = (rating: number) => {
    const today = getTodayString();
    const newLog: DailyLog = { date: today, rating };
    
    // Remove existing log for today if exists
    const updatedLogs = logs.filter(l => l.date !== today).concat(newLog);
    
    setLogs(updatedLogs);
    localStorage.setItem('bp_logs', JSON.stringify(updatedLogs));
    
    alert(`Rating of ${rating}/10 saved! See you tomorrow.`);
    // Reset for "tomorrow" or just clear tasks to simulate end of day
    setTasks([]);
    setView('builder');
  };

  return (
    <div className="min-h-screen bg-neo-white font-sans text-neo-black overflow-x-hidden">
      {view === 'builder' && (
        <div className="p-6">
           <ScheduleBuilder 
            tasks={tasks} 
            setTasks={setTasks} 
            onStartDay={handleStartDay} 
          />
          
          {/* Simple History Section at bottom of builder */}
          {logs.length > 0 && (
             <div className="max-w-3xl mx-auto mt-10 border-t-4 border-neo-black pt-10 opacity-50 hover:opacity-100 transition-opacity">
               <h3 className="font-black uppercase text-lg mb-4">Performance History</h3>
               <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
                 {logs.slice().reverse().map((log, i) => (
                   <div key={i} className="flex flex-col items-center border-2 border-neo-black p-2 min-w-[80px] bg-white">
                      <span className="text-xs font-bold">{log.date.slice(5)}</span>
                      <span className="text-2xl font-black text-neo-purple">{log.rating}</span>
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>
      )}

      {view === 'focus' && (
        <FocusView 
          tasks={tasks} 
          onFinishDay={handleFinishDay}
          onEditSchedule={() => setView('builder')}
        />
      )}

      {view === 'review' && (
        <DailyReview 
          onSave={handleSaveRating} 
          onCancel={() => setView('focus')} 
        />
      )}
    </div>
  );
};

export default App;