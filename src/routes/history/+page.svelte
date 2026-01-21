<script lang="ts">
  import { goto } from '$app/navigation';
  import { sessions, stats, type WritingSession } from '$lib/stores/session';
  import { getSensei, senseis } from '$lib/data/senseis';
  import CalendarHeatmap from '$lib/components/CalendarHeatmap.svelte';

  let sessionList = $state<WritingSession[]>([]);
  let userStats = $state($stats);
  let selectedSession = $state<WritingSession | null>(null);

  sessions.subscribe(s => sessionList = s);
  stats.subscribe(s => userStats = s);

  // Group sessions by date
  type SessionGroup = { date: string; dateLabel: string; sessions: WritingSession[] };

  let groupedSessions = $derived(() => {
    const groups: Record<string, WritingSession[]> = {};

    sessionList.forEach(session => {
      const date = new Date(session.startedAt).toISOString().split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(session);
    });

    // Convert to array and sort by date descending
    return Object.entries(groups)
      .map(([date, sessions]) => ({
        date,
        dateLabel: formatDateLabel(date),
        sessions: sessions.sort((a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        )
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  });

  function formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  // Find favorite sensei (most sessions)
  let favoriteSensei = $derived(() => {
    const counts: Record<string, number> = {};
    sessionList.forEach(s => {
      counts[s.senseiId] = (counts[s.senseiId] || 0) + 1;
    });
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return topId ? getSensei(topId) : null;
  });

  // Find best session (most words)
  let bestSession = $derived(() => {
    if (sessionList.length === 0) return null;
    return sessionList.reduce((best, s) => s.wordCount > best.wordCount ? s : best);
  });

  // Sessions this week
  let sessionsThisWeek = $derived(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionList.filter(s => new Date(s.startedAt) >= weekAgo).length;
  });

  function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function goHome() {
    goto('/');
  }

  function viewSession(session: WritingSession) {
    selectedSession = session;
  }

  function closeDetail() {
    selectedSession = null;
  }

  function deleteSession(id: string) {
    sessions.delete(id);
    selectedSession = null;
  }
</script>

<div class="history-page">
  <button class="back" onclick={goHome}>
    <span class="logo-small">PENTO</span>
  </button>

  {#if selectedSession}
    <!-- Session Detail View -->
    <div class="detail-view">
      <header class="detail-header">
        <button class="back-detail" onclick={closeDetail}>
          <span class="arrow">&larr;</span>
        </button>
        <div class="detail-meta">
          <span class="sensei-kanji">{getSensei(selectedSession.senseiId)?.kanji}</span>
          <span class="detail-date">{formatDate(selectedSession.startedAt)}</span>
        </div>
      </header>

      <main class="detail-content">
        <p class="prompt-recall">{selectedSession.promptText}</p>

        <div class="writing-content">
          {selectedSession.content}
        </div>

        <div class="detail-stats">
          <span>{selectedSession.wordCount} words</span>
          <span class="dot"></span>
          <span>{formatTime(selectedSession.duration || 0)}</span>
        </div>
      </main>

      <footer class="detail-footer">
        <button class="delete-btn" onclick={() => deleteSession(selectedSession!.id)}>
          delete
        </button>
      </footer>
    </div>

  {:else}
    <!-- Session List View -->
    <main class="list-view">
      <h1 class="title">history</h1>

      {#if sessionList.length === 0}
        <div class="empty">
          <p>no sessions yet</p>
          <p class="hint">complete a writing session to see it here</p>
        </div>
      {:else}
        <!-- Stats Dashboard -->
        <div class="stats-dashboard">
          <div class="stats-row">
            <div class="stat-card">
              <span class="stat-value">{userStats.totalWords.toLocaleString()}</span>
              <span class="stat-label">total words</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{userStats.currentStreak}</span>
              <span class="stat-label">day streak</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{sessionsThisWeek()}</span>
              <span class="stat-label">this week</span>
            </div>
          </div>

          <div class="stats-row secondary">
            {#if favoriteSensei()}
              <div class="stat-mini">
                <span class="stat-mini-kanji">{favoriteSensei()?.kanji}</span>
                <span class="stat-mini-label">favorite</span>
              </div>
            {/if}
            {#if bestSession()}
              <div class="stat-mini">
                <span class="stat-mini-value">{bestSession()?.wordCount}</span>
                <span class="stat-mini-label">best session</span>
              </div>
            {/if}
          </div>

          <!-- Heatmap -->
          <div class="heatmap-section">
            <CalendarHeatmap sessions={sessionList} />
          </div>
        </div>

        <!-- Grouped Sessions -->
        <div class="sessions-grouped">
          {#each groupedSessions() as group}
            <div class="session-group">
              <h3 class="group-date">{group.dateLabel}</h3>
              <ul class="session-list">
                {#each group.sessions as session}
                  <li>
                    <button class="session-card" onclick={() => viewSession(session)}>
                      <div class="card-left">
                        <span class="card-kanji">{getSensei(session.senseiId)?.kanji}</span>
                      </div>
                      <div class="card-middle">
                        <p class="card-prompt">{session.promptText}</p>
                        <span class="card-time">{formatTime(session.duration || 0)}</span>
                      </div>
                      <div class="card-right">
                        <span class="card-words">{session.wordCount}</span>
                        <span class="card-label">words</span>
                      </div>
                    </button>
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
        </div>
      {/if}
    </main>
  {/if}
</div>

<style>
  .history-page {
    min-height: 100vh;
    background: var(--bg);
    padding: var(--space-lg);
  }

  .back {
    position: fixed;
    top: var(--space-lg);
    left: var(--space-lg);
    padding: var(--space-sm);
    z-index: 10;
  }

  .logo-small {
    font-size: 0.85rem;
    font-weight: 400;
    letter-spacing: 0.3em;
    color: var(--text-muted);
  }

  /* List View */
  .list-view {
    max-width: 600px;
    margin: 0 auto;
    padding-top: var(--space-xl);
  }

  .title {
    font-size: 1.2rem;
    font-weight: 300;
    letter-spacing: 0.2em;
    color: var(--text-muted);
    text-align: center;
    margin-bottom: var(--space-xl);
  }

  .empty {
    text-align: center;
    padding: var(--space-xl);
  }

  .empty p {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .empty .hint {
    font-size: 0.8rem;
    margin-top: var(--space-sm);
  }

  .session-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .session-card {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    border: 1px solid var(--border);
    border-radius: 4px;
    text-align: left;
    transition: border-color var(--duration) var(--ease);
  }

  .session-card:hover {
    border-color: var(--text-muted);
    opacity: 1;
  }

  .card-left {
    flex-shrink: 0;
  }

  .card-kanji {
    font-size: 1.5rem;
    color: var(--text-secondary);
  }

  .card-middle {
    flex: 1;
    min-width: 0;
  }

  .card-prompt {
    font-size: 0.9rem;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-right {
    flex-shrink: 0;
    text-align: right;
  }

  .card-words {
    font-family: var(--font-mono);
    font-size: 1rem;
    color: var(--text);
    display: block;
  }

  .card-label {
    font-size: 0.65rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
  }

  .card-time {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 2px;
    display: block;
    font-family: var(--font-mono);
  }

  /* Stats Dashboard */
  .stats-dashboard {
    margin-bottom: var(--space-xl);
    padding-bottom: var(--space-lg);
    border-bottom: 1px solid var(--border);
  }

  .stats-row {
    display: flex;
    justify-content: center;
    gap: var(--space-lg);
    margin-bottom: var(--space-md);
  }

  .stats-row.secondary {
    gap: var(--space-xl);
    margin-bottom: var(--space-lg);
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 80px;
  }

  .stat-value {
    font-family: var(--font-mono);
    font-size: 1.8rem;
    color: var(--text);
    font-weight: 300;
  }

  .stat-label {
    font-size: 0.7rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    margin-top: 2px;
  }

  .stat-mini {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-mini-kanji {
    font-size: 1.5rem;
    color: var(--text-secondary);
  }

  .stat-mini-value {
    font-family: var(--font-mono);
    font-size: 1rem;
    color: var(--text);
  }

  .stat-mini-label {
    font-size: 0.65rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    margin-top: 2px;
  }

  .heatmap-section {
    display: flex;
    justify-content: center;
    padding: var(--space-md) 0;
  }

  /* Grouped Sessions */
  .sessions-grouped {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .session-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .group-date {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding-bottom: var(--space-xs);
    border-bottom: 1px solid var(--border);
  }

  /* Detail View */
  .detail-view {
    max-width: 700px;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .detail-header {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) 0;
    padding-left: 60px;
  }

  .back-detail {
    padding: var(--space-sm);
    color: var(--text-muted);
    font-size: 1.2rem;
  }

  .back-detail:hover {
    color: var(--text);
    opacity: 1;
  }

  .detail-meta {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .sensei-kanji {
    font-size: 1.5rem;
    color: var(--text-secondary);
  }

  .detail-date {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .detail-content {
    flex: 1;
    padding: var(--space-lg) 0;
  }

  .prompt-recall {
    font-size: 0.9rem;
    color: var(--text-muted);
    font-style: italic;
    margin-bottom: var(--space-lg);
    padding-bottom: var(--space-md);
    border-bottom: 1px solid var(--border);
  }

  .writing-content {
    font-size: 1.1rem;
    line-height: 2;
    color: var(--text);
    font-weight: 300;
    white-space: pre-wrap;
  }

  .detail-stats {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-top: var(--space-xl);
    padding-top: var(--space-md);
    border-top: 1px solid var(--border);
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--text-muted);
  }

  .detail-footer {
    padding: var(--space-md) 0;
    text-align: center;
  }

  .delete-btn {
    font-size: 0.8rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    padding: var(--space-xs) var(--space-sm);
  }

  .delete-btn:hover {
    color: #c44;
    opacity: 1;
  }

  @media (max-width: 600px) {
    .history-page {
      padding: var(--space-md);
    }

    .detail-header {
      padding-left: 50px;
    }

    .session-card {
      padding: var(--space-sm);
    }

    .card-kanji {
      font-size: 1.2rem;
    }

    .card-prompt {
      font-size: 0.85rem;
    }
  }
</style>
