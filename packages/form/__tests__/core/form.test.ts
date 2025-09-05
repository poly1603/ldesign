/**
 * 表单核心功能测试
 * 
 * @description
 * 测试表单实例的基本功能
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createForm } from '@/core/form';
import { FormState } from '@/types/core';
import { cleanup } from '../setup';

describe('Form Core', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Form Creation', () => {
    it('should create a form with default config', () => {
      const form = createForm();
      
      expect(form).toBeDefined();
      expect(form.id).toBeDefined();
      expect(form.config).toBeDefined();
      expect(form.data).toEqual({});
      expect(form.hasState(FormState.PRISTINE)).toBe(true);
      expect(form.destroyed).toBe(false);
    });

    it('should create a form with initial values', () => {
      const initialValues = { name: 'John', age: 30 };
      const form = createForm({ initialValues });
      
      expect(form.data).toEqual(initialValues);
      expect(form.getFieldValue('name')).toBe('John');
      expect(form.getFieldValue('age')).toBe(30);
    });

    it('should create a form with default values', () => {
      const defaultValues = { country: 'US', language: 'en' };
      const form = createForm({ defaultValues });
      
      expect(form.data).toEqual(defaultValues);
      expect(form.getFieldValue('country')).toBe('US');
      expect(form.getFieldValue('language')).toBe('en');
    });
  });

  describe('Field Value Operations', () => {
    let form: ReturnType<typeof createForm>;

    beforeEach(() => {
      form = createForm({ initialValues: { name: '', email: '' } });
    });

    it('should set and get field values', () => {
      form.setFieldValue('name', 'John Doe');
      expect(form.getFieldValue('name')).toBe('John Doe');
      
      form.setFieldValue('email', 'john@example.com');
      expect(form.getFieldValue('email')).toBe('john@example.com');
    });

    it('should set multiple values at once', () => {
      const values = { name: 'Jane Doe', email: 'jane@example.com' };
      form.setValues(values);
      
      expect(form.getValues()).toEqual(values);
    });

    it('should mark form as dirty when values change', () => {
      expect(form.hasState(FormState.PRISTINE)).toBe(true);
      expect(form.hasState(FormState.DIRTY)).toBe(false);
      
      form.setFieldValue('name', 'John');
      
      expect(form.hasState(FormState.PRISTINE)).toBe(false);
      expect(form.hasState(FormState.DIRTY)).toBe(true);
    });

    it('should reset form to initial values', () => {
      form.setFieldValue('name', 'John');
      form.setFieldValue('email', 'john@example.com');
      
      expect(form.hasState(FormState.DIRTY)).toBe(true);
      
      form.reset();
      
      expect(form.getValues()).toEqual({ name: '', email: '' });
      expect(form.hasState(FormState.PRISTINE)).toBe(true);
      expect(form.hasState(FormState.DIRTY)).toBe(false);
    });

    it('should reset form to custom values', () => {
      form.setFieldValue('name', 'John');
      
      const resetValues = { name: 'Jane', email: 'jane@example.com' };
      form.reset({ values: resetValues });
      
      expect(form.getValues()).toEqual(resetValues);
    });
  });

  describe('Field Management', () => {
    let form: ReturnType<typeof createForm>;

    beforeEach(() => {
      form = createForm();
    });

    it('should register and unregister fields', () => {
      const fieldConfig = {
        name: 'username',
        label: 'Username',
        defaultValue: ''
      };

      const field = form.registerField(fieldConfig);
      
      expect(field).toBeDefined();
      expect(form.hasField('username')).toBe(true);
      expect(form.getField('username')).toBe(field);
      
      form.unregisterField('username');
      
      expect(form.hasField('username')).toBe(false);
      expect(form.getField('username')).toBeUndefined();
    });

    it('should throw error when registering duplicate field', () => {
      const fieldConfig = {
        name: 'username',
        label: 'Username'
      };

      form.registerField(fieldConfig);
      
      expect(() => {
        form.registerField(fieldConfig);
      }).toThrow('Field "username" already exists');
    });
  });

  describe('Form State Management', () => {
    let form: ReturnType<typeof createForm>;

    beforeEach(() => {
      form = createForm();
    });

    it('should manage form states correctly', () => {
      expect(form.hasState(FormState.PRISTINE)).toBe(true);
      
      form.addState(FormState.VALID);
      expect(form.hasState(FormState.VALID)).toBe(true);
      
      form.removeState(FormState.PRISTINE);
      expect(form.hasState(FormState.PRISTINE)).toBe(false);
    });

    it('should create and restore snapshots', () => {
      form.setFieldValue('name', 'John');
      form.addState(FormState.VALID);
      
      const snapshot = form.getSnapshot();
      
      expect(snapshot.data).toEqual({ name: 'John' });
      expect(snapshot.state).toContain(FormState.VALID);
      expect(snapshot.timestamp).toBeDefined();
      
      // Modify form
      form.setFieldValue('name', 'Jane');
      form.removeState(FormState.VALID);
      
      // Restore snapshot
      form.restoreSnapshot(snapshot);
      
      expect(form.getFieldValue('name')).toBe('John');
      expect(form.hasState(FormState.VALID)).toBe(true);
    });
  });

  describe('Form Events', () => {
    let form: ReturnType<typeof createForm>;

    beforeEach(() => {
      form = createForm();
    });

    it('should emit change events', (done) => {
      form.onChange((event) => {
        expect(event.fieldName).toBe('name');
        expect(event.value).toBe('John');
        expect(event.type).toBe('change');
        done();
      });

      form.setFieldValue('name', 'John');
    });

    it('should emit reset events', (done) => {
      form.setFieldValue('name', 'John');
      
      form.onReset((event) => {
        expect(event.type).toBe('reset');
        done();
      });

      form.reset();
    });
  });

  describe('Form Validation', () => {
    let form: ReturnType<typeof createForm>;

    beforeEach(() => {
      form = createForm();
    });

    it('should validate form without fields', async () => {
      const results = await form.validate();
      expect(results).toEqual({});
      expect(form.hasState(FormState.VALID)).toBe(true);
    });

    it('should clear validation results', () => {
      form.clearValidation();
      expect(form.validation).toEqual({});
    });
  });

  describe('Form Submission', () => {
    let form: ReturnType<typeof createForm>;

    beforeEach(() => {
      form = createForm({ initialValues: { name: 'John', email: 'john@example.com' } });
    });

    it('should submit form successfully', async () => {
      const result = await form.submit();
      
      expect(result.data).toEqual({ name: 'John', email: 'john@example.com' });
      expect(result.valid).toBe(true);
      expect(form.hasState(FormState.SUBMITTED)).toBe(true);
    });

    it('should emit submit events', (done) => {
      form.onSubmit((event) => {
        expect(event.data).toEqual({ name: 'John', email: 'john@example.com' });
        expect(event.valid).toBe(true);
        done();
      });

      form.submit();
    });
  });

  describe('Form Lifecycle', () => {
    it('should destroy form properly', () => {
      const form = createForm();
      
      expect(form.destroyed).toBe(false);
      
      form.destroy();
      
      expect(form.destroyed).toBe(true);
      
      // Should throw error when trying to use destroyed form
      expect(() => {
        form.setFieldValue('name', 'John');
      }).toThrow('has been destroyed');
    });
  });
});
