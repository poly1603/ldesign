// Export Vue adapter
export * as Vue from './vue';
export { default as VueAdapter } from './vue';

// Export React adapter  
export * as React from './react';
export { default as ReactAdapter } from './react';

// Re-export commonly used types and interfaces
export type {
  QRCodeConfig,
  QRCodeStyle,
  ErrorCorrectionLevel,
  DotStyle,
} from '../types';
