#!/usr/bin/env node

/**
 * pre-tool-use.js — PreToolUse hook + Prompt Pipeline
 *
 * Automated layer of the prompt system.
 * Runs 5 checks on every mutating tool call:
 *   1. Quality scoring (specificity, completeness)
 *   2. Role alignment (scope check for Bash path refs)
 *   3. Domain/GLOSSARY verification
 *   4. Memory context awareness
 *   5. Risk assessment (destructive action detection)
 *
 * Strong tool calls pass through. Weak/risky ones are flagged or blocked.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Role-allowed path prefixes (mirrors scope-guard.js)
const ROLE_PATHS = {
  'CTO':          ['*'],
  'Architect':    ['docs/', '.claude/agents/', '.claude/rules/'],
  'TechLead':     ['.claude/agents/', '.claude/hooks/', '.claude/rules/', 'docs/adr/', 'docs/'],
  'BackendDev':   ['src/api/', 'src/services/', 'src/db/', 'src/models/', 'tests/api/', 'tests/services/', 'tests/db/', 'migrations/'],
  'FrontendDev':  ['src/ui/', 'src/components/', 'src/styles/', 'src/pages/'],
  'FullStackDev': ['src/', 'tests/', 'docs/adr/'],
  'QA':           ['tests/'],
  'DevOps':       ['infra/', '.github/', 'scripts/', 'Dockerfile', 'docker-compose.yml'],
  'PM':           ['docs/requirements/'],
  'Designer':     ['src/styles/', 'docs/design/']
};

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const { tool_name, tool_input } = data;

    if (!tool_name) process.exit(0);

    const root = findProjectRoot();
    const now = new Date().toISOString();
    const role = getRole(root);
    const branch = getBranch(root);
    const startTime = Date.now();

    // ── Read-only tools: minimal checks, pass through quickly ──
    if (['Read', 'Grep', 'Glob'].includes(tool_name)) {
      const detail = getDetail(tool_name, tool_input);
      const duration = Date.now() - startTime;
      logToAudit(root, `${now}|${role}|${branch}|VALIDATED|${tool_name}: ${detail}|ok|${duration}ms`);
      process.exit(0);
    }

    // ── PROMPT PIPELINE (mutating tools: Bash, Edit, Write) ──

    let score = 10;          // Start perfect, deduct for issues
    const flags = [];        // Collect all flags
    let isStrong = true;     // Assume strong until proven otherwise

    // ━━ Pass 1: Quality & Specificity ━━
    if (tool_name === 'Bash' && tool_input && tool_input.command) {
      const cmd = tool_input.command;
      // Very short commands are often vague
      if (cmd.trim().length < 10 && !/^(ls|pwd|git\s+(status|log|diff|branch))/.test(cmd.trim())) {
        score -= 2;
        flags.push('LOW_SPECIFICITY');
        isStrong = false;
      }
    }
    if (['Edit', 'Write'].includes(tool_name) && tool_input) {
      // Edit/Write with file_path is inherently specific
      if (!tool_input.file_path) {
        score -= 3;
        flags.push('MISSING_TARGET');
        isStrong = false;
      }
    }

    // ━━ Pass 2: Role Alignment ━━
    // Check if Bash commands reference paths outside role scope
    if (tool_name === 'Bash' && tool_input && tool_input.command) {
      const cmd = tool_input.command;
      const allowed = ROLE_PATHS[role];
      if (allowed && !allowed.includes('*')) {
        // Extract path-like references from command
        const pathRefs = cmd.match(/(?:src|tests|infra|docs|migrations)\/[^\s'";|&]*/g) || [];
        for (const ref of pathRefs) {
          const inScope = allowed.some(ap => ref.startsWith(ap) || ref.startsWith(ap.replace(/\/$/, '')));
          if (!inScope && /\b(edit|write|modify|create|delete|rm|mv|cp|touch|mkdir)\b/i.test(cmd)) {
            score -= 3;
            flags.push(`ROLE_VIOLATION: ${role} referencing ${ref}`);
            isStrong = false;
          }
        }
      }
    }

    // Block non-CTO direct writes on main/master branch to src/
    if (['Write', 'Edit'].includes(tool_name) && tool_input && tool_input.file_path) {
      const protectedBranches = ['main', 'master'];
      if (protectedBranches.includes(branch) && role !== 'CTO') {
        const relPath = path.relative(root, tool_input.file_path);
        if (relPath.startsWith('src/')) {
          const duration = Date.now() - startTime;
          logToAudit(root, `${now}|${role}|${branch}|BLOCKED|Direct write to ${relPath} on ${branch} branch|blocked|${duration}ms`);
          console.error(`BLOCKED: Role "${role}" cannot write to src/ directly on ${branch}. Use a feature branch.`);
          process.exit(1);
        }
      }
    }

    // ━━ Protected files — block direct writes ━━
    const protectedFiles = ['CLAUDE.md', '.claude/settings.json', '.claude/settings.local.json'];
    if (['Write', 'Edit'].includes(tool_name) && tool_input && tool_input.file_path) {
      const relPath = path.relative(root, tool_input.file_path);
      if (protectedFiles.includes(relPath)) {
        const duration = Date.now() - startTime;
        logToAudit(root, `${now}|${role}|${branch}|BLOCKED|Attempted write to protected file: ${relPath}|blocked|${duration}ms`);
        console.error(`BLOCKED: Cannot directly overwrite protected file: ${relPath}`);
        process.exit(1);
      }
    }

    // ━━ Pass 3: Domain / GLOSSARY Check ━━
    const glossaryTerms = loadGlossaryTerms(root);
    if (glossaryTerms.length > 0) {
      const textToCheck = getTextForDomainCheck(tool_name, tool_input);
      for (const term of glossaryTerms) {
        // Check for common informal variants of glossary terms
        if (term.informal && textToCheck.toLowerCase().includes(term.informal)) {
          flags.push(`DOMAIN_FIX: "${term.informal}" → use "${term.canonical}" (GLOSSARY)`);
          score -= 1;
          isStrong = false;
        }
      }
    }

    // ━━ Pass 4: Memory Context ━━
    if (tool_name === 'Bash' && tool_input && tool_input.command) {
      const cmd = tool_input.command.toLowerCase();
      const vaguePatterns = ['fix it', 'fix the thing', 'continue', 'pick up', 'keep going', 'do it'];
      for (const vp of vaguePatterns) {
        if (cmd.includes(vp)) {
          const memoryContext = loadMemoryContext(root);
          if (memoryContext) {
            flags.push(`MEMORY_CONTEXT: Current work → ${memoryContext}`);
          }
          score -= 2;
          flags.push('VAGUE_REFERENCE');
          isStrong = false;
        }
      }
    }

    // ━━ Pass 5: Risk Assessment ━━
    // Bash safety — block dangerous commands
    if (tool_name === 'Bash' && tool_input && tool_input.command) {
      const cmd = tool_input.command;
      const dangerous = [
        /rm\s+-rf\b/,
        /:\s*\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}/,
        /curl\s+.*\|\s*(?:ba)?sh/,
        /wget\s+.*\|\s*(?:ba)?sh/,
        /\bmkfs\b/,
      ];
      for (const pattern of dangerous) {
        if (pattern.test(cmd)) {
          const duration = Date.now() - startTime;
          logToAudit(root, `${now}|${role}|${branch}|BLOCKED|Dangerous command: ${cmd.substring(0, 60)}|blocked|${duration}ms`);
          console.error(`BLOCKED: Dangerous command detected`);
          process.exit(1);
        }
      }

      // Destructive actions — flag but allow with warning
      const destructivePatterns = [
        /\bgit\s+reset\s+--hard\b/,
        /\bgit\s+push\s+--force\b/,
        /\bdrop\s+table\b/i,
        /\bDELETE\s+FROM\b/i,
        /\balter\s+table\b/i,
        /\bgit\s+branch\s+-[dD]\b/,
      ];
      for (const dp of destructivePatterns) {
        if (dp.test(cmd)) {
          score -= 3;
          flags.push('DESTRUCTIVE_ACTION');
          isStrong = false;
          const duration = Date.now() - startTime;
          logToAudit(root, `${now}|${role}|${branch}|DESTRUCTIVE_FLAG|${cmd.substring(0, 60)}|warn|${duration}ms`);
          process.stderr.write(`\n⚡ DESTRUCTIVE ACTION DETECTED: ${cmd.substring(0, 80)}\n`);
          process.stderr.write(`   Consider creating a git checkpoint first.\n\n`);

          // Auto-create git checkpoint for schema/destructive changes
          try {
            const status = execSync('git status --porcelain', { cwd: root, encoding: 'utf8' }).trim();
            if (status) {
              execSync('git stash push -m "auto-checkpoint before destructive action"', { cwd: root, timeout: 5000 });
              execSync('git stash pop', { cwd: root, timeout: 5000 });
            }
          } catch (_) {}
          break;
        }
      }

      // Schema change detection — flag for checkpoint
      const schemaPatterns = [/\bmigrat/i, /\bschema\b/i, /\badd.*(field|column)/i];
      for (const sp of schemaPatterns) {
        if (sp.test(cmd)) {
          flags.push('SCHEMA_CHANGE: git checkpoint recommended');
          score -= 1;
          isStrong = false;
          break;
        }
      }
    }

    // ━━ Pipeline Output ━━
    const clampedScore = Math.max(1, Math.min(10, score));
    const detail = getDetail(tool_name, tool_input);
    const duration = Date.now() - startTime;

    if (isStrong && flags.length === 0) {
      // Strong prompt — pass through directly
      process.stderr.write(`Strong prompt — executing directly (score: ${clampedScore}/10)\n`);
      logToAudit(root, `${now}|${role}|${branch}|PROMPT_PASS|${tool_name}: ${detail} [score:${clampedScore}/10]|ok|${duration}ms`);
      process.exit(0);
    }

    // Weak prompt — log flags and warnings
    if (flags.length > 0) {
      process.stderr.write(`\n📋 PROMPT [score: ${clampedScore}/10]\n`);
      for (const f of flags) {
        process.stderr.write(`   ⚠ ${f}\n`);
      }
      if (clampedScore <= 4) {
        process.stderr.write(`   💡 Run /prompt for full 5-pass improvement pipeline\n`);
      }
      process.stderr.write(`\n`);
    }

    logToAudit(root, `${now}|${role}|${branch}|PROMPT_FLAGGED|${tool_name}: ${detail} [score:${clampedScore}/10 flags:${flags.join(',')}]|warn|${duration}ms`);

    // Allow execution but with warnings logged — user sees the flags
    process.exit(0);
  } catch (e) {
    try {
      const root = findProjectRoot();
      const now = new Date().toISOString();
      const role = getRole(root);
      const branch = getBranch(root);
      logToAudit(root, `${now}|${role}|${branch}|HOOK_ERROR|pre-tool-use: ${e.message}|error|0ms`);
    } catch (_) {}
    process.exit(0);
  }
});

// ── Helper functions ──

function findProjectRoot() {
  let root = process.cwd();
  while (!fs.existsSync(path.join(root, 'CLAUDE.md')) && root !== path.dirname(root)) {
    root = path.dirname(root);
  }
  return root;
}

function getRole(root) {
  try {
    const envPath = path.join(root, '.claude', 'session.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^CURRENT_ROLE=(.+)$/m);
      if (match) return match[1].trim();
    }
  } catch (_) {}
  return 'Unknown';
}

function getBranch(root) {
  try {
    return execSync('git branch --show-current', { cwd: root, timeout: 3000 })
      .toString().trim() || 'detached';
  } catch (_) { return 'detached'; }
}

function logToAudit(root, line) {
  try {
    let branch = 'detached';
    try {
      branch = execSync('git branch --show-current', { cwd: root, timeout: 3000 })
        .toString().trim() || 'detached';
    } catch (_) {}
    const auditDir = path.join(root, '.claude', 'reports', 'audit');
    fs.mkdirSync(auditDir, { recursive: true });
    const safeBranch = branch.replace(/[/\\:*?"<>|]/g, '-');
    fs.appendFileSync(path.join(auditDir, `audit-${safeBranch}.log`), line + '\n');
  } catch (_) {}
}

function loadGlossaryTerms(root) {
  try {
    const glossaryPath = path.join(root, 'docs', 'GLOSSARY.md');
    if (!fs.existsSync(glossaryPath)) return [];
    const content = fs.readFileSync(glossaryPath, 'utf8');
    const terms = [];
    // Parse table rows for canonical terms
    const rows = content.split('\n').filter(l => l.startsWith('|') && !l.includes('---'));
    for (const row of rows) {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 2 && cols[0] !== 'Term') {
        terms.push({
          canonical: cols[0],
          informal: cols[0].toLowerCase() === 'adr' ? 'architecture decision' : null
        });
      }
    }
    return terms;
  } catch (_) { return []; }
}

function loadMemoryContext(root) {
  try {
    const memPath = path.join(root, 'MEMORY.md');
    if (!fs.existsSync(memPath)) return null;
    const content = fs.readFileSync(memPath, 'utf8');
    const nextMatch = content.match(/## Next Step\n(.+)/);
    const lastMatch = content.match(/## Last Completed\n(.+)/);
    if (nextMatch) return `Next: ${nextMatch[1].trim()}`;
    if (lastMatch) return `Last: ${lastMatch[1].trim()}`;
    return null;
  } catch (_) { return null; }
}

function getTextForDomainCheck(toolName, input) {
  if (!input) return '';
  if (toolName === 'Bash') return input.command || '';
  if (toolName === 'Edit' || toolName === 'Write') {
    return (input.file_path || '') + ' ' + (input.new_string || input.content || '').substring(0, 200);
  }
  return '';
}

function getDetail(toolName, input) {
  if (!input) return '—';
  if (toolName === 'Read') return truncate(input.file_path || '', 60);
  if (toolName === 'Edit') return truncate(input.file_path || '', 60);
  if (toolName === 'Write') return truncate(input.file_path || '', 60);
  if (toolName === 'Bash') return truncate(input.command || '', 60);
  if (toolName === 'Grep') return truncate(input.pattern || '', 40);
  if (toolName === 'Glob') return truncate(input.pattern || '', 40);
  return '—';
}

function truncate(str, max) {
  str = str.replace(/\n/g, ' ').trim();
  return str.length > max ? str.substring(0, max - 3) + '...' : str;
}
