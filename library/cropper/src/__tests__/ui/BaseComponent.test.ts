/**
 * @ldesign/cropper BaseComponent 测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BaseComponent } from '../../ui/BaseComponent';
import type { UIComponent } from '../../types/ui';

// ============================================================================
// 测试用的具体组件实现
// ============================================================================

class TestComponent extends BaseComponent {
  public readonly type = 'test' as const;
  
  protected createElement(): HTMLElement {
    const element = document.createElement('div');
    element.textContent = 'Test Component';
    return element;
  }
  
  protected render(): void {
    if (this.element) {
      this.element.setAttribute('data-rendered', 'true');
    }
  }
}

// ============================================================================
// 测试套件
// ============================================================================

describe('BaseComponent', () => {
  let component: TestComponent;
  let container: HTMLElement;

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // 创建组件实例
    component = new TestComponent({
      className: 'test-class',
      style: { color: 'red' }
    });
  });

  afterEach(() => {
    // 清理组件
    if (component) {
      component.destroy();
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
    it('应该正确初始化组件', () => {
      expect(component.id).toBeDefined();
      expect(component.type).toBe('test');
      expect(component.visible).toBe(true);
      expect(component.enabled).toBe(true);
      expect(component.className).toBe('test-class');
      expect(component.style).toEqual({ color: 'red' });
    });

    it('应该生成唯一的组件ID', () => {
      const component1 = new TestComponent();
      const component2 = new TestComponent();
      
      expect(component1.id).not.toBe(component2.id);
      
      component1.destroy();
      component2.destroy();
    });

    it('应该接受自定义ID', () => {
      const customComponent = new TestComponent({ id: 'custom-id' });
      expect(customComponent.id).toBe('custom-id');
      customComponent.destroy();
    });
  });

  // ============================================================================
  // 属性访问器测试
  // ============================================================================

  describe('属性访问器', () => {
    beforeEach(() => {
      component.mount(container);
    });

    it('应该正确设置和获取可见性', () => {
      expect(component.visible).toBe(true);
      
      component.visible = false;
      expect(component.visible).toBe(false);
      expect(component.getElement()?.style.display).toBe('none');
      
      component.visible = true;
      expect(component.visible).toBe(true);
      expect(component.getElement()?.style.display).toBe('');
    });

    it('应该正确设置和获取启用状态', () => {
      expect(component.enabled).toBe(true);
      
      component.enabled = false;
      expect(component.enabled).toBe(false);
      expect(component.getElement()?.hasAttribute('disabled')).toBe(true);
      expect(component.getElement()?.classList.contains('disabled')).toBe(true);
      
      component.enabled = true;
      expect(component.enabled).toBe(true);
      expect(component.getElement()?.hasAttribute('disabled')).toBe(false);
      expect(component.getElement()?.classList.contains('disabled')).toBe(false);
    });

    it('应该正确设置和获取位置', () => {
      const position = { x: 100, y: 200 };
      component.position = position;
      
      expect(component.position).toEqual(position);
      expect(component.getElement()?.style.left).toBe('100px');
      expect(component.getElement()?.style.top).toBe('200px');
    });

    it('应该正确设置和获取尺寸', () => {
      const size = { width: 300, height: 400 };
      component.size = size;
      
      expect(component.size).toEqual(size);
      expect(component.getElement()?.style.width).toBe('300px');
      expect(component.getElement()?.style.height).toBe('400px');
    });

    it('应该正确设置和获取CSS类名', () => {
      component.className = 'new-class another-class';
      
      expect(component.className).toBe('new-class another-class');
      expect(component.getElement()?.classList.contains('new-class')).toBe(true);
      expect(component.getElement()?.classList.contains('another-class')).toBe(true);
    });

    it('应该正确设置和获取内联样式', () => {
      const style = { backgroundColor: 'blue', fontSize: '16px' };
      component.style = style;
      
      expect(component.style).toEqual(style);
      expect(component.getElement()?.style.backgroundColor).toBe('blue');
      expect(component.getElement()?.style.fontSize).toBe('16px');
    });
  });

  // ============================================================================
  // 生命周期测试
  // ============================================================================

  describe('生命周期', () => {
    it('应该正确挂载组件', () => {
      expect(component.isMounted()).toBe(false);
      
      component.mount(container);
      
      expect(component.isMounted()).toBe(true);
      expect(component.getElement()).toBeDefined();
      expect(container.contains(component.getElement())).toBe(true);
      expect(component.getElement()?.getAttribute('data-rendered')).toBe('true');
    });

    it('应该支持字符串选择器挂载', () => {
      container.id = 'test-container';
      
      component.mount('#test-container');
      
      expect(component.isMounted()).toBe(true);
      expect(container.contains(component.getElement())).toBe(true);
    });

    it('应该在无效容器时抛出错误', () => {
      expect(() => {
        component.mount('#non-existent');
      }).toThrow('Invalid container');
    });

    it('应该防止重复挂载', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      component.mount(container);
      component.mount(container);
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('already mounted'));
      consoleSpy.mockRestore();
    });

    it('应该正确卸载组件', () => {
      component.mount(container);
      expect(component.isMounted()).toBe(true);
      
      component.unmount();
      
      expect(component.isMounted()).toBe(false);
      expect(component.getElement()).toBeNull();
      expect(container.children.length).toBe(0);
    });

    it('应该正确销毁组件', () => {
      component.mount(container);
      expect(component.isDestroyed()).toBe(false);
      
      component.destroy();
      
      expect(component.isDestroyed()).toBe(true);
      expect(component.isMounted()).toBe(false);
      expect(component.getElement()).toBeNull();
    });
  });

  // ============================================================================
  // 事件系统测试
  // ============================================================================

  describe('事件系统', () => {
    let clickHandler: ReturnType<typeof vi.fn>;
    let hoverHandler: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      clickHandler = vi.fn();
      hoverHandler = vi.fn();
      component.mount(container);
    });

    it('应该正确添加和触发事件监听器', () => {
      component.on('click', clickHandler);
      
      component.getElement()?.click();
      
      expect(clickHandler).toHaveBeenCalledTimes(1);
      expect(clickHandler).toHaveBeenCalledWith(expect.objectContaining({
        type: 'click',
        target: component,
        timestamp: expect.any(Number)
      }));
    });

    it('应该正确移除事件监听器', () => {
      component.on('click', clickHandler);
      component.off('click', clickHandler);
      
      component.getElement()?.click();
      
      expect(clickHandler).not.toHaveBeenCalled();
    });

    it('应该支持多个事件监听器', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      component.on('click', handler1);
      component.on('click', handler2);
      
      component.getElement()?.click();
      
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('应该在禁用状态下阻止事件', () => {
      component.on('click', clickHandler);
      component.enabled = false;
      
      component.getElement()?.click();
      
      expect(clickHandler).not.toHaveBeenCalled();
    });

    it('应该处理事件处理器中的错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorHandler = vi.fn(() => {
        throw new Error('Test error');
      });
      
      component.on('click', errorHandler);
      component.getElement()?.click();
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ============================================================================
  // 配置更新测试
  // ============================================================================

  describe('配置更新', () => {
    beforeEach(() => {
      component.mount(container);
    });

    it('应该正确更新组件配置', () => {
      const newConfig: Partial<UIComponent> = {
        visible: false,
        className: 'updated-class',
        style: { backgroundColor: 'green' }
      };
      
      component.updateConfig(newConfig);
      
      expect(component.visible).toBe(false);
      expect(component.className).toBe('updated-class');
      expect(component.style).toEqual({ backgroundColor: 'green' });
      expect(component.getElement()?.style.display).toBe('none');
      expect(component.getElement()?.classList.contains('updated-class')).toBe(true);
      expect(component.getElement()?.style.backgroundColor).toBe('green');
    });

    it('应该保留未更新的配置', () => {
      const originalEnabled = component.enabled;
      
      component.updateConfig({ visible: false });
      
      expect(component.enabled).toBe(originalEnabled);
      expect(component.visible).toBe(false);
    });
  });

  // ============================================================================
  // 工具方法测试
  // ============================================================================

  describe('工具方法', () => {
    it('应该返回正确的配置副本', () => {
      const config = component.getConfig();
      
      expect(config).toEqual(expect.objectContaining({
        className: 'test-class',
        style: { color: 'red' },
        visible: true,
        enabled: true
      }));
      
      // 确保是副本而不是引用
      config.visible = false;
      expect(component.visible).toBe(true);
    });

    it('应该正确报告挂载状态', () => {
      expect(component.isMounted()).toBe(false);
      
      component.mount(container);
      expect(component.isMounted()).toBe(true);
      
      component.unmount();
      expect(component.isMounted()).toBe(false);
    });

    it('应该正确报告销毁状态', () => {
      expect(component.isDestroyed()).toBe(false);
      
      component.destroy();
      expect(component.isDestroyed()).toBe(true);
    });

    it('应该返回正确的DOM元素', () => {
      expect(component.getElement()).toBeNull();
      
      component.mount(container);
      const element = component.getElement();
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element?.textContent).toBe('Test Component');
    });
  });
});
