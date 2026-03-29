---
name: add-command
description: >
  Scaffold a new CLI command with argument parsing, help text, validation, and tests.
  Supports Commander.js, Yargs, Oclif, Click, Typer, Cobra, Clap, and custom CLI frameworks.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '"command-name" [--flags "flag1,flag2"] [--subcommands "sub1,sub2"]'
effort: high
roles: [BackendDev, FullStackDev, TechLead]
agents: [@api-builder, @tester, @scaffolder]
---

# /add-command $ARGUMENTS

## Process
1. **Detect CLI framework:** Commander.js, Yargs, Oclif, Click, Typer, Cobra (Go), Clap (Rust), argparse
2. **Scaffold command:**
   - Command file with argument definitions, help text, handler function
   - Register in command index/router
   - Add validation for required arguments
   - Add --help output
3. **Add subcommands** (if `--subcommands` specified):
   - Create subcommand files
   - Register in parent command
   - Each with own args/help/handler
4. **Generate tests:**
   - Test: command runs with valid args → expected output
   - Test: command with missing required args → error message
   - Test: command --help → shows usage
   - Test: each subcommand runs independently
5. **Update documentation:**
   - Add to README CLI reference table
   - Update man page / --help root listing

## Definition of Done
- Command runs with `cli command-name --flag value`
- Help text shows for `cli command-name --help`
- Invalid args show clear error with usage hint
- Tests pass for happy path + error cases
