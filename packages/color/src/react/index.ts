/**
 * React Integration
 * 
 * This file provides React-specific exports for @ldesign/color
 * 
 * Note: React must be installed as a peer dependency
 */

export { useTheme, ThemeProvider, useThemeContext } from './useTheme';
export type { UseThemeOptions, ThemeProviderProps } from './useTheme';
export { ThemePicker } from './ThemePicker';
export type { ThemePickerProps } from './ThemePicker';

// Export ThemeModeSwitcher component
export { ReactThemeModeSwitcher as ThemeModeSwitcher } from './ReactThemeModeSwitcher';
export type { ReactThemeModeSwitcherProps as ThemeModeSwitcherProps, ThemeMode } from './ReactThemeModeSwitcher';
