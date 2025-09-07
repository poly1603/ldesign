/**
 * 表单控件交互行为测试
 * 
 * @description
 * 测试各种表单控件的交互行为，包括输入、选择、提交等操作
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Form } from '../src/core/form';
import { Field } from '../src/core/field';
import { FormConfig, FieldConfig, FormInstance, FieldInstance } from '../src/types/core';
import { required, email, length } from '../src/validators';

describe('表单控件交互行为', () => {
  let form: FormInstance;

  beforeEach(() => {
    const formConfig: FormConfig = {
      initialValues: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: 0,
        gender: '',
        hobbies: [],
        agreement: false
      }
    };
    form = new Form(formConfig);
  });

  describe('文本输入控件', () => {
    let usernameField: FieldInstance;

    beforeEach(() => {
      const fieldConfig: FieldConfig = {
        name: 'username',
        label: 'Username',
        rules: [
          { validator: required() },
          { validator: length({ min: 3, max: 20 }) }
        ]
      };
      usernameField = form.registerField(fieldConfig);
    });

    it('应该正确处理文本输入', () => {
      usernameField.setValue('testuser');

      expect(usernameField.value).toBe('testuser');
      expect(form.getFieldValue('username')).toBe('testuser');
    });

    it('应该触发输入验证', async () => {
      usernameField.setValue('ab'); // 太短

      const result = await usernameField.validate();
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Length');
    });

    it('应该处理空值输入', async () => {
      usernameField.setValue('');

      const result = await usernameField.validate();
      expect(result.valid).toBe(false);
      expect(result.message).toContain('required');
    });

    it('应该处理有效输入', async () => {
      usernameField.setValue('validuser');

      const result = await usernameField.validate();
      expect(result.valid).toBe(true);
    });
  });

  describe('邮箱输入控件', () => {
    let emailField: FieldInstance;

    beforeEach(() => {
      const fieldConfig: FieldConfig = {
        name: 'email',
        label: 'Email',
        rules: [
          { validator: required() },
          { validator: email() }
        ]
      };
      emailField = form.registerField(fieldConfig);
    });

    it('应该验证邮箱格式', async () => {
      emailField.setValue('invalid-email');

      const result = await emailField.validate();
      expect(result.valid).toBe(false);
      expect(result.message).toContain('email');
    });

    it('应该接受有效邮箱', async () => {
      emailField.setValue('test@example.com');

      const result = await emailField.validate();
      expect(result.valid).toBe(true);
    });
  });

  describe('密码输入控件', () => {
    let passwordField: FieldInstance;
    let confirmPasswordField: FieldInstance;

    beforeEach(() => {
      const passwordConfig: FieldConfig = {
        name: 'password',
        label: 'Password',
        rules: [
          { validator: required() },
          { validator: length({ min: 6 }) }
        ]
      };
      passwordField = form.registerField(passwordConfig);

      const confirmConfig: FieldConfig = {
        name: 'confirmPassword',
        label: 'Confirm Password',
        rules: [
          { validator: required() },
          {
            validator: (value: string) => {
              const password = form.getFieldValue('password');
              if (value !== password) {
                return { valid: false, message: 'Passwords do not match' };
              }
              return { valid: true, message: '' };
            }
          }
        ]
      };
      confirmPasswordField = form.registerField(confirmConfig);
    });

    it('应该验证密码长度', async () => {
      passwordField.setValue('123');

      const result = await passwordField.validate();
      expect(result.valid).toBe(false);
      expect(result.message).toContain('length');
    });

    it('应该验证密码确认匹配', async () => {
      passwordField.setValue('password123');
      confirmPasswordField.setValue('password456');

      const result = await confirmPasswordField.validate();
      expect(result.valid).toBe(false);
      expect(result.message).toContain('do not match');
    });

    it('应该接受匹配的密码', async () => {
      passwordField.setValue('password123');
      confirmPasswordField.setValue('password123');

      const result = await confirmPasswordField.validate();
      expect(result.valid).toBe(true);
    });
  });

  describe('数字输入控件', () => {
    let ageField: FieldInstance;

    beforeEach(() => {
      const fieldConfig: FieldConfig = {
        name: 'age',
        label: 'Age',
        rules: [
          { validator: required() },
          {
            validator: (value: number) => {
              if (typeof value !== 'number' || value < 0 || value > 120) {
                return { valid: false, message: 'Age must be between 0 and 120' };
              }
              return { valid: true, message: '' };
            }
          }
        ]
      };
      ageField = form.registerField(fieldConfig);
    });

    it('应该处理数字输入', () => {
      ageField.setValue(25);

      expect(ageField.value).toBe(25);
      expect(typeof ageField.value).toBe('number');
    });

    it('应该验证数字范围', async () => {
      ageField.setValue(150);

      const result = await ageField.validate();
      expect(result.valid).toBe(false);
      expect(result.message).toContain('between 0 and 120');
    });

    it('应该处理字符串数字转换', () => {
      ageField.setValue('30' as any);

      expect(ageField.value).toBe('30');
    });
  });

  describe('选择控件', () => {
    let genderField: FieldInstance;

    beforeEach(() => {
      const fieldConfig: FieldConfig = {
        name: 'gender',
        label: 'Gender',
        rules: [{ validator: required() }]
      };
      genderField = form.registerField(fieldConfig);
    });

    it('应该处理单选值', () => {
      genderField.setValue('male');

      expect(genderField.value).toBe('male');
    });

    it('应该验证必选项', async () => {
      genderField.setValue('');

      const result = await genderField.validate();
      expect(result.valid).toBe(false);
      expect(result.message).toContain('required');
    });
  });

  describe('多选控件', () => {
    let hobbiesField: FieldInstance;

    beforeEach(() => {
      const fieldConfig: FieldConfig = {
        name: 'hobbies',
        label: 'Hobbies',
        rules: [
          {
            validator: (value: string[]) => {
              if (!Array.isArray(value) || value.length === 0) {
                return { valid: false, message: 'Please select at least one hobby' };
              }
              return { valid: true, message: '' };
            }
          }
        ]
      };
      hobbiesField = form.registerField(fieldConfig);
    });

    it('应该处理数组值', () => {
      hobbiesField.setValue(['reading', 'swimming']);

      expect(hobbiesField.value).toEqual(['reading', 'swimming']);
      expect(Array.isArray(hobbiesField.value)).toBe(true);
    });

    it('应该验证至少选择一项', async () => {
      hobbiesField.setValue([]);

      const result = await hobbiesField.validate();
      expect(result.valid).toBe(false);
      expect(result.message).toContain('at least one');
    });

    it('应该处理添加和删除选项', () => {
      hobbiesField.setValue(['reading']);
      expect(hobbiesField.value).toEqual(['reading']);

      hobbiesField.setValue(['reading', 'swimming']);
      expect(hobbiesField.value).toEqual(['reading', 'swimming']);

      hobbiesField.setValue(['swimming']);
      expect(hobbiesField.value).toEqual(['swimming']);
    });
  });

  describe('复选框控件', () => {
    let agreementField: FieldInstance;

    beforeEach(() => {
      const fieldConfig: FieldConfig = {
        name: 'agreement',
        label: 'Agreement',
        rules: [
          {
            validator: (value: boolean) => {
              if (!value) {
                return { valid: false, message: 'You must agree to the terms' };
              }
              return { valid: true, message: '' };
            }
          }
        ]
      };
      agreementField = form.registerField(fieldConfig);
    });

    it('应该处理布尔值', () => {
      agreementField.setValue(true);

      expect(agreementField.value).toBe(true);
      expect(typeof agreementField.value).toBe('boolean');
    });

    it('应该验证必须勾选', async () => {
      agreementField.setValue(false);

      const result = await agreementField.validate();
      expect(result.valid).toBe(false);
      expect(result.message).toContain('must agree');
    });
  });

  describe('表单提交行为', () => {
    beforeEach(() => {
      // 注册所有字段
      form.registerField({ name: 'username', label: 'Username', rules: [{ validator: required() }] });
      form.registerField({ name: 'email', label: 'Email', rules: [{ validator: required() }, { validator: email() }] });
      form.registerField({ name: 'password', label: 'Password', rules: [{ validator: required() }] });
    });

    it('应该验证整个表单', async () => {
      form.setFieldValue('username', '');
      form.setFieldValue('email', 'invalid-email');
      form.setFieldValue('password', '');

      const result = await form.validate();

      expect(Object.keys(result)).toHaveLength(3);
      expect(result.username.valid).toBe(false);
      expect(result.email.valid).toBe(false);
      expect(result.password.valid).toBe(false);
    });

    it('应该在所有字段有效时通过验证', async () => {
      form.setFieldValue('username', 'testuser');
      form.setFieldValue('email', 'test@example.com');
      form.setFieldValue('password', 'password123');

      const result = await form.validate();

      expect(result.username.valid).toBe(true);
      expect(result.email.valid).toBe(true);
      expect(result.password.valid).toBe(true);
    });

    it('应该触发提交事件', async () => {
      const submitHandler = vi.fn();
      form.onSubmit(submitHandler);

      await form.submit();

      expect(submitHandler).toHaveBeenCalledWith({
        data: form.data,
        valid: expect.any(Boolean),
        validation: expect.any(Object)
      });
    });

    it('应该在提交前验证表单', async () => {
      form.setFieldValue('username', '');

      const submitHandler = vi.fn();
      form.onSubmit(submitHandler);

      await form.submit();

      expect(submitHandler).toHaveBeenCalledWith({
        data: form.data,
        valid: false,
        validation: expect.any(Object)
      });
    });
  });

  describe('表单重置行为', () => {
    beforeEach(() => {
      form.registerField({ name: 'username', label: 'Username' });
      form.registerField({ name: 'email', label: 'Email' });
    });

    it('应该重置所有字段值', () => {
      form.setFieldValue('username', 'changed');
      form.setFieldValue('email', 'changed@example.com');

      form.reset();

      expect(form.getFieldValue('username')).toBe('');
      expect(form.getFieldValue('email')).toBe('');
    });

    it('应该清除验证状态', async () => {
      const usernameField = form.getField('username');
      if (usernameField) {
        await usernameField.validate({ rules: [{ validator: required() }] });
        expect(usernameField.validation?.valid).toBe(false);

        form.reset();

        expect(usernameField.validation).toBeNull();
      }
    });

    it('应该触发重置事件', () => {
      const resetHandler = vi.fn();
      form.onReset(resetHandler);

      form.reset();

      expect(resetHandler).toHaveBeenCalled();
    });
  });
});
