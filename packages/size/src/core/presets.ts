/**
 * 尺寸配置预设
 * 优化版本：使用基础 token 引用，减少硬编码，提升性能和可维护性
 */

import type { SizeConfig, SizeMode } from '../types'
import { baseSizeTokens } from './base-tokens'

/**
 * 小尺寸配置
 * 优化：使用基础 token 引用，减少内存占用
 */
export const smallSizeConfig: SizeConfig = {
  fontSize: {
    xs: '10px',
    sm: '11px',
    base: baseSizeTokens.size5, // 12px
    lg: '14px',
    xl: baseSizeTokens.size6, // 16px
    xxl: '18px',
    h1: baseSizeTokens.size8, // 24px
    h2: baseSizeTokens.size7, // 20px
    h3: '18px',
    h4: baseSizeTokens.size6, // 16px
    h5: '14px',
    h6: baseSizeTokens.size5, // 12px
  },
  spacing: {
    xs: baseSizeTokens.size1, // 2px
    sm: baseSizeTokens.size2, // 4px
    base: baseSizeTokens.size4, // 8px
    lg: baseSizeTokens.size5, // 12px
    xl: baseSizeTokens.size6, // 16px
    xxl: baseSizeTokens.size8, // 24px
  },
  component: {
    buttonHeight: {
      small: baseSizeTokens.size8, // 24px
      medium: baseSizeTokens.size9, // 28px
      large: baseSizeTokens.size10, // 32px
    },
    inputHeight: {
      small: baseSizeTokens.size8, // 24px
      medium: baseSizeTokens.size9, // 28px
      large: baseSizeTokens.size10, // 32px
    },
    iconSize: {
      small: baseSizeTokens.size5, // 12px
      medium: '14px',
      large: baseSizeTokens.size6, // 16px
    },
    avatarSize: {
      small: baseSizeTokens.size7, // 20px
      medium: baseSizeTokens.size8, // 24px
      large: baseSizeTokens.size9, // 28px
    },
  },
  borderRadius: {
    none: '0',
    sm: '1px',
    base: baseSizeTokens.size1, // 2px
    lg: baseSizeTokens.size2, // 4px
    xl: baseSizeTokens.size3, // 6px
    full: '50%',
  },
  shadow: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px rgba(0, 0, 0, 0.1)',
    lg: '0 2px 6px rgba(0, 0, 0, 0.1)',
    xl: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}

/**
 * 中等尺寸配置（默认）
 * 优化：使用基础 token 引用，减少内存占用
 */
export const mediumSizeConfig: SizeConfig = {
  fontSize: {
    xs: baseSizeTokens.size5, // 12px
    sm: '14px',
    base: baseSizeTokens.size6, // 16px
    lg: '18px',
    xl: baseSizeTokens.size7, // 20px
    xxl: baseSizeTokens.size8, // 24px
    h1: baseSizeTokens.size10, // 32px
    h2: baseSizeTokens.size9, // 28px
    h3: baseSizeTokens.size8, // 24px
    h4: baseSizeTokens.size7, // 20px
    h5: '18px',
    h6: baseSizeTokens.size6, // 16px
  },
  spacing: {
    xs: baseSizeTokens.size2, // 4px
    sm: baseSizeTokens.size4, // 8px
    base: baseSizeTokens.size6, // 16px
    lg: baseSizeTokens.size8, // 24px
    xl: baseSizeTokens.size10, // 32px
    xxl: baseSizeTokens.size13, // 48px
  },
  component: {
    buttonHeight: {
      small: baseSizeTokens.size10, // 32px
      medium: baseSizeTokens.size11, // 36px
      large: baseSizeTokens.size12, // 40px
    },
    inputHeight: {
      small: baseSizeTokens.size10, // 32px
      medium: baseSizeTokens.size11, // 36px
      large: baseSizeTokens.size12, // 40px
    },
    iconSize: {
      small: baseSizeTokens.size6, // 16px
      medium: '18px',
      large: baseSizeTokens.size7, // 20px
    },
    avatarSize: {
      small: baseSizeTokens.size9, // 28px
      medium: baseSizeTokens.size10, // 32px
      large: baseSizeTokens.size11, // 36px
    },
  },
  borderRadius: {
    none: '0',
    sm: baseSizeTokens.size1, // 2px
    base: baseSizeTokens.size2, // 4px
    lg: baseSizeTokens.size4, // 8px
    xl: baseSizeTokens.size5, // 12px
    full: '50%',
  },
  shadow: {
    none: 'none',
    sm: '0 2px 4px rgba(0, 0, 0, 0.05)',
    base: '0 2px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 12px rgba(0, 0, 0, 0.15)',
    xl: '0 8px 24px rgba(0, 0, 0, 0.2)',
  },
}

/**
 * 大尺寸配置
 * 优化：使用基础 token 引用，减少内存占用
 */
export const largeSizeConfig: SizeConfig = {
  fontSize: {
    xs: '14px',
    sm: baseSizeTokens.size6, // 16px
    base: '18px',
    lg: baseSizeTokens.size7, // 20px
    xl: baseSizeTokens.size8, // 24px
    xxl: baseSizeTokens.size9, // 28px
    h1: baseSizeTokens.size12, // 40px
    h2: baseSizeTokens.size11, // 36px
    h3: baseSizeTokens.size10, // 32px
    h4: baseSizeTokens.size9, // 28px
    h5: baseSizeTokens.size8, // 24px
    h6: baseSizeTokens.size7, // 20px
  },
  spacing: {
    xs: baseSizeTokens.size3, // 6px
    sm: baseSizeTokens.size5, // 12px
    base: baseSizeTokens.size7, // 20px
    lg: baseSizeTokens.size9, // 28px
    xl: baseSizeTokens.size11, // 36px
    xxl: baseSizeTokens.size14, // 56px
  },
  component: {
    buttonHeight: {
      small: baseSizeTokens.size12, // 40px
      medium: '44px',
      large: baseSizeTokens.size13, // 48px
    },
    inputHeight: {
      small: baseSizeTokens.size12, // 40px
      medium: '44px',
      large: baseSizeTokens.size13, // 48px
    },
    iconSize: {
      small: baseSizeTokens.size7, // 20px
      medium: '22px',
      large: baseSizeTokens.size8, // 24px
    },
    avatarSize: {
      small: baseSizeTokens.size11, // 36px
      medium: baseSizeTokens.size12, // 40px
      large: '44px',
    },
  },
  borderRadius: {
    none: '0',
    sm: baseSizeTokens.size3, // 3px -> 6px (调整为最接近的 token)
    base: baseSizeTokens.size3, // 6px
    lg: baseSizeTokens.size5, // 12px
    xl: baseSizeTokens.size6, // 16px
    full: '50%',
  },
  shadow: {
    none: 'none',
    sm: '0 3px 6px rgba(0, 0, 0, 0.05)',
    base: '0 4px 12px rgba(0, 0, 0, 0.1)',
    lg: '0 6px 16px rgba(0, 0, 0, 0.15)',
    xl: '0 12px 32px rgba(0, 0, 0, 0.2)',
  },
}

/**
 * 超大尺寸配置
 * 优化：使用基础 token 引用，减少内存占用
 */
export const extraLargeSizeConfig: SizeConfig = {
  fontSize: {
    xs: baseSizeTokens.size6, // 16px
    sm: '18px',
    base: baseSizeTokens.size7, // 20px
    lg: baseSizeTokens.size8, // 24px
    xl: baseSizeTokens.size9, // 28px
    xxl: baseSizeTokens.size10, // 32px
    h1: baseSizeTokens.size13, // 48px
    h2: '44px',
    h3: baseSizeTokens.size12, // 40px
    h4: baseSizeTokens.size11, // 36px
    h5: baseSizeTokens.size10, // 32px
    h6: baseSizeTokens.size9, // 28px
  },
  spacing: {
    xs: baseSizeTokens.size4, // 8px
    sm: baseSizeTokens.size6, // 16px
    base: baseSizeTokens.size8, // 24px
    lg: baseSizeTokens.size10, // 32px
    xl: baseSizeTokens.size12, // 40px
    xxl: baseSizeTokens.size15, // 64px
  },
  component: {
    buttonHeight: {
      small: baseSizeTokens.size13, // 48px
      medium: '52px',
      large: baseSizeTokens.size14, // 56px
    },
    inputHeight: {
      small: baseSizeTokens.size13, // 48px
      medium: '52px',
      large: baseSizeTokens.size14, // 56px
    },
    iconSize: {
      small: baseSizeTokens.size8, // 24px
      medium: '26px',
      large: baseSizeTokens.size9, // 28px
    },
    avatarSize: {
      small: '44px',
      medium: baseSizeTokens.size13, // 48px
      large: '52px',
    },
  },
  borderRadius: {
    none: '0',
    sm: baseSizeTokens.size2, // 4px
    base: baseSizeTokens.size4, // 8px
    lg: baseSizeTokens.size6, // 16px
    xl: baseSizeTokens.size7, // 20px
    full: '50%',
  },
  shadow: {
    none: 'none',
    sm: '0 4px 8px rgba(0, 0, 0, 0.05)',
    base: '0 6px 16px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 20px rgba(0, 0, 0, 0.15)',
    xl: '0 16px 40px rgba(0, 0, 0, 0.2)',
  },
}

/**
 * 所有尺寸配置的映射
 */
export const sizeConfigs: Record<SizeMode, SizeConfig> = {
  'small': smallSizeConfig,
  'medium': mediumSizeConfig,
  'large': largeSizeConfig,
  'extra-large': extraLargeSizeConfig,
}

/**
 * 获取指定模式的尺寸配置
 */
export function getSizeConfig(mode: SizeMode): SizeConfig {
  return sizeConfigs[mode]
}

/**
 * 获取所有可用的尺寸模式
 */
export function getAvailableModes(): SizeMode[] {
  return Object.keys(sizeConfigs) as SizeMode[]
}
