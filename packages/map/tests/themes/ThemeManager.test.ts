/**
 * ThemeManager 主题管理器单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeManager, PREDEFINED_THEMES } from '@/themes/ThemeManager';
import { cleanupTestEnvironment } from '@tests/setup';

describe('ThemeManager', () => {
  let themeManager: ThemeManager;

  beforeEach(() => {
    themeManager = new ThemeManager();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('初始化', () => {
    it('应该能够创建 ThemeManager 实例', () => {
      expect(themeManager).toBeInstanceOf(ThemeManager);
    });

    it('应该默认使用 default 主题', () => {
      const currentTheme = themeManager.getCurrentTheme();
      expect(currentTheme).toBe('default');
    });

    it('应该预加载所有预定义主题', () => {
      const availableThemes = themeManager.getAvailableThemes();
      
      expect(availableThemes).toHaveLength(3);
      expect(availableThemes.map(t => t.name)).toContain('default');
      expect(availableThemes.map(t => t.name)).toContain('dark');
      expect(availableThemes.map(t => t.name)).toContain('light');
    });
  });

  describe('主题切换', () => {
    it('应该能够切换到 dark 主题', () => {
      const result = themeManager.setTheme('dark');
      
      expect(result).toBe(true);
      expect(themeManager.getCurrentTheme()).toBe('dark');
    });

    it('应该能够切换到 light 主题', () => {
      const result = themeManager.setTheme('light');
      
      expect(result).toBe(true);
      expect(themeManager.getCurrentTheme()).toBe('light');
    });

    it('应该在切换到不存在的主题时返回 false', () => {
      const result = themeManager.setTheme('non-existent');
      
      expect(result).toBe(false);
      expect(themeManager.getCurrentTheme()).toBe('default'); // 保持原主题
    });

    it('应该在主题切换时触发事件', () => {
      const listener = vi.fn();
      themeManager.addEventListener('themechange', listener);
      
      themeManager.setTheme('dark');
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'themechange',
          previousTheme: 'default',
          currentTheme: 'dark',
          theme: expect.objectContaining({ name: 'dark' })
        })
      );
    });
  });

  describe('主题获取', () => {
    it('应该能够获取当前主题配置', () => {
      const theme = themeManager.getTheme();
      
      expect(theme).toBeDefined();
      expect(theme?.name).toBe('default');
      expect(theme?.colors).toBeDefined();
      expect(theme?.styles).toBeDefined();
    });

    it('应该能够获取指定主题配置', () => {
      const darkTheme = themeManager.getTheme('dark');
      
      expect(darkTheme).toBeDefined();
      expect(darkTheme?.name).toBe('dark');
      expect(darkTheme?.displayName).toBe('深色主题');
    });

    it('应该在获取不存在的主题时返回 null', () => {
      const theme = themeManager.getTheme('non-existent');
      expect(theme).toBeNull();
    });
  });

  describe('自定义主题', () => {
    const customTheme = {
      name: 'custom',
      displayName: '自定义主题',
      colors: {
        primary: '#FF5722',
        secondary: '#FF7043',
        background: '#FAFAFA',
        text: '#212121',
        border: '#E0E0E0',
        accent: '#FFC107'
      },
      styles: {
        map: {
          backgroundColor: '#F5F5F5'
        },
        marker: {
          fill: { color: 'rgba(255, 87, 34, 0.8)' },
          stroke: { color: '#FF5722', width: 2 }
        },
        popup: {
          backgroundColor: '#FFFFFF',
          borderColor: '#E0E0E0',
          textColor: '#212121'
        },
        control: {
          backgroundColor: '#FFFFFF',
          borderColor: '#E0E0E0',
          textColor: '#212121'
        }
      }
    };

    it('应该能够注册自定义主题', () => {
      themeManager.registerTheme(customTheme);
      
      const availableThemes = themeManager.getAvailableThemes();
      expect(availableThemes.map(t => t.name)).toContain('custom');
    });

    it('应该能够使用自定义主题', () => {
      themeManager.registerTheme(customTheme);
      const result = themeManager.setTheme('custom');
      
      expect(result).toBe(true);
      expect(themeManager.getCurrentTheme()).toBe('custom');
    });

    it('应该在注册主题时触发事件', () => {
      const listener = vi.fn();
      themeManager.addEventListener('themeregister', listener);
      
      themeManager.registerTheme(customTheme);
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'themeregister',
          theme: customTheme
        })
      );
    });

    it('应该能够移除自定义主题', () => {
      themeManager.registerTheme(customTheme);
      const result = themeManager.removeTheme('custom');
      
      expect(result).toBe(true);
      
      const availableThemes = themeManager.getAvailableThemes();
      expect(availableThemes.map(t => t.name)).not.toContain('custom');
    });

    it('应该不能移除当前使用的主题', () => {
      themeManager.registerTheme(customTheme);
      themeManager.setTheme('custom');
      
      const result = themeManager.removeTheme('custom');
      expect(result).toBe(false);
    });
  });

  describe('主题颜色和样式', () => {
    it('应该能够获取主题颜色', () => {
      const primaryColor = themeManager.getThemeColor('primary');
      expect(primaryColor).toBe('#722ED1');
      
      const secondaryColor = themeManager.getThemeColor('secondary');
      expect(secondaryColor).toBe('#8C5AD3');
    });

    it('应该能够获取指定主题的颜色', () => {
      const darkPrimaryColor = themeManager.getThemeColor('primary', 'dark');
      expect(darkPrimaryColor).toBe('#8C5AD3');
    });

    it('应该在获取不存在的颜色时返回 null', () => {
      const color = themeManager.getThemeColor('non-existent');
      expect(color).toBeNull();
    });

    it('应该能够获取主题样式', () => {
      const mapStyle = themeManager.getThemeStyle('map');
      expect(mapStyle).toBeDefined();
      expect(mapStyle.backgroundColor).toBe('#F5F5F5');
    });

    it('应该能够获取指定主题的样式', () => {
      const darkMapStyle = themeManager.getThemeStyle('map', 'dark');
      expect(darkMapStyle).toBeDefined();
      expect(darkMapStyle.backgroundColor).toBe('#2A2A2A');
    });
  });

  describe('CSS 变量应用', () => {
    it('应该在主题切换时应用 CSS 变量', () => {
      // 模拟 document.documentElement
      const mockRoot = {
        style: {
          setProperty: vi.fn()
        }
      };
      
      Object.defineProperty(document, 'documentElement', {
        value: mockRoot,
        configurable: true
      });
      
      themeManager.setTheme('dark');
      
      expect(mockRoot.style.setProperty).toHaveBeenCalledWith(
        '--ldesign-theme-primary',
        '#8C5AD3'
      );
    });
  });

  describe('事件系统', () => {
    it('应该能够添加事件监听器', () => {
      const listener = vi.fn();
      
      expect(() => themeManager.addEventListener('themechange', listener)).not.toThrow();
    });

    it('应该能够移除事件监听器', () => {
      const listener = vi.fn();
      
      themeManager.addEventListener('themechange', listener);
      expect(() => themeManager.removeEventListener('themechange', listener)).not.toThrow();
    });

    it('应该在移除事件监听器后不再触发', () => {
      const listener = vi.fn();
      
      themeManager.addEventListener('themechange', listener);
      themeManager.removeEventListener('themechange', listener);
      
      themeManager.setTheme('dark');
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('预定义主题验证', () => {
    it('预定义主题应该包含所有必需的属性', () => {
      Object.values(PREDEFINED_THEMES).forEach(theme => {
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('displayName');
        expect(theme).toHaveProperty('colors');
        expect(theme).toHaveProperty('styles');
        
        // 验证颜色属性
        expect(theme.colors).toHaveProperty('primary');
        expect(theme.colors).toHaveProperty('secondary');
        expect(theme.colors).toHaveProperty('background');
        expect(theme.colors).toHaveProperty('text');
        expect(theme.colors).toHaveProperty('border');
        expect(theme.colors).toHaveProperty('accent');
        
        // 验证样式属性
        expect(theme.styles).toHaveProperty('map');
        expect(theme.styles).toHaveProperty('marker');
        expect(theme.styles).toHaveProperty('popup');
        expect(theme.styles).toHaveProperty('control');
      });
    });
  });

  describe('销毁', () => {
    it('应该能够销毁主题管理器', () => {
      expect(() => themeManager.destroy()).not.toThrow();
    });

    it('销毁后事件监听器应该被清理', () => {
      const listener = vi.fn();
      themeManager.addEventListener('themechange', listener);
      
      themeManager.destroy();
      themeManager.setTheme('dark');
      
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
