/**
 * 尺寸配置预设
 */

import type { SizeConfig, SizeMode } from '../types'

/**
 * 小尺寸配置
 */
export const smallSizeConfig: SizeConfig = {
  fontSize: {
    xs: '10px',
    sm: '11px',
    base: '12px',
    lg: '14px',
    xl: '16px',
    xxl: '18px',
    h1: '24px',
    h2: '20px',
    h3: '18px',
    h4: '16px',
    h5: '14px',
    h6: '12px',
  },
  spacing: {
    xs: '2px',
    sm: '4px',
    base: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '24px',
  },
  component: {
    buttonHeight: {
      small: '24px',
      medium: '28px',
      large: '32px',
    },
    inputHeight: {
      small: '24px',
      medium: '28px',
      large: '32px',
    },
    iconSize: {
      small: '12px',
      medium: '14px',
      large: '16px',
    },
    avatarSize: {
      small: '20px',
      medium: '24px',
      large: '28px',
    },
  },
  borderRadius: {
    none: '0',
    sm: '1px',
    base: '2px',
    lg: '4px',
    xl: '6px',
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
 */
export const mediumSizeConfig: SizeConfig = {
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    h1: '32px',
    h2: '28px',
    h3: '24px',
    h4: '20px',
    h5: '18px',
    h6: '16px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    base: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  component: {
    buttonHeight: {
      small: '32px',
      medium: '36px',
      large: '40px',
    },
    inputHeight: {
      small: '32px',
      medium: '36px',
      large: '40px',
    },
    iconSize: {
      small: '16px',
      medium: '18px',
      large: '20px',
    },
    avatarSize: {
      small: '28px',
      medium: '32px',
      large: '36px',
    },
  },
  borderRadius: {
    none: '0',
    sm: '2px',
    base: '4px',
    lg: '8px',
    xl: '12px',
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
 */
export const largeSizeConfig: SizeConfig = {
  fontSize: {
    xs: '14px',
    sm: '16px',
    base: '18px',
    lg: '20px',
    xl: '24px',
    xxl: '28px',
    h1: '40px',
    h2: '36px',
    h3: '32px',
    h4: '28px',
    h5: '24px',
    h6: '20px',
  },
  spacing: {
    xs: '6px',
    sm: '12px',
    base: '20px',
    lg: '28px',
    xl: '36px',
    xxl: '56px',
  },
  component: {
    buttonHeight: {
      small: '40px',
      medium: '44px',
      large: '48px',
    },
    inputHeight: {
      small: '40px',
      medium: '44px',
      large: '48px',
    },
    iconSize: {
      small: '20px',
      medium: '22px',
      large: '24px',
    },
    avatarSize: {
      small: '36px',
      medium: '40px',
      large: '44px',
    },
  },
  borderRadius: {
    none: '0',
    sm: '3px',
    base: '6px',
    lg: '12px',
    xl: '16px',
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
 */
export const extraLargeSizeConfig: SizeConfig = {
  fontSize: {
    xs: '16px',
    sm: '18px',
    base: '20px',
    lg: '24px',
    xl: '28px',
    xxl: '32px',
    h1: '48px',
    h2: '44px',
    h3: '40px',
    h4: '36px',
    h5: '32px',
    h6: '28px',
  },
  spacing: {
    xs: '8px',
    sm: '16px',
    base: '24px',
    lg: '32px',
    xl: '40px',
    xxl: '64px',
  },
  component: {
    buttonHeight: {
      small: '48px',
      medium: '52px',
      large: '56px',
    },
    inputHeight: {
      small: '48px',
      medium: '52px',
      large: '56px',
    },
    iconSize: {
      small: '24px',
      medium: '26px',
      large: '28px',
    },
    avatarSize: {
      small: '44px',
      medium: '48px',
      large: '52px',
    },
  },
  borderRadius: {
    none: '0',
    sm: '4px',
    base: '8px',
    lg: '16px',
    xl: '20px',
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
  small: smallSizeConfig,
  medium: mediumSizeConfig,
  large: largeSizeConfig,
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
