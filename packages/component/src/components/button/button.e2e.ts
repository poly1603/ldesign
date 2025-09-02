/**
 * Button 组件端到端测试
 * 
 * 测试 Button 组件在真实浏览器环境中的交互行为
 * 包括用户交互、可访问性、视觉回归等测试
 */

import { newE2EPage } from '@stencil/core/testing';

describe('ld-button E2E', () => {
  // ==================== 基础交互测试 ====================

  it('should render and be clickable', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button>Click me</ld-button>');

    const button = await page.find('ld-button >>> button');
    expect(button).toBeTruthy();

    // 测试点击事件
    const clickEvent = await page.spyOnEvent('ldClick');
    await button.click();
    expect(clickEvent).toHaveReceivedEvent();
  });

  it('should handle focus and blur', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button>Focus me</ld-button>');

    const button = await page.find('ld-button >>> button');

    // 测试聚焦事件
    const focusEvent = await page.spyOnEvent('ldFocus');
    await button.focus();
    expect(focusEvent).toHaveReceivedEvent();

    // 测试失焦事件
    const blurEvent = await page.spyOnEvent('ldBlur');
    await page.evaluate(() => {
      const btn = document.querySelector('ld-button');
      if (btn) (btn as any).blur();
    });
    expect(blurEvent).toHaveReceivedEvent();
  });

  it('should handle keyboard navigation', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <ld-button id="btn1">Button 1</ld-button>
      <ld-button id="btn2">Button 2</ld-button>
    `);

    // 聚焦第一个按钮
    await page.keyboard.press('Tab');
    const activeElement1 = await page.evaluate(() => document.activeElement?.shadowRoot?.activeElement?.id);
    expect(activeElement1).toBe('btn1');

    // Tab 到第二个按钮
    await page.keyboard.press('Tab');
    const activeElement2 = await page.evaluate(() => document.activeElement?.shadowRoot?.activeElement?.id);
    expect(activeElement2).toBe('btn2');
  });

  it('should trigger click with keyboard', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button>Keyboard Click</ld-button>');

    const button = await page.find('ld-button >>> button');
    await button.focus();

    const clickEvent = await page.spyOnEvent('ldClick');

    // 测试空格键触发点击
    await page.keyboard.press('Space');
    expect(clickEvent).toHaveReceivedEvent();

    // 测试回车键触发点击
    await page.keyboard.press('Enter');
    expect(clickEvent).toHaveReceivedEventTimes(2);
  });

  // ==================== 状态测试 ====================

  it('should not be clickable when disabled', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button disabled>Disabled Button</ld-button>');

    const button = await page.find('ld-button >>> button');
    const clickEvent = await page.spyOnEvent('ldClick');

    await button.click();
    expect(clickEvent).not.toHaveReceivedEvent();

    // 测试键盘事件也被阻止
    await button.focus();
    await page.keyboard.press('Space');
    expect(clickEvent).not.toHaveReceivedEvent();
  });

  it('should not be clickable when loading', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button loading>Loading Button</ld-button>');

    const button = await page.find('ld-button >>> button');
    const clickEvent = await page.spyOnEvent('ldClick');

    await button.click();
    expect(clickEvent).not.toHaveReceivedEvent();

    // 验证加载图标存在
    const loadingIcon = await page.find('ld-button >>> .ld-button__loading-icon');
    expect(loadingIcon).toBeTruthy();
  });

  it('should show loading state correctly', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button id="test-btn">Test Button</ld-button>');

    const component = await page.find('ld-button');

    // 设置加载状态
    component.setProperty('loading', true);
    await page.waitForChanges();

    const button = await page.find('ld-button >>> button');
    const isDisabled = await button.getProperty('disabled');
    const ariaBusy = await button.getAttribute('aria-busy');
    const loadingIcon = await page.find('ld-button >>> .ld-button__loading-icon');

    expect(isDisabled).toBe(true);
    expect(ariaBusy).toBe('true');
    expect(loadingIcon).toBeTruthy();
  });

  // ==================== 链接模式测试 ====================

  it('should render as link when href is provided', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button type="link" href="https://example.com">Link Button</ld-button>');

    const link = await page.find('ld-button >>> a');
    const button = await page.find('ld-button >>> button');

    expect(link).toBeTruthy();
    expect(button).toBeFalsy();

    const href = await link.getAttribute('href');
    expect(href).toBe('https://example.com');
  });

  it('should handle link navigation', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button type="link" href="#test">Link Button</ld-button>');

    const link = await page.find('ld-button >>> a');

    // 监听导航事件
    let navigationOccurred = false;
    page.on('framenavigated', () => {
      navigationOccurred = true;
    });

    await link.click();
    await page.waitForChanges();

    // 验证 URL 变化
    const url = page.url();
    expect(url).toContain('#test');

    // 验证导航是否发生
    expect(navigationOccurred).toBe(true);
  });

  // ==================== 视觉状态测试 ====================

  it('should show hover state', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button>Hover me</ld-button>');

    const button = await page.find('ld-button >>> button');

    // 悬停
    await button.hover();
    await page.waitForChanges();

    // 可以添加视觉回归测试或样式检查
    const computedStyle = await button.getComputedStyle();
    expect(computedStyle).toBeTruthy();
  });

  it('should show pressed state', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button>Press me</ld-button>');

    const button = await page.find('ld-button >>> button');

    // 模拟鼠标按下
    await page.mouse.move(100, 100);
    await page.mouse.down();
    await page.waitForChanges();

    const hasPressed = await button.getProperty('className');
    expect(hasPressed).toContain('ld-button--pressed');

    await page.mouse.up();
  });

  // ==================== 不同类型测试 ====================

  it('should render different button types correctly', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <ld-button type="default">Default</ld-button>
      <ld-button type="primary">Primary</ld-button>
      <ld-button type="dashed">Dashed</ld-button>
      <ld-button type="text">Text</ld-button>
      <ld-button type="link">Link</ld-button>
    `);

    const buttons = await page.findAll('ld-button >>> button, ld-button >>> a');
    expect(buttons).toHaveLength(5);

    // 验证每个按钮都有正确的类名
    const defaultBtn = await page.find('ld-button[type="default"] >>> button');
    const defaultClass = await defaultBtn.getProperty('className');
    expect(defaultClass).toContain('ld-button--default');

    const primaryBtn = await page.find('ld-button[type="primary"] >>> button');
    const primaryClass = await primaryBtn.getProperty('className');
    expect(primaryClass).toContain('ld-button--primary');
  });

  // ==================== 尺寸测试 ====================

  it('should render different sizes correctly', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <ld-button size="small">Small</ld-button>
      <ld-button size="medium">Medium</ld-button>
      <ld-button size="large">Large</ld-button>
    `);

    const smallBtn = await page.find('ld-button[size="small"] >>> button');
    const mediumBtn = await page.find('ld-button[size="medium"] >>> button');
    const largeBtn = await page.find('ld-button[size="large"] >>> button');

    const smallClass = await smallBtn.getProperty('className');
    const mediumClass = await mediumBtn.getProperty('className');
    expect(smallClass).toContain('ld-button--small');
    expect(mediumClass).toContain('ld-button--medium');
    const largeClass = await largeBtn.getProperty('className');
    expect(largeClass).toContain('ld-button--large');

    // 验证尺寸差异
    const smallStyle = await smallBtn.getComputedStyle();
    const largeStyle = await largeBtn.getComputedStyle();
    const smallHeight = parseInt(smallStyle.height);
    const largeHeight = parseInt(largeStyle.height);
    expect(largeHeight).toBeGreaterThan(smallHeight);
  });

  // ==================== 图标测试 ====================

  it('should render icons correctly', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <ld-button icon="home">With Left Icon</ld-button>
      <ld-button icon-right="arrow-right">With Right Icon</ld-button>
      <ld-button icon="home" icon-right="arrow-right">With Both Icons</ld-button>
    `);

    const leftIcon = await page.find('ld-button[icon="home"] >>> .ld-button__icon--left');
    const rightIcon = await page.find('ld-button[icon-right="arrow-right"] >>> .ld-button__icon--right');
    const bothIconsBtn = await page.find('ld-button[icon="home"][icon-right="arrow-right"]');
    const bothLeftIcon = await bothIconsBtn.find('>>> .ld-button__icon--left');
    const bothRightIcon = await bothIconsBtn.find('>>> .ld-button__icon--right');

    expect(leftIcon).toBeTruthy();
    expect(rightIcon).toBeTruthy();
    expect(bothLeftIcon).toBeTruthy();
    expect(bothRightIcon).toBeTruthy();
  });

  // ==================== 可访问性测试 ====================

  it('should have proper ARIA attributes', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button disabled loading>Accessible Button</ld-button>');

    const button = await page.find('ld-button >>> button');

    const ariaDisabled = await button.getAttribute('aria-disabled');
    const ariaBusy = await button.getAttribute('aria-busy');

    expect(ariaDisabled).toBe('true');
    expect(ariaBusy).toBe('true');
  });

  it('should be accessible via screen reader', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button aria-label="Custom Label">Button</ld-button>');

    const button = await page.find('ld-button >>> button');
    const ariaLabel = await button.getAttribute('aria-label');

    // 注意：这里的 aria-label 应该从 host 元素传递到 button 元素
    // 实际实现中可能需要调整
    expect(ariaLabel).toBeTruthy();
  });

  // ==================== 响应式测试 ====================

  it('should handle responsive behavior', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button block>Block Button</ld-button>');

    // 设置移动端视口
    await page.setViewport({ width: 375, height: 667 });
    await page.waitForChanges();

    const button = await page.find('ld-button >>> button');
    const buttonClass = await button.getProperty('className');
    const hasBlockClass = buttonClass.includes('ld-button--block');
    expect(hasBlockClass).toBe(true);

    // 验证按钮占满宽度
    const buttonStyle = await button.getComputedStyle();
    const buttonWidth = parseInt(buttonStyle.width);
    const pageWidth = 375; // 使用设置的视口宽度

    // 考虑到可能的边距，按钮宽度应该接近页面宽度
    expect(buttonWidth).toBeGreaterThan(pageWidth * 0.8);
  });

  // ==================== 主题测试 ====================

  it('should handle theme changes', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <div data-theme="dark">
        <ld-button>Dark Theme Button</ld-button>
      </div>
    `);

    const button = await page.find('ld-button >>> button');

    // 验证在暗色主题下的样式
    const computedStyle = await button.getComputedStyle();
    expect(computedStyle).toBeTruthy();

    // 可以添加具体的颜色值检查
    // expect(computedStyle.backgroundColor).toBe('expected-dark-color');
  });

  // ==================== 性能测试 ====================

  it('should render quickly', async () => {
    const page = await newE2EPage();

    const startTime = Date.now();
    await page.setContent('<ld-button>Performance Test</ld-button>');
    await page.waitForChanges();
    const endTime = Date.now();

    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(1000); // 应该在1秒内完成渲染
  });

  it('should handle multiple buttons efficiently', async () => {
    const page = await newE2EPage();

    const buttonsHtml = Array.from({ length: 100 }, (_, i) =>
      `<ld-button>Button ${i + 1}</ld-button>`
    ).join('');

    const startTime = Date.now();
    await page.setContent(`<div>${buttonsHtml}</div>`);
    await page.waitForChanges();
    const endTime = Date.now();

    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(3000); // 100个按钮应该在3秒内完成渲染

    const buttons = await page.findAll('ld-button');
    expect(buttons).toHaveLength(100);
  });
});
