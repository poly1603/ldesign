/**
 * 视频播放器集成测试
 * 测试播放器与各个插件的集成功能
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Player } from '../../src/core/Player';
import { ControlBar, ControlPosition } from '../../src/plugins/ControlBar';
import { SimplePlayButton } from '../../src/plugins/SimplePlayButton';
import { SimpleTimeDisplay, TimeFormat } from '../../src/plugins/SimpleTimeDisplay';
import { SimpleProgressBar } from '../../src/plugins/SimpleProgressBar';
import { SimpleVolumeControl } from '../../src/plugins/SimpleVolumeControl';
import { SimplePlaybackRate } from '../../src/plugins/SimplePlaybackRate';
import { SimpleFullscreenButton } from '../../src/plugins/SimpleFullscreenButton';

describe('VideoPlayer Integration', () => {
  let container: HTMLElement;
  let player: Player;
  let controlBar: ControlBar;
  let plugins: any[] = [];

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    container.id = 'test-player';
    container.style.width = '800px';
    container.style.height = '450px';
    document.body.appendChild(container);

    // 创建播放器实例
    player = new Player({
      container: '#test-player',
      src: 'test.mp4',
      controls: false // 禁用默认控制栏
    });

    // 设置视频属性
    Object.defineProperty(player.element, 'duration', { value: 120, writable: true });
    Object.defineProperty(player.element, 'currentTime', { value: 0, writable: true });
    Object.defineProperty(player.element, 'volume', { value: 1, writable: true });
    Object.defineProperty(player.element, 'muted', { value: false, writable: true });
    Object.defineProperty(player.element, 'paused', { value: true, writable: true });
    Object.defineProperty(player.element, 'playbackRate', { value: 1, writable: true });
  });

  afterEach(() => {
    // 清理插件
    plugins.forEach(plugin => {
      if (plugin && plugin.destroy) {
        plugin.destroy();
      }
    });
    plugins = [];

    // 清理控制栏
    if (controlBar) {
      controlBar.destroy?.();
    }

    // 清理播放器
    if (player) {
      player.destroy();
    }

    // 清理容器
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('完整控制栏集成', () => {
    test('应该能够创建完整的控制栏系统', async () => {
      // 创建控制栏
      controlBar = new ControlBar(player, {
        autoHide: true,
        autoHideDelay: 3000,
        showOnPause: true
      });
      await controlBar.init();
      await controlBar.mount(player.container);

      // 创建播放按钮
      const playButton = new SimplePlayButton(player);
      await playButton.init();
      controlBar.registerPlugin(playButton, ControlPosition.LEFT);
      plugins.push(playButton);

      // 创建时间显示
      const timeDisplay = new SimpleTimeDisplay(player, {
        format: TimeFormat.BOTH,
        clickToToggle: true
      });
      await timeDisplay.init();
      controlBar.registerPlugin(timeDisplay, ControlPosition.LEFT);
      plugins.push(timeDisplay);

      // 创建进度条
      const progressBar = new SimpleProgressBar(player, {
        showBuffer: true,
        showTooltip: true,
        seekOnClick: true
      });
      await progressBar.init();
      controlBar.registerPlugin(progressBar, ControlPosition.CENTER);
      plugins.push(progressBar);

      // 创建音量控制
      const volumeControl = new SimpleVolumeControl(player, {
        showSlider: true,
        orientation: 'horizontal'
      });
      await volumeControl.init();
      controlBar.registerPlugin(volumeControl, ControlPosition.RIGHT);
      plugins.push(volumeControl);

      // 创建播放速度控制
      const playbackRate = new SimplePlaybackRate(player, {
        rates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        defaultRate: 1
      });
      await playbackRate.init();
      controlBar.registerPlugin(playbackRate, ControlPosition.RIGHT);
      plugins.push(playbackRate);

      // 创建全屏按钮
      const fullscreenButton = new SimpleFullscreenButton(player);
      await fullscreenButton.init();
      controlBar.registerPlugin(fullscreenButton, ControlPosition.RIGHT);
      plugins.push(fullscreenButton);

      // 验证所有插件都已正确注册
      expect(controlBar.element.querySelector('.controls-left')).toBeDefined();
      expect(controlBar.element.querySelector('.controls-center')).toBeDefined();
      expect(controlBar.element.querySelector('.controls-right')).toBeDefined();

      // 验证左侧区域包含播放按钮和时间显示
      const leftContainer = controlBar.element.querySelector('.controls-left');
      expect(leftContainer?.contains(playButton.element)).toBe(true);
      expect(leftContainer?.contains(timeDisplay.element)).toBe(true);

      // 验证中间区域包含进度条
      const centerContainer = controlBar.element.querySelector('.controls-center');
      expect(centerContainer?.contains(progressBar.element)).toBe(true);

      // 验证右侧区域包含音量控制、播放速度和全屏按钮
      const rightContainer = controlBar.element.querySelector('.controls-right');
      expect(rightContainer?.contains(volumeControl.element)).toBe(true);
      expect(rightContainer?.contains(playbackRate.element)).toBe(true);
      expect(rightContainer?.contains(fullscreenButton.element)).toBe(true);
    });
  });

  describe('播放控制集成', () => {
    beforeEach(async () => {
      // 设置基本的控制栏和播放按钮
      controlBar = new ControlBar(player);
      await controlBar.init();
      await controlBar.mount(player.container);

      const playButton = new SimplePlayButton(player);
      await playButton.init();
      controlBar.registerPlugin(playButton, ControlPosition.LEFT);
      plugins.push(playButton);
    });

    test('应该能够通过播放按钮控制视频播放', async () => {
      const playButton = plugins[0];
      const playSpy = vi.spyOn(player.element, 'play');
      const pauseSpy = vi.spyOn(player.element, 'pause');

      // 初始状态为暂停
      expect(player.element.paused).toBe(true);

      // 点击播放按钮
      playButton.element.click();
      expect(playSpy).toHaveBeenCalled();

      // 模拟播放状态变化
      Object.defineProperty(player.element, 'paused', { value: false, writable: true });
      player.element.dispatchEvent(new Event('play'));

      // 再次点击应该暂停
      playButton.element.click();
      expect(pauseSpy).toHaveBeenCalled();
    });
  });

  describe('时间和进度集成', () => {
    beforeEach(async () => {
      controlBar = new ControlBar(player);
      await controlBar.init();
      await controlBar.mount(player.container);

      const timeDisplay = new SimpleTimeDisplay(player, { format: TimeFormat.BOTH });
      await timeDisplay.init();
      controlBar.registerPlugin(timeDisplay, ControlPosition.LEFT);
      plugins.push(timeDisplay);

      const progressBar = new SimpleProgressBar(player, { seekOnClick: true });
      await progressBar.init();
      controlBar.registerPlugin(progressBar, ControlPosition.CENTER);
      plugins.push(progressBar);
    });

    test('应该同步更新时间显示和进度条', () => {
      const timeDisplay = plugins[0];
      const progressBar = plugins[1];

      // 模拟时间更新
      Object.defineProperty(player.element, 'currentTime', { value: 60, writable: true });
      player.element.dispatchEvent(new Event('timeupdate'));

      // 检查时间显示
      const currentTimeElement = timeDisplay.element.querySelector('.current-time');
      expect(currentTimeElement?.textContent).toBe('01:00');

      // 检查进度条
      const progressFill = progressBar.element.querySelector('.progress-fill') as HTMLElement;
      expect(progressFill.style.width).toBe('50%'); // 60/120 = 50%
    });

    test('应该支持通过进度条跳转并更新时间显示', () => {
      const timeDisplay = plugins[0];
      const progressBar = plugins[1];
      const progressBarElement = progressBar.element.querySelector('.progress-bar') as HTMLElement;

      // 模拟进度条宽度
      Object.defineProperty(progressBarElement, 'offsetWidth', { value: 200 });
      Object.defineProperty(progressBarElement, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 200 })
      });

      // 点击进度条 75% 位置
      const clickEvent = new MouseEvent('click', { clientX: 150 });
      progressBarElement.dispatchEvent(clickEvent);

      // 检查当前时间是否更新
      expect(player.element.currentTime).toBe(90); // 120 * 0.75 = 90

      // 模拟时间更新事件
      player.element.dispatchEvent(new Event('timeupdate'));

      // 检查时间显示是否更新
      const currentTimeElement = timeDisplay.element.querySelector('.current-time');
      expect(currentTimeElement?.textContent).toBe('01:30');
    });
  });

  describe('音量控制集成', () => {
    beforeEach(async () => {
      controlBar = new ControlBar(player);
      await controlBar.init();
      await controlBar.mount(player.container);

      const volumeControl = new SimpleVolumeControl(player, {
        showSlider: true,
        showValue: true
      });
      await volumeControl.init();
      controlBar.registerPlugin(volumeControl, ControlPosition.RIGHT);
      plugins.push(volumeControl);
    });

    test('应该能够通过音量控制调节视频音量', () => {
      const volumeControl = plugins[0];
      const volumeSlider = volumeControl.element.querySelector('.volume-slider input') as HTMLInputElement;

      // 调节音量到 60%
      volumeSlider.value = '60';
      volumeSlider.dispatchEvent(new Event('input'));

      expect(player.element.volume).toBe(0.6);

      // 检查音量值显示
      const volumeValue = volumeControl.element.querySelector('.volume-value') as HTMLElement;
      expect(volumeValue.textContent).toBe('60%');
    });

    test('应该能够通过静音按钮控制静音状态', () => {
      const volumeControl = plugins[0];
      const muteButton = volumeControl.element.querySelector('.volume-button') as HTMLElement;

      // 点击静音
      muteButton.click();
      expect(player.element.muted).toBe(true);

      // 检查按钮状态
      expect(muteButton.classList.contains('active')).toBe(true);
      expect(muteButton.getAttribute('aria-label')).toBe('取消静音');
    });
  });

  describe('播放速度控制集成', () => {
    beforeEach(async () => {
      controlBar = new ControlBar(player);
      await controlBar.init();
      await controlBar.mount(player.container);

      const playbackRate = new SimplePlaybackRate(player, {
        rates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        defaultRate: 1
      });
      await playbackRate.init();
      controlBar.registerPlugin(playbackRate, ControlPosition.RIGHT);
      plugins.push(playbackRate);
    });

    test('应该能够通过播放速度控制调节播放速度', () => {
      const playbackRate = plugins[0];
      const rateButton = playbackRate.element.querySelector('.rate-button') as HTMLElement;

      // 点击显示速度菜单
      rateButton.click();

      const rateMenu = playbackRate.element.querySelector('.rate-menu') as HTMLElement;
      expect(rateMenu.style.display).not.toBe('none');

      // 选择 1.5x 速度
      const rate15x = Array.from(rateMenu.querySelectorAll('.rate-option'))
        .find(option => option.textContent?.includes('1.5x')) as HTMLElement;
      
      rate15x.click();

      expect(player.element.playbackRate).toBe(1.5);

      // 检查按钮显示
      const rateLabel = rateButton.querySelector('.rate-label') as HTMLElement;
      expect(rateLabel.textContent).toBe('1.5x');
    });
  });

  describe('全屏控制集成', () => {
    beforeEach(async () => {
      controlBar = new ControlBar(player);
      await controlBar.init();
      await controlBar.mount(player.container);

      const fullscreenButton = new SimpleFullscreenButton(player);
      await fullscreenButton.init();
      controlBar.registerPlugin(fullscreenButton, ControlPosition.RIGHT);
      plugins.push(fullscreenButton);
    });

    test('应该能够通过全屏按钮控制全屏状态', () => {
      const fullscreenButton = plugins[0];
      const requestFullscreenSpy = vi.spyOn(player.container, 'requestFullscreen');

      // 点击全屏按钮
      fullscreenButton.element.click();

      expect(requestFullscreenSpy).toHaveBeenCalled();
    });
  });

  describe('自动隐藏功能集成', () => {
    beforeEach(async () => {
      controlBar = new ControlBar(player, {
        autoHide: true,
        autoHideDelay: 100, // 缩短延迟以便测试
        showOnPause: true
      });
      await controlBar.init();
      await controlBar.mount(player.container);

      const playButton = new SimplePlayButton(player);
      await playButton.init();
      controlBar.registerPlugin(playButton, ControlPosition.LEFT);
      plugins.push(playButton);
    });

    test('应该在播放时自动隐藏控制栏', async () => {
      // 模拟鼠标进入显示控制栏
      player.container.dispatchEvent(new MouseEvent('mouseenter'));
      expect(controlBar.element.classList.contains('visible')).toBe(true);

      // 模拟开始播放
      Object.defineProperty(player.element, 'paused', { value: false, writable: true });
      player.element.dispatchEvent(new Event('play'));

      // 模拟鼠标离开
      player.container.dispatchEvent(new MouseEvent('mouseleave'));

      // 等待自动隐藏
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(controlBar.element.classList.contains('visible')).toBe(false);
    });

    test('应该在暂停时显示控制栏', () => {
      // 模拟暂停
      Object.defineProperty(player.element, 'paused', { value: true, writable: true });
      player.element.dispatchEvent(new Event('pause'));

      expect(controlBar.element.classList.contains('visible')).toBe(true);
    });
  });

  describe('响应式设计集成', () => {
    test('应该在小屏幕上调整控制栏布局', async () => {
      // 模拟小屏幕
      container.style.width = '400px';
      container.style.height = '225px';

      controlBar = new ControlBar(player);
      await controlBar.init();
      await controlBar.mount(player.container);

      // 添加多个插件
      const playButton = new SimplePlayButton(player);
      await playButton.init();
      controlBar.registerPlugin(playButton, ControlPosition.LEFT);
      plugins.push(playButton);

      const volumeControl = new SimpleVolumeControl(player);
      await volumeControl.init();
      controlBar.registerPlugin(volumeControl, ControlPosition.RIGHT);
      plugins.push(volumeControl);

      // 检查控制栏是否应用了响应式样式
      expect(controlBar.element.classList.contains('compact')).toBe(true);
    });
  });
});
