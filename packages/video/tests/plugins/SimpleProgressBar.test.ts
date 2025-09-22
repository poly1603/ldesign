/**
 * SimpleProgressBar 进度条插件测试
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Player } from '../../src/core/Player';
import { SimpleProgressBar } from '../../src/plugins/SimpleProgressBar';

describe('SimpleProgressBar', () => {
  let container: HTMLElement;
  let player: Player;
  let progressBar: SimpleProgressBar;

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

    // 设置视频属性
    Object.defineProperty(player.element, 'duration', { value: 100, writable: true });
    Object.defineProperty(player.element, 'currentTime', { value: 25, writable: true });
    Object.defineProperty(player.element, 'buffered', {
      value: {
        length: 1,
        start: () => 0,
        end: () => 50
      },
      writable: true
    });
  });

  afterEach(() => {
    // 清理
    if (progressBar) {
      progressBar.destroy?.();
    }
    if (player) {
      player.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('初始化', () => {
    test('应该正确初始化进度条', async () => {
      progressBar = new SimpleProgressBar(player, {
        showBuffer: true,
        showTooltip: true,
        seekOnClick: true
      });

      await progressBar.init();
      
      expect(progressBar).toBeDefined();
      expect(progressBar.name).toBe('simpleProgressBar');
      expect(progressBar.player).toBe(player);
    });

    test('应该创建正确的DOM结构', async () => {
      progressBar = new SimpleProgressBar(player);
      await progressBar.init();

      expect(progressBar.element).toBeDefined();
      expect(progressBar.element.classList.contains('progress-container')).toBe(true);
      
      const progressBar_element = progressBar.element.querySelector('.progress-bar');
      const progressFill = progressBar.element.querySelector('.progress-fill');
      const bufferFill = progressBar.element.querySelector('.buffer-fill');
      
      expect(progressBar_element).toBeDefined();
      expect(progressFill).toBeDefined();
      expect(bufferFill).toBeDefined();
    });

    test('应该设置默认配置', () => {
      progressBar = new SimpleProgressBar(player);
      
      expect(progressBar.config.showBuffer).toBe(true);
      expect(progressBar.config.showTooltip).toBe(true);
      expect(progressBar.config.seekOnClick).toBe(true);
      expect(progressBar.config.seekOnDrag).toBe(true);
    });
  });

  describe('进度显示', () => {
    beforeEach(async () => {
      progressBar = new SimpleProgressBar(player);
      await progressBar.init();
    });

    test('应该正确显示播放进度', () => {
      // 触发时间更新
      player.element.dispatchEvent(new Event('timeupdate'));

      const progressFill = progressBar.element.querySelector('.progress-fill') as HTMLElement;
      expect(progressFill.style.width).toBe('25%'); // 25/100 = 25%
    });

    test('应该正确显示缓冲进度', () => {
      // 触发缓冲更新
      player.element.dispatchEvent(new Event('progress'));

      const bufferFill = progressBar.element.querySelector('.buffer-fill') as HTMLElement;
      expect(bufferFill.style.width).toBe('50%'); // 50/100 = 50%
    });

    test('应该在时长变化时更新进度', () => {
      // 改变时长
      Object.defineProperty(player.element, 'duration', { value: 200, writable: true });
      
      // 触发时长变化事件
      player.element.dispatchEvent(new Event('durationchange'));
      
      // 触发时间更新
      player.element.dispatchEvent(new Event('timeupdate'));

      const progressFill = progressBar.element.querySelector('.progress-fill') as HTMLElement;
      expect(progressFill.style.width).toBe('12.5%'); // 25/200 = 12.5%
    });
  });

  describe('点击跳转', () => {
    beforeEach(async () => {
      progressBar = new SimpleProgressBar(player, { seekOnClick: true });
      await progressBar.init();
    });

    test('应该支持点击跳转', () => {
      const progressBarElement = progressBar.element.querySelector('.progress-bar') as HTMLElement;
      
      // 模拟进度条宽度
      Object.defineProperty(progressBarElement, 'offsetWidth', { value: 200 });
      Object.defineProperty(progressBarElement, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 200 })
      });

      // 模拟点击中间位置
      const clickEvent = new MouseEvent('click', {
        clientX: 100 // 50% 位置
      });
      
      progressBarElement.dispatchEvent(clickEvent);

      // 应该设置当前时间为 50% 的位置
      expect(player.element.currentTime).toBe(50); // 100 * 0.5 = 50
    });

    test('应该在禁用点击跳转时不响应点击', async () => {
      progressBar = new SimpleProgressBar(player, { seekOnClick: false });
      await progressBar.init();

      const originalCurrentTime = player.element.currentTime;
      const progressBarElement = progressBar.element.querySelector('.progress-bar') as HTMLElement;
      
      // 模拟点击
      const clickEvent = new MouseEvent('click', { clientX: 100 });
      progressBarElement.dispatchEvent(clickEvent);

      // 当前时间不应该改变
      expect(player.element.currentTime).toBe(originalCurrentTime);
    });
  });

  describe('拖拽跳转', () => {
    beforeEach(async () => {
      progressBar = new SimpleProgressBar(player, { seekOnDrag: true });
      await progressBar.init();
    });

    test('应该支持拖拽跳转', () => {
      const progressBarElement = progressBar.element.querySelector('.progress-bar') as HTMLElement;
      
      // 模拟进度条宽度
      Object.defineProperty(progressBarElement, 'offsetWidth', { value: 200 });
      Object.defineProperty(progressBarElement, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 200 })
      });

      // 模拟拖拽开始
      const mouseDownEvent = new MouseEvent('mousedown', { clientX: 50 });
      progressBarElement.dispatchEvent(mouseDownEvent);

      // 模拟拖拽移动
      const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 150 });
      document.dispatchEvent(mouseMoveEvent);

      // 模拟拖拽结束
      const mouseUpEvent = new MouseEvent('mouseup');
      document.dispatchEvent(mouseUpEvent);

      // 应该设置当前时间为 75% 的位置
      expect(player.element.currentTime).toBe(75); // 100 * 0.75 = 75
    });

    test('应该在拖拽时显示拖拽状态', () => {
      const progressBarElement = progressBar.element.querySelector('.progress-bar') as HTMLElement;
      
      // 模拟拖拽开始
      const mouseDownEvent = new MouseEvent('mousedown', { clientX: 50 });
      progressBarElement.dispatchEvent(mouseDownEvent);

      expect(progressBar.element.classList.contains('dragging')).toBe(true);

      // 模拟拖拽结束
      const mouseUpEvent = new MouseEvent('mouseup');
      document.dispatchEvent(mouseUpEvent);

      expect(progressBar.element.classList.contains('dragging')).toBe(false);
    });
  });

  describe('工具提示', () => {
    beforeEach(async () => {
      progressBar = new SimpleProgressBar(player, { showTooltip: true });
      await progressBar.init();
    });

    test('应该在鼠标悬停时显示工具提示', () => {
      const progressBarElement = progressBar.element.querySelector('.progress-bar') as HTMLElement;
      
      // 模拟鼠标进入
      const mouseEnterEvent = new MouseEvent('mouseenter');
      progressBarElement.dispatchEvent(mouseEnterEvent);

      const tooltip = progressBar.element.querySelector('.progress-tooltip');
      expect(tooltip).toBeDefined();
    });

    test('应该在鼠标移动时更新工具提示位置和内容', () => {
      const progressBarElement = progressBar.element.querySelector('.progress-bar') as HTMLElement;
      
      // 模拟进度条宽度
      Object.defineProperty(progressBarElement, 'offsetWidth', { value: 200 });
      Object.defineProperty(progressBarElement, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 200 })
      });

      // 模拟鼠标进入
      progressBarElement.dispatchEvent(new MouseEvent('mouseenter'));

      // 模拟鼠标移动到 50% 位置
      const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 100 });
      progressBarElement.dispatchEvent(mouseMoveEvent);

      const tooltip = progressBar.element.querySelector('.progress-tooltip') as HTMLElement;
      expect(tooltip.textContent).toBe('00:50'); // 50% of 100 seconds
    });

    test('应该在鼠标离开时隐藏工具提示', () => {
      const progressBarElement = progressBar.element.querySelector('.progress-bar') as HTMLElement;
      
      // 模拟鼠标进入和离开
      progressBarElement.dispatchEvent(new MouseEvent('mouseenter'));
      progressBarElement.dispatchEvent(new MouseEvent('mouseleave'));

      const tooltip = progressBar.element.querySelector('.progress-tooltip') as HTMLElement;
      expect(tooltip.style.display).toBe('none');
    });
  });

  describe('边界情况处理', () => {
    beforeEach(async () => {
      progressBar = new SimpleProgressBar(player);
      await progressBar.init();
    });

    test('应该处理无效的时长', () => {
      // 设置无效时长
      Object.defineProperty(player.element, 'duration', { value: NaN, writable: true });
      
      // 触发时间更新
      player.element.dispatchEvent(new Event('timeupdate'));

      const progressFill = progressBar.element.querySelector('.progress-fill') as HTMLElement;
      expect(progressFill.style.width).toBe('0%');
    });

    test('应该处理超出范围的当前时间', () => {
      // 设置超出范围的当前时间
      Object.defineProperty(player.element, 'currentTime', { value: 150, writable: true });
      
      // 触发时间更新
      player.element.dispatchEvent(new Event('timeupdate'));

      const progressFill = progressBar.element.querySelector('.progress-fill') as HTMLElement;
      expect(progressFill.style.width).toBe('100%');
    });

    test('应该处理负数当前时间', () => {
      // 设置负数当前时间
      Object.defineProperty(player.element, 'currentTime', { value: -10, writable: true });
      
      // 触发时间更新
      player.element.dispatchEvent(new Event('timeupdate'));

      const progressFill = progressBar.element.querySelector('.progress-fill') as HTMLElement;
      expect(progressFill.style.width).toBe('0%');
    });
  });

  describe('销毁', () => {
    test('应该能够正确销毁进度条', async () => {
      progressBar = new SimpleProgressBar(player);
      await progressBar.init();

      const element = progressBar.element;
      progressBar.destroy?.();

      // 检查事件监听器是否被移除
      const originalCurrentTime = player.element.currentTime;
      const progressBarElement = element.querySelector('.progress-bar') as HTMLElement;
      
      const clickEvent = new MouseEvent('click', { clientX: 100 });
      progressBarElement.dispatchEvent(clickEvent);
      
      // 当前时间不应该改变
      expect(player.element.currentTime).toBe(originalCurrentTime);
    });
  });
});
