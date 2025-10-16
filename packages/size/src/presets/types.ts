/**
 * @ldesign/size - Preset Types
 * 
 * Common types for preset system
 */

import type { SizeScheme } from '../types';

/**
 * Preset metadata
 */
export interface PresetMetadata {
  name: string;
  label: string;
  description: string;
  category: 'device' | 'useCase' | 'accessibility' | 'custom';
  tags?: string[];
  icon?: string;
}

/**
 * Preset with metadata
 */
export interface Preset {
  metadata: PresetMetadata;
  scheme: SizeScheme | (() => SizeScheme);
}

/**
 * Preset registry
 */
export interface PresetRegistry {
  [key: string]: Preset;
}