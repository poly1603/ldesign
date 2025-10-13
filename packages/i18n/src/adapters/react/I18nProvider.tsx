/**
 * I18n Provider for React
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { I18nInstance, Locale } from '../../types';

interface I18nContextValue {
  i18n: I18nInstance;
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export interface I18nProviderProps {
  i18n: I18nInstance;
  children: ReactNode;
}

export function I18nProvider({ i18n, children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState(i18n.locale);

  // Sync locale changes
  useEffect(() => {
    const unsubscribe = i18n.on('localeChanged', ({ locale: newLocale }) => {
      setLocaleState(newLocale);
    });

    return unsubscribe;
  }, [i18n]);

  const setLocale = async (newLocale: Locale) => {
    await i18n.setLocale(newLocale);
    setLocaleState(newLocale);
  };

  const value: I18nContextValue = {
    i18n,
    locale,
    setLocale
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18nContext(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return context;
}