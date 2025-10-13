/**
 * Trans component for React
 * Support interpolation with React components
 */

import React, { ReactNode } from 'react';
import { useI18n } from '../hooks/useI18n';
import type { MessageKey, InterpolationParams } from '../../../types';

export interface TransProps {
  keypath: MessageKey;
  params?: InterpolationParams;
  components?: Record<string, React.ComponentType<any>>;
  tag?: keyof JSX.IntrinsicElements;
  children?: (translated: string) => ReactNode;
}

export function Trans({ 
  keypath, 
  params, 
  components = {},
  tag = 'span',
  children
}: TransProps) {
  const { t } = useI18n();
  
  const translated = t(keypath, params);
  
  // If children is a function, call it with translated text
  if (typeof children === 'function') {
    return <>{children(translated)}</>;
  }
  
  // Parse and replace component placeholders
  const parts = parseTranslation(translated, components);
  
  const Tag = tag;
  
  return <Tag>{parts}</Tag>;
}

function parseTranslation(
  text: string, 
  components: Record<string, React.ComponentType<any>>
): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /<(\w+)>(.*?)<\/\1>/g;
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    const [fullMatch, componentName, content] = match;
    const Component = components[componentName];
    
    if (Component) {
      parts.push(
        <Component key={match.index}>
          {content}
        </Component>
      );
    } else {
      // If component not found, add as text
      parts.push(fullMatch);
    }
    
    lastIndex = match.index + fullMatch.length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts;
}