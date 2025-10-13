/**
 * @ldesign/i18n React Adapter
 * Complete React integration with Provider, hooks, and components
 */

import React from 'react';
import type { I18nConfig, I18nInstance } from '../../types';
import { OptimizedI18n } from '../../core/i18n-optimized';

// Export Provider and Context
export { I18nProvider, I18nContext } from './I18nProvider';

// Export hooks
export { useI18n } from './hooks/useI18n';
export { useTranslation } from './hooks/useTranslation';
export { useLocale } from './hooks/useLocale';
export { useI18nAsync } from './hooks/useI18nAsync';

// Export components
export { Trans } from './components/Trans';
export { I18nText } from './components/I18nText';
export { I18nNumber } from './components/I18nNumber';
export { I18nDate } from './components/I18nDate';
export { I18nTime } from './components/I18nTime';
export { I18nPlural } from './components/I18nPlural';
export { LocaleSwitcher } from './components/LocaleSwitcher';

// Export HOCs
export { withI18n } from './hocs/withI18n';
export { withTranslation } from './hocs/withTranslation';

// Export types
export * from './types';

// Export utilities
export { createI18n } from './utils/createI18n';
export { defineMessages } from './utils/defineMessages';

// Quick setup function for React apps
export function setupI18n(config?: I18nConfig): I18nInstance {
  const i18n = new OptimizedI18n(config);
  
  // Initialize
  i18n.init().catch(console.error);
  
  return i18n;
}