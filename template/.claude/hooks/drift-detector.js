#!/usr/bin/env node
// SessionStart hook: lightweight drift detection on startup
// Checks for obvious staleness — full sync requires /sync skill

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const claudeDir = path.join(process.cwd(), '.claude');
const manifestPath = path.join(claudeDir, 'manifest.json');

// Only run if .claude/ exists (environment is set up)
if (!fs.existsSync(claudeDir)) process.exit(0);

const warnings = [];

// --- 1. Check manifest freshness ---
let manifest = null;
let daysSinceSync = Infinity;

if (fs.existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const lastSync = new Date(manifest.last_sync);
    daysSinceSync = Math.floor((Date.now() - lastSync.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceSync > 14) {
      warnings.push(`DRIFT: Last sync was ${daysSinceSync} days ago. Run /sync --check`);
    }
  } catch (e) {
    warnings.push('DRIFT: manifest.json is corrupted. Run /sync --fix');
  }
} else {
  // No manifest = never synced — only warn if environment looks established
  const agentsDir = path.join(claudeDir, 'agents');
  if (fs.existsSync(agentsDir) && fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).length > 0) {
    warnings.push('DRIFT: No manifest.json found. Run /sync --check to create baseline');
  }
}

// --- 2. Quick agent count check ---
const agentsDir = path.join(claudeDir, 'agents');
const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md');

if (fs.existsSync(agentsDir) && fs.existsSync(claudeMdPath)) {
  const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
  const claudeMd = fs.readFileSync(claudeMdPath, 'utf-8');

  // Count @agent mentions in CLAUDE.md (only from the Agent Team table)
  const agentTableMatch = claudeMd.match(/## Agent Team[\s\S]*?(?=\n## |$)/);
  const agentSection = agentTableMatch ? agentTableMatch[0] : '';
  const agentMentions = (agentSection.match(/@[\w-]+/g) || [])
    .filter(a => a !== '@imports' && a !== '@path');
  const uniqueMentions = [...new Set(agentMentions)];

  if (agentFiles.length !== uniqueMentions.length) {
    warnings.push(`DRIFT: ${agentFiles.length} agent files but ${uniqueMentions.length} agents in CLAUDE.md. Run /sync --fix`);
  }
}

// --- 3. Quick dependency file change check ---
const depFiles = ['package.json', 'go.mod', 'Cargo.toml', 'requirements.txt', 'pyproject.toml', 'Gemfile', 'pom.xml'];
if (manifest && manifest.tech_stack) {
  for (const depFile of depFiles) {
    const depPath = path.join(process.cwd(), depFile);
    if (fs.existsSync(depPath)) {
      const currentHash = crypto.createHash('sha256')
        .update(fs.readFileSync(depPath))
        .digest('hex')
        .substring(0, 16);

      const manifestEntry = manifest.tech_stack[depFile];
      if (manifestEntry && manifestEntry.hash && manifestEntry.hash !== currentHash) {
        warnings.push(`DRIFT: ${depFile} changed since last sync. Run /sync --check`);
        break; // One dependency warning is enough
      }
    }
  }
}

// --- 4. Quick hook registration check ---
const hooksDir = path.join(claudeDir, 'hooks');
const settingsPath = path.join(claudeDir, 'settings.json');

if (fs.existsSync(hooksDir) && fs.existsSync(settingsPath)) {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    const hookFiles = fs.readdirSync(hooksDir).filter(f => f.endsWith('.js'));
    const registeredHooks = new Set();

    for (const [event, matchers] of Object.entries(settings.hooks || {})) {
      for (const matcher of matchers) {
        for (const hook of (matcher.hooks || [])) {
          if (hook.type === 'command' && hook.command) {
            const match = hook.command.match(/([\w-]+\.js)/);
            if (match) registeredHooks.add(match[1]);
          }
        }
      }
    }

    const orphanHooks = hookFiles.filter(f => !registeredHooks.has(f));
    if (orphanHooks.length > 0) {
      warnings.push(`DRIFT: ${orphanHooks.length} hook(s) not registered in settings.json: ${orphanHooks.join(', ')}`);
    }

    for (const registered of registeredHooks) {
      if (!hookFiles.includes(registered)) {
        warnings.push(`DRIFT: settings.json references ${registered} but file not found`);
      }
    }
  } catch (e) {
    // settings.json parse error — protect-files hook will catch this
  }
}

// --- 5. Quick skill directory check ---
const skillsDir = path.join(claudeDir, 'skills');
if (fs.existsSync(skillsDir)) {
  const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);

  for (const skill of skillDirs) {
    const skillMd = path.join(skillsDir, skill, 'SKILL.md');
    if (!fs.existsSync(skillMd)) {
      warnings.push(`DRIFT: Skill directory ${skill}/ exists but has no SKILL.md`);
    }
  }
}

// --- Output warnings ---
if (warnings.length > 0) {
  console.log('');
  for (const w of warnings) {
    console.log(w);
  }
  if (warnings.length >= 3) {
    console.log(`\n${warnings.length} drift issues detected. Run: /sync --check (for report) or /sync --fix (to auto-repair)`);
  }
}

process.exit(0);
