/**
 * @ldesign/cropper 按钮组件
 * 
 * 提供可配置的按钮UI组件
 */

import { BaseComponent } from './BaseComponent';
import type { ButtonComponent } from '../types/ui';

// ============================================================================
// 按钮组件类
// ============================================================================

/**
 * 按钮组件类
 * 提供可配置的按钮功能
 */
export class Button extends BaseComponent implements ButtonComponent {
  public readonly type = 'button' as const;
  
  /** 按钮配置 */
  protected declare config: ButtonComponent;
  
  /** 按钮文本元素 */
  private textElement: HTMLSpanElement | null = null;
  
  /** 按钮图标元素 */
  private iconElement: HTMLSpanElement | null = null;
  
  /** 加载指示器元素 */
  private loadingElement: HTMLSpanElement | null = null;

  constructor(config: Partial<ButtonComponent> = {}) {
    super({
      variant: 'primary',
      buttonSize: 'medium',
      loading: false,
      ...config
    });
  }

  // ============================================================================
  // 属性访问器
  // ============================================================================

  /**
   * 获取按钮文本
   */
  get text(): string | undefined {
    return this.config.text;
  }

  /**
   * 设置按钮文本
   */
  set text(value: string | undefined) {
    this.config.text = value;
    this.updateText();
  }

  /**
   * 获取按钮图标
   */
  get icon(): string | undefined {
    return this.config.icon;
  }

  /**
   * 设置按钮图标
   */
  set icon(value: string | undefined) {
    this.config.icon = value;
    this.updateIcon();
  }

  /**
   * 获取按钮变体
   */
  get variant(): ButtonComponent['variant'] {
    return this.config.variant || 'primary';
  }

  /**
   * 设置按钮变体
   */
  set variant(value: ButtonComponent['variant']) {
    this.config.variant = value;
    this.updateVariant();
  }

  /**
   * 获取按钮尺寸
   */
  get buttonSize(): ButtonComponent['buttonSize'] {
    return this.config.buttonSize || 'medium';
  }

  /**
   * 设置按钮尺寸
   */
  set buttonSize(value: ButtonComponent['buttonSize']) {
    this.config.buttonSize = value;
    this.updateSize();
  }

  /**
   * 获取加载状态
   */
  get loading(): boolean {
    return this.config.loading || false;
  }

  /**
   * 设置加载状态
   */
  set loading(value: boolean) {
    this.config.loading = value;
    this.updateLoading();
  }

  // ============================================================================
  // 组件生命周期
  // ============================================================================

  /**
   * 创建按钮DOM元素
   */
  protected createElement(): HTMLElement {
    const button = document.createElement('button');
    button.type = 'button';
    
    // 创建图标元素
    this.iconElement = document.createElement('span');
    this.iconElement.className = 'ldesign-cropper-button-icon';
    
    // 创建文本元素
    this.textElement = document.createElement('span');
    this.textElement.className = 'ldesign-cropper-button-text';
    
    // 创建加载指示器
    this.loadingElement = document.createElement('span');
    this.loadingElement.className = 'ldesign-cropper-button-loading';
    this.loadingElement.innerHTML = `
      <svg class="ldesign-cropper-loading-spinner" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
    
    // 按顺序添加元素
    button.appendChild(this.loadingElement);
    button.appendChild(this.iconElement);
    button.appendChild(this.textElement);
    
    return button;
  }

  /**
   * 渲染按钮内容
   */
  protected render(): void {
    this.updateText();
    this.updateIcon();
    this.updateVariant();
    this.updateButtonSize();
    this.updateLoading();
  }

  /**
   * 获取基础CSS类名
   */
  protected getBaseClasses(): string[] {
    return [
      ...super.getBaseClasses(),
      'ldesign-cropper-button',
      `ldesign-cropper-button-${this.variant}`,
      `ldesign-cropper-button-${this.buttonSize}`
    ];
  }

  /**
   * 绑定DOM事件
   */
  protected bindEvents(): void {
    super.bindEvents();
    
    if (this.element) {
      this.element.addEventListener('click', this.handleButtonClick.bind(this));
    }
  }

  // ============================================================================
  // 更新方法
  // ============================================================================

  /**
   * 更新按钮文本
   */
  private updateText(): void {
    if (!this.textElement) return;
    
    if (this.text) {
      this.textElement.textContent = this.text;
      this.textElement.style.display = '';
    } else {
      this.textElement.textContent = '';
      this.textElement.style.display = 'none';
    }
  }

  /**
   * 更新按钮图标
   */
  private updateIcon(): void {
    if (!this.iconElement) return;
    
    if (this.icon) {
      // 支持多种图标格式
      if (this.icon.startsWith('<svg')) {
        // SVG图标
        this.iconElement.innerHTML = this.icon;
      } else if (this.icon.startsWith('data:') || this.icon.includes('.')) {
        // 图片图标
        this.iconElement.innerHTML = `<img src="${this.icon}" alt="icon" />`;
      } else {
        // 字体图标或Unicode
        this.iconElement.innerHTML = this.icon;
      }
      this.iconElement.style.display = '';
    } else {
      this.iconElement.innerHTML = '';
      this.iconElement.style.display = 'none';
    }
  }

  /**
   * 更新按钮变体
   */
  private updateVariant(): void {
    if (!this.element) return;
    
    // 移除旧的变体类名
    const variantClasses = ['primary', 'secondary', 'outline', 'ghost', 'danger'];
    variantClasses.forEach(variant => {
      this.element!.classList.remove(`ldesign-cropper-button-${variant}`);
    });
    
    // 添加新的变体类名
    this.element.classList.add(`ldesign-cropper-button-${this.variant}`);
  }

  /**
   * 更新按钮尺寸
   */
  private updateButtonSize(): void {
    if (!this.element) return;
    
    // 移除旧的尺寸类名
    const sizeClasses = ['small', 'medium', 'large'];
    sizeClasses.forEach(size => {
      this.element!.classList.remove(`ldesign-cropper-button-${size}`);
    });
    
    // 添加新的尺寸类名
    this.element.classList.add(`ldesign-cropper-button-${this.buttonSize}`);
  }

  /**
   * 更新加载状态
   */
  private updateLoading(): void {
    if (!this.element || !this.loadingElement) return;
    
    if (this.loading) {
      this.element.classList.add('ldesign-cropper-button-loading');
      this.loadingElement.style.display = '';
      this.element.setAttribute('disabled', 'true');
    } else {
      this.element.classList.remove('ldesign-cropper-button-loading');
      this.loadingElement.style.display = 'none';
      if (this.enabled) {
        this.element.removeAttribute('disabled');
      }
    }
  }

  // ============================================================================
  // 事件处理
  // ============================================================================

  /**
   * 处理按钮点击事件
   */
  private handleButtonClick(event: MouseEvent): void {
    if (!this.enabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // 触发自定义点击事件
    if (this.config.onClick) {
      try {
        this.config.onClick(event);
      } catch (error) {
        console.error('Error in button click handler:', error);
      }
    }
  }

  // ============================================================================
  // 公共方法
  // ============================================================================

  /**
   * 设置点击事件处理器
   * @param handler 点击事件处理器
   */
  onClick(handler: (event: MouseEvent) => void): void {
    this.config.onClick = handler;
  }

  /**
   * 模拟点击
   */
  click(): void {
    if (this.element && this.enabled && !this.loading) {
      this.element.click();
    }
  }

  /**
   * 设置焦点
   */
  focus(): void {
    if (this.element && this.enabled) {
      this.element.focus();
    }
  }

  /**
   * 失去焦点
   */
  blur(): void {
    if (this.element) {
      this.element.blur();
    }
  }

  /**
   * 显示加载状态
   * @param duration 加载持续时间（毫秒），0表示手动停止
   */
  showLoading(duration: number = 0): void {
    this.loading = true;
    
    if (duration > 0) {
      setTimeout(() => {
        this.loading = false;
      }, duration);
    }
  }

  /**
   * 隐藏加载状态
   */
  hideLoading(): void {
    this.loading = false;
  }
}
