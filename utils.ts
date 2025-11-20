import { Task } from './types';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getTodayString = (): string => {
  // Use local time instead of UTC to prevent early resets in Western timezones
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTimeDisplay = (timeStr: string): string => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

// Returns minutes from midnight for easier comparison
export const getMinutesFromMidnight = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const getCurrentTimeInMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

export const getCurrentTask = (tasks: Task[]): Task | null => {
  const currentMinutes = getCurrentTimeInMinutes();
  
  return tasks.find(task => {
    const start = getMinutesFromMidnight(task.startTime);
    const end = getMinutesFromMidnight(task.endTime);
    return currentMinutes >= start && currentMinutes < end;
  }) || null;
};

export const getNextTask = (tasks: Task[]): Task | null => {
  const currentMinutes = getCurrentTimeInMinutes();
  // Sort tasks just in case
  const sortedTasks = [...tasks].sort((a, b) => getMinutesFromMidnight(a.startTime) - getMinutesFromMidnight(b.startTime));
  
  return sortedTasks.find(task => getMinutesFromMidnight(task.startTime) > currentMinutes) || null;
};

export const getDurationString = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const hasTimeOverlap = (newTaskStart: string, newTaskEnd: string, existingTasks: Task[]): boolean => {
  const newStart = getMinutesFromMidnight(newTaskStart);
  const newEnd = getMinutesFromMidnight(newTaskEnd);

  return existingTasks.some(task => {
    const existingStart = getMinutesFromMidnight(task.startTime);
    const existingEnd = getMinutesFromMidnight(task.endTime);

    // Check if ranges overlap
    return (newStart < existingEnd && newEnd > existingStart);
  });
};

// Sound Utilities (Web Audio API)
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

export const playClickSound = () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
};

export const playDingSound = () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // High pitch ding
  oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 1.5);

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 1.5);
};

export const playErrorSound = () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
  oscillator.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);

  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.2);
};