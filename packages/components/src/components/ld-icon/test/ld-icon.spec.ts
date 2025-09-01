import { newSpecPage } from '@stencil/core/testing';
import { LdIcon } from '../ld-icon';

describe('ld-icon', () => {
  it('renders with built-in icon', async () => {
    const page = await newSpecPage({
      components: [LdIcon],
      html: `<ld-icon name="user"></ld-icon>`,
    });
    
    const iconDiv = page.root.shadowRoot.querySelector('.ld-icon');
    expect(iconDiv).toBeTruthy();
    expect(iconDiv).toHaveAttribute('role', 'img');
    expect(iconDiv).toHaveAttribute('aria-label', 'user');
  });

  it('renders with custom size', async () => {
    const page = await newSpecPage({
      components: [LdIcon],
      html: `<ld-icon name="user" icon-size="24px"></ld-icon>`,
    });
    
    const iconDiv = page.root.shadowRoot.querySelector('.ld-icon');
    const style = iconDiv.getAttribute('style');
    expect(style).toContain('width: 24px');
    expect(style).toContain('height: 24px');
  });

  it('renders with custom color', async () => {
    const page = await newSpecPage({
      components: [LdIcon],
      html: `<ld-icon name="user" color="red"></ld-icon>`,
    });
    
    const iconDiv = page.root.shadowRoot.querySelector('.ld-icon');
    const style = iconDiv.getAttribute('style');
    expect(style).toContain('color: red');
  });

  it('renders with custom SVG', async () => {
    const customSvg = '<svg><circle r="10"/></svg>';
    const page = await newSpecPage({
      components: [LdIcon],
      html: `<ld-icon svg="${customSvg}"></ld-icon>`,
    });
    
    const iconDiv = page.root.shadowRoot.querySelector('.ld-icon');
    expect(iconDiv.innerHTML).toContain('circle');
  });

  it('shows loading state initially', async () => {
    const page = await newSpecPage({
      components: [LdIcon],
      html: `<ld-icon name="user"></ld-icon>`,
    });
    
    // Before componentWillLoad completes
    const iconDiv = page.root.shadowRoot.querySelector('.ld-icon');
    expect(iconDiv).toBeTruthy();
  });

  it('handles unknown icon gracefully', async () => {
    const page = await newSpecPage({
      components: [LdIcon],
      html: `<ld-icon name="unknown-icon"></ld-icon>`,
    });
    
    // Should still render something (fallback icon)
    const iconDiv = page.root.shadowRoot.querySelector('.ld-icon');
    expect(iconDiv).toBeTruthy();
  });

  it('renders with numeric size', async () => {
    const page = await newSpecPage({
      components: [LdIcon],
      html: `<ld-icon name="user" icon-size="20"></ld-icon>`,
    });
    
    const iconDiv = page.root.shadowRoot.querySelector('.ld-icon');
    const style = iconDiv.getAttribute('style');
    expect(style).toContain('width: 20px');
    expect(style).toContain('height: 20px');
  });

  it('renders with alt text', async () => {
    const page = await newSpecPage({
      components: [LdIcon],
      html: `<ld-icon name="user" alt="User profile"></ld-icon>`,
    });
    
    const iconDiv = page.root.shadowRoot.querySelector('.ld-icon');
    expect(iconDiv).toHaveAttribute('aria-label', 'User profile');
  });

  it('handles icon name changes', async () => {
    const page = await newSpecPage({
      components: [LdIcon],
      html: `<ld-icon name="user"></ld-icon>`,
    });
    
    // Change the icon name
    page.root.name = 'settings';
    await page.waitForChanges();
    
    const iconDiv = page.root.shadowRoot.querySelector('.ld-icon');
    expect(iconDiv).toBeTruthy();
  });

  it('applies loading class during loading', async () => {
    const page = await newSpecPage({
      components: [LdIcon],
      html: `<ld-icon name="user"></ld-icon>`,
    });
    
    // Access the component instance to check loading state
    const component = page.rootInstance;
    component.isLoading = true;
    await page.waitForChanges();
    
    const iconDiv = page.root.shadowRoot.querySelector('.ld-icon');
    expect(iconDiv).toHaveClass('ld-icon--loading');
  });

  it('applies error class on error', async () => {
    const page = await newSpecPage({
      components: [LdIcon],
      html: `<ld-icon name="user"></ld-icon>`,
    });
    
    // Access the component instance to check error state
    const component = page.rootInstance;
    component.hasError = true;
    await page.waitForChanges();
    
    const iconDiv = page.root.shadowRoot.querySelector('.ld-icon');
    expect(iconDiv).toHaveClass('ld-icon--error');
  });
});