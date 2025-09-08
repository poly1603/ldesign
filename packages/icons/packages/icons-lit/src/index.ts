export { HeartIconIcon } from './HeartIconIcon.ts';
export { HomeIconIcon } from './HomeIconIcon.ts';
export { SearchIconIcon } from './SearchIconIcon.ts';
export { SettingsIconIcon } from './SettingsIconIcon.ts';
export { UserIconIcon } from './UserIconIcon.ts';

// Re-export all icon classes
export * from './types.js';

// Augment global HTMLElementTagNameMap
declare global {
  interface HTMLElementTagNameMap {
  'heart-icon-icon': typeof import('./HeartIconIcon.ts').HeartIconIcon;
  'home-icon-icon': typeof import('./HomeIconIcon.ts').HomeIconIcon;
  'search-icon-icon': typeof import('./SearchIconIcon.ts').SearchIconIcon;
  'settings-icon-icon': typeof import('./SettingsIconIcon.ts').SettingsIconIcon;
  'user-icon-icon': typeof import('./UserIconIcon.ts').UserIconIcon;
  }
}
