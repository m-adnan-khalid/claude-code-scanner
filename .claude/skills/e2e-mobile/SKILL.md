---
name: e2e-mobile
description: Run real mobile E2E tests on emulators/simulators/devices. Supports Maestro, Detox, Appium, Flutter integration tests, and XCUITest/Espresso. Auto-detects platform.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '[--platform ios|android|flutter|rn] [--framework maestro|detox|appium|native] [--device "name"] [--record] [--flow "path"]'
roles: [QA, TechLead, FullStackDev]
agents: [@qa-automation, @mobile, @tester, @qa-lead]
---

**Lifecycle: T4 (testing) — See `_protocol.md`**

**RULES:** Every output MUST end with `NEXT ACTION:`. Update MEMORY.md after completion.

## Step 0 — Load Context

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last test results, prior runs
3. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
4. **Active work:** Read `TODO.md` (if exists) → get current work items

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]
```


# Mobile E2E Testing: $ARGUMENTS

## Auto-Detection
```bash
# Detect mobile platform
[ -f pubspec.yaml ] && echo "PLATFORM: flutter"
[ -f .detoxrc.js ] && echo "FRAMEWORK: detox"
ls *.xcodeproj 2>/dev/null && echo "PLATFORM: ios-native"
[ -f android/app/build.gradle ] && echo "PLATFORM: android"
grep -q '"react-native"' package.json 2>/dev/null && echo "PLATFORM: react-native"
maestro --version 2>/dev/null && echo "FRAMEWORK: maestro"
appium --version 2>/dev/null && echo "FRAMEWORK: appium"
```

## Framework 1: Maestro (Recommended — Easiest Setup)
Maestro is the fastest way to run real mobile E2E tests. No code required — YAML flows.

### Install
```bash
# macOS
curl -Ls "https://get.maestro.mobile.dev" | bash
# Verify
maestro --version
```

### Run Tests
```bash
mkdir -p .claude/reports/mobile/screenshots

# Run single flow
maestro test {flow-file}.yaml \
  --format junit \
  --output .claude/reports/mobile/maestro-results.xml \
  2>&1 | tee .claude/reports/mobile/maestro-output.txt

# Run all flows in directory
maestro test .maestro/ \
  --format junit \
  --output .claude/reports/mobile/maestro-results.xml \
  2>&1 | tee .claude/reports/mobile/maestro-output.txt

# Record video
maestro record {flow-file}.yaml \
  --output .claude/reports/mobile/recording.mp4

# Take screenshots at checkpoints
maestro test {flow-file}.yaml --debug-output .claude/reports/mobile/debug/
```

### Generate Maestro Flow (if none exist)
```yaml
# .maestro/login-flow.yaml
appId: {bundle-id}
---
- launchApp
- assertVisible: "Login"
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "Test1234!"
- tapOn: "Sign In"
- assertVisible: "Dashboard"
- takeScreenshot: .claude/reports/mobile/screenshots/login-success
```

## Framework 2: Detox (React Native)
### Setup
```bash
# Install
npm install -D detox
# Build app for testing
npx detox build --configuration ios.sim.debug
# OR Android
npx detox build --configuration android.emu.debug
```

### Run Tests
```bash
# iOS Simulator
npx detox test --configuration ios.sim.debug \
  --artifacts-location .claude/reports/mobile/detox-artifacts \
  --record-logs all \
  --take-screenshots failing \
  --record-videos failing \
  2>&1 | tee .claude/reports/mobile/detox-output.txt

# Android Emulator
npx detox test --configuration android.emu.debug \
  --artifacts-location .claude/reports/mobile/detox-artifacts \
  --record-logs all \
  --take-screenshots failing \
  --record-videos failing \
  2>&1 | tee .claude/reports/mobile/detox-output.txt
```

## Framework 3: Flutter Integration Tests
```bash
# Run on connected device/emulator
flutter test integration_test/ \
  --reporter expanded \
  --coverage \
  2>&1 | tee .claude/reports/mobile/flutter-output.txt

# Run with screenshots (golden tests)
flutter test --update-goldens  # create baselines (first run)
flutter test                    # compare against baselines

# Run on specific device
flutter devices  # list available
flutter test integration_test/ -d {device-id}

# Generate coverage
flutter test --coverage
genhtml coverage/lcov.info -o .claude/reports/mobile/coverage/
```

## Framework 4: Appium (Cross-platform)
### Setup
```bash
# Install Appium
npm install -g appium
appium driver install uiautomator2  # Android
appium driver install xcuitest      # iOS

# Start Appium server
appium --port 4723 &
APPIUM_PID=$!
sleep 3
```

### Run Tests (WebdriverIO + Appium)
```bash
# Run test suite
npx wdio run wdio.conf.js \
  --reporters spec,junit \
  --reporterOptions junitReportDirectory=.claude/reports/mobile \
  2>&1 | tee .claude/reports/mobile/appium-output.txt

# Cleanup
kill $APPIUM_PID 2>/dev/null
```

## Framework 5: Native Platform Tests
### XCUITest (iOS)
```bash
# Run XCUITest suite
xcodebuild test \
  -project {Project}.xcodeproj \
  -scheme {Scheme}UITests \
  -destination 'platform=iOS Simulator,name=iPhone 15,OS=latest' \
  -resultBundlePath .claude/reports/mobile/xctest-results \
  2>&1 | tee .claude/reports/mobile/xcuitest-output.txt

# Extract results
xcrun xcresulttool get --path .claude/reports/mobile/xctest-results.xcresult \
  --format json > .claude/reports/mobile/xctest-results.json
```

### Espresso (Android)
```bash
# Run instrumented tests
cd android && ./gradlew connectedAndroidTest \
  --info \
  2>&1 | tee .claude/reports/mobile/espresso-output.txt

# Copy results
cp -r app/build/reports/androidTests .claude/reports/mobile/espresso-results/
```

## Emulator/Simulator Management
```bash
# iOS: List and boot simulator
xcrun simctl list devices available
xcrun simctl boot "iPhone 15"

# Android: List and start emulator
$ANDROID_HOME/emulator/emulator -list-avds
$ANDROID_HOME/emulator/emulator -avd {avd-name} -no-window -no-audio &
adb wait-for-device

# Check device/emulator is ready
adb devices  # Android
xcrun simctl list | grep Booted  # iOS
```

## Report Template
```markdown
# Mobile E2E Test Report
Date: {ISO timestamp}
Platform: {iOS|Android|Flutter|React Native}
Framework: {Maestro|Detox|Appium|XCUITest|Espresso}
Device: {device/emulator name}

## Summary
| Metric | Value |
|--------|-------|
| Total Tests | N |
| Passed | N |
| Failed | N |
| Duration | Ns |
| Screenshots | N |
| Videos | N |
| Device | {name} |
| OS Version | {version} |

## Failed Tests
| # | Test Name | Error | Screenshot | Video |
|---|-----------|-------|------------|-------|
| 1 | {test} | {error} | {path} | {path} |

## User Flow Results
| Flow | Steps | Pass | Duration | Evidence |
|------|-------|------|----------|----------|
| Login | 5 | YES | 3.2s | login-success.png |
| Signup | 8 | YES | 5.1s | signup-complete.png |
| Checkout | 12 | NO | — | checkout-error.png |

## Platform-Specific Checks
- [ ] Orientation changes handled
- [ ] Keyboard dismissal works
- [ ] Back button / swipe back works
- [ ] Deep links resolve correctly
- [ ] Push notification tap opens correct screen
- [ ] App backgrounding / foregrounding maintains state

## Evidence
- Screenshots: `.claude/reports/mobile/screenshots/`
- Videos: `.claude/reports/mobile/videos/`
- Logs: `.claude/reports/mobile/{framework}-output.txt`

## Verdict
**PASS** / **FAIL** — {summary}
```

Save to `.claude/reports/mobile/report-{date}.md`

## Cleanup
```bash
# Stop emulators/simulators if started by this skill
xcrun simctl shutdown all 2>/dev/null
adb emu kill 2>/dev/null
kill $APPIUM_PID 2>/dev/null
```

## Definition of Done
- Tests executed on real emulator/simulator/device
- Screenshots captured for key flows and failures
- Video recorded for failures (if --record)
- Structured report saved to `.claude/reports/mobile/`
- Emulators/devices cleaned up

## Post-Completion

### Update Memory
Update MEMORY.md (create if needed):
- **Skill:** /[this skill name]
- **Task:** tests executed
- **When:** [timestamp]
- **Result:** [PASS/FAIL — N passed, N failed]
- **Output:** [test report path if any]
- **Next Step:** [fix failures / all passing / increase coverage]

### Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | [SKILL_NAME] | [summary] | [result]
```

### Final Output
```
NEXT ACTION: Tests complete. Here's what you can do:
             - To fix failures, say "fix [test name]"
             - To re-run, use the same test command
             - To check coverage, say "/coverage-track"
```
