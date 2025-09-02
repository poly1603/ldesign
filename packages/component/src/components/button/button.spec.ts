/**
 * Button 组件单元测试
 * 
 * 测试 Button 组件的各种功能、属性、事件和交互行为
 * 确保组件的可靠性和可访问性
 */

import { newSpecPage } from '@stencil/core/testing';
import { Button } from './button';

describe('ld-button', () => {
  // ==================== 基础渲染测试 ====================

  it('should render with default props', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button>Click me</ld-button>`,
    });

    expect(page.root).toEqualHtml(`
      <ld-button>
        <mock:shadow-root>
          <button 
            class="ld-button ld-button--default ld-button--medium" 
            type="button"
            aria-disabled="false"
          >
            <span class="ld-button__content">
              <span class="ld-button__text">
                <slot></slot>
              </span>
            </span>
          </button>
        </mock:shadow-root>
        Click me
      </ld-button>
    `);
  });

  it('should render with text prop', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button text="Button Text"></ld-button>`,
    });

    const textElement = page.root?.shadowRoot?.querySelector('.ld-button__text');
    expect(textElement?.textContent).toBe('Button Text');
  });

  // ==================== 属性测试 ====================

  it('should apply correct type classes', async () => {
    const types = ['default', 'primary', 'dashed', 'text', 'link'];
    
    for (const type of types) {
      const page = await newSpecPage({
        components: [Button],
        html: `<ld-button type="${type}">Button</ld-button>`,
      });

      const button = page.root?.shadowRoot?.querySelector('button');
      expect(button?.classList.contains(`ld-button--${type}`)).toBe(true);
    }
  });

  it('should apply correct size classes', async () => {
    const sizes = ['small', 'medium', 'large'];
    
    for (const size of sizes) {
      const page = await newSpecPage({
        components: [Button],
        html: `<ld-button size="${size}">Button</ld-button>`,
      });

      const button = page.root?.shadowRoot?.querySelector('button');
      expect(button?.classList.contains(`ld-button--${size}`)).toBe(true);
    }
  });

  it('should apply correct shape classes', async () => {
    const shapes = ['default', 'circle', 'round'];
    
    for (const shape of shapes) {
      const page = await newSpecPage({
        components: [Button],
        html: `<ld-button shape="${shape}">Button</ld-button>`,
      });

      const button = page.root?.shadowRoot?.querySelector('button');
      if (shape !== 'default') {
        expect(button?.classList.contains(`ld-button--${shape}`)).toBe(true);
      }
    }
  });

  it('should apply status classes', async () => {
    const statuses = ['success', 'warning', 'error', 'info'];
    
    for (const status of statuses) {
      const page = await newSpecPage({
        components: [Button],
        html: `<ld-button status="${status}">Button</ld-button>`,
      });

      const button = page.root?.shadowRoot?.querySelector('button');
      expect(button?.classList.contains(`ld-button--${status}`)).toBe(true);
    }
  });

  // ==================== 状态测试 ====================

  it('should handle disabled state', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button disabled>Button</ld-button>`,
    });

    const button = page.root?.shadowRoot?.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.classList.contains('ld-button--disabled')).toBe(true);
  });

  it('should handle loading state', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button loading>Button</ld-button>`,
    });

    const button = page.root?.shadowRoot?.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.classList.contains('ld-button--loading')).toBe(true);
    
    const loadingIcon = page.root?.shadowRoot?.querySelector('.ld-button__loading-icon');
    expect(loadingIcon).toBeTruthy();
  });

  it('should handle block state', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button block>Button</ld-button>`,
    });

    const button = page.root?.shadowRoot?.querySelector('button');
    expect(button?.classList.contains('ld-button--block')).toBe(true);
  });

  it('should handle danger state', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button danger>Button</ld-button>`,
    });

    const button = page.root?.shadowRoot?.querySelector('button');
    expect(button?.classList.contains('ld-button--danger')).toBe(true);
  });

  it('should handle ghost state', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button ghost>Button</ld-button>`,
    });

    const button = page.root?.shadowRoot?.querySelector('button');
    expect(button?.classList.contains('ld-button--ghost')).toBe(true);
  });

  // ==================== 图标测试 ====================

  it('should render left icon', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button icon="home">Button</ld-button>`,
    });

    const leftIcon = page.root?.shadowRoot?.querySelector('.ld-button__icon--left');
    expect(leftIcon).toBeTruthy();
  });

  it('should render right icon', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button icon-right="arrow-right">Button</ld-button>`,
    });

    const rightIcon = page.root?.shadowRoot?.querySelector('.ld-button__icon--right');
    expect(rightIcon).toBeTruthy();
  });

  it('should hide left icon when loading', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button icon="home" loading>Button</ld-button>`,
    });

    const leftIcon = page.root?.shadowRoot?.querySelector('.ld-button__icon--left');
    const loadingIcon = page.root?.shadowRoot?.querySelector('.ld-button__loading-icon');
    
    expect(leftIcon).toBeFalsy();
    expect(loadingIcon).toBeTruthy();
  });

  // ==================== 链接模式测试 ====================

  it('should render as link when href is provided', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button type="link" href="https://example.com">Link Button</ld-button>`,
    });

    const link = page.root?.shadowRoot?.querySelector('a');
    const button = page.root?.shadowRoot?.querySelector('button');
    
    expect(link).toBeTruthy();
    expect(button).toBeFalsy();
    expect(link?.getAttribute('href')).toBe('https://example.com');
    expect(link?.getAttribute('role')).toBe('button');
  });

  it('should set correct target for links', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button type="link" href="https://example.com" target="_blank">Link Button</ld-button>`,
    });

    const link = page.root?.shadowRoot?.querySelector('a');
    expect(link?.getAttribute('target')).toBe('_blank');
  });

  // ==================== 事件测试 ====================

  it('should emit click event', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button>Button</ld-button>`,
    });

    const button = page.root?.shadowRoot?.querySelector('button');
    const clickSpy = jest.fn();
    
    page.root?.addEventListener('ldClick', clickSpy);
    button?.click();

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should not emit click event when disabled', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button disabled>Button</ld-button>`,
    });

    const button = page.root?.shadowRoot?.querySelector('button');
    const clickSpy = jest.fn();
    
    page.root?.addEventListener('ldClick', clickSpy);
    button?.click();

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should not emit click event when loading', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button loading>Button</ld-button>`,
    });

    const button = page.root?.shadowRoot?.querySelector('button');
    const clickSpy = jest.fn();
    
    page.root?.addEventListener('ldClick', clickSpy);
    button?.click();

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should emit focus and blur events', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button>Button</ld-button>`,
    });

    const button = page.root?.shadowRoot?.querySelector('button');
    const focusSpy = jest.fn();
    const blurSpy = jest.fn();
    
    page.root?.addEventListener('ldFocus', focusSpy);
    page.root?.addEventListener('ldBlur', blurSpy);
    
    button?.focus();
    button?.blur();

    expect(focusSpy).toHaveBeenCalled();
    expect(blurSpy).toHaveBeenCalled();
  });

  // ==================== 键盘交互测试 ====================

  it('should handle keyboard events', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button>Button</ld-button>`,
    });

    const button = page.root?.shadowRoot?.querySelector('button');
    const clickSpy = jest.fn();
    
    page.root?.addEventListener('ldClick', clickSpy);
    
    // 测试空格键
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    button?.dispatchEvent(spaceEvent);
    
    // 测试回车键
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    button?.dispatchEvent(enterEvent);

    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  // ==================== 自定义样式测试 ====================

  it('should apply custom class', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button custom-class="my-custom-class">Button</ld-button>`,
    });

    const button = page.root?.shadowRoot?.querySelector('button');
    expect(button?.classList.contains('my-custom-class')).toBe(true);
  });

  it('should apply custom styles', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button>Button</ld-button>`,
    });

    const component = page.rootInstance as Button;
    component.customStyle = { color: 'red', fontSize: '16px' };
    await page.waitForChanges();

    const button = page.root?.shadowRoot?.querySelector('button') as HTMLElement;
    expect(button.style.color).toBe('red');
    expect(button.style.fontSize).toBe('16px');
  });

  // ==================== HTML 类型测试 ====================

  it('should set correct button type', async () => {
    const htmlTypes = ['button', 'submit', 'reset'];
    
    for (const htmlType of htmlTypes) {
      const page = await newSpecPage({
        components: [Button],
        html: `<ld-button html-type="${htmlType}">Button</ld-button>`,
      });

      const button = page.root?.shadowRoot?.querySelector('button');
      expect(button?.getAttribute('type')).toBe(htmlType);
    }
  });

  // ==================== 可访问性测试 ====================

  it('should have correct ARIA attributes', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button>Button</ld-button>`,
    });

    const button = page.root?.shadowRoot?.querySelector('button');
    expect(button?.getAttribute('aria-disabled')).toBe('false');
  });

  it('should update ARIA attributes when disabled', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button disabled>Button</ld-button>`,
    });

    const button = page.root?.shadowRoot?.querySelector('button');
    expect(button?.getAttribute('aria-disabled')).toBe('true');
  });

  it('should update ARIA attributes when loading', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: `<ld-button loading>Button</ld-button>`,
    });

    const button = page.root?.shadowRoot?.querySelector('button');
    expect(button?.getAttribute('aria-busy')).toBe('true');
  });
});
