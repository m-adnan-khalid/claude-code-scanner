---
name: firmware-audit
description: >
  Embedded systems and IoT firmware audit — memory safety, RTOS patterns, hardware abstraction,
  interrupt handling, power management, OTA updates, communication protocols, and security.
  Supports C/C++ (bare metal, FreeRTOS, Zephyr), Rust (Embassy, RTIC), MicroPython, and Arduino.
user-invocable: true
context: fork
allowed-tools: Read, Bash, Grep, Glob, Agent
argument-hint: "[--memory | --rtos | --security | --power | --protocols | --full]"
effort: high
roles: [TechLead, Architect, CTO, DevOps]
agents: [@security, @code-quality, @architect]
---

**Lifecycle: T2 (audit/analysis) — See `_protocol.md`**

**RULES:** Every output MUST end with `NEXT ACTION:`. Update MEMORY.md after completion.

## Step 0 — Load Context

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, prior audit results
3. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
4. **Active work:** Read `TODO.md` (if exists) → get current work items

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]
```


# /firmware-audit $ARGUMENTS

## Commands
- `/firmware-audit` — Full firmware quality audit
- `/firmware-audit --memory` — Memory safety: stack overflow, heap fragmentation, buffer overflows, leaks
- `/firmware-audit --rtos` — RTOS patterns: task priorities, deadlocks, resource sharing, timing
- `/firmware-audit --security` — Security: secure boot, encrypted OTA, key storage, debug ports
- `/firmware-audit --power` — Power: sleep modes, wake sources, peripheral power gating, battery life
- `/firmware-audit --protocols` — Communication: UART, SPI, I2C, BLE, WiFi, MQTT, CoAP patterns

## Checks

### Memory Safety
1. **Stack analysis:** estimate stack usage per task/ISR, flag >80% stack depth
2. **Heap fragmentation:** detect malloc/free patterns without pooling, suggest memory pools
3. **Buffer overflows:** scan for unbounded memcpy, strcpy, sprintf without size limits
4. **Static allocation:** verify critical paths use static buffers, not heap
5. **Memory-mapped I/O:** verify volatile qualifiers on hardware registers
6. **DMA buffers:** verify alignment and cache coherency handling

### RTOS Patterns
1. **Task priorities:** detect priority inversion risks, suggest priority inheritance mutexes
2. **Deadlock detection:** analyze mutex acquisition order across tasks
3. **ISR safety:** verify ISRs don't call blocking functions, use ISR-safe queue APIs
4. **Watchdog:** verify watchdog timer is fed in main loop and critical tasks
5. **Timing:** verify time-critical tasks have appropriate priorities and deadlines

### Security
1. **Secure boot:** verify boot chain validation (signature check, rollback protection)
2. **OTA updates:** verify signed firmware images, version validation, rollback capability
3. **Key storage:** verify secrets in secure elements/eFuse, not in flash
4. **Debug ports:** verify JTAG/SWD disabled in production builds
5. **Communication:** verify TLS for network, encryption for stored data

### Power Management
1. **Sleep modes:** verify deep sleep entered when idle, correct wake sources configured
2. **Peripheral control:** verify unused peripherals powered down
3. **Clock management:** verify CPU frequency scaled for workload
4. **Battery:** estimate battery life from measured/documented current draw per state

### Communication Protocols
1. **UART/SPI/I2C:** verify error handling, timeout, retries, DMA usage
2. **BLE:** verify proper state machine (advertising, connected, bonded), MTU negotiation
3. **WiFi:** verify reconnection logic, credential storage, power management
4. **MQTT/CoAP:** verify QoS levels, keepalive, last will, message buffering for offline

## Output
- Firmware quality score (0-100) with category breakdown
- Critical findings: memory bugs, security vulnerabilities, deadlock risks
- Recommendations prioritized by safety impact

## Definition of Done
- Zero critical memory safety issues
- No deadlock risks in RTOS task graph
- Security audit passed for production deployment
- Power budget documented and within battery life target

## Post-Completion

### Update Memory
Update MEMORY.md (create if needed):
- **Skill:** /[this skill name]
- **Task:** audit completed
- **When:** [timestamp]
- **Result:** [PASS/FAIL/PARTIAL — N issues found]
- **Output:** [report file path if any]
- **Next Step:** [fix top priority issues / re-run after fixes / all clear]

### Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | [SKILL_NAME] | [summary] | [result]
```

### Final Output
```
NEXT ACTION: Audit complete. Here's what you can do:
             - To fix issues, say "fix [issue]" or run /fix-bug
             - To re-run this audit, run the same command again
             - To run another audit, pick the relevant audit command
```
