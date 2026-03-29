#!/usr/bin/env node
// SessionStart hook: lightweight drift detection on startup
// Checks for obvious staleness — full sync requires /sync skill

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Resolve project root (walk up to find .claude/hooks/)
let _projectRoot = process.cwd();
while (!fs.existsSync(path.join(_projectRoot, '.claude', 'hooks')) && _projectRoot !== path.dirname(_projectRoot)) {
  _projectRoot = path.dirname(_projectRoot);
}


const reportsDir = path.join(_projectRoot, '.claude', 'reports');
function logHookFailure(hookName, error) {
  try {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    fs.appendFileSync(path.join(reportsDir, 'hook-failures.log'),
      `| ${new Date().toISOString()} | ${hookName} | ${String(error).substring(0, 300)} |\n`);
  } catch (e) { logHookFailure("drift-detector", e.message); }
}

// Drain stdin so hook never hangs if data is piped
process.stdin.resume();
process.stdin.on('data', () => {});
process.stdin.on('error', () => {});
setTimeout(() => process.exit(0), 5000).unref();

const claudeDir = path.join(_projectRoot, '.claude');
const manifestPathLegacy = path.join(claudeDir, 'manifest.json');
const manifestPathNew = path.join(claudeDir, 'TECH_MANIFEST.json');
const manifestPath = fs.existsSync(manifestPathNew) ? manifestPathNew : manifestPathLegacy;

// Only run if .claude/ exists (environment is set up)
if (!fs.existsSync(claudeDir)) process.exit(0);

const warnings = [];

// --- 1. Check manifest freshness ---
let manifest = null;
let daysSinceSync = Infinity;

if (fs.existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    // Skip drift check if never synced (fresh install)
    if (manifest.last_sync) {
      const lastSync = new Date(manifest.last_sync);
      daysSinceSync = Math.floor((Date.now() - lastSync.getTime()) / (1000 * 60 * 60 * 24));

      // Recent sync — skip only the staleness warning, still run inventory checks below
      if (daysSinceSync > 14) {
        warnings.push(`DRIFT: Last sync was ${daysSinceSync} days ago. Run /sync --check`);
      }
    }
  } catch (e) {
    warnings.push('DRIFT: manifest/TECH_MANIFEST.json is corrupted. Run /sync --fix');
  }
} else {
  // No manifest = never synced — only warn if environment looks established
  const agentsDir = path.join(claudeDir, 'agents');
  if (fs.existsSync(agentsDir) && fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).length > 0) {
    warnings.push('DRIFT: No manifest.json/TECH_MANIFEST.json found. Run /sync --check to create baseline');
  }
}

// --- 2. Quick agent count check ---
const agentsDir = path.join(claudeDir, 'agents');
const claudeMdPath = path.join(_projectRoot, 'CLAUDE.md');

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
    const depPath = path.join(_projectRoot, depFile);
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

// --- 5. New project file integrity check ---
const projectDir = path.join(claudeDir, 'project');
const projectMdPath = path.join(projectDir, 'PROJECT.md');

if (fs.existsSync(projectDir) && fs.existsSync(projectMdPath)) {
  try {
    const projectContent = fs.readFileSync(projectMdPath, 'utf-8');
    const statusMatch = projectContent.match(/^## Status:\s*(.+)$/m);
    const status = statusMatch ? statusMatch[1].trim() : 'UNKNOWN';

    // Check that files matching completed phases exist
    const phaseFileMap = {
      'IDEA_CANVAS.md': ['SPECIFYING', 'MAPPING', 'MODELING', 'SELECTING', 'ARCHITECTING', 'SCAFFOLDING', 'SETTING_UP', 'PLANNING', 'READY_FOR_DEV'],
      'PRODUCT_SPEC.md': ['MAPPING', 'MODELING', 'SELECTING', 'ARCHITECTING', 'SCAFFOLDING', 'SETTING_UP', 'PLANNING', 'READY_FOR_DEV'],
      'BACKLOG.md': ['MODELING', 'SELECTING', 'ARCHITECTING', 'SCAFFOLDING', 'SETTING_UP', 'PLANNING', 'READY_FOR_DEV'],
      'TECH_STACK.md': ['ARCHITECTING', 'SCAFFOLDING', 'SETTING_UP', 'PLANNING', 'READY_FOR_DEV'],
      'ARCHITECTURE.md': ['SCAFFOLDING', 'SETTING_UP', 'PLANNING', 'READY_FOR_DEV'],
      'DEPLOY_STRATEGY.md': ['READY_FOR_DEV'],
    };

    for (const [file, requiredAfterStates] of Object.entries(phaseFileMap)) {
      if (requiredAfterStates.includes(status)) {
        const filePath = path.join(projectDir, file);
        if (!fs.existsSync(filePath)) {
          warnings.push(`DRIFT: ${file} missing but project is at ${status}. Run /new-project --resume`);
        } else {
          // Check if file still has only template placeholders (never populated)
          const content = fs.readFileSync(filePath, 'utf-8');
          if (content.includes('{project-name}') || content.includes('{ISO timestamp}')) {
            warnings.push(`DRIFT: ${file} still has placeholders. Phase may not have completed properly`);
          }
        }
      }
    }
  } catch (e) {
    warnings.push('DRIFT: PROJECT.md is unreadable. Check .claude/project/');
  }
}

// --- 6. Quick skill directory check ---
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

// --- 7. Numeric inventory count validation ---
try {
  if (fs.existsSync(claudeMdPath)) {
    const claudeMdContent = fs.readFileSync(claudeMdPath, 'utf-8');

    // Check agent count
    const agentCountMatch = claudeMdContent.match(/(\d+)\s*agents/i);
    if (agentCountMatch) {
      const statedAgents = parseInt(agentCountMatch[1]);
      const agentsDirPath = path.join(claudeDir, 'agents');
      if (fs.existsSync(agentsDirPath)) {
        const actualAgents = fs.readdirSync(agentsDirPath).filter(f => f.endsWith('.md')).length;
        if (statedAgents !== actualAgents) {
          warnings.push(`DRIFT: CLAUDE.md states ${statedAgents} agents but found ${actualAgents} agent files`);
        }
      }
    }

    // Check skill count
    const skillCountMatch = claudeMdContent.match(/(\d+)\s*skills/i);
    if (skillCountMatch) {
      const statedSkills = parseInt(skillCountMatch[1]);
      const skillsDirPath = path.join(claudeDir, 'skills');
      if (fs.existsSync(skillsDirPath)) {
        const actualSkills = fs.readdirSync(skillsDirPath, { withFileTypes: true })
          .filter(e => e.isDirectory()).length;
        if (statedSkills !== actualSkills) {
          warnings.push(`DRIFT: CLAUDE.md states ${statedSkills} skills but found ${actualSkills} skill directories`);
        }
      }
    }

    // Check hook count
    const hookCountMatch = claudeMdContent.match(/(\d+)\s*hooks/i);
    if (hookCountMatch) {
      const statedHooks = parseInt(hookCountMatch[1]);
      const hooksDirPath = path.join(claudeDir, 'hooks');
      if (fs.existsSync(hooksDirPath)) {
        const actualHooks = fs.readdirSync(hooksDirPath).filter(f => f.endsWith('.js')).length;
        if (statedHooks !== actualHooks) {
          warnings.push(`DRIFT: CLAUDE.md states ${statedHooks} hooks but found ${actualHooks} hook files`);
        }
      }
    }
  }
} catch (e) {
  // Non-fatal — skip inventory validation
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
