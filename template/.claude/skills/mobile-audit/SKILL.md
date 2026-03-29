---
name: mobile-audit
description: Comprehensive mobile app quality audit — performance, UX, accessibility, offline support, platform compliance, app store readiness, and security. Works for iOS, Android, React Native, Flutter, and KMP projects.
user-invocable: true
argument-hint: "[--platform ios|android|rn|flutter|kmp] [--scope full|performance|ux|store|security] [path/to/module]"
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent
roles: [QA, TechLead, Architect]
agents: [@mobile, @qa-automation, @security]
---

# /mobile-audit — Mobile App Quality Audit

## Usage
```
/mobile-audit                              # Full audit of entire mobile app
/mobile-audit --platform ios               # iOS-specific audit
/mobile-audit --platform android           # Android-specific audit
/mobile-audit --scope performance          # Performance-only audit
/mobile-audit --scope ux                   # UX & accessibility audit
/mobile-audit --scope store                # App store readiness check
/mobile-audit --scope security             # Mobile security audit
/mobile-audit src/features/auth/           # Audit specific module
```

## Process

### Step 1: Detect Platform
Auto-detect from project files:
- `pubspec.yaml` → Flutter
- `*.xcodeproj` or `Package.swift` → iOS native
- `build.gradle` + `AndroidManifest.xml` → Android native
- `react-native` in package.json → React Native
- `kotlin-multiplatform` in build.gradle → KMP
- Multiple → Cross-platform (audit all targets)

### Step 2: Run Audit Checks

#### A. Performance Audit
| Check | Target | How to Verify |
|-------|--------|---------------|
| **Cold start time** | < 2 seconds | Check `AppDelegate`/`Application.onCreate`/`main.dart` for heavy init; flag synchronous network calls, large asset loading |
| **App size** | < 50MB (ideal), < 100MB (acceptable) | Check for unoptimized images (PNG → WebP), unused assets, bundled debug libs, missing ProGuard/tree-shaking |
| **Memory leaks** | Zero leaks | Scan for undisposed controllers, uncancelled subscriptions, strong reference cycles (iOS), unclosed streams |
| **Battery drain** | Minimal background work | Flag continuous location tracking, wake locks, excessive background fetches, polling instead of push |
| **Render performance** | 60fps, no jank | Flag heavy computation on main/UI thread, missing `const` widgets (Flutter), unnecessary recomposition (Compose), unoptimized lists |
| **Network efficiency** | Minimal redundant calls | Flag missing caching headers, duplicate API calls, unbatched requests, missing pagination |
| **Image optimization** | Lazy load, proper sizing | Flag full-resolution images in lists, missing placeholder/shimmer, no memory cache |
| **Bundle/APK analysis** | No unnecessary deps | Flag unused dependencies, debug-only libs in release, duplicate native libraries |

#### B. UX & Accessibility Audit
| Check | Standard | How to Verify |
|-------|----------|---------------|
| **Touch targets** | ≥ 44pt (iOS) / 48dp (Android) | Scan for small buttons, close-together tap areas |
| **Color contrast** | WCAG AA (4.5:1 text, 3:1 large) | Check hardcoded colors against backgrounds, dark mode support |
| **Screen reader labels** | Every interactive element | Scan for missing `accessibilityLabel` (RN), `semanticsLabel` (Flutter), `contentDescription` (Android), `accessibilityLabel` (SwiftUI) |
| **Keyboard navigation** | Full app usable without touch | Check `FocusNode` (Flutter), `focusable` (Compose), tab order |
| **Dynamic type** | Text scales with system settings | Flag hardcoded font sizes, fixed-height text containers |
| **Reduce motion** | Respect system setting | Check for `prefers-reduced-motion` / `accessibilityReduceMotion` handling |
| **Responsive layout** | Works on all screen sizes | Flag hardcoded dimensions, missing safe area handling, no tablet layout |
| **Dark mode** | Full support | Flag hardcoded colors, missing dark theme variants, unreadable text in dark mode |
| **Loading states** | No blank screens | Flag missing skeleton screens, spinners, pull-to-refresh |
| **Error states** | User-friendly, recoverable | Flag generic error messages, missing retry buttons, unhandled exceptions |
| **Empty states** | Meaningful when no data | Flag empty list with no message/CTA |
| **Haptic feedback** | Appropriate for actions | Check for haptics on important actions (success, error, selection) |

#### C. Offline & Data Audit
| Check | Standard | How to Verify |
|-------|----------|---------------|
| **Offline behavior** | Graceful degradation | Flag screens that crash/blank without network; check for connectivity listeners |
| **Data persistence** | Local-first where appropriate | Check for proper local DB usage (Room/Core Data/Hive/SQLite) |
| **Sync strategy** | Conflict resolution defined | Flag missing sync logic for offline-modified data |
| **Secure storage** | Sensitive data encrypted | Flag tokens/credentials in SharedPreferences/UserDefaults (use Keychain/Keystore/flutter_secure_storage) |
| **Cache management** | Bounded, evictable | Flag unbounded caches, missing cache size limits, no TTL on cached data |
| **Background sync** | Battery-respectful | Check WorkManager (Android) / BGTaskScheduler (iOS) usage vs polling |

#### D. Platform Compliance Audit
| Check | iOS (Apple HIG) | Android (Material Design) |
|-------|----------------|--------------------------|
| **Navigation pattern** | Tab bar bottom, nav bar top, swipe back | Bottom nav, top app bar, system back |
| **System gestures** | Don't block swipe-from-edge | Don't override system back, predictive back support |
| **Permissions** | Request just-in-time, usage descriptions in Info.plist | Runtime permissions, rationale before request |
| **Notifications** | APNs registration, proper entitlements | FCM setup, notification channels (Android 8+) |
| **Status bar** | Respect safe areas, transparent nav | Edge-to-edge, window insets |
| **Typography** | SF Pro / system font, Dynamic Type | Roboto / Material type scale |
| **System integration** | Share sheet, Spotlight, Widgets, App Clips | Share intent, App Shortcuts, Widgets |
| **Privacy** | App Tracking Transparency, Privacy Nutrition Labels | Data safety section in Play Console |

#### E. App Store Readiness Audit
| Check | What to Verify |
|-------|---------------|
| **Bundle/package ID** | Unique, matches store listing |
| **Version numbering** | Semantic versioning, build numbers increment |
| **Signing** | Release signing configured (not debug), provisioning profiles valid |
| **Screenshots** | All required sizes present (6.7", 6.5", 5.5" for iOS; phone + tablet for Android) |
| **Metadata** | Title, description, keywords, category, content rating |
| **Privacy policy** | URL provided, covers all data collection |
| **Data declarations** | Matches actual app behavior (iOS Privacy Labels, Android Data Safety) |
| **In-app purchases** | Sandbox tested, restore purchases works, server validation |
| **Review guidelines** | No private APIs (iOS), no policy violations, crash-free |
| **Crash reporting** | Integrated (Crashlytics/Sentry), dSYM/ProGuard mapping configured |
| **Analytics** | Key events tracked, user consent for tracking |
| **Deep links** | Universal Links (iOS) / App Links (Android) configured and verified |
| **ProGuard/R8** (Android) | Enabled for release, rules don't strip necessary code |
| **Bitcode** (iOS, if needed) | Enabled/disabled matching Xcode config |

#### F. Mobile Security Audit
| Check | What to Verify |
|-------|---------------|
| **No secrets in code** | Grep for API keys, tokens, passwords in source files and assets |
| **Certificate pinning** | Implemented for sensitive API endpoints |
| **Root/jailbreak detection** | Present for banking/financial apps |
| **SSL/TLS** | No HTTP cleartext allowed (ATS on iOS, network security config on Android) |
| **Biometric auth** | Properly using system APIs (LocalAuthentication/BiometricPrompt), fallback to passcode |
| **Clipboard security** | Sensitive data not copied to clipboard, or cleared after timeout |
| **Screenshot prevention** | Sensitive screens flag `FLAG_SECURE` (Android) / hidden in app switcher (iOS) |
| **Local data encryption** | SQLCipher for databases, encrypted preferences for sensitive key-value |
| **Token management** | Refresh token rotation, secure storage, proper expiry handling |
| **Input validation** | Client-side validation present (but server is source of truth) |

### Step 3: Generate Report

## Output Format
```
## Mobile App Quality Audit

### Summary Dashboard
| Category | Score | Critical | Major | Minor |
|----------|-------|----------|-------|-------|
| Performance | [0-100] | N | N | N |
| UX & Accessibility | [0-100] | N | N | N |
| Offline & Data | [0-100] | N | N | N |
| Platform Compliance | [0-100] | N | N | N |
| App Store Readiness | [0-100] | N | N | N |
| Security | [0-100] | N | N | N |
| **Overall** | **[0-100]** | **N** | **N** | **N** |

### Platform: [iOS / Android / React Native / Flutter / KMP]
### Architecture: [MVVM / MVI / BLoC / Clean / etc.]

### Critical Issues (must fix before release)
| # | Category | File:Line | Issue | Fix |
|---|----------|-----------|-------|-----|
| 1 | ... | ... | ... | ... |

### Major Issues (should fix)
| # | Category | File:Line | Issue | Fix |
|---|----------|-----------|-------|-----|
| 1 | ... | ... | ... | ... |

### Minor Issues (nice to fix)
| # | Category | File:Line | Issue | Fix |
|---|----------|-----------|-------|-----|
| 1 | ... | ... | ... | ... |

### App Store Readiness: [READY / NOT READY]
- [x] or [ ] for each store checklist item

### Recommendations
1. [Top priority fix with estimated effort]
2. [Second priority]
3. [Third priority]
```

## Definition of Done
- All audit categories checked (performance, UX, accessibility, offline, security), findings prioritized.

## Next Steps
- `/fix-bug` for critical issues, `/workflow new` for major improvements.

## Real Mobile Testing
After audit, run real device/emulator tests:
- `/e2e-mobile` — execute Maestro/Detox/Appium/Flutter tests on real emulator/device

## Rollback
- N/A (read-only audit).
