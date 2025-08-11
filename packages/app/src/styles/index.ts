/**
 * 样式导出
 *
 * 导出所有样式相关的资源
 */

// 样式变量和主题
export const theme = {
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    card: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  },
  shadows: {
    card: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    button:
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
  },
}

// CSS 变量字符串（用于注入到页面）
export const cssVariables = `
  :root {
    --color-primary: ${theme.colors.primary};
    --color-secondary: ${theme.colors.secondary};
    --color-success: ${theme.colors.success};
    --color-warning: ${theme.colors.warning};
    --color-error: ${theme.colors.error};
    --color-info: ${theme.colors.info};
    
    --gradient-primary: ${theme.gradients.primary};
    --gradient-card: ${theme.gradients.card};
    
    --shadow-card: ${theme.shadows.card};
    --shadow-button: ${theme.shadows.button};
    
    --radius-small: ${theme.borderRadius.small};
    --radius-medium: ${theme.borderRadius.medium};
    --radius-large: ${theme.borderRadius.large};
  }
`
