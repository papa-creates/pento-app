import { writable, derived } from 'svelte/store';

// BeforeInstallPromptEvent interface
declare global {
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
    prompt(): Promise<void>;
  }
}

// Store for the install prompt event
export const pwaInstallPrompt = writable<BeforeInstallPromptEvent | null>(null);

// Whether the app can be installed
export const canInstall = writable(false);

// Whether the app is already installed
export const isInstalled = writable(false);

// Derived store: should we show the install button?
export const showInstallButton = derived(
  [canInstall, isInstalled],
  ([$canInstall, $isInstalled]) => $canInstall && !$isInstalled
);

// Function to trigger the install prompt
export async function installApp(): Promise<boolean> {
  let prompt: BeforeInstallPromptEvent | null = null;

  pwaInstallPrompt.subscribe(p => prompt = p)();

  if (!prompt) {
    console.log('No install prompt available');
    return false;
  }

  // Show the install prompt
  await prompt.prompt();

  // Wait for the user's response
  const { outcome } = await prompt.userChoice;

  if (outcome === 'accepted') {
    console.log('User accepted the install prompt');
    canInstall.set(false);
    pwaInstallPrompt.set(null);
    return true;
  } else {
    console.log('User dismissed the install prompt');
    return false;
  }
}
