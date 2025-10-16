/**
 * @ldesign/size - Use Case Presets
 * 
 * Size presets for specific use cases
 */

import type { Preset } from './types';
import { fluid } from '../core/FluidSize';

/**
 * Dashboard preset - for data-dense interfaces
 */
export const dashboard: Preset = {
  metadata: {
    name: 'dashboard',
    label: '数据仪表盘',
    description: '适用于数据密集型仪表盘和管理界面',
    category: 'useCase',
    tags: ['dashboard', 'data', 'analytics', 'admin'],
    icon: '📊'
  },
  scheme: {
    name: 'dashboard',
    description: 'Optimized for data dashboards',
    
    fontSize: {
      tiny: '0.625rem',   // 10px
      small: '0.6875rem', // 11px
      medium: '0.75rem',  // 12px
      large: '0.875rem',  // 14px
      huge: '1rem',       // 16px
      giant: '1.125rem',  // 18px
      
      h1: '1.5rem',
      h2: '1.25rem',
      h3: '1.125rem',
      h4: '1rem',
      h5: '0.875rem',
      h6: '0.75rem',
      
      display1: '2rem',
      display2: '1.75rem',
      display3: '1.5rem',
      
      caption: '0.625rem',
      overline: '0.5625rem',
      code: '0.6875rem'
    },
    
    spacing: {
      none: '0',
      tiny: '0.0625rem', // 1px
      small: '0.125rem', // 2px
      medium: '0.25rem', // 4px
      large: '0.375rem', // 6px
      huge: '0.5rem',    // 8px
      giant: '0.75rem',  // 12px
      
      massive: '1rem',
      colossal: '1.5rem'
    },
    
    radius: {
      none: '0',
      small: '0.0625rem',
      medium: '0.125rem',
      large: '0.1875rem',
      huge: '0.25rem',
      full: '9999px',
      circle: '50%'
    },
    
    lineHeight: {
      none: 1.0,
      tight: 1.15,
      snug: 1.25,
      normal: 1.35,
      relaxed: 1.45,
      loose: 1.6
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
        tiny: { height: '1.25rem', padding: '0 0.375rem', fontSize: '0.625rem' },
        small: { height: '1.5rem', padding: '0 0.5rem', fontSize: '0.6875rem' },
        medium: { height: '1.75rem', padding: '0 0.625rem', fontSize: '0.75rem' },
        large: { height: '2rem', padding: '0 0.75rem', fontSize: '0.875rem' },
        huge: { height: '2.25rem', padding: '0 0.875rem', fontSize: '1rem' }
      },
      
      input: {
        small: { height: '1.5rem', padding: '0.1875rem 0.375rem', fontSize: '0.6875rem' },
        medium: { height: '1.75rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
        large: { height: '2rem', padding: '0.375rem 0.625rem', fontSize: '0.875rem' }
      },
      
      icon: {
        tiny: '0.625rem',
        small: '0.75rem',
        medium: '0.875rem',
        large: '1rem',
        huge: '1.25rem',
        giant: '1.5rem'
      },
      
      avatar: {
        tiny: '1rem',
        small: '1.25rem',
        medium: '1.5rem',
        large: '2rem',
        huge: '2.5rem',
        giant: '3rem'
      },
      
      card: {
        small: '0.375rem',
        medium: '0.5rem',
        large: '0.75rem'
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
 * Article preset - for reading content
 */
export const article: Preset = {
  metadata: {
    name: 'article',
    label: '文章阅读',
    description: '优化长文阅读体验的尺寸预设',
    category: 'useCase',
    tags: ['article', 'blog', 'reading', 'content'],
    icon: '📖'
  },
  scheme: {
    name: 'article',
    description: 'Optimized for article reading',
    
    fontSize: {
      tiny: '0.875rem',
      small: '1rem',
      medium: '1.125rem', // Larger for readability
      large: '1.25rem',
      huge: '1.5rem',
      giant: '1.75rem',
      
      // Fluid headings for better scaling
      h1: fluid.size(2.25, 3.5),
      h2: fluid.size(1.875, 2.75),
      h3: fluid.size(1.5, 2.25),
      h4: fluid.size(1.25, 1.875),
      h5: fluid.size(1.125, 1.5),
      h6: fluid.size(1, 1.25),
      
      display1: fluid.size(3, 4.5),
      display2: fluid.size(2.5, 3.75),
      display3: fluid.size(2, 3),
      
      caption: '0.875rem',
      overline: '0.75rem',
      code: '1rem'
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
      colossal: '6rem'
    },
    
    radius: {
      none: '0',
      small: '0.25rem',
      medium: '0.375rem',
      large: '0.5rem',
      huge: '0.75rem',
      full: '9999px',
      circle: '50%'
    },
    
    lineHeight: {
      none: 1.0,
      tight: 1.4,
      snug: 1.5,
      normal: 1.65, // Optimized for reading
      relaxed: 1.8,
      loose: 2.0
    },
    
    letterSpacing: {
      tighter: '-0.02em',
      tight: '-0.01em',
      normal: '0',
      wide: '0.01em',
      wider: '0.02em',
      widest: '0.04em'
    },
    
    components: {
      button: {
        tiny: { height: '2rem', padding: '0 1rem', fontSize: '0.875rem' },
        small: { height: '2.5rem', padding: '0 1.25rem', fontSize: '1rem' },
        medium: { height: '3rem', padding: '0 1.5rem', fontSize: '1.125rem' },
        large: { height: '3.5rem', padding: '0 2rem', fontSize: '1.25rem' },
        huge: { height: '4rem', padding: '0 2.5rem', fontSize: '1.5rem' }
      },
      
      input: {
        small: { height: '2.5rem', padding: '0.625rem 1rem', fontSize: '1rem' },
        medium: { height: '3rem', padding: '0.75rem 1.25rem', fontSize: '1.125rem' },
        large: { height: '3.5rem', padding: '1rem 1.5rem', fontSize: '1.25rem' }
      },
      
      icon: {
        tiny: '1rem',
        small: '1.25rem',
        medium: '1.5rem',
        large: '1.75rem',
        huge: '2.25rem',
        giant: '3rem'
      },
      
      avatar: {
        tiny: '2rem',
        small: '2.5rem',
        medium: '3rem',
        large: '3.5rem',
        huge: '4.5rem',
        giant: '6rem'
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
      margin: '2rem'
    },
    
    breakpoints: {
      xs: '320px',
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      xxl: '1440px'
    }
  }
};

/**
 * Admin preset - for admin panels
 */
export const admin: Preset = {
  metadata: {
    name: 'admin',
    label: '管理后台',
    description: '管理后台系统的尺寸预设',
    category: 'useCase',
    tags: ['admin', 'management', 'system'],
    icon: '⚙️'
  },
  scheme: {
    name: 'admin',
    description: 'Admin panel preset',
    
    fontSize: {
      tiny: '0.6875rem',
      small: '0.75rem',
      medium: '0.875rem',
      large: '1rem',
      huge: '1.125rem',
      giant: '1.25rem',
      
      h1: '1.875rem',
      h2: '1.5rem',
      h3: '1.25rem',
      h4: '1.125rem',
      h5: '1rem',
      h6: '0.875rem',
      
      display1: '2.5rem',
      display2: '2.125rem',
      display3: '1.875rem',
      
      caption: '0.6875rem',
      overline: '0.625rem',
      code: '0.8125rem'
    },
    
    spacing: {
      none: '0',
      tiny: '0.125rem',
      small: '0.25rem',
      medium: '0.5rem',
      large: '0.875rem',
      huge: '1.25rem',
      giant: '1.75rem',
      
      massive: '2.5rem',
      colossal: '3.5rem'
    },
    
    radius: {
      none: '0',
      small: '0.125rem',
      medium: '0.25rem',
      large: '0.375rem',
      huge: '0.5rem',
      full: '9999px',
      circle: '50%'
    },
    
    lineHeight: {
      none: 1.0,
      tight: 1.2,
      snug: 1.35,
      normal: 1.45,
      relaxed: 1.55,
      loose: 1.75
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
        tiny: { height: '1.625rem', padding: '0 0.625rem', fontSize: '0.6875rem' },
        small: { height: '1.875rem', padding: '0 0.75rem', fontSize: '0.75rem' },
        medium: { height: '2.125rem', padding: '0 0.875rem', fontSize: '0.875rem' },
        large: { height: '2.375rem', padding: '0 1rem', fontSize: '1rem' },
        huge: { height: '2.625rem', padding: '0 1.25rem', fontSize: '1.125rem' }
      },
      
      input: {
        small: { height: '1.875rem', padding: '0.375rem 0.625rem', fontSize: '0.75rem' },
        medium: { height: '2.125rem', padding: '0.4375rem 0.75rem', fontSize: '0.875rem' },
        large: { height: '2.375rem', padding: '0.5rem 0.875rem', fontSize: '1rem' }
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
        tiny: '1.375rem',
        small: '1.625rem',
        medium: '2rem',
        large: '2.5rem',
        huge: '3rem',
        giant: '4rem'
      },
      
      card: {
        small: '0.625rem',
        medium: '0.875rem',
        large: '1.25rem'
      }
    },
    
    grid: {
      columns: 24,
      gutter: '0.875rem',
      margin: '0.875rem'
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
 * E-commerce preset
 */
export const ecommerce: Preset = {
  metadata: {
    name: 'ecommerce',
    label: '电商界面',
    description: '电商网站和应用的尺寸预设',
    category: 'useCase',
    tags: ['ecommerce', 'shop', 'retail'],
    icon: '🛍️'
  },
  scheme: {
    name: 'ecommerce',
    description: 'E-commerce website preset',
    
    fontSize: {
      tiny: '0.75rem',
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      huge: '1.375rem',
      giant: '1.625rem',
      
      h1: fluid.size(2, 3),
      h2: fluid.size(1.625, 2.5),
      h3: fluid.size(1.375, 2),
      h4: fluid.size(1.125, 1.625),
      h5: fluid.size(1, 1.375),
      h6: fluid.size(0.875, 1.125),
      
      display1: fluid.size(2.5, 4),
      display2: fluid.size(2, 3.25),
      display3: fluid.size(1.75, 2.75),
      
      caption: '0.8125rem',
      overline: '0.75rem',
      code: '0.9375rem'
    },
    
    spacing: {
      none: '0',
      tiny: '0.25rem',
      small: '0.5rem',
      medium: '0.875rem',
      large: '1.25rem',
      huge: '1.875rem',
      giant: '2.5rem',
      
      massive: '3.75rem',
      colossal: '5rem'
    },
    
    radius: {
      none: '0',
      small: '0.25rem',
      medium: '0.375rem',
      large: '0.5rem',
      huge: '0.75rem',
      full: '9999px',
      circle: '50%'
    },
    
    lineHeight: {
      none: 1.0,
      tight: 1.3,
      snug: 1.4,
      normal: 1.5,
      relaxed: 1.625,
      loose: 1.875
    },
    
    letterSpacing: {
      tighter: '-0.03em',
      tight: '-0.015em',
      normal: '0',
      wide: '0.015em',
      wider: '0.03em',
      widest: '0.06em'
    },
    
    components: {
      button: {
        tiny: { height: '2rem', padding: '0 0.875rem', fontSize: '0.75rem' },
        small: { height: '2.375rem', padding: '0 1.125rem', fontSize: '0.875rem' },
        medium: { height: '2.75rem', padding: '0 1.375rem', fontSize: '1rem' },
        large: { height: '3.25rem', padding: '0 1.75rem', fontSize: '1.125rem' },
        huge: { height: '3.75rem', padding: '0 2.25rem', fontSize: '1.375rem' }
      },
      
      input: {
        small: { height: '2.375rem', padding: '0.5rem 0.875rem', fontSize: '0.875rem' },
        medium: { height: '2.75rem', padding: '0.625rem 1.125rem', fontSize: '1rem' },
        large: { height: '3.25rem', padding: '0.75rem 1.375rem', fontSize: '1.125rem' }
      },
      
      icon: {
        tiny: '1rem',
        small: '1.25rem',
        medium: '1.5rem',
        large: '1.875rem',
        huge: '2.25rem',
        giant: '3rem'
      },
      
      avatar: {
        tiny: '2rem',
        small: '2.5rem',
        medium: '3rem',
        large: '3.75rem',
        huge: '4.5rem',
        giant: '6rem'
      },
      
      card: {
        small: '0.875rem',
        medium: '1.25rem',
        large: '1.875rem'
      }
    },
    
    grid: {
      columns: 12,
      gutter: '1.25rem',
      margin: '1.25rem'
    },
    
    breakpoints: {
      xs: '320px',
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      xxl: '1440px'
    }
  }
};