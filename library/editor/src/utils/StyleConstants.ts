/**
 * 统一的样式常量管理
 * 避免重复的样式字符串定义
 */

// 颜色主题
export const Colors = {
  primary: '#1890ff',
  primaryHover: '#40a9ff',
  primaryActive: '#096dd9',
  
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  info: '#1890ff',
  
  text: '#333',
  textSecondary: '#666',
  textDisabled: '#999',
  
  border: '#d9d9d9',
  borderLight: '#e0e0e0',
  borderHover: '#40a9ff',
  
  background: '#fff',
  backgroundGray: '#f5f5f5',
  backgroundHover: '#f0f0f0',
  
  shadowLight: '0 2px 8px rgba(0,0,0,0.1)',
  shadowMedium: '0 4px 12px rgba(0,0,0,0.15)',
  shadowLarge: '0 8px 24px rgba(0,0,0,0.2)'
} as const

// 通用样式类
export const CommonStyles = {
  // 按钮样式
  button: `
    padding: 8px 16px;
    border: 1px solid ${Colors.border};
    border-radius: 4px;
    background: ${Colors.background};
    color: ${Colors.text};
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
  `,
  
  buttonPrimary: `
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: ${Colors.primary};
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
  `,
  
  // 输入框样式
  input: `
    width: 100%;
    padding: 8px 12px;
    border: 1px solid ${Colors.border};
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s;
  `,
  
  // 文本域样式
  textarea: `
    width: 100%;
    min-height: 100px;
    padding: 10px;
    border: 1px solid ${Colors.border};
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    font-family: inherit;
    box-sizing: border-box;
  `,
  
  // 对话框样式
  dialog: `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 8px;
    box-shadow: ${Colors.shadowLarge};
    z-index: 10000;
  `,
  
  // 遮罩层样式
  overlay: `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
  `,
  
  // 下拉菜单样式
  dropdown: `
    position: absolute;
    background: white;
    border: 1px solid ${Colors.border};
    border-radius: 4px;
    box-shadow: ${Colors.shadowMedium};
    z-index: 1000;
  `,
  
  // 工具提示样式
  tooltip: `
    position: absolute;
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    z-index: 10000;
    pointer-events: none;
  `
} as const

// 样式工具函数
export const StyleUtils = {
  /**
   * 合并样式字符串
   */
  mergeStyles(...styles: string[]): string {
    return styles.filter(Boolean).join('; ')
  },
  
  /**
   * 创建样式对象
   */
  createStyleObject(style: string): Record<string, string> {
    const obj: Record<string, string> = {}
    style.split(';').forEach(rule => {
      const [key, value] = rule.split(':').map(s => s.trim())
      if (key && value) {
        // 转换为驼峰命名
        const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
        obj[camelKey] = value
      }
    })
    return obj
  },
  
  /**
   * 添加前缀类名
   */
  prefixClass(className: string): string {
    return `ldesign-${className}`
  },
  
  /**
   * 生成唯一ID
   */
  generateId(prefix = 'ldesign'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}