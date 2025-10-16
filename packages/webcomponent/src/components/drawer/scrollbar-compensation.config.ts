/**
 * 滚动条补偿配置
 * @description 用于自定义滚动条补偿行为
 */

export interface ScrollbarCompensationConfig {
  /** 是否启用滚动条补偿 */
  enabled: boolean;
  
  /** 是否自动检测 fixed/sticky 元素 */
  autoDetectFixed: boolean;
  
  /** 固定元素选择器（手动指定需要补偿的元素） */
  fixedSelectors?: string[];
  
  /** 排除的选择器（不进行补偿的元素） */
  excludeSelectors?: string[];
  
  /** 最小滚动条宽度（小于此值不进行补偿） */
  minScrollbarWidth: number;
  
  /** 是否使用 RAF 优化 */
  useRequestAnimationFrame: boolean;
  
  /** 是否启用调试模式 */
  debug: boolean;
  
  /** iOS 特殊处理 */
  iosFixedPosition: boolean;
  
  /** 性能优化：限制扫描的元素数量 */
  maxElementsToScan?: number;
  
  /** 补偿策略 */
  compensationStrategy: 'padding' | 'margin' | 'auto';
}

/** 默认配置 */
export const defaultScrollbarCompensationConfig: ScrollbarCompensationConfig = {
  enabled: true,
  autoDetectFixed: true,
  fixedSelectors: [],
  excludeSelectors: [],
  minScrollbarWidth: 0,
  useRequestAnimationFrame: true,
  debug: false,
  iosFixedPosition: true,
  maxElementsToScan: 1000,
  compensationStrategy: 'auto',
};

/** 滚动条补偿管理器 */
export class ScrollbarCompensationManager {
  private static instance: ScrollbarCompensationManager;
  private config: ScrollbarCompensationConfig;
  private originalStyles: Map<HTMLElement, Map<string, string>> = new Map();
  
  private constructor(config?: Partial<ScrollbarCompensationConfig>) {
    this.config = { ...defaultScrollbarCompensationConfig, ...config };
  }
  
  static getInstance(config?: Partial<ScrollbarCompensationConfig>): ScrollbarCompensationManager {
    if (!ScrollbarCompensationManager.instance) {
      ScrollbarCompensationManager.instance = new ScrollbarCompensationManager(config);
    }
    return ScrollbarCompensationManager.instance;
  }
  
  /** 更新配置 */
  updateConfig(config: Partial<ScrollbarCompensationConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /** 获取当前配置 */
  getConfig(): ScrollbarCompensationConfig {
    return { ...this.config };
  }
  
  /** 计算滚动条宽度 */
  getScrollbarWidth(): number {
    return window.innerWidth - document.documentElement.clientWidth;
  }
  
  /** 保存元素的原始样式 */
  private saveOriginalStyles(element: HTMLElement, properties: string[]): void {
    if (!this.originalStyles.has(element)) {
      this.originalStyles.set(element, new Map());
    }
    
    const styleMap = this.originalStyles.get(element)!;
    const computedStyle = window.getComputedStyle(element);
    
    properties.forEach(prop => {
      if (!styleMap.has(prop)) {
        styleMap.set(prop, computedStyle.getPropertyValue(prop));
      }
    });
  }
  
  /** 恢复元素的原始样式 */
  private restoreOriginalStyles(element: HTMLElement): void {
    const styleMap = this.originalStyles.get(element);
    if (!styleMap) return;
    
    styleMap.forEach((value, prop) => {
      element.style.setProperty(prop, value);
    });
    
    this.originalStyles.delete(element);
  }
  
  /** 查找需要补偿的元素 */
  findElementsToCompensate(): HTMLElement[] {
    const elements: HTMLElement[] = [];
    
    // 手动指定的选择器
    if (this.config?.fixedSelectors && this.config?.fixedSelectors.length > 0) {
      this.config?.fixedSelectors.forEach(selector => {
        const found = document.querySelectorAll<HTMLElement>(selector);
        elements.push(...Array.from(found));
      });
    }
    
    // 自动检测
    if (this.config?.autoDetectFixed) {
      const allElements = document.querySelectorAll<HTMLElement>('*');
      const maxScan = this.config?.maxElementsToScan || allElements.length;
      let scanned = 0;
      
      for (const el of Array.from(allElements)) {
        if (scanned >= maxScan) break;
        scanned++;
        
        // 检查是否在排除列表中
        if (this.config?.excludeSelectors?.some(selector => el.matches(selector))) {
          continue;
        }
        
        const style = window.getComputedStyle(el);
        const position = style.position;
        
        if (position === 'fixed' || position === 'sticky') {
          const rect = el.getBoundingClientRect();
          const isFullWidth = rect.width >= window.innerWidth - 20;
          const isRightAligned = rect.right >= window.innerWidth - 20;
          
          if (isFullWidth || isRightAligned) {
            elements.push(el);
          }
        }
      }
    }
    
    // 去重
    return Array.from(new Set(elements));
  }
  
  /** 应用补偿 */
  applyCompensation(scrollbarWidth: number): void {
    if (!this.config?.enabled) return;
    if (scrollbarWidth < this.config?.minScrollbarWidth) return;
    
    const elements = this.findElementsToCompensate();
    
    if (this.config?.debug) {
      
    }
    
    elements.forEach(el => {
      this.saveOriginalStyles(el, ['padding-right', 'right', 'margin-right']);
      
      const style = window.getComputedStyle(el);
      const strategy = this.config?.compensationStrategy;
      
      // 自动策略：根据元素的 right 属性选择
      if (strategy === 'auto') {
        const right = style.right;
        if (right !== 'auto' && right !== '0px') {
          // 使用 right 定位
          const currentRight = parseInt(right) || 0;
          el.style.right = `${currentRight + scrollbarWidth}px`;
        } else {
          // 使用 padding-right
          const currentPadding = parseInt(style.paddingRight) || 0;
          el.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
        }
      } else if (strategy === 'padding') {
        const currentPadding = parseInt(style.paddingRight) || 0;
        el.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
      } else if (strategy === 'margin') {
        const currentMargin = parseInt(style.marginRight) || 0;
        el.style.marginRight = `${currentMargin + scrollbarWidth}px`;
      }
      
      el.setAttribute('data-scroll-compensated', 'true');
    });
  }
  
  /** 移除补偿 */
  removeCompensation(): void {
    const compensatedElements = document.querySelectorAll<HTMLElement>('[data-scroll-compensated="true"]');
    
    compensatedElements.forEach(el => {
      this.restoreOriginalStyles(el);
      el.removeAttribute('data-scroll-compensated');
    });
    
    if (this.config?.debug) {
      
    }
  }
  
  /** 清理 */
  cleanup(): void {
    this.removeCompensation();
    this.originalStyles.clear();
  }
}

/** 全局实例 */
export const scrollbarCompensationManager = ScrollbarCompensationManager.getInstance();

/** 辅助函数：快速配置 */
export function configureScrollbarCompensation(config: Partial<ScrollbarCompensationConfig>): void {
  scrollbarCompensationManager.updateConfig(config);
}

/** 辅助函数：启用调试模式 */
export function enableScrollbarCompensationDebug(enable: boolean = true): void {
  scrollbarCompensationManager.updateConfig({ debug: enable });
}

/** 辅助函数：添加需要补偿的选择器 */
export function addFixedSelector(selector: string): void {
  const config = scrollbarCompensationManager.getConfig();
  const fixedSelectors = [...(config.fixedSelectors || []), selector];
  scrollbarCompensationManager.updateConfig({ fixedSelectors });
}

/** 辅助函数：添加排除的选择器 */
export function addExcludeSelector(selector: string): void {
  const config = scrollbarCompensationManager.getConfig();
  const excludeSelectors = [...(config.excludeSelectors || []), selector];
  scrollbarCompensationManager.updateConfig({ excludeSelectors });
}
