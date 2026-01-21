<script lang="ts">
  import { achievementDefs, type AchievementDef } from '$lib/data/achievements';
  import { achievements, unlockedIds } from '$lib/stores/achievements';
  import { stats } from '$lib/stores/session';

  let unlockedSet = $state(new Set<string>());
  let userStats = $state($stats);

  unlockedIds.subscribe(ids => unlockedSet = new Set(ids));
  stats.subscribe(s => userStats = s);

  function getUnlockDate(id: string): string | null {
    const date = achievements.getUnlockDate(id);
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  // Progress for milestone achievements
  function getProgress(achievement: AchievementDef): { current: number; target: number } | null {
    switch (achievement.id) {
      case 'word-warrior-1k':
        return { current: Math.min(userStats.totalWords, 1000), target: 1000 };
      case 'word-warrior-10k':
        return { current: Math.min(userStats.totalWords, 10000), target: 10000 };
      case 'word-warrior-50k':
        return { current: Math.min(userStats.totalWords, 50000), target: 50000 };
      case 'the-habit':
        return { current: Math.min(userStats.currentStreak, 7), target: 7 };
      case 'the-professional':
        return { current: Math.min(userStats.currentStreak, 30), target: 30 };
      default:
        return null;
    }
  }

  // Group by category
  const categories = [
    { key: 'milestone', label: 'milestones' },
    { key: 'streak', label: 'streaks' },
    { key: 'sensei', label: 'sensei mastery' },
    { key: 'special', label: 'special' }
  ] as const;
</script>

<svelte:head>
  <title>Achievements | Pento</title>
</svelte:head>

<div class="achievements-page">
  <header class="header">
    <a href="/" class="back">
      <span class="logo-small">PENTO</span>
    </a>
    <h1 class="title">achievements</h1>
    <p class="count">{unlockedSet.size} / {achievementDefs.length}</p>
  </header>

  <main class="content">
    {#each categories as category}
      {@const items = achievementDefs.filter(a => a.category === category.key)}
      {#if items.length > 0}
        <section class="category">
          <h2 class="category-label">{category.label}</h2>
          <div class="grid">
            {#each items as achievement}
              {@const isUnlocked = unlockedSet.has(achievement.id)}
              {@const progress = getProgress(achievement)}
              <div class="achievement" class:locked={!isUnlocked}>
                <span class="icon">{isUnlocked ? achievement.icon : '?'}</span>
                <div class="details">
                  <p class="name">{isUnlocked ? achievement.name : '???'}</p>
                  <p class="desc">
                    {isUnlocked ? achievement.description : 'Keep writing to unlock'}
                  </p>
                  {#if isUnlocked}
                    <p class="date">{getUnlockDate(achievement.id)}</p>
                  {:else if progress}
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        style="width: {(progress.current / progress.target) * 100}%"
                      ></div>
                    </div>
                    <p class="progress-text">
                      {progress.current.toLocaleString()} / {progress.target.toLocaleString()}
                    </p>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </section>
      {/if}
    {/each}
  </main>
</div>

<style>
  .achievements-page {
    min-height: 100vh;
    padding: var(--space-lg);
    max-width: 700px;
    margin: 0 auto;
  }

  .header {
    text-align: center;
    margin-bottom: var(--space-xl);
  }

  .back {
    display: inline-block;
    margin-bottom: var(--space-md);
  }

  .logo-small {
    font-size: 0.85rem;
    font-weight: 400;
    letter-spacing: 0.3em;
    color: var(--text-muted);
  }

  .title {
    font-size: 1.5rem;
    font-weight: 300;
    letter-spacing: 0.2em;
    color: var(--text);
    margin-bottom: var(--space-xs);
  }

  .count {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-family: var(--font-mono);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }

  .category-label {
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: var(--space-md);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-md);
  }

  .achievement {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-md);
    border: 1px solid var(--border);
    border-radius: 4px;
    transition: all var(--duration) var(--ease);
  }

  .achievement:not(.locked) {
    border-color: var(--accent);
  }

  .achievement.locked {
    opacity: 0.5;
  }

  .icon {
    font-size: 2rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .details {
    flex: 1;
    min-width: 0;
  }

  .name {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text);
    margin-bottom: 2px;
  }

  .desc {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .date {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-top: var(--space-xs);
    font-family: var(--font-mono);
  }

  .progress-bar {
    height: 3px;
    background: var(--border);
    border-radius: 2px;
    margin-top: var(--space-xs);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--text-muted);
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-top: 2px;
    font-family: var(--font-mono);
  }

  @media (max-width: 400px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
