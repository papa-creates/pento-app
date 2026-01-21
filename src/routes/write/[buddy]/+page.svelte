<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getSensei, getRandomPrompt, type Sensei, type Prompt } from '$lib/data/senseis';
  import { stats, sessions, draft, countWords, checkAchievements, type WritingSession } from '$lib/stores/session';
  import { get } from 'svelte/store';
  import { subscription, canWrite } from '$lib/stores/subscription';
  import { onMount, onDestroy } from 'svelte';
  import { getAvailableModes, getMode, generateChaosPrompt, type WritingMode } from '$lib/data/modes';

  let sensei: Sensei | undefined = $state(undefined);
  let currentPrompt: Prompt | undefined = $state(undefined);
  let content = $state('');
  let wordCount = $derived(countWords(content));
  let userCanWrite = $state($canWrite);

  // Mode selection
  let availableModes = $state<WritingMode[]>([]);
  let selectedMode = $state<WritingMode | undefined>(undefined);
  let chaosPrompt = $state<string>('');

  // States: 'prompt' | 'writing' | 'complete'
  let phase = $state<'prompt' | 'writing' | 'complete'>('prompt');

  // Timer (dynamic based on mode)
  let sessionDuration = $derived(selectedMode?.duration ?? 20 * 60);
  let secondsRemaining = $state(20 * 60);
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

    // Initialize available modes for this sensei
    availableModes = getAvailableModes(sensei.id);
    selectedMode = availableModes[0]; // Default to Sprint

    currentPrompt = getRandomPrompt(sensei);
  });

  // Select a mode
  function selectMode(mode: WritingMode) {
    selectedMode = mode;
    // If switching to/from Gonzo, update the prompt
    if (mode.features.chaosPrompts) {
      chaosPrompt = generateChaosPrompt();
    }
  }

  // Handle keydown for Flood mode (block backspace/delete)
  function handleKeydown(e: KeyboardEvent) {
    if (!selectedMode?.features.backspace) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
      }
    }
  }

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

    // Use mode duration (null = unlimited for Deep Dive)
    const duration = selectedMode?.duration ?? 20 * 60;
    secondsRemaining = duration;
    secondsElapsed = 0;

    timerInterval = setInterval(() => {
      secondsElapsed += 1;

      // Only countdown if mode has a countdown timer
      if (selectedMode?.features.countdown && secondsRemaining > 0) {
        secondsRemaining -= 1;

        // Auto-finish when timer runs out
        if (secondsRemaining <= 0) {
          finishWriting();
        }
      }
    }, 1000);
  }

  // Deep Dive mode requires minimum 10 minutes
  let canFinishDeep = $derived(secondsElapsed >= 10 * 60);
  let canFinish = $derived(
    wordCount >= 5 &&
    (selectedMode?.id !== 'deep' || canFinishDeep)
  );

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

    // Check for achievement unlocks
    const currentStats = get(stats);
    const allSessions = get(sessions);
    checkAchievements(session, currentStats, allSessions);

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

  // Progress as percentage (for countdown modes)
  let progress = $derived(() => {
    if (!selectedMode?.features.countdown) return 0;
    const duration = selectedMode?.duration ?? 20 * 60;
    return ((duration - secondsRemaining) / duration) * 100;
  });

  // Display time: countdown or elapsed
  let displayTime = $derived(
    selectedMode?.features.countdown ? secondsRemaining : secondsElapsed
  );

  // Get effective prompt (chaos for Gonzo, regular otherwise)
  let effectivePrompt = $derived(
    selectedMode?.features.chaosPrompts ? chaosPrompt : currentPrompt?.text
  );
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

          <p class="prompt-text">
            {#if selectedMode?.features.chaosPrompts}
              {chaosPrompt || effectivePrompt}
            {:else}
              {currentPrompt?.text}
            {/if}
          </p>

          <!-- Mode Selection -->
          <div class="mode-tabs">
            {#each availableModes as mode}
              <button
                class="mode-tab"
                class:active={selectedMode?.id === mode.id}
                onclick={() => selectMode(mode)}
                title={mode.description}
              >
                {mode.name}
              </button>
            {/each}
          </div>

          {#if selectedMode}
            <p class="mode-description">{selectedMode.description}</p>
          {/if}

          <div class="prompt-actions">
            <button class="btn-primary" onclick={startWriting}>
              begin{#if selectedMode?.duration} · {Math.floor(selectedMode.duration / 60)} min{/if}
            </button>
            {#if !selectedMode?.features.chaosPrompts}
              <button class="btn-secondary" onclick={shufflePrompt}>
                different prompt
              </button>
            {:else}
              <button class="btn-secondary" onclick={() => chaosPrompt = generateChaosPrompt()}>
                new chaos
              </button>
            {/if}
          </div>
        </main>
      </div>

    {:else if phase === 'writing'}
      <!-- Writing Phase -->
      <div class="writing-view" class:gonzo={selectedMode?.id === 'gonzo'}>
        <!-- Minimal Header -->
        <header class="writing-header">
          {#if selectedMode?.features.timer}
            <span class="timer" class:warning={selectedMode?.features.countdown && secondsRemaining < 60}>
              {formatTime(displayTime)}
            </span>
            {#if !selectedMode?.features.countdown}
              <span class="timer-label">elapsed</span>
            {/if}
          {/if}
        </header>

        <!-- Mode Indicator -->
        {#if selectedMode?.id === 'flood'}
          <div class="mode-indicator flood">no going back</div>
        {:else if selectedMode?.id === 'gonzo'}
          <div class="mode-indicator gonzo">chaos mode</div>
        {:else if selectedMode?.id === 'deep'}
          <div class="mode-indicator deep">
            {#if !canFinishDeep}
              {Math.ceil((10 * 60 - secondsElapsed) / 60)} min until you can finish
            {:else}
              finish when ready
            {/if}
          </div>
        {/if}

        <!-- Progress Bar (only for countdown modes) -->
        {#if selectedMode?.features.countdown}
          <div class="progress-bar">
            <div class="progress-fill" style="width: {progress()}%"></div>
          </div>
        {/if}

        <!-- Editor -->
        <textarea
          class="editor"
          bind:value={content}
          placeholder="write..."
          autofocus
          onkeydown={handleKeydown}
        ></textarea>

        <!-- Minimal Footer -->
        <footer class="writing-footer">
          <span class="word-count">{wordCount}</span>
          <button class="finish-btn" onclick={finishWriting} disabled={!canFinish}>
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

  /* === MODE SELECTION === */
  .mode-tabs {
    display: flex;
    gap: var(--space-xs);
    margin-top: var(--space-md);
  }

  .mode-tab {
    padding: var(--space-xs) var(--space-sm);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    border: 1px solid var(--border);
    border-radius: 2px;
    transition: all var(--duration) var(--ease);
  }

  .mode-tab:hover {
    border-color: var(--text-muted);
    opacity: 1;
  }

  .mode-tab.active {
    border-color: var(--accent);
    color: var(--accent);
  }

  .mode-description {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: var(--space-xs);
  }

  /* === MODE INDICATORS === */
  .mode-indicator {
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: var(--space-xs) var(--space-sm);
    text-align: center;
    color: var(--text-muted);
  }

  .mode-indicator.flood {
    background: var(--border);
    color: var(--text);
  }

  .mode-indicator.gonzo {
    background: var(--accent);
    color: var(--bg);
    animation: pulse 2s ease-in-out infinite;
  }

  .mode-indicator.deep {
    color: var(--text-muted);
    font-style: italic;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .timer-label {
    font-size: 0.7rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    margin-left: var(--space-xs);
  }

  /* Gonzo mode: pulsing border effect */
  .writing-view.gonzo {
    animation: gonzo-pulse 1.5s ease-in-out infinite;
  }

  @keyframes gonzo-pulse {
    0%, 100% { box-shadow: inset 0 0 0 1px transparent; }
    50% { box-shadow: inset 0 0 0 2px var(--accent); }
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
    align-items: baseline;
    gap: var(--space-xs);
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

    .mode-tabs {
      flex-wrap: wrap;
      justify-content: center;
    }

    .mode-tab {
      font-size: 0.7rem;
    }
  }
</style>
