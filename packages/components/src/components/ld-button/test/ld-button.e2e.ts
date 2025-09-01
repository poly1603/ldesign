import { newE2EPage } from '@stencil/core/testing';

describe('ld-button e2e', () => {
  it('renders and is clickable', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button>Click me</ld-button>');
    
    const element = await page.find('ld-button');
    expect(element).toHaveClass('hydrated');
    
    const button = await page.find('ld-button >>> button');
    expect(button).toBeTruthy();
    
    // Test click
    const clickEvent = await page.spyOnEvent('ldClick');
    await button.click();
    expect(clickEvent).toHaveReceivedEvent();
  });

  it('handles keyboard navigation', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button>Tab to me</ld-button>');
    
    const button = await page.find('ld-button >>> button');
    
    // Focus with tab
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement);
    expect(focusedElement).toBeTruthy();
    
    // Click with Enter
    const clickEvent = await page.spyOnEvent('ldClick');
    await page.keyboard.press('Enter');
    expect(clickEvent).toHaveReceivedEvent();
  });

  it('shows loading state correctly', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button loading>Loading</ld-button>');
    
    const loadingIcon = await page.find('ld-button >>> .ld-button__loading-icon');
    expect(loadingIcon).toBeTruthy();
    
    const button = await page.find('ld-button >>> button');
    expect(await button.getProperty('disabled')).toBe(true);
  });

  it('applies correct variant styles', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button variant="success">Success</ld-button>');
    
    const button = await page.find('ld-button >>> button');
    expect(button).toHaveClass('ld-button--success');
  });

  it('handles disabled state correctly', async () => {
    const page = await newE2EPage();
    await page.setContent('<ld-button disabled>Disabled</ld-button>');
    
    const button = await page.find('ld-button >>> button');
    expect(await button.getProperty('disabled')).toBe(true);
    
    const clickEvent = await page.spyOnEvent('ldClick');
    await button.click();
    expect(clickEvent).not.toHaveReceivedEvent();
  });

  it('supports full width layout', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <div style="width: 300px;">
        <ld-button full-width>Full Width</ld-button>
      </div>
    `);
    
    const button = await page.find('ld-button >>> button');
    expect(button).toHaveClass('ld-button--full-width');
    
    const buttonRect = await button.boundingBox();
    expect(buttonRect.width).toBeCloseTo(300, 10); // Allow some margin for padding
  });
});