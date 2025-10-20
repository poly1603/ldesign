/**
 * @ldesign/size - Mobile Presets
 * 
 * Size presets optimized for mobile devices
 */

import type { Preset } from './types';
import { getDeviceDetector } from '../core/DeviceDetector';
import { fluid } from '../core/FluidSize';

/**
 * Mobile compact preset - minimal spacing
 */
export const mobileCompact: Preset = {
  metadata: {
    name: 'mobile-compact',
    label: '移动紧凑',
    description: '适用于信息密集的移动界面',
    category: 'device',
    tags: ['mobile', 'compact', 'dense'],
    icon: '📱'
  },
  scheme: {
    name: 'mobile-compact',
    description: 'Compact mobile preset with minimal spacing',
    
    fontSize: {
      tiny: '0.625rem',    // 10px
      small: '0.75rem',    // 12px  
      medium: '0.875rem',  // 14px
      large: '1rem',       // 16px - iOS minimum to prevent zoom
      huge: '1.125rem',    // 18px
      giant: '1.25rem',    // 20px
      
      h1: '1.5rem',
      h2: '1.25rem',
      h3: '1.125rem',
      h4: '1rem',
      h5: '0.875rem',
      h6: '0.8125rem',
      
      caption: '0.625rem',
      overline: '0.5625rem',
      code: '0.75rem'
    },
    
    spacing: {
      none: '0',
      tiny: '0.125rem',   // 2px
      small: '0.25rem',   // 4px
      medium: '0.375rem', // 6px
      large: '0.5rem',    // 8px
      huge: '0.75rem',    // 12px
      giant: '1rem',      // 16px
      
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
      loose: 1.6
    },
    
    letterSpacing: {
      tighter: '-0.03em',
      tight: '-0.015em',
      normal: '0',
      wide: '0.01em',
      wider: '0.02em',
      widest: '0.03em'
    },
    
    components: {
      button: {
        tiny: { height: '2rem', padding: '0 0.5rem', fontSize: '0.75rem' },
        small: { height: '2.25rem', padding: '0 0.625rem', fontSize: '0.875rem' },
        medium: { height: '2.75rem', padding: '0 0.875rem', fontSize: '1rem' },
        large: { height: '3rem', padding: '0 1rem', fontSize: '1rem' },
        huge: { height: '3.5rem', padding: '0 1.25rem', fontSize: '1.125rem' }
      },
      
      input: {
        small: { height: '2.25rem', padding: '0.375rem 0.5rem', fontSize: '1rem' },
        medium: { height: '2.75rem', padding: '0.5rem 0.75rem', fontSize: '1rem' },
        large: { height: '3rem', padding: '0.625rem 0.875rem', fontSize: '1rem' }
      },
      
      icon: {
        tiny: '0.75rem',
        small: '1rem',
        medium: '1.25rem',
        large: '1.5rem',
        huge: '1.75rem',
        giant: '2rem'
      },
      
      avatar: {
        tiny: '1.5rem',
        small: '1.75rem',
        medium: '2rem',
        large: '2.5rem',
        huge: '3rem',
        giant: '3.5rem'
      },
      
      card: {
        small: '0.5rem',
        medium: '0.75rem',
        large: '1rem'
      }
    },
    
    grid: {
      columns: 4,
      gutter: '0.5rem',
      margin: '0.5rem'
    },
    
    breakpoints: {
      xs: '320px',
      sm: '375px',
      md: '414px',
      lg: '768px'
    }
  }
};

/**
 * Mobile touch preset - optimized for touch
 */
export const mobileTouch: Preset = {
  metadata: {
    name: 'mobile-touch',
    label: '移动触控',
    description: '符合 iOS/Android 触控规范的移动预设',
    category: 'device',
    tags: ['mobile', 'touch', 'accessibility'],
    icon: '👆'
  },
  // 使用缓存避免重复计算
  scheme: (() => {
    let cachedScheme: any = null;
    let lastTouchSize: number | null = null;
    
    return () => {
      const touchSize = getDeviceDetector().getTouchTargetSize();
      
      // 如果 touch size 没有变化，使用缓存
      if (cachedScheme && lastTouchSize === touchSize) {
        return cachedScheme;
      }
      
      lastTouchSize = touchSize;
      cachedScheme = {
      name: 'mobile-touch',
      description: 'Touch-optimized mobile preset',
      
      fontSize: {
        tiny: '0.75rem',
        small: '0.875rem',
        medium: '1rem',      // 16px minimum
        large: '1.125rem',
        huge: '1.25rem',
        giant: '1.5rem',
        
        h1: fluid.text('h1'),
        h2: fluid.text('h2'),
        h3: fluid.text('h3'),
        h4: fluid.text('h4'),
        h5: fluid.text('h5'),
        h6: fluid.text('h6'),
        
        display1: fluid.size(2, 3),
        display2: fluid.size(1.75, 2.5),
        display3: fluid.size(1.5, 2),
        
        caption: '0.75rem',
        overline: '0.6875rem',
        code: '0.875rem'
      },
      
      spacing: {
        none: '0',
        tiny: '0.25rem',
        small: '0.5rem',
        medium: '0.75rem',
        large: '1rem',
        huge: '1.5rem',
        giant: '2rem',
        
        massive: '3rem',
        colossal: '4rem',
        
        half: '0.375rem',
        quarter: '0.1875rem',
        double: '1.5rem'
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
        relaxed: 1.6,
        loose: 1.75
      },
      
      letterSpacing: {
        tighter: '-0.025em',
        tight: '-0.0125em',
        normal: '0',
        wide: '0.0125em',
        wider: '0.025em',
        widest: '0.05em'
      },
      
      components: {
        button: {
          tiny: { 
            height: `${Math.max(36, touchSize * 0.8)}px`,
            padding: '0 0.75rem',
            fontSize: '0.875rem'
          },
          small: { 
            height: `${Math.max(40, touchSize * 0.9)}px`,
            padding: '0 1rem',
            fontSize: '0.9375rem'
          },
          medium: { 
            height: `${touchSize}px`,
            padding: '0 1.25rem',
            fontSize: '1rem'
          },
          large: { 
            height: `${touchSize * 1.1}px`,
            padding: '0 1.5rem',
            fontSize: '1.125rem'
          },
          huge: { 
            height: `${touchSize * 1.25}px`,
            padding: '0 2rem',
            fontSize: '1.25rem'
          }
        },
        
        input: {
          small: { 
            height: `${Math.max(40, touchSize * 0.9)}px`,
            padding: '0.5rem 0.75rem',
            fontSize: '1rem' // 16px to prevent iOS zoom
          },
          medium: { 
            height: `${touchSize}px`,
            padding: '0.625rem 1rem',
            fontSize: '1rem'
          },
          large: { 
            height: `${touchSize * 1.15}px`,
            padding: '0.75rem 1.25rem',
            fontSize: '1.125rem'
          }
        },
        
        icon: {
          tiny: '1rem',
          small: '1.25rem',
          medium: '1.5rem',
          large: '1.75rem',
          huge: '2rem',
          giant: '2.5rem'
        },
        
        avatar: {
          tiny: '2rem',
          small: '2.5rem',
          medium: '3rem',
          large: '3.5rem',
          huge: '4rem',
          giant: '5rem'
        },
        
        card: {
          small: '0.75rem',
          medium: '1rem',
          large: '1.5rem'
        }
      },
      
      grid: {
        columns: 6,
        gutter: '1rem',
        margin: '1rem'
      },
      
      breakpoints: {
        xs: '320px',
        sm: '375px',
        md: '414px',
        lg: '768px',
        xl: '1024px'
      }
      };
      
      return cachedScheme;
    };
  })()
};
