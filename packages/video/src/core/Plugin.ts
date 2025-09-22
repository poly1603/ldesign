/**
 * UI 插件类实现
 * 继承自 BasePlugin，提供 DOM 操作和 UI 渲染功能
 */

import { BasePlugin } from './BasePlugin';
import type {
  IPlayer,
  PluginConfig,
  PluginMetadata,
  PluginPosition
} from '../types';

/**
 * UI 插件配置接口
 */
export interface UIPluginConfig extends PluginConfig {
  position?: PluginPosition;
  template?: string | (() => string);
  styles?: string | (() => string);
  className?: string;
  tag?: string;
  innerHTML?: string;
  attributes?: Record<string, string>;
}

/**
 * UI 插件类
 * 提供 DOM 操作和 UI 渲染功能
 */
export abstract class Plugin extends BasePlugin {
  protected readonly _uiConfig: UIPluginConfig;
  protected _template?: string;
  protected _styles?: string;
  protected readonly _eventDelegates: Map<string, (event: Event) => void>;

  constructor(player: IPlayer, config: UIPluginConfig, metadata: PluginMetadata) {
    super(player, config, metadata);
    this._uiConfig = config;
    this._eventDelegates = new Map();
  }

  // ==================== DOM 操作方法 ====================

  /**
   * 创建插件元素
   */
  protected createElement(): HTMLElement {
    const tag = this._uiConfig.tag || 'div';
    const element = document.createElement(tag);
    
    // 设置基础类名
    element.className = `ldesign-plugin ldesign-plugin-${this.name}`;
    
    // 添加自定义类名
    if (this._uiConfig.className) {
      element.classList.add(...this._uiConfig.className.split(' '));
    }
    
    // 设置属性
    if (this._uiConfig.attributes) {
      Object.entries(this._uiConfig.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    // 设置内容
    if (this._uiConfig.innerHTML) {
      element.innerHTML = this._uiConfig.innerHTML;
    } else {
      const content = this.render();
      if (typeof content === 'string') {
        element.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        element.appendChild(content);
      }
    }
    
    return element;
  }

  /**
   * 查找子元素
   */
  protected find(selector: string): HTMLElement | null {
    return this._element ? this._element.querySelector(selector) : null;
  }

  /**
   * 查找所有子元素
   */
  protected findAll(selector: string): NodeListOf<HTMLElement> {
    return this._element ? this._element.querySelectorAll(selector) : document.querySelectorAll('');
  }

  /**
   * 添加事件委托
   */
  protected delegate(
    selector: string,
    event: string,
    handler: (event: Event, target: HTMLElement) => void
  ): void {
    if (!this._element) return;

    const delegateHandler = (event: Event) => {
      const target = event.target as HTMLElement;
      const matchedElement = target.closest(selector) as HTMLElement;
      
      if (matchedElement && this._element!.contains(matchedElement)) {
        handler(event, matchedElement);
      }
    };

    const key = `${selector}:${event}`;
    this._eventDelegates.set(key, delegateHandler);
    this._element.addEventListener(event, delegateHandler);
  }

  /**
   * 移除事件委托
   */
  protected undelegate(selector: string, event: string): void {
    if (!this._element) return;

    const key = `${selector}:${event}`;
    const handler = this._eventDelegates.get(key);
    
    if (handler) {
      this._element.removeEventListener(event, handler);
      this._eventDelegates.delete(key);
    }
  }

  /**
   * 设置元素内容
   */
  protected setContent(content: string | HTMLElement): void {
    if (!this._element) return;

    if (typeof content === 'string') {
      this._element.innerHTML = content;
    } else {
      this._element.innerHTML = '';
      this._element.appendChild(content);
    }
  }

  /**
   * 添加子元素
   */
  protected appendChild(child: HTMLElement): void {
    if (this._element) {
      this._element.appendChild(child);
    }
  }

  /**
   * 移除子元素
   */
  protected removeChild(child: HTMLElement): void {
    if (this._element && this._element.contains(child)) {
      this._element.removeChild(child);
    }
  }

  /**
   * 获取元素位置信息
   */
  protected getBoundingRect(): DOMRect | null {
    return this._element ? this._element.getBoundingClientRect() : null;
  }

  // ==================== 样式方法扩展 ====================

  /**
   * 设置 CSS 变量
   */
  protected setCSSVariable(name: string, value: string): void {
    if (this._element) {
      this._element.style.setProperty(`--${name}`, value);
    }
  }

  /**
   * 获取 CSS 变量
   */
  protected getCSSVariable(name: string): string {
    if (this._element) {
      return getComputedStyle(this._element).getPropertyValue(`--${name}`);
    }
    return '';
  }

  /**
   * 切换类名
   */
  protected toggleClass(className: string, force?: boolean): void {
    if (this._element) {
      this._element.classList.toggle(className, force);
    }
  }

  /**
   * 应用样式表
   */
  protected applyStyles(styles: string): void {
    if (!styles) return;

    const styleId = `ldesign-plugin-${this.name}-styles`;
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = styles;
  }

  /**
   * 移除样式表
   */
  protected removeStyles(): void {
    const styleId = `ldesign-plugin-${this.name}-styles`;
    const styleElement = document.getElementById(styleId);
    
    if (styleElement) {
      styleElement.remove();
    }
  }

  // ==================== 动画方法 ====================

  /**
   * 淡入动画
   */
  protected fadeIn(duration = 300): Promise<void> {
    return this.animate([
      { opacity: '0' },
      { opacity: '1' }
    ], duration);
  }

  /**
   * 淡出动画
   */
  protected fadeOut(duration = 300): Promise<void> {
    return this.animate([
      { opacity: '1' },
      { opacity: '0' }
    ], duration);
  }

  /**
   * 滑入动画
   */
  protected slideIn(direction: 'up' | 'down' | 'left' | 'right' = 'down', duration = 300): Promise<void> {
    const transforms = {
      up: ['translateY(100%)', 'translateY(0)'],
      down: ['translateY(-100%)', 'translateY(0)'],
      left: ['translateX(100%)', 'translateX(0)'],
      right: ['translateX(-100%)', 'translateX(0)']
    };

    return this.animate([
      { transform: transforms[direction][0] },
      { transform: transforms[direction][1] }
    ], duration);
  }

  /**
   * 通用动画方法
   */
  protected animate(keyframes: Keyframe[], duration: number): Promise<void> {
    if (!this._element) return Promise.resolve();

    return new Promise((resolve) => {
      const animation = this._element!.animate(keyframes, {
        duration,
        easing: 'ease-out',
        fill: 'forwards'
      });

      animation.addEventListener('finish', () => resolve());
    });
  }

  // ==================== 生命周期实现 ====================

  protected async onInit(): Promise<void> {
    // 加载模板
    if (this._uiConfig.template) {
      this._template = typeof this._uiConfig.template === 'function'
        ? this._uiConfig.template()
        : this._uiConfig.template;
    }

    // 加载样式
    if (this._uiConfig.styles) {
      this._styles = typeof this._uiConfig.styles === 'function'
        ? this._uiConfig.styles()
        : this._uiConfig.styles;
      
      this.applyStyles(this._styles);
    }

    // 调用子类初始化
    await this.onUIInit();
  }

  protected async onMount(): Promise<void> {
    // 创建元素
    this._element = this.createElement();
    this._context.element = this._element;

    // 挂载到容器
    if (this._container) {
      this.mountToContainer();
    }

    // 绑定事件
    this.bindUIEvents();

    // 调用子类挂载
    await this.onUIMount();
  }

  protected async onUnmount(): Promise<void> {
    // 解绑事件
    this.unbindUIEvents();

    // 调用子类卸载
    await this.onUIUnmount();

    // 移除元素
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    this._element = undefined;
    this._context.element = undefined;
  }

  protected async onDestroy(): Promise<void> {
    // 移除样式
    this.removeStyles();

    // 清理事件委托
    this._eventDelegates.clear();

    // 调用子类销毁
    await this.onUIDestroy();
  }

  protected onShow(): void {
    if (this._element) {
      this._element.style.display = '';
      this._element.classList.remove('ldesign-plugin-hidden');
    }
    this.onUIShow();
  }

  protected onHide(): void {
    if (this._element) {
      this._element.style.display = 'none';
      this._element.classList.add('ldesign-plugin-hidden');
    }
    this.onUIHide();
  }

  // ==================== 抽象方法 ====================

  /**
   * 渲染插件内容
   */
  protected abstract render(): string | HTMLElement | void;

  // ==================== 可选的 UI 生命周期钩子 ====================

  protected async onUIInit(): Promise<void> {}
  protected async onUIMount(): Promise<void> {}
  protected async onUIUnmount(): Promise<void> {}
  protected async onUIDestroy(): Promise<void> {}
  protected onUIShow(): void {}
  protected onUIHide(): void {}
  protected bindUIEvents(): void {}
  protected unbindUIEvents(): void {}

  // ==================== 私有方法 ====================

  private mountToContainer(): void {
    if (!this._container || !this._element) return;

    const position = this._uiConfig.position;
    
    // 根据位置决定插入方式
    if (position && position.includes('controls')) {
      // 插入到控制栏
      this.mountToControls();
    } else {
      // 插入到根容器
      this._container.appendChild(this._element);
    }
  }

  private mountToControls(): void {
    // 查找或创建控制栏
    let controlsContainer = this._container!.querySelector('.ldesign-controls');
    
    if (!controlsContainer) {
      controlsContainer = document.createElement('div');
      controlsContainer.className = 'ldesign-controls';
      this._container!.appendChild(controlsContainer);
    }

    // 根据位置插入到控制栏的不同区域
    const position = this._uiConfig.position;
    let targetContainer = controlsContainer;

    if (position === PluginPosition.CONTROLS_LEFT) {
      targetContainer = this.getOrCreateControlsSection(controlsContainer, 'left');
    } else if (position === PluginPosition.CONTROLS_RIGHT) {
      targetContainer = this.getOrCreateControlsSection(controlsContainer, 'right');
    } else if (position === PluginPosition.CONTROLS_CENTER) {
      targetContainer = this.getOrCreateControlsSection(controlsContainer, 'center');
    }

    targetContainer.appendChild(this._element!);
  }

  private getOrCreateControlsSection(controlsContainer: Element, section: string): Element {
    let sectionContainer = controlsContainer.querySelector(`.ldesign-controls-${section}`);
    
    if (!sectionContainer) {
      sectionContainer = document.createElement('div');
      sectionContainer.className = `ldesign-controls-${section}`;
      controlsContainer.appendChild(sectionContainer);
    }
    
    return sectionContainer;
  }
}
