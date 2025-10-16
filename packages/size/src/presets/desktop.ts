/**
 * @ldesign/size - Desktop Presets
 * 
 * Size presets optimized for desktop/laptop devices
 */

import type { Preset } from './types';

/**
 * Desktop compact preset - for dense UIs
 */
export const desktopCompact: Preset = {
  metadata: {
    name: 'desktop-compact',
    label: '桌面紧凑',
    description: '适用于信息密集的桌面应用',
    category: 'device',
    tags: ['desktop', 'compact', 'dense'],
    icon: '💻'
  },
  scheme: {
    name: 'desktop-compact',
    description: 'Compact desktop preset for dense information',
    
    fontSize: {
      tiny: '0.625rem',   // 10px
      small: '0.75rem',   // 12px
      medium: '0.875rem', // 14px
      large: '1rem',      // 16px
      huge: '1.125rem',   // 18px
      giant: '1.25rem',   // 20px
      
      h1: '1.75rem',
      h2: '1.5rem',
      h3: '1.25rem',
      h4: '1.125rem',
      h5: '1rem',
      h6: '0.875rem',
      
      display1: '2.25rem',
      display2: '2rem',
      display3: '1.75rem',
      
      caption: '0.6875rem',
      overline: '0.625rem',
      code: '0.8125rem'
    },
    
    spacing: {
      none: '0',
      tiny: '0.125rem',  // 2px
      small: '0.25rem',  // 4px
      medium: '0.375rem',// 6px
      large: '0.5rem',   // 8px
      huge: '0.75rem',   // 12px
      giant: '1rem',     // 16px
      
      massive: '1.5rem',
      colossal: '2rem'
    },
    
    radius: {
      none: '0',
      small: '0.125rem',
      medium: '0.1875rem',
      large: '0.25rem',
      huge: '0.375rem',
      full: '9999px',
      circle: '50%'
    },
    
    lineHeight: {
      none: 1.0,
      tight: 1.2,
      snug: 1.3,
      normal: 1.4,
      relaxed: 1.5,
      loose: 1.75
    },
    
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    },
    
    components: {
      button: {
        tiny: { height: '1.5rem', padding: '0 0.5rem', fontSize: '0.625rem' },
        small: { height: '1.75rem', padding: '0 0.625rem', fontSize: '0.75rem' },
        medium: { height: '2rem', padding: '0 0.875rem', fontSize: '0.875rem' },
        large: { height: '2.25rem', padding: '0 1rem', fontSize: '1rem' },
        huge: { height: '2.5rem', padding: '0 1.25rem', fontSize: '1.125rem' }
      },
      
      input: {
        small: { height: '1.75rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
        medium: { height: '2rem', padding: '0.375rem 0.625rem', fontSize: '0.875rem' },
        large: { height: '2.25rem', padding: '0.5rem 0.75rem', fontSize: '1rem' }
      },
      
      icon: {
        tiny: '0.75rem',
        small: '0.875rem',
        medium: '1rem',
        large: '1.25rem',
        huge: '1.5rem',
        giant: '2rem'
      },
      
      avatar: {
        tiny: '1.25rem',
        small: '1.5rem',
        medium: '2rem',
        large: '2.5rem',
        huge: '3rem',
        giant: '4rem'
      },
      
      card: {
        small: '0.5rem',
        medium: '0.75rem',
        large: '1rem'
      }
    },
    
    grid: {
      columns: 24,
      gutter: '0.5rem',
      margin: '0.5rem'
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

/**
 * Desktop normal preset - balanced sizing
 */
export const desktopNormal: Preset = {
  metadata: {
    name: 'desktop-normal',
    label: '桌面标准',
    description: '标准桌面应用尺寸',
    category: 'device',
    tags: ['desktop', 'normal', 'balanced'],
    icon: '🖥️'
  },
  scheme: {
    name: 'desktop-normal',
    description: 'Standard desktop preset',
    
    fontSize: {
      tiny: '0.75rem',
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      huge: '1.25rem',
      giant: '1.5rem',
      
      h1: '2.5rem',
      h2: '2rem',
      h3: '1.75rem',
      h4: '1.5rem',
      h5: '1.25rem',
      h6: '1.125rem',
      
      display1: '3.5rem',
      display2: '3rem',
      display3: '2.5rem',
      
      caption: '0.75rem',
      overline: '0.6875rem',
      code: '0.875rem'
    },
    
    spacing: {
      none: '0',
      tiny: '0.125rem',
      small: '0.25rem',
      medium: '0.5rem',
      large: '1rem',
      huge: '1.5rem',
      giant: '2rem',
      
      massive: '3rem',
      colossal: '4rem'
    },
    
    radius: {
      none: '0',
      small: '0.125rem',
      medium: '0.25rem',
      large: '0.5rem',
      huge: '0.75rem',
      full: '9999px',
      circle: '50%'
    },
    
    lineHeight: {
      none: 1.0,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2.0
    },
    
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    },
    
    components: {
      button: {
        tiny: { height: '1.75rem', padding: '0 0.75rem', fontSize: '0.75rem' },
        small: { height: '2rem', padding: '0 1rem', fontSize: '0.875rem' },
        medium: { height: '2.5rem', padding: '0 1.25rem', fontSize: '1rem' },
        large: { height: '3rem', padding: '0 1.75rem', fontSize: '1.125rem' },
        huge: { height: '3.5rem', padding: '0 2.25rem', fontSize: '1.25rem' }
      },
      
      input: {
        small: { height: '2rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
        medium: { height: '2.5rem', padding: '0.5rem 1rem', fontSize: '1rem' },
        large: { height: '3rem', padding: '0.75rem 1.25rem', fontSize: '1.125rem' }
      },
      
      icon: {
        tiny: '0.75rem',
        small: '1rem',
        medium: '1.25rem',
        large: '1.5rem',
        huge: '2rem',
        giant: '3rem'
      },
      
      avatar: {
        tiny: '1.5rem',
        small: '2rem',
        medium: '2.5rem',
        large: '3rem',
        huge: '4rem',
        giant: '6rem'
      },
      
      card: {
        small: '0.75rem',
        medium: '1rem',
        large: '1.5rem'
      }
    },
    
    grid: {
      columns: 12,
      gutter: '1rem',
      margin: '1rem'
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

/**
 * Desktop spacious preset - generous spacing
 */
export const desktopSpacious: Preset = {
  metadata: {
    name: 'desktop-spacious',
    label: '桌面宽松',
    description: '宽松舒适的桌面布局',
    category: 'device',
    tags: ['desktop', 'spacious', 'comfortable'],
    icon: '🖥️'
  },
  scheme: {
    name: 'desktop-spacious',
    description: 'Spacious desktop preset',
    
    fontSize: {
      tiny: '0.875rem',
      small: '1rem',
      medium: '1.125rem',
      large: '1.25rem',
      huge: '1.5rem',
      giant: '1.75rem',
      
      h1: '3rem',
      h2: '2.5rem',
      h3: '2rem',
      h4: '1.75rem',
      h5: '1.5rem',
      h6: '1.25rem',
      
      display1: '4rem',
      display2: '3.5rem',
      display3: '3rem',
      
      caption: '0.875rem',
      overline: '0.75rem',
      code: '1rem'
    },
    
    spacing: {
      none: '0',
      tiny: '0.25rem',
      small: '0.5rem',
      medium: '0.875rem',
      large: '1.5rem',
      huge: '2.25rem',
      giant: '3rem',
      
      massive: '4.5rem',
      colossal: '6rem'
    },
    
    radius: {
      none: '0',
      small: '0.25rem',
      medium: '0.5rem',
      large: '0.75rem',
      huge: '1rem',
      full: '9999px',
      circle: '50%'
    },
    
    lineHeight: {
      none: 1.0,
      tight: 1.3,
      snug: 1.4,
      normal: 1.6,
      relaxed: 1.75,
      loose: 2.0
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
        tiny: { height: '2.25rem', padding: '0 1rem', fontSize: '0.875rem' },
        small: { height: '2.75rem', padding: '0 1.375rem', fontSize: '1rem' },
        medium: { height: '3.25rem', padding: '0 1.75rem', fontSize: '1.125rem' },
        large: { height: '3.75rem', padding: '0 2.25rem', fontSize: '1.25rem' },
        huge: { height: '4.25rem', padding: '0 2.75rem', fontSize: '1.5rem' }
      },
      
      input: {
        small: { height: '2.75rem', padding: '0.625rem 1rem', fontSize: '1rem' },
        medium: { height: '3.25rem', padding: '0.75rem 1.375rem', fontSize: '1.125rem' },
        large: { height: '3.75rem', padding: '0.875rem 1.75rem', fontSize: '1.25rem' }
      },
      
      icon: {
        tiny: '1rem',
        small: '1.25rem',
        medium: '1.625rem',
        large: '2rem',
        huge: '2.5rem',
        giant: '3.5rem'
      },
      
      avatar: {
        tiny: '2rem',
        small: '2.75rem',
        medium: '3.5rem',
        large: '4.25rem',
        huge: '5.5rem',
        giant: '8rem'
      },
      
      card: {
        small: '1.25rem',
        medium: '1.75rem',
        large: '2.5rem'
      }
    },
    
    grid: {
      columns: 12,
      gutter: '1.5rem',
      margin: '2rem'
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