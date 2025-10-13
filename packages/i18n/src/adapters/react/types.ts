/**
 * Type definitions for React i18n adapter
 */

import type { ReactNode } from 'react';
import type { I18nInstance, Locale, MessageKey, InterpolationParams } from '../../types';

export interface ReactI18nInstance extends I18nInstance {
  // React-specific methods
}

export interface I18nProviderProps {
  i18n: I18nInstance;
  children: ReactNode;
}

export interface UseI18nOptions {
  namespace?: string;
}

export interface UseTranslationReturn {
  t: (key: MessageKey, params?: InterpolationParams) => string;
  i18n: I18nInstance;
  ready: boolean;
}