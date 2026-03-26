#!/usr/bin/env node

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
  init: 'Initialize Claude Code environment in current directory',
  status: 'Check if Claude Code environment is set up',
  verify: 'Run verification checks on existing setup',
  update: 'Update scanner skills/agents to latest version',
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

function copyDir(src, dest, overwrite = false) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  let copied = 0;
  let skipped = 0;

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      const result = copyDir(srcPath, destPath, overwrite);
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
  }
  return { copied, skipped };
}

function init() {
  const cwd = process.cwd();
  const templateDir = path.join(__dirname, '..', 'template');
  const force = flags.includes('--force') || flags.includes('-f');
  const skipSmithery = flags.includes('--no-smithery');

  header('Claude Code Scanner — Environment Setup');
  log(`Target: ${cwd}\n`);

  // Check if already initialized
  if (fs.existsSync(path.join(cwd, 'CLAUDE.md')) && !force) {
    warn('CLAUDE.md already exists. Use --force to overwrite.');
    log('  Or run: npx claude-code-scanner update');
    process.exit(1);
  }

  // Copy CLAUDE.md to root
  log('Installing files...\n');

  const claudeMdSrc = path.join(templateDir, 'CLAUDE.md');
  const claudeMdDest = path.join(cwd, 'CLAUDE.md');
  fs.copyFileSync(claudeMdSrc, claudeMdDest);
  success('CLAUDE.md');

  // Copy .claude/ directory structure
  const dirs = ['rules', 'agents', 'skills', 'hooks', 'scripts', 'docs', 'templates', 'profiles'];
  for (const dir of dirs) {
    const src = path.join(templateDir, '.claude', dir);
    const dest = path.join(cwd, '.claude', dir);
    if (fs.existsSync(src)) {
      const result = copyDir(src, dest, force);
      success(`.claude/${dir}/ (${result.copied} files${result.skipped ? `, ${result.skipped} skipped` : ''})`);
    }
  }

  // Copy settings files
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
        try { fs.chmodSync(hookPath, 0o755); } catch (e) { /* Windows — not needed for .js */ }
      }
    }
    success('Hook scripts ready');
  }

  // Update .gitignore
  const gitignorePath = path.join(cwd, '.gitignore');
  const gitignoreEntries = [
    '.claude/settings.local.json',
    '.claude/agent-memory-local/',
    '.claude/tasks/',
    '.claude/reports/',
  ];

  let gitignoreContent = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, 'utf-8')
    : '';

  const newEntries = gitignoreEntries.filter(e => !gitignoreContent.includes(e));
  if (newEntries.length > 0) {
    gitignoreContent += '\n# Claude Code local files\n' + newEntries.join('\n') + '\n';
    fs.writeFileSync(gitignorePath, gitignoreContent);
    success(`.gitignore updated (${newEntries.length} entries)`);
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
  flags.push('--force');
  init();
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
  log(`  ${CYAN}--no-smithery${RESET}    Skip Smithery setup step in instructions`);
  log(`\n${BOLD}Quick Start:${RESET}`);
  log('  cd /path/to/your-project');
  log('  npx claude-code-scanner init');
  log('  claude');
  log('  /scan-codebase');
  log('  /generate-environment');
  log('');
}

// Route command
switch (command) {
  case 'init': init(); break;
  case 'status': status(); break;
  case 'verify': verify(); break;
  case 'update': update(); break;
  case 'help': case '--help': case '-h': help(); break;
  case '--version': case '-v': case '-V': case 'version':
    log(require('../package.json').version);
    break;
  default:
    error(`Unknown command: ${command}`);
    help();
    process.exit(1);
}
