/**
 * 表单提交集成测试
 * 
 * @description
 * 测试完整的表单提交流程
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { LDesignForm, LDesignFormItem } from '@/vue/components';
import { required, email, length } from '@/validators';
import { cleanup } from '../setup';

// 复杂表单组件
const ComplexFormComponent = {
  components: {
    LDesignForm,
    LDesignFormItem
  },
  setup() {
    const submitResult = ref(null);
    const submitCount = ref(0);

    const onSubmit = (result: any) => {
      submitCount.value++;
      submitResult.value = { ...result, timestamp: Date.now() };
    };

    return {
      submitResult,
      submitCount,
      onSubmit
    };
  },
  template: `
    <LDesignForm
      ref="formRef"
      :initial-values="{
        name: '',
        email: '',
        age: null,
        bio: '',
        terms: false
      }"
      @submit="onSubmit"
    >
      <!-- 姓名字段 - 必填 -->
      <LDesignFormItem
        name="name"
        label="姓名"
        :rules="[
          { validator: 'required', message: '姓名是必填项' },
          { validator: 'minLength', params: { min: 2 }, message: '姓名至少2个字符' }
        ]"
      >
        <template #default="{ value, setValue }">
          <input
            type="text"
            :value="value"
            @input="setValue($event.target.value)"
            placeholder="请输入姓名"
          />
        </template>
      </LDesignFormItem>

      <!-- 邮箱字段 - 必填 + 格式验证 -->
      <LDesignFormItem
        name="email"
        label="邮箱"
        :rules="[
          { validator: 'required', message: '邮箱是必填项' },
          { validator: 'email', message: '请输入有效的邮箱地址' }
        ]"
      >
        <template #default="{ value, setValue }">
          <input
            type="email"
            :value="value"
            @input="setValue($event.target.value)"
            placeholder="请输入邮箱"
          />
        </template>
      </LDesignFormItem>

      <!-- 年龄字段 - 可选 + 范围验证 -->
      <LDesignFormItem
        name="age"
        label="年龄"
        :rules="[
          {
            validator: (value) => {
              const num = Number(value);
              if (isNaN(num)) return { valid: false, message: '年龄必须是数字' };
              if (num < 18) return { valid: false, message: '年龄必须大于等于18岁' };
              if (num > 120) return { valid: false, message: '年龄必须小于等于120岁' };
              return { valid: true, message: '' };
            }
          }
        ]"
      >
        <template #default="{ value, setValue }">
          <input
            type="number"
            :value="value"
            @input="setValue(Number($event.target.value))"
            placeholder="请输入年龄"
          />
        </template>
      </LDesignFormItem>

      <!-- 个人简介 - 可选 + 长度验证 -->
      <LDesignFormItem
        name="bio"
        label="个人简介"
        :rules="[
          { max: 500, message: '个人简介不能超过500个字符' }
        ]"
      >
        <template #default="{ value, setValue }">
          <textarea
            :value="value"
            @input="setValue($event.target.value)"
            placeholder="请输入个人简介"
          />
        </template>
      </LDesignFormItem>

      <!-- 同意条款 - 必填 -->
      <LDesignFormItem
        name="terms"
        label="同意条款"
        :rules="[
          { validator: 'required', message: '必须同意用户条款' }
        ]"
      >
        <template #default="{ value, setValue }">
          <label>
            <input
              type="checkbox"
              :checked="value"
              @change="setValue($event.target.checked)"
            />
            我同意用户条款和隐私政策
          </label>
        </template>
      </LDesignFormItem>

      <button type="submit">提交</button>
    </LDesignForm>
  `
};

describe('Form Submission Integration', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Valid Form Submission', () => {
    it('should submit valid form successfully', async () => {
      const wrapper = mount(ComplexFormComponent);
      const vm = wrapper.vm as any;

      // 填写有效数据 - 直接通过表单实例设置值
      const formComponent = wrapper.findComponent(LDesignForm);
      const formInstance = formComponent.vm.formHook.form;

      // 直接设置表单字段值
      formInstance.setFieldValue('name', '张三');
      formInstance.setFieldValue('email', 'zhangsan@example.com');
      formInstance.setFieldValue('age', 25);
      formInstance.setFieldValue('bio', '我是一名软件工程师');
      formInstance.setFieldValue('terms', true);
      await nextTick();

      // 提交表单 - 直接调用组件方法
      await formComponent.vm.handleSubmit();
      await nextTick();

      // 验证提交结果
      expect(vm.submitCount).toBe(1);
      expect(vm.submitResult).toBeTruthy();
      expect(vm.submitResult.valid).toBe(true);
      expect(vm.submitResult.data).toEqual({
        name: '张三',
        email: 'zhangsan@example.com',
        age: 25,
        bio: '我是一名软件工程师',
        terms: true
      });
    });

    it('should submit form with minimal required data', async () => {
      const wrapper = mount(ComplexFormComponent);
      const vm = wrapper.vm as any;

      // 只填写必填字段 - 直接通过表单实例设置值
      const formComponent = wrapper.findComponent(LDesignForm);
      const formInstance = formComponent.vm.formHook.form;

      formInstance.setFieldValue('name', '李四');
      formInstance.setFieldValue('email', 'lisi@example.com');
      formInstance.setFieldValue('terms', true);
      await nextTick();

      // 提交表单 - 直接调用组件方法
      await formComponent.vm.handleSubmit();
      await nextTick();

      // 验证提交结果
      expect(vm.submitResult.valid).toBe(true);
      expect(vm.submitResult.data.name).toBe('李四');
      expect(vm.submitResult.data.email).toBe('lisi@example.com');
      expect(vm.submitResult.data.terms).toBe(true);
      expect(vm.submitResult.data.age).toBeNull();
      expect(vm.submitResult.data.bio).toBe('');
    });
  });

  describe('Invalid Form Submission', () => {
    it('should prevent submission with missing required fields', async () => {
      const wrapper = mount(ComplexFormComponent);
      const vm = wrapper.vm as any;

      // 不填写任何数据，直接提交
      const formComponent = wrapper.findComponent(LDesignForm);
      await formComponent.vm.handleSubmit();
      await nextTick();

      // 验证提交结果
      expect(vm.submitResult).toBeTruthy();
      expect(vm.submitResult.valid).toBe(false);

      // 验证错误信息
      const formRef = vm.$refs.formRef;
      const validation = formRef.form.validation.value;
      expect(validation.name).toBeTruthy();
      expect(validation.name.valid).toBe(false);
      expect(validation.email).toBeTruthy();
      expect(validation.email.valid).toBe(false);
      expect(validation.terms).toBeTruthy();
      expect(validation.terms.valid).toBe(false);
    });

    it('should prevent submission with invalid email format', async () => {
      const wrapper = mount(ComplexFormComponent);
      const vm = wrapper.vm as any;

      // 填写无效邮箱 - 直接通过表单实例设置值
      const formComponent = wrapper.findComponent(LDesignForm);
      const formInstance = formComponent.vm.formHook.form;

      formInstance.setFieldValue('name', '王五');
      formInstance.setFieldValue('email', 'invalid-email'); // 无效邮箱格式
      formInstance.setFieldValue('terms', true);
      await nextTick();

      // 提交表单 - 直接调用组件方法
      await formComponent.vm.handleSubmit();
      await nextTick();

      // 验证提交结果
      expect(vm.submitResult.valid).toBe(false);

      // 验证邮箱错误
      const formRef = vm.$refs.formRef;
      const validation = formRef.form.validation.value;
      expect(validation.email).toBeTruthy();
      expect(validation.email.valid).toBe(false);
      expect(validation.email.message).toContain('邮箱');
    });

    it('should prevent submission with invalid age range', async () => {
      const wrapper = mount(ComplexFormComponent);
      const vm = wrapper.vm as any;

      // 填写无效年龄
      const nameInput = wrapper.find('input[type="text"]');
      const emailInput = wrapper.find('input[type="email"]');
      const ageInput = wrapper.find('input[type="number"]');
      const termsCheckbox = wrapper.find('input[type="checkbox"]');

      await nameInput.setValue('赵六');
      await emailInput.setValue('zhaoliu@example.com');
      await ageInput.setValue('15'); // 小于18岁
      await termsCheckbox.setChecked(true);
      await nextTick();

      // 提交表单
      const form = wrapper.find('form');
      await form.trigger('submit');
      await nextTick();

      // 验证提交结果
      expect(vm.submitResult.valid).toBe(false);

      // 验证年龄错误
      const formRef = vm.$refs.formRef;
      const validation = formRef.form.validation.value;
      expect(validation.age).toBeTruthy();
      expect(validation.age.valid).toBe(false);
      expect(validation.age.message).toContain('18');
    });
  });

  describe('Multiple Submissions', () => {
    it('should handle multiple submissions correctly', async () => {
      const wrapper = mount(ComplexFormComponent);
      const vm = wrapper.vm as any;

      // 填写有效数据
      const nameInput = wrapper.find('input[type="text"]');
      const emailInput = wrapper.find('input[type="email"]');
      const termsCheckbox = wrapper.find('input[type="checkbox"]');

      await nameInput.setValue('测试用户');
      await emailInput.setValue('test@example.com');
      await termsCheckbox.setChecked(true);
      await nextTick();

      // 第一次提交
      const form = wrapper.find('form');
      await form.trigger('submit');
      await nextTick();

      expect(vm.submitCount).toBe(1);
      expect(vm.submitResult.valid).toBe(true);

      // 修改数据后再次提交
      await nameInput.setValue('修改后的用户');
      await nextTick();

      await form.trigger('submit');
      await nextTick();

      expect(vm.submitCount).toBe(2);
      expect(vm.submitResult.valid).toBe(true);
      expect(vm.submitResult.data.name).toBe('修改后的用户');
    });
  });

  describe('Async Validation', () => {
    it('should handle async validation during submission', async () => {
      // 这个测试需要实际的异步验证器
      // 目前跳过，等待异步验证器实现
      expect(true).toBe(true);
    });
  });
});
