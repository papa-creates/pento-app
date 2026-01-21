# Pento Feature Sweep PRD

## Overview
Add gamification, writing modes, buddy personality, and dashboard to make Pento sticky and delightful.

---

## PHASE 1: Gamification Foundation

### Task 1.1: Achievement Data Model
**File**: `src/lib/stores/achievements.ts`

Create achievement system store with:
- Achievement interface: `{ id, name, description, icon, unlockedAt?, criteria }`
- Store with `unlock(id)`, `isUnlocked(id)`, `getAll()` methods
- Persist to localStorage key `pento_achievements`
- Export derived `$unlockedCount` and `$totalCount`

**Acceptance**:
- [x] Can call `achievements.unlock('first-blood')` and it persists
- [x] Reloading page preserves unlocked achievements
- [x] `$unlockedCount` reactive updates work

---

### Task 1.2: Achievement Definitions
**File**: `src/lib/data/achievements.ts`

Define achievements matching CONCEPT.md:
```
first-blood     "First Blood"        Complete first session
the-habit       "The Habit"          7-day streak
the-professional "The Professional"  30-day streak
genre-hopper    "Genre Hopper"       Write with all 3 senseis
word-warrior-1k "Word Warrior"       1,000 total words
word-warrior-10k "Prolific"          10,000 total words
word-warrior-50k "Unstoppable"       50,000 total words
fearless        "Fearless"           10 sessions with Ryu
flow-state      "Flow State"         10 sessions with Sora
precision       "Precision"          10 sessions with Kaze
night-owl       "Night Owl"          Session after 10pm
early-bird      "Early Bird"         Session before 7am
marathon        "Marathon"           Session over 1000 words
```

**Acceptance**:
- [x] At least 12 achievements defined
- [x] Each has id, name, description, icon (emoji)
- [x] Exportable as array

---

### Task 1.3: Achievement Unlock Logic
**File**: `src/lib/stores/session.ts` (modify)

After `stats.recordSession()`, check and unlock achievements:
- Check streak milestones (7, 30 days)
- Check word count milestones (1k, 10k, 50k)
- Check sensei-specific counts (10 each)
- Check time-based (hour of completion)
- Check first session

**Acceptance**:
- [x] Completing first session unlocks "First Blood"
- [x] Reaching 7-day streak unlocks "The Habit"
- [x] Writing 1000+ words in session unlocks "Marathon"

---

### Task 1.4: Achievement Toast Notification
**File**: `src/lib/components/AchievementToast.svelte`

Create toast component:
- Slides in from top when achievement unlocked
- Shows icon, name, description
- Auto-dismisses after 4 seconds
- Styled to match app aesthetic

**File**: `src/lib/stores/notifications.ts`
- Store to queue notifications
- `show(achievement)` method

**Acceptance**:
- [x] Toast appears when achievement unlocks
- [x] Multiple achievements queue properly
- [x] Dismisses automatically

---

### Task 1.5: Achievement Gallery Page
**File**: `src/routes/achievements/+page.svelte`

Create achievements page:
- Grid of all achievements
- Unlocked: full color with unlock date
- Locked: grayed out with "???" or hint
- Progress bars for milestone achievements
- Link from footer

**Acceptance**:
- [x] Page accessible at /achievements
- [x] Shows all achievements in grid
- [x] Visual distinction between locked/unlocked
- [x] Mobile responsive

---

## PHASE 2: Writing Modes

### Task 2.1: Mode Selection Data
**File**: `src/lib/data/modes.ts`

Define writing modes:
```typescript
interface WritingMode {
  id: 'sprint' | 'deep' | 'flood' | 'gonzo';
  name: string;
  description: string;
  duration: number | null; // null = unlimited
  features: {
    timer: boolean;
    backspace: boolean;
    wordGoal: number | null;
  };
}
```

Modes:
- Sprint: 15 min, timer on, word goal 300
- Deep Dive: no timer, backspace on
- Flood: 10 min, NO backspace allowed
- Gonzo: 5 min, chaos prompt combos

**Acceptance**:
- [x] 4 modes defined with distinct mechanics
- [x] Exportable and typed

---

### Task 2.2: Mode Selection UI
**File**: `src/routes/write/[buddy]/+page.svelte` (modify)

Add mode selection to prompt phase:
- After showing prompt, before "begin"
- Horizontal toggle/tabs for modes
- Show mode description on hover/tap
- Default to Sprint
- Store selected mode in session

**Acceptance**:
- [ ] Can select mode before starting
- [ ] Mode selection visible but not intrusive
- [ ] Selected mode persists through session

---

### Task 2.3: Flood Mode (No Backspace)
**File**: `src/routes/write/[buddy]/+page.svelte` (modify)

When mode is 'flood':
- Disable backspace key in textarea
- Show visual indicator "flood mode: no going back"
- 10-minute timer
- Celebrate chaos at completion

**Acceptance**:
- [ ] Backspace does nothing in flood mode
- [ ] Delete key also disabled
- [ ] Clear indicator shown during writing

---

### Task 2.4: Deep Dive Mode (No Timer)
**File**: `src/routes/write/[buddy]/+page.svelte` (modify)

When mode is 'deep':
- Hide countdown timer
- Show elapsed time instead (subtle)
- No auto-finish, must click "done"
- Minimum 10 minutes before can finish

**Acceptance**:
- [ ] No countdown pressure
- [ ] Elapsed time shown subtly
- [ ] Can't finish before 10 min

---

### Task 2.5: Gonzo Mode (Chaos Prompts)
**File**: `src/lib/data/senseis.ts` (modify)

Add chaos prompt generator:
- Combine random elements: setting + constraint + mood
- Example: "A hospital waiting room. Only questions. Furious."
- Only available with Ryu sensei

**File**: `src/routes/write/[buddy]/+page.svelte` (modify)
- 5-minute intense sprint
- Generate fresh chaos prompt
- Urgent styling (pulsing border?)

**Acceptance**:
- [ ] Gonzo generates unique combo prompts
- [ ] Only available with Ryu
- [ ] Feels urgent/intense

---

## PHASE 3: Buddy Personality

### Task 3.1: Sensei Voice Messages
**File**: `src/lib/data/senseis.ts` (modify)

Add voice messages per sensei:
```typescript
interface Sensei {
  // ... existing
  voice: {
    greeting: string[];      // When selecting sensei
    encouragement: string[]; // During writing (optional)
    completion: string[];    // When finishing
    streak: string[];        // Streak milestones
  };
}
```

Write 5+ messages per category per sensei, matching their personality.

**Acceptance**:
- [ ] Each sensei has distinct voice
- [ ] At least 5 completion messages each
- [ ] Messages match CONCEPT.md personality

---

### Task 3.2: Completion Reactions
**File**: `src/routes/write/[buddy]/+page.svelte` (modify)

Replace generic "well done" with sensei-specific:
- Pull random message from sensei.voice.completion
- Style to feel personal
- Maybe add sensei kanji with message

**Acceptance**:
- [ ] Completion shows sensei-specific message
- [ ] Different message each time (random)
- [ ] Feels like the sensei is talking

---

### Task 3.3: Streak Milestone Messages
**File**: `src/routes/+page.svelte` (modify)

When returning user has streak milestone:
- 3 days: Show encouragement
- 7 days: Celebration message
- 30 days: Major celebration
- Pull from sensei they used most

**Acceptance**:
- [ ] Milestone messages appear at 3/7/30 days
- [ ] Styled appropriately for milestone level
- [ ] Uses favorite sensei's voice

---

## PHASE 4: Dashboard & Stats

### Task 4.1: Stats Visualization
**File**: `src/routes/history/+page.svelte` (modify or new dashboard)

Add visual stats:
- Total words (big number)
- Current streak with flame icon
- Sessions this week (mini calendar)
- Favorite sensei (most sessions)
- Best session (most words)

**Acceptance**:
- [ ] Key stats visible at glance
- [ ] Responsive layout
- [ ] Matches app aesthetic

---

### Task 4.2: Writing Calendar Heatmap
**File**: `src/lib/components/CalendarHeatmap.svelte`

GitHub-style contribution graph:
- Last 12 weeks
- Color intensity = word count
- Hover shows date + words
- Subtle, zen aesthetic

**Acceptance**:
- [ ] Shows 12 weeks of history
- [ ] Color reflects activity level
- [ ] Hover/tap shows details

---

### Task 4.3: Session History Improvements
**File**: `src/routes/history/+page.svelte` (modify)

Improve history page:
- Group by date
- Show sensei kanji, word count, duration
- Expandable to see full content
- Delete option (with confirm)

**Acceptance**:
- [ ] Sessions grouped by date
- [ ] Can expand to read content
- [ ] Can delete sessions

---

## Execution Notes

- Complete tasks in order (dependencies exist)
- Run `npm run dev` after each task to verify
- Commit after each completed phase
- Match existing code patterns exactly
- Test on mobile viewport (375px)
