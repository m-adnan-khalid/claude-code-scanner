#!/usr/bin/env node

process.on('unhandledRejection', (err) => {
  console.error(`\x1b[31m✗\x1b[0m Unhandled error: ${err.message || err}`);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');

// Check prerequisites
function checkPrerequisites() {
  const { execSync } = require('child_process');

  try {
    // Check Node.js version
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
    const nodeMajor = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    if (nodeMajor < 18) {
      error(`Node.js ${nodeVersion} detected. This tool requires Node.js >= 18.`);
      error('Please upgrade Node.js: https://nodejs.org/');
      process.exit(1);
    }
  } catch (e) {
    error('Node.js not found. Please install Node.js >= 18: https://nodejs.org/');
    process.exit(1);
  }

  try {
    // Check npm version (which includes npx)
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    const npmMajor = parseInt(npmVersion.split('.')[0]);
    if (npmMajor < 8) {
      error(`npm ${npmVersion} detected. This tool requires npm >= 8.`);
      error('Please upgrade npm: npm install -g npm');
      process.exit(1);
    }
  } catch (e) {
    error('npm not found. Please install npm (comes with Node.js): https://nodejs.org/');
    process.exit(1);
  }
}

// Run prerequisite check
checkPrerequisites();

const COMMANDS = {
  setup: 'Interactive setup wizard — configure agents, skills, branching, rules',
  init: 'Initialize Claude Code environment (use --interactive for wizard)',
  new: 'Create a new project from idea to launch',
  status: 'Check if Claude Code environment is set up',
  verify: 'Run verification checks on existing setup',
  update: 'Smart update — add new files, preserve customizations (use --force to overwrite all)',
  help: 'Show this help message',
};

const args = process.argv.slice(2);
const command = args[0] || 'help';
const flags = args.slice(1);

const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function log(msg) { console.log(msg); }
function success(msg) { log(`${GREEN}✓${RESET} ${msg}`); }
function warn(msg) { log(`${YELLOW}!${RESET} ${msg}`); }
function error(msg) { log(`${RED}✗${RESET} ${msg}`); }
function header(msg) { log(`\n${BOLD}${CYAN}${msg}${RESET}`); }

function copyDir(src, dest, overwrite = false, _depth = 0) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  let copied = 0;
  let skipped = 0;

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      const result = copyDir(srcPath, destPath, overwrite, _depth + 1);
      copied += result.copied;
      skipped += result.skipped;
    } else {
      if (fs.existsSync(destPath) && !overwrite) {
        skipped++;
      } else {
        fs.copyFileSync(srcPath, destPath);
        copied++;
      }
    }
    // Show progress for large copies at top level
    if (_depth === 0 && copied > 0 && copied % 50 === 0) {
      process.stdout.write(`\r  ${copied} files copied...`);
    }
  }
  if (_depth === 0 && copied >= 50) process.stdout.write('\r' + ' '.repeat(30) + '\r');
  return { copied, skipped };
}

function init() {
  const cwd = process.cwd();
  const templateDir = path.join(__dirname, '..', 'template');
  const force = flags.includes('--force') || flags.includes('-f');
  const skipSmithery = flags.includes('--no-smithery');

  // Validate template directory exists
  if (!fs.existsSync(templateDir)) {
    error('Template directory not found. Package may be corrupted — reinstall with: npm install -g claude-code-scanner');
    process.exit(1);
  }

  // Check directory is writable
  try {
    fs.accessSync(cwd, fs.constants.W_OK);
  } catch (e) {
    error(`Directory is not writable: ${cwd}`);
    process.exit(1);
  }

  header('Claude Code Scanner — Environment Setup');
  log(`Target: ${cwd}\n`);

  // Check if already initialized (check both CLAUDE.md and .claude/ directory)
  const hasClaudeMd = fs.existsSync(path.join(cwd, 'CLAUDE.md'));
  const hasClaudeDir = fs.existsSync(path.join(cwd, '.claude'));
  if ((hasClaudeMd || hasClaudeDir) && !force) {
    if (hasClaudeDir && !hasClaudeMd) {
      warn('Partial .claude/ directory found (missing CLAUDE.md).');
      warn('Use --force to overwrite, or delete .claude/ first.');
    } else {
      warn('CLAUDE.md already exists. Use --force to overwrite.');
      log('  Or run: npx claude-code-scanner update');
    }
    process.exit(1);
  }

  // Copy CLAUDE.md to root
  log('Installing files...\n');

  // Track created paths for rollback on failure
  const created = [];
  function rollback() {
    for (const p of created.reverse()) {
      try {
        if (fs.statSync(p).isDirectory()) fs.rmSync(p, { recursive: true });
        else fs.unlinkSync(p);
      } catch (_) {}
    }
  }

  const claudeMdSrc = path.join(templateDir, 'CLAUDE.md');
  const claudeMdDest = path.join(cwd, 'CLAUDE.md');
  try {
    const existed = fs.existsSync(claudeMdDest);
    fs.copyFileSync(claudeMdSrc, claudeMdDest);
    if (!existed) created.push(claudeMdDest);
    success('CLAUDE.md');
  } catch (err) {
    error(`Failed to copy CLAUDE.md: ${err.message}`);
    error('Check directory permissions and try again.');
    rollback();
    process.exit(1);
  }

  // Copy .claude/ directory structure
  const claudeDirExisted = fs.existsSync(path.join(cwd, '.claude'));
  const dirs = ['rules', 'agents', 'skills', 'hooks', 'scripts', 'docs', 'templates', 'profiles', 'project'];
  for (const dir of dirs) {
    const src = path.join(templateDir, '.claude', dir);
    const dest = path.join(cwd, '.claude', dir);
    if (fs.existsSync(src)) {
      try {
        const result = copyDir(src, dest, force);
        success(`.claude/${dir}/ (${result.copied} files${result.skipped ? `, ${result.skipped} skipped` : ''})`);
      } catch (err) {
        error(`Failed to copy .claude/${dir}/: ${err.message}`);
        if (!claudeDirExisted) { created.push(path.join(cwd, '.claude')); }
        rollback();
        process.exit(1);
      }
    }
  }

  // Copy settings files
  try {
    const settingsSrc = path.join(templateDir, '.claude', 'settings.json');
    const settingsDest = path.join(cwd, '.claude', 'settings.json');
    if (fs.existsSync(settingsSrc) && (!fs.existsSync(settingsDest) || force)) {
      fs.copyFileSync(settingsSrc, settingsDest);
      success('.claude/settings.json');
    }

    const localSettingsDest = path.join(cwd, '.claude', 'settings.local.json');
    if (!fs.existsSync(localSettingsDest)) {
      fs.writeFileSync(localSettingsDest, JSON.stringify({ env: {} }, null, 2));
      success('.claude/settings.local.json (template)');
    }

    // Copy manifest.json for drift detection
    const manifestSrc = path.join(templateDir, '.claude', 'manifest.json');
    const manifestDest = path.join(cwd, '.claude', 'manifest.json');
    if (fs.existsSync(manifestSrc) && (!fs.existsSync(manifestDest) || force)) {
      fs.copyFileSync(manifestSrc, manifestDest);
      success('.claude/manifest.json (drift tracking)');
    }
  } catch (err) {
    error(`Failed to write config files: ${err.message}`);
    error('Check directory permissions and try again.');
    process.exit(1);
  }

  // Create task/report/execution directories
  fs.mkdirSync(path.join(cwd, '.claude', 'tasks'), { recursive: true });
  fs.mkdirSync(path.join(cwd, '.claude', 'reports', 'daily'), { recursive: true });
  fs.mkdirSync(path.join(cwd, '.claude', 'reports', 'executions'), { recursive: true });
  // Ensure empty template dirs exist even if copyDir skips them
  fs.mkdirSync(path.join(cwd, '.claude', 'profiles'), { recursive: true });
  fs.mkdirSync(path.join(cwd, '.claude', 'templates'), { recursive: true });
  success('.claude/tasks/, .claude/reports/, .claude/profiles/, .claude/templates/');

  // Make hook scripts executable (handle both .js and legacy .sh)
  const hooksDir = path.join(cwd, '.claude', 'hooks');
  if (fs.existsSync(hooksDir)) {
    for (const file of fs.readdirSync(hooksDir)) {
      if (file.endsWith('.sh') || file.endsWith('.js')) {
        const hookPath = path.join(hooksDir, file);
        try { fs.chmodSync(hookPath, 0o755); } catch (e) { if (process.platform !== 'win32') warn(`Could not set executable permission on ${file}`); }
      }
    }
    success('Hook scripts ready');
  }

  // Update .gitignore with Claude Code entries
  const gitignorePath = path.join(cwd, '.gitignore');
  const gitignoreBlock = `
# ─── Claude Code: Session-specific (per developer) ───
.claude/session.env
.claude/settings.local.json
.claude/agent-memory-local/

# ─── Claude Code: Generated state (rebuild with /sync --fix) ───
.claude/reports/
.claude/project/tasks/
.claude/project/stories/
.claude/tasks/
logs/

# ─── Claude Code: Runtime state ───
MEMORY.md
AUDIT_LOG.md
RETRY_LOG.md
`;

  try {
    let gitignoreContent = fs.existsSync(gitignorePath)
      ? fs.readFileSync(gitignorePath, 'utf-8')
      : '';

    // Check if Claude Code block already exists
    if (!gitignoreContent.includes('Claude Code:')) {
      gitignoreContent += gitignoreBlock;
      fs.writeFileSync(gitignorePath, gitignoreContent);
      success('.gitignore updated (Claude Code entries added)');
    }
  } catch (err) {
    warn(`Could not update .gitignore: ${err.message}`);
  }

  // Copy VS Code settings for file hiding (if .vscode/ doesn't have custom settings)
  const vscodeSrc = path.join(templateDir, '.vscode', 'settings.json');
  const vscodeDir = path.join(cwd, '.vscode');
  const vscodeDest = path.join(vscodeDir, 'settings.json');
  if (fs.existsSync(vscodeSrc)) {
    if (!fs.existsSync(vscodeDest)) {
      // No existing VS Code settings — copy ours
      fs.mkdirSync(vscodeDir, { recursive: true });
      fs.copyFileSync(vscodeSrc, vscodeDest);
      success('.vscode/settings.json (hides Claude operational files from explorer)');
    } else {
      // Existing VS Code settings — try to merge files.exclude
      try {
        const existing = JSON.parse(fs.readFileSync(vscodeDest, 'utf-8'));
        const template = JSON.parse(fs.readFileSync(vscodeSrc, 'utf-8'));
        let merged = false;
        if (!existing['files.exclude']) existing['files.exclude'] = {};
        for (const [pattern, value] of Object.entries(template['files.exclude'] || {})) {
          if (!(pattern in existing['files.exclude'])) {
            existing['files.exclude'][pattern] = value;
            merged = true;
          }
        }
        if (!existing['search.exclude']) existing['search.exclude'] = {};
        for (const [pattern, value] of Object.entries(template['search.exclude'] || {})) {
          if (!(pattern in existing['search.exclude'])) {
            existing['search.exclude'][pattern] = value;
            merged = true;
          }
        }
        if (merged) {
          fs.writeFileSync(vscodeDest, JSON.stringify(existing, null, 2) + '\n');
          success('.vscode/settings.json merged (Claude file exclusions added)');
        }
      } catch (e) {
        // Can't merge — skip silently
      }
    }
  }

  // Summary
  header('Setup Complete!\n');
  log('Next steps:\n');
  log(`  ${BOLD}1.${RESET} cd ${cwd}`);
  log(`  ${BOLD}2.${RESET} claude`);
  log(`  ${BOLD}3.${RESET} /scan-codebase          ${CYAN}# Scan your tech stack${RESET}`);
  log(`  ${BOLD}4.${RESET} /generate-environment   ${CYAN}# Generate customized environment${RESET}`);
  log(`  ${BOLD}5.${RESET} /validate-setup          ${CYAN}# Verify everything works${RESET}`);
  if (!skipSmithery) {
    log(`  ${BOLD}6.${RESET} /setup-smithery          ${CYAN}# Install community skills (optional)${RESET}`);
  }
  log('');
  log(`Then start working:`);
  log(`  /workflow new "your first task"`);
  log('');
}

function newProject() {
  const { execSync } = require('child_process');
  const templateDir = path.join(__dirname, '..', 'template');
  const force = flags.includes('--force') || flags.includes('-f');
  const here = flags.includes('--here');

  // Get project name from flags (first non-flag argument)
  // Skip values that follow --from-docs or --template flags
  const skipNextValue = new Set();
  flags.forEach((f, i) => {
    if (f === '--from-docs' || f === '--template') skipNextValue.add(i + 1);
  });
  const projectName = flags.find((f, i) => !f.startsWith('-') && !skipNextValue.has(i));

  header('Claude Code Scanner — New Project Setup');

  // Validate project name
  if (projectName) {
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(projectName)) {
      error(`Invalid project name "${projectName}". Avoid special characters: < > : " / \\ | ? *`);
      process.exit(1);
    }
    if (projectName.includes('..')) {
      error(`Invalid project name "${projectName}". Path traversal ("..") is not allowed.`);
      process.exit(1);
    }
    // Validate resolved path stays under cwd
    const resolved = path.resolve(process.cwd(), projectName);
    if (!resolved.startsWith(process.cwd())) {
      error(`Invalid project name "${projectName}". Target must be inside the current directory.`);
      process.exit(1);
    }
    if (projectName.startsWith('.')) {
      error(`Invalid project name "${projectName}". Name cannot start with a dot.`);
      process.exit(1);
    }
    if (projectName.length > 100) {
      error('Project name too long (max 100 characters).');
      process.exit(1);
    }
  }

  let targetDir;
  if (here) {
    targetDir = process.cwd();
    log(`Creating new project in current directory: ${targetDir}\n`);
  } else if (projectName) {
    targetDir = path.join(process.cwd(), projectName);
    log(`Creating new project: ${projectName}\n`);
  } else {
    error('Please provide a project name: npx claude-code-scanner new <project-name>');
    log('  Or use --here to initialize in the current directory');
    process.exit(1);
  }

  // Check for existing pre-dev progress before --force overwrite
  if (!here) {
    if (fs.existsSync(targetDir)) {
      const existingProject = path.join(targetDir, '.claude', 'project', 'PROJECT.md');
      if (fs.existsSync(existingProject) && !force) {
        const content = fs.readFileSync(existingProject, 'utf-8');
        const statusMatch = content.match(/^## Status:\s*(.+)$/m);
        if (statusMatch && statusMatch[1].trim() !== 'IDEATING') {
          warn(`Project "${projectName}" has pre-dev progress (status: ${statusMatch[1].trim()}).`);
          log('  Use --force to overwrite, or cd into it and run: claude → /new-project --resume');
          process.exit(1);
        }
      }
      if (!force) {
        error(`Directory "${projectName}" already exists. Use --force to overwrite.`);
        process.exit(1);
      }
    }
    fs.mkdirSync(targetDir, { recursive: true });
    success(`Created directory: ${projectName}/`);
  }

  // Initialize git
  try {
    if (!fs.existsSync(path.join(targetDir, '.git'))) {
      execSync('git init', { cwd: targetDir, stdio: 'pipe' });
      success('Initialized git repository');
    } else {
      warn('Git repository already exists');
    }
  } catch (e) {
    warn('Could not initialize git (git not found or error)');
  }

  // Validate template directory exists
  if (!fs.existsSync(templateDir)) {
    error('Template directory not found. Package may be corrupted — reinstall with: npm install -g claude-code-scanner');
    process.exit(1);
  }

  // Copy CLAUDE.md
  try {
    fs.copyFileSync(path.join(templateDir, 'CLAUDE.md'), path.join(targetDir, 'CLAUDE.md'));
    success('CLAUDE.md');
  } catch (err) {
    error(`Failed to copy CLAUDE.md: ${err.message}`);
    process.exit(1);
  }

  // Copy .claude/ directory structure (same as init)
  const dirs = ['rules', 'agents', 'skills', 'hooks', 'scripts', 'docs', 'templates', 'profiles', 'project'];
  for (const dir of dirs) {
    const src = path.join(templateDir, '.claude', dir);
    const dest = path.join(targetDir, '.claude', dir);
    if (fs.existsSync(src)) {
      try {
        const result = copyDir(src, dest, force);
        success(`.claude/${dir}/ (${result.copied} files${result.skipped ? `, ${result.skipped} skipped` : ''})`);
      } catch (err) {
        error(`Failed to copy .claude/${dir}/: ${err.message}`);
        process.exit(1);
      }
    }
  }

  // Copy settings + manifest
  try {
    const settingsSrc = path.join(templateDir, '.claude', 'settings.json');
    const settingsDest = path.join(targetDir, '.claude', 'settings.json');
    if (fs.existsSync(settingsSrc)) {
      fs.copyFileSync(settingsSrc, settingsDest);
      success('.claude/settings.json');
    }

    const localSettingsDest = path.join(targetDir, '.claude', 'settings.local.json');
    if (!fs.existsSync(localSettingsDest)) {
      fs.writeFileSync(localSettingsDest, JSON.stringify({ env: {} }, null, 2));
      success('.claude/settings.local.json (template)');
    }

    const manifestSrc = path.join(templateDir, '.claude', 'manifest.json');
    const manifestDest = path.join(targetDir, '.claude', 'manifest.json');
    if (fs.existsSync(manifestSrc)) {
      fs.copyFileSync(manifestSrc, manifestDest);
      success('.claude/manifest.json');
    }
  } catch (err) {
    error(`Failed to write config files: ${err.message}`);
    process.exit(1);
  }

  // Create runtime directories
  fs.mkdirSync(path.join(targetDir, '.claude', 'tasks'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, '.claude', 'reports', 'daily'), { recursive: true });
  fs.mkdirSync(path.join(targetDir, '.claude', 'reports', 'executions'), { recursive: true });
  success('.claude/tasks/, .claude/reports/');

  // Make hooks executable
  const hooksDir = path.join(targetDir, '.claude', 'hooks');
  if (fs.existsSync(hooksDir)) {
    for (const file of fs.readdirSync(hooksDir)) {
      if (file.endsWith('.sh') || file.endsWith('.js')) {
        try { fs.chmodSync(path.join(hooksDir, file), 0o755); } catch (e) { if (process.platform !== 'win32') warn(`Could not set executable permission on ${file}`); }
      }
    }
    success('Hook scripts ready');
  }

  // Create .gitignore
  const gitignorePath = path.join(targetDir, '.gitignore');
  const gitignoreContent = [
    '# Dependencies',
    'node_modules/',
    '',
    '# Environment',
    '.env',
    '.env.local',
    '',
    '# Claude Code local files',
    '.claude/settings.local.json',
    '.claude/agent-memory-local/',
    '.claude/tasks/',
    '.claude/reports/',
    '',
  ].join('\n');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    success('.gitignore');
  }

  // Create placeholder README
  const readmePath = path.join(targetDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    const readmeContent = `# ${projectName || 'New Project'}\n\n> Created with [Claude Code Scanner](https://github.com/m-adnan-khalid/claude-code-scanner)\n\nThis project was set up using the idea-to-launch pipeline. Run \`claude\` and then \`/new-project "your idea"\` to begin.\n`;
    fs.writeFileSync(readmePath, readmeContent);
    success('README.md');
  }

  // Summary
  header('New Project Ready!\n');
  log('Next steps:\n');
  if (!here) {
    log(`  ${BOLD}1.${RESET} cd ${projectName}`);
  }
  log(`  ${BOLD}${here ? '1' : '2'}.${RESET} claude`);
  log(`  ${BOLD}${here ? '2' : '3'}.${RESET} /new-project "describe your idea"  ${CYAN}# Full pre-dev pipeline${RESET}`);
  log('');
  log(`${CYAN}Or run individual phases:${RESET}`);
  log(`  /brainstorm "idea"        ${CYAN}# Brainstorm the idea${RESET}`);
  log(`  /product-spec             ${CYAN}# Create product specification${RESET}`);
  log(`  /feature-map              ${CYAN}# Prioritize features (MoSCoW)${RESET}`);
  log(`  /tech-stack               ${CYAN}# Choose technology stack${RESET}`);
  log(`  /architecture             ${CYAN}# Design system architecture${RESET}`);
  log(`  /scaffold                 ${CYAN}# Generate project files${RESET}`);
  log(`  /deploy-strategy          ${CYAN}# Plan deployment & launch${RESET}`);
  log('');
  log(`${CYAN}Or go fully automated:${RESET}`);
  log(`  /idea-to-launch "idea"    ${CYAN}# Idea to deployed product${RESET}`);
  log('');
}

function status() {
  const cwd = process.cwd();
  header('Claude Code Environment Status\n');

  const checks = [
    ['CLAUDE.md', path.join(cwd, 'CLAUDE.md')],
    ['.claude/rules/', path.join(cwd, '.claude', 'rules')],
    ['.claude/agents/', path.join(cwd, '.claude', 'agents')],
    ['.claude/skills/', path.join(cwd, '.claude', 'skills')],
    ['.claude/settings.json', path.join(cwd, '.claude', 'settings.json')],
    ['.claude/hooks/', path.join(cwd, '.claude', 'hooks')],
    ['.claude/scripts/', path.join(cwd, '.claude', 'scripts')],
    ['.claude/docs/', path.join(cwd, '.claude', 'docs')],
  ];

  let found = 0;
  for (const [name, p] of checks) {
    if (fs.existsSync(p)) { success(name); found++; }
    else { error(`${name} — missing`); }
  }

  log('');
  if (found === checks.length) {
    log(`${GREEN}${BOLD}Environment is fully set up.${RESET}`);
    log('Run: claude → /scan-codebase → /generate-environment');
  } else if (found > 0) {
    log(`${YELLOW}${BOLD}Partially set up (${found}/${checks.length}).${RESET}`);
    log('Run: npx claude-code-scanner init --force');
  } else {
    log(`${RED}${BOLD}Not initialized.${RESET}`);
    log('Run: npx claude-code-scanner init');
  }
}

function verify() {
  const cwd = process.cwd();
  // Prefer cross-platform .js, fall back to legacy .sh
  const jsPath = path.join(cwd, '.claude', 'scripts', 'verify-setup.js');
  const shPath = path.join(cwd, '.claude', 'scripts', 'verify-setup.sh');
  const scriptPath = fs.existsSync(jsPath) ? jsPath : shPath;
  if (!fs.existsSync(scriptPath)) {
    error('Verification script not found. Run: npx claude-code-scanner init');
    process.exit(1);
  }
  const { execSync } = require('child_process');
  try {
    if (scriptPath.endsWith('.js')) {
      execSync(`node "${scriptPath}"`, { stdio: 'inherit', cwd });
    } else {
      execSync(`bash "${scriptPath}"`, { stdio: 'inherit', cwd });
    }
  } catch (e) {
    process.exit(1);
  }
}

function update() {
  const cwd = process.cwd();
  const templateDir = path.join(__dirname, '..', 'template');
  const force = flags.includes('--force') || flags.includes('-f');

  // Check if workspace exists
  if (!fs.existsSync(path.join(cwd, '.claude'))) {
    error('No .claude/ directory found. Run init first: npx claude-code-scanner init');
    process.exit(1);
  }

  if (force) {
    // Force mode = destructive overwrite (old behavior)
    warn('FORCE UPDATE — overwriting ALL template files.');
    warn('Custom modifications to agents/skills/hooks/rules will be lost.');
    log('  Preserved: .claude/tasks/, .claude/project/, settings.local.json');
    log('');
    init();
    return;
  }

  // Smart update mode — add new files, skip existing (preserve customizations)
  header('Claude Code Scanner — Smart Update');
  log(`Target: ${cwd}\n`);

  const dirs = ['rules', 'agents', 'skills', 'hooks', 'scripts', 'docs', 'templates', 'profiles'];
  let totalAdded = 0;
  let totalSkipped = 0;
  let totalUpdated = 0;
  const report = { added: [], skipped: [], updated: [] };

  for (const dir of dirs) {
    const src = path.join(templateDir, '.claude', dir);
    const dest = path.join(cwd, '.claude', dir);
    if (!fs.existsSync(src)) continue;

    if (!fs.existsSync(dest)) {
      // New directory — copy entirely
      const result = copyDir(src, dest, false);
      totalAdded += result.copied;
      report.added.push(`.claude/${dir}/ (${result.copied} new files)`);
      success(`.claude/${dir}/ — ${result.copied} new files added`);
    } else {
      // Existing directory — smart merge
      const result = smartMergeDir(src, dest);
      totalAdded += result.added;
      totalSkipped += result.skipped;
      totalUpdated += result.updated;
      if (result.added > 0 || result.updated > 0) {
        success(`.claude/${dir}/ — ${result.added} added, ${result.updated} updated, ${result.skipped} preserved`);
        if (result.added > 0) report.added.push(`.claude/${dir}/ (${result.added} new)`);
      } else {
        log(`  .claude/${dir}/ — up to date (${result.skipped} files preserved)`);
      }
    }
  }

  // Update CLAUDE.md only if user hasn't modified it (compare first line for version)
  const claudeMdSrc = path.join(templateDir, 'CLAUDE.md');
  const claudeMdDest = path.join(cwd, 'CLAUDE.md');
  if (fs.existsSync(claudeMdDest)) {
    const srcContent = fs.readFileSync(claudeMdSrc, 'utf-8');
    const destContent = fs.readFileSync(claudeMdDest, 'utf-8');
    const srcVersion = srcContent.match(/FRAMEWORK VERSION:\s*([\d.]+)/);
    const destVersion = destContent.match(/FRAMEWORK VERSION:\s*([\d.]+)/);
    if (srcVersion && destVersion && srcVersion[1] !== destVersion[1]) {
      warn(`CLAUDE.md: template version ${srcVersion[1]} differs from installed ${destVersion[1]}`);
      warn('  Review manually or use --force to overwrite.');
      report.skipped.push('CLAUDE.md (version mismatch — manual review needed)');
    } else {
      log('  CLAUDE.md — up to date');
    }
  }

  // Update settings.json — merge new hooks, preserve existing
  const settingsSrc = path.join(templateDir, '.claude', 'settings.json');
  const settingsDest = path.join(cwd, '.claude', 'settings.json');
  if (fs.existsSync(settingsSrc) && fs.existsSync(settingsDest)) {
    try {
      const srcSettings = JSON.parse(fs.readFileSync(settingsSrc, 'utf-8'));
      const destSettings = JSON.parse(fs.readFileSync(settingsDest, 'utf-8'));
      let merged = false;

      // Add new hook events that don't exist in destination
      if (srcSettings.hooks && destSettings.hooks) {
        for (const [event, hooks] of Object.entries(srcSettings.hooks)) {
          if (!destSettings.hooks[event]) {
            destSettings.hooks[event] = hooks;
            merged = true;
            report.added.push(`settings.json: new hook event "${event}"`);
          }
        }
        if (merged) {
          fs.writeFileSync(settingsDest, JSON.stringify(destSettings, null, 2) + '\n');
          success('settings.json — merged new hook events');
        } else {
          log('  settings.json — up to date');
        }
      }
    } catch (e) {
      warn(`settings.json merge failed: ${e.message}`);
    }
  }

  // Update manifest.json
  const manifestSrc = path.join(templateDir, '.claude', 'manifest.json');
  const manifestDest = path.join(cwd, '.claude', 'manifest.json');
  if (fs.existsSync(manifestSrc)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(
        fs.existsSync(manifestDest) ? manifestDest : manifestSrc, 'utf-8'
      ));
      manifest.last_sync = new Date().toISOString();
      manifest.scanner_version = require(path.join(__dirname, '..', 'package.json')).version;
      fs.writeFileSync(manifestDest, JSON.stringify(manifest, null, 2) + '\n');
    } catch (e) { /* ok */ }
  }

  // Print report
  log('');
  header('Update Summary');
  log(`  Added:     ${totalAdded} new files`);
  log(`  Preserved: ${totalSkipped} existing files (your customizations are safe)`);
  if (totalUpdated > 0) log(`  Updated:   ${totalUpdated} files (empty → populated)`);
  log('');

  if (report.added.length > 0) {
    log(`${GREEN}New files:${RESET}`);
    for (const item of report.added) log(`  + ${item}`);
    log('');
  }

  if (totalAdded === 0 && totalUpdated === 0) {
    success('Workspace is already up to date!');
  } else {
    success(`Smart update complete. ${totalAdded} files added, ${totalSkipped} preserved.`);
  }

  log('');
  log('  Next steps:');
  log('  1. Run /sync --check inside Claude Code to verify');
  log('  2. Use --force to overwrite ALL files if needed');
  log('');
}

function smartMergeDir(src, dest, _depth = 0) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  let added = 0;
  let skipped = 0;
  let updated = 0;

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      const result = smartMergeDir(srcPath, destPath, _depth + 1);
      added += result.added;
      skipped += result.skipped;
      updated += result.updated;
    } else {
      if (!fs.existsSync(destPath)) {
        // New file — add it
        fs.copyFileSync(srcPath, destPath);
        added++;
      } else {
        // Existing file — preserve user's version
        const destContent = fs.readFileSync(destPath, 'utf-8');
        const destSize = destContent.trim().length;

        if (destSize === 0) {
          // Empty file — populate from template
          fs.copyFileSync(srcPath, destPath);
          updated++;
        } else {
          // Non-empty — preserve
          skipped++;
        }
      }
    }
  }
  return { added, skipped, updated };
}

async function setup() {
  const { runWizard } = require('./setup-wizard');
  const config = await runWizard();
  if (config) {
    log('\nApplying configuration...\n');
    // Apply the config by running init with the saved config
    init();
    // Post-init: apply config-specific customizations
    applyWizardConfig(config);
  }
}

function applyWizardConfig(config) {
  const cwd = process.cwd();

  // 1. Remove disabled agents
  const allAgents = fs.readdirSync(path.join(cwd, '.claude', 'agents')).filter(f => f.endsWith('.md'));
  for (const file of allAgents) {
    const agentName = file.replace('.md', '');
    if (!config.agents.includes(agentName)) {
      fs.unlinkSync(path.join(cwd, '.claude', 'agents', file));
    }
  }
  success(`Agents: ${config.agents.length} enabled, ${allAgents.length - config.agents.length} removed`);

  // 2. Remove disabled skill packs
  const skillPackMap = {
    core: ['workflow', 'task-tracker', 'execution-report', 'context-check', 'standup'],
    predev: ['brainstorm', 'product-spec', 'feature-map', 'domain-model', 'tech-stack', 'architecture'],
    mvp: ['new-project', 'idea-to-launch', 'mvp-kickoff', 'mvp-status', 'launch-mvp'],
    scaffold: ['scaffold', 'add-endpoint', 'add-component', 'add-page'],
    quality: ['review-pr', 'design-review', 'security-audit', 'qa-plan', 'impact-analysis'],
    deploy: ['deploy', 'signoff', 'rollback', 'deploy-strategy'],
    bugfix: ['fix-bug', 'hotfix', 'migrate'],
    reporting: ['progress-report', 'metrics', 'cost-estimate', 'changelog'],
    docs: ['api-docs', 'release-notes', 'onboard', 'mobile-audit'],
    maintenance: ['sync', 'dependency-check', 'refactor', 'parallel-dev'],
    config: ['methodology', 'clarify', 'import-docs', 'scan-codebase', 'validate-setup', 'setup-smithery'],
    mobile: ['mobile-audit'],
  };

  const enabledSkills = new Set();
  for (const pack of config.skillPacks) {
    if (skillPackMap[pack]) {
      skillPackMap[pack].forEach(s => enabledSkills.add(s));
    }
  }

  const skillsDir = path.join(cwd, '.claude', 'skills');
  if (fs.existsSync(skillsDir)) {
    let removed = 0;
    for (const dir of fs.readdirSync(skillsDir)) {
      if (!enabledSkills.has(dir)) {
        const skillPath = path.join(skillsDir, dir);
        if (fs.statSync(skillPath).isDirectory()) {
          fs.rmSync(skillPath, { recursive: true });
          removed++;
        }
      }
    }
    success(`Skills: ${enabledSkills.size} enabled, ${removed} removed`);
  }

  // 3. Remove disabled rules
  const ruleFiles = {
    'context-budget': 'context-budget.md',
    'request-validation': 'request-validation.md',
    'domain-terms': 'domain-terms.md',
    'task-lifecycle': 'task-lifecycle.md',
  };
  const rulesDir = path.join(cwd, '.claude', 'rules');
  if (fs.existsSync(rulesDir)) {
    for (const [ruleKey, fileName] of Object.entries(ruleFiles)) {
      if (!config.rules.includes(ruleKey)) {
        const fp = path.join(rulesDir, fileName);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      }
    }
    success(`Rules: ${config.rules.length} active`);
  }

  // 4. Remove disabled hooks from settings.json
  const settingsPath = path.join(cwd, '.claude', 'settings.json');
  if (fs.existsSync(settingsPath)) {
    try {
      const previewPath = path.join(cwd, '.claude', 'setup-settings-preview.json');
      if (fs.existsSync(previewPath)) {
        const preview = JSON.parse(fs.readFileSync(previewPath, 'utf-8'));
        const existing = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        existing.hooks = preview.hooks;
        fs.writeFileSync(settingsPath, JSON.stringify(existing, null, 2));
        fs.unlinkSync(previewPath); // Clean up preview
        success(`Hooks: ${config.hooks.length} active, settings.json updated`);
      }
    } catch (e) {
      warn(`Could not update settings.json hooks: ${e.message}`);
    }
  }

  // 5. Save git workflow config to manifest
  const manifestPath = path.join(cwd, '.claude', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      manifest.git = config.git;
      manifest.methodology = config.methodology;
      manifest.profile = config.profile;
      manifest.setup_config = { version: config.version, generated: config.generated };
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      success('Manifest updated with Git workflow + methodology config');
    } catch (e) {
      warn(`Could not update manifest: ${e.message}`);
    }
  }

  // 6. Copy selected profile
  const profileSrc = path.join(cwd, '.claude', 'profiles', `${config.profile}.md`);
  if (fs.existsSync(profileSrc)) {
    success(`Profile loaded: ${config.profile}`);
  }

  // Summary
  header('Setup Complete!\n');
  log('Your Claude Code environment is configured.\n');
  log(`  ${BOLD}1.${RESET} claude`);
  log(`  ${BOLD}2.${RESET} /scan-codebase          ${CYAN}# Scan your existing code${RESET}`);
  log(`  ${BOLD}3.${RESET} /generate-environment   ${CYAN}# Customize for your stack${RESET}`);
  log('');
  log(`${CYAN}Or start a new project:${RESET}`);
  log(`  /new-project "your idea"  ${CYAN}# Full pre-dev pipeline${RESET}`);
  log('');
  log(`${CYAN}Config saved to:${RESET} .claude/setup-config.json`);
  log(`${CYAN}Re-run anytime:${RESET} npx claude-code-scanner setup`);
  log('');
}

function help() {
  header('Claude Code Scanner\n');
  log('Scan any codebase and generate a complete Claude Code environment.\n');
  log(`${BOLD}Usage:${RESET}`);
  log('  npx claude-code-scanner <command> [options]\n');
  log(`${BOLD}Commands:${RESET}`);
  for (const [cmd, desc] of Object.entries(COMMANDS)) {
    log(`  ${CYAN}${cmd.padEnd(12)}${RESET} ${desc}`);
  }
  log(`\n${BOLD}Options:${RESET}`);
  log(`  ${CYAN}--force, -f${RESET}      Overwrite existing files`);
  log(`  ${CYAN}--interactive, -i${RESET} Run setup wizard (same as 'setup' command)`);
  log(`  ${CYAN}--here${RESET}           Initialize new project in current directory`);
  log(`  ${CYAN}--no-smithery${RESET}    Skip Smithery setup step in instructions`);
  log(`\n${BOLD}Quick Start (existing project):${RESET}`);
  log('  cd /path/to/your-project');
  log('  npx claude-code-scanner init');
  log('  claude');
  log('  /scan-codebase');
  log('  /generate-environment');
  log(`\n${BOLD}Quick Start (new project):${RESET}`);
  log('  npx claude-code-scanner new my-project');
  log('  cd my-project');
  log('  claude');
  log('  /new-project "your idea"');
  log('');
}

// Route command
switch (command) {
  case 'setup': setup().catch(e => { error(e.message); process.exit(1); }); break;
  case 'init':
    if (flags.includes('--interactive') || flags.includes('-i')) {
      setup().catch(e => { error(e.message); process.exit(1); });
    } else {
      init();
    }
    break;
  case 'new': newProject(); break;
  case 'status': status(); break;
  case 'verify': verify(); break;
  case 'update': update(); break;
  case 'help': case '--help': case '-h': help(); break;
  case '--version': case '-v': case '-V': case 'version':
    try { log(require('../package.json').version); }
    catch (e) { error('Could not read package.json version'); process.exit(1); }
    break;
  default:
    error(`Unknown command: ${command}`);
    help();
    process.exit(1);
}
