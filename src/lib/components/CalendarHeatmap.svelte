<script lang="ts">
  import type { WritingSession } from '$lib/stores/session';

  interface Props {
    sessions: WritingSession[];
  }

  let { sessions }: Props = $props();

  // Build 12-week calendar data
  type DayData = { date: string; words: number };

  function getCalendarData(): DayData[][] {
    const today = new Date();
    const weeks: DayData[][] = [];

    // Build map of date -> word count
    const wordsByDate: Record<string, number> = {};
    sessions.forEach(s => {
      const date = new Date(s.startedAt).toISOString().split('T')[0];
      wordsByDate[date] = (wordsByDate[date] || 0) + s.wordCount;
    });

    // Generate 12 weeks of data (84 days)
    for (let w = 11; w >= 0; w--) {
      const week: DayData[] = [];
      for (let d = 0; d < 7; d++) {
        const dayOffset = w * 7 + (6 - today.getDay()) + d - 6 * 7;
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset + d - 6);

        const dateStr = date.toISOString().split('T')[0];
        week.push({
          date: dateStr,
          words: wordsByDate[dateStr] || 0
        });
      }
      weeks.push(week);
    }

    return weeks;
  }

  let weeks = $derived(getCalendarData());

  // Get intensity level (0-4)
  function getLevel(words: number): number {
    if (words === 0) return 0;
    if (words < 200) return 1;
    if (words < 500) return 2;
    if (words < 1000) return 3;
    return 4;
  }

  // Format date for tooltip
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  let hoveredDay = $state<DayData | null>(null);
</script>

<div class="heatmap-container">
  <div class="heatmap">
    {#each weeks as week}
      <div class="week">
        {#each week as day}
          <div
            class="day level-{getLevel(day.words)}"
            onmouseenter={() => hoveredDay = day}
            onmouseleave={() => hoveredDay = null}
          ></div>
        {/each}
      </div>
    {/each}
  </div>

  {#if hoveredDay}
    <div class="tooltip">
      <span class="tooltip-date">{formatDate(hoveredDay.date)}</span>
      <span class="tooltip-words">{hoveredDay.words.toLocaleString()} words</span>
    </div>
  {/if}

  <div class="legend">
    <span class="legend-label">less</span>
    <div class="legend-scale">
      <div class="day level-0"></div>
      <div class="day level-1"></div>
      <div class="day level-2"></div>
      <div class="day level-3"></div>
      <div class="day level-4"></div>
    </div>
    <span class="legend-label">more</span>
  </div>
</div>

<style>
  .heatmap-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    position: relative;
  }

  .heatmap {
    display: flex;
    gap: 3px;
  }

  .week {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .day {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    transition: opacity 0.15s ease;
  }

  .day:hover {
    opacity: 0.8;
  }

  .day.level-0 { background: var(--border); }
  .day.level-1 { background: color-mix(in srgb, var(--accent) 25%, var(--border)); }
  .day.level-2 { background: color-mix(in srgb, var(--accent) 50%, var(--border)); }
  .day.level-3 { background: color-mix(in srgb, var(--accent) 75%, var(--border)); }
  .day.level-4 { background: var(--accent); }

  .tooltip {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--text);
    color: var(--bg);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    white-space: nowrap;
    z-index: 10;
  }

  .tooltip-date {
    font-weight: 500;
  }

  .tooltip-words {
    opacity: 0.8;
  }

  .legend {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .legend-label {
    font-size: 0.65rem;
    color: var(--text-muted);
  }

  .legend-scale {
    display: flex;
    gap: 2px;
  }

  .legend-scale .day {
    width: 10px;
    height: 10px;
  }

  @media (max-width: 400px) {
    .day {
      width: 10px;
      height: 10px;
    }

    .heatmap {
      gap: 2px;
    }

    .week {
      gap: 2px;
    }
  }
</style>
