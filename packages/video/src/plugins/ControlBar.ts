/**
 * 控制栏插件
 * 提供完整的视频播放器控制栏功能，类似 xgplayer 的设计
 */

import type { IPlayer, PluginConfig } from '../types';

/**
 * 控制栏位置枚举
 */
export enum ControlPosition {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}

/**
 * 控制栏配置接口
 */
export interface ControlBarConfig extends PluginConfig {
  /** 是否自动隐藏 */
  autoHide?: boolean;
  /** 自动隐藏延迟时间（毫秒） */
  autoHideDelay?: number;
  /** 是否在暂停时显示 */
  showOnPause?: boolean;
  /** 是否在加载时显示 */
  showOnLoading?: boolean;
  /** 控制栏高度 */
  height?: number;
  /** 是否启用渐变背景 */
  gradient?: boolean;
}

/**
 * 控制栏插件类
 * 负责管理整个控制栏的显示、隐藏和子插件注册
 */
export class ControlBar {
  public readonly name = 'controlBar';
  public readonly player: IPlayer;
  public readonly config: ControlBarConfig;
  public element!: HTMLElement;

  private _leftContainer!: HTMLElement;
  private _centerContainer!: HTMLElement;
  private _rightContainer!: HTMLElement;
  private _autoHideTimer: number | null = null;
  private _isVisible = true;
  private _childPlugins = new Map<string, any>();

  constructor(player: IPlayer, config: ControlBarConfig = {}) {
    this.player = player;
    this.config = {
      autoHide: true,
      autoHideDelay: 3000,
      showOnPause: true,
      showOnLoading: false,
      height: 48,
      gradient: true,
      ...config
    };
  }

  /**
   * 初始化插件
   */
  async init(): Promise<void> {
    this.createElement();
    this.setupEventListeners();
  }

  /**
   * 创建DOM元素
   */
  private createElement(): void {
    const div = document.createElement('div');
    div.innerHTML = this.render();
    this.element = div.firstElementChild as HTMLElement;
  }

  /**
   * 渲染控制栏DOM结构
   */
  protected render(): string {
    const { height, gradient } = this.config;

    return `
      <div class="ldesign-video-controls" style="height: ${height}px">
        <div class="ldesign-controls-background ${gradient ? 'gradient' : ''}"></div>
        <div class="ldesign-controls-inner">
          <div class="ldesign-controls-left" data-position="left"></div>
          <div class="ldesign-controls-center" data-position="center"></div>
          <div class="ldesign-controls-right" data-position="right"></div>
        </div>
      </div>
    `;
  }

  /**
   * 挂载到播放器容器
   */
  async mount(container: HTMLElement): Promise<void> {
    container.appendChild(this.element);

    // 获取子容器引用
    this._leftContainer = this.element.querySelector('.ldesign-controls-left') as HTMLElement;
    this._centerContainer = this.element.querySelector('.ldesign-controls-center') as HTMLElement;
    this._rightContainer = this.element.querySelector('.ldesign-controls-right') as HTMLElement;

    // 设置初始状态
    this.updateVisibility();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 播放器状态变化
    this.player.on('play', this.onPlay.bind(this));
    this.player.on('pause', this.onPause.bind(this));
    this.player.on('loadstart', this.onLoadStart.bind(this));
    this.player.on('canplay', this.onCanPlay.bind(this));

    // 鼠标事件（在播放器容器上）
    this.player.container.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    this.player.container.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    this.player.container.addEventListener('mousemove', this.onMouseMove.bind(this));

    // 控制栏自身的鼠标事件
    this.element.addEventListener('mouseenter', this.onControlsMouseEnter.bind(this));
    this.element.addEventListener('mouseleave', this.onControlsMouseLeave.bind(this));
  }

  /**
   * 注册子插件到指定位置
   */
  registerPlugin(plugin: any, position: ControlPosition = ControlPosition.LEFT): void {
    if (this._childPlugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already registered`);
      return;
    }

    let container: HTMLElement;
    switch (position) {
      case ControlPosition.LEFT:
        container = this._leftContainer;
        break;
      case ControlPosition.CENTER:
        container = this._centerContainer;
        break;
      case ControlPosition.RIGHT:
        container = this._rightContainer;
        break;
      default:
        container = this._leftContainer;
    }

    // 挂载插件到对应容器
    if (plugin.element) {
      container.appendChild(plugin.element);
    }
    this._childPlugins.set(plugin.name, plugin);
  }

  /**
   * 注销子插件
   */
  unregisterPlugin(pluginName: string): void {
    const plugin = this._childPlugins.get(pluginName);
    if (plugin) {
      plugin.destroy();
      this._childPlugins.delete(pluginName);
    }
  }

  /**
   * 显示控制栏
   */
  show(): void {
    this._isVisible = true;
    this.updateVisibility();
    this.stopAutoHide();
  }

  /**
   * 隐藏控制栏
   */
  hide(): void {
    this._isVisible = false;
    this.updateVisibility();
  }

  /**
   * 切换控制栏显示状态
   */
  toggle(): void {
    if (this._isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 开始自动隐藏计时
   */
  private startAutoHide(): void {
    if (!this.config.autoHide) return;

    this.stopAutoHide();
    this._autoHideTimer = window.setTimeout(() => {
      if (this.player.state.playing) {
        this.hide();
      }
    }, this.config.autoHideDelay);
  }

  /**
   * 停止自动隐藏计时
   */
  private stopAutoHide(): void {
    if (this._autoHideTimer) {
      clearTimeout(this._autoHideTimer);
      this._autoHideTimer = null;
    }
  }

  /**
   * 更新控制栏可见性
   */
  private updateVisibility(): void {
    if (!this.element) return;

    if (this._isVisible) {
      this.element.classList.add('visible');
      this.element.classList.remove('hidden');
    } else {
      this.element.classList.add('hidden');
      this.element.classList.remove('visible');
    }
  }

  // 事件处理方法
  private onPlay(): void {
    if (this.config.autoHide) {
      this.startAutoHide();
    }
  }

  private onPause(): void {
    this.stopAutoHide();
    if (this.config.showOnPause) {
      this.show();
    }
  }

  private onLoadStart(): void {
    if (this.config.showOnLoading) {
      this.show();
    }
  }

  private onCanPlay(): void {
    // 视频可以播放时的处理
  }

  private onMouseEnter(): void {
    this.show();
  }

  private onMouseLeave(): void {
    if (this.config.autoHide && this.player.state.playing) {
      this.startAutoHide();
    }
  }

  private onMouseMove(): void {
    if (!this._isVisible) {
      this.show();
    }
    if (this.config.autoHide && this.player.state.playing) {
      this.startAutoHide();
    }
  }

  private onControlsMouseEnter(): void {
    this.stopAutoHide();
  }

  private onControlsMouseLeave(): void {
    if (this.config.autoHide && this.player.state.playing) {
      this.startAutoHide();
    }
  }

  /**
   * 触发事件
   */
  emit(eventName: string, data?: any): void {
    // 简单的事件触发实现
    console.log(`ControlBar event: ${eventName}`, data);
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    this.stopAutoHide();

    // 销毁所有子插件
    for (const plugin of this._childPlugins.values()) {
      if (plugin.destroy) {
        plugin.destroy();
      }
    }
    this._childPlugins.clear();

    // 移除事件监听器
    this.player.container.removeEventListener('mouseenter', this.onMouseEnter.bind(this));
    this.player.container.removeEventListener('mouseleave', this.onMouseLeave.bind(this));
    this.player.container.removeEventListener('mousemove', this.onMouseMove.bind(this));

    // 移除DOM元素
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

/**
 * 创建控制栏插件实例
 */
export function createControlBar(player: IPlayer, config?: ControlBarConfig): ControlBar {
  return new ControlBar(player, config);
}
