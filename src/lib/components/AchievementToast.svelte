<script lang="ts">
  import { notifications, type Notification } from '$lib/stores/notifications';
  import { newlyUnlocked, clearNewlyUnlocked } from '$lib/stores/session';
  import { getAchievementDef } from '$lib/data/achievements';
  import { onDestroy } from 'svelte';

  let items = $state<Notification[]>([]);

  // Subscribe to notifications
  const unsubNotifications = notifications.subscribe(n => items = n);

  // Watch for newly unlocked achievements and create notifications
  const unsubNewlyUnlocked = newlyUnlocked.subscribe(ids => {
    if (ids.length > 0) {
      ids.forEach(id => {
        const def = getAchievementDef(id);
        if (def) {
          notifications.showAchievement(def);
        }
      });
      clearNewlyUnlocked();
    }
  });

  onDestroy(() => {
    unsubNotifications();
    unsubNewlyUnlocked();
  });

  function dismiss(id: string) {
    notifications.dismiss(id);
  }
</script>

{#if items.length > 0}
  <div class="toast-container">
    {#each items as notification (notification.id)}
      <div class="toast" role="alert">
        <button class="toast-dismiss" onclick={() => dismiss(notification.id)} aria-label="Dismiss">
          ×
        </button>
        <div class="toast-icon">{notification.achievement.icon}</div>
        <div class="toast-content">
          <p class="toast-title">{notification.achievement.name}</p>
          <p class="toast-desc">{notification.achievement.description}</p>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    top: var(--space-lg);
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    pointer-events: none;
  }

  .toast {
    background: var(--bg);
    border: 1px solid var(--accent);
    border-radius: 4px;
    padding: var(--space-md) var(--space-lg);
    display: flex;
    align-items: center;
    gap: var(--space-md);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    pointer-events: auto;
    animation: slideIn 0.3s ease-out;
    position: relative;
    min-width: 280px;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .toast-dismiss {
    position: absolute;
    top: var(--space-xs);
    right: var(--space-xs);
    font-size: 1.2rem;
    color: var(--text-muted);
    padding: 2px 6px;
    line-height: 1;
  }

  .toast-dismiss:hover {
    color: var(--text);
    opacity: 1;
  }

  .toast-icon {
    font-size: 2rem;
    line-height: 1;
  }

  .toast-content {
    flex: 1;
  }

  .toast-title {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text);
    margin-bottom: 2px;
  }

  .toast-desc {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  @media (max-width: 400px) {
    .toast-container {
      left: var(--space-md);
      right: var(--space-md);
      transform: none;
    }

    .toast {
      min-width: auto;
    }
  }
</style>
