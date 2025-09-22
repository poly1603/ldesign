/**
 * 键盘快捷键插件测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KeyboardShortcuts } from '../../src/plugins/KeyboardShortcuts';
import { createMockPlayer } from '../mocks/player';

describe('KeyboardShortcuts', () => {
  let player: any;
  let plugin: KeyboardShortcuts;
  let container: HTMLElement;

  beforeEach(() => {
    // 创建模拟容器
    container = document.createElement('div');
    document.body.appendChild(container);

    // 创建模拟播放器
    player = createMockPlayer();
    player.container = container;
    player.element = {
      paused: false,
      currentTime: 10,
      duration: 100,
      volume: 0.5,
      muted: false,
      playbackRate: 1
    };

    // 模拟播放器方法
    player.play = vi.fn();
    player.pause = vi.fn();
    player.seek = vi.fn();

    plugin = new KeyboardShortcuts(player, {
      enableDefaultShortcuts: true,
      showHelp: true
    });
  });

  afterEach(async () => {
    if (plugin) {
      await plugin.destroy();
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('初始化', () => {
    it('应该正确初始化', async () => {
      await plugin.init();
      expect(plugin.isInitialized).toBe(true);
    });

    it('应该设置默认快捷键', async () => {
      await plugin.init();
      const shortcuts = plugin.getShortcuts();
      expect(shortcuts.size).toBeGreaterThan(0);
      expect(shortcuts.has(' ')).toBe(true); // 空格键播放/暂停
      expect(shortcuts.has('f')).toBe(true); // f 键全屏
    });

    it('应该创建帮助界面', async () => {
      await plugin.init();
      const helpElement = container.querySelector('.ldesign-shortcuts-help');
      expect(helpElement).toBeTruthy();
    });
  });

  describe('快捷键功能', () => {
    beforeEach(async () => {
      await plugin.init();
    });

    it('应该处理空格键播放/暂停', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      container.dispatchEvent(event);

      expect(player.play).toHaveBeenCalled();
    });

    it('应该处理左箭头键后退', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      container.dispatchEvent(event);

      expect(player.seek).toHaveBeenCalledWith(0); // currentTime - 10 = 0
    });

    it('应该处理右箭头键前进', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      container.dispatchEvent(event);

      expect(player.seek).toHaveBeenCalledWith(20); // currentTime + 10 = 20
    });

    it('应该处理音量调节', () => {
      // 音量增加
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      container.dispatchEvent(upEvent);
      expect(player.volume).toBe(0.6); // 0.5 + 0.1

      // 音量减少
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      container.dispatchEvent(downEvent);
      expect(player.volume).toBe(0.5); // 0.6 - 0.1
    });

    it('应该处理静音切换', () => {
      const event = new KeyboardEvent('keydown', { key: 'm' });
      container.dispatchEvent(event);

      expect(player.muted).toBe(true);
    });

    it('应该处理数字键跳转', () => {
      const event = new KeyboardEvent('keydown', { key: '5' });
      container.dispatchEvent(event);

      expect(player.seek).toHaveBeenCalledWith(50); // duration * 0.5
    });
  });

  describe('自定义快捷键', () => {
    it('应该添加自定义快捷键', async () => {
      const customAction = vi.fn();
      plugin.addShortcut({
        key: 'r',
        action: customAction,
        description: '重新开始'
      });

      await plugin.init();

      const event = new KeyboardEvent('keydown', { key: 'r' });
      container.dispatchEvent(event);

      expect(customAction).toHaveBeenCalledWith(player);
    });

    it('应该移除快捷键', async () => {
      await plugin.init();
      
      plugin.removeShortcut(' '); // 移除空格键
      const shortcuts = plugin.getShortcuts();
      expect(shortcuts.has(' ')).toBe(false);
    });

    it('应该处理组合键', async () => {
      const customAction = vi.fn();
      plugin.addShortcut({
        key: 's',
        ctrlKey: true,
        action: customAction,
        description: 'Ctrl+S 保存'
      });

      await plugin.init();

      const event = new KeyboardEvent('keydown', { 
        key: 's', 
        ctrlKey: true 
      });
      container.dispatchEvent(event);

      expect(customAction).toHaveBeenCalledWith(player);
    });
  });

  describe('帮助功能', () => {
    beforeEach(async () => {
      await plugin.init();
    });

    it('应该切换帮助显示', () => {
      const helpElement = container.querySelector('.ldesign-shortcuts-help') as HTMLElement;
      expect(helpElement.style.display).toBe('none');

      // 按 ? 键显示帮助
      const event = new KeyboardEvent('keydown', { key: '?' });
      container.dispatchEvent(event);

      expect(helpElement.style.display).toBe('block');
    });

    it('应该发出帮助切换事件', () => {
      const spy = vi.fn();
      plugin.on('help:toggled', spy);

      const event = new KeyboardEvent('keydown', { key: '?' });
      container.dispatchEvent(event);

      expect(spy).toHaveBeenCalledWith({ visible: true });
    });
  });

  describe('事件过滤', () => {
    beforeEach(async () => {
      await plugin.init();
    });

    it('应该忽略输入框中的按键', () => {
      const input = document.createElement('input');
      container.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', { key: ' ' });
      input.dispatchEvent(event);

      expect(player.play).not.toHaveBeenCalled();
    });

    it('应该忽略文本区域中的按键', () => {
      const textarea = document.createElement('textarea');
      container.appendChild(textarea);
      textarea.focus();

      const event = new KeyboardEvent('keydown', { key: ' ' });
      textarea.dispatchEvent(event);

      expect(player.play).not.toHaveBeenCalled();
    });

    it('应该忽略可编辑元素中的按键', () => {
      const div = document.createElement('div');
      div.contentEditable = 'true';
      container.appendChild(div);
      div.focus();

      const event = new KeyboardEvent('keydown', { key: ' ' });
      div.dispatchEvent(event);

      expect(player.play).not.toHaveBeenCalled();
    });
  });

  describe('全局快捷键', () => {
    it('应该支持全局快捷键模式', async () => {
      const globalPlugin = new KeyboardShortcuts(player, {
        globalShortcuts: true,
        enableDefaultShortcuts: true
      });

      await globalPlugin.init();

      // 在文档级别触发事件
      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);

      expect(player.play).toHaveBeenCalled();

      await globalPlugin.destroy();
    });
  });

  describe('错误处理', () => {
    beforeEach(async () => {
      await plugin.init();
    });

    it('应该处理动作执行错误', () => {
      const errorAction = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      plugin.addShortcut({
        key: 'e',
        action: errorAction,
        description: '错误测试'
      });

      const spy = vi.fn();
      plugin.on('shortcut:error', spy);

      const event = new KeyboardEvent('keydown', { key: 'e' });
      container.dispatchEvent(event);

      expect(spy).toHaveBeenCalled();
    });

    it('应该处理未知的预定义动作', () => {
      plugin.addShortcut({
        key: 'u',
        action: 'unknownAction',
        description: '未知动作'
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const event = new KeyboardEvent('keydown', { key: 'u' });
      container.dispatchEvent(event);

      expect(consoleSpy).toHaveBeenCalledWith('Unknown shortcut action: unknownAction');
      consoleSpy.mockRestore();
    });
  });

  describe('事件发射', () => {
    beforeEach(async () => {
      await plugin.init();
    });

    it('应该发出快捷键执行事件', () => {
      const spy = vi.fn();
      plugin.on('shortcut:executed', spy);

      const event = new KeyboardEvent('keydown', { key: ' ' });
      container.dispatchEvent(event);

      expect(spy).toHaveBeenCalledWith({
        key: ' ',
        action: 'togglePlay',
        description: '播放/暂停'
      });
    });
  });

  describe('销毁', () => {
    it('应该正确清理资源', async () => {
      await plugin.init();
      
      const helpElement = container.querySelector('.ldesign-shortcuts-help');
      expect(helpElement).toBeTruthy();

      await plugin.destroy();

      expect(plugin.isInitialized).toBe(false);
      expect(container.querySelector('.ldesign-shortcuts-help')).toBeFalsy();
    });
  });

  describe('配置选项', () => {
    it('应该支持禁用默认快捷键', async () => {
      const customPlugin = new KeyboardShortcuts(player, {
        enableDefaultShortcuts: false
      });

      await customPlugin.init();
      const shortcuts = customPlugin.getShortcuts();
      expect(shortcuts.size).toBe(0);

      await customPlugin.destroy();
    });

    it('应该支持禁用帮助功能', async () => {
      const customPlugin = new KeyboardShortcuts(player, {
        showHelp: false
      });

      await customPlugin.init();
      const helpElement = container.querySelector('.ldesign-shortcuts-help');
      expect(helpElement).toBeFalsy();

      await customPlugin.destroy();
    });

    it('应该支持自定义帮助键', async () => {
      const customPlugin = new KeyboardShortcuts(player, {
        helpKey: 'h'
      });

      await customPlugin.init();
      const shortcuts = customPlugin.getShortcuts();
      expect(shortcuts.has('h')).toBe(true);

      await customPlugin.destroy();
    });
  });
});
