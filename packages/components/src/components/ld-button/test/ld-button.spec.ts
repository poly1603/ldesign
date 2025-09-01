import { newSpecPage } from '@stencil/core/testing';
import { LdButton } from '../ld-button';

describe('ld-button', () => {
  it('renders with default props', async () => {
    const page = await newSpecPage({
      components: [LdButton],
      html: `<ld-button>Click me</ld-button>`,
    });
    
    expect(page.root).toEqualHtml(`
      <ld-button>
        <mock:shadow-root>
          <button class="ld-button ld-button--primary ld-button--medium" type="button" aria-busy="false" aria-disabled="false">
            <span class="ld-button__text">
              <slot></slot>
            </span>
          </button>
        </mock:shadow-root>
        Click me
      </ld-button>
    `);
  });

  it('renders with variant prop', async () => {
    const page = await newSpecPage({
      components: [LdButton],
      html: `<ld-button variant="secondary">Secondary</ld-button>`,
    });
    
    const button = page.root.shadowRoot.querySelector('button');
    expect(button).toHaveClass('ld-button--secondary');
  });

  it('renders with size prop', async () => {
    const page = await newSpecPage({
      components: [LdButton],
      html: `<ld-button size="large">Large Button</ld-button>`,
    });
    
    const button = page.root.shadowRoot.querySelector('button');
    expect(button).toHaveClass('ld-button--large');
  });

  it('renders disabled state', async () => {
    const page = await newSpecPage({
      components: [LdButton],
      html: `<ld-button disabled>Disabled</ld-button>`,
    });
    
    const button = page.root.shadowRoot.querySelector('button');
    expect(button).toHaveClass('ld-button--disabled');
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders loading state', async () => {
    const page = await newSpecPage({
      components: [LdButton],
      html: `<ld-button loading>Loading</ld-button>`,
    });
    
    const button = page.root.shadowRoot.querySelector('button');
    expect(button).toHaveClass('ld-button--loading');
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-busy', 'true');
    
    const loadingIcon = page.root.shadowRoot.querySelector('.ld-button__loading');
    expect(loadingIcon).toBeTruthy();
  });

  it('renders with icon', async () => {
    const page = await newSpecPage({
      components: [LdButton],
      html: `<ld-button icon="user">User Button</ld-button>`,
    });
    
    const button = page.root.shadowRoot.querySelector('button');
    expect(button).toHaveClass('ld-button--has-icon');
    
    const iconStart = page.root.shadowRoot.querySelector('.ld-button__icon--start');
    expect(iconStart).toBeTruthy();
    expect(iconStart).toHaveAttribute('name', 'user');
  });

  it('renders with end icon', async () => {
    const page = await newSpecPage({
      components: [LdButton],
      html: `<ld-button icon-end="arrow-right">Next</ld-button>`,
    });
    
    const iconEnd = page.root.shadowRoot.querySelector('.ld-button__icon--end');
    expect(iconEnd).toBeTruthy();
    expect(iconEnd).toHaveAttribute('name', 'arrow-right');
  });

  it('renders full width', async () => {
    const page = await newSpecPage({
      components: [LdButton],
      html: `<ld-button full-width>Full Width</ld-button>`,
    });
    
    const button = page.root.shadowRoot.querySelector('button');
    expect(button).toHaveClass('ld-button--full-width');
  });

  it('emits click event', async () => {
    const page = await newSpecPage({
      components: [LdButton],
      html: `<ld-button>Click me</ld-button>`,
    });
    
    const clickSpy = jest.fn();
    page.root.addEventListener('ldClick', clickSpy);
    
    const button = page.root.shadowRoot.querySelector('button');
    button.click();
    
    expect(clickSpy).toHaveBeenCalled();
  });

  it('does not emit click when disabled', async () => {
    const page = await newSpecPage({
      components: [LdButton],
      html: `<ld-button disabled>Disabled</ld-button>`,
    });
    
    const clickSpy = jest.fn();
    page.root.addEventListener('ldClick', clickSpy);
    
    const button = page.root.shadowRoot.querySelector('button');
    button.click();
    
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('does not emit click when loading', async () => {
    const page = await newSpecPage({
      components: [LdButton],
      html: `<ld-button loading>Loading</ld-button>`,
    });
    
    const clickSpy = jest.fn();
    page.root.addEventListener('ldClick', clickSpy);
    
    const button = page.root.shadowRoot.querySelector('button');
    button.click();
    
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('emits focus and blur events', async () => {
    const page = await newSpecPage({
      components: [LdButton],
      html: `<ld-button>Focus me</ld-button>`,
    });
    
    const focusSpy = jest.fn();
    const blurSpy = jest.fn();
    page.root.addEventListener('ldFocus', focusSpy);
    page.root.addEventListener('ldBlur', blurSpy);
    
    const button = page.root.shadowRoot.querySelector('button');
    button.focus();
    button.blur();
    
    expect(focusSpy).toHaveBeenCalled();
    expect(blurSpy).toHaveBeenCalled();
  });

  it('handles pressed state on mouse events', async () => {
    const page = await newSpecPage({
      components: [LdButton],
      html: `<ld-button>Press me</ld-button>`,
    });
    
    const button = page.root.shadowRoot.querySelector('button');
    
    // Simulate mouse down
    button.dispatchEvent(new MouseEvent('mousedown'));
    await page.waitForChanges();
    expect(button).toHaveClass('ld-button--pressed');
    
    // Simulate mouse up
    button.dispatchEvent(new MouseEvent('mouseup'));
    await page.waitForChanges();
    expect(button).not.toHaveClass('ld-button--pressed');
  });
});