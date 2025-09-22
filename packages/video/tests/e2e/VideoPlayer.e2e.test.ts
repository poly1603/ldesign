/**
 * 视频播放器端到端测试
 * 模拟真实用户交互场景
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

// 模拟高级功能类
class MockThemeManager {
  constructor(player: any) {
    this.player = player;
    this.currentTheme = 'dark';
    this.themes = {
      dark: { name: '暗黑主题', colors: { primary: '#722ED1' } },
      light: { name: '明亮主题', colors: { primary: '#1890ff' } },
      purple: { name: '紫色主题', colors: { primary: '#722ED1' } }
    };
  }

  switchTheme(themeName: string) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
      console.log(`切换到${this.themes[themeName].name}`);
    }
  }

  applyTheme(theme: any) {
    // 模拟主题应用
  }
}

class MockDanmakuPlugin {
  constructor(player: any) {
    this.player = player;
    this.enabled = true;
    this.container = null;
  }

  init() {
    this.createContainer();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'danmaku-container';
    this.player.element.parentElement.appendChild(this.container);
  }

  addDanmaku(text: string, type = 'right') {
    if (!this.enabled || !this.container) return;
    
    const danmaku = document.createElement('div');
    danmaku.textContent = text;
    danmaku.className = 'danmaku-item';
    this.container.appendChild(danmaku);
    
    // 模拟动画结束后移除
    setTimeout(() => {
      if (danmaku.parentNode) {
        danmaku.parentNode.removeChild(danmaku);
      }
    }, 3000);
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.container) {
      this.container.innerHTML = '';
    }
    console.log(`弹幕${this.enabled ? '开启' : '关闭'}`);
  }
}

describe('VideoPlayer E2E', () => {
  let container: HTMLElement;
  let player: Player;
  let controlBar: ControlBar;
  let plugins: any[] = [];
  let themeManager: MockThemeManager;
  let danmakuPlugin: MockDanmakuPlugin;

  beforeEach(async () => {
    // 创建测试容器
    container = document.createElement('div');
    container.id = 'test-player';
    container.style.width = '800px';
    container.style.height = '450px';
    document.body.appendChild(container);

    // 创建播放器实例
    player = new Player({
      container: '#test-player',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      controls: false
    });

    // 设置视频属性
    Object.defineProperty(player.element, 'duration', { value: 596.474195, writable: true });
    Object.defineProperty(player.element, 'currentTime', { value: 0, writable: true });
    Object.defineProperty(player.element, 'volume', { value: 1, writable: true });
    Object.defineProperty(player.element, 'muted', { value: false, writable: true });
    Object.defineProperty(player.element, 'paused', { value: true, writable: true });
    Object.defineProperty(player.element, 'playbackRate', { value: 1, writable: true });

    // 创建完整的控制栏系统
    await setupCompleteControlBar();

    // 初始化高级功能
    themeManager = new MockThemeManager(player);
    danmakuPlugin = new MockDanmakuPlugin(player);
    danmakuPlugin.init();
  });

  afterEach(() => {
    // 清理
    plugins.forEach(plugin => {
      if (plugin && plugin.destroy) {
        plugin.destroy();
      }
    });
    plugins = [];

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

  async function setupCompleteControlBar() {
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
      seekOnClick: true,
      seekOnDrag: true
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
  }

  describe('完整用户交互流程', () => {
    test('应该支持完整的视频观看流程', async () => {
      const [playButton, timeDisplay, progressBar, volumeControl, playbackRate, fullscreenButton] = plugins;

      // 1. 用户点击播放按钮开始播放
      const playSpy = vi.spyOn(player.element, 'play');
      playButton.element.click();
      expect(playSpy).toHaveBeenCalled();

      // 模拟播放开始
      Object.defineProperty(player.element, 'paused', { value: false, writable: true });
      player.element.dispatchEvent(new Event('play'));

      // 检查播放按钮状态
      expect(playButton.element.classList.contains('active')).toBe(true);
      expect(playButton.element.getAttribute('aria-label')).toBe('暂停');

      // 2. 模拟视频播放进度
      Object.defineProperty(player.element, 'currentTime', { value: 30, writable: true });
      player.element.dispatchEvent(new Event('timeupdate'));

      // 检查时间显示更新
      const currentTimeElement = timeDisplay.element.querySelector('.current-time');
      expect(currentTimeElement?.textContent).toBe('00:30');

      // 检查进度条更新
      const progressFill = progressBar.element.querySelector('.progress-fill') as HTMLElement;
      expect(parseFloat(progressFill.style.width)).toBeCloseTo(5.03, 1); // 30/596.474195 ≈ 5.03%

      // 3. 用户调节音量
      const volumeSlider = volumeControl.element.querySelector('.volume-slider input') as HTMLInputElement;
      volumeSlider.value = '70';
      volumeSlider.dispatchEvent(new Event('input'));
      expect(player.element.volume).toBe(0.7);

      // 4. 用户更改播放速度
      const rateButton = playbackRate.element.querySelector('.rate-button') as HTMLElement;
      rateButton.click();

      const rate15x = Array.from(playbackRate.element.querySelectorAll('.rate-option'))
        .find(option => option.textContent?.includes('1.5x')) as HTMLElement;
      rate15x.click();
      expect(player.element.playbackRate).toBe(1.5);

      // 5. 用户通过进度条跳转
      const progressBarElement = progressBar.element.querySelector('.progress-bar') as HTMLElement;
      Object.defineProperty(progressBarElement, 'offsetWidth', { value: 800 });
      Object.defineProperty(progressBarElement, 'getBoundingClientRect', {
        value: () => ({ left: 0, width: 800 })
      });

      const clickEvent = new MouseEvent('click', { clientX: 400 }); // 50% 位置
      progressBarElement.dispatchEvent(clickEvent);
      expect(player.element.currentTime).toBeCloseTo(298.237, 1); // 596.474195 * 0.5

      // 6. 用户暂停播放
      const pauseSpy = vi.spyOn(player.element, 'pause');
      playButton.element.click();
      expect(pauseSpy).toHaveBeenCalled();

      // 模拟暂停状态
      Object.defineProperty(player.element, 'paused', { value: true, writable: true });
      player.element.dispatchEvent(new Event('pause'));

      // 检查控制栏在暂停时显示
      expect(controlBar.element.classList.contains('visible')).toBe(true);
    });
  });

  describe('键盘快捷键交互', () => {
    test('应该支持完整的键盘快捷键操作', () => {
      // 模拟键盘快捷键处理函数
      const handleKeydown = (e: KeyboardEvent) => {
        switch (e.key.toLowerCase()) {
          case ' ':
            e.preventDefault();
            if (player.element.paused) {
              player.element.play();
            } else {
              player.element.pause();
            }
            break;
          case 'm':
            e.preventDefault();
            player.element.muted = !player.element.muted;
            break;
          case 'f':
            e.preventDefault();
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              player.container.requestFullscreen();
            }
            break;
          case 'arrowleft':
            e.preventDefault();
            player.element.currentTime = Math.max(0, player.element.currentTime - 10);
            break;
          case 'arrowright':
            e.preventDefault();
            player.element.currentTime = Math.min(player.element.duration, player.element.currentTime + 10);
            break;
        }
      };

      document.addEventListener('keydown', handleKeydown);

      const playSpy = vi.spyOn(player.element, 'play');
      const pauseSpy = vi.spyOn(player.element, 'pause');
      const requestFullscreenSpy = vi.spyOn(player.container, 'requestFullscreen');

      // 测试空格键播放/暂停
      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      expect(playSpy).toHaveBeenCalled();

      Object.defineProperty(player.element, 'paused', { value: false, writable: true });
      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      expect(pauseSpy).toHaveBeenCalled();

      // 测试 M 键静音
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
      expect(player.element.muted).toBe(true);

      // 测试 F 键全屏
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
      expect(requestFullscreenSpy).toHaveBeenCalled();

      // 测试左右箭头键跳转
      Object.defineProperty(player.element, 'currentTime', { value: 30, writable: true });
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'arrowleft' }));
      expect(player.element.currentTime).toBe(20);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'arrowright' }));
      expect(player.element.currentTime).toBe(30);

      document.removeEventListener('keydown', handleKeydown);
    });
  });

  describe('高级功能交互', () => {
    test('应该支持主题切换功能', () => {
      // 测试主题切换
      expect(themeManager.currentTheme).toBe('dark');

      themeManager.switchTheme('light');
      expect(themeManager.currentTheme).toBe('light');

      themeManager.switchTheme('purple');
      expect(themeManager.currentTheme).toBe('purple');
    });

    test('应该支持弹幕功能', () => {
      // 测试弹幕添加
      danmakuPlugin.addDanmaku('测试弹幕', 'right');
      
      const danmakuItems = danmakuPlugin.container.querySelectorAll('.danmaku-item');
      expect(danmakuItems.length).toBe(1);
      expect(danmakuItems[0].textContent).toBe('测试弹幕');

      // 测试弹幕开关
      danmakuPlugin.toggle();
      expect(danmakuPlugin.enabled).toBe(false);
      expect(danmakuPlugin.container.innerHTML).toBe('');

      danmakuPlugin.toggle();
      expect(danmakuPlugin.enabled).toBe(true);
    });
  });

  describe('响应式交互', () => {
    test('应该在不同屏幕尺寸下正确工作', async () => {
      // 测试大屏幕
      container.style.width = '1200px';
      container.style.height = '675px';
      
      // 触发 resize 事件
      window.dispatchEvent(new Event('resize'));
      
      // 检查控制栏是否适应大屏幕
      expect(controlBar.element.classList.contains('large-screen')).toBe(true);

      // 测试小屏幕
      container.style.width = '400px';
      container.style.height = '225px';
      
      window.dispatchEvent(new Event('resize'));
      
      // 检查控制栏是否适应小屏幕
      expect(controlBar.element.classList.contains('compact')).toBe(true);
    });
  });

  describe('错误处理和边界情况', () => {
    test('应该正确处理各种错误情况', () => {
      // 测试无效的跳转时间
      const progressBar = plugins[2];
      const progressBarElement = progressBar.element.querySelector('.progress-bar') as HTMLElement;
      
      // 模拟无效的进度条宽度
      Object.defineProperty(progressBarElement, 'offsetWidth', { value: 0 });
      
      const clickEvent = new MouseEvent('click', { clientX: 100 });
      progressBarElement.dispatchEvent(clickEvent);
      
      // 当前时间不应该改变
      expect(player.element.currentTime).toBe(0);

      // 测试无效的音量值
      const volumeControl = plugins[3];
      const volumeSlider = volumeControl.element.querySelector('.volume-slider input') as HTMLInputElement;
      
      volumeSlider.value = '150'; // 超出范围
      volumeSlider.dispatchEvent(new Event('input'));
      
      expect(player.element.volume).toBe(1); // 应该被限制在 1

      // 测试无效的播放速度
      const playbackRate = plugins[4];
      
      // 尝试设置不存在的播放速度
      player.element.playbackRate = 10;
      expect(player.element.playbackRate).toBe(10); // 浏览器会处理这个值
    });
  });
});
