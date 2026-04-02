#!/usr/bin/env node

/**
 * context-monitor.js — PostToolUse hook
 * Tracks cumulative tool usage as a proxy for context consumption.
 * Warns when approaching the 60% budget based on tool call count,
 * file read sizes, and bash output lengths.
 *
 * Claude Code doesn't expose exact context % to hooks, so we estimate
 * using a token-counting heuristic based on tool activity.
 */

const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input)
    const sessionId = data.session_id || 'unknown';;
    const { tool_name, tool_input, tool_output } = data;

    // Resolve project root
    let root = process.cwd();
    while (!fs.existsSync(path.join(root, '.claude', 'hooks')) && root !== path.dirname(root)) {
      root = path.dirname(root);
    }

    const stateFile = path.join(root, '.claude', 'reports', 'context-state.json');

    // Load or initialize state
    let state = {
      session_start: new Date().toISOString(),
      tool_calls: 0,
      estimated_tokens: 0,
      file_reads: 0,
      file_read_bytes: 0,
      bash_calls: 0,
      bash_output_bytes: 0,
      agent_calls: 0,
      edits: 0,
      writes: 0,
      warnings_issued: 0,
      last_warning: null,
    };

    if (fs.existsSync(stateFile)) {
      try {
        state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
      } catch (e) { logHookFailure("context-monitor", e.message); }
    }

    // Update counters
    state.tool_calls++;

    // Batch optimization: only do full estimation every 5th call
    // Exception: always check Read and Agent (high-token operations)
    const isHighToken = tool_name === 'Read' || tool_name === 'Agent';
    if (!isHighToken && state.tool_calls % 5 !== 0) {
      // Lightweight update — just increment counter and save
      state.last_updated = new Date().toISOString();
      fs.mkdirSync(path.dirname(stateFile), { recursive: true });
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
      return;
    }

    // Estimate tokens based on tool type
    const outputStr = typeof tool_output === 'string' ? tool_output : JSON.stringify(tool_output || '');
    const outputBytes = Buffer.byteLength(outputStr, 'utf-8');
    const outputTokens = Math.ceil(outputBytes / 4); // ~4 bytes per token

    if (tool_name === 'Read') {
      state.file_reads++;
      state.file_read_bytes += outputBytes;
      state.estimated_tokens += outputTokens;
    } else if (tool_name === 'Bash') {
      state.bash_calls++;
      state.bash_output_bytes += outputBytes;
      state.estimated_tokens += outputTokens;
    } else if (tool_name === 'Agent') {
      state.agent_calls++;
      state.estimated_tokens += Math.min(outputTokens, 2000); // agent results capped
    } else if (tool_name === 'Edit') {
      state.edits++;
      state.estimated_tokens += 500; // edits are relatively small
    } else if (tool_name === 'Write') {
      state.writes++;
      state.estimated_tokens += 300;
    } else if (tool_name === 'Grep' || tool_name === 'Glob') {
      state.estimated_tokens += outputTokens;
    }

    // Add conversation overhead (each turn ~500 tokens of system + user + assistant)
    state.estimated_tokens += 200;

    // Estimate context % (200k token window = 100%)
    // Working budget = 60% = 120k tokens
    const CONTEXT_WINDOW = 200000;
    const BUDGET_TOKENS = CONTEXT_WINDOW * 0.6; // 120k
    const estimatedPct = Math.min(100, Math.round((state.estimated_tokens / CONTEXT_WINDOW) * 100));
    const budgetPct = Math.min(100, Math.round((state.estimated_tokens / BUDGET_TOKENS) * 100));

    // Save state
    state.estimated_pct = estimatedPct;
    state.budget_pct = budgetPct;
    state.last_updated = new Date().toISOString();

    fs.mkdirSync(path.dirname(stateFile), { recursive: true });
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

    // Issue warnings at thresholds
    const now = Date.now();
    const lastWarning = state.last_warning ? new Date(state.last_warning).getTime() : 0;
    const warningCooldown = 60000; // 1 minute between warnings

    if (estimatedPct >= 75 && (now - lastWarning) > warningCooldown) {
      process.stderr.write(
        `\n[context-monitor] RED: ~${estimatedPct}% context used (${budgetPct}% of 60% budget). ` +
        `Run /compact NOW or /context-check for details.\n`
      );
      state.warnings_issued++;
      state.last_warning = new Date().toISOString();
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    } else if (estimatedPct >= 60 && (now - lastWarning) > warningCooldown) {
      process.stderr.write(
        `\n[context-monitor] ORANGE: ~${estimatedPct}% context used. ` +
        `Budget exceeded — run /compact to reclaim space.\n`
      );
      state.warnings_issued++;
      state.last_warning = new Date().toISOString();
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    } else if (estimatedPct >= 45 && state.warnings_issued === 0) {
      process.stderr.write(
        `\n[context-monitor] YELLOW: ~${estimatedPct}% context used. ` +
        `Approaching 60% budget — consider compacting soon.\n`
      );
      state.warnings_issued++;
      state.last_warning = new Date().toISOString();
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    }

  } catch (e) {
    // Silent — never block the workflow
  }
});
