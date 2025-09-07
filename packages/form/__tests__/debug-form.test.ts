/**
 * 调试表单提交问题
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { LDesignForm, LDesignFormItem } from '@/vue/components';
import { cleanup } from './setup';

describe('Debug Form Submission', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it('should test form instance directly', async () => {
    const { createForm } = await import('@/core/form');

    const form = createForm({
      initialValues: { name: '' }
    });

    console.log('Form created:', form.id);
    console.log('Initial values:', form.getValues());

    // 注册字段
    const field = form.registerField({
      name: 'name',
      required: true
    });

    console.log('Field registered:', field.name);

    // 设置值
    field.setValue('测试用户');
    console.log('After setting value:', form.getValues());

    // 提交表单
    const result = await form.submit();
    console.log('Submit result:', result);

    expect(result.valid).toBe(true);
    expect(result.data.name).toBe('测试用户');
  });

  it('should render form correctly', async () => {
    const wrapper = mount({
      components: {
        LDesignForm,
        LDesignFormItem
      },
      setup() {
        const submitResult = ref(null);
        const submitCount = ref(0);

        const onSubmit = (result: any) => {
          console.log('onSubmit called with:', result);
          submitCount.value++;
          submitResult.value = result;
        };

        return {
          submitResult,
          submitCount,
          onSubmit
        };
      },
      template: `
        <LDesignForm
          :initial-values="{ name: '' }"
          @submit="onSubmit"
        >
          <LDesignFormItem
            name="name"
            label="姓名"
          >
            <template #default="{ value, setValue }">
              <input
                type="text"
                :value="value"
                @input="setValue($event.target.value)"
                data-testid="name-input"
              />
            </template>
          </LDesignFormItem>
          <button type="submit" data-testid="submit-btn">提交</button>
        </LDesignForm>
      `
    });

    await nextTick();

    // 检查表单是否正确渲染
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('[data-testid="name-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="submit-btn"]').exists()).toBe(true);

    const vm = wrapper.vm as any;
    console.log('Initial state:', {
      submitCount: vm.submitCount,
      submitResult: vm.submitResult
    });

    // 设置输入值
    const nameInput = wrapper.find('[data-testid="name-input"]');
    await nameInput.setValue('测试用户');
    await nextTick();

    console.log('After setting value');

    // 提交表单
    const form = wrapper.find('form');
    await form.trigger('submit');
    await nextTick();

    console.log('After form submit:', {
      submitCount: vm.submitCount,
      submitResult: vm.submitResult
    });

    // 验证提交结果
    expect(vm.submitCount).toBe(1);
    expect(vm.submitResult).toBeTruthy();
  });
});
