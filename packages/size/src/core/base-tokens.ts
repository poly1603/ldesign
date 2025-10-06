/**
 * 基础尺寸 Token 系统
 * 参考 TDesign 设计系统，提供基础的尺寸 token
 * 所有其他尺寸配置都应该基于这些基础 token 构建
 */

/**
 * 基础尺寸 Token 定义
 * 从 2px 到 72px 的标准尺寸刻度
 */
export interface BaseSizeTokens {
  /** 2px - 最小尺寸单位 */
  size1: string
  /** 4px - 超小尺寸 */
  size2: string
  /** 6px - 小尺寸 */
  size3: string
  /** 8px - 基础小尺寸 */
  size4: string
  /** 12px - 中小尺寸 */
  size5: string
  /** 16px - 基础尺寸 */
  size6: string
  /** 20px - 中等尺寸 */
  size7: string
  /** 24px - 标准尺寸 */
  size8: string
  /** 28px - 中大尺寸 */
  size9: string
  /** 32px - 大尺寸 */
  size10: string
  /** 36px - 较大尺寸 */
  size11: string
  /** 40px - 超大尺寸 */
  size12: string
  /** 48px - 特大尺寸 */
  size13: string
  /** 56px - 巨大尺寸 */
  size14: string
  /** 64px - 超巨大尺寸 */
  size15: string
  /** 72px - 最大尺寸 */
  size16: string
}

/**
 * 基础尺寸 Token 值
 * 这些是固定的基础值，不随尺寸模式变化
 */
export const baseSizeTokens: BaseSizeTokens = {
  size1: '2px',
  size2: '4px',
  size3: '6px',
  size4: '8px',
  size5: '12px',
  size6: '16px',
  size7: '20px',
  size8: '24px',
  size9: '28px',
  size10: '32px',
  size11: '36px',
  size12: '40px',
  size13: '48px',
  size14: '56px',
  size15: '64px',
  size16: '72px',
}

/**
 * 组件尺寸 Token 定义
 * 基于基础尺寸 token 的组件尺寸映射
 */
export interface ComponentSizeTokens {
  /** 超超小组件尺寸 - 16px */
  xxxs: string
  /** 超小组件尺寸 - 20px */
  xxs: string
  /** 小组件尺寸 - 24px */
  xs: string
  /** 小中组件尺寸 - 28px */
  s: string
  /** 中等组件尺寸 - 32px */
  m: string
  /** 大组件尺寸 - 36px */
  l: string
  /** 超大组件尺寸 - 40px */
  xl: string
  /** 特大组件尺寸 - 48px */
  xxl: string
  /** 超特大组件尺寸 - 56px */
  xxxl: string
  /** 巨大组件尺寸 - 64px */
  xxxxl: string
  /** 超巨大组件尺寸 - 72px */
  xxxxxl: string
}

/**
 * 组件尺寸 Token 值（引用基础 token）
 */
export const componentSizeTokens: ComponentSizeTokens = {
  xxxs: 'var(--ls-size-6)', // 16px
  xxs: 'var(--ls-size-7)', // 20px
  xs: 'var(--ls-size-8)', // 24px
  s: 'var(--ls-size-9)', // 28px
  m: 'var(--ls-size-10)', // 32px
  l: 'var(--ls-size-11)', // 36px
  xl: 'var(--ls-size-12)', // 40px
  xxl: 'var(--ls-size-13)', // 48px
  xxxl: 'var(--ls-size-14)', // 56px
  xxxxl: 'var(--ls-size-15)', // 64px
  xxxxxl: 'var(--ls-size-16)', // 72px
}

/**
 * 弹出层边距 Token 定义
 */
export interface PopupPaddingTokens {
  /** 小边距 - 4px */
  s: string
  /** 中等边距 - 6px */
  m: string
  /** 大边距 - 8px */
  l: string
  /** 超大边距 - 12px */
  xl: string
  /** 特大边距 - 16px */
  xxl: string
}

/**
 * 弹出层边距 Token 值（引用基础 token）
 */
export const popupPaddingTokens: PopupPaddingTokens = {
  s: 'var(--ls-size-2)', // 4px
  m: 'var(--ls-size-3)', // 6px
  l: 'var(--ls-size-4)', // 8px
  xl: 'var(--ls-size-5)', // 12px
  xxl: 'var(--ls-size-6)', // 16px
}

/**
 * 组件左右边距 Token 定义
 */
export interface ComponentPaddingLRTokens {
  /** 超小左右边距 - 2px */
  xxs: string
  /** 小左右边距 - 4px */
  xs: string
  /** 小中左右边距 - 8px */
  s: string
  /** 中等左右边距 - 12px */
  m: string
  /** 大左右边距 - 16px */
  l: string
  /** 超大左右边距 - 24px */
  xl: string
  /** 特大左右边距 - 32px */
  xxl: string
}

/**
 * 组件左右边距 Token 值（引用基础 token）
 */
export const componentPaddingLRTokens: ComponentPaddingLRTokens = {
  xxs: 'var(--ls-size-1)', // 2px
  xs: 'var(--ls-size-2)', // 4px
  s: 'var(--ls-size-4)', // 8px
  m: 'var(--ls-size-5)', // 12px
  l: 'var(--ls-size-6)', // 16px
  xl: 'var(--ls-size-8)', // 24px
  xxl: 'var(--ls-size-10)', // 32px
}

/**
 * 组件上下边距 Token 定义
 */
export interface ComponentPaddingTBTokens {
  /** 超小上下边距 - 2px */
  xxs: string
  /** 小上下边距 - 4px */
  xs: string
  /** 小中上下边距 - 8px */
  s: string
  /** 中等上下边距 - 12px */
  m: string
  /** 大上下边距 - 16px */
  l: string
  /** 超大上下边距 - 24px */
  xl: string
  /** 特大上下边距 - 32px */
  xxl: string
}

/**
 * 组件上下边距 Token 值（引用基础 token）
 */
export const componentPaddingTBTokens: ComponentPaddingTBTokens = {
  xxs: 'var(--ls-size-1)', // 2px
  xs: 'var(--ls-size-2)', // 4px
  s: 'var(--ls-size-4)', // 8px
  m: 'var(--ls-size-5)', // 12px
  l: 'var(--ls-size-6)', // 16px
  xl: 'var(--ls-size-8)', // 24px
  xxl: 'var(--ls-size-10)', // 32px
}

/**
 * 组件间距 Token 定义
 */
export interface ComponentMarginTokens {
  /** 超小间距 - 2px */
  xxs: string
  /** 小间距 - 4px */
  xs: string
  /** 小中间距 - 8px */
  s: string
  /** 中等间距 - 12px */
  m: string
  /** 大间距 - 16px */
  l: string
  /** 超大间距 - 20px */
  xl: string
  /** 特大间距 - 24px */
  xxl: string
  /** 超特大间距 - 32px */
  xxxl: string
  /** 巨大间距 - 40px */
  xxxxl: string
}

/**
 * 组件间距 Token 值（引用基础 token）
 */
export const componentMarginTokens: ComponentMarginTokens = {
  xxs: 'var(--ls-size-1)', // 2px
  xs: 'var(--ls-size-2)', // 4px
  s: 'var(--ls-size-4)', // 8px
  m: 'var(--ls-size-5)', // 12px
  l: 'var(--ls-size-6)', // 16px
  xl: 'var(--ls-size-7)', // 20px
  xxl: 'var(--ls-size-8)', // 24px
  xxxl: 'var(--ls-size-10)', // 32px
  xxxxl: 'var(--ls-size-12)', // 40px
}

/**
 * 生成基础尺寸 CSS 变量
 * @param prefix - CSS 变量前缀，默认为 '--ls'
 * @returns CSS 变量对象
 */
export function generateBaseSizeVariables(prefix: string = '--ls'): Record<string, string> {
  const variables: Record<string, string> = {}

  // 生成基础尺寸变量
  Object.entries(baseSizeTokens).forEach(([key, value]) => {
    const varName = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    variables[`${prefix}-${varName}`] = value
  })

  return variables
}

/**
 * 生成组件尺寸 CSS 变量
 * @param prefix - CSS 变量前缀，默认为 '--ls'
 * @returns CSS 变量对象
 */
export function generateComponentSizeVariables(prefix: string = '--ls'): Record<string, string> {
  const variables: Record<string, string> = {}

  // 组件尺寸
  Object.entries(componentSizeTokens).forEach(([key, value]) => {
    variables[`${prefix}-comp-size-${key}`] = value
  })

  // 弹出层边距
  Object.entries(popupPaddingTokens).forEach(([key, value]) => {
    variables[`${prefix}-pop-padding-${key}`] = value
  })

  // 组件左右边距
  Object.entries(componentPaddingLRTokens).forEach(([key, value]) => {
    variables[`${prefix}-comp-padding-lr-${key}`] = value
  })

  // 组件上下边距
  Object.entries(componentPaddingTBTokens).forEach(([key, value]) => {
    variables[`${prefix}-comp-padding-tb-${key}`] = value
  })

  // 组件间距
  Object.entries(componentMarginTokens).forEach(([key, value]) => {
    variables[`${prefix}-comp-margin-${key}`] = value
  })

  return variables
}

/**
 * 生成所有基础 Token CSS 变量
 * @param prefix - CSS 变量前缀，默认为 '--ls'
 * @returns 包含所有基础 token 的 CSS 变量对象
 */
export function generateAllBaseTokenVariables(prefix: string = '--ls'): Record<string, string> {
  return {
    ...generateBaseSizeVariables(prefix),
    ...generateComponentSizeVariables(prefix),
  }
}
