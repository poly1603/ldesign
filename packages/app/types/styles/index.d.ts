/**
 * 样式导出
 *
 * 导出所有样式相关的资源
 */
declare const theme: {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
  }
  gradients: {
    primary: string
    card: string
  }
  shadows: {
    card: string
    button: string
  }
  borderRadius: {
    small: string
    medium: string
    large: string
  }
}
declare const cssVariables: string

export { cssVariables, theme }
