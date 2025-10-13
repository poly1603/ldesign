/**
 * LocaleSwitcher component for React
 */

import React, { ChangeEvent } from 'react';
import { useI18n } from '../hooks/useI18n';

export interface LocaleSwitcherProps {
  displayNames?: Record<string, string>;
  className?: string;
  style?: React.CSSProperties;
}

const defaultDisplayNames = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'en-US': 'English',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
  'fr-FR': 'Français',
  'de-DE': 'Deutsch',
  'es-ES': 'Español'
};

export function LocaleSwitcher({ 
  displayNames = defaultDisplayNames,
  className = 'locale-switcher',
  style
}: LocaleSwitcherProps) {
  const { locale, availableLocales, setLocale } = useI18n();

  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    await setLocale(event.target.value);
  };

  const getLocaleName = (loc: string): string => {
    return displayNames[loc] || loc;
  };

  return (
    <select 
      value={locale}
      onChange={handleChange}
      className={className}
      style={{
        padding: '0.5rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        ...style
      }}
    >
      {availableLocales.map(loc => (
        <option key={loc} value={loc}>
          {getLocaleName(loc)}
        </option>
      ))}
    </select>
  );
}