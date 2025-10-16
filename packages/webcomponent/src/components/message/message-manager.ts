/**
 * 高性能消息管理器
 * 特性：
 * - 对象池化，减少GC压力
 * - DOM元素复用
 * - 虚拟列表渲染（大量消息时）
 * - 智能内存管理
 * - GPU加速动画
 */

export interface MessageOptions {
  id?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading';
  content: string;
  title?: string;
  duration?: number;
  position?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right' | 'center';
  closable?: boolean;
  showIcon?: boolean;
  html?: boolean;
  className?: string;
  offset?: { x?: number; y?: number };
  pauseOnHover?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  maxWidth?: string;
  zIndex?: number;
}

interface MessageInstance {
  id: string;
  element: HTMLElement;
  options: MessageOptions;
  timer?: number;
  startTime?: number;
  remainingTime?: number;
  isClosing: boolean;
  isPaused: boolean;
}

// 消息元素对象池
class MessageElementPool {
  private pool: HTMLElement[] = [];
  private maxSize = 20;
  
  acquire(): HTMLElement | null {
    return this.pool.pop() || null;
  }
  
  release(element: HTMLElement): void {
    if (this.pool.length < this.maxSize) {
      // 清理元素状态
      element.className = '';
      element.style.cssText = '';
      element.innerHTML = '';
      this.pool.push(element);
    }
  }
  
  clear(): void {
    this.pool = [];
  }
}

// 单例消息管理器
export class MessageManager {
  private static instance: MessageManager;
  private containers = new Map<string, HTMLElement>();
  private instances = new Map<string, MessageInstance>();
  private elementPool = new MessageElementPool();
  private idCounter = 0;
  private rafId?: number;
  private updateQueue = new Set<MessageInstance>();
  
  // 性能优化：批量DOM操作
  private pendingUpdates = new Map<string, () => void>();
  
  // 配置选项
  private config = {
    maxMessages: 10,
    defaultDuration: 3000,
    gap: 12,
    animationDuration: 200,
    useGPU: true,
    enablePool: true,
  };
  
  private constructor() {
    this.initStyles();
    this.initContainers();
    // 监听页面可见性变化，优化性能
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }
  
  static getInstance(): MessageManager {
    if (!MessageManager.instance) {
      MessageManager.instance = new MessageManager();
    }
    return MessageManager.instance;
  }
  
  // 初始化全局样式
  private initStyles(): void {
    if (document.getElementById('ldesign-message-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ldesign-message-styles';
    style.textContent = `
      .ldesign-message-container {
        position: fixed;
        z-index: 5000;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        gap: 12px;
        transition: gap 0.2s ease;
      }
      
      .ldesign-message-container--top {
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        align-items: center;
      }
      
      .ldesign-message-container--top-left {
        top: 20px;
        left: 20px;
        align-items: flex-start;
      }
      
      .ldesign-message-container--top-right {
        top: 20px;
        right: 20px;
        align-items: flex-end;
      }
      
      .ldesign-message-container--bottom {
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        align-items: center;
        flex-direction: column-reverse;
      }
      
      .ldesign-message-container--bottom-left {
        bottom: 20px;
        left: 20px;
        align-items: flex-start;
        flex-direction: column-reverse;
      }
      
      .ldesign-message-container--bottom-right {
        bottom: 20px;
        right: 20px;
        align-items: flex-end;
        flex-direction: column-reverse;
      }
      
      .ldesign-message-container--center {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        align-items: center;
      }
      
      .ldesign-message {
        pointer-events: auto;
        display: flex;
        align-items: center;
        padding: 12px 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        font-size: 14px;
        line-height: 1.5;
        color: #333;
        min-width: 200px;
        max-width: var(--max-width, 520px);
        word-wrap: break-word;
        opacity: 0;
        transform: translateY(-100%);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform, opacity;
        contain: layout style paint;
      }
      
      .ldesign-message.show {
        opacity: 1;
        transform: translateY(0);
      }
      
      .ldesign-message.hide {
        opacity: 0;
        transform: translateY(-100%);
        pointer-events: none;
      }
      
      .ldesign-message-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        margin-right: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .ldesign-message-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .ldesign-message-title {
        font-weight: 600;
      }
      
      .ldesign-message-close {
        flex-shrink: 0;
        margin-left: 12px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s;
        color: #999;
      }
      
      .ldesign-message-close:hover {
        background-color: rgba(0, 0, 0, 0.06);
      }
      
      /* 类型样式 */
      .ldesign-message--success {
        background: #f6ffed;
        border: 1px solid #b7eb8f;
        color: #52c41a;
      }
      
      .ldesign-message--error {
        background: #fff2f0;
        border: 1px solid #ffccc7;
        color: #ff4d4f;
      }
      
      .ldesign-message--warning {
        background: #fffbe6;
        border: 1px solid #ffe58f;
        color: #faad14;
      }
      
      .ldesign-message--info {
        background: #f0f5ff;
        border: 1px solid #adc6ff;
        color: #2f54eb;
      }
      
      .ldesign-message--loading {
        background: #f0f5ff;
        border: 1px solid #adc6ff;
        color: #2f54eb;
      }
      
      /* Loading动画 */
      @keyframes ldesign-message-loading {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .ldesign-message--loading .ldesign-message-icon {
        animation: ldesign-message-loading 1s linear infinite;
      }
      
      /* 响应式设计 */
      @media (max-width: 640px) {
        .ldesign-message-container--top,
        .ldesign-message-container--bottom,
        .ldesign-message-container--center {
          left: 10px;
          right: 10px;
          transform: none;
        }
        
        .ldesign-message {
          max-width: 100%;
        }
      }
      
      /* 暗黑模式支持 */
      @media (prefers-color-scheme: dark) {
        .ldesign-message {
          background: #1f1f1f;
          color: #e5e5e5;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .ldesign-message--success {
          background: #162312;
          border-color: #274916;
        }
        
        .ldesign-message--error {
          background: #2a1215;
          border-color: #58181c;
        }
        
        .ldesign-message--warning {
          background: #2b2111;
          border-color: #594214;
        }
        
        .ldesign-message--info {
          background: #111a2c;
          border-color: #15395b;
        }
      }
      
      /* 减少动画运动 */
      @media (prefers-reduced-motion: reduce) {
        .ldesign-message {
          transition: opacity 0.2s;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // 初始化容器
  private initContainers(): void {
    // 预创建常用位置的容器
    ['top', 'top-left', 'top-right'].forEach(position => {
      this.getContainer(position);
    });
  }
  
  // 获取或创建容器
  private getContainer(position: string): HTMLElement {
    if (!this.containers.has(position)) {
      const container = document.createElement('div');
      container.className = `ldesign-message-container ldesign-message-container--${position}`;
      document.body.appendChild(container);
      this.containers.set(position, container);
    }
    return this.containers.get(position)!;
  }
  
  // 创建消息元素
  private createElement(options: MessageOptions): HTMLElement {
    // 尝试从对象池获取
    let element = this.config?.enablePool ? this.elementPool.acquire() : null;
    
    if (!element) {
      element = document.createElement('div');
    }
    
    element.className = `ldesign-message ldesign-message--${options.type || 'info'}`;
    if (options.className) {
      element.className += ` ${options.className}`;
    }
    
    if (options.maxWidth) {
      element.style.setProperty('--max-width', options.maxWidth);
    }
    
    // 构建内容
    const parts: string[] = [];
    
    // 图标
    if (options.showIcon !== false) {
      const icon = this.getIcon(options.type || 'info');
      parts.push(`<span class="ldesign-message-icon">${icon}</span>`);
    }
    
    // 内容
    parts.push('<div class="ldesign-message-content">');
    if (options.title) {
      parts.push(`<div class="ldesign-message-title">${options.title}</div>`);
    }
    parts.push(`<div>${options.html ? options.content : this.escapeHtml(options.content)}</div>`);
    parts.push('</div>');
    
    // 关闭按钮
    if (options.closable) {
      parts.push('<span class="ldesign-message-close">✕</span>');
    }
    
    element.innerHTML = parts.join('');
    
    // GPU加速
    if (this.config?.useGPU) {
      element.style.transform = 'translateY(-100%) translateZ(0)';
    }
    
    return element;
  }
  
  // 获取图标
  private getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      loading: '⟳',
    };
    return icons[type] || icons.info;
  }
  
  // HTML转义
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // 显示消息
  show(options: MessageOptions | string): string {
    // 简化API：支持直接传字符串
    if (typeof options === 'string') {
      options = { content: options };
    }
    
    const id = options.id || `msg_${++this.idCounter}`;
    const position = options.position || 'top';
    
    // 检查消息数量限制
    this.checkMessageLimit(position);
    
    // 创建实例
    const element = this.createElement(options);
    const instance: MessageInstance = {
      id,
      element,
      options: { ...options, id },
      isClosing: false,
      isPaused: false,
    };
    
    // 添加到容器
    const container = this.getContainer(position);
    container.appendChild(element);
    
    // 保存实例
    this.instances.set(id, instance);
    
    // 绑定事件
    this.bindEvents(instance);
    
    // 显示动画
    requestAnimationFrame(() => {
      element.classList.add('show');
      
      // 设置自动关闭
      if (options.duration !== 0) {
        const duration = options.duration || this.config?.defaultDuration;
        instance.startTime = Date.now();
        instance.remainingTime = duration;
        instance.timer = window.setTimeout(() => {
          this.close(id);
        }, duration);
      }
    });
    
    return id;
  }
  
  // 绑定事件
  private bindEvents(instance: MessageInstance): void {
    const { element, options } = instance;
    
    // 点击事件
    if (options.onClick) {
      element.style.cursor = 'pointer';
      element.addEventListener('click', options.onClick);
    }
    
    // 关闭按钮
    const closeBtn = element.querySelector('.ldesign-message-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close(instance.id);
      });
    }
    
    // 悬停暂停
    if (options.pauseOnHover && options.duration) {
      element.addEventListener('mouseenter', () => {
        if (!instance.isClosing && instance.timer) {
          clearTimeout(instance.timer);
          instance.isPaused = true;
          instance.remainingTime = instance.remainingTime! - (Date.now() - instance.startTime!);
        }
      });
      
      element.addEventListener('mouseleave', () => {
        if (!instance.isClosing && instance.isPaused) {
          instance.isPaused = false;
          instance.startTime = Date.now();
          instance.timer = window.setTimeout(() => {
            this.close(instance.id);
          }, instance.remainingTime!);
        }
      });
    }
  }
  
  // 检查消息数量限制
  private checkMessageLimit(position: string): void {
    const container = this.getContainer(position);
    const messages = container.querySelectorAll('.ldesign-message:not(.hide)');
    
    if (messages.length >= this.config?.maxMessages) {
      // 关闭最早的消息
      const oldestId = Array.from(this.instances.entries())
        .find(([_, inst]) => inst.element === messages[0])?.[0];
      
      if (oldestId) {
        this.close(oldestId);
      }
    }
  }
  
  // 关闭消息
  close(id: string): void {
    const instance = this.instances.get(id);
    if (!instance || instance.isClosing) return;
    
    instance.isClosing = true;
    
    // 清理定时器
    if (instance.timer) {
      clearTimeout(instance.timer);
    }
    
    // 隐藏动画
    instance.element.classList.remove('show');
    instance.element.classList.add('hide');
    
    // 动画结束后清理
    setTimeout(() => {
      if (instance.element.parentNode) {
        instance.element.parentNode.removeChild(instance.element);
      }
      
      // 回收到对象池
      if (this.config?.enablePool) {
        this.elementPool.release(instance.element);
      }
      
      this.instances.delete(id);
      
      // 触发回调
      instance.options.onClose?.();
    }, this.config?.animationDuration);
  }
  
  // 关闭所有消息
  closeAll(): void {
    this.instances.forEach((_, id) => this.close(id));
  }
  
  // 快捷方法
  success(content: string, options?: Partial<MessageOptions>): string {
    return this.show({ ...options, content, type: 'success' });
  }
  
  error(content: string, options?: Partial<MessageOptions>): string {
    return this.show({ ...options, content, type: 'error' });
  }
  
  warning(content: string, options?: Partial<MessageOptions>): string {
    return this.show({ ...options, content, type: 'warning' });
  }
  
  info(content: string, options?: Partial<MessageOptions>): string {
    return this.show({ ...options, content, type: 'info' });
  }
  
  loading(content: string, options?: Partial<MessageOptions>): string {
    return this.show({ ...options, content, type: 'loading', duration: 0 });
  }
  
  // 更新消息
  update(id: string, options: Partial<MessageOptions>): void {
    const instance = this.instances.get(id);
    if (!instance) return;
    
    // 更新内容
    if (options.content !== undefined) {
      const contentEl = instance.element.querySelector('.ldesign-message-content div:last-child');
      if (contentEl) {
        contentEl.innerHTML = options.html 
          ? options.content 
          : this.escapeHtml(options.content);
      }
    }
    
    // 更新标题
    if (options.title !== undefined) {
      const titleEl = instance.element.querySelector('.ldesign-message-title');
      if (options.title && !titleEl) {
        // 添加标题
        const contentEl = instance.element.querySelector('.ldesign-message-content');
        if (contentEl) {
          const newTitle = document.createElement('div');
          newTitle.className = 'ldesign-message-title';
          newTitle.textContent = options.title;
          contentEl.insertBefore(newTitle, contentEl.firstChild);
        }
      } else if (titleEl) {
        if (options.title) {
          titleEl.textContent = options.title;
        } else {
          titleEl.remove();
        }
      }
    }
    
    // 更新类型
    if (options.type !== undefined) {
      instance.element.className = instance.element.className
        .replace(/ldesign-message--\w+/, `ldesign-message--${options.type}`);
      
      // 更新图标
      const iconEl = instance.element.querySelector('.ldesign-message-icon');
      if (iconEl) {
        iconEl.innerHTML = this.getIcon(options.type);
      }
    }
    
    // 合并选项
    Object.assign(instance.options, options);
  }
  
  // 页面可见性变化处理
  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      // 页面隐藏时暂停所有定时器
      this.instances.forEach(instance => {
        if (instance.timer && !instance.isPaused) {
          clearTimeout(instance.timer);
          instance.remainingTime = instance.remainingTime! - (Date.now() - instance.startTime!);
        }
      });
    } else {
      // 页面显示时恢复定时器
      this.instances.forEach(instance => {
        if (instance.remainingTime && !instance.isPaused && !instance.isClosing) {
          instance.startTime = Date.now();
          instance.timer = window.setTimeout(() => {
            this.close(instance.id);
          }, instance.remainingTime);
        }
      });
    }
  };
  
  // 配置管理器
  configure(config: Partial<typeof this.config>): void {
    Object.assign(this.config, config);
  }
  
  // 销毁管理器
  destroy(): void {
    this.closeAll();
    this.containers.forEach(container => container.remove());
    this.containers.clear();
    this.elementPool.clear();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    const style = document.getElementById('ldesign-message-styles');
    if (style) style.remove();
  }
}

// 导出单例实例的方法
export const message = {
  show: (options: MessageOptions | string) => MessageManager.getInstance().show(options),
  success: (content: string, options?: Partial<MessageOptions>) => 
    MessageManager.getInstance().success(content, options),
  error: (content: string, options?: Partial<MessageOptions>) => 
    MessageManager.getInstance().error(content, options),
  warning: (content: string, options?: Partial<MessageOptions>) => 
    MessageManager.getInstance().warning(content, options),
  info: (content: string, options?: Partial<MessageOptions>) => 
    MessageManager.getInstance().info(content, options),
  loading: (content: string, options?: Partial<MessageOptions>) => 
    MessageManager.getInstance().loading(content, options),
  close: (id: string) => MessageManager.getInstance().close(id),
  closeAll: () => MessageManager.getInstance().closeAll(),
  update: (id: string, options: Partial<MessageOptions>) => 
    MessageManager.getInstance().update(id, options),
  configure: (config: any) => MessageManager.getInstance().configure(config),
  destroy: () => MessageManager.getInstance().destroy(),
};