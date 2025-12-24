<script lang="ts">
  import { goto } from '$app/navigation';
  import { sessions, type WritingSession } from '$lib/stores/session';
  import { getSensei } from '$lib/data/senseis';

  let sessionList = $state<WritingSession[]>([]);
  let selectedSession = $state<WritingSession | null>(null);

  sessions.subscribe(s => sessionList = s);

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
        <ul class="session-list">
          {#each sessionList as session}
            <li>
              <button class="session-card" onclick={() => viewSession(session)}>
                <div class="card-left">
                  <span class="card-kanji">{getSensei(session.senseiId)?.kanji}</span>
                </div>
                <div class="card-middle">
                  <p class="card-prompt">{session.promptText}</p>
                  <span class="card-date">{formatDate(session.startedAt)}</span>
                </div>
                <div class="card-right">
                  <span class="card-words">{session.wordCount}</span>
                  <span class="card-label">words</span>
                </div>
              </button>
            </li>
          {/each}
        </ul>
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

  .card-date {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 2px;
    display: block;
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
