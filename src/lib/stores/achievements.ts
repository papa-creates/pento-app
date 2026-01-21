import { browser } from '$app/environment';
import { writable, derived } from 'svelte/store';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

interface AchievementState {
  unlocked: Record<string, Date>;
}

const STORAGE_KEY = 'pento_achievements';

function createAchievementsStore() {
  // Load from localStorage
  const initial: AchievementState = { unlocked: {} };

  if (browser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        initial.unlocked = Object.fromEntries(
          Object.entries(parsed.unlocked || {}).map(([k, v]) => [k, new Date(v as string)])
        );
      }
    } catch (e) {
      console.error('Failed to load achievements:', e);
    }
  }

  const { subscribe, update, set } = writable<AchievementState>(initial);

  function persist(state: AchievementState) {
    if (browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }

  return {
    subscribe,

    unlock(id: string): boolean {
      let wasNew = false;
      update(state => {
        if (!state.unlocked[id]) {
          wasNew = true;
          const newState = {
            ...state,
            unlocked: {
              ...state.unlocked,
              [id]: new Date()
            }
          };
          persist(newState);
          return newState;
        }
        return state;
      });
      return wasNew;
    },

    isUnlocked(id: string): boolean {
      let result = false;
      subscribe(state => {
        result = !!state.unlocked[id];
      })();
      return result;
    },

    getUnlockDate(id: string): Date | undefined {
      let result: Date | undefined;
      subscribe(state => {
        result = state.unlocked[id];
      })();
      return result;
    },

    reset() {
      const newState = { unlocked: {} };
      set(newState);
      persist(newState);
    }
  };
}

export const achievements = createAchievementsStore();

// Derived stores for counts
export const unlockedCount = derived(achievements, $a => Object.keys($a.unlocked).length);
export const unlockedIds = derived(achievements, $a => Object.keys($a.unlocked));
