/**
 * SimpleTimeDisplay 时间显示插件测试
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Player } from '../../src/core/Player';
import { SimpleTimeDisplay, TimeFormat } from '../../src/plugins/SimpleTimeDisplay';

describe('SimpleTimeDisplay', () => {
  let container: HTMLElement;
  let player: Player;
  let timeDisplay: SimpleTimeDisplay;

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

    // 设置视频时长
    Object.defineProperty(player.element, 'duration', { value: 120, writable: true });
    Object.defineProperty(player.element, 'currentTime', { value: 30, writable: true });
  });

  afterEach(() => {
    // 清理
    if (timeDisplay) {
      timeDisplay.destroy?.();
    }
    if (player) {
      player.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('初始化', () => {
    test('应该正确初始化时间显示', async () => {
      timeDisplay = new SimpleTimeDisplay(player, {
        format: TimeFormat.BOTH,
        clickToToggle: true
      });

      await timeDisplay.init();
      
      expect(timeDisplay).toBeDefined();
      expect(timeDisplay.name).toBe('simpleTimeDisplay');
      expect(timeDisplay.player).toBe(player);
    });

    test('应该创建正确的DOM结构', async () => {
      timeDisplay = new SimpleTimeDisplay(player);
      await timeDisplay.init();

      expect(timeDisplay.element).toBeDefined();
      expect(timeDisplay.element.classList.contains('ldesign-time-display')).toBe(true);
      
      const currentTime = timeDisplay.element.querySelector('.current-time');
      const separator = timeDisplay.element.querySelector('.separator');
      const duration = timeDisplay.element.querySelector('.duration');
      
      expect(currentTime).toBeDefined();
      expect(separator).toBeDefined();
      expect(duration).toBeDefined();
    });

    test('应该设置默认配置', () => {
      timeDisplay = new SimpleTimeDisplay(player);
      
      expect(timeDisplay.config.format).toBe(TimeFormat.BOTH);
      expect(timeDisplay.config.clickToToggle).toBe(true);
      expect(timeDisplay.config.showMilliseconds).toBe(false);
    });
  });

  describe('时间格式化', () => {
    beforeEach(async () => {
      timeDisplay = new SimpleTimeDisplay(player);
      await timeDisplay.init();
    });

    test('应该正确格式化秒数', () => {
      // 通过反射访问私有方法进行测试
      const formatTime = (timeDisplay as any).formatTime.bind(timeDisplay);
      
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(30)).toBe('00:30');
      expect(formatTime(90)).toBe('01:30');
      expect(formatTime(3661)).toBe('01:01:01');
    });

    test('应该处理无效时间值', () => {
      const formatTime = (timeDisplay as any).formatTime.bind(timeDisplay);
      
      expect(formatTime(NaN)).toBe('00:00');
      expect(formatTime(Infinity)).toBe('00:00');
      expect(formatTime(-10)).toBe('00:00');
    });

    test('应该支持毫秒显示', async () => {
      timeDisplay = new SimpleTimeDisplay(player, { showMilliseconds: true });
      await timeDisplay.init();
      
      const formatTime = (timeDisplay as any).formatTime.bind(timeDisplay);
      expect(formatTime(30.5)).toBe('00:30.500');
    });
  });

  describe('显示格式', () => {
    beforeEach(async () => {
      timeDisplay = new SimpleTimeDisplay(player, { format: TimeFormat.BOTH });
      await timeDisplay.init();
    });

    test('应该正确显示当前时间和总时长', () => {
      // 触发时间更新
      player.element.dispatchEvent(new Event('loadedmetadata'));
      player.element.dispatchEvent(new Event('timeupdate'));

      const currentTime = timeDisplay.element.querySelector('.current-time');
      const separator = timeDisplay.element.querySelector('.separator');
      const duration = timeDisplay.element.querySelector('.duration');

      expect(currentTime?.textContent).toBe('00:30');
      expect(separator?.textContent).toBe('/');
      expect(duration?.textContent).toBe('02:00');
    });

    test('应该支持只显示当前时间', () => {
      timeDisplay.setFormat(TimeFormat.CURRENT);

      const currentTime = timeDisplay.element.querySelector('.current-time') as HTMLElement;
      const separator = timeDisplay.element.querySelector('.separator') as HTMLElement;
      const duration = timeDisplay.element.querySelector('.duration') as HTMLElement;

      expect(currentTime.style.display).not.toBe('none');
      expect(separator.style.display).toBe('none');
      expect(duration.style.display).toBe('none');
    });

    test('应该支持只显示总时长', () => {
      timeDisplay.setFormat(TimeFormat.DURATION);

      const currentTime = timeDisplay.element.querySelector('.current-time') as HTMLElement;
      const separator = timeDisplay.element.querySelector('.separator') as HTMLElement;
      const duration = timeDisplay.element.querySelector('.duration') as HTMLElement;

      expect(currentTime.style.display).toBe('none');
      expect(separator.style.display).toBe('none');
      expect(duration.style.display).toBe('inline');
    });

    test('应该支持显示剩余时间', () => {
      timeDisplay.setFormat(TimeFormat.REMAINING);

      const currentTime = timeDisplay.element.querySelector('.current-time') as HTMLElement;
      const separator = timeDisplay.element.querySelector('.separator') as HTMLElement;
      const duration = timeDisplay.element.querySelector('.duration') as HTMLElement;

      expect(currentTime.textContent).toBe('-01:30'); // 120 - 30 = 90 seconds = 01:30
      expect(separator.style.display).toBe('none');
      expect(duration.style.display).toBe('none');
    });
  });

  describe('格式切换', () => {
    beforeEach(async () => {
      timeDisplay = new SimpleTimeDisplay(player, { clickToToggle: true });
      await timeDisplay.init();
    });

    test('应该支持点击切换格式', () => {
      const initialFormat = timeDisplay.getFormat();
      
      // 点击元素
      timeDisplay.element.click();
      
      const newFormat = timeDisplay.getFormat();
      expect(newFormat).not.toBe(initialFormat);
    });

    test('应该循环切换所有格式', () => {
      const formats = [TimeFormat.BOTH, TimeFormat.CURRENT, TimeFormat.REMAINING, TimeFormat.DURATION];
      
      // 从 BOTH 开始，点击应该切换到 CURRENT
      expect(timeDisplay.getFormat()).toBe(TimeFormat.BOTH);
      
      timeDisplay.element.click();
      expect(timeDisplay.getFormat()).toBe(TimeFormat.CURRENT);
      
      timeDisplay.element.click();
      expect(timeDisplay.getFormat()).toBe(TimeFormat.REMAINING);
      
      timeDisplay.element.click();
      expect(timeDisplay.getFormat()).toBe(TimeFormat.DURATION);
      
      timeDisplay.element.click();
      expect(timeDisplay.getFormat()).toBe(TimeFormat.BOTH);
    });

    test('应该支持键盘切换', () => {
      const initialFormat = timeDisplay.getFormat();
      
      // 模拟回车键
      const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      timeDisplay.element.dispatchEvent(keyEvent);
      
      expect(timeDisplay.getFormat()).not.toBe(initialFormat);
    });

    test('应该支持空格键切换', () => {
      const initialFormat = timeDisplay.getFormat();
      
      // 模拟空格键
      const keyEvent = new KeyboardEvent('keydown', { key: ' ' });
      timeDisplay.element.dispatchEvent(keyEvent);
      
      expect(timeDisplay.getFormat()).not.toBe(initialFormat);
    });
  });

  describe('时间更新', () => {
    beforeEach(async () => {
      timeDisplay = new SimpleTimeDisplay(player);
      await timeDisplay.init();
    });

    test('应该响应时间更新事件', () => {
      // 改变当前时间
      Object.defineProperty(player.element, 'currentTime', { value: 60, writable: true });
      
      // 触发时间更新事件
      player.element.dispatchEvent(new Event('timeupdate'));
      
      const currentTime = timeDisplay.element.querySelector('.current-time');
      expect(currentTime?.textContent).toBe('01:00');
    });

    test('应该响应时长变化事件', () => {
      // 改变时长
      Object.defineProperty(player.element, 'duration', { value: 180, writable: true });
      
      // 触发时长变化事件
      player.element.dispatchEvent(new Event('durationchange'));
      
      const duration = timeDisplay.element.querySelector('.duration');
      expect(duration?.textContent).toBe('03:00');
    });

    test('应该响应元数据加载事件', () => {
      // 改变时间和时长
      Object.defineProperty(player.element, 'currentTime', { value: 45, writable: true });
      Object.defineProperty(player.element, 'duration', { value: 150, writable: true });
      
      // 触发元数据加载事件
      player.element.dispatchEvent(new Event('loadedmetadata'));
      
      const currentTime = timeDisplay.element.querySelector('.current-time');
      const duration = timeDisplay.element.querySelector('.duration');
      
      expect(currentTime?.textContent).toBe('00:45');
      expect(duration?.textContent).toBe('02:30');
    });
  });

  describe('时间信息获取', () => {
    beforeEach(async () => {
      timeDisplay = new SimpleTimeDisplay(player);
      await timeDisplay.init();
      
      // 触发元数据加载以更新内部状态
      player.element.dispatchEvent(new Event('loadedmetadata'));
    });

    test('应该返回正确的时间信息', () => {
      const timeInfo = timeDisplay.getTimeInfo();
      
      expect(timeInfo.currentTime).toBe(30);
      expect(timeInfo.duration).toBe(120);
      expect(timeInfo.remaining).toBe(90);
    });
  });

  describe('销毁', () => {
    test('应该能够正确销毁时间显示', async () => {
      timeDisplay = new SimpleTimeDisplay(player, { clickToToggle: true });
      await timeDisplay.init();

      const element = timeDisplay.element;
      timeDisplay.destroy();

      // 检查点击事件是否被移除
      const initialFormat = TimeFormat.BOTH;
      element.click();
      // 由于事件监听器被移除，格式不应该改变
      expect(timeDisplay.getFormat()).toBe(initialFormat);
    });
  });
});
