import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface WritingSession {
  id: string;
  senseiId: string;
  promptText: string;
  content: string;
  wordCount: number;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
}

export interface UserStats {
  totalSessions: number;
  totalWords: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastWritingDate?: string;
}

function createStatsStore() {
  const stored = browser ? localStorage.getItem('pento_stats') : null;
  const initial: UserStats = stored ? JSON.parse(stored) : {
    totalSessions: 0,
    totalWords: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0
  };

  const { subscribe, set, update } = writable<UserStats>(initial);

  return {
    subscribe,
    recordSession: (session: WritingSession) => {
      update(stats => {
        const today = new Date().toDateString();
        const lastDate = stats.lastWritingDate;
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        let newStreak = stats.currentStreak;
        if (lastDate === today) {
          // Same day
        } else if (lastDate === yesterday) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        const minutes = session.duration ? Math.floor(session.duration / 60) : 0;

        const updated: UserStats = {
          totalSessions: stats.totalSessions + 1,
          totalWords: stats.totalWords + session.wordCount,
          totalMinutes: stats.totalMinutes + minutes,
          currentStreak: newStreak,
          longestStreak: Math.max(stats.longestStreak, newStreak),
          lastWritingDate: today
        };

        if (browser) localStorage.setItem('pento_stats', JSON.stringify(updated));
        return updated;
      });
    },
    reset: () => {
      const fresh: UserStats = {
        totalSessions: 0,
        totalWords: 0,
        totalMinutes: 0,
        currentStreak: 0,
        longestStreak: 0
      };
      set(fresh);
      if (browser) localStorage.removeItem('pento_stats');
    }
  };
}

export const stats = createStatsStore();

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
