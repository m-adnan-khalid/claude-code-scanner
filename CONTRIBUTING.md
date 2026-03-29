# Contributing to claude-code-scanner

Thanks for your interest in contributing! This guide covers everything you need to get started.

## Prerequisites

- **Node.js >= 18** (no other dependencies required)
- Git

## Setup

```bash
git clone https://github.com/m-adnan-khalid/claude-code-scanner.git
cd claude-code-scanner
npm install
```

## Project Structure

```
bin/          CLI entry point (cli.js)
template/     Complete Claude Code environment template
  .claude/
    agents/   Role-based agent definitions (.md)
    skills/   Workflow skill definitions (.md)
    hooks/    Automation hook scripts
    rules/    Path-specific rule files
    scripts/  Setup and verification scripts
scripts/      Installer and verification scripts
tests/        Test suite (Node built-in test runner)
```

## Running Locally

```bash
# Run the test suite
npm test

# CLI smoke test
node bin/cli.js help

# Verify the template is valid
cd template && node ../scripts/verify-setup.js
```

## Making Changes

### Adding a New Agent

Create a `.md` file in `template/.claude/agents/` following the format of existing agents. Each agent needs a role description, access level, and responsibilities.

### Adding a New Skill

Create a `.md` file in `template/.claude/skills/` with the skill trigger, description, and execution steps.

### Adding a New Hook

Add your script to `template/.claude/hooks/` and register it in `template/.claude/settings.json`.

## Pull Request Process

1. **Fork** the repository
2. **Create a branch** from `master` (`git checkout -b my-feature`)
3. **Make your changes** and add tests if applicable
4. **Run the tests** to make sure nothing is broken: `npm test`
5. **Run the smoke test**: `node bin/cli.js help`
6. **Commit** with a clear message describing the change
7. **Open a PR** against `master`

## Code Style

- **No external dependencies** -- this project uses Node.js built-ins only
- **Cross-platform** -- avoid platform-specific APIs; use `path.join` instead of string concatenation for paths
- **Node built-in test runner** -- tests use `node --test`, no test framework needed
- Keep files focused and small; prefer many small files over few large ones

## Reporting Issues

Open an issue on GitHub with steps to reproduce. Include your Node.js version and OS.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
