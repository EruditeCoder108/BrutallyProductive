export interface Task {
  id: string;
  title: string;
  startTime: string; // HH:mm format (24h)
  endTime: string;   // HH:mm format (24h)
  color: 'purple' | 'green' | 'pink' | 'yellow' | 'blue';
  completed: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  rating: number; // 1-10
}

export type AppView = 'builder' | 'focus' | 'review';