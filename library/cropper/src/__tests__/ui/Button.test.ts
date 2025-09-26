/**
 * @ldesign/cropper Button 测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Button } from '../../ui/Button';
import type { ButtonComponent } from '../../types/ui';

// ============================================================================
// 测试套件
// ============================================================================

describe('Button', () => {
  let button: Button;
  let container: HTMLElement;

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // 清理按钮
    if (button) {
      button.destroy();
    }
    
    // 清理容器
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  // ============================================================================
  // 构造函数和初始化测试
  // ============================================================================

  describe('构造函数和初始化', () => {
    it('应该使用默认配置创建按钮', () => {
      button = new Button();
      
      expect(button.type).toBe('button');
      expect(button.variant).toBe('primary');
      expect(button.buttonSize).toBe('medium');
      expect(button.loading).toBe(false);
      expect(button.text).toBeUndefined();
      expect(button.icon).toBeUndefined();
    });

    it('应该接受自定义配置', () => {
      const config: Partial<ButtonComponent> = {
        text: 'Click Me',
        icon: '🔥',
        variant: 'secondary',
        buttonSize: 'large',
        loading: true
      };
      
      button = new Button(config);
      
      expect(button.text).toBe('Click Me');
      expect(button.icon).toBe('🔥');
      expect(button.variant).toBe('secondary');
      expect(button.buttonSize).toBe('large');
      expect(button.loading).toBe(true);
    });
  });

  // ============================================================================
  // 属性访问器测试
  // ============================================================================

  describe('属性访问器', () => {
    beforeEach(() => {
      button = new Button();
      button.mount(container);
    });

    it('应该正确设置和获取按钮文本', () => {
      button.text = 'New Text';
      expect(button.text).toBe('New Text');
      
      const textElement = button.getElement()?.querySelector('.ldesign-cropper-button-text');
      expect(textElement?.textContent).toBe('New Text');
      expect(textElement?.style.display).toBe('');
    });

    it('应该在没有文本时隐藏文本元素', () => {
      button.text = undefined;
      
      const textElement = button.getElement()?.querySelector('.ldesign-cropper-button-text');
      expect(textElement?.textContent).toBe('');
      expect(textElement?.style.display).toBe('none');
    });

    it('应该正确设置和获取按钮图标', () => {
      button.icon = '⭐';
      expect(button.icon).toBe('⭐');
      
      const iconElement = button.getElement()?.querySelector('.ldesign-cropper-button-icon');
      expect(iconElement?.innerHTML).toBe('⭐');
      expect(iconElement?.style.display).toBe('');
    });

    it('应该支持SVG图标', () => {
      const svgIcon = '<svg><circle r="10"/></svg>';
      button.icon = svgIcon;
      
      const iconElement = button.getElement()?.querySelector('.ldesign-cropper-button-icon');
      expect(iconElement?.innerHTML).toBe(svgIcon);
    });

    it('应该支持图片图标', () => {
      const imgIcon = 'data:image/png;base64,test';
      button.icon = imgIcon;
      
      const iconElement = button.getElement()?.querySelector('.ldesign-cropper-button-icon');
      expect(iconElement?.innerHTML).toContain('<img');
      expect(iconElement?.innerHTML).toContain(imgIcon);
    });

    it('应该在没有图标时隐藏图标元素', () => {
      button.icon = undefined;
      
      const iconElement = button.getElement()?.querySelector('.ldesign-cropper-button-icon');
      expect(iconElement?.innerHTML).toBe('');
      expect(iconElement?.style.display).toBe('none');
    });

    it('应该正确设置和获取按钮变体', () => {
      button.variant = 'danger';
      expect(button.variant).toBe('danger');
      
      expect(button.getElement()?.classList.contains('ldesign-cropper-button-danger')).toBe(true);
      expect(button.getElement()?.classList.contains('ldesign-cropper-button-primary')).toBe(false);
    });

    it('应该正确设置和获取按钮尺寸', () => {
      button.buttonSize = 'small';
      expect(button.buttonSize).toBe('small');
      
      expect(button.getElement()?.classList.contains('ldesign-cropper-button-small')).toBe(true);
      expect(button.getElement()?.classList.contains('ldesign-cropper-button-medium')).toBe(false);
    });

    it('应该正确设置和获取加载状态', () => {
      button.loading = true;
      expect(button.loading).toBe(true);
      
      expect(button.getElement()?.classList.contains('ldesign-cropper-button-loading')).toBe(true);
      expect(button.getElement()?.hasAttribute('disabled')).toBe(true);
      
      const loadingElement = button.getElement()?.querySelector('.ldesign-cropper-button-loading');
      expect(loadingElement?.style.display).toBe('');
    });
  });

  // ============================================================================
  // DOM结构测试
  // ============================================================================

  describe('DOM结构', () => {
    beforeEach(() => {
      button = new Button({
        text: 'Test Button',
        icon: '🔥'
      });
      button.mount(container);
    });

    it('应该创建正确的DOM结构', () => {
      const element = button.getElement();
      
      expect(element?.tagName).toBe('BUTTON');
      expect(element?.type).toBe('button');
      expect(element?.classList.contains('ldesign-cropper-button')).toBe(true);
    });

    it('应该包含所有必需的子元素', () => {
      const element = button.getElement();
      
      expect(element?.querySelector('.ldesign-cropper-button-loading')).toBeDefined();
      expect(element?.querySelector('.ldesign-cropper-button-icon')).toBeDefined();
      expect(element?.querySelector('.ldesign-cropper-button-text')).toBeDefined();
    });

    it('应该应用正确的CSS类名', () => {
      const element = button.getElement();
      
      expect(element?.classList.contains('ldesign-cropper-ui')).toBe(true);
      expect(element?.classList.contains('ldesign-cropper-button')).toBe(true);
      expect(element?.classList.contains('ldesign-cropper-button-primary')).toBe(true);
      expect(element?.classList.contains('ldesign-cropper-button-medium')).toBe(true);
    });
  });

  // ============================================================================
  // 事件处理测试
  // ============================================================================

  describe('事件处理', () => {
    let clickHandler: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      clickHandler = vi.fn();
      button = new Button({
        text: 'Click Me',
        onClick: clickHandler
      });
      button.mount(container);
    });

    it('应该触发点击事件', () => {
      button.getElement()?.click();
      
      expect(clickHandler).toHaveBeenCalledTimes(1);
      expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));
    });

    it('应该在禁用状态下阻止点击', () => {
      button.enabled = false;
      
      button.getElement()?.click();
      
      expect(clickHandler).not.toHaveBeenCalled();
    });

    it('应该在加载状态下阻止点击', () => {
      button.loading = true;
      
      button.getElement()?.click();
      
      expect(clickHandler).not.toHaveBeenCalled();
    });

    it('应该支持通过onClick方法设置处理器', () => {
      const newHandler = vi.fn();
      button.onClick(newHandler);
      
      button.getElement()?.click();
      
      expect(newHandler).toHaveBeenCalledTimes(1);
    });

    it('应该处理点击处理器中的错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorHandler = vi.fn(() => {
        throw new Error('Test error');
      });
      
      button.onClick(errorHandler);
      button.getElement()?.click();
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ============================================================================
  // 公共方法测试
  // ============================================================================

  describe('公共方法', () => {
    beforeEach(() => {
      button = new Button({ text: 'Test Button' });
      button.mount(container);
    });

    it('应该支持程序化点击', () => {
      const clickHandler = vi.fn();
      button.onClick(clickHandler);
      
      button.click();
      
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it('应该在禁用状态下阻止程序化点击', () => {
      const clickHandler = vi.fn();
      button.onClick(clickHandler);
      button.enabled = false;
      
      button.click();
      
      expect(clickHandler).not.toHaveBeenCalled();
    });

    it('应该在加载状态下阻止程序化点击', () => {
      const clickHandler = vi.fn();
      button.onClick(clickHandler);
      button.loading = true;
      
      button.click();
      
      expect(clickHandler).not.toHaveBeenCalled();
    });

    it('应该支持设置焦点', () => {
      const focusSpy = vi.spyOn(button.getElement()!, 'focus');
      
      button.focus();
      
      expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    it('应该支持失去焦点', () => {
      const blurSpy = vi.spyOn(button.getElement()!, 'blur');
      
      button.blur();
      
      expect(blurSpy).toHaveBeenCalledTimes(1);
    });

    it('应该支持显示加载状态', () => {
      button.showLoading();
      
      expect(button.loading).toBe(true);
    });

    it('应该支持定时加载状态', (done) => {
      button.showLoading(100);
      
      expect(button.loading).toBe(true);
      
      setTimeout(() => {
        expect(button.loading).toBe(false);
        done();
      }, 150);
    });

    it('应该支持隐藏加载状态', () => {
      button.loading = true;
      
      button.hideLoading();
      
      expect(button.loading).toBe(false);
    });
  });

  // ============================================================================
  // 状态更新测试
  // ============================================================================

  describe('状态更新', () => {
    beforeEach(() => {
      button = new Button();
      button.mount(container);
    });

    it('应该在变体更改时更新CSS类', () => {
      button.variant = 'secondary';
      
      expect(button.getElement()?.classList.contains('ldesign-cropper-button-secondary')).toBe(true);
      expect(button.getElement()?.classList.contains('ldesign-cropper-button-primary')).toBe(false);
      
      button.variant = 'outline';
      
      expect(button.getElement()?.classList.contains('ldesign-cropper-button-outline')).toBe(true);
      expect(button.getElement()?.classList.contains('ldesign-cropper-button-secondary')).toBe(false);
    });

    it('应该在尺寸更改时更新CSS类', () => {
      button.buttonSize = 'large';
      
      expect(button.getElement()?.classList.contains('ldesign-cropper-button-large')).toBe(true);
      expect(button.getElement()?.classList.contains('ldesign-cropper-button-medium')).toBe(false);
      
      button.buttonSize = 'small';
      
      expect(button.getElement()?.classList.contains('ldesign-cropper-button-small')).toBe(true);
      expect(button.getElement()?.classList.contains('ldesign-cropper-button-large')).toBe(false);
    });

    it('应该在加载状态更改时更新禁用状态', () => {
      button.loading = true;
      
      expect(button.getElement()?.hasAttribute('disabled')).toBe(true);
      
      button.loading = false;
      
      expect(button.getElement()?.hasAttribute('disabled')).toBe(false);
    });

    it('应该在启用状态和加载状态冲突时优先加载状态', () => {
      button.enabled = true;
      button.loading = true;
      
      expect(button.getElement()?.hasAttribute('disabled')).toBe(true);
      
      button.loading = false;
      
      expect(button.getElement()?.hasAttribute('disabled')).toBe(false);
    });
  });
});
