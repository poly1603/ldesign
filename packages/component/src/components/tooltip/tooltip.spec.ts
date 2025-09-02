import { newSpecPage } from '@stencil/core/testing';
import { Tooltip } from './tooltip';

describe('ld-tooltip', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip content="提示内容"><button>按钮</button></ld-tooltip>`,
    });
    expect(page.root).toEqualHtml(`
      <ld-tooltip content="提示内容">
        <mock:shadow-root>
          <div class="ld-tooltip__trigger" aria-describedby="">
            <slot></slot>
          </div>
        </mock:shadow-root>
        <button>按钮</button>
      </ld-tooltip>
    `);
  });

  it('renders with content', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip content="这是提示内容"><span>悬停我</span></ld-tooltip>`,
    });
    
    const tooltip = page.root as any;
    expect(tooltip.content).toBe('这是提示内容');
  });

  it('supports different placements', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip placement="bottom" content="底部提示"><button>按钮</button></ld-tooltip>`,
    });
    
    const tooltip = page.root as any;
    expect(tooltip.placement).toBe('bottom');
    
    tooltip.placement = 'left';
    await page.waitForChanges();
    expect(tooltip.placement).toBe('left');
  });

  it('supports different triggers', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip trigger="click" content="点击提示"><button>按钮</button></ld-tooltip>`,
    });
    
    const tooltip = page.root as any;
    expect(tooltip.trigger).toBe('click');
    
    tooltip.trigger = 'focus';
    await page.waitForChanges();
    expect(tooltip.trigger).toBe('focus');
  });

  it('supports visible property', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip visible="true" content="可见提示"><button>按钮</button></ld-tooltip>`,
    });
    
    const tooltip = page.root as any;
    expect(tooltip.visible).toBe(true);
    
    tooltip.visible = false;
    await page.waitForChanges();
    expect(tooltip.visible).toBe(false);
  });

  it('supports disabled state', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip disabled="true" content="禁用提示"><button>按钮</button></ld-tooltip>`,
    });
    
    const tooltip = page.root as any;
    expect(tooltip.disabled).toBe(true);
  });

  it('supports custom delays', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip show-delay="200" hide-delay="300" content="延迟提示"><button>按钮</button></ld-tooltip>`,
    });
    
    const tooltip = page.root as any;
    expect(tooltip.showDelay).toBe(200);
    expect(tooltip.hideDelay).toBe(300);
  });

  it('supports arrow point at center', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip arrow-point-at-center="true" content="箭头居中"><button>按钮</button></ld-tooltip>`,
    });
    
    const tooltip = page.root as any;
    expect(tooltip.arrowPointAtCenter).toBe(true);
  });

  it('supports custom class', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip custom-class="my-tooltip" content="自定义样式"><button>按钮</button></ld-tooltip>`,
    });
    
    const tooltip = page.root as any;
    expect(tooltip.customClass).toBe('my-tooltip');
  });

  it('supports custom z-index', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip z-index="2000" content="高层级提示"><button>按钮</button></ld-tooltip>`,
    });
    
    const tooltip = page.root as any;
    expect(tooltip.zIndex).toBe(2000);
  });

  it('emits events correctly', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip content="事件测试"><button>按钮</button></ld-tooltip>`,
    });
    
    const tooltip = page.root as any;
    const showSpy = jest.fn();
    const hideSpy = jest.fn();
    
    tooltip.addEventListener('ldShow', showSpy);
    tooltip.addEventListener('ldHide', hideSpy);
    
    // 测试显示事件
    tooltip.visible = true;
    await page.waitForChanges();
    expect(showSpy).toHaveBeenCalled();
    
    // 测试隐藏事件
    tooltip.visible = false;
    await page.waitForChanges();
    expect(hideSpy).toHaveBeenCalled();
  });

  it('handles visibility changes correctly', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip content="可见性测试"><button>按钮</button></ld-tooltip>`,
    });
    
    const tooltip = page.root as any;
    
    // 初始状态
    expect(tooltip.visible).toBe(false);
    
    // 显示提示框
    tooltip.visible = true;
    await page.waitForChanges();
    expect(tooltip.visible).toBe(true);
    
    // 隐藏提示框
    tooltip.visible = false;
    await page.waitForChanges();
    expect(tooltip.visible).toBe(false);
  });

  it('has correct default values', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip><button>按钮</button></ld-tooltip>`,
    });
    
    const tooltip = page.root as any;
    expect(tooltip.placement).toBe('top');
    expect(tooltip.trigger).toBe('hover');
    expect(tooltip.visible).toBe(false);
    expect(tooltip.disabled).toBe(false);
    expect(tooltip.showDelay).toBe(100);
    expect(tooltip.hideDelay).toBe(100);
    expect(tooltip.arrowPointAtCenter).toBe(false);
    expect(tooltip.zIndex).toBe(1060);
  });

  it('calls tooltip methods correctly', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip content="方法测试"><button>按钮</button></ld-tooltip>`,
    });
    
    const tooltip = page.root as any;
    
    // 测试显示方法
    await tooltip.show();
    expect(tooltip.visible).toBe(true);
    
    // 测试隐藏方法
    await tooltip.hide();
    expect(tooltip.visible).toBe(false);
    
    // 测试切换方法
    await tooltip.toggle();
    expect(tooltip.visible).toBe(true);
    
    await tooltip.toggle();
    expect(tooltip.visible).toBe(false);
    
    // 测试更新位置方法
    await tooltip.updatePosition();
  });

  it('handles disabled state correctly', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip disabled="true" content="禁用测试"><button>按钮</button></ld-tooltip>`,
    });
    
    const tooltip = page.root as any;
    
    // 禁用状态下不应该显示
    await tooltip.show();
    expect(tooltip.visible).toBe(false);
  });

  it('supports all placement options', async () => {
    const placements = [
      'top', 'top-start', 'top-end',
      'bottom', 'bottom-start', 'bottom-end',
      'left', 'left-start', 'left-end',
      'right', 'right-start', 'right-end'
    ];
    
    for (const placement of placements) {
      const page = await newSpecPage({
        components: [Tooltip],
        html: `<ld-tooltip placement="${placement}" content="位置测试"><button>按钮</button></ld-tooltip>`,
      });
      
      const tooltip = page.root as any;
      expect(tooltip.placement).toBe(placement);
    }
  });

  it('supports all trigger options', async () => {
    const triggers = ['hover', 'click', 'focus', 'manual'];
    
    for (const trigger of triggers) {
      const page = await newSpecPage({
        components: [Tooltip],
        html: `<ld-tooltip trigger="${trigger}" content="触发测试"><button>按钮</button></ld-tooltip>`,
      });
      
      const tooltip = page.root as any;
      expect(tooltip.trigger).toBe(trigger);
    }
  });

  it('renders tooltip popup when visible', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip visible="true" content="弹出层测试"><button>按钮</button></ld-tooltip>`,
    });
    
    await page.waitForChanges();
    
    const popup = page.root?.shadowRoot?.querySelector('.ld-tooltip__popup');
    expect(popup).toBeTruthy();
    expect(popup?.textContent?.trim()).toBe('弹出层测试');
  });

  it('does not render tooltip popup when not visible', async () => {
    const page = await newSpecPage({
      components: [Tooltip],
      html: `<ld-tooltip visible="false" content="隐藏测试"><button>按钮</button></ld-tooltip>`,
    });
    
    await page.waitForChanges();
    
    const popup = page.root?.shadowRoot?.querySelector('.ld-tooltip__popup');
    expect(popup).toBeFalsy();
  });
});
