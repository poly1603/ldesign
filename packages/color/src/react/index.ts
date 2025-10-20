/**
 * React Integration
 * 
 * This file provides React-specific exports for @ldesign/color
 * 
 * Note: React must be installed as a peer dependency
 */

// Export ThemeModeSwitcher component
export { ReactThemeModeSwitcher as ThemeModeSwitcher } from './ReactThemeModeSwitcher';
export type { ThemeMode, ReactThemeModeSwitcherProps as ThemeModeSwitcherProps } from './ReactThemeModeSwitcher';
export { ThemePicker } from './ThemePicker';
export type { ThemePickerProps } from './ThemePicker';

export { ThemeProvider, useTheme, useThemeContext } from './useTheme';
export type { ThemeProviderProps, UseThemeOptions } from './useTheme';
