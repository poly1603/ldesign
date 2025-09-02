import { newSpecPage } from '@stencil/core/testing';
import { Form } from './form';

describe('ld-form', () => {
  const mockModel = {
    username: 'test',
    email: 'test@example.com',
    age: 25,
  };

  const mockRules = {
    username: [
      { required: true, message: '用户名是必填项' },
      { min: 3, max: 20, message: '用户名长度应在3-20个字符之间' },
    ],
    email: [
      { required: true, message: '邮箱是必填项' },
      { type: 'email', message: '请输入有效的邮箱地址' },
    ],
    age: [
      { required: true, message: '年龄是必填项' },
      { type: 'number', message: '年龄必须是数字' },
    ],
  };

  it('renders', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form></ld-form>`,
    });
    expect(page.root).toEqualHtml(`
      <ld-form>
        <mock:shadow-root>
          <form class="ld-form ld-form--horizontal ld-form--medium ld-form--label-right" id="form-1">
            <slot></slot>
          </form>
        </mock:shadow-root>
      </ld-form>
    `);
  });

  it('renders with model and rules', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form></ld-form>`,
    });

    const form = page.root as any;
    form.model = mockModel;
    form.rules = mockRules;
    await page.waitForChanges();

    expect(form.model).toEqual(mockModel);
    expect(form.rules).toEqual(mockRules);
  });

  it('supports different layouts', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form layout="vertical"></ld-form>`,
    });

    const form = page.root as any;
    expect(form.layout).toBe('vertical');

    form.layout = 'inline';
    await page.waitForChanges();
    expect(form.layout).toBe('inline');
  });

  it('supports different label alignments', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form label-align="left"></ld-form>`,
    });

    const form = page.root as any;
    expect(form.labelAlign).toBe('left');

    form.labelAlign = 'top';
    await page.waitForChanges();
    expect(form.labelAlign).toBe('top');
  });

  it('supports custom label width', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form label-width="120"></ld-form>`,
    });

    const form = page.root as any;
    expect(form.labelWidth).toBe('120');
  });

  it('supports different sizes', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form size="large"></ld-form>`,
    });

    const form = page.root as any;
    expect(form.size).toBe('large');

    form.size = 'small';
    await page.waitForChanges();
    expect(form.size).toBe('small');
  });

  it('supports disabled state', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form disabled="true"></ld-form>`,
    });

    const form = page.root as any;
    expect(form.disabled).toBe(true);
  });

  it('supports readonly state', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form readonly="true"></ld-form>`,
    });

    const form = page.root as any;
    expect(form.readonly).toBe(true);
  });

  it('supports show required mark', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form show-required-mark="false"></ld-form>`,
    });

    const form = page.root as any;
    expect(form.showRequiredMark).toBe(false);
  });

  it('supports show validate icon', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form show-validate-icon="false"></ld-form>`,
    });

    const form = page.root as any;
    expect(form.showValidateIcon).toBe(false);
  });

  it('supports different validate triggers', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form validate-trigger="blur"></ld-form>`,
    });

    const form = page.root as any;
    expect(form.validateTrigger).toBe('blur');

    form.validateTrigger = 'submit';
    await page.waitForChanges();
    expect(form.validateTrigger).toBe('submit');
  });

  it('supports scroll to error', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form scroll-to-error="false"></ld-form>`,
    });

    const form = page.root as any;
    expect(form.scrollToError).toBe(false);
  });

  it('supports custom class', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form custom-class="my-form"></ld-form>`,
    });

    const form = page.root as any;
    expect(form.customClass).toBe('my-form');
  });

  it('emits events correctly', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form></ld-form>`,
    });

    const form = page.root as any;
    const submitSpy = jest.fn();
    const resetSpy = jest.fn();
    const validateSpy = jest.fn();
    const fieldChangeSpy = jest.fn();

    form.addEventListener('ldSubmit', submitSpy);
    form.addEventListener('ldReset', resetSpy);
    form.addEventListener('ldValidate', validateSpy);
    form.addEventListener('ldFieldChange', fieldChangeSpy);

    // 设置数据以便测试事件
    form.model = mockModel;
    form.rules = mockRules;
    await page.waitForChanges();

    expect(submitSpy).not.toHaveBeenCalled();
    expect(resetSpy).not.toHaveBeenCalled();
    expect(validateSpy).not.toHaveBeenCalled();
    expect(fieldChangeSpy).not.toHaveBeenCalled();
  });

  it('handles model changes correctly', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form></ld-form>`,
    });

    const form = page.root as any;
    form.model = mockModel;
    form.rules = mockRules;
    await page.waitForChanges();

    // 更改模型
    const newModel = { ...mockModel, username: 'newuser' };
    form.model = newModel;
    await page.waitForChanges();

    expect(form.model).toEqual(newModel);
  });

  it('handles rules changes correctly', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form></ld-form>`,
    });

    const form = page.root as any;
    form.model = mockModel;
    form.rules = mockRules;
    await page.waitForChanges();

    // 更改规则
    const newRules = { ...mockRules, password: [{ required: true }] };
    form.rules = newRules;
    await page.waitForChanges();

    expect(form.rules).toEqual(newRules);
  });

  it('has correct default values', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form></ld-form>`,
    });

    const form = page.root as any;
    expect(form.model).toEqual({});
    expect(form.rules).toEqual({});
    expect(form.layout).toBe('horizontal');
    expect(form.labelAlign).toBe('right');
    expect(form.size).toBe('medium');
    expect(form.disabled).toBe(false);
    expect(form.readonly).toBe(false);
    expect(form.showRequiredMark).toBe(true);
    expect(form.showValidateIcon).toBe(true);
    expect(form.validateTrigger).toBe('change');
    expect(form.scrollToError).toBe(true);
  });

  it('calls form methods correctly', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form></ld-form>`,
    });

    const form = page.root as any;
    form.model = mockModel;
    form.rules = mockRules;
    await page.waitForChanges();

    // 测试验证方法
    const validateResult = await form.validate();
    expect(validateResult).toBeDefined();
    expect(validateResult.valid).toBeDefined();

    // 测试清除验证方法
    await form.clearValidate();

    // 测试重置表单方法
    await form.resetForm();

    // 测试提交表单方法
    await form.submitForm();

    // 测试设置字段值方法
    await form.setFieldValue('username', 'newvalue');

    // 测试获取字段值方法
    const fieldValue = await form.getFieldValue('username');
    expect(fieldValue).toBeDefined();

    // 测试设置表单数据方法
    await form.setFormData({ test: 'value' });

    // 测试获取表单数据方法
    const formData = await form.getFormData();
    expect(formData).toBeDefined();
  });

  it('handles form item registration correctly', async () => {
    const page = await newSpecPage({
      components: [Form],
      html: `<ld-form></ld-form>`,
    });

    const form = page.root as any;

    // 测试注册表单项
    await form.registerFormItem('test', {
      element: document.createElement('div'),
      prop: 'test',
    });

    // 测试注销表单项
    await form.unregisterFormItem('test');
  });
});
