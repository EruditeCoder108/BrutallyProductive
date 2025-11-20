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
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper to update view and persist it
  const changeView = (newView: AppView) => {
    setView(newView);
    localStorage.setItem('bp_view', newView);
  };

  // Load data from local storage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('bp_tasks');
    const savedDate = localStorage.getItem('bp_date');
    const savedLogs = localStorage.getItem('bp_logs');
    const savedView = localStorage.getItem('bp_view') as AppView | null;

    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }

    const today = getTodayString();
    let currentTasks: Task[] = [];

    // Check if it's a new day
    if (savedDate !== today) {
      // New Day: Reset everything
      console.log('New day detected. Resetting...');
      localStorage.setItem('bp_date', today);
      localStorage.setItem('bp_view', 'builder');
      setTasks([]);
      setView('builder');
    } else {
      // Same Day: Restore State
      if (savedTasks) {
        currentTasks = JSON.parse(savedTasks);
        setTasks(currentTasks);
      }
      
      // Only restore "focus" or "review" if we actually have tasks
      if (savedView && savedView !== 'builder' && currentTasks.length > 0) {
        setView(savedView);
      } else {
        // Fallback to builder if tasks are empty but view was stuck on focus
        setView('builder');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('bp_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const handleStartDay = () => {
    changeView('focus');
  };

  const handleFinishDay = () => {
    changeView('review');
  };

  const handleSaveRating = (rating: number) => {
    const today = getTodayString();
    const newLog: DailyLog = { date: today, rating };
    
    // Remove existing log for today if exists
    const updatedLogs = logs.filter(l => l.date !== today).concat(newLog);
    
    setLogs(updatedLogs);
    localStorage.setItem('bp_logs', JSON.stringify(updatedLogs));
    
    // Reset for "tomorrow" or just clear tasks to simulate end of day
    setTasks([]);
    changeView('builder');
  };

  if (!isLoaded) return null; // Prevent flash of wrong content

  return (
    <div className="min-h-[100dvh] bg-neo-white font-sans text-neo-black overflow-x-hidden">
      {view === 'builder' && (
        <div className="p-6 min-h-[100dvh] pb-[max(6rem,env(safe-area-inset-bottom))]">
           <ScheduleBuilder 
            tasks={tasks} 
            setTasks={setTasks} 
            onStartDay={handleStartDay} 
          />
          
          {/* Simple History Section at bottom of builder */}
          {logs.length > 0 && (
             <div className="max-w-3xl mx-auto mt-10 border-t-4 border-neo-black pt-10 opacity-50 hover:opacity-100 transition-opacity mb-20">
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
          onEditSchedule={() => changeView('builder')}
        />
      )}

      {view === 'review' && (
        <DailyReview 
          onSave={handleSaveRating} 
          onCancel={() => changeView('focus')} 
        />
      )}
    </div>
  );
};

export default App;