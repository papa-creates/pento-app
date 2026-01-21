#!/bin/bash

# Ralph Loop for Pento
# Runs Claude Code in a loop to implement PRD tasks

set -e

PROJECT_DIR="/Users/papacreates/Projects/01_PRODUCTION/Company_Products/pento-app"
LOG_DIR="$PROJECT_DIR/.ralph-logs"
MAX_ITERATIONS=20
ITERATION=0

# Create log directory
mkdir -p "$LOG_DIR"

# Timestamp for this run
RUN_ID=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/ralph_$RUN_ID.log"

echo "=== Ralph Loop Started ===" | tee -a "$LOG_FILE"
echo "Run ID: $RUN_ID" | tee -a "$LOG_FILE"
echo "Max iterations: $MAX_ITERATIONS" | tee -a "$LOG_FILE"
echo "Log: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

cd "$PROJECT_DIR"

# The prompt that drives each iteration
PROMPT="You are implementing features for Pento.

Read PRD.md and find the NEXT uncompleted task (tasks are marked with [ ] checkboxes).

For the task you pick:
1. Implement it completely
2. Test it works (npm run dev if needed)
3. Mark the checkbox as [x] in PRD.md
4. Commit with message: 'feat(pento): [task name]'

If ALL tasks are complete, respond with exactly: RALPH_COMPLETE

Important:
- One task per iteration
- Follow CLAUDE.md patterns exactly
- Test before marking complete
- Keep commits atomic"

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    echo "--- Iteration $ITERATION / $MAX_ITERATIONS ---" | tee -a "$LOG_FILE"
    echo "Started: $(date)" | tee -a "$LOG_FILE"

    # Run Claude Code
    OUTPUT=$(claude --dangerously-skip-permissions -p "$PROMPT" 2>&1) || true

    echo "$OUTPUT" >> "$LOG_FILE"

    # Check for completion signal
    if echo "$OUTPUT" | grep -q "RALPH_COMPLETE"; then
        echo "" | tee -a "$LOG_FILE"
        echo "=== ALL TASKS COMPLETE ===" | tee -a "$LOG_FILE"
        echo "Finished at iteration $ITERATION" | tee -a "$LOG_FILE"
        break
    fi

    # Check for errors that should stop the loop
    if echo "$OUTPUT" | grep -qi "fatal error\|npm ERR!\|ENOENT"; then
        echo "" | tee -a "$LOG_FILE"
        echo "=== ERROR DETECTED - STOPPING ===" | tee -a "$LOG_FILE"
        echo "Review log for details" | tee -a "$LOG_FILE"
        break
    fi

    echo "Completed: $(date)" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Small delay between iterations
    sleep 5
done

echo "" | tee -a "$LOG_FILE"
echo "=== Ralph Loop Finished ===" | tee -a "$LOG_FILE"
echo "Total iterations: $ITERATION" | tee -a "$LOG_FILE"
echo "Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"

# Show summary of commits made
echo "" | tee -a "$LOG_FILE"
echo "Commits this session:" | tee -a "$LOG_FILE"
git log --oneline -n $ITERATION 2>/dev/null | tee -a "$LOG_FILE" || echo "No commits found"
