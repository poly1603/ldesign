import { newSpecPage } from '@stencil/core/testing';
import { LdCard } from '../ld-card';

describe('ld-card', () => {
  it('renders with default props', async () => {
    const page = await newSpecPage({
      components: [LdCard],
      html: `<ld-card>Card content</ld-card>`,
    });
    
    expect(page.root).toEqualHtml(`
      <ld-card>
        <mock:shadow-root>
          <div class="ld-card ld-card--medium ld-card--shadow ld-card--shadow-1 ld-card--bordered">
            <div class="ld-card__body">
              <slot></slot>
            </div>
          </div>
        </mock:shadow-root>
        Card content
      </ld-card>
    `);
  });

  it('renders with title and subtitle', async () => {
    const page = await newSpecPage({
      components: [LdCard],
      html: `<ld-card title="Card Title" subtitle="Card Subtitle">Content</ld-card>`,
    });
    
    const header = page.root.shadowRoot.querySelector('.ld-card__header');
    const title = page.root.shadowRoot.querySelector('.ld-card__title');
    const subtitle = page.root.shadowRoot.querySelector('.ld-card__subtitle');
    
    expect(header).toBeTruthy();
    expect(title).toBeTruthy();
    expect(title.textContent).toBe('Card Title');
    expect(subtitle).toBeTruthy();
    expect(subtitle.textContent).toBe('Card Subtitle');
  });

  it('renders without shadow', async () => {
    const page = await newSpecPage({
      components: [LdCard],
      html: `<ld-card shadow="false">No shadow</ld-card>`,
    });
    
    const card = page.root.shadowRoot.querySelector('.ld-card');
    expect(card).not.toHaveClass('ld-card--shadow');
  });

  it('renders with different shadow levels', async () => {
    const page = await newSpecPage({
      components: [LdCard],
      html: `<ld-card shadow-level="3">Shadow level 3</ld-card>`,
    });
    
    const card = page.root.shadowRoot.querySelector('.ld-card');
    expect(card).toHaveClass('ld-card--shadow-3');
  });

  it('renders hoverable state', async () => {
    const page = await newSpecPage({
      components: [LdCard],
      html: `<ld-card hoverable>Hoverable card</ld-card>`,
    });
    
    const card = page.root.shadowRoot.querySelector('.ld-card');
    expect(card).toHaveClass('ld-card--hoverable');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('renders without border', async () => {
    const page = await newSpecPage({
      components: [LdCard],
      html: `<ld-card bordered="false">No border</ld-card>`,
    });
    
    const card = page.root.shadowRoot.querySelector('.ld-card');
    expect(card).not.toHaveClass('ld-card--bordered');
  });

  it('renders loading state', async () => {
    const page = await newSpecPage({
      components: [LdCard],
      html: `<ld-card loading>Loading card</ld-card>`,
    });
    
    const card = page.root.shadowRoot.querySelector('.ld-card');
    const loadingElement = page.root.shadowRoot.querySelector('.ld-card__loading');
    
    expect(card).toHaveClass('ld-card--loading');
    expect(card).toHaveAttribute('aria-busy', 'true');
    expect(loadingElement).toBeTruthy();
  });

  it('renders different sizes', async () => {
    const page = await newSpecPage({
      components: [LdCard],
      html: `<ld-card size="large">Large card</ld-card>`,
    });
    
    const card = page.root.shadowRoot.querySelector('.ld-card');
    expect(card).toHaveClass('ld-card--large');
  });

  it('emits click event when hoverable', async () => {
    const page = await newSpecPage({
      components: [LdCard],
      html: `<ld-card hoverable>Clickable card</ld-card>`,
    });
    
    const clickSpy = jest.fn();
    page.root.addEventListener('ldClick', clickSpy);
    
    const card = page.root.shadowRoot.querySelector('.ld-card');
    card.click();
    
    expect(clickSpy).toHaveBeenCalled();
  });

  it('does not emit click event when not hoverable', async () => {
    const page = await newSpecPage({
      components: [LdCard],
      html: `<ld-card>Normal card</ld-card>`,
    });
    
    const clickSpy = jest.fn();
    page.root.addEventListener('ldClick', clickSpy);
    
    const card = page.root.shadowRoot.querySelector('.ld-card');
    card.click();
    
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('emits hover events', async () => {
    const page = await newSpecPage({
      components: [LdCard],
      html: `<ld-card>Hover card</ld-card>`,
    });
    
    const hoverSpy = jest.fn();
    const leaveSpy = jest.fn();
    page.root.addEventListener('ldHover', hoverSpy);
    page.root.addEventListener('ldLeave', leaveSpy);
    
    const card = page.root.shadowRoot.querySelector('.ld-card');
    card.dispatchEvent(new MouseEvent('mouseenter'));
    card.dispatchEvent(new MouseEvent('mouseleave'));
    
    expect(hoverSpy).toHaveBeenCalled();
    expect(leaveSpy).toHaveBeenCalled();
  });

  it('handles slotted content correctly', async () => {
    const page = await newSpecPage({
      components: [LdCard],
      html: `
        <ld-card>
          <div slot="header">Custom header</div>
          <p>Main content</p>
          <div slot="footer">Custom footer</div>
          <div slot="actions">Actions</div>
        </ld-card>
      `,
    });
    
    const header = page.root.shadowRoot.querySelector('.ld-card__header');
    const body = page.root.shadowRoot.querySelector('.ld-card__body');
    const footer = page.root.shadowRoot.querySelector('.ld-card__footer');
    const actions = page.root.shadowRoot.querySelector('.ld-card__actions');
    
    expect(header).toBeTruthy();
    expect(body).toBeTruthy();
    expect(footer).toBeTruthy();
    expect(actions).toBeTruthy();
  });
});