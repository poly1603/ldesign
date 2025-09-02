/**
 * Card 组件单元测试
 * 
 * 测试 Card 组件的各种功能、属性、事件和交互行为
 * 确保组件的可靠性和可访问性
 */

import { newSpecPage } from '@stencil/core/testing';
import { Card } from './card';

describe('ld-card', () => {
  // ==================== 基础渲染测试 ====================

  it('should render with default props', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card>Card content</ld-card>`,
    });

    expect(page.root).toEqualHtml(`
      <ld-card>
        <mock:shadow-root>
          <div class="ld-card ld-card--medium ld-card--shadow-always ld-card--border-solid">
            <div class="ld-card__body">
              <slot></slot>
            </div>
          </div>
        </mock:shadow-root>
        Card content
      </ld-card>
    `);
  });

  it('should render with title and subtitle', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card title="Card Title" subtitle="Card Subtitle">Content</ld-card>`,
    });

    const title = page.root?.shadowRoot?.querySelector('.ld-card__title');
    const subtitle = page.root?.shadowRoot?.querySelector('.ld-card__subtitle');

    expect(title?.textContent).toBe('Card Title');
    expect(subtitle?.textContent).toBe('Card Subtitle');
  });

  it('should render with description', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card description="This is a description">Content</ld-card>`,
    });

    const description = page.root?.shadowRoot?.querySelector('.ld-card__description');
    expect(description?.textContent).toBe('This is a description');
  });

  // ==================== 尺寸测试 ====================

  it('should apply correct size classes', async () => {
    const sizes = ['small', 'medium', 'large'];

    for (const size of sizes) {
      const page = await newSpecPage({
        components: [Card],
        html: `<ld-card size="${size}">Content</ld-card>`,
      });

      const card = page.root?.shadowRoot?.querySelector('.ld-card');
      expect(card?.classList.contains(`ld-card--${size}`)).toBe(true);
    }
  });

  // ==================== 阴影测试 ====================

  it('should apply correct shadow classes', async () => {
    const shadows = ['never', 'hover', 'always'];

    for (const shadow of shadows) {
      const page = await newSpecPage({
        components: [Card],
        html: `<ld-card shadow="${shadow}">Content</ld-card>`,
      });

      const card = page.root?.shadowRoot?.querySelector('.ld-card');
      expect(card?.classList.contains(`ld-card--shadow-${shadow}`)).toBe(true);
    }
  });

  // ==================== 边框测试 ====================

  it('should apply correct border classes', async () => {
    const borders = ['none', 'solid', 'dashed'];

    for (const border of borders) {
      const page = await newSpecPage({
        components: [Card],
        html: `<ld-card border="${border}">Content</ld-card>`,
      });

      const card = page.root?.shadowRoot?.querySelector('.ld-card');
      if (border === 'none') {
        expect(card?.classList.contains(`ld-card--border-${border}`)).toBe(false);
      } else {
        expect(card?.classList.contains(`ld-card--border-${border}`)).toBe(true);
      }
    }
  });

  // ==================== 交互状态测试 ====================

  it('should handle hoverable state', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card hoverable>Content</ld-card>`,
    });

    const card = page.root?.shadowRoot?.querySelector('.ld-card');
    expect(card?.classList.contains('ld-card--hoverable')).toBe(true);
  });

  it('should handle clickable state', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card clickable>Content</ld-card>`,
    });

    const card = page.root?.shadowRoot?.querySelector('.ld-card') as HTMLElement;
    expect(card?.classList.contains('ld-card--clickable')).toBe(true);
    expect(card?.getAttribute('tabindex')).toBe('0');
    expect(card?.getAttribute('role')).toBe('button');
  });

  it('should handle loading state', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card loading>Content</ld-card>`,
    });

    const card = page.root?.shadowRoot?.querySelector('.ld-card');
    const loading = page.root?.shadowRoot?.querySelector('.ld-card__loading');

    expect(card?.classList.contains('ld-card--loading')).toBe(true);
    expect(loading).toBeTruthy();
  });

  // ==================== 头部测试 ====================

  it('should render header with icon', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card title="Title" header-icon="home">Content</ld-card>`,
    });

    const header = page.root?.shadowRoot?.querySelector('.ld-card__header');
    const headerIcon = page.root?.shadowRoot?.querySelector('.ld-card__header-icon');

    expect(header).toBeTruthy();
    expect(headerIcon).toBeTruthy();
  });

  it('should render header with extra content', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card title="Title" header-extra="Extra">Content</ld-card>`,
    });

    const headerExtra = page.root?.shadowRoot?.querySelector('.ld-card__header-extra');
    expect(headerExtra?.textContent).toBe('Extra');
  });

  it('should render header divider when enabled', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card title="Title" header-divider>Content</ld-card>`,
    });

    const header = page.root?.shadowRoot?.querySelector('.ld-card__header');
    expect(header?.classList.contains('ld-card__header--divider')).toBe(true);
  });

  it('should not render header when no header content', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card>Content</ld-card>`,
    });

    const header = page.root?.shadowRoot?.querySelector('.ld-card__header');
    expect(header).toBeFalsy();
  });

  // ==================== 封面测试 ====================

  it('should render cover image', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card cover="https://example.com/image.jpg" cover-alt="Test Image">Content</ld-card>`,
    });

    const cover = page.root?.shadowRoot?.querySelector('.ld-card__cover');
    const coverImage = page.root?.shadowRoot?.querySelector('.ld-card__cover-image') as HTMLImageElement;

    expect(cover).toBeTruthy();
    expect(coverImage.src).toBe('https://example.com/image.jpg');
    expect(coverImage.alt).toBe('Test Image');
  });

  it('should set cover height', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card cover="https://example.com/image.jpg" cover-height="300px">Content</ld-card>`,
    });

    const cover = page.root?.shadowRoot?.querySelector('.ld-card__cover') as HTMLElement;
    expect(cover.style.height).toBe('300px');
  });

  // ==================== 底部测试 ====================

  it('should render footer when footer slot exists', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `
        <ld-card>
          Content
          <div slot="footer">Footer content</div>
        </ld-card>
      `,
    });

    // 注意：在单元测试中，我们需要模拟 slot 的存在
    // 实际的 slot 检测逻辑在真实环境中会正常工作
    const component = page.rootInstance as Card;
    expect(component).toBeDefined();

    // 手动设置一个 footer slot 元素来测试
    const footerSlot = document.createElement('div');
    footerSlot.setAttribute('slot', 'footer');
    page.root?.appendChild(footerSlot);

    await page.waitForChanges();

    const footer = page.root?.shadowRoot?.querySelector('.ld-card__footer');
    expect(footer).toBeTruthy();
  });

  it('should render footer divider when enabled', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card footer-divider>Content</ld-card>`,
    });

    // 手动添加 footer slot 来触发 footer 渲染
    const footerSlot = document.createElement('div');
    footerSlot.setAttribute('slot', 'footer');
    page.root?.appendChild(footerSlot);

    await page.waitForChanges();

    const footer = page.root?.shadowRoot?.querySelector('.ld-card__footer');
    expect(footer?.classList.contains('ld-card__footer--divider')).toBe(true);
  });

  // ==================== 事件测试 ====================

  it('should emit click event when clickable', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card clickable>Content</ld-card>`,
    });

    const card = page.root?.shadowRoot?.querySelector('.ld-card') as HTMLElement;
    const clickSpy = jest.fn();

    page.root?.addEventListener('ldClick', clickSpy);
    card.click();

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should not emit click event when not clickable', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card>Content</ld-card>`,
    });

    const card = page.root?.shadowRoot?.querySelector('.ld-card') as HTMLElement;
    const clickSpy = jest.fn();

    page.root?.addEventListener('ldClick', clickSpy);
    card.click();

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should emit mouse enter and leave events', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card hoverable>Content</ld-card>`,
    });

    const card = page.root?.shadowRoot?.querySelector('.ld-card') as HTMLElement;
    const mouseEnterSpy = jest.fn();
    const mouseLeaveSpy = jest.fn();

    page.root?.addEventListener('ldMouseEnter', mouseEnterSpy);
    page.root?.addEventListener('ldMouseLeave', mouseLeaveSpy);

    card.dispatchEvent(new MouseEvent('mouseenter'));
    card.dispatchEvent(new MouseEvent('mouseleave'));

    expect(mouseEnterSpy).toHaveBeenCalled();
    expect(mouseLeaveSpy).toHaveBeenCalled();
  });

  it('should emit header click event', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card title="Title">Content</ld-card>`,
    });

    const header = page.root?.shadowRoot?.querySelector('.ld-card__header') as HTMLElement;
    const headerClickSpy = jest.fn();

    page.root?.addEventListener('ldHeaderClick', headerClickSpy);
    header.click();

    expect(headerClickSpy).toHaveBeenCalled();
  });

  it('should emit cover click event', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card cover="https://example.com/image.jpg">Content</ld-card>`,
    });

    const cover = page.root?.shadowRoot?.querySelector('.ld-card__cover') as HTMLElement;
    const coverClickSpy = jest.fn();

    page.root?.addEventListener('ldCoverClick', coverClickSpy);
    cover.click();

    expect(coverClickSpy).toHaveBeenCalled();
  });

  // ==================== 键盘交互测试 ====================

  it('should handle keyboard events when clickable', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card clickable>Content</ld-card>`,
    });

    const card = page.root?.shadowRoot?.querySelector('.ld-card') as HTMLElement;
    const clickSpy = jest.fn();

    page.root?.addEventListener('ldClick', clickSpy);

    // 测试空格键
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    card.dispatchEvent(spaceEvent);

    // 测试回车键
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    card.dispatchEvent(enterEvent);

    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  // ==================== 自定义样式测试 ====================

  it('should apply custom class', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card custom-class="my-custom-class">Content</ld-card>`,
    });

    const card = page.root?.shadowRoot?.querySelector('.ld-card');
    expect(card?.classList.contains('my-custom-class')).toBe(true);
  });

  it('should apply custom styles', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card>Content</ld-card>`,
    });

    const component = page.rootInstance as Card;
    component.customStyle = { backgroundColor: 'red', padding: '20px' };
    await page.waitForChanges();

    const card = page.root?.shadowRoot?.querySelector('.ld-card') as HTMLElement;
    expect(card.style.backgroundColor).toBe('red');
    expect(card.style.padding).toBe('20px');
  });

  // ==================== 内边距测试 ====================

  it('should apply custom padding to body', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card body-padding="30px">Content</ld-card>`,
    });

    const body = page.root?.shadowRoot?.querySelector('.ld-card__body') as HTMLElement;
    expect(body.style.padding).toBe('30px');
  });

  it('should apply custom padding to header', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card title="Title" header-padding="25px">Content</ld-card>`,
    });

    const header = page.root?.shadowRoot?.querySelector('.ld-card__header') as HTMLElement;
    expect(header.style.padding).toBe('25px');
  });

  it('should apply custom padding to footer', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card footer-padding="15px">Content</ld-card>`,
    });

    // 手动添加 footer slot
    const footerSlot = document.createElement('div');
    footerSlot.setAttribute('slot', 'footer');
    page.root?.appendChild(footerSlot);

    await page.waitForChanges();

    const footer = page.root?.shadowRoot?.querySelector('.ld-card__footer') as HTMLElement;
    expect(footer.style.padding).toBe('15px');
  });

  // ==================== 可访问性测试 ====================

  it('should have correct ARIA attributes when clickable', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card clickable>Content</ld-card>`,
    });

    const card = page.root?.shadowRoot?.querySelector('.ld-card') as HTMLElement;
    expect(card.getAttribute('role')).toBe('button');
    expect(card.getAttribute('tabindex')).toBe('0');
    expect(card.getAttribute('aria-pressed')).toBe('false');
  });

  it('should update aria-pressed when pressed', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: `<ld-card clickable>Content</ld-card>`,
    });

    const card = page.root?.shadowRoot?.querySelector('.ld-card') as HTMLElement;
    const component = page.rootInstance as Card;

    // 模拟按下状态
    component['pressed'] = true;
    await page.waitForChanges();

    expect(card.getAttribute('aria-pressed')).toBe('true');
  });
});
