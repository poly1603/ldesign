/**
 * Input 组件单元测试
 * 
 * 测试 Input 组件的各种功能、属性、事件和交互行为
 * 确保组件的可靠性和可访问性
 */

import { newSpecPage } from '@stencil/core/testing';
import { Input } from './input';

describe('ld-input', () => {
  // ==================== 基础渲染测试 ====================

  it('should render with default props', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input></ld-input>`,
    });

    expect(page.root).toEqualHtml(`
      <ld-input>
        <mock:shadow-root>
          <div class="ld-input ld-input--outlined ld-input--medium">
            <div class="ld-input__wrapper">
              <input 
                class="ld-input__control" 
                type="text"
                value=""
                aria-invalid="false"
              />
            </div>
          </div>
        </mock:shadow-root>
      </ld-input>
    `);
  });

  it('should render with value', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input value="test value"></ld-input>`,
    });

    const input = page.root?.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('test value');
  });

  it('should render with placeholder', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input placeholder="Enter text"></ld-input>`,
    });

    const input = page.root?.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('Enter text');
  });

  // ==================== 类型测试 ====================

  it('should render different input types', async () => {
    const types = ['text', 'password', 'email', 'number', 'tel', 'url', 'search'];
    
    for (const type of types) {
      const page = await newSpecPage({
        components: [Input],
        html: `<ld-input type="${type}"></ld-input>`,
      });

      const input = page.root?.shadowRoot?.querySelector('input') as HTMLInputElement;
      if (type === 'password') {
        expect(input.type).toBe('password');
      } else {
        expect(input.type).toBe(type);
      }
    }
  });

  it('should render textarea', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input type="textarea" rows="5"></ld-input>`,
    });

    const textarea = page.root?.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();
    expect(textarea.rows).toBe(5);
  });

  // ==================== 尺寸测试 ====================

  it('should apply correct size classes', async () => {
    const sizes = ['small', 'medium', 'large'];
    
    for (const size of sizes) {
      const page = await newSpecPage({
        components: [Input],
        html: `<ld-input size="${size}"></ld-input>`,
      });

      const wrapper = page.root?.shadowRoot?.querySelector('.ld-input');
      expect(wrapper?.classList.contains(`ld-input--${size}`)).toBe(true);
    }
  });

  // ==================== 变体测试 ====================

  it('should apply correct variant classes', async () => {
    const variants = ['outlined', 'filled', 'borderless'];
    
    for (const variant of variants) {
      const page = await newSpecPage({
        components: [Input],
        html: `<ld-input variant="${variant}"></ld-input>`,
      });

      const wrapper = page.root?.shadowRoot?.querySelector('.ld-input');
      expect(wrapper?.classList.contains(`ld-input--${variant}`)).toBe(true);
    }
  });

  // ==================== 状态测试 ====================

  it('should handle disabled state', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input disabled></ld-input>`,
    });

    const input = page.root?.shadowRoot?.querySelector('input') as HTMLInputElement;
    const wrapper = page.root?.shadowRoot?.querySelector('.ld-input');
    
    expect(input.disabled).toBe(true);
    expect(wrapper?.classList.contains('ld-input--disabled')).toBe(true);
  });

  it('should handle readonly state', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input readonly></ld-input>`,
    });

    const input = page.root?.shadowRoot?.querySelector('input') as HTMLInputElement;
    const wrapper = page.root?.shadowRoot?.querySelector('.ld-input');
    
    expect(input.readOnly).toBe(true);
    expect(wrapper?.classList.contains('ld-input--readonly')).toBe(true);
  });

  it('should handle required state', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input required></ld-input>`,
    });

    const input = page.root?.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input.required).toBe(true);
  });

  // ==================== 状态样式测试 ====================

  it('should apply status classes', async () => {
    const statuses = ['success', 'warning', 'error', 'info'];
    
    for (const status of statuses) {
      const page = await newSpecPage({
        components: [Input],
        html: `<ld-input status="${status}"></ld-input>`,
      });

      const wrapper = page.root?.shadowRoot?.querySelector('.ld-input');
      expect(wrapper?.classList.contains(`ld-input--${status}`)).toBe(true);
    }
  });

  // ==================== 前后缀测试 ====================

  it('should render prefix icon', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input prefix-icon="search"></ld-input>`,
    });

    const prefix = page.root?.shadowRoot?.querySelector('.ld-input__prefix');
    const prefixIcon = page.root?.shadowRoot?.querySelector('.ld-input__prefix-icon');
    
    expect(prefix).toBeTruthy();
    expect(prefixIcon).toBeTruthy();
  });

  it('should render suffix icon', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input suffix-icon="close"></ld-input>`,
    });

    const suffix = page.root?.shadowRoot?.querySelector('.ld-input__suffix');
    const suffixIcon = page.root?.shadowRoot?.querySelector('.ld-input__suffix-icon');
    
    expect(suffix).toBeTruthy();
    expect(suffixIcon).toBeTruthy();
  });

  it('should render prefix text', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input prefix="https://"></ld-input>`,
    });

    const prefixText = page.root?.shadowRoot?.querySelector('.ld-input__prefix-text');
    expect(prefixText?.textContent).toBe('https://');
  });

  it('should render suffix text', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input suffix=".com"></ld-input>`,
    });

    const suffixText = page.root?.shadowRoot?.querySelector('.ld-input__suffix-text');
    expect(suffixText?.textContent).toBe('.com');
  });

  // ==================== 插件测试 ====================

  it('should render addon before', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input addon-before="http://"></ld-input>`,
    });

    const addonBefore = page.root?.shadowRoot?.querySelector('.ld-input__addon--before');
    expect(addonBefore?.textContent).toBe('http://');
  });

  it('should render addon after', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input addon-after=".com"></ld-input>`,
    });

    const addonAfter = page.root?.shadowRoot?.querySelector('.ld-input__addon--after');
    expect(addonAfter?.textContent).toBe('.com');
  });

  // ==================== 清空功能测试 ====================

  it('should render clear button when clearable and has value', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input clearable value="test"></ld-input>`,
    });

    const clearButton = page.root?.shadowRoot?.querySelector('.ld-input__clear');
    expect(clearButton).toBeTruthy();
  });

  it('should not render clear button when no value', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input clearable></ld-input>`,
    });

    const clearButton = page.root?.shadowRoot?.querySelector('.ld-input__clear');
    expect(clearButton).toBeFalsy();
  });

  it('should clear value when clear button clicked', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input clearable value="test"></ld-input>`,
    });

    const clearButton = page.root?.shadowRoot?.querySelector('.ld-input__clear') as HTMLButtonElement;
    const clearSpy = jest.fn();
    
    page.root?.addEventListener('ldClear', clearSpy);
    clearButton.click();

    expect(clearSpy).toHaveBeenCalled();
  });

  // ==================== 密码功能测试 ====================

  it('should render password toggle when show-password is true', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input type="password" show-password></ld-input>`,
    });

    const passwordToggle = page.root?.shadowRoot?.querySelector('.ld-input__password-toggle');
    expect(passwordToggle).toBeTruthy();
  });

  it('should toggle password visibility', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input type="password" show-password></ld-input>`,
    });

    const input = page.root?.shadowRoot?.querySelector('input') as HTMLInputElement;
    const passwordToggle = page.root?.shadowRoot?.querySelector('.ld-input__password-toggle') as HTMLButtonElement;
    
    expect(input.type).toBe('password');
    
    passwordToggle.click();
    await page.waitForChanges();
    
    expect(input.type).toBe('text');
  });

  // ==================== 字符计数测试 ====================

  it('should show character count when show-count is true', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input show-count maxlength="10" value="test"></ld-input>`,
    });

    const count = page.root?.shadowRoot?.querySelector('.ld-input__count');
    expect(count?.textContent).toBe('4/10');
  });

  // ==================== 事件测试 ====================

  it('should emit input event', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input></ld-input>`,
    });

    const input = page.root?.shadowRoot?.querySelector('input') as HTMLInputElement;
    const inputSpy = jest.fn();
    
    page.root?.addEventListener('ldInput', inputSpy);
    
    input.value = 'test';
    input.dispatchEvent(new Event('input'));

    expect(inputSpy).toHaveBeenCalled();
  });

  it('should emit change event', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input></ld-input>`,
    });

    const input = page.root?.shadowRoot?.querySelector('input') as HTMLInputElement;
    const changeSpy = jest.fn();
    
    page.root?.addEventListener('ldChange', changeSpy);
    
    input.value = 'test';
    input.dispatchEvent(new Event('change'));

    expect(changeSpy).toHaveBeenCalled();
  });

  it('should emit focus and blur events', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input></ld-input>`,
    });

    const input = page.root?.shadowRoot?.querySelector('input') as HTMLInputElement;
    const focusSpy = jest.fn();
    const blurSpy = jest.fn();
    
    page.root?.addEventListener('ldFocus', focusSpy);
    page.root?.addEventListener('ldBlur', blurSpy);
    
    input.dispatchEvent(new Event('focus'));
    input.dispatchEvent(new Event('blur'));

    expect(focusSpy).toHaveBeenCalled();
    expect(blurSpy).toHaveBeenCalled();
  });

  it('should emit enter event on Enter key', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input></ld-input>`,
    });

    const input = page.root?.shadowRoot?.querySelector('input') as HTMLInputElement;
    const enterSpy = jest.fn();
    
    page.root?.addEventListener('ldEnter', enterSpy);
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    input.dispatchEvent(enterEvent);

    expect(enterSpy).toHaveBeenCalled();
  });

  // ==================== 错误消息测试 ====================

  it('should render error message', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input error-message="This field is required"></ld-input>`,
    });

    const errorMessage = page.root?.shadowRoot?.querySelector('.ld-input__error');
    expect(errorMessage?.textContent).toBe('This field is required');
  });

  it('should render help text', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input help-text="Enter your email address"></ld-input>`,
    });

    const helpText = page.root?.shadowRoot?.querySelector('.ld-input__help');
    expect(helpText?.textContent).toBe('Enter your email address');
  });

  it('should hide help text when error message is present', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input help-text="Help text" error-message="Error message"></ld-input>`,
    });

    const helpText = page.root?.shadowRoot?.querySelector('.ld-input__help');
    const errorMessage = page.root?.shadowRoot?.querySelector('.ld-input__error');
    
    expect(helpText).toBeFalsy();
    expect(errorMessage).toBeTruthy();
  });

  // ==================== 可访问性测试 ====================

  it('should have correct ARIA attributes', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input error-message="Error"></ld-input>`,
    });

    const input = page.root?.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain('error');
  });

  it('should set correct input attributes', async () => {
    const page = await newSpecPage({
      components: [Input],
      html: `<ld-input name="email" maxlength="50" minlength="5" autocomplete="email"></ld-input>`,
    });

    const input = page.root?.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input.name).toBe('email');
    expect(input.maxLength).toBe(50);
    expect(input.minLength).toBe(5);
    expect(input.autocomplete).toBe('email');
  });
});
