/**
 * @ldesign/cropper UI组件系统入口
 * 
 * 导出所有UI组件和相关类型
 */

// ============================================================================
// 基础组件
// ============================================================================

export { BaseComponent } from './BaseComponent';
export { Button } from './Button';
export { Toolbar } from './Toolbar';
export { CropToolbar } from './CropToolbar';

// ============================================================================
// UI类型定义
// ============================================================================

export type {
  // 基础UI类型
  UIComponent,
  UIEvent,
  UIEventHandler,
  UIEventType,
  
  // 组件接口
  ButtonComponent,
  PanelComponent,
  ToolbarComponent,
  ToolbarItem,
  SliderComponent,
  InputComponent,
  SelectComponent,
  SelectOption,
  SwitchComponent,
  TooltipComponent,
  ModalComponent,
  
  // 裁剪器专用组件
  CropToolbarComponent,
  CropTool,
  CropToolGroup,
  ControlPanelComponent,
  ControlPanelConfig,
  ControlItem,
  StatusIndicatorComponent,
  ProgressComponent,
  
  // 布局类型
  LayoutType,
  LayoutConfig,
  Breakpoint,
  ResponsiveConfig,
  
  // 主题集成
  UIThemeConfig,
  ComponentTheme,
  
  // 联合类型
  AnyUIComponent
} from '../types/ui';

// ============================================================================
// UI工具函数
// ============================================================================

/**
 * 创建按钮组件
 * @param config 按钮配置
 * @returns 按钮组件实例
 */
export function createButton(config: Partial<import('../types/ui').ButtonComponent> = {}): Button {
  return new Button(config);
}

/**
 * 创建工具栏组件
 * @param config 工具栏配置
 * @returns 工具栏组件实例
 */
export function createToolbar(config: Partial<import('../types/ui').ToolbarComponent> = {}): Toolbar {
  return new Toolbar(config);
}

/**
 * 创建裁剪工具栏组件
 * @param config 裁剪工具栏配置
 * @returns 裁剪工具栏组件实例
 */
export function createCropToolbar(config: Partial<import('../types/ui').CropToolbarComponent> = {}): CropToolbar {
  return new CropToolbar(config);
}

// ============================================================================
// UI主题工具
// ============================================================================

/**
 * 应用UI主题
 * @param theme 主题配置
 * @param container 容器元素
 */
export function applyUITheme(
  theme: import('../types/ui').UIThemeConfig,
  container: HTMLElement = document.documentElement
): void {
  // 应用CSS变量
  Object.entries(theme.variables).forEach(([property, value]) => {
    container.style.setProperty(property, value);
  });

  // 添加主题类名
  container.classList.add('ldesign-cropper-ui-themed');
}

/**
 * 移除UI主题
 * @param theme 主题配置
 * @param container 容器元素
 */
export function removeUITheme(
  theme: import('../types/ui').UIThemeConfig,
  container: HTMLElement = document.documentElement
): void {
  // 移除CSS变量
  Object.keys(theme.variables).forEach(property => {
    container.style.removeProperty(property);
  });

  // 移除主题类名
  container.classList.remove('ldesign-cropper-ui-themed');
}

// ============================================================================
// 响应式工具
// ============================================================================

/**
 * 获取当前断点
 * @param breakpoints 断点配置
 * @returns 当前断点
 */
export function getCurrentBreakpoint(
  breakpoints: Record<import('../types/ui').Breakpoint, number>
): import('../types/ui').Breakpoint {
  const width = window.innerWidth;
  
  if (width >= breakpoints.xxl) return 'xxl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

/**
 * 监听断点变化
 * @param breakpoints 断点配置
 * @param callback 回调函数
 * @returns 清理函数
 */
export function watchBreakpoint(
  breakpoints: Record<import('../types/ui').Breakpoint, number>,
  callback: (breakpoint: import('../types/ui').Breakpoint) => void
): () => void {
  let currentBreakpoint = getCurrentBreakpoint(breakpoints);
  
  const handleResize = () => {
    const newBreakpoint = getCurrentBreakpoint(breakpoints);
    if (newBreakpoint !== currentBreakpoint) {
      currentBreakpoint = newBreakpoint;
      callback(newBreakpoint);
    }
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}

// ============================================================================
// DOM工具
// ============================================================================

/**
 * 创建DOM元素
 * @param tag 标签名
 * @param className CSS类名
 * @param attributes 属性
 * @returns DOM元素
 */
export function createElement(
  tag: string,
  className?: string,
  attributes?: Record<string, string>
): HTMLElement {
  const element = document.createElement(tag);
  
  if (className) {
    element.className = className;
  }
  
  if (attributes) {
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
  }
  
  return element;
}

/**
 * 查找最近的父元素
 * @param element 起始元素
 * @param selector CSS选择器
 * @returns 匹配的父元素或null
 */
export function findClosest(element: HTMLElement, selector: string): HTMLElement | null {
  let current: HTMLElement | null = element;
  
  while (current && current !== document.documentElement) {
    if (current.matches(selector)) {
      return current;
    }
    current = current.parentElement;
  }
  
  return null;
}

/**
 * 检查元素是否在视口内
 * @param element DOM元素
 * @param threshold 阈值（0-1）
 * @returns 是否在视口内
 */
export function isElementInViewport(element: HTMLElement, threshold: number = 0): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  const verticalVisible = (rect.top + rect.height * threshold) < windowHeight && 
                         (rect.bottom - rect.height * threshold) > 0;
  const horizontalVisible = (rect.left + rect.width * threshold) < windowWidth && 
                           (rect.right - rect.width * threshold) > 0;
  
  return verticalVisible && horizontalVisible;
}

// ============================================================================
// 事件工具
// ============================================================================

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * 一次性事件监听器
 * @param element 目标元素
 * @param event 事件名称
 * @param handler 事件处理器
 */
export function once(
  element: HTMLElement,
  event: string,
  handler: EventListener
): void {
  const onceHandler = (e: Event) => {
    handler(e);
    element.removeEventListener(event, onceHandler);
  };
  
  element.addEventListener(event, onceHandler);
}

// ============================================================================
// 样式工具
// ============================================================================

/**
 * 获取CSS变量值
 * @param property CSS变量名
 * @param element 目标元素
 * @returns CSS变量值
 */
export function getCSSVariable(property: string, element: HTMLElement = document.documentElement): string {
  return getComputedStyle(element).getPropertyValue(property).trim();
}

/**
 * 设置CSS变量值
 * @param property CSS变量名
 * @param value 变量值
 * @param element 目标元素
 */
export function setCSSVariable(
  property: string,
  value: string,
  element: HTMLElement = document.documentElement
): void {
  element.style.setProperty(property, value);
}

/**
 * 批量设置CSS变量
 * @param variables 变量映射
 * @param element 目标元素
 */
export function setCSSVariables(
  variables: Record<string, string>,
  element: HTMLElement = document.documentElement
): void {
  Object.entries(variables).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

// ============================================================================
// 默认配置
// ============================================================================

/**
 * 默认断点配置
 */
export const DEFAULT_BREAKPOINTS: Record<import('../types/ui').Breakpoint, number> = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
};

/**
 * 默认UI主题配置
 */
export const DEFAULT_UI_THEME: import('../types/ui').UIThemeConfig = {
  components: {
    button: {
      base: {
        'border-radius': 'var(--ls-border-radius-base)',
        'font-size': 'var(--ls-font-size-sm)',
        'padding': '0 var(--ls-padding-sm)',
        'height': 'var(--ls-button-height-medium)',
        'border': '1px solid var(--ldesign-border-color)',
        'background': 'var(--ldesign-bg-color-component)',
        'color': 'var(--ldesign-text-color-primary)',
        'cursor': 'pointer',
        'transition': 'all 0.2s ease'
      },
      variants: {
        primary: {
          'background': 'var(--ldesign-brand-color)',
          'color': 'var(--ldesign-font-white-1)',
          'border-color': 'var(--ldesign-brand-color)'
        },
        secondary: {
          'background': 'var(--ldesign-gray-color-1)',
          'color': 'var(--ldesign-text-color-primary)',
          'border-color': 'var(--ldesign-border-color)'
        }
      },
      sizes: {
        small: {
          'height': 'var(--ls-button-height-small)',
          'font-size': 'var(--ls-font-size-xs)',
          'padding': '0 var(--ls-padding-xs)'
        },
        large: {
          'height': 'var(--ls-button-height-large)',
          'font-size': 'var(--ls-font-size-base)',
          'padding': '0 var(--ls-padding-base)'
        }
      }
    }
  },
  variables: {
    '--ldesign-cropper-ui-font-family': 'system-ui, -apple-system, sans-serif',
    '--ldesign-cropper-ui-z-index-base': '1000',
    '--ldesign-cropper-ui-z-index-modal': '2000',
    '--ldesign-cropper-ui-z-index-tooltip': '3000'
  },
  breakpoints: DEFAULT_BREAKPOINTS
};
