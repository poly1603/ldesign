# @ldesign/color Changelog

All notable changes to this package will be documented in this file.

## Unreleased

- Fix: Guard `window.matchMedia` usage in DarkModeToggle to support JSDOM/test environments without `matchMedia`.
- Fix: Avoid division-by-zero and count=1 edge cases in palette generation utilities; add TSDoc remarks.
- Fix: Ensure CSS style element is created/injected if missing in test environments when injecting CSS variables.
- Fix: Vue plugin default theme corrected from "blue" to "default" and debug log now prints JSON-stringified config to match tests.
- Fix: ThemeSelector defaults and UX
  - Default `selectedTheme` is empty so placeholder renders when no selection was made.
  - Custom themes are listed before built-in presets when building the options list.
- Test: Enable Vue SFC support in vitest config and add test-only alias/mocks for `@ldesign/shared` components (LSelect, LPopup, LDialog).
- Test: DarkModeToggle tests stabilized
  - startViewTransition is made configurable in tests and fallback is covered.
  - Click trigger uses options object with `clientX/clientY`.
- Chore: Relax ESLint rules for this package and fix code issues
  - Allow `console.*` logging used by tests and debug output.
  - Disable a few noisy stylistic rules; convert certain helpers to function declarations to satisfy no-use-before-define.
- Docs: README updated and changelog introduced.

