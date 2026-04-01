---
name: add-scene
description: >
  Game development scaffolding — add scenes, entities, components, systems, and game loops.
  Supports Unity (C#), Unreal (C++/Blueprint), Godot (GDScript/C#), Bevy (Rust), Phaser (JS/TS),
  and custom ECS architectures. Handles physics, input, animation, UI, and audio setup.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '"scene-name" [--type level|menu|loading|cutscene] [--with physics,input,audio,ui]'
effort: high
roles: [FullStackDev, TechLead]
agents: [@scaffolder, @tester, @architect]
---

**Lifecycle: T1 (multi-step) — See `_protocol.md`**

**CRITICAL RULES:**
1. Every output to the user MUST end with a `NEXT ACTION:` line.
2. Any file created MUST contain a `## Session Context` section.
3. Re-read task/output files before each step — never rely on in-memory state alone.
4. Update MEMORY.md after completion.

## Step 0 — Load Context

Before starting, load full context:

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, user preferences
3. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
4. **Active work:** Read `TODO.md` (if exists) → get current work items
5. **History:** List `.claude/tasks/` → check for related or duplicate work

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]

NEXT ACTION: Context loaded. Starting skill...
```


# /add-scene $ARGUMENTS

## Commands
- `/add-scene "MainMenu" --type menu --with ui,audio` — Menu scene with UI + audio
- `/add-scene "Level1" --type level --with physics,input,audio` — Game level with physics + input
- `/add-scene "GameOver" --type menu --with ui` — Simple UI screen
- `/add-scene --add-entity "Player" --components transform,sprite,physics,input` — Add entity to current scene
- `/add-scene --add-system "CollisionSystem"` — Add ECS system with update loop

## Process

### Detect Game Engine
1. Unity: `.csproj`, `Assets/`, `ProjectSettings/`, MonoBehaviour patterns
2. Unreal: `.uproject`, `Source/`, UObject/AActor patterns
3. Godot: `project.godot`, `.tscn`, `.gd` files
4. Bevy: `bevy` in Cargo.toml dependencies
5. Phaser: `phaser` in package.json, Scene class patterns
6. Custom ECS: entity-component patterns in source

### Scaffold Scene
**Unity:**
- Create scene file (.unity) or scene script
- Add required components: Camera, Canvas (UI), EventSystem, AudioListener
- Create scene controller MonoBehaviour with lifecycle (Awake, Start, Update)
- Register in Build Settings scene list

**Godot:**
- Create .tscn scene file with root node type (Node2D/Node3D/Control)
- Add child nodes per `--with` flags: RigidBody, Camera, AudioStreamPlayer
- Create attached .gd script with _ready(), _process(), _physics_process()
- Add to SceneTree autoload if global

**Bevy:**
- Create plugin module with setup system and update systems
- Add components (Transform, Sprite, RigidBody) per entity
- Register plugin in main app builder
- Add system ordering constraints

**Phaser:**
- Create Scene class extending Phaser.Scene
- Implement preload(), create(), update()
- Add to game config scenes array
- Set up physics, input, audio per flags

### Add Entity (ECS Pattern)
1. Define component structs/classes (Transform, Sprite, Physics, Health, Input)
2. Create entity factory/prefab with default component values
3. Add spawn function to scene setup
4. If physics: set up collision layers and masks

### Add System
1. Create system function/class with query for relevant components
2. Define execution order (before/after other systems)
3. Register in scene or global system scheduler
4. Add unit test for system logic

## Game-Specific Quality Checks
- Frame rate: no system should block main thread >16ms (60fps target)
- Memory: pooled objects for frequently spawned entities (bullets, particles)
- Input: responsive within 1 frame, buffered for combos
- Audio: preloaded, pooled AudioSources, no loading during gameplay

## Definition of Done
- Scene loads without errors
- All requested systems functional (physics, input, audio, UI)
- Entity spawns with correct components
- No frame drops in basic test (empty scene + entity)

## Post-Completion

### Update Memory
Update MEMORY.md (create if needed):
- **Skill:** /[this skill name]
- **Task:** [summary of what was done]
- **When:** [timestamp]
- **Result:** [COMPLETE | PARTIAL | BLOCKED]
- **Output:** [file path if any]
- **Next Step:** [recommended next action]

### Update TODO
If this work was linked to a TODO item, mark it done. If follow-up needed, add new TODO.

### Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | [SKILL_NAME] | [summary] | [result]
```

### Context Recovery
If context is lost (compaction, pause, resume):
1. Find most recent `.claude/tasks/` file with `Phase: IN_PROGRESS`
2. Read `## Session Context` → restore state
3. Read `## Progress Log` → find last completed step
4. Resume from next pending step

### Final Output
```
NEXT ACTION: Skill complete. Here's what you can do:
             - Say "commit" to commit changes
             - Say the next logical skill command for next step
             - Review output at the generated file path
```
