/**
 * I18nText component for React
 */

import React from 'react';
import { useI18n } from '../hooks/useI18n';
import type { MessageKey, InterpolationParams } from '../../../types';

export interface I18nTextProps {
  keypath: MessageKey;
  params?: InterpolationParams;
  tag?: keyof JSX.IntrinsicElements;
  locale?: string;
  defaultValue?: string;
  className?: string;
}

export function I18nText({ 
  keypath, 
  params, 
  tag = 'span',
  locale,
  defaultValue,
  className
}: I18nTextProps) {
  const { t } = useI18n();
  
  const translated = t(keypath, {
    params,
    locale,
    defaultValue
  });
  
  const Tag = tag;
  
  return <Tag className={className}>{translated}</Tag>;
}