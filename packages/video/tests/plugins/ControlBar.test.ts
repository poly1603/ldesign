/**
 * ControlBar 控制栏插件测试
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Player } from '../../src/core/Player';
import { ControlBar, ControlPosition } from '../../src/plugins/ControlBar';

describe('ControlBar', () => {
  let container: HTMLElement;
  let player: Player;
  let controlBar: ControlBar;

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    container.id = 'test-player';
    document.body.appendChild(container);

    // 创建播放器实例
    player = new Player({
      container: '#test-player',
      src: 'test.mp4'
    });
  });

  afterEach(() => {
    // 清理
    if (controlBar) {
      controlBar.destroy?.();
    }
    if (player) {
      player.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('初始化', () => {
    test('应该正确初始化控制栏', async () => {
      controlBar = new ControlBar(player, {
        autoHide: true,
        autoHideDelay: 3000,
        showOnPause: true,
        height: 48
      });

      await controlBar.init();
      
      expect(controlBar).toBeDefined();
      expect(controlBar.name).toBe('controlBar');
      expect(controlBar.player).toBe(player);
    });

    test('应该创建正确的DOM结构', async () => {
      controlBar = new ControlBar(player);
      await controlBar.init();
      await controlBar.mount(player.container);

      expect(controlBar.element).toBeDefined();
      expect(controlBar.element.classList.contains('ldesign-video-controls')).toBe(true);
      
      // 检查三个区域容器
      const leftContainer = controlBar.element.querySelector('.controls-left');
      const centerContainer = controlBar.element.querySelector('.controls-center');
      const rightContainer = controlBar.element.querySelector('.controls-right');
      
      expect(leftContainer).toBeDefined();
      expect(centerContainer).toBeDefined();
      expect(rightContainer).toBeDefined();
    });

    test('应该设置默认配置', () => {
      controlBar = new ControlBar(player);
      
      expect(controlBar.config.autoHide).toBe(true);
      expect(controlBar.config.autoHideDelay).toBe(3000);
      expect(controlBar.config.showOnPause).toBe(true);
      expect(controlBar.config.height).toBe(48);
    });
  });

  describe('插件注册', () => {
    beforeEach(async () => {
      controlBar = new ControlBar(player);
      await controlBar.init();
      await controlBar.mount(player.container);
    });

    test('应该能够注册插件到左侧区域', () => {
      const mockPlugin = {
        name: 'testPlugin',
        element: document.createElement('button')
      };

      controlBar.registerPlugin(mockPlugin, ControlPosition.LEFT);
      
      const leftContainer = controlBar.element.querySelector('.controls-left');
      expect(leftContainer?.contains(mockPlugin.element)).toBe(true);
    });

    test('应该能够注册插件到中间区域', () => {
      const mockPlugin = {
        name: 'testPlugin',
        element: document.createElement('div')
      };

      controlBar.registerPlugin(mockPlugin, ControlPosition.CENTER);
      
      const centerContainer = controlBar.element.querySelector('.controls-center');
      expect(centerContainer?.contains(mockPlugin.element)).toBe(true);
    });

    test('应该能够注册插件到右侧区域', () => {
      const mockPlugin = {
        name: 'testPlugin',
        element: document.createElement('button')
      };

      controlBar.registerPlugin(mockPlugin, ControlPosition.RIGHT);
      
      const rightContainer = controlBar.element.querySelector('.controls-right');
      expect(rightContainer?.contains(mockPlugin.element)).toBe(true);
    });

    test('应该能够取消注册插件', () => {
      const mockPlugin = {
        name: 'testPlugin',
        element: document.createElement('button')
      };

      controlBar.registerPlugin(mockPlugin, ControlPosition.LEFT);
      controlBar.unregisterPlugin(mockPlugin);
      
      const leftContainer = controlBar.element.querySelector('.controls-left');
      expect(leftContainer?.contains(mockPlugin.element)).toBe(false);
    });
  });

  describe('自动隐藏功能', () => {
    beforeEach(async () => {
      controlBar = new ControlBar(player, {
        autoHide: true,
        autoHideDelay: 100 // 缩短延迟以便测试
      });
      await controlBar.init();
      await controlBar.mount(player.container);
    });

    test('应该在鼠标离开后自动隐藏', async () => {
      // 模拟鼠标进入
      player.container.dispatchEvent(new MouseEvent('mouseenter'));
      expect(controlBar.element.classList.contains('visible')).toBe(true);

      // 模拟鼠标离开
      player.container.dispatchEvent(new MouseEvent('mouseleave'));
      
      // 等待自动隐藏延迟
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(controlBar.element.classList.contains('visible')).toBe(false);
    });

    test('应该在暂停时显示控制栏', () => {
      controlBar.config.showOnPause = true;
      
      // 模拟暂停事件
      player.element.dispatchEvent(new Event('pause'));
      
      expect(controlBar.element.classList.contains('visible')).toBe(true);
    });

    test('应该在播放时根据配置隐藏控制栏', () => {
      // 先显示控制栏
      controlBar.show();
      expect(controlBar.element.classList.contains('visible')).toBe(true);
      
      // 模拟播放事件
      player.element.dispatchEvent(new Event('play'));
      
      // 控制栏应该仍然可见，但会在延迟后隐藏
      expect(controlBar.element.classList.contains('visible')).toBe(true);
    });
  });

  describe('显示/隐藏控制', () => {
    beforeEach(async () => {
      controlBar = new ControlBar(player);
      await controlBar.init();
      await controlBar.mount(player.container);
    });

    test('应该能够手动显示控制栏', () => {
      controlBar.show();
      expect(controlBar.element.classList.contains('visible')).toBe(true);
    });

    test('应该能够手动隐藏控制栏', () => {
      controlBar.show();
      controlBar.hide();
      expect(controlBar.element.classList.contains('visible')).toBe(false);
    });

    test('应该能够切换控制栏显示状态', () => {
      const initialVisible = controlBar.element.classList.contains('visible');
      controlBar.toggle();
      expect(controlBar.element.classList.contains('visible')).toBe(!initialVisible);
    });
  });

  describe('销毁', () => {
    test('应该能够正确销毁控制栏', async () => {
      controlBar = new ControlBar(player);
      await controlBar.init();
      await controlBar.mount(player.container);

      const element = controlBar.element;
      controlBar.destroy?.();

      expect(element.parentNode).toBeNull();
    });
  });
});
