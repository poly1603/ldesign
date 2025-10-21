/**
 * @ldesign/form - Responsive Breakpoints Constants
 * 响应式断点常量
 */

/**
 * 响应式断点值（px）
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600
} as const

/**
 * 断点名称类型
 */
export type BreakpointName = keyof typeof BREAKPOINTS

/**
 * 断点名称列表
 */
export const BREAKPOINT_NAMES: BreakpointName[] = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  'xxl'
]

/**
 * 根据宽度获取当前断点
 */
export function getCurrentBreakpoint(width: number): BreakpointName {
  if (width >= BREAKPOINTS.xxl) return 'xxl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

/**
 * 检查是否匹配断点
 */
export function matchBreakpoint(
  width: number,
  breakpoint: BreakpointName
): boolean {
  const current = getCurrentBreakpoint(width)
  const currentIndex = BREAKPOINT_NAMES.indexOf(current)
  const targetIndex = BREAKPOINT_NAMES.indexOf(breakpoint)
  return currentIndex >= targetIndex
}




