# Context Window Deep Reference

## What Consumes Context

### Always Loaded (every request)
- System prompt: ~2,000 tokens
- Root CLAUDE.md: ~15 tokens/line (150 lines ≈ 2,250 tokens)
- @-imports: counted in CLAUDE.md budget
- Auto memory (MEMORY.md first 200 lines): ~2,000 tokens
- Skill descriptions (ALL installed): ~100 tokens each
- Agent descriptions (ALL defined): ~100 tokens each
- MCP server tool definitions: ~200-2,000 tokens EACH (expensive!)
- Active rules (matching current paths): ~500 tokens each
- Conversation history: grows with each turn

### On-Demand
- Full skill content: ~3,000-5,000 tokens
- Module CLAUDE.md: ~1,000-2,000 tokens
- File reads / Bash output: varies

### Zero Cost on Parent
- Subagent context (runs in separate window)
- Skills with `context: fork`
- Templates, profiles (never auto-loaded)
- Hook scripts, settings values

## Budget Calculator
```
System prompt:                2,000
+ CLAUDE.md lines × 15:      _____ (150 lines = 2,250)
+ Memory × 15:               _____ (estimate 2,000)
+ Skills × 100:              _____ (15 skills = 1,500)
+ Agents × 100:              _____ (8 agents = 800)
+ MCP servers × 800:         _____ (3 servers = 2,400)
= STARTUP TOTAL:             _____ tokens

Model context: 200,000 tokens
Startup %: (total ÷ 200,000) × 100

Target: startup < 20%, working < 60%
```

## Compaction
- Auto at ~95% (configurable via CLAUDE_AUTOCOMPACT_PCT_OVERRIDE)
- Manual: `/compact "focus on auth changes"`
- Re-inject after compact via SessionStart hook

## Strategy Decision Tree
- Explore codebase? → subagent (context: fork)
- Heavy skill? → context: fork
- Quick check? → Grep/Glob directly
- Multiple tasks? → /clear between or worktrees
- Getting slow? → /compact or /clear
- New skill/MCP? → /context-check before and after
