# SmartHome Mobile Frontend Audit

**Audit date:** 2026-11-03
**Repository:** `Kevin-Stiven-Lopez-Amaya404/from_movil`
**Development base:** `origin/dev` at `42628313faa48e0fdfa2c62a7de7e5930b1f3808`
**Working branch:** `feature/mobile-energy-ui`

## Scope and method

The audit covers the 35 Expo Router screen files under `app/`, the three router layouts, shared UI/theme components, route links, relevant automated suites, and the current branch/PR state. The five visible tabs are Dashboard, Homes, Energy, Notifications, and Profile. Secondary authenticated screens remain in the tabs stack; recovery and activation routes remain at the root for deep links.

No screenshot files accompanied the brief, so this report uses the implementation and earlier merged phase reviews as evidence. Physical-device visual checks remain pending. No backend, database, auth-service contract, Shelly pairing contract, MQTT, LAN, BLE, or infrastructure code has been changed in this design-system phase.

## Git and PR audit

`git fetch origin` succeeded after the sandbox blocked the first network attempt. `origin/dev` advanced from `23dc7c6` to `4262831`. The local `dev` branch still points at `23dc7c6`; development was based directly on the fetched `origin/dev` instead of changing `dev`.

| Ref | Relationship to current `origin/dev` | Finding |
| --- | --- | --- |
| `20-dev` | 88 behind, 0 ahead | No exclusive commits; do not use as a base. |
| `fix/ui-devices` | 11 behind, 0 ahead | Its device-screen work is already in `dev` through PR #24. |
| `fix/iu-login` | 4 behind, 0 ahead | PR #29 is merged; its changes are already in `dev`. |
| `fix/ui-profile-personal-redesign` | 5 behind, 0 ahead | PR #27 is merged; its changes are already in `dev`. |
| `dev` (local) | 4 behind `origin/dev` | Stale; `origin/dev` is the source of this phase. |

PRs #27–#29 are merged into `dev`. PR #1 from `03-dev` is the only open PR found; GitHub reports it as not mergeable. It is unrelated to this work and was left untouched. No unpublished branch containing exclusive changes from the current task was found. `.agents/` and `.easignore` are untracked local files and have been preserved.

## Route inventory

| Route/file | Current purpose | Audit finding |
| --- | --- | --- |
| `app/welcome.tsx` | First-run welcome and entry to sign-in or registration. | Uses the shared auth layout and active auth palette. Check splash-to-screen transition on device. |
| `app/login.tsx` | Sign-in, password recovery, registration, and reactivation links. | A flexible spacer pushes the secondary links to the bottom; move them directly under the primary action in the Auth phase. |
| `app/register.tsx` | Account registration and consent checkbox. | Consent text has no links to legal documents. Password and confirmation share one visibility state. Approved document URLs are absent from the repository. |
| `app/forgot-password.tsx` | Requests a password reset link. | Uses the shared auth form layout; verify error recovery and keyboard behavior on device. |
| `app/new-password.tsx` | Completes password reset from a token link. | Confirmation visibility is coupled to the new-password field. |
| `app/reset-password.tsx` | Compatibility alias to `new-password`. | Preserve for existing deep links. |
| `app/activate-account.tsx` | Activates an account using a deep-link token. | Has loading, success, and error states; physical error/recovery flow review remains pending. |
| `app/request-reactivation.tsx` | Requests a reactivation link by email. | Uses a generic response to avoid account enumeration. |
| `app/reactivate-account.tsx` | Reactivates an account using a token. | Has loading, success, and error states; preserve token behavior. |
| `app/+not-found.tsx` | Unknown-route recovery. | Its close control is smaller than the shared 44 dp BackButton target; review with the common navigation controls. |
| `app/(tabs)/(main)/index.tsx` | Authenticated Dashboard with home, device, energy, and alert summaries. | Prior merged dashboard work is retained; theme and small-screen visual regression checks remain pending. |
| `app/(tabs)/(main)/homes.tsx` | Lists and manages accessible homes, including create/edit flows. | Contains nested scroll areas for dialogs/forms; keep them modal-contained and verify on small screens. |
| `app/(tabs)/(main)/reports.tsx` | General consumption panel with charts, statistics, ranking, and CSV/PDF exports. | Keep this as the general report panel; use compact planning summary links for tariffs and goals. Refresh rolling date ranges when returning to the screen. |
| `app/(tabs)/(main)/notifications.tsx` | Alerts and invitation notifications. | The earlier UTF-8 repair is present in the merged base. |
| `app/(tabs)/(main)/profile.tsx` | Identity, security shortcuts, settings, and sign-out. | Current redesign omits the real session role. Its Settings page does not link to the existing Help, About, or Personal Info routes. |
| `app/(tabs)/devices.tsx` | Search/filter and control devices from accessible homes. | Virtualized list and device state presentation are covered by the merged device phase; recheck visual contrast and responsive layout. |
| `app/(tabs)/home-detail.tsx` | Home detail, device controls, member access, and home actions. | Preserve OWNER/MEMBER/GUEST restrictions and confirmed control behavior. |
| `app/(tabs)/access.tsx` | Manages home access/members. | Long form already uses keyboard avoidance; verify role permissions and return navigation. |
| `app/(tabs)/invitations.tsx` | Shows and responds to home invitations. | Secondary screen reached from notifications; verify empty and error states. |
| `app/(tabs)/favorites.tsx` | Displays favorite devices/homes and navigation to their homes. | Uses the shared `ScreenHeader`; verify an empty state and route parameters. |
| `app/(tabs)/add-device.tsx` | Discovers local Shelly devices and starts commissioning. | The primary action starts LAN and BLE scans, while a second BLE scan control is also visible. Separate LAN discovery from the explicitly read-only BLE inspection action in the Devices phase. |
| `app/(tabs)/shelly-setup.tsx` | Guides a user through the Shelly access-point/Wi-Fi setup path. | Keep instructions aligned with the actual device/AP flow; do not persist Wi-Fi credentials. |
| `app/(tabs)/prepare-shelly.tsx` | Multi-stage Shelly preparation and MQTT/backend verification. | Existing flow requires backend confirmation before final registration. Treat it as integration-sensitive and limit changes to presentation/copy. |
| `app/(tabs)/energy-tariffs.tsx` | Displays current tariff and immutable tariff history. | Keep as a dedicated screen. Make current/no-current and first-tariff states clear; OWNER alone can open tariff registration. |
| `app/(tabs)/energy-tariff-new.tsx` | Validates and records an immutable tariff. | Keep as a separate registration screen reached from tariff history. Preserve SQL034 numeric/date/permission rules and unsaved-form protection. |
| `app/(tabs)/energy-goals.tsx` | Month navigation, monthly budget, kWh target, edit form, and progress. | Keep as a dedicated goals/budget screen. Improve the unconfigured state and prevent duplicate saves without changing calculations. |
| `app/(tabs)/settings.tsx` | Appearance, palette, language, synchronization info, password and deactivation. | Existing real controls are separated from Profile. Help/About entries are currently absent. |
| `app/(tabs)/language.tsx` | Changes the supported app language. | Persistent language selection is present; several other screens still have hardcoded Spanish copy. |
| `app/(tabs)/personal-info.tsx` | Read-only account details. | No current UI link was found after the Profile redesign; keep route behavior if it is used by deep links. |
| `app/(tabs)/account-security.tsx` | Account security entry point and device connectivity summary. | Profile reaches this screen with a return origin; its session action opens the confirmed global-session-close flow. |
| `app/(tabs)/close-sessions.tsx` | Confirms and requests a global session close. | Preserve confirmation, duplicate-request guard, and safe failure handling. |
| `app/(tabs)/change-password.tsx` | Changes the current account password. | Current and new fields have separate reveal state, but the confirmation field shares the new-password reveal state. |
| `app/(tabs)/help.tsx` | Local FAQ and support entry. | One FAQ describes an outdated add-device flow; “Contact support” only shows an informational alert and has no contact channel. No Profile/Settings link currently reaches this route. |
| `app/(tabs)/about-smart-home.tsx` | About screen. | Version `1.0.0` and `Beta` are hardcoded; no Settings/Profile link currently reaches the route. |
| `app/(tabs)/alerts.tsx` | Legacy alerts route. | Redirects to the Notifications tab with the alerts section selected; preserve for compatibility. |

No dedicated rooms screen or approved Terms/Privacy document route exists in `app/`.

## Shared UI and design system

- `lib/theme/app-theme.ts` is the source of semantic app colors and contains both Classic and Emerald palettes, light/dark variants, switch states, and an auth palette.
- `lib/theme/appearance.ts` derives auth colors from the active app palette; auth and in-app screens do not need separate brand colors.
- `lib/theme/typography.ts` defines native font families and shared text sizes. `constants/theme.ts` supplies spacing and radius tokens.
- Shared pieces already available include `Button`, `BackButton` (44 × 44 dp), `ScreenHeader`, `Card`, `FilterChip`, `SegmentedControl`, `AuthScreenLayout`, and common auth fields.
- Several older screens still compose buttons, headers, and rows directly. Existing unused components are listed in `docs/auditoria/auditoria-componentes-fase-2.md`; do not add another generic layer or delete these without checking consumers.
- The default palette was Classic while the requested brand preference is green. Phase 1 changes only the default for installs without a saved choice to Emerald; an explicitly saved Classic selection remains intact.
- The native and animated splash used a separate blue `#005CC1`. Phase 1 aligns both with Emerald primary `#047857`.

Contrast was calculated for primary text, muted text, primary/auth buttons, warnings, success, and danger surfaces for all four palette/mode combinations. The checked combinations are at least 4.5:1; the lowest checked ratio is 4.76:1 for the light warning text. This is a source-token audit, not a device screenshot measurement.

## Prioritized findings and phase plan

| Priority | Finding | Planned phase |
| --- | --- | --- |
| P1 | Login's flexible spacer pins register/reactivation links to the bottom. | Auth |
| P1 | Password and confirmation reveal toggles are coupled on registration, reset, and change-password forms. | Auth |
| P1 blocker | Registration cannot link to approved Terms/Privacy documents because no document or approved URL exists in the repository. Do not invent legal text or URLs. | Waiting for approved document URLs; continue other work. |
| P1 | Add Device starts LAN and BLE together and also exposes a separate BLE action. BLE itself is experimental and read-only. | Devices |
| P1 | Energy planning needs clearer responsibilities and navigation while avoiding duplicate administrative controls. | Energy: keep Reports general, Tariffs and New Tariff separate, and Goals dedicated. |
| P1 | Profile no longer displays the real role; Help/About/Personal Info routes are not linked from the current UI. | Profile/Settings and Secondary screens |
| P2 | Help has stale instructions and a non-contact support alert; About uses hardcoded version/status; local copy across secondary screens is not consistently localized. | Secondary screens |
| P2 | Some screens still use bespoke navigation/button rows despite shared components. Consolidate only repeated patterns and retain screen-specific layouts. | Design system, then incremental screen phases |
| P2 | Device and small-screen appearance needs physical Android review; no screenshots were supplied with this brief. | Final QA |

The implementation sequence is: (1) design system, (2) authentication, (3) devices, (4) energy, (5) Profile/Settings, (6) secondary screens, and (7) regression/accessibility/build verification. Each phase should use an English branch/commit and an independent, reviewable PR. Phase dependencies may be stacked; none will be merged automatically.

## Current phase changes

Phase 1 sets Emerald as the default brand palette, updates the app-theme/auth-theme fallbacks to the same default, and aligns the native/animated splash background. Classic remains available and saved palette choices continue to load normally. No backend or pairing behavior changes are included.

Phase 4 keeps the agreed screen separation: Reports remains the general consumption, chart, ranking, statistics, and export panel; its planning summary links to dedicated Tariffs and Goals screens; tariff registration remains a separate screen. Tariffs now highlights the effective tariff and explains empty/no-current states. Goals has a dedicated unconfigured state, OWNER-only editing, and a synchronous save guard. Period data refreshes on focus, progress accepts only valid nonnegative percentages, and query keys include the home role to avoid showing cached OWNER results after an access-role change. SQL034 service endpoints and contracts remain unchanged.

## Outstanding verification

### Phase 1 validation

- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:mobile-config`: 6 passed.
- `npm.cmd run test:navigation-auth`: 6 passed.
- `npm.cmd run test:alerts`: 10 passed.
- `npm.cmd run test:realtime-device-status`: 9 passed.
- `npm.cmd run test:energy-sql034`: 11 passed.
- `npm.cmd run test:shelly-mqtt-pairing`: 18 passed.
- `node scripts/device-presentation.test.js`: 3 passed.
- `node scripts/profile-settings-actions.test.mjs`: 2 passed.
- `node scripts/language-preferences.test.mjs`: 3 passed.
- `git diff --check`: passed.
- **Total: 68 tests passed.**

`npm.cmd run test:shelly-ble-rpc` remains blocked because its test double omits the `onDeviceDisconnected` callback that `shelly-gatt-rpc.ts` registers. The product BLE adapter and fixture were not changed in these UI phases; correct the fixture separately without weakening production BLE behavior.

Android/iOS export or build, visual device checks, approved legal-document URLs, and final per-phase PR links remain pending. Do not describe the application as production-certified before the real integration, security, and device checks pass.

### Phase 4 validation

- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:mobile-config`: 6 passed.
- `npm.cmd run test:navigation-auth`: 6 passed.
- `npm.cmd run test:alerts`: 10 passed.
- `npm.cmd run test:realtime-device-status`: 9 passed.
- `npm.cmd run test:energy-sql034`: 11 passed, including zero, malformed, negative, and non-finite usage percentages.
- `npm.cmd run test:shelly-mqtt-pairing`: 18 passed; integration code was not changed.
- `node scripts/device-presentation.test.js`: 3 passed. The repository has no `test:device-presentation` npm script.
- `node scripts/profile-settings-actions.test.mjs`: 2 passed.
- `node scripts/language-preferences.test.mjs`: 3 passed.
- `git diff --check`: passed.
- `npm.cmd run test:shelly-ble-rpc`: blocked by the existing test double missing `onDeviceDisconnected`; no BLE implementation or fixture changes are included in this phase.
- **68 tests passed; the unrelated BLE suite did not complete.**

The Phase 4 Android/iOS visual review and export/build remain pending. No device screenshots were produced.
