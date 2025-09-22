/**
 * SimpleVolumeControl 音量控制插件测试
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Player } from '../../src/core/Player';
import { SimpleVolumeControl } from '../../src/plugins/SimpleVolumeControl';

describe('SimpleVolumeControl', () => {
  let container: HTMLElement;
  let player: Player;
  let volumeControl: SimpleVolumeControl;

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

    // 设置视频音量属性
    Object.defineProperty(player.element, 'volume', { value: 1, writable: true });
    Object.defineProperty(player.element, 'muted', { value: false, writable: true });
  });

  afterEach(() => {
    // 清理
    if (volumeControl) {
      volumeControl.destroy?.();
    }
    if (player) {
      player.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('初始化', () => {
    test('应该正确初始化音量控制', async () => {
      volumeControl = new SimpleVolumeControl(player, {
        showSlider: true,
        orientation: 'horizontal'
      });

      await volumeControl.init();
      
      expect(volumeControl).toBeDefined();
      expect(volumeControl.name).toBe('simpleVolumeControl');
      expect(volumeControl.player).toBe(player);
    });

    test('应该创建正确的DOM结构', async () => {
      volumeControl = new SimpleVolumeControl(player);
      await volumeControl.init();

      expect(volumeControl.element).toBeDefined();
      expect(volumeControl.element.classList.contains('volume-control')).toBe(true);
      
      const muteButton = volumeControl.element.querySelector('.volume-button');
      const volumeSlider = volumeControl.element.querySelector('.volume-slider');
      
      expect(muteButton).toBeDefined();
      expect(volumeSlider).toBeDefined();
    });

    test('应该设置默认配置', () => {
      volumeControl = new SimpleVolumeControl(player);
      
      expect(volumeControl.config.showSlider).toBe(true);
      expect(volumeControl.config.orientation).toBe('horizontal');
      expect(volumeControl.config.showValue).toBe(false);
    });
  });

  describe('静音按钮', () => {
    beforeEach(async () => {
      volumeControl = new SimpleVolumeControl(player);
      await volumeControl.init();
    });

    test('应该正确显示静音状态', () => {
      // 设置静音状态
      Object.defineProperty(player.element, 'muted', { value: true, writable: true });
      player.element.dispatchEvent(new Event('volumechange'));

      const muteButton = volumeControl.element.querySelector('.volume-button') as HTMLElement;
      expect(muteButton.getAttribute('aria-label')).toBe('取消静音');
      expect(muteButton.classList.contains('active')).toBe(true);
    });

    test('应该正确显示非静音状态', () => {
      // 设置非静音状态
      Object.defineProperty(player.element, 'muted', { value: false, writable: true });
      player.element.dispatchEvent(new Event('volumechange'));

      const muteButton = volumeControl.element.querySelector('.volume-button') as HTMLElement;
      expect(muteButton.getAttribute('aria-label')).toBe('静音');
      expect(muteButton.classList.contains('active')).toBe(false);
    });

    test('应该支持点击切换静音状态', () => {
      const muteButton = volumeControl.element.querySelector('.volume-button') as HTMLElement;
      
      // 初始状态为非静音
      expect(player.element.muted).toBe(false);
      
      // 点击静音按钮
      muteButton.click();
      expect(player.element.muted).toBe(true);
      
      // 再次点击取消静音
      muteButton.click();
      expect(player.element.muted).toBe(false);
    });

    test('应该根据音量显示不同的图标', () => {
      const muteButton = volumeControl.element.querySelector('.volume-button') as HTMLElement;
      
      // 高音量
      Object.defineProperty(player.element, 'volume', { value: 0.8, writable: true });
      player.element.dispatchEvent(new Event('volumechange'));
      expect(muteButton.classList.contains('volume-high')).toBe(true);
      
      // 中音量
      Object.defineProperty(player.element, 'volume', { value: 0.4, writable: true });
      player.element.dispatchEvent(new Event('volumechange'));
      expect(muteButton.classList.contains('volume-medium')).toBe(true);
      
      // 低音量
      Object.defineProperty(player.element, 'volume', { value: 0.1, writable: true });
      player.element.dispatchEvent(new Event('volumechange'));
      expect(muteButton.classList.contains('volume-low')).toBe(true);
    });
  });

  describe('音量滑块', () => {
    beforeEach(async () => {
      volumeControl = new SimpleVolumeControl(player, { showSlider: true });
      await volumeControl.init();
    });

    test('应该正确显示当前音量', () => {
      // 设置音量为 60%
      Object.defineProperty(player.element, 'volume', { value: 0.6, writable: true });
      player.element.dispatchEvent(new Event('volumechange'));

      const volumeSlider = volumeControl.element.querySelector('.volume-slider input') as HTMLInputElement;
      expect(volumeSlider.value).toBe('60');
    });

    test('应该支持拖拽调节音量', () => {
      const volumeSlider = volumeControl.element.querySelector('.volume-slider input') as HTMLInputElement;
      
      // 模拟拖拽到 80%
      volumeSlider.value = '80';
      volumeSlider.dispatchEvent(new Event('input'));

      expect(player.element.volume).toBe(0.8);
    });

    test('应该在调节音量时自动取消静音', () => {
      // 先设置为静音状态
      Object.defineProperty(player.element, 'muted', { value: true, writable: true });
      
      const volumeSlider = volumeControl.element.querySelector('.volume-slider input') as HTMLInputElement;
      
      // 调节音量
      volumeSlider.value = '50';
      volumeSlider.dispatchEvent(new Event('input'));

      expect(player.element.muted).toBe(false);
      expect(player.element.volume).toBe(0.5);
    });

    test('应该支持鼠标悬停显示滑块', () => {
      const volumeContainer = volumeControl.element;
      
      // 模拟鼠标进入
      volumeContainer.dispatchEvent(new MouseEvent('mouseenter'));
      
      const volumeSlider = volumeContainer.querySelector('.volume-slider') as HTMLElement;
      expect(volumeSlider.classList.contains('visible')).toBe(true);
    });

    test('应该支持鼠标离开隐藏滑块', () => {
      const volumeContainer = volumeControl.element;
      
      // 模拟鼠标进入然后离开
      volumeContainer.dispatchEvent(new MouseEvent('mouseenter'));
      volumeContainer.dispatchEvent(new MouseEvent('mouseleave'));
      
      const volumeSlider = volumeContainer.querySelector('.volume-slider') as HTMLElement;
      expect(volumeSlider.classList.contains('visible')).toBe(false);
    });
  });

  describe('音量值显示', () => {
    beforeEach(async () => {
      volumeControl = new SimpleVolumeControl(player, { showValue: true });
      await volumeControl.init();
    });

    test('应该显示当前音量百分比', () => {
      // 设置音量为 75%
      Object.defineProperty(player.element, 'volume', { value: 0.75, writable: true });
      player.element.dispatchEvent(new Event('volumechange'));

      const volumeValue = volumeControl.element.querySelector('.volume-value') as HTMLElement;
      expect(volumeValue.textContent).toBe('75%');
    });

    test('应该在静音时显示静音状态', () => {
      // 设置静音状态
      Object.defineProperty(player.element, 'muted', { value: true, writable: true });
      player.element.dispatchEvent(new Event('volumechange'));

      const volumeValue = volumeControl.element.querySelector('.volume-value') as HTMLElement;
      expect(volumeValue.textContent).toBe('静音');
    });
  });

  describe('垂直方向', () => {
    beforeEach(async () => {
      volumeControl = new SimpleVolumeControl(player, { orientation: 'vertical' });
      await volumeControl.init();
    });

    test('应该应用垂直方向样式', () => {
      expect(volumeControl.element.classList.contains('vertical')).toBe(true);
    });

    test('应该正确处理垂直滑块', () => {
      const volumeSlider = volumeControl.element.querySelector('.volume-slider input') as HTMLInputElement;
      
      // 垂直滑块应该有特殊的样式类
      expect(volumeSlider.classList.contains('vertical-slider')).toBe(true);
    });
  });

  describe('键盘交互', () => {
    beforeEach(async () => {
      volumeControl = new SimpleVolumeControl(player);
      await volumeControl.init();
    });

    test('应该支持键盘控制静音按钮', () => {
      const muteButton = volumeControl.element.querySelector('.volume-button') as HTMLElement;
      
      // 模拟回车键
      const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      muteButton.dispatchEvent(keyEvent);

      expect(player.element.muted).toBe(true);
    });

    test('应该支持键盘控制音量滑块', () => {
      const volumeSlider = volumeControl.element.querySelector('.volume-slider input') as HTMLInputElement;
      
      // 设置初始音量
      volumeSlider.value = '50';
      
      // 模拟上箭头键（增加音量）
      const upKeyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      volumeSlider.dispatchEvent(upKeyEvent);
      
      // 音量应该增加
      expect(parseInt(volumeSlider.value)).toBeGreaterThan(50);
    });
  });

  describe('边界情况处理', () => {
    beforeEach(async () => {
      volumeControl = new SimpleVolumeControl(player);
      await volumeControl.init();
    });

    test('应该处理音量超出范围的情况', () => {
      const volumeSlider = volumeControl.element.querySelector('.volume-slider input') as HTMLInputElement;
      
      // 尝试设置超出范围的音量
      volumeSlider.value = '150';
      volumeSlider.dispatchEvent(new Event('input'));

      expect(player.element.volume).toBe(1); // 应该被限制在 1
    });

    test('应该处理负数音量', () => {
      const volumeSlider = volumeControl.element.querySelector('.volume-slider input') as HTMLInputElement;
      
      // 尝试设置负数音量
      volumeSlider.value = '-10';
      volumeSlider.dispatchEvent(new Event('input'));

      expect(player.element.volume).toBe(0); // 应该被限制在 0
    });

    test('应该处理无效的音量值', () => {
      // 设置无效的音量值
      Object.defineProperty(player.element, 'volume', { value: NaN, writable: true });
      player.element.dispatchEvent(new Event('volumechange'));

      const volumeSlider = volumeControl.element.querySelector('.volume-slider input') as HTMLInputElement;
      expect(volumeSlider.value).toBe('0'); // 应该回退到 0
    });
  });

  describe('销毁', () => {
    test('应该能够正确销毁音量控制', async () => {
      volumeControl = new SimpleVolumeControl(player);
      await volumeControl.init();

      const element = volumeControl.element;
      volumeControl.destroy?.();

      // 检查事件监听器是否被移除
      const muteButton = element.querySelector('.volume-button') as HTMLElement;
      const originalMuted = player.element.muted;
      
      muteButton.click();
      expect(player.element.muted).toBe(originalMuted); // 状态不应该改变
    });
  });
});
