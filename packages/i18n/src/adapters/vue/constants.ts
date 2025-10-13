/**
 * Constants for Vue i18n adapter
 */

import type { InjectionKey } from 'vue';
import type { I18nInstance } from '../../types';

// Injection keys
export const I18N_SYMBOL = Symbol('i18n') as InjectionKey<I18nInstance>;
export const I18N_INJECTION_KEY = I18N_SYMBOL; // Main injection key
export const i18nSymbol = I18N_SYMBOL; // Alias for compatibility

// Default options
export const DEFAULT_LOCALE = 'en-US';
export const DEFAULT_FALLBACK_LOCALE = 'en';

// Component names
export const COMPONENT_PREFIX = 'I18n';

// Directive names
export const DIRECTIVE_PREFIX = 'v-t';