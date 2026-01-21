# Pento - Writing App for Procrastinators

## Overview
20-minute timed writing sessions with three "senseis" (writing coaches). PWA with Stripe payments.

## Tech Stack
- **Framework**: SvelteKit 2 + Svelte 5 (runes: `$state`, `$derived`, `$effect`)
- **Styling**: CSS custom properties, no framework
- **Storage**: localStorage (local-first)
- **Payments**: Stripe (checkout + webhooks)
- **Deployment**: Vercel

## Architecture

```
src/
├── lib/
│   ├── data/senseis.ts      # Sensei definitions + prompts
│   ├── stores/
│   │   ├── session.ts       # Writing sessions, stats, drafts
│   │   ├── subscription.ts  # Pro/free status, limits
│   │   ├── theme.ts         # Dark/light toggle
│   │   └── pwa.ts           # Install prompt state
│   └── stripe.ts            # Stripe client
├── routes/
│   ├── +page.svelte         # Home: logo → sensei selection
│   ├── write/[buddy]/       # Writing session (prompt → write → complete)
│   ├── history/             # Past sessions
│   ├── pricing/             # Stripe checkout
│   └── api/                 # Stripe webhook + checkout
└── static/                  # PWA manifest, icons
```

## Design Principles
- **Minimalist**: Clean, distraction-free, lots of whitespace
- **Zen aesthetic**: Japanese influence (senseis, kanji)
- **Typography-first**: Simple fonts, careful spacing
- **No clutter**: Every element earns its place

## Current Senseis
| ID | Name | Kanji | Meaning | Style |
|----|------|-------|---------|-------|
| kaze | Kaze | 風 | Wind | Hemingway-like: economy, precision |
| sora | Sora | 空 | Sky | Miller-like: flow, discovery |
| ryu | Ryu | 龍 | Dragon | Thompson-like: chaos, intensity |

## Code Patterns

### Svelte 5 Runes (REQUIRED)
```svelte
// State
let count = $state(0);
let doubled = $derived(count * 2);

// Effects
$effect(() => {
  console.log(count);
});

// Store subscriptions
let value = $state($myStore);
myStore.subscribe(v => value = v);
```

### CSS Variables
```css
var(--bg)           /* Background */
var(--text)         /* Primary text */
var(--text-muted)   /* Secondary text */
var(--text-secondary)
var(--accent)       /* Highlight color */
var(--border)       /* Subtle borders */
var(--space-xs/sm/md/lg/xl)
var(--font-sans)
var(--font-mono)
```

### localStorage Keys
- `pento_stats` - User statistics (streaks, totals)
- `pento_sessions` - Full session history with content
- `pento_draft` - Auto-saved work in progress
- `pento_subscription` - Pro status
- `pento_theme` - dark/light
- `pento_waitlist` - Email captures

## Task Execution Guidelines

1. **One feature per task** - Complete fully before moving on
2. **Test in browser** - Run `npm run dev` and verify
3. **Match existing style** - Copy patterns from existing components
4. **Update stores** - New features likely need store additions
5. **Mobile-first** - Test at 375px width

## Commands
```bash
npm run dev      # Dev server at localhost:5173
npm run build    # Production build
npm run preview  # Preview production build
```
