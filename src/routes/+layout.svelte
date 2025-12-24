<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let { children } = $props();

  onMount(() => {
    if (browser) {
      const stored = localStorage.getItem('pento_theme') || 'light';
      document.documentElement.setAttribute('data-theme', stored);
    }
  });
</script>

<div class="app">
  {@render children()}
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
