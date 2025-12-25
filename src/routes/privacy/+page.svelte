<script lang="ts">
  import { goto } from '$app/navigation';

  function goHome() {
    goto('/');
  }
</script>

<div class="legal-page">
  <button class="back" onclick={goHome}>
    <span class="logo-small">PENTO</span>
  </button>

  <main class="content">
    <h1>privacy policy</h1>
    <p class="updated">last updated: december 2024</p>

    <section>
      <h2>what we collect</h2>
      <p>Pento collects minimal data to provide our writing service:</p>
      <ul>
        <li><strong>Writing sessions:</strong> Your writing content, prompts, word counts, and session times are stored locally on your device using browser localStorage. We do not have access to your writing.</li>
        <li><strong>Email address:</strong> If you join our waitlist, we collect your email to send updates about Pento. You can unsubscribe anytime.</li>
        <li><strong>Subscription data:</strong> If you subscribe to Pento Pro, Stripe processes your payment. We receive confirmation of your subscription status but never see your full payment details.</li>
      </ul>
    </section>

    <section>
      <h2>how we store data</h2>
      <p>Your writing stays on your device. We use browser localStorage, which means:</p>
      <ul>
        <li>Your data never leaves your browser unless you choose to export it</li>
        <li>Clearing your browser data will delete your writing history</li>
        <li>We cannot recover lost data since we don't store it</li>
      </ul>
    </section>

    <section>
      <h2>third parties</h2>
      <ul>
        <li><strong>Vercel:</strong> Hosts our website. They may collect standard web traffic logs.</li>
        <li><strong>Stripe:</strong> Processes payments securely. See <a href="https://stripe.com/privacy" target="_blank" rel="noopener">Stripe's privacy policy</a>.</li>
      </ul>
    </section>

    <section>
      <h2>cookies</h2>
      <p>We use localStorage for app functionality (theme preference, sessions, stats). We do not use tracking cookies or analytics.</p>
    </section>

    <section>
      <h2>your rights</h2>
      <p>You can:</p>
      <ul>
        <li>Export your writing data anytime from the history page</li>
        <li>Delete all your data by clearing browser localStorage</li>
        <li>Unsubscribe from emails by clicking the link in any email</li>
        <li>Request account deletion by emailing us</li>
      </ul>
    </section>

    <section>
      <h2>contact</h2>
      <p>Questions? Email us at <a href="mailto:hello@pento.app">hello@pento.app</a></p>
    </section>
  </main>

  <footer class="footer">
    <a href="/terms" class="footer-link">terms</a>
    <span class="dot"></span>
    <span>20 minutes. every day.</span>
  </footer>
</div>

<style>
  .legal-page {
    min-height: 100vh;
    background: var(--bg);
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
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

  .content {
    max-width: 600px;
    margin: 0 auto;
    padding-top: var(--space-xl);
    flex: 1;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 300;
    letter-spacing: 0.15em;
    color: var(--text);
    margin-bottom: var(--space-xs);
  }

  .updated {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-bottom: var(--space-xl);
  }

  section {
    margin-bottom: var(--space-xl);
  }

  h2 {
    font-size: 0.9rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    color: var(--text);
    margin-bottom: var(--space-sm);
    text-transform: lowercase;
  }

  p {
    font-size: 0.9rem;
    line-height: 1.8;
    color: var(--text-secondary);
    margin-bottom: var(--space-sm);
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    font-size: 0.9rem;
    line-height: 1.8;
    color: var(--text-secondary);
    padding-left: var(--space-md);
    position: relative;
    margin-bottom: var(--space-xs);
  }

  li::before {
    content: '·';
    position: absolute;
    left: 0;
    color: var(--text-muted);
  }

  a {
    color: var(--text);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  a:hover {
    color: var(--accent);
  }

  .footer {
    text-align: center;
    padding: var(--space-lg) 0;
    font-size: 0.75rem;
    color: var(--text-muted);
    display: flex;
    justify-content: center;
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

  .dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--text-muted);
  }

  @media (max-width: 600px) {
    .content {
      padding-top: var(--space-lg);
    }

    h1 {
      font-size: 1.2rem;
    }
  }
</style>
