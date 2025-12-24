<script lang="ts">
  import { senseis } from '$lib/data/senseis';
  import { stats } from '$lib/stores/session';
  import { theme } from '$lib/stores/theme';
  import { subscription, canWrite, sessionsRemaining, FREE_LIMIT } from '$lib/stores/subscription';

  let showSenseis = $state(false);
  let userStats = $state($stats);
  let currentTheme = $state($theme);
  let currentSub = $state($subscription);
  let userCanWrite = $state($canWrite);
  let remaining = $state($sessionsRemaining);

  stats.subscribe(s => userStats = s);
  theme.subscribe(t => currentTheme = t);
  subscription.subscribe(s => currentSub = s);
  canWrite.subscribe(c => userCanWrite = c);
  sessionsRemaining.subscribe(r => remaining = r);
</script>

<div class="home">
  <!-- Theme Toggle -->
  <button class="theme-toggle" onclick={() => theme.toggle()} aria-label="Toggle theme">
    {#if currentTheme === 'dark'}
      <span class="icon">○</span>
    {:else}
      <span class="icon">●</span>
    {/if}
  </button>

  <main class="center">
    {#if !showSenseis}
      <!-- Main View: Just PENTO -->
      <button class="logo-btn" onclick={() => showSenseis = true}>
        <h1 class="logo">PENTO</h1>
        <p class="hint">click to begin</p>
      </button>

      {#if userStats.totalSessions > 0}
        <div class="stats-minimal">
          <span>{userStats.currentStreak} day streak</span>
          <span class="dot"></span>
          <span>{userStats.totalWords.toLocaleString()} words</span>
        </div>
      {/if}

      <!-- Subscription Status -->
      {#if currentSub.status === 'pro'}
        <div class="sub-badge pro">pro</div>
      {:else if remaining < FREE_LIMIT && remaining > 0}
        <div class="sub-hint">
          {remaining} free session{remaining === 1 ? '' : 's'} left
        </div>
      {:else if !userCanWrite}
        <a href="/pricing" class="upgrade-prompt">
          Free sessions used. Upgrade to continue.
        </a>
      {/if}
    {:else}
      <!-- Sensei Selection -->
      <button class="back-btn" onclick={() => showSenseis = false}>
        <span class="logo-small">PENTO</span>
      </button>

      <div class="senseis">
        <p class="choose">choose your sensei</p>

        {#if userCanWrite}
          <nav class="sensei-list">
            {#each senseis as sensei}
              <a href="/write/{sensei.id}" class="sensei">
                <span class="kanji">{sensei.kanji}</span>
                <span class="name">{sensei.name}</span>
                <span class="meaning">{sensei.meaning}</span>
              </a>
            {/each}
          </nav>
        {:else}
          <div class="paywall">
            <p class="paywall-message">You've used all {FREE_LIMIT} free sessions.</p>
            <a href="/pricing" class="paywall-cta">Upgrade to Pro for unlimited writing</a>
          </div>
        {/if}
      </div>
    {/if}
  </main>

  <footer class="footer">
    {#if userStats.totalSessions > 0}
      <a href="/history" class="footer-link">history</a>
      <span class="dot"></span>
    {/if}
    {#if currentSub.status !== 'pro'}
      <a href="/pricing" class="footer-link">pricing</a>
      <span class="dot"></span>
    {/if}
    <span>20 minutes. every day.</span>
  </footer>
</div>

<style>
  .home {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
    position: relative;
  }

  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    flex: 1;
  }

  /* Logo Button */
  .logo-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-xl);
  }

  .logo {
    font-size: clamp(3rem, 12vw, 6rem);
    font-weight: 300;
    letter-spacing: 0.4em;
    margin-right: -0.4em;
    color: var(--text);
  }

  .hint {
    font-size: 0.8rem;
    color: var(--text-muted);
    letter-spacing: 0.2em;
    text-transform: lowercase;
  }

  /* Stats */
  .stats-minimal {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    color: var(--text-muted);
    font-size: 0.85rem;
    margin-top: var(--space-lg);
  }

  .dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--text-muted);
  }

  /* Subscription Status */
  .sub-badge {
    margin-top: var(--space-md);
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 12px;
  }

  .sub-badge.pro {
    background: var(--accent);
    color: var(--bg);
  }

  .sub-hint {
    margin-top: var(--space-md);
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .upgrade-prompt {
    margin-top: var(--space-md);
    font-size: 0.85rem;
    color: var(--accent);
    text-decoration: none;
  }

  .upgrade-prompt:hover {
    text-decoration: underline;
  }

  /* Back Button */
  .back-btn {
    position: absolute;
    top: var(--space-lg);
    left: var(--space-lg);
    padding: var(--space-sm);
  }

  .logo-small {
    font-size: 0.9rem;
    font-weight: 400;
    letter-spacing: 0.3em;
    color: var(--text-muted);
  }

  /* Senseis */
  .senseis {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xl);
  }

  .choose {
    font-size: 0.85rem;
    color: var(--text-muted);
    letter-spacing: 0.15em;
    text-transform: lowercase;
  }

  .sensei-list {
    display: flex;
    gap: var(--space-xl);
  }

  .sensei {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-lg);
    min-width: 120px;
  }

  .sensei:hover {
    opacity: 1;
  }

  .sensei:hover .kanji {
    color: var(--accent);
  }

  .kanji {
    font-size: 3rem;
    color: var(--text-secondary);
    transition: color var(--duration) var(--ease);
  }

  .name {
    font-size: 1rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    margin-top: var(--space-xs);
  }

  .meaning {
    font-size: 0.75rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    text-transform: lowercase;
  }

  /* Paywall */
  .paywall {
    text-align: center;
  }

  .paywall-message {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: var(--space-md);
  }

  .paywall-cta {
    display: inline-block;
    padding: var(--space-sm) var(--space-lg);
    background: var(--accent);
    color: var(--bg);
    border-radius: 4px;
    font-size: 0.9rem;
    text-decoration: none;
  }

  .paywall-cta:hover {
    opacity: 0.9;
  }

  /* Footer */
  .footer {
    position: absolute;
    bottom: var(--space-lg);
    font-size: 0.75rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .footer-link {
    color: var(--text-muted);
    text-decoration: none;
  }

  .footer-link:hover {
    color: var(--text-secondary);
  }

  /* Theme Toggle */
  .theme-toggle {
    position: absolute;
    top: var(--space-lg);
    right: var(--space-lg);
    padding: var(--space-sm);
    font-size: 1rem;
    color: var(--text-muted);
  }

  .theme-toggle:hover {
    color: var(--text-secondary);
    opacity: 1;
  }

  @media (max-width: 600px) {
    .sensei-list {
      flex-direction: column;
      gap: var(--space-lg);
    }

    .logo {
      font-size: clamp(2.5rem, 15vw, 4rem);
    }
  }
</style>
