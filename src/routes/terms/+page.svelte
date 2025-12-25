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
    <h1>terms of service</h1>
    <p class="updated">last updated: december 2024</p>

    <section>
      <h2>the basics</h2>
      <p>Pento is a writing practice app. By using it, you agree to these terms. If you don't agree, please don't use the app.</p>
    </section>

    <section>
      <h2>your account</h2>
      <ul>
        <li>You're responsible for keeping your device secure</li>
        <li>Your writing is stored locally on your device</li>
        <li>We can't recover data if you clear your browser storage</li>
        <li>You must be at least 13 years old to use Pento</li>
      </ul>
    </section>

    <section>
      <h2>your content</h2>
      <p>You own everything you write. We never read, sell, or share your writing. Your words belong to you.</p>
      <ul>
        <li>Don't use Pento to create illegal content</li>
        <li>Don't attempt to hack, spam, or abuse the service</li>
        <li>We may remove accounts that violate these terms</li>
      </ul>
    </section>

    <section>
      <h2>subscriptions</h2>
      <ul>
        <li><strong>Free tier:</strong> 3 writing sessions, then upgrade required</li>
        <li><strong>Pro:</strong> Unlimited sessions for a monthly or annual fee</li>
        <li>Payments are processed securely by Stripe</li>
        <li>Cancel anytime from your account settings</li>
        <li>Refunds are handled on a case-by-case basis</li>
      </ul>
    </section>

    <section>
      <h2>the service</h2>
      <ul>
        <li>We provide Pento "as is" without warranties</li>
        <li>We may update features, pricing, or these terms</li>
        <li>We'll notify you of significant changes via email</li>
        <li>We're not liable for data loss (back up important writing!)</li>
      </ul>
    </section>

    <section>
      <h2>intellectual property</h2>
      <p>The Pento name, logo, sensei characters, and prompts are our property. Your writing is yours.</p>
    </section>

    <section>
      <h2>termination</h2>
      <p>You can stop using Pento anytime. We can terminate accounts that violate these terms. Upon termination, your local data remains on your device until you clear it.</p>
    </section>

    <section>
      <h2>contact</h2>
      <p>Questions about these terms? Email us at <a href="mailto:hello@pento.app">hello@pento.app</a></p>
    </section>
  </main>

  <footer class="footer">
    <a href="/privacy" class="footer-link">privacy</a>
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
