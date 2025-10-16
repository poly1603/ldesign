# Internationalization Fixes Summary

## Issues Fixed

### 1. Hardcoded Chinese aria-labels in SizeSelector.vue
**Problem:** The SizeSelector component had hardcoded Chinese text in aria-labels, which didn't respond to language changes.

**Fix:** Replaced hardcoded strings with reactive translations:
- Line 8: `aria-label="调整尺寸"` → `:aria-label="t.ariaLabel"`
- Line 25: `aria-label="关闭"` → `:aria-label="t.close"`

### 2. Incorrect locale change event handling in main.ts
**Problem:** The `localeChanged` event handler was incorrectly treating the event parameter as a string, when it's actually an object `{ locale: string }`.

**Before:**
```typescript
i18n.on('localeChanged', (newLocale: string) => {
  globalLocale.value = newLocale
  ...
})
```

**After:**
```typescript
i18n.on('localeChanged', ({ locale }: { locale: string }) => {
  globalLocale.value = locale
  ...
})
```

**Root Cause:** The i18n engine emits events with an object payload (see `packages/i18n/src/engine.ts` line 60), but the handler was expecting a direct string parameter.

### 3. Added debug logging
Added development-only console logging to track locale changes:
```typescript
if (import.meta.env.DEV) {
  console.log('[i18n] Global locale updated:', locale)
}
```

## How It Works Now

1. User switches language (e.g., Chinese → English)
2. i18n engine fires `localeChanged` event with `{ locale: 'en-US' }`
3. Event handler in main.ts correctly destructures and updates `globalLocale.value`
4. `globalLocale` is a reactive ref provided to all components via `app.provide('app-locale', globalLocale)`
5. ThemePicker and SizeSelector components inject this ref via `inject('app-locale')`
6. Component computed properties reactively access `appLocale.value`
7. `getLocale(currentLocale.value)` returns the appropriate translation object (enUS or zhCN)
8. Templates automatically update with translated text

## Files Modified

1. `packages/size/src/vue/SizeSelector.vue` - Fixed aria-labels
2. `packages/color/src/vue/ThemePicker.vue` - Already correct, no changes needed
3. `app_simple/src/main.ts` - Fixed event handler and added debug logging

## Testing

To verify the fix works:
1. Run the app in development mode
2. Open browser console
3. Switch language using the LocaleSwitcher component
4. You should see: `[i18n] Global locale updated: en-US` (or zh-CN)
5. Theme picker and size selector should immediately show text in the selected language
6. Aria-labels should also update (check with screen reader or inspect element)

## Translation Keys

### Size Selector (packages/size/src/locales/index.ts)
- `title`: Panel title
- `close`: Close button label
- `ariaLabel`: Main button aria-label
- `presets.*`: Preset names
- `descriptions.*`: Preset descriptions

### Theme Picker (packages/color/src/locales/index.ts)
- `theme.selectThemeColor`: Section title
- `theme.customColor`: Custom color label
- `theme.apply`: Apply button
- `theme.addCustomTheme`: Add theme section
- `theme.themeName`: Theme name input placeholder
- `theme.add`: Add button
- `theme.remove`: Remove button
- `theme.searchPlaceholder`: Search input placeholder
- `theme.presets.*`: Preset theme names

All translation keys are available in both `zhCN` and `enUS` objects.
