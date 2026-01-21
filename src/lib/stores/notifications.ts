import { writable } from 'svelte/store';
import type { AchievementDef } from '$lib/data/achievements';

export interface Notification {
  id: string;
  type: 'achievement';
  achievement: AchievementDef;
  timestamp: Date;
}

function createNotificationStore() {
  const { subscribe, update } = writable<Notification[]>([]);

  return {
    subscribe,

    showAchievement(achievement: AchievementDef) {
      const notification: Notification = {
        id: crypto.randomUUID(),
        type: 'achievement',
        achievement,
        timestamp: new Date()
      };

      update(notifications => [...notifications, notification]);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        this.dismiss(notification.id);
      }, 4000);
    },

    dismiss(id: string) {
      update(notifications => notifications.filter(n => n.id !== id));
    },

    clear() {
      update(() => []);
    }
  };
}

export const notifications = createNotificationStore();
