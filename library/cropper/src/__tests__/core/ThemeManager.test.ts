/**
 * @ldesign/cropper ThemeManager 测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ThemeManager,
  LIGHT_THEME,
  DARK_THEME,
  HIGH_CONTRAST_THEME,
  DEFAULT_THEME_MANAGER_OPTIONS
} from '../../core/ThemeManager';
import type { ThemeConfig } from '../../types';

// 模拟localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// 模拟matchMedia
const matchMediaMock = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  value: matchMediaMock
});

describe('ThemeManager', () => {
  let manager: ThemeManager;

  beforeEach(() => {
    // 重置localStorage模拟
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();

    // 重置matchMedia模拟
    matchMediaMock.mockClear();

    // 确保localStorage返回null，使用默认主题
    localStorageMock.getItem.mockReturnValue(null);

    manager = new ThemeManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('构造函数和初始化', () => {
    it('应该使用默认选项创建管理器', () => {
      expect(manager).toBeDefined();
      expect(manager.getCurrentTheme()).toBe(DEFAULT_THEME_MANAGER_OPTIONS.defaultTheme);
    });

    it('应该接受自定义选项', () => {
      const customOptions = {
        defaultTheme: 'dark',
        enablePersistence: false,
        storageKey: 'custom-theme-key'
      };

      const customManager = new ThemeManager(customOptions);
      expect(customManager.getCurrentTheme()).toBe('dark');
      customManager.destroy();
    });

    it('应该注册内置主题', () => {
      const availableThemes = manager.getAvailableThemes();
      expect(availableThemes).toContain('light');
      expect(availableThemes).toContain('dark');
      expect(availableThemes).toContain('high-contrast');
    });

    it('应该从存储加载主题', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const persistentManager = new ThemeManager({ enablePersistence: true });
      expect(persistentManager.getCurrentTheme()).toBe('dark');
      persistentManager.destroy();
    });
  });

  describe('主题操作', () => {
    it('应该正确获取当前主题', () => {
      expect(manager.getCurrentTheme()).toBe('light');
    });

    it('应该正确获取主题配置', () => {
      const lightTheme = manager.getTheme('light');
      expect(lightTheme).toEqual(LIGHT_THEME);
    });

    it('应该正确获取当前主题配置', () => {
      const currentConfig = manager.getCurrentThemeConfig();
      expect(currentConfig).toEqual(LIGHT_THEME);
    });

    it('应该正确获取所有可用主题', () => {
      const themes = manager.getAvailableThemes();
      expect(themes).toContain('light');
      expect(themes).toContain('dark');
      expect(themes).toContain('high-contrast');
    });

    it('应该正确获取所有主题配置', () => {
      const allThemes = manager.getAllThemes();
      expect(allThemes).toHaveLength(3);
      expect(allThemes.map(t => t.name)).toEqual(['light', 'dark', 'high-contrast']);
    });
  });

  describe('主题切换', () => {
    it('应该正确设置主题', () => {
      manager.setTheme('dark');
      expect(manager.getCurrentTheme()).toBe('dark');
    });

    it('应该在设置不存在的主题时抛出错误', () => {
      expect(() => {
        manager.setTheme('nonexistent');
      }).toThrow('Theme not found: nonexistent');
    });

    it('应该触发主题变更事件', () => {
      const listener = vi.fn();
      manager.onThemeChange(listener);

      const currentTheme = manager.getCurrentTheme();
      const targetTheme = currentTheme === 'light' ? 'dark' : 'light';

      manager.setTheme(targetTheme);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'theme-change',
          oldTheme: currentTheme,
          newTheme: targetTheme
        })
      );
    });

    it('应该保存主题到存储', () => {
      const persistentManager = new ThemeManager({ enablePersistence: true });

      persistentManager.setTheme('dark');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        DEFAULT_THEME_MANAGER_OPTIONS.storageKey,
        'dark'
      );

      persistentManager.destroy();
    });
  });

  describe('主题注册和注销', () => {
    it('应该正确注册新主题', () => {
      const customTheme: ThemeConfig = {
        ...LIGHT_THEME,
        name: 'custom',
        displayName: '自定义主题'
      };

      manager.registerTheme(customTheme);

      expect(manager.getAvailableThemes()).toContain('custom');
      expect(manager.getTheme('custom')).toEqual(customTheme);
    });

    it('应该正确注销主题', () => {
      const customTheme: ThemeConfig = {
        ...LIGHT_THEME,
        name: 'custom',
        displayName: '自定义主题'
      };

      manager.registerTheme(customTheme);
      manager.unregisterTheme('custom');

      expect(manager.getAvailableThemes()).not.toContain('custom');
      expect(manager.getTheme('custom')).toBeUndefined();
    });

    it('应该在注销当前主题时抛出错误', () => {
      const currentTheme = manager.getCurrentTheme();
      expect(() => {
        manager.unregisterTheme(currentTheme);
      }).toThrow('Cannot unregister current theme');
    });
  });

  describe('自定义主题创建', () => {
    it('应该正确创建自定义主题', () => {
      const customTheme = manager.createCustomTheme(
        'custom-light',
        'light',
        {
          displayName: '自定义浅色主题',
          colors: {
            ...LIGHT_THEME.colors,
            primary: '#ff0000'
          }
        }
      );

      expect(customTheme.name).toBe('custom-light');
      expect(customTheme.displayName).toBe('自定义浅色主题');
      expect(customTheme.colors.primary).toBe('#ff0000');
      expect(manager.getAvailableThemes()).toContain('custom-light');
    });

    it('应该在基础主题不存在时抛出错误', () => {
      expect(() => {
        manager.createCustomTheme('custom', 'nonexistent', {});
      }).toThrow('Base theme not found: nonexistent');
    });
  });

  describe('事件系统', () => {
    it('应该添加和移除主题变更监听器', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      manager.onThemeChange(listener1);
      manager.onThemeChange(listener2);

      const currentTheme = manager.getCurrentTheme();
      const targetTheme = currentTheme === 'light' ? 'dark' : 'light';

      manager.setTheme(targetTheme);

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();

      manager.offThemeChange(listener1);
      listener1.mockClear();
      listener2.mockClear();

      manager.setTheme(currentTheme);

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('应该处理监听器中的错误', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalListener = vi.fn();

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      manager.onThemeChange(errorListener);
      manager.onThemeChange(normalListener);

      const currentTheme = manager.getCurrentTheme();
      const targetTheme = currentTheme === 'light' ? 'dark' : 'light';

      manager.setTheme(targetTheme);

      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('系统主题检测', () => {
    it('应该检测系统主题偏好', () => {
      matchMediaMock.mockReturnValue({ matches: true });
      expect(manager.detectSystemTheme()).toBe('dark');

      matchMediaMock.mockReturnValue({ matches: false });
      expect(manager.detectSystemTheme()).toBe('light');
    });

    it('应该在不支持matchMedia时返回light', () => {
      const originalMatchMedia = window.matchMedia;
      delete (window as any).matchMedia;

      expect(manager.detectSystemTheme()).toBe('light');

      window.matchMedia = originalMatchMedia;
    });

    it('应该监听系统主题变化', () => {
      const mockMediaQuery = {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      };

      matchMediaMock.mockReturnValue(mockMediaQuery);

      const callback = vi.fn();
      const unwatch = manager.watchSystemTheme(callback);

      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

      // 模拟主题变化
      const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1];
      changeHandler({ matches: true });

      expect(callback).toHaveBeenCalledWith('dark');

      // 取消监听
      unwatch();
      expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('CSS变量注入', () => {
    it('应该注入CSS变量', () => {
      // 检查是否创建了style元素
      const styleElements = document.querySelectorAll('style[data-ldesign-cropper-theme]');
      expect(styleElements.length).toBeGreaterThan(0);

      // 检查CSS变量内容
      const styleElement = styleElements[0] as HTMLStyleElement;
      expect(styleElement.textContent).toContain('--ldesign-cropper-color-primary');
    });

    it('应该在主题切换时更新CSS变量', () => {
      manager.setTheme('dark');

      const styleElements = document.querySelectorAll('style[data-ldesign-cropper-theme]');
      const styleElement = styleElements[0] as HTMLStyleElement;

      // 应该包含深色主题的变量
      expect(styleElement.textContent).toContain('--ldesign-cropper-color-primary');
    });

    it('应该在禁用CSS变量时不注入', () => {
      const noVarManager = new ThemeManager({ enableCSSVariables: false });

      // 应该没有额外的style元素
      const initialStyleCount = document.querySelectorAll('style[data-ldesign-cropper-theme]').length;

      noVarManager.setTheme('dark');

      const finalStyleCount = document.querySelectorAll('style[data-ldesign-cropper-theme]').length;
      expect(finalStyleCount).toBe(initialStyleCount);

      noVarManager.destroy();
    });
  });

  describe('销毁', () => {
    it('应该清理所有资源', () => {
      const listener = vi.fn();
      manager.onThemeChange(listener);

      const initialStyleCount = document.querySelectorAll('style[data-ldesign-cropper-theme]').length;

      manager.destroy();

      // 应该移除事件监听器
      manager.setTheme('dark');
      expect(listener).not.toHaveBeenCalled();

      // 应该移除style元素
      const finalStyleCount = document.querySelectorAll('style[data-ldesign-cropper-theme]').length;
      expect(finalStyleCount).toBeLessThan(initialStyleCount);
    });
  });

  describe('错误处理', () => {
    it('应该处理存储错误', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const persistentManager = new ThemeManager({ enablePersistence: true });
      persistentManager.setTheme('dark');

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      persistentManager.destroy();
    });

    it('应该处理加载存储错误', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const persistentManager = new ThemeManager({ enablePersistence: true });

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      persistentManager.destroy();
    });
  });
});
