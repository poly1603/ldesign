/**
 * @ldesign/size - Tablet Presets
 * 
 * Size presets optimized for tablet devices
 */

import type { Preset } from './types';

/**
 * Tablet portrait preset
 */
export const tabletPortrait: Preset = {
  metadata: {
    name: 'tablet-portrait',
    label: '平板竖屏',
    description: '适用于平板竖屏模式的尺寸预设',
    category: 'device',
    tags: ['tablet', 'portrait', 'medium'],
    icon: '📱'
  },
  scheme: {
    name: 'tablet-portrait',
    description: 'Tablet portrait mode preset',
    
    fontSize: {
      tiny: '0.75rem',
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      huge: '1.25rem',
      giant: '1.5rem',
      
      h1: '2rem',
      h2: '1.75rem',
      h3: '1.5rem',
      h4: '1.25rem',
      h5: '1.125rem',
      h6: '1rem',
      
      display1: '2.5rem',
      display2: '2.25rem',
      display3: '2rem',
      
      caption: '0.8125rem',
      overline: '0.75rem',
      code: '0.875rem'
    },
    
    spacing: {
      none: '0',
      tiny: '0.25rem',
      small: '0.5rem',
      medium: '0.875rem',
      large: '1.25rem',
      huge: '1.75rem',
      giant: '2.5rem',
      
      massive: '3.5rem',
      colossal: '4.5rem'
    },
    
    radius: {
      none: '0',
      small: '0.25rem',
      medium: '0.375rem',
      large: '0.625rem',
      huge: '1rem',
      full: '9999px',
      circle: '50%'
    },
    
    lineHeight: {
      none: 1.0,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 1.875
    },
    
    letterSpacing: {
      tighter: '-0.04em',
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
      wider: '0.04em',
      widest: '0.08em'
    },
    
    components: {
      button: {
        tiny: { height: '2rem', padding: '0 0.875rem', fontSize: '0.875rem' },
        small: { height: '2.5rem', padding: '0 1.125rem', fontSize: '0.9375rem' },
        medium: { height: '3rem', padding: '0 1.5rem', fontSize: '1rem' },
        large: { height: '3.5rem', padding: '0 1.875rem', fontSize: '1.125rem' },
        huge: { height: '4rem', padding: '0 2.25rem', fontSize: '1.25rem' }
      },
      
      input: {
        small: { height: '2.5rem', padding: '0.5rem 0.875rem', fontSize: '0.9375rem' },
        medium: { height: '3rem', padding: '0.625rem 1.125rem', fontSize: '1rem' },
        large: { height: '3.5rem', padding: '0.875rem 1.375rem', fontSize: '1.125rem' }
      },
      
      icon: {
        tiny: '1rem',
        small: '1.25rem',
        medium: '1.625rem',
        large: '2rem',
        huge: '2.5rem',
        giant: '3.25rem'
      },
      
      avatar: {
        tiny: '2rem',
        small: '2.5rem',
        medium: '3rem',
        large: '3.75rem',
        huge: '4.75rem',
        giant: '6rem'
      },
      
      card: {
        small: '0.875rem',
        medium: '1.25rem',
        large: '1.75rem'
      }
    },
    
    grid: {
      columns: 8,
      gutter: '1.25rem',
      margin: '1.25rem'
    },
    
    breakpoints: {
      xs: '576px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1440px'
    }
  }
};

/**
 * Tablet landscape preset
 */
export const tabletLandscape: Preset = {
  metadata: {
    name: 'tablet-landscape',
    label: '平板横屏',
    description: '适用于平板横屏模式的尺寸预设',
    category: 'device',
    tags: ['tablet', 'landscape', 'wide'],
    icon: '📱'
  },
  scheme: {
    name: 'tablet-landscape',
    description: 'Tablet landscape mode preset',
    
    fontSize: {
      tiny: '0.8125rem',
      small: '0.9375rem',
      medium: '1.0625rem',
      large: '1.1875rem',
      huge: '1.375rem',
      giant: '1.625rem',
      
      h1: '2.25rem',
      h2: '1.875rem',
      h3: '1.625rem',
      h4: '1.375rem',
      h5: '1.1875rem',
      h6: '1.0625rem',
      
      display1: '3rem',
      display2: '2.625rem',
      display3: '2.25rem',
      
      caption: '0.875rem',
      overline: '0.8125rem',
      code: '0.9375rem'
    },
    
    spacing: {
      none: '0',
      tiny: '0.25rem',
      small: '0.5rem',
      medium: '1rem',
      large: '1.5rem',
      huge: '2rem',
      giant: '3rem',
      
      massive: '4rem',
      colossal: '5rem'
    },
    
    radius: {
      none: '0',
      small: '0.25rem',
      medium: '0.5rem',
      large: '0.75rem',
      huge: '1.125rem',
      full: '9999px',
      circle: '50%'
    },
    
    lineHeight: {
      none: 1.0,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 1.875
    },
    
    letterSpacing: {
      tighter: '-0.04em',
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
      wider: '0.04em',
      widest: '0.08em'
    },
    
    components: {
      button: {
        tiny: { height: '2.25rem', padding: '0 1rem', fontSize: '0.9375rem' },
        small: { height: '2.625rem', padding: '0 1.25rem', fontSize: '1rem' },
        medium: { height: '3.125rem', padding: '0 1.625rem', fontSize: '1.0625rem' },
        large: { height: '3.625rem', padding: '0 2rem', fontSize: '1.1875rem' },
        huge: { height: '4.25rem', padding: '0 2.5rem', fontSize: '1.375rem' }
      },
      
      input: {
        small: { height: '2.625rem', padding: '0.625rem 1rem', fontSize: '1rem' },
        medium: { height: '3.125rem', padding: '0.75rem 1.25rem', fontSize: '1.0625rem' },
        large: { height: '3.625rem', padding: '0.9375rem 1.5rem', fontSize: '1.1875rem' }
      },
      
      icon: {
        tiny: '1.125rem',
        small: '1.375rem',
        medium: '1.75rem',
        large: '2.125rem',
        huge: '2.625rem',
        giant: '3.5rem'
      },
      
      avatar: {
        tiny: '2.25rem',
        small: '2.75rem',
        medium: '3.25rem',
        large: '4rem',
        huge: '5.25rem',
        giant: '7rem'
      },
      
      card: {
        small: '1rem',
        medium: '1.5rem',
        large: '2rem'
      }
    },
    
    grid: {
      columns: 12,
      gutter: '1.5rem',
      margin: '1.5rem'
    },
    
    breakpoints: {
      xs: '576px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1440px',
      xxl: '1920px'
    }
  }
};