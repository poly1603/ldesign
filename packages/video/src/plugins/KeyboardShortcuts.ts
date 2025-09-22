/**
 * 键盘快捷键插件
 * 提供常用的键盘快捷键支持
 */

import { Plugin } from '../core/Plugin';
import type { IPlayer, PluginMetadata } from '../types';
import { UIPluginConfig } from '../core/Plugin';

/**
 * 快捷键配置
 */
export interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: string | ((player: IPlayer) => void);
  description?: string;
  preventDefault?: boolean;
}

/**
 * 键盘快捷键插件配置
 */
export interface KeyboardShortcutsConfig extends UIPluginConfig {
  shortcuts?: ShortcutConfig[];
  enableDefaultShortcuts?: boolean;
  showHelp?: boolean;
  helpKey?: string;
  globalShortcuts?: boolean;
}

/**
 * 键盘快捷键插件
 */
export class KeyboardShortcuts extends Plugin {
  private shortcuts = new Map<string, ShortcutConfig>();
  private helpVisible = false;
  private helpElement?: HTMLElement;
  private boundKeyHandler?: (event: KeyboardEvent) => void;

  constructor(player: IPlayer, config: KeyboardShortcutsConfig = {}) {
    const metadata: PluginMetadata = {
      name: 'keyboardShortcuts',
      version: '1.0.0',
      type: 'functional',
      description: 'Keyboard shortcuts support'
    };

    const defaultConfig: KeyboardShortcutsConfig = {
      enableDefaultShortcuts: true,
      showHelp: true,
      helpKey: '?',
      globalShortcuts: false,
      shortcuts: []
    };

    super(player, { ...defaultConfig, ...config }, metadata);
  }

  async init(): Promise<void> {
    await super.init();

    // 设置默认快捷键
    if (this.config.enableDefaultShortcuts) {
      this.setupDefaultShortcuts();
    }

    // 添加自定义快捷键
    if (this.config.shortcuts) {
      for (const shortcut of this.config.shortcuts) {
        this.addShortcut(shortcut);
      }
    }

    // 绑定键盘事件
    this.bindKeyboardEvents();

    // 创建帮助界面
    if (this.config.showHelp) {
      this.createHelpInterface();
    }
  }

  /**
   * 设置默认快捷键
   */
  private setupDefaultShortcuts(): void {
    const defaultShortcuts: ShortcutConfig[] = [
      {
        key: ' ',
        action: 'togglePlay',
        description: '播放/暂停',
        preventDefault: true
      },
      {
        key: 'ArrowLeft',
        action: (player) => player.seek(Math.max(0, player.currentTime - 10)),
        description: '后退 10 秒'
      },
      {
        key: 'ArrowRight',
        action: (player) => player.seek(Math.min(player.duration, player.currentTime + 10)),
        description: '前进 10 秒'
      },
      {
        key: 'ArrowUp',
        action: (player) => player.volume = Math.min(1, player.volume + 0.1),
        description: '音量增加 10%',
        preventDefault: true
      },
      {
        key: 'ArrowDown',
        action: (player) => player.volume = Math.max(0, player.volume - 0.1),
        description: '音量减少 10%',
        preventDefault: true
      },
      {
        key: 'm',
        action: (player) => player.muted = !player.muted,
        description: '静音/取消静音'
      },
      {
        key: 'f',
        action: 'toggleFullscreen',
        description: '全屏/退出全屏'
      },
      {
        key: 'Escape',
        action: (player) => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
        },
        description: '退出全屏'
      },
      {
        key: '0',
        action: (player) => player.seek(0),
        description: '跳转到开始'
      },
      {
        key: '1',
        action: (player) => player.seek(player.duration * 0.1),
        description: '跳转到 10%'
      },
      {
        key: '2',
        action: (player) => player.seek(player.duration * 0.2),
        description: '跳转到 20%'
      },
      {
        key: '3',
        action: (player) => player.seek(player.duration * 0.3),
        description: '跳转到 30%'
      },
      {
        key: '4',
        action: (player) => player.seek(player.duration * 0.4),
        description: '跳转到 40%'
      },
      {
        key: '5',
        action: (player) => player.seek(player.duration * 0.5),
        description: '跳转到 50%'
      },
      {
        key: '6',
        action: (player) => player.seek(player.duration * 0.6),
        description: '跳转到 60%'
      },
      {
        key: '7',
        action: (player) => player.seek(player.duration * 0.7),
        description: '跳转到 70%'
      },
      {
        key: '8',
        action: (player) => player.seek(player.duration * 0.8),
        description: '跳转到 80%'
      },
      {
        key: '9',
        action: (player) => player.seek(player.duration * 0.9),
        description: '跳转到 90%'
      },
      {
        key: '<',
        action: (player) => player.playbackRate = Math.max(0.25, player.playbackRate - 0.25),
        description: '减慢播放速度'
      },
      {
        key: '>',
        action: (player) => player.playbackRate = Math.min(4, player.playbackRate + 0.25),
        description: '加快播放速度'
      }
    ];

    for (const shortcut of defaultShortcuts) {
      this.addShortcut(shortcut);
    }

    // 添加帮助快捷键
    if (this.config.showHelp && this.config.helpKey) {
      this.addShortcut({
        key: this.config.helpKey,
        action: () => this.toggleHelp(),
        description: '显示/隐藏快捷键帮助'
      });
    }
  }

  /**
   * 添加快捷键
   */
  addShortcut(shortcut: ShortcutConfig): void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  /**
   * 移除快捷键
   */
  removeShortcut(key: string, modifiers?: { ctrlKey?: boolean; altKey?: boolean; shiftKey?: boolean }): void {
    const shortcutKey = modifiers 
      ? this.getShortcutKey({ key, ...modifiers } as ShortcutConfig)
      : key;
    this.shortcuts.delete(shortcutKey);
  }

  /**
   * 获取快捷键标识
   */
  private getShortcutKey(shortcut: ShortcutConfig): string {
    const parts = [];
    if (shortcut.ctrlKey) parts.push('ctrl');
    if (shortcut.altKey) parts.push('alt');
    if (shortcut.shiftKey) parts.push('shift');
    parts.push(shortcut.key.toLowerCase());
    return parts.join('+');
  }

  /**
   * 绑定键盘事件
   */
  private bindKeyboardEvents(): void {
    this.boundKeyHandler = (event: KeyboardEvent) => {
      // 检查是否应该处理这个事件
      if (!this.shouldHandleKeyEvent(event)) {
        return;
      }

      const shortcutKey = this.getShortcutKey({
        key: event.key,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey
      } as ShortcutConfig);

      const shortcut = this.shortcuts.get(shortcutKey);
      if (shortcut) {
        if (shortcut.preventDefault) {
          event.preventDefault();
        }

        this.executeShortcut(shortcut);
      }
    };

    const target = this.config.globalShortcuts ? document : this.player.container;
    target.addEventListener('keydown', this.boundKeyHandler);
  }

  /**
   * 检查是否应该处理键盘事件
   */
  private shouldHandleKeyEvent(event: KeyboardEvent): boolean {
    // 如果焦点在输入框中，不处理快捷键
    const activeElement = document.activeElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    )) {
      return false;
    }

    // 如果不是全局快捷键，检查播放器是否有焦点
    if (!this.config.globalShortcuts) {
      return this.player.container.contains(activeElement) || 
             this.player.container === activeElement;
    }

    return true;
  }

  /**
   * 执行快捷键动作
   */
  private executeShortcut(shortcut: ShortcutConfig): void {
    try {
      if (typeof shortcut.action === 'string') {
        // 预定义动作
        switch (shortcut.action) {
          case 'togglePlay':
            if (this.player.element.paused) {
              this.player.play();
            } else {
              this.player.pause();
            }
            break;
          case 'toggleFullscreen':
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              this.player.container.requestFullscreen();
            }
            break;
          default:
            console.warn(`Unknown shortcut action: ${shortcut.action}`);
        }
      } else {
        // 自定义函数
        shortcut.action(this.player);
      }

      // 触发快捷键执行事件
      this.emit('shortcut:executed', {
        key: shortcut.key,
        action: shortcut.action,
        description: shortcut.description
      });

    } catch (error) {
      console.error('Error executing shortcut:', error);
      this.emit('shortcut:error', { shortcut, error });
    }
  }

  /**
   * 创建帮助界面
   */
  private createHelpInterface(): void {
    this.helpElement = document.createElement('div');
    this.helpElement.className = 'ldesign-shortcuts-help';
    this.helpElement.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 400px;
      max-height: 80vh;
      overflow-y: auto;
      z-index: 1000;
      display: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    `;

    // 创建帮助内容
    const title = document.createElement('h3');
    title.textContent = '键盘快捷键';
    title.style.cssText = 'margin: 0 0 15px 0; font-size: 18px; text-align: center;';
    this.helpElement.appendChild(title);

    const shortcutList = document.createElement('div');
    for (const [, shortcut] of this.shortcuts) {
      if (shortcut.description) {
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0;';
        
        const keySpan = document.createElement('span');
        keySpan.textContent = this.formatShortcutDisplay(shortcut);
        keySpan.style.cssText = 'font-family: monospace; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px;';
        
        const descSpan = document.createElement('span');
        descSpan.textContent = shortcut.description;
        descSpan.style.cssText = 'margin-left: 15px;';
        
        item.appendChild(keySpan);
        item.appendChild(descSpan);
        shortcutList.appendChild(item);
      }
    }
    this.helpElement.appendChild(shortcutList);

    const closeHint = document.createElement('div');
    closeHint.textContent = `按 ${this.config.helpKey} 或 Esc 关闭帮助`;
    closeHint.style.cssText = 'text-align: center; margin-top: 15px; font-size: 12px; opacity: 0.7;';
    this.helpElement.appendChild(closeHint);

    this.player.container.appendChild(this.helpElement);
  }

  /**
   * 格式化快捷键显示
   */
  private formatShortcutDisplay(shortcut: ShortcutConfig): string {
    const parts = [];
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.shiftKey) parts.push('Shift');
    
    let key = shortcut.key;
    if (key === ' ') key = 'Space';
    else if (key === 'ArrowLeft') key = '←';
    else if (key === 'ArrowRight') key = '→';
    else if (key === 'ArrowUp') key = '↑';
    else if (key === 'ArrowDown') key = '↓';
    
    parts.push(key);
    return parts.join(' + ');
  }

  /**
   * 切换帮助显示
   */
  private toggleHelp(): void {
    if (!this.helpElement) return;

    this.helpVisible = !this.helpVisible;
    this.helpElement.style.display = this.helpVisible ? 'block' : 'none';

    this.emit('help:toggled', { visible: this.helpVisible });
  }

  /**
   * 获取所有快捷键
   */
  getShortcuts(): Map<string, ShortcutConfig> {
    return new Map(this.shortcuts);
  }

  async destroy(): Promise<void> {
    // 移除键盘事件监听器
    if (this.boundKeyHandler) {
      const target = this.config.globalShortcuts ? document : this.player.container;
      target.removeEventListener('keydown', this.boundKeyHandler);
    }

    // 移除帮助界面
    if (this.helpElement && this.helpElement.parentNode) {
      this.helpElement.parentNode.removeChild(this.helpElement);
    }

    this.shortcuts.clear();
    await super.destroy();
  }
}

/**
 * 创建键盘快捷键插件
 */
export function createKeyboardShortcuts(player: IPlayer, config?: KeyboardShortcutsConfig): KeyboardShortcuts {
  return new KeyboardShortcuts(player, config);
}
