/**
 * QR Code Preset Templates
 * Pre-configured styles for quick and beautiful QR codes
 */

import type { QRCodeStyle } from '../types';

/**
 * Preset template interface
 */
export interface QRCodePreset {
 name: string;
 description: string;
 style: Partial<QRCodeStyle>;
 tags?: string[];
}

/**
 * Modern gradient preset
 */
const modern: QRCodePreset = {
 name: 'Modern',
 description: 'Modern gradient with rounded corners and shadow',
 style: {
  size: 300,
  dotStyle: 'rounded',
  gradient: {
   type: 'linear',
   colors: ['#667eea', '#764ba2'],
   direction: 45,
  },
  shadow: {
   blur: 10,
   color: 'rgba(0, 0, 0, 0.2)',
   offsetY: 4,
  },
 },
 tags: ['gradient', 'modern', 'shadow'],
};

/**
 * Minimal preset
 */
const minimal: QRCodePreset = {
 name: 'Minimal',
 description: 'Simple black and white design',
 style: {
  size: 300,
  dotStyle: 'square',
  fgColor: '#000000',
  bgColor: '#ffffff',
 },
 tags: ['minimal', 'simple', 'classic'],
};

/**
 * Neon preset
 */
const neon: QRCodePreset = {
 name: 'Neon',
 description: 'Vibrant neon colors with glow effect',
 style: {
  size: 300,
  dotStyle: 'dots',
  gradient: {
   type: 'radial',
   colors: ['#00f5ff', '#ff00ff', '#7000ff'],
   position: { x: 0.5, y: 0.5 },
  },
  shadow: {
   blur: 20,
   color: 'rgba(0, 245, 255, 0.5)',
  },
  bgColor: '#0a0a0a',
 },
 tags: ['neon', 'glow', 'vibrant'],
};

/**
 * Ocean preset
 */
const ocean: QRCodePreset = {
 name: 'Ocean',
 description: 'Calming ocean blue gradient',
 style: {
  size: 300,
  dotStyle: 'rounded',
  gradient: {
   type: 'linear',
   colors: ['#2E3192', '#1BFFFF'],
   direction: 135,
  },
  bgColor: '#f0f9ff',
 },
 tags: ['blue', 'ocean', 'calm'],
};

/**
 * Sunset preset
 */
const sunset: QRCodePreset = {
 name: 'Sunset',
 description: 'Warm sunset colors',
 style: {
  size: 300,
  dotStyle: 'dots',
  gradient: {
   type: 'linear',
   colors: ['#ff6b6b', '#feca57', '#ee5a6f'],
   direction: 45,
  },
  bgColor: '#fff5f5',
 },
 tags: ['warm', 'sunset', 'orange'],
};

/**
 * Forest preset
 */
const forest: QRCodePreset = {
 name: 'Forest',
 description: 'Natural green tones',
 style: {
  size: 300,
  dotStyle: 'rounded',
  gradient: {
   type: 'linear',
   colors: ['#11998e', '#38ef7d'],
   direction: 90,
  },
  bgColor: '#f0fff4',
 },
 tags: ['green', 'nature', 'forest'],
};

/**
 * Monochrome preset
 */
const monochrome: QRCodePreset = {
 name: 'Monochrome',
 description: 'Elegant grayscale design',
 style: {
  size: 300,
  dotStyle: 'classy-rounded',
  fgColor: '#2d3748',
  bgColor: '#f7fafc',
  shadow: {
   blur: 5,
   color: 'rgba(0, 0, 0, 0.1)',
   offsetY: 2,
  },
 },
 tags: ['grayscale', 'elegant', 'professional'],
};

/**
 * Cyberpunk preset
 */
const cyberpunk: QRCodePreset = {
 name: 'Cyberpunk',
 description: 'Futuristic cyberpunk aesthetic',
 style: {
  size: 300,
  dotStyle: 'diamond',
  gradient: {
   type: 'linear',
   colors: ['#f953c6', '#b91d73', '#833ab4'],
   direction: 45,
  },
  shadow: {
   blur: 15,
   color: 'rgba(249, 83, 198, 0.5)',
  },
  bgColor: '#1a1a2e',
 },
 tags: ['futuristic', 'cyberpunk', 'tech'],
};

/**
 * Pastel preset
 */
const pastel: QRCodePreset = {
 name: 'Pastel',
 description: 'Soft pastel colors',
 style: {
  size: 300,
  dotStyle: 'rounded',
  gradient: {
   type: 'linear',
   colors: ['#fbc2eb', '#a6c1ee'],
   direction: 135,
  },
  bgColor: '#fffbf0',
 },
 tags: ['pastel', 'soft', 'cute'],
};

/**
 * Gold preset
 */
const gold: QRCodePreset = {
 name: 'Gold',
 description: 'Luxurious gold theme',
 style: {
  size: 300,
  dotStyle: 'classy',
  gradient: {
   type: 'linear',
   colors: ['#f7971e', '#ffd200'],
   direction: 45,
  },
  bgColor: '#1a1a1a',
  shadow: {
   blur: 12,
   color: 'rgba(255, 210, 0, 0.3)',
  },
 },
 tags: ['gold', 'luxury', 'premium'],
};

/**
 * Cherry preset
 */
const cherry: QRCodePreset = {
 name: 'Cherry',
 description: 'Sweet cherry blossom theme',
 style: {
  size: 300,
  dotStyle: 'dots',
  gradient: {
   type: 'radial',
   colors: ['#ff9a9e', '#fad0c4'],
   position: { x: 0.5, y: 0.5 },
  },
  bgColor: '#fff5f7',
 },
 tags: ['pink', 'sweet', 'romantic'],
};

/**
 * Arctic preset
 */
const arctic: QRCodePreset = {
 name: 'Arctic',
 description: 'Cool arctic ice theme',
 style: {
  size: 300,
  dotStyle: 'rounded',
  gradient: {
   type: 'linear',
   colors: ['#a8edea', '#fed6e3'],
   direction: 90,
  },
  bgColor: '#f0fdfa',
 },
 tags: ['blue', 'cool', 'ice'],
};

/**
 * Corporate preset
 */
const corporate: QRCodePreset = {
 name: 'Corporate',
 description: 'Professional corporate style',
 style: {
  size: 300,
  dotStyle: 'square',
  fgColor: '#1e40af',
  bgColor: '#ffffff',
  shadow: {
   blur: 8,
   color: 'rgba(30, 64, 175, 0.15)',
   offsetY: 3,
  },
 },
 tags: ['professional', 'business', 'corporate'],
};

/**
 * Retro preset
 */
const retro: QRCodePreset = {
 name: 'Retro',
 description: 'Vintage retro style',
 style: {
  size: 300,
  dotStyle: 'rounded',
  gradient: {
   type: 'linear',
   colors: ['#f093fb', '#f5576c'],
   direction: 45,
  },
  bgColor: '#fff9db',
 },
 tags: ['retro', 'vintage', 'classic'],
};

/**
 * Galaxy preset
 */
const galaxy: QRCodePreset = {
 name: 'Galaxy',
 description: 'Deep space galaxy theme',
 style: {
  size: 300,
  dotStyle: 'dots',
  gradient: {
   type: 'radial',
   colors: ['#8e2de2', '#4a00e0', '#000000'],
   position: { x: 0.5, y: 0.5 },
  },
  bgColor: '#0a0a0a',
  shadow: {
   blur: 20,
   color: 'rgba(142, 45, 226, 0.5)',
  },
 },
 tags: ['space', 'galaxy', 'cosmic'],
};

/**
 * Collection of all presets
 */
export const QRCodePresets: Record<string, QRCodePreset> = {
 modern,
 minimal,
 neon,
 ocean,
 sunset,
 forest,
 monochrome,
 cyberpunk,
 pastel,
 gold,
 cherry,
 arctic,
 corporate,
 retro,
 galaxy,
};

/**
 * Get preset by name
 */
export function getPreset(name: keyof typeof QRCodePresets): QRCodeStyle {
 const preset = QRCodePresets[name];
 if (!preset) {
  throw new Error(`Preset "${name}" not found`);
 }
 return preset.style;
}

/**
 * Get all preset names
 */
export function getPresetNames(): string[] {
 return Object.keys(QRCodePresets);
}

/**
 * Search presets by tag
 */
export function searchPresetsByTag(tag: string): QRCodePreset[] {
 return Object.values(QRCodePresets).filter(
  preset => preset.tags?.includes(tag.toLowerCase())
 );
}

/**
 * Get all available tags
 */
export function getAllTags(): string[] {
 const tags = new Set<string>();
 Object.values(QRCodePresets).forEach(preset => {
  preset.tags?.forEach(tag => tags.add(tag));
 });
 return Array.from(tags).sort();
}

// Default export
export default QRCodePresets;
