/**
 * 全局 TypeScript 配置文件
 * 
 * 这个文件包含了组件库的全局 TypeScript 配置，包括：
 * - 全局类型定义
 * - 工具函数
 * - 主题切换功能
 * - 可访问性增强
 */

// ==================== 全局类型定义 ====================

/**
 * 组件尺寸类型
 */
export type ComponentSize = 'small' | 'medium' | 'large';

/**
 * 组件状态类型
 */
export type ComponentStatus = 'default' | 'primary' | 'success' | 'warning' | 'error';

/**
 * 主题类型
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * 组件基础属性接口
 */
export interface BaseComponentProps {
  /**
   * 组件的唯一标识符
   */
  id?: string;
  
  /**
   * CSS 类名
   */
  class?: string;
  
  /**
   * 内联样式
   */
  style?: { [key: string]: string };
  
  /**
   * 是否禁用组件
   */
  disabled?: boolean;
  
  /**
   * 组件尺寸
   */
  size?: ComponentSize;
  
  /**
   * 测试标识符
   */
  'data-testid'?: string;
}

// ==================== 全局工具函数 ====================

/**
 * 生成唯一 ID
 * @param prefix ID 前缀
 * @returns 唯一 ID 字符串
 */
export function generateId(prefix: string = 'ld'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 合并 CSS 类名
 * @param classes CSS 类名数组
 * @returns 合并后的类名字符串
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * 深度合并对象
 * @param target 目标对象
 * @param sources 源对象数组
 * @returns 合并后的对象
 */
export function deepMerge<T>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * 判断是否为对象
 * @param item 待判断的项
 * @returns 是否为对象
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 限制时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ==================== 主题管理 ====================

/**
 * 主题管理器类
 */
class ThemeManager {
  private currentTheme: ThemeMode = 'light';
  private listeners: Set<(theme: ThemeMode) => void> = new Set();

  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeMode {
    return this.currentTheme;
  }

  /**
   * 设置主题
   * @param theme 主题模式
   */
  setTheme(theme: ThemeMode): void {
    this.currentTheme = theme;
    this.applyTheme(theme);
    this.notifyListeners(theme);
  }

  /**
   * 切换主题
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * 监听主题变化
   * @param listener 监听器函数
   */
  onThemeChange(listener: (theme: ThemeMode) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 应用主题到 DOM
   * @param theme 主题模式
   */
  private applyTheme(theme: ThemeMode): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      if (theme === 'auto') {
        // 自动模式：根据系统偏好设置主题
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        root.setAttribute('data-theme', theme);
      }
    }
  }

  /**
   * 通知所有监听器
   * @param theme 当前主题
   */
  private notifyListeners(theme: ThemeMode): void {
    this.listeners.forEach(listener => listener(theme));
  }

  /**
   * 初始化主题管理器
   */
  init(): void {
    if (typeof window !== 'undefined') {
      // 从 localStorage 读取保存的主题设置
      const savedTheme = localStorage.getItem('ld-theme') as ThemeMode;
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        this.setTheme(savedTheme);
      } else {
        // 默认使用系统偏好
        this.setTheme('auto');
      }

      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.currentTheme === 'auto') {
          this.applyTheme('auto');
        }
      });

      // 保存主题设置到 localStorage
      this.onThemeChange((theme) => {
        localStorage.setItem('ld-theme', theme);
      });
    }
  }
}

// 创建全局主题管理器实例
export const themeManager = new ThemeManager();

// ==================== 可访问性增强 ====================

/**
 * 可访问性管理器类
 */
class AccessibilityManager {
  /**
   * 设置焦点陷阱
   * @param element 容器元素
   */
  trapFocus(element: HTMLElement): () => void {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);

    // 返回清理函数
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }

  /**
   * 管理 ARIA 属性
   * @param element 目标元素
   * @param attributes ARIA 属性对象
   */
  setAriaAttributes(element: HTMLElement, attributes: Record<string, string>): void {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(`aria-${key}`, value);
    });
  }

  /**
   * 宣布消息给屏幕阅读器
   * @param message 要宣布的消息
   * @param priority 优先级
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (typeof document !== 'undefined') {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.textContent = message;

      document.body.appendChild(announcer);

      // 清理
      setTimeout(() => {
        document.body.removeChild(announcer);
      }, 1000);
    }
  }
}

// 创建全局可访问性管理器实例
export const accessibilityManager = new AccessibilityManager();

// ==================== 初始化 ====================

/**
 * 初始化全局配置
 */
export function initializeGlobal(): void {
  // 初始化主题管理器
  themeManager.init();

  // 添加全局键盘事件监听
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', (e) => {
      // ESC 键全局处理
      if (e.key === 'Escape') {
        const event = new CustomEvent('ld-escape', { bubbles: true });
        e.target?.dispatchEvent(event);
      }
    });
  }
}
