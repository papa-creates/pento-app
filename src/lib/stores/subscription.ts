import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface Subscription {
  status: 'free' | 'pro' | 'cancelled';
  sessionsUsed: number;
  customerId?: string;
  subscriptionId?: string;
  currentPeriodEnd?: number;
}

const FREE_SESSION_LIMIT = 3;

function createSubscriptionStore() {
  const stored = browser ? localStorage.getItem('pento_subscription') : null;
  const initial: Subscription = stored ? JSON.parse(stored) : {
    status: 'free',
    sessionsUsed: 0
  };

  const { subscribe, set, update } = writable<Subscription>(initial);

  // Persist to localStorage
  if (browser) {
    subscribe(value => {
      localStorage.setItem('pento_subscription', JSON.stringify(value));
    });
  }

  return {
    subscribe,

    // Record a session
    recordSession: () => {
      update(sub => ({
        ...sub,
        sessionsUsed: sub.sessionsUsed + 1
      }));
    },

    // Upgrade to pro
    upgrade: (customerId: string, subscriptionId: string, periodEnd: number) => {
      set({
        status: 'pro',
        sessionsUsed: 0,
        customerId,
        subscriptionId,
        currentPeriodEnd: periodEnd
      });
    },

    // Cancel subscription
    cancel: () => {
      update(sub => ({
        ...sub,
        status: 'cancelled'
      }));
    },

    // Reset for testing
    reset: () => {
      set({
        status: 'free',
        sessionsUsed: 0
      });
    }
  };
}

export const subscription = createSubscriptionStore();

// Derived store: can user write?
export const canWrite = derived(subscription, $sub => {
  if ($sub.status === 'pro') return true;
  if ($sub.status === 'cancelled') return false;
  return $sub.sessionsUsed < FREE_SESSION_LIMIT;
});

// Derived store: sessions remaining
export const sessionsRemaining = derived(subscription, $sub => {
  if ($sub.status === 'pro') return Infinity;
  return Math.max(0, FREE_SESSION_LIMIT - $sub.sessionsUsed);
});

export const FREE_LIMIT = FREE_SESSION_LIMIT;
