const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const CLI = path.join(__dirname, '..', 'bin', 'cli.js');
const NODE = process.execPath;

/**
 * Run the CLI with the given arguments.
 * Returns { stdout, stderr, exitCode }.
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
// help command
// ---------------------------------------------------------------------------
describe('help command', () => {
  it('outputs usage info', () => {
    const result = run(['help']);
    assert.equal(result.exitCode, 0);
    assert.match(result.stdout, /Usage/i);
    assert.match(result.stdout, /Commands/i);
  });

  it('lists known commands', () => {
    const result = run(['help']);
    assert.match(result.stdout, /init/);
    assert.match(result.stdout, /new/);
    assert.match(result.stdout, /status/);
    assert.match(result.stdout, /verify/);
  });
});

// ---------------------------------------------------------------------------
// --version
// ---------------------------------------------------------------------------
describe('--version flag', () => {
  it('outputs version matching package.json', () => {
    const pkg = require('../package.json');
    const result = run(['--version']);
    assert.equal(result.exitCode, 0);
    assert.equal(result.stdout.trim(), pkg.version);
  });
});

// ---------------------------------------------------------------------------
// status command
// ---------------------------------------------------------------------------
describe('status command', () => {
  it('runs without error', () => {
    const result = run(['status']);
    assert.equal(result.exitCode, 0);
    assert.match(result.stdout, /Status/i);
  });
});

// ---------------------------------------------------------------------------
// new command — error cases
// ---------------------------------------------------------------------------
describe('new command', () => {
  it('without project name shows error', () => {
    const result = run(['new']);
    assert.notEqual(result.exitCode, 0);
    assert.match(result.stdout, /provide a project name/i);
  });

  it('with invalid chars shows error', () => {
    const result = run(['new', 'bad<name>']);
    assert.notEqual(result.exitCode, 0);
    assert.match(result.stdout, /invalid project name/i);
  });
});

// ---------------------------------------------------------------------------
// init command — creates files in temp dir
// ---------------------------------------------------------------------------
describe('init command', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-test-init-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates CLAUDE.md and .claude/ directory', () => {
    const result = run(['init'], { cwd: tmpDir });
    assert.equal(result.exitCode, 0, `init failed: ${result.stdout}\n${result.stderr}`);
    assert.ok(fs.existsSync(path.join(tmpDir, 'CLAUDE.md')), 'CLAUDE.md should exist');
    assert.ok(fs.existsSync(path.join(tmpDir, '.claude')), '.claude/ directory should exist');
  });
});

// ---------------------------------------------------------------------------
// verify command — without setup
// ---------------------------------------------------------------------------
describe('verify command', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-test-verify-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('without setup shows error', () => {
    const result = run(['verify'], { cwd: tmpDir });
    assert.notEqual(result.exitCode, 0);
    assert.match(result.stdout, /not found|init/i);
  });
});

// ---------------------------------------------------------------------------
// unknown command
// ---------------------------------------------------------------------------
describe('unknown command', () => {
  it('shows error for unknown command', () => {
    const result = run(['nonexistent-cmd']);
    assert.notEqual(result.exitCode, 0);
    assert.match(result.stdout, /unknown command/i);
  });
});
