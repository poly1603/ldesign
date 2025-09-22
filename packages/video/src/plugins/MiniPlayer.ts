/**
 * 迷你播放器插件
 * 支持浮动窗口和画中画模式
 */

import { Plugin } from '../core/Plugin';
import type { IPlayer, PluginMetadata } from '../types';
import { UIPluginConfig } from '../core/Plugin';

/**
 * 迷你播放器模式
 */
export enum MiniPlayerMode {
  FLOATING = 'floating',
  PICTURE_IN_PICTURE = 'pip',
  CORNER = 'corner'
}

/**
 * 迷你播放器位置
 */
export enum MiniPlayerPosition {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right'
}

/**
 * 迷你播放器配置
 */
export interface MiniPlayerConfig extends UIPluginConfig {
  mode?: MiniPlayerMode;
  position?: MiniPlayerPosition;
  width?: number;
  height?: number;
  draggable?: boolean;
  resizable?: boolean;
  autoEnter?: boolean;
  autoEnterThreshold?: number;
  showControls?: boolean;
  opacity?: number;
  zIndex?: number;
}

/**
 * 迷你播放器插件
 */
export class MiniPlayer extends Plugin {
  private miniContainer?: HTMLElement;
  private originalContainer?: HTMLElement;
  private originalParent?: HTMLElement;
  private isActive = false;
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;

  constructor(player: IPlayer, config: MiniPlayerConfig = {}) {
    const metadata: PluginMetadata = {
      name: 'miniPlayer',
      version: '1.0.0',
      type: 'ui',
      description: 'Mini player with floating window and PiP support'
    };

    const defaultConfig: MiniPlayerConfig = {
      mode: MiniPlayerMode.FLOATING,
      position: MiniPlayerPosition.BOTTOM_RIGHT,
      width: 320,
      height: 180,
      draggable: true,
      resizable: false,
      autoEnter: false,
      autoEnterThreshold: 0.5,
      showControls: true,
      opacity: 1,
      zIndex: 10000
    };

    super(player, { ...defaultConfig, ...config }, metadata);
  }

  async init(): Promise<void> {
    await super.init();

    // 检查浏览器支持
    this.checkBrowserSupport();

    // 设置自动进入迷你模式
    if (this.config.autoEnter) {
      this.setupAutoEnter();
    }

    // 监听播放器事件
    this.setupPlayerEventListeners();
  }

  /**
   * 检查浏览器支持
   */
  private checkBrowserSupport(): void {
    if (this.config.mode === MiniPlayerMode.PICTURE_IN_PICTURE) {
      if (!('pictureInPictureEnabled' in document)) {
        console.warn('Picture-in-Picture is not supported in this browser');
        this.config.mode = MiniPlayerMode.FLOATING;
      }
    }
  }

  /**
   * 设置自动进入迷你模式
   */
  private setupAutoEnter(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isVisible = entry.intersectionRatio >= this.config.autoEnterThreshold!;
        
        if (!isVisible && !this.isActive && !this.player.element.paused) {
          this.enter();
        } else if (isVisible && this.isActive) {
          this.exit();
        }
      },
      {
        threshold: [0, this.config.autoEnterThreshold!]
      }
    );

    this.intersectionObserver.observe(this.player.container);
  }

  /**
   * 设置播放器事件监听器
   */
  private setupPlayerEventListeners(): void {
    this.player.on('player:pause', () => {
      if (this.isActive && this.config.autoEnter) {
        this.exit();
      }
    });

    this.player.on('player:ended', () => {
      if (this.isActive) {
        this.exit();
      }
    });
  }

  /**
   * 进入迷你播放器模式
   */
  async enter(): Promise<void> {
    if (this.isActive) return;

    try {
      if (this.config.mode === MiniPlayerMode.PICTURE_IN_PICTURE) {
        await this.enterPictureInPicture();
      } else {
        await this.enterFloatingMode();
      }

      this.isActive = true;
      this.emit('miniPlayer:entered', { mode: this.config.mode });

    } catch (error) {
      console.error('Failed to enter mini player mode:', error);
      this.emit('miniPlayer:error', { error, action: 'enter' });
    }
  }

  /**
   * 退出迷你播放器模式
   */
  async exit(): Promise<void> {
    if (!this.isActive) return;

    try {
      if (this.config.mode === MiniPlayerMode.PICTURE_IN_PICTURE) {
        await this.exitPictureInPicture();
      } else {
        await this.exitFloatingMode();
      }

      this.isActive = false;
      this.emit('miniPlayer:exited', { mode: this.config.mode });

    } catch (error) {
      console.error('Failed to exit mini player mode:', error);
      this.emit('miniPlayer:error', { error, action: 'exit' });
    }
  }

  /**
   * 切换迷你播放器模式
   */
  async toggle(): Promise<void> {
    if (this.isActive) {
      await this.exit();
    } else {
      await this.enter();
    }
  }

  /**
   * 进入画中画模式
   */
  private async enterPictureInPicture(): Promise<void> {
    if (!this.player.element.requestPictureInPicture) {
      throw new Error('Picture-in-Picture is not supported');
    }

    await this.player.element.requestPictureInPicture();

    // 监听画中画事件
    this.player.element.addEventListener('enterpictureinpicture', this.handlePipEnter.bind(this));
    this.player.element.addEventListener('leavepictureinpicture', this.handlePipLeave.bind(this));
  }

  /**
   * 退出画中画模式
   */
  private async exitPictureInPicture(): Promise<void> {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    }
  }

  /**
   * 进入浮动模式
   */
  private async enterFloatingMode(): Promise<void> {
    // 保存原始容器信息
    this.originalContainer = this.player.container;
    this.originalParent = this.originalContainer.parentElement!;

    // 创建迷你容器
    this.createMiniContainer();

    // 移动播放器到迷你容器
    this.miniContainer!.appendChild(this.originalContainer);

    // 设置迷你容器样式
    this.setupMiniContainerStyle();

    // 添加到页面
    document.body.appendChild(this.miniContainer!);

    // 设置拖拽和调整大小
    if (this.config.draggable) {
      this.setupDragging();
    }

    if (this.config.resizable) {
      this.setupResizing();
    }
  }

  /**
   * 退出浮动模式
   */
  private async exitFloatingMode(): Promise<void> {
    if (!this.miniContainer || !this.originalParent) return;

    // 移动播放器回原始位置
    this.originalParent.appendChild(this.originalContainer!);

    // 移除迷你容器
    document.body.removeChild(this.miniContainer);
    this.miniContainer = undefined;

    // 恢复原始样式
    this.originalContainer!.style.cssText = '';
  }

  /**
   * 创建迷你容器
   */
  private createMiniContainer(): void {
    this.miniContainer = document.createElement('div');
    this.miniContainer.className = 'ldesign-mini-player';
    
    // 添加控制按钮
    if (this.config.showControls) {
      this.addMiniControls();
    }
  }

  /**
   * 添加迷你控制按钮
   */
  private addMiniControls(): void {
    const controls = document.createElement('div');
    controls.className = 'ldesign-mini-controls';
    controls.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      display: flex;
      gap: 5px;
      z-index: 1;
    `;

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
    `;
    closeBtn.onclick = () => this.exit();

    // 最大化按钮
    const maximizeBtn = document.createElement('button');
    maximizeBtn.innerHTML = '⛶';
    maximizeBtn.style.cssText = closeBtn.style.cssText;
    maximizeBtn.onclick = () => this.exit();

    controls.appendChild(maximizeBtn);
    controls.appendChild(closeBtn);
    this.miniContainer!.appendChild(controls);
  }

  /**
   * 设置迷你容器样式
   */
  private setupMiniContainerStyle(): void {
    if (!this.miniContainer) return;

    const position = this.getPositionStyle();
    
    this.miniContainer.style.cssText = `
      position: fixed;
      width: ${this.config.width}px;
      height: ${this.config.height}px;
      ${position}
      z-index: ${this.config.zIndex};
      opacity: ${this.config.opacity};
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      cursor: ${this.config.draggable ? 'move' : 'default'};
      transition: opacity 0.3s ease;
    `;

    // 设置播放器容器样式
    this.originalContainer!.style.cssText = `
      width: 100%;
      height: 100%;
      border-radius: 8px;
    `;
  }

  /**
   * 获取位置样式
   */
  private getPositionStyle(): string {
    const margin = 20;
    
    switch (this.config.position) {
      case MiniPlayerPosition.TOP_LEFT:
        return `top: ${margin}px; left: ${margin}px;`;
      case MiniPlayerPosition.TOP_RIGHT:
        return `top: ${margin}px; right: ${margin}px;`;
      case MiniPlayerPosition.BOTTOM_LEFT:
        return `bottom: ${margin}px; left: ${margin}px;`;
      case MiniPlayerPosition.BOTTOM_RIGHT:
      default:
        return `bottom: ${margin}px; right: ${margin}px;`;
    }
  }

  /**
   * 设置拖拽功能
   */
  private setupDragging(): void {
    if (!this.miniContainer) return;

    this.miniContainer.addEventListener('mousedown', this.handleDragStart.bind(this));
    document.addEventListener('mousemove', this.handleDragMove.bind(this));
    document.addEventListener('mouseup', this.handleDragEnd.bind(this));
  }

  /**
   * 处理拖拽开始
   */
  private handleDragStart(event: MouseEvent): void {
    if (!this.miniContainer) return;

    this.isDragging = true;
    const rect = this.miniContainer.getBoundingClientRect();
    this.dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    this.miniContainer.style.cursor = 'grabbing';
    event.preventDefault();
  }

  /**
   * 处理拖拽移动
   */
  private handleDragMove(event: MouseEvent): void {
    if (!this.isDragging || !this.miniContainer) return;

    const x = event.clientX - this.dragOffset.x;
    const y = event.clientY - this.dragOffset.y;

    // 限制在视窗内
    const maxX = window.innerWidth - this.miniContainer.offsetWidth;
    const maxY = window.innerHeight - this.miniContainer.offsetHeight;

    const constrainedX = Math.max(0, Math.min(x, maxX));
    const constrainedY = Math.max(0, Math.min(y, maxY));

    this.miniContainer.style.left = `${constrainedX}px`;
    this.miniContainer.style.top = `${constrainedY}px`;
    this.miniContainer.style.right = 'auto';
    this.miniContainer.style.bottom = 'auto';
  }

  /**
   * 处理拖拽结束
   */
  private handleDragEnd(): void {
    if (!this.miniContainer) return;

    this.isDragging = false;
    this.miniContainer.style.cursor = 'move';
  }

  /**
   * 设置调整大小功能
   */
  private setupResizing(): void {
    // 这里可以添加调整大小的逻辑
    // 创建调整大小的控制点等
  }

  /**
   * 处理画中画进入
   */
  private handlePipEnter(): void {
    this.emit('pip:entered');
  }

  /**
   * 处理画中画离开
   */
  private handlePipLeave(): void {
    this.isActive = false;
    this.emit('pip:exited');
  }

  /**
   * 设置位置
   */
  setPosition(position: MiniPlayerPosition): void {
    this.config.position = position;
    if (this.isActive && this.miniContainer) {
      const positionStyle = this.getPositionStyle();
      const styles = positionStyle.split(';').filter(s => s.trim());
      
      for (const style of styles) {
        const [property, value] = style.split(':').map(s => s.trim());
        if (property && value) {
          (this.miniContainer.style as any)[property] = value;
        }
      }
    }
  }

  /**
   * 设置大小
   */
  setSize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
    
    if (this.isActive && this.miniContainer) {
      this.miniContainer.style.width = `${width}px`;
      this.miniContainer.style.height = `${height}px`;
    }
  }

  /**
   * 获取状态
   */
  getState(): { active: boolean; mode: MiniPlayerMode; position?: MiniPlayerPosition } {
    return {
      active: this.isActive,
      mode: this.config.mode!,
      position: this.config.position
    };
  }

  async destroy(): Promise<void> {
    // 退出迷你模式
    if (this.isActive) {
      await this.exit();
    }

    // 清理观察器
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    await super.destroy();
  }
}

/**
 * 创建迷你播放器插件
 */
export function createMiniPlayer(player: IPlayer, config?: MiniPlayerConfig): MiniPlayer {
  return new MiniPlayer(player, config);
}
