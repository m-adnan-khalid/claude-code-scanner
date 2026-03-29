const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const CLI = path.join(__dirname, '..', 'bin', 'cli.js');
const NODE = process.execPath;

/**
 * Run the CLI and return result.
 */
function run(args, opts = {}) {
  try {
    const stdout = execFileSync(NODE, [CLI, ...args], {
      encoding: 'utf-8',
      timeout: 15000,
      cwd: opts.cwd || process.cwd(),
      env: { ...process.env, ...(opts.env || {}) },
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (err) {
    return {
      stdout: (err.stdout || '').toString(),
      stderr: (err.stderr || '').toString(),
      exitCode: err.status ?? 1,
    };
  }
}

// ---------------------------------------------------------------------------
// copyDir behavior tested indirectly through init
// ---------------------------------------------------------------------------
describe('copyDir (via init)', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-test-copy-'));
    const result = run(['init'], { cwd: tmpDir });
    assert.equal(result.exitCode, 0, `init failed: ${result.stdout}\n${result.stderr}`);
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('copies .claude/agents/ directory with files', () => {
    const agentsDir = path.join(tmpDir, '.claude', 'agents');
    assert.ok(fs.existsSync(agentsDir), '.claude/agents/ should exist');
    const files = fs.readdirSync(agentsDir);
    assert.ok(files.length > 0, 'agents/ should contain files');
  });

  it('copies .claude/skills/ directory with files', () => {
    const skillsDir = path.join(tmpDir, '.claude', 'skills');
    assert.ok(fs.existsSync(skillsDir), '.claude/skills/ should exist');
    const entries = fs.readdirSync(skillsDir);
    assert.ok(entries.length > 0, 'skills/ should contain entries');
  });

  it('copies .claude/rules/ directory', () => {
    const rulesDir = path.join(tmpDir, '.claude', 'rules');
    assert.ok(fs.existsSync(rulesDir), '.claude/rules/ should exist');
  });

  it('copies .claude/hooks/ directory', () => {
    const hooksDir = path.join(tmpDir, '.claude', 'hooks');
    assert.ok(fs.existsSync(hooksDir), '.claude/hooks/ should exist');
  });

  it('creates settings.json', () => {
    const settingsPath = path.join(tmpDir, '.claude', 'settings.json');
    assert.ok(fs.existsSync(settingsPath), 'settings.json should exist');
    const content = fs.readFileSync(settingsPath, 'utf-8');
    // Should be valid JSON
    assert.doesNotThrow(() => JSON.parse(content), 'settings.json should be valid JSON');
  });

  it('creates settings.local.json', () => {
    const localPath = path.join(tmpDir, '.claude', 'settings.local.json');
    assert.ok(fs.existsSync(localPath), 'settings.local.json should exist');
    const parsed = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
    assert.deepEqual(parsed, { env: {} });
  });

  it('creates runtime directories (tasks, reports)', () => {
    assert.ok(fs.existsSync(path.join(tmpDir, '.claude', 'tasks')), 'tasks/ should exist');
    assert.ok(fs.existsSync(path.join(tmpDir, '.claude', 'reports')), 'reports/ should exist');
    assert.ok(fs.existsSync(path.join(tmpDir, '.claude', 'reports', 'daily')), 'reports/daily/ should exist');
    assert.ok(fs.existsSync(path.join(tmpDir, '.claude', 'reports', 'executions')), 'reports/executions/ should exist');
  });

  it('does not overwrite existing files without --force', () => {
    // Running init again should fail because CLAUDE.md already exists
    const result = run(['init'], { cwd: tmpDir });
    assert.notEqual(result.exitCode, 0);
    assert.match(result.stdout, /already exists|--force/i);
  });

  it('overwrites files with --force', () => {
    const result = run(['init', '--force'], { cwd: tmpDir });
    assert.equal(result.exitCode, 0, `init --force failed: ${result.stdout}`);
    assert.ok(fs.existsSync(path.join(tmpDir, 'CLAUDE.md')));
  });
});
