import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'dark' | 'light';

function createThemeStore() {
  const stored = browser ? localStorage.getItem('pento_theme') as Theme : null;
  const initial: Theme = stored || 'light';

  const { subscribe, set } = writable<Theme>(initial);

  // Apply theme to document
  if (browser) {
    document.documentElement.setAttribute('data-theme', initial);
  }

  return {
    subscribe,
    toggle: () => {
      let newTheme: Theme;
      subscribe(current => {
        newTheme = current === 'dark' ? 'light' : 'dark';
      })();

      set(newTheme!);
      if (browser) {
        document.documentElement.setAttribute('data-theme', newTheme!);
        localStorage.setItem('pento_theme', newTheme!);
      }
    },
    set: (theme: Theme) => {
      set(theme);
      if (browser) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('pento_theme', theme);
      }
    }
  };
}

export const theme = createThemeStore();
