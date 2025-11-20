import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { getCurrentTask, getNextTask, getMinutesFromMidnight, getDurationString, playDingSound } from '../utils';
import { NeoButton, NeoCard } from './NeoComponents';

interface FocusViewProps {
  tasks: Task[];
  onFinishDay: () => void;
  onEditSchedule: () => void;
}

export const FocusView: React.FC<FocusViewProps> = ({ tasks, onFinishDay, onEditSchedule }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [nextTask, setNextTask] = useState<Task | null>(null);
  
  // Ref to track previous task to detect completion
  const prevTaskRef = useRef<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now);
      
      const active = getCurrentTask(tasks);
      const next = getNextTask(tasks);
      
      // Play sound if we transitioned FROM a task to (nothing or another task)
      // OR if we transitioned from one task directly to another
      if (prevTaskRef.current && (!active || active.id !== prevTaskRef.current)) {
        playDingSound();
      }
      
      setCurrentTask(active);
      setNextTask(next);
      
      if (active) {
        prevTaskRef.current = active.id;
      } else {
        prevTaskRef.current = null;
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Calculate progress for the progress bar
  const getProgress = () => {
    if (!currentTask) return 0;
    const start = getMinutesFromMidnight(currentTask.startTime);
    const end = getMinutesFromMidnight(currentTask.endTime);
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const getRemainingMinutes = () => {
    if (!currentTask) return 0;
    const end = getMinutesFromMidnight(currentTask.endTime);
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    return Math.max(0, end - now);
  };

  // Helper for "Nothing Scheduled" calculation
  const getTimeUntilNext = () => {
    if (!nextTask) return null;
    const start = getMinutesFromMidnight(nextTask.startTime);
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    return Math.max(0, start - now);
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-neo-white relative overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 z-10">
        <button onClick={onEditSchedule} className="text-sm font-bold underline hover:text-neo-purple transition-colors">Edit Schedule</button>
        <div className="font-mono font-bold text-xl">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full">
        {currentTask ? (
          <div className="w-full max-w-md relative mt-4">
             {/* Progress Bar (Background) */}
             <div className="absolute -top-8 left-0 w-full h-4 bg-gray-200 border-2 border-neo-black rounded-full overflow-hidden shadow-neo-sm">
                <div 
                  className="h-full bg-neo-black transition-all duration-1000 ease-linear"
                  style={{ width: `${getProgress()}%` }}
                />
             </div>

            <NeoCard 
              color={currentTask.color} 
              className="aspect-[4/5] flex flex-col items-center justify-center text-center gap-6 border-4 shadow-neo-lg animate-in zoom-in duration-300"
            >
              <div className="space-y-2 w-full">
                <span className="bg-black text-white px-3 py-1 font-mono text-sm font-bold uppercase rounded-full">
                  Right Now
                </span>
                <h1 className="text-5xl md:text-6xl font-black uppercase leading-[0.9] break-words">
                  {currentTask.title}
                </h1>
              </div>
              
              <div className="w-full h-1 bg-black opacity-20 my-2"></div>
              
              <div className="flex flex-col items-center">
                <span className="text-xs font-black uppercase tracking-widest opacity-60">Time Remaining</span>
                <span className="text-6xl font-mono font-bold tracking-tighter">
                  {getDurationString(getRemainingMinutes())}
                </span>
              </div>

              <div className="mt-4 font-bold opacity-75">
                Until {currentTask.endTime}
              </div>
            </NeoCard>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <NeoCard color="white" className="aspect-square flex flex-col items-center justify-center text-center gap-4 border-4 border-gray-400 text-gray-400 shadow-none border-dashed">
              <h2 className="text-3xl font-black uppercase">Nothing Scheduled</h2>
              
              {nextTask ? (
                <div className="bg-neo-yellow text-neo-black border-2 border-neo-black p-4 shadow-neo-sm mt-4 w-full">
                  <p className="text-xs font-bold uppercase mb-1">Up Next in {getDurationString(getTimeUntilNext() || 0)}</p>
                  <p className="text-xl font-black uppercase leading-tight">{nextTask.title}</p>
                  <p className="text-sm font-mono font-bold">{nextTask.startTime}</p>
                </div>
              ) : (
                <p className="font-bold">You are free for the rest of the day.</p>
              )}
            </NeoCard>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-6 z-10 flex justify-center">
        <NeoButton variant="danger" onClick={onFinishDay} className="w-full max-w-md">
          End Day & Rate
        </NeoButton>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-neo-green rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-neo-purple rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000 pointer-events-none"></div>
    </div>
  );
};