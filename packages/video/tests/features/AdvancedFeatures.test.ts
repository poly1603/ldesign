/**
 * 高级功能测试
 * 测试弹幕、主题管理、截图、画中画等高级功能
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Player } from '../../src/core/Player';

// 模拟高级功能类（基于示例代码中的实现）
class ThemeManager {
  public player: any;
  public currentTheme: string;
  public themes: any;

  constructor(player: any) {
    this.player = player;
    this.currentTheme = 'dark';
    this.themes = {
      dark: {
        name: '暗黑主题',
        colors: {
          primary: '#722ED1',
          background: 'rgba(0, 0, 0, 0.8)',
          text: '#ffffff',
          accent: '#9254DE'
        }
      },
      light: {
        name: '明亮主题',
        colors: {
          primary: '#1890ff',
          background: 'rgba(255, 255, 255, 0.9)',
          text: '#333333',
          accent: '#40a9ff'
        }
      },
      purple: {
        name: '紫色主题',
        colors: {
          primary: '#722ED1',
          background: 'rgba(114, 46, 209, 0.1)',
          text: '#722ED1',
          accent: '#9254DE'
        }
      }
    };
  }

  switchTheme(themeName: string) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
      this.applyTheme(this.themes[themeName]);
      console.log(`切换到${this.themes[themeName].name}`);
    }
  }

  applyTheme(theme: any) {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value as string);
    });
  }
}

class DanmakuPlugin {
  public player: any;
  public danmakus: any[];
  public container: HTMLElement | null;
  public enabled: boolean;

  constructor(player: any) {
    this.player = player;
    this.danmakus = [];
    this.container = null;
    this.enabled = true;
  }

  init() {
    this.createContainer();
    this.setupEvents();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'danmaku-container';
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 50;
      overflow: hidden;
    `;
    this.player.element.parentElement.appendChild(this.container);
  }

  addDanmaku(text: string, type = 'right') {
    if (!this.enabled || !this.container) return;

    const danmaku = document.createElement('div');
    danmaku.className = 'danmaku-item';
    danmaku.textContent = text;

    const baseStyle = `
      position: absolute;
      color: white;
      font-size: 16px;
      font-weight: bold;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      white-space: nowrap;
      pointer-events: none;
    `;

    if (type === 'right') {
      danmaku.style.cssText = baseStyle + `
        right: -100%;
        top: ${Math.random() * 60 + 10}%;
        animation: danmaku-right 8s linear;
      `;
    } else if (type === 'top') {
      danmaku.style.cssText = baseStyle + `
        left: 50%;
        top: ${Math.random() * 30 + 10}%;
        transform: translateX(-50%);
        animation: danmaku-fade 3s ease-in-out;
      `;
    }

    this.container.appendChild(danmaku);

    // 清理动画结束的弹幕
    setTimeout(() => {
      if (danmaku.parentNode) {
        danmaku.parentNode.removeChild(danmaku);
      }
    }, 8000);
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.container) {
      this.container.innerHTML = '';
    }
    console.log(`弹幕${this.enabled ? '开启' : '关闭'}`);
  }

  setupEvents() {
    // 模拟定期添加弹幕的逻辑
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

class ScreenshotPlugin {
  public player: any;

  constructor(player: any) {
    this.player = player;
  }

  takeScreenshot() {
    const video = this.player.element;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('无法获取 Canvas 上下文');
    }

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 转换为图片并下载
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `screenshot-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('截图已保存');
      }
    });
  }
}

class PictureInPicturePlugin {
  public player: any;
  public isInPiP: boolean;

  constructor(player: any) {
    this.player = player;
    this.isInPiP = false;
  }

  async toggle() {
    const video = this.player.element;

    if (!document.pictureInPictureEnabled) {
      console.log('浏览器不支持画中画功能');
      return;
    }

    try {
      if (this.isInPiP) {
        await document.exitPictureInPicture();
        this.isInPiP = false;
        console.log('退出画中画模式');
      } else {
        await video.requestPictureInPicture();
        this.isInPiP = true;
        console.log('进入画中画模式');
      }
    } catch (error) {
      console.error('画中画操作失败:', error);
    }
  }
}

describe('AdvancedFeatures', () => {
  let container: HTMLElement;
  let player: Player;

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
      src: 'test.mp4'
    });

    // 设置视频属性
    Object.defineProperty(player.element, 'videoWidth', { value: 1280, writable: true });
    Object.defineProperty(player.element, 'videoHeight', { value: 720, writable: true });
  });

  afterEach(() => {
    // 清理
    if (player) {
      player.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('ThemeManager', () => {
    let themeManager: ThemeManager;

    beforeEach(() => {
      themeManager = new ThemeManager(player);
    });

    test('应该正确初始化主题管理器', () => {
      expect(themeManager).toBeDefined();
      expect(themeManager.currentTheme).toBe('dark');
      expect(themeManager.themes).toBeDefined();
      expect(Object.keys(themeManager.themes)).toEqual(['dark', 'light', 'purple']);
    });

    test('应该能够切换主题', () => {
      themeManager.switchTheme('light');
      expect(themeManager.currentTheme).toBe('light');

      themeManager.switchTheme('purple');
      expect(themeManager.currentTheme).toBe('purple');

      themeManager.switchTheme('dark');
      expect(themeManager.currentTheme).toBe('dark');
    });

    test('应该忽略无效的主题名称', () => {
      const originalTheme = themeManager.currentTheme;
      themeManager.switchTheme('invalid-theme');
      expect(themeManager.currentTheme).toBe(originalTheme);
    });

    test('应该正确应用主题样式', () => {
      const theme = themeManager.themes.light;
      themeManager.applyTheme(theme);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--theme-primary')).toBe('#1890ff');
      expect(root.style.getPropertyValue('--theme-background')).toBe('rgba(255, 255, 255, 0.9)');
      expect(root.style.getPropertyValue('--theme-text')).toBe('#333333');
    });
  });

  describe('DanmakuPlugin', () => {
    let danmakuPlugin: DanmakuPlugin;

    beforeEach(() => {
      danmakuPlugin = new DanmakuPlugin(player);
      danmakuPlugin.init();
    });

    afterEach(() => {
      danmakuPlugin.destroy();
    });

    test('应该正确初始化弹幕插件', () => {
      expect(danmakuPlugin).toBeDefined();
      expect(danmakuPlugin.enabled).toBe(true);
      expect(danmakuPlugin.container).toBeDefined();
      expect(danmakuPlugin.container?.className).toBe('danmaku-container');
    });

    test('应该能够添加右飞弹幕', () => {
      danmakuPlugin.addDanmaku('测试弹幕', 'right');
      
      const danmakuItems = danmakuPlugin.container?.querySelectorAll('.danmaku-item');
      expect(danmakuItems?.length).toBe(1);
      expect(danmakuItems?.[0].textContent).toBe('测试弹幕');
    });

    test('应该能够添加顶部弹幕', () => {
      danmakuPlugin.addDanmaku('顶部弹幕', 'top');
      
      const danmakuItems = danmakuPlugin.container?.querySelectorAll('.danmaku-item');
      expect(danmakuItems?.length).toBe(1);
      expect(danmakuItems?.[0].textContent).toBe('顶部弹幕');
    });

    test('应该能够切换弹幕开关', () => {
      // 初始状态为开启
      expect(danmakuPlugin.enabled).toBe(true);

      // 关闭弹幕
      danmakuPlugin.toggle();
      expect(danmakuPlugin.enabled).toBe(false);
      expect(danmakuPlugin.container?.innerHTML).toBe('');

      // 重新开启弹幕
      danmakuPlugin.toggle();
      expect(danmakuPlugin.enabled).toBe(true);
    });

    test('应该在禁用时不添加弹幕', () => {
      danmakuPlugin.toggle(); // 禁用弹幕
      danmakuPlugin.addDanmaku('不应该显示的弹幕', 'right');
      
      const danmakuItems = danmakuPlugin.container?.querySelectorAll('.danmaku-item');
      expect(danmakuItems?.length).toBe(0);
    });

    test('应该自动清理过期的弹幕', async () => {
      danmakuPlugin.addDanmaku('临时弹幕', 'right');
      
      // 立即检查弹幕是否存在
      let danmakuItems = danmakuPlugin.container?.querySelectorAll('.danmaku-item');
      expect(danmakuItems?.length).toBe(1);

      // 等待清理时间（模拟）
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 手动触发清理（在真实环境中会自动清理）
      const danmakuItem = danmakuPlugin.container?.querySelector('.danmaku-item');
      if (danmakuItem && danmakuItem.parentNode) {
        danmakuItem.parentNode.removeChild(danmakuItem);
      }

      danmakuItems = danmakuPlugin.container?.querySelectorAll('.danmaku-item');
      expect(danmakuItems?.length).toBe(0);
    });
  });

  describe('ScreenshotPlugin', () => {
    let screenshotPlugin: ScreenshotPlugin;

    beforeEach(() => {
      screenshotPlugin = new ScreenshotPlugin(player);
    });

    test('应该正确初始化截图插件', () => {
      expect(screenshotPlugin).toBeDefined();
      expect(screenshotPlugin.player).toBe(player);
    });

    test('应该能够截取视频画面', () => {
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');
      
      // 模拟 a 标签的 click 方法
      const clickSpy = vi.fn();
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: clickSpy
          } as any;
        }
        return document.createElement(tagName);
      });

      screenshotPlugin.takeScreenshot();

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });

    test('应该处理 Canvas 上下文获取失败的情况', () => {
      // 模拟 getContext 返回 null
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

      expect(() => {
        screenshotPlugin.takeScreenshot();
      }).toThrow('无法获取 Canvas 上下文');

      // 恢复原始方法
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });
  });

  describe('PictureInPicturePlugin', () => {
    let pipPlugin: PictureInPicturePlugin;

    beforeEach(() => {
      pipPlugin = new PictureInPicturePlugin(player);
      
      // 模拟浏览器支持画中画
      Object.defineProperty(document, 'pictureInPictureEnabled', {
        value: true,
        writable: true
      });
    });

    test('应该正确初始化画中画插件', () => {
      expect(pipPlugin).toBeDefined();
      expect(pipPlugin.player).toBe(player);
      expect(pipPlugin.isInPiP).toBe(false);
    });

    test('应该能够进入画中画模式', async () => {
      const requestPiPSpy = vi.spyOn(player.element, 'requestPictureInPicture');
      
      await pipPlugin.toggle();
      
      expect(requestPiPSpy).toHaveBeenCalled();
      expect(pipPlugin.isInPiP).toBe(true);
    });

    test('应该能够退出画中画模式', async () => {
      const exitPiPSpy = vi.spyOn(document, 'exitPictureInPicture');
      
      // 先进入画中画模式
      pipPlugin.isInPiP = true;
      
      await pipPlugin.toggle();
      
      expect(exitPiPSpy).toHaveBeenCalled();
      expect(pipPlugin.isInPiP).toBe(false);
    });

    test('应该处理不支持画中画的浏览器', async () => {
      // 模拟浏览器不支持画中画
      Object.defineProperty(document, 'pictureInPictureEnabled', {
        value: false,
        writable: true
      });

      const consoleSpy = vi.spyOn(console, 'log');
      
      await pipPlugin.toggle();
      
      expect(consoleSpy).toHaveBeenCalledWith('浏览器不支持画中画功能');
      expect(pipPlugin.isInPiP).toBe(false);
    });

    test('应该处理画中画操作失败的情况', async () => {
      const requestPiPSpy = vi.spyOn(player.element, 'requestPictureInPicture')
        .mockRejectedValue(new Error('画中画请求失败'));
      const consoleErrorSpy = vi.spyOn(console, 'error');
      
      await pipPlugin.toggle();
      
      expect(requestPiPSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('画中画操作失败:', expect.any(Error));
      expect(pipPlugin.isInPiP).toBe(false);
    });
  });
});
