import { newSpecPage } from '@stencil/core/testing';
import { LdInput } from '../ld-input';

describe('ld-input', () => {
  it('renders with default props', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input></ld-input>`,
    });
    
    expect(page.root).toEqualHtml(`
      <ld-input>
        <mock:shadow-root>
          <div class="ld-input-container">
            <div class="ld-input-wrapper ld-input-wrapper--medium">
              <input class="ld-input" type="text" value="" aria-invalid="false">
            </div>
          </div>
        </mock:shadow-root>
      </ld-input>
    `);
  });

  it('renders with label', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input label="Username"></ld-input>`,
    });
    
    const label = page.root.shadowRoot.querySelector('.ld-input-label');
    expect(label).toBeTruthy();
    expect(label.textContent).toBe('Username');
  });

  it('renders with required indicator', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input label="Email" required></ld-input>`,
    });
    
    const required = page.root.shadowRoot.querySelector('.ld-input-required');
    expect(required).toBeTruthy();
    expect(required.textContent).toBe('*');
  });

  it('renders with placeholder', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input placeholder="Enter your name"></ld-input>`,
    });
    
    const input = page.root.shadowRoot.querySelector('input');
    expect(input).toHaveAttribute('placeholder', 'Enter your name');
  });

  it('renders with value', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input value="test value"></ld-input>`,
    });
    
    const input = page.root.shadowRoot.querySelector('input');
    expect(input).toHaveProperty('value', 'test value');
  });

  it('renders disabled state', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input disabled></ld-input>`,
    });
    
    const wrapper = page.root.shadowRoot.querySelector('.ld-input-wrapper');
    const input = page.root.shadowRoot.querySelector('input');
    
    expect(wrapper).toHaveClass('ld-input-wrapper--disabled');
    expect(input).toHaveAttribute('disabled');
  });

  it('renders readonly state', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input readonly></ld-input>`,
    });
    
    const wrapper = page.root.shadowRoot.querySelector('.ld-input-wrapper');
    const input = page.root.shadowRoot.querySelector('input');
    
    expect(wrapper).toHaveClass('ld-input-wrapper--readonly');
    expect(input).toHaveAttribute('readonly');
  });

  it('renders error state', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input error="This field is required"></ld-input>`,
    });
    
    const wrapper = page.root.shadowRoot.querySelector('.ld-input-wrapper');
    const errorDiv = page.root.shadowRoot.querySelector('.ld-input-error');
    const input = page.root.shadowRoot.querySelector('input');
    
    expect(wrapper).toHaveClass('ld-input-wrapper--error');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent).toContain('This field is required');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders help text', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input help-text="Enter at least 8 characters"></ld-input>`,
    });
    
    const helpDiv = page.root.shadowRoot.querySelector('.ld-input-help');
    expect(helpDiv).toBeTruthy();
    expect(helpDiv.textContent).toBe('Enter at least 8 characters');
  });

  it('renders with icon', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input icon="user"></ld-input>`,
    });
    
    const wrapper = page.root.shadowRoot.querySelector('.ld-input-wrapper');
    const iconStart = page.root.shadowRoot.querySelector('.ld-input-icon--start');
    const input = page.root.shadowRoot.querySelector('input');
    
    expect(wrapper).toHaveClass('ld-input-wrapper--has-icon');
    expect(iconStart).toBeTruthy();
    expect(iconStart).toHaveAttribute('name', 'user');
    expect(input).toHaveClass('ld-input--has-icon');
  });

  it('renders with end icon', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input icon-end="search"></ld-input>`,
    });
    
    const wrapper = page.root.shadowRoot.querySelector('.ld-input-wrapper');
    const iconEnd = page.root.shadowRoot.querySelector('.ld-input-icon--end');
    
    expect(wrapper).toHaveClass('ld-input-wrapper--has-icon-end');
    expect(iconEnd).toBeTruthy();
    expect(iconEnd).toHaveAttribute('name', 'search');
  });

  it('renders clearable with value', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input clearable value="test"></ld-input>`,
    });
    
    const clearButton = page.root.shadowRoot.querySelector('.ld-input-clear');
    expect(clearButton).toBeTruthy();
  });

  it('does not render clear button without value', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input clearable></ld-input>`,
    });
    
    const clearButton = page.root.shadowRoot.querySelector('.ld-input-clear');
    expect(clearButton).toBeFalsy();
  });

  it('emits input event on value change', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input></ld-input>`,
    });
    
    const inputSpy = jest.fn();
    page.root.addEventListener('ldInput', inputSpy);
    
    const input = page.root.shadowRoot.querySelector('input');
    input.value = 'new value';
    input.dispatchEvent(new Event('input'));
    
    expect(inputSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { value: 'new value' }
      })
    );
  });

  it('emits clear event when clear button is clicked', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input clearable value="test"></ld-input>`,
    });
    
    const clearSpy = jest.fn();
    page.root.addEventListener('ldClear', clearSpy);
    
    const clearButton = page.root.shadowRoot.querySelector('.ld-input-clear');
    clearButton.click();
    
    expect(clearSpy).toHaveBeenCalled();
  });

  it('handles focus and blur events', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input></ld-input>`,
    });
    
    const focusSpy = jest.fn();
    const blurSpy = jest.fn();
    page.root.addEventListener('ldFocus', focusSpy);
    page.root.addEventListener('ldBlur', blurSpy);
    
    const input = page.root.shadowRoot.querySelector('input');
    input.focus();
    input.blur();
    
    expect(focusSpy).toHaveBeenCalled();
    expect(blurSpy).toHaveBeenCalled();
  });

  it('handles different input types', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input type="email"></ld-input>`,
    });
    
    const input = page.root.shadowRoot.querySelector('input');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('handles size variants', async () => {
    const page = await newSpecPage({
      components: [LdInput],
      html: `<ld-input size="large"></ld-input>`,
    });
    
    const wrapper = page.root.shadowRoot.querySelector('.ld-input-wrapper');
    expect(wrapper).toHaveClass('ld-input-wrapper--large');
  });
});