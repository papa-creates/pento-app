<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getSensei, getRandomPrompt, type Sensei, type Prompt } from '$lib/data/senseis';
  import { stats, sessions, draft, countWords, type WritingSession } from '$lib/stores/session';
  import { subscription, canWrite } from '$lib/stores/subscription';
  import { onMount, onDestroy } from 'svelte';

  const SESSION_MINUTES = 20;
  const SESSION_SECONDS = SESSION_MINUTES * 60;

  let sensei: Sensei | undefined = $state(undefined);
  let currentPrompt: Prompt | undefined = $state(undefined);
  let content = $state('');
  let wordCount = $derived(countWords(content));
  let userCanWrite = $state($canWrite);

  // States: 'prompt' | 'writing' | 'complete'
  let phase = $state<'prompt' | 'writing' | 'complete'>('prompt');

  // Timer
  let secondsRemaining = $state(SESSION_SECONDS);
  let secondsElapsed = $state(0);
  let timerInterval: ReturnType<typeof setInterval> | undefined;
  let autoSaveTimeout: ReturnType<typeof setTimeout> | undefined;
  let lastSaved = $state<Date | null>(null);

  // Subscribe to canWrite changes
  canWrite.subscribe(c => userCanWrite = c);

  // Auto-save draft (debounced)
  function autoSave() {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      if (sensei && currentPrompt && content.trim()) {
        draft.save({
          senseiId: sensei.id,
          promptText: currentPrompt.text,
          content,
          lastSaved: new Date()
        });
        lastSaved = new Date();
      }
    }, 1000); // Save 1 second after typing stops
  }

  // Watch content changes for auto-save
  $effect(() => {
    if (phase === 'writing' && content) {
      autoSave();
    }
  });

  onMount(() => {
    // Check subscription access
    if (!userCanWrite) {
      goto('/pricing');
      return;
    }

    const senseiId = $page.params.buddy;
    sensei = getSensei(senseiId);

    if (!sensei) {
      goto('/');
      return;
    }

    currentPrompt = getRandomPrompt(sensei);
  });

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  });

  function shufflePrompt() {
    if (!sensei) return;
    currentPrompt = getRandomPrompt(sensei);
  }

  function startWriting() {
    phase = 'writing';
    secondsRemaining = SESSION_SECONDS;
    secondsElapsed = 0;

    timerInterval = setInterval(() => {
      secondsElapsed += 1;
      secondsRemaining -= 1;

      if (secondsRemaining <= 0) {
        finishWriting();
      }
    }, 1000);
  }

  function finishWriting() {
    if (timerInterval) clearInterval(timerInterval);

    if (!sensei || !currentPrompt) return;

    const session: WritingSession = {
      id: crypto.randomUUID(),
      senseiId: sensei.id,
      promptText: currentPrompt.text,
      content,
      wordCount,
      startedAt: new Date(Date.now() - secondsElapsed * 1000),
      completedAt: new Date(),
      duration: secondsElapsed
    };

    // Save session with full content
    sessions.add(session);

    // Record session for stats
    stats.recordSession(session);

    // Record session for subscription tracking (counts against free limit)
    subscription.recordSession();

    // Clear the draft since session is complete
    draft.clear();

    phase = 'complete';
  }

  function goHome() {
    goto('/');
  }

  function shareToTwitter() {
    const text = `Just wrote ${wordCount} words in ${formatTime(secondsElapsed)} with Pento.\n\n20 minutes of writing, every day.`;
    const url = 'https://pento-app.vercel.app';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Progress as percentage
  let progress = $derived(((SESSION_SECONDS - secondsRemaining) / SESSION_SECONDS) * 100);
</script>

{#if sensei}
  <div class="write-page">

    {#if phase === 'prompt'}
      <!-- Prompt Phase -->
      <div class="prompt-view">
        <button class="back" onclick={goHome}>
          <span class="logo-small">PENTO</span>
        </button>

        <main class="prompt-content">
          <div class="sensei-badge">
            <span class="kanji">{sensei.kanji}</span>
          </div>

          <p class="prompt-text">{currentPrompt?.text}</p>

          <div class="prompt-actions">
            <button class="btn-primary" onclick={startWriting}>
              begin · {SESSION_MINUTES} min
            </button>
            <button class="btn-secondary" onclick={shufflePrompt}>
              different prompt
            </button>
          </div>
        </main>
      </div>

    {:else if phase === 'writing'}
      <!-- Writing Phase -->
      <div class="writing-view">
        <!-- Minimal Header -->
        <header class="writing-header">
          <span class="timer" class:warning={secondsRemaining < 60}>
            {formatTime(secondsRemaining)}
          </span>
        </header>

        <!-- Progress Bar -->
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progress}%"></div>
        </div>

        <!-- Editor -->
        <textarea
          class="editor"
          bind:value={content}
          placeholder="write..."
          autofocus
        ></textarea>

        <!-- Minimal Footer -->
        <footer class="writing-footer">
          <span class="word-count">{wordCount}</span>
          <button class="finish-btn" onclick={finishWriting} disabled={wordCount < 5}>
            done
          </button>
        </footer>
      </div>

    {:else}
      <!-- Complete Phase -->
      <div class="complete-view">
        <main class="complete-content">
          <div class="sensei-badge">
            <span class="kanji">{sensei.kanji}</span>
          </div>

          <div class="stats-row">
            <div class="stat">
              <span class="number">{wordCount}</span>
              <span class="label">words</span>
            </div>
            <div class="stat">
              <span class="number">{formatTime(secondsElapsed)}</span>
              <span class="label">time</span>
            </div>
          </div>

          <p class="complete-message">well done.</p>

          <div class="complete-actions">
            <button class="btn-primary" onclick={goHome}>
              return
            </button>
            <button class="btn-share" onclick={shareToTwitter}>
              share on X
            </button>
          </div>
        </main>
      </div>
    {/if}

  </div>
{/if}

<style>
  .write-page {
    min-height: 100vh;
    background: var(--bg);
  }

  /* === PROMPT VIEW === */
  .prompt-view {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
    position: relative;
  }

  .back {
    position: absolute;
    top: var(--space-lg);
    left: var(--space-lg);
    padding: var(--space-sm);
  }

  .logo-small {
    font-size: 0.85rem;
    font-weight: 400;
    letter-spacing: 0.3em;
    color: var(--text-muted);
  }

  .prompt-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 600px;
    gap: var(--space-lg);
  }

  .sensei-badge .kanji {
    font-size: 2.5rem;
    color: var(--text-secondary);
  }

  .prompt-text {
    font-size: 1.4rem;
    line-height: 1.6;
    color: var(--text);
    font-weight: 300;
  }

  .prompt-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    margin-top: var(--space-md);
  }

  .btn-primary {
    padding: var(--space-sm) var(--space-lg);
    font-size: 0.9rem;
    letter-spacing: 0.1em;
    border: 1px solid var(--text-muted);
    border-radius: 2px;
    transition: all var(--duration) var(--ease);
  }

  .btn-primary:hover {
    border-color: var(--accent);
    color: var(--accent);
    opacity: 1;
  }

  .btn-secondary {
    font-size: 0.8rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
  }

  /* === WRITING VIEW === */
  .writing-view {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .writing-header {
    display: flex;
    justify-content: center;
    padding: var(--space-md);
  }

  .timer {
    font-family: var(--font-mono);
    font-size: 1.5rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
  }

  .timer.warning {
    color: var(--accent);
  }

  .progress-bar {
    height: 1px;
    background: var(--border);
    width: 100%;
  }

  .progress-fill {
    height: 100%;
    background: var(--text-muted);
    transition: width 1s linear;
  }

  .editor {
    flex: 1;
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-lg);
    background: transparent;
    border: none;
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 1.1rem;
    font-weight: 300;
    line-height: 2;
    resize: none;
  }

  .editor:focus {
    outline: none;
  }

  .editor::placeholder {
    color: var(--text-muted);
  }

  .writing-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md) var(--space-lg);
    border-top: 1px solid var(--border);
  }

  .word-count {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .finish-btn {
    font-size: 0.85rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    padding: var(--space-xs) var(--space-sm);
  }

  .finish-btn:hover:not(:disabled) {
    color: var(--accent);
    opacity: 1;
  }

  .finish-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* === COMPLETE VIEW === */
  .complete-view {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
  }

  .complete-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-lg);
  }

  .stats-row {
    display: flex;
    gap: var(--space-xl);
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat .number {
    font-family: var(--font-mono);
    font-size: 2rem;
    color: var(--text);
  }

  .stat .label {
    font-size: 0.75rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    margin-top: var(--space-xs);
  }

  .complete-message {
    font-size: 1rem;
    color: var(--text-secondary);
    font-style: italic;
  }

  .complete-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  .btn-share {
    font-size: 0.8rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
  }

  .btn-share:hover {
    color: var(--accent);
    opacity: 1;
  }

  @media (max-width: 600px) {
    .prompt-text {
      font-size: 1.2rem;
    }

    .editor {
      padding: var(--space-lg) var(--space-md);
      font-size: 1rem;
    }
  }
</style>
