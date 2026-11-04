# Secondary Screens Review

**Branch:** `feature/mobile-secondary-screens`
**Base:** `feature/mobile-profile-settings`
**Review scope:** Help, About, Personal Info, Favorites, Invitations, Account Security, Close Sessions, and not-found recovery.

## Changes

- Help now describes the current home, LAN discovery, read-only BLE, alerts, and appearance flows. The inactive “Contact support” button was replaced with a clear note that no contact channel is connected. Copy and FAQs are available in Spanish, English, and Portuguese.
- About reads the app version from Expo config and identifies the native platform. The hard-coded version, generic platform string, and unsupported “Beta” status were removed.
- Personal Info uses the authenticated session role, translated labels, safe fallbacks for missing name/email, and an accessible close control.
- Favorites has one home-opening target per card; the duplicate chevron action was removed. Favorite removal has a 44 dp target, a synchronous request lock, a pending indicator, and a clear retry message.
- Invitations displays the API-provided home name instead of its internal ID, localizes roles and outcomes, prevents duplicate responses with a synchronous lock, and ignores stale list responses after focus changes.
- Account Security distinguishes one disconnected device from multiple devices and preserves the partial-data state. Close Sessions keeps its destructive confirmation and request lock while using translated, explicit result messages.
- Not-found recovery respects safe areas, uses a 44 dp home action, and presents localized copy.

## Preserved behavior

No authentication or home-service contracts changed. The Shelly setup and preparation screens, LAN discovery, BLE RPC, MQTT, backend, and database were not modified. Help describes BLE as experimental and read-only; it does not claim BLE pairing is available.

## Validation

- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:mobile-config`: 6 passed.
- `npm.cmd run test:navigation-auth`: 6 passed.
- `npm.cmd run test:alerts`: 10 passed.
- `npm.cmd run test:realtime-device-status`: 9 passed.
- `node scripts/profile-settings-actions.test.mjs`: 2 passed.
- `node scripts/language-preferences.test.mjs`: 3 passed.
- `node scripts/device-presentation.test.js`: 3 passed.
- `git diff --check`: passed.
- **Total: 39 tests passed.**

Manual Android/iOS visual review and device testing remain pending. A real support channel and approved Terms/Privacy URLs are not available; the UI does not invent either.
