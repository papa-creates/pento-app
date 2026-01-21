import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { achievements } from './achievements';

// Track newly unlocked achievements for toast notifications
export const newlyUnlocked = writable<string[]>([]);

export function clearNewlyUnlocked() {
  newlyUnlocked.set([]);
}

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

export interface Draft {
  senseiId: string;
  promptText: string;
  content: string;
  lastSaved: Date;
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

// Sessions store - persists completed writing sessions
function createSessionsStore() {
  const stored = browser ? localStorage.getItem('pento_sessions') : null;
  const initial: WritingSession[] = stored ? JSON.parse(stored) : [];

  const { subscribe, set, update } = writable<WritingSession[]>(initial);

  return {
    subscribe,
    add: (session: WritingSession) => {
      update(sessions => {
        const updated = [session, ...sessions].slice(0, 100); // Keep last 100
        if (browser) localStorage.setItem('pento_sessions', JSON.stringify(updated));
        return updated;
      });
    },
    delete: (id: string) => {
      update(sessions => {
        const updated = sessions.filter(s => s.id !== id);
        if (browser) localStorage.setItem('pento_sessions', JSON.stringify(updated));
        return updated;
      });
    },
    clear: () => {
      set([]);
      if (browser) localStorage.removeItem('pento_sessions');
    }
  };
}

export const sessions = createSessionsStore();

// Draft store - auto-saves work in progress
function createDraftStore() {
  const stored = browser ? localStorage.getItem('pento_draft') : null;
  const initial: Draft | null = stored ? JSON.parse(stored) : null;

  const { subscribe, set } = writable<Draft | null>(initial);

  return {
    subscribe,
    save: (draft: Draft) => {
      set(draft);
      if (browser) localStorage.setItem('pento_draft', JSON.stringify(draft));
    },
    clear: () => {
      set(null);
      if (browser) localStorage.removeItem('pento_draft');
    },
    get: () => get({ subscribe })
  };
}

export const draft = createDraftStore();

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Achievement checking - call after recording a session
export function checkAchievements(session: WritingSession, userStats: UserStats, allSessions: WritingSession[]) {
  const unlocked: string[] = [];

  function tryUnlock(id: string) {
    if (achievements.unlock(id)) {
      unlocked.push(id);
    }
  }

  // First session
  if (userStats.totalSessions === 1) {
    tryUnlock('first-blood');
  }

  // Word count milestones
  if (userStats.totalWords >= 1000) tryUnlock('word-warrior-1k');
  if (userStats.totalWords >= 10000) tryUnlock('word-warrior-10k');
  if (userStats.totalWords >= 50000) tryUnlock('word-warrior-50k');

  // Single session marathon
  if (session.wordCount >= 1000) {
    tryUnlock('marathon');
  }

  // Streak achievements
  if (userStats.currentStreak >= 7) tryUnlock('the-habit');
  if (userStats.currentStreak >= 30) tryUnlock('the-professional');

  // Sensei-specific counts
  const senseiCounts = allSessions.reduce((acc, s) => {
    acc[s.senseiId] = (acc[s.senseiId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (senseiCounts['kaze'] >= 10) tryUnlock('precision');
  if (senseiCounts['sora'] >= 10) tryUnlock('flow-state');
  if (senseiCounts['ryu'] >= 10) tryUnlock('fearless');

  // Genre hopper - used all 3 senseis
  const uniqueSenseis = new Set(allSessions.map(s => s.senseiId));
  if (uniqueSenseis.size >= 3) {
    tryUnlock('genre-hopper');
  }

  // Time-based achievements
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 4) tryUnlock('night-owl');
  if (hour >= 4 && hour < 7) tryUnlock('early-bird');

  // Update newlyUnlocked store for toast display
  if (unlocked.length > 0) {
    newlyUnlocked.update(current => [...current, ...unlocked]);
  }

  return unlocked;
}
