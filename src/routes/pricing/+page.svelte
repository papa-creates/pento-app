<script lang="ts">
  import { subscription, canWrite, sessionsRemaining, FREE_LIMIT } from '$lib/stores/subscription';
  import { getStripe } from '$lib/stripe';

  let loading = $state(false);
  let error = $state('');
  let currentSub = $state($subscription);

  subscription.subscribe(s => currentSub = s);

  async function handleCheckout() {
    loading = true;
    error = '';

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const { url, error: apiError } = await response.json();

      if (apiError) {
        error = apiError;
        return;
      }

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (e) {
      error = 'Something went wrong. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="pricing">
  <a href="/" class="back">
    <span class="logo-small">PENTO</span>
  </a>

  <main class="content">
    <h1 class="title">write without limits</h1>
    <p class="subtitle">20 minutes. every day. no interruptions.</p>

    <div class="plans">
      <!-- Free Plan -->
      <div class="plan {currentSub.status === 'free' ? 'current' : ''}">
        <div class="plan-header">
          <h2>Free</h2>
          <p class="price">$0</p>
        </div>
        <ul class="features">
          <li>{FREE_LIMIT} writing sessions</li>
          <li>All senseis</li>
          <li>20-minute timer</li>
          <li>Local storage</li>
        </ul>
        {#if currentSub.status === 'free'}
          <div class="plan-status">
            <span class="sessions-left">{$sessionsRemaining} sessions left</span>
          </div>
        {/if}
      </div>

      <!-- Pro Plan -->
      <div class="plan pro {currentSub.status === 'pro' ? 'current' : ''}">
        <div class="plan-badge">recommended</div>
        <div class="plan-header">
          <h2>Pro</h2>
          <p class="price">$5<span>/month</span></p>
        </div>
        <ul class="features">
          <li>Unlimited sessions</li>
          <li>All senseis</li>
          <li>20-minute timer</li>
          <li>Cloud sync (soon)</li>
          <li>Export all data</li>
          <li>Priority support</li>
        </ul>
        {#if currentSub.status === 'pro'}
          <div class="plan-status">
            <span class="active">Active</span>
          </div>
        {:else}
          <button
            class="upgrade-btn"
            onclick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Upgrade to Pro'}
          </button>
        {/if}
      </div>
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <div class="promise">
      <h3>Our promise</h3>
      <ul>
        <li>Your words belong to you. Export anytime.</li>
        <li>Cancel anytime. No questions asked.</li>
        <li>No ads. No tracking. Just writing.</li>
      </ul>
    </div>
  </main>
</div>

<style>
  .pricing {
    min-height: 100vh;
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .back {
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

  .content {
    max-width: 800px;
    margin-top: var(--space-xl);
    text-align: center;
  }

  .title {
    font-size: 2rem;
    font-weight: 300;
    letter-spacing: 0.1em;
    margin-bottom: var(--space-sm);
  }

  .subtitle {
    color: var(--text-muted);
    font-size: 0.9rem;
    letter-spacing: 0.1em;
    margin-bottom: var(--space-xl);
  }

  .plans {
    display: flex;
    gap: var(--space-lg);
    justify-content: center;
    margin-bottom: var(--space-xl);
  }

  .plan {
    flex: 1;
    max-width: 300px;
    padding: var(--space-lg);
    background: var(--bg-subtle);
    border-radius: 8px;
    text-align: left;
    position: relative;
  }

  .plan.current {
    border: 1px solid var(--accent);
  }

  .plan.pro {
    border: 1px solid var(--border);
  }

  .plan-badge {
    position: absolute;
    top: -10px;
    right: var(--space-md);
    background: var(--accent);
    color: var(--bg);
    font-size: 0.7rem;
    padding: 4px 12px;
    border-radius: 12px;
    letter-spacing: 0.05em;
  }

  .plan-header h2 {
    font-size: 1.2rem;
    font-weight: 400;
    margin-bottom: var(--space-xs);
  }

  .price {
    font-size: 2.5rem;
    font-weight: 300;
    color: var(--text);
  }

  .price span {
    font-size: 1rem;
    color: var(--text-muted);
  }

  .features {
    list-style: none;
    padding: 0;
    margin: var(--space-md) 0;
  }

  .features li {
    padding: var(--space-xs) 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .features li::before {
    content: '+ ';
    color: var(--text-muted);
  }

  .plan-status {
    margin-top: var(--space-md);
    padding-top: var(--space-md);
    border-top: 1px solid var(--border);
  }

  .sessions-left {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .active {
    color: var(--accent);
    font-size: 0.85rem;
  }

  .upgrade-btn {
    width: 100%;
    margin-top: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background: var(--accent);
    color: var(--bg);
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity var(--duration) var(--ease);
  }

  .upgrade-btn:hover {
    opacity: 0.9;
  }

  .upgrade-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error {
    color: #e57373;
    font-size: 0.85rem;
    margin-bottom: var(--space-lg);
  }

  .promise {
    text-align: center;
    padding: var(--space-lg);
    background: var(--bg-subtle);
    border-radius: 8px;
    max-width: 400px;
    margin: 0 auto;
  }

  .promise h3 {
    font-size: 0.9rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin-bottom: var(--space-sm);
  }

  .promise ul {
    list-style: none;
    padding: 0;
  }

  .promise li {
    font-size: 0.85rem;
    color: var(--text-secondary);
    padding: var(--space-xs) 0;
  }

  @media (max-width: 600px) {
    .plans {
      flex-direction: column;
      align-items: center;
    }

    .plan {
      width: 100%;
    }
  }
</style>
