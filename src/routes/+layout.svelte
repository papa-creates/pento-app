<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { pwaInstallPrompt, canInstall, isInstalled } from '$lib/stores/pwa';
  import AchievementToast from '$lib/components/AchievementToast.svelte';

  let { children } = $props();

  onMount(() => {
    if (browser) {
      // Theme setup
      const stored = localStorage.getItem('pento_theme') || 'light';
      document.documentElement.setAttribute('data-theme', stored);

      // Check if already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        isInstalled.set(true);
      }

      // Register service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js').then(
          (registration) => {
            console.log('SW registered:', registration.scope);
          },
          (error) => {
            console.log('SW registration failed:', error);
          }
        );
      }

      // Capture install prompt
      window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        pwaInstallPrompt.set(e as BeforeInstallPromptEvent);
        canInstall.set(true);
      });

      // Track successful install
      window.addEventListener('appinstalled', () => {
        canInstall.set(false);
        isInstalled.set(true);
        pwaInstallPrompt.set(null);
      });
    }
  });
</script>

<div class="app">
  {@render children()}
</div>

<AchievementToast />

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
