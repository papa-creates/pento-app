<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { subscription } from '$lib/stores/subscription';

  let status = $state<'loading' | 'success' | 'error'>('loading');

  onMount(async () => {
    const sessionId = $page.url.searchParams.get('session_id');

    if (!sessionId) {
      status = 'error';
      return;
    }

    // In production, you'd verify the session with your backend
    // For now, we'll optimistically upgrade
    try {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Upgrade the subscription locally
      subscription.upgrade(
        'cus_' + sessionId.slice(0, 8), // Placeholder customer ID
        'sub_' + sessionId.slice(8, 16), // Placeholder subscription ID
        Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days from now
      );

      status = 'success';

      // Redirect to home after 3 seconds
      setTimeout(() => goto('/'), 3000);
    } catch (e) {
      status = 'error';
    }
  });
</script>

<div class="success-page">
  <main class="content">
    {#if status === 'loading'}
      <div class="kanji">...</div>
      <h1>Confirming your subscription</h1>
      <p class="hint">Just a moment...</p>
    {:else if status === 'success'}
      <div class="kanji">道</div>
      <h1>Welcome to Pro</h1>
      <p class="hint">Your writing journey continues, without limits.</p>
      <p class="redirect">Redirecting to home...</p>
      <a href="/" class="home-link">Go to home now</a>
    {:else}
      <div class="kanji">?</div>
      <h1>Something went wrong</h1>
      <p class="hint">Please contact support if you were charged.</p>
      <a href="/pricing" class="home-link">Back to pricing</a>
    {/if}
  </main>
</div>

<style>
  .success-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
  }

  .content {
    text-align: center;
  }

  .kanji {
    font-size: 4rem;
    color: var(--accent);
    margin-bottom: var(--space-md);
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 300;
    letter-spacing: 0.1em;
    margin-bottom: var(--space-sm);
  }

  .hint {
    color: var(--text-muted);
    font-size: 0.9rem;
    letter-spacing: 0.05em;
  }

  .redirect {
    color: var(--text-muted);
    font-size: 0.8rem;
    margin-top: var(--space-lg);
  }

  .home-link {
    display: inline-block;
    margin-top: var(--space-md);
    color: var(--accent);
    font-size: 0.9rem;
    text-decoration: none;
  }

  .home-link:hover {
    text-decoration: underline;
  }
</style>
