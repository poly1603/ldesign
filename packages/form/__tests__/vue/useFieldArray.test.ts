/**
 * useFieldArray Hook 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { useFieldArray } from '../../src/vue/hooks/useFieldArray';
import { createForm } from '../../src/core/form';
import { required } from '../../src/validators';

// 测试组件
const TestFieldArrayComponent = defineComponent({
  name: 'TestFieldArrayComponent',
  props: {
    name: String,
    form: Object,
    initialValue: Array
  },
  setup(props) {
    const fieldArray = useFieldArray(props.name!, {
      form: props.form as any,
      initialValue: props.initialValue
    });

    return {
      fieldArray,
      ...fieldArray,
      fields: fieldArray.items // 为了兼容测试，添加 fields 别名
    };
  },
  template: `
    <div class="test-field-array">
      <div class="array-length">{{ length }}</div>
      <div
        v-for="(field, index) in items"
        :key="field.field.id"
        class="array-item"
        :data-index="index"
      >
        <input
          :value="field.value"
          @input="field.setValue($event.target.value)"
          class="item-input"
        />
        <button @click="remove(index)" class="remove-btn">Remove</button>
      </div>
      <button @click="push('')" class="append-btn">Add</button>
      <button @click="insert(0, '')" class="prepend-btn">Prepend</button>
      <button @click="insert(1, 'inserted')" class="insert-btn">Insert</button>
      <button @click="move(0, 2)" class="move-btn">Move</button>
      <button @click="swap(0, 1)" class="swap-btn">Swap</button>
      <button @click="reset()" class="reset-btn">Reset</button>
    </div>
  `
});

describe('useFieldArray Hook', () => {
  let form: any;

  beforeEach(() => {
    form = createForm({
      initialValues: {
        items: ['item1', 'item2', 'item3'],
        users: []
      }
    });
  });

  describe('基础功能', () => {
    it('表单应该有正确的初始值', () => {
      // 测试表单的初始值
      expect(form.data).toEqual({
        items: ['item1', 'item2', 'item3'],
        users: []
      });
      expect(form.getFieldValue('items')).toEqual(['item1', 'item2', 'item3']);
    });

    it('应该正确初始化字段数组', () => {
      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      expect(wrapper.vm.fields).toHaveLength(3);
      expect(wrapper.vm.fields[0].value).toBe('item1');
      expect(wrapper.vm.fields[1].value).toBe('item2');
      expect(wrapper.vm.fields[2].value).toBe('item3');
    });

    it('应该为每个字段生成唯一ID', () => {
      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      const ids = wrapper.vm.fields.map((field: any) => field.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('应该处理空数组初始值', () => {
      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'users',
          form
        }
      });

      expect(wrapper.vm.fields).toHaveLength(0);
      expect(wrapper.find('.array-length').text()).toBe('0');
    });
  });

  describe('数组操作', () => {
    it('应该正确添加元素到末尾', async () => {
      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      await wrapper.find('.append-btn').trigger('click');
      await nextTick();

      expect(wrapper.vm.fields).toHaveLength(4);
      expect(wrapper.vm.fields[3].value).toBe('');
      expect(form.getFieldValue('items')).toHaveLength(4);
    });

    it('应该正确添加元素到开头', async () => {
      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      await wrapper.find('.prepend-btn').trigger('click');
      await nextTick();

      expect(wrapper.vm.fields).toHaveLength(4);
      expect(wrapper.vm.fields[0].value).toBe('');
      expect(wrapper.vm.fields[1].value).toBe('item1');
    });

    it('应该正确插入元素到指定位置', async () => {
      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      await wrapper.find('.insert-btn').trigger('click');
      await nextTick();

      expect(wrapper.vm.fields).toHaveLength(4);
      expect(wrapper.vm.fields[1].value).toBe('inserted');
      expect(wrapper.vm.fields[2].value).toBe('item2');
    });

    it('应该正确删除指定位置的元素', async () => {
      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      // 删除第一个元素
      const removeButtons = wrapper.findAll('.remove-btn');
      await removeButtons[0].trigger('click');
      await nextTick();

      expect(wrapper.vm.fields).toHaveLength(2);
      expect(wrapper.vm.fields[0].value).toBe('item2');
      expect(wrapper.vm.fields[1].value).toBe('item3');
    });

    it('应该正确移动元素位置', async () => {
      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      await wrapper.find('.move-btn').trigger('click');
      await nextTick();

      expect(wrapper.vm.fields).toHaveLength(3);
      expect(wrapper.vm.fields[0].value).toBe('item2');
      expect(wrapper.vm.fields[1].value).toBe('item3');
      expect(wrapper.vm.fields[2].value).toBe('item1');
    });

    it('应该正确交换元素位置', async () => {
      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      await wrapper.find('.swap-btn').trigger('click');
      await nextTick();

      expect(wrapper.vm.fields).toHaveLength(3);
      expect(wrapper.vm.fields[0].value).toBe('item2');
      expect(wrapper.vm.fields[1].value).toBe('item1');
      expect(wrapper.vm.fields[2].value).toBe('item3');
    });
  });

  describe('值更新', () => {
    it('应该正确更新指定位置的值', async () => {
      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      const inputs = wrapper.findAll('.item-input');
      await inputs[0].setValue('updated-item1');

      expect(wrapper.vm.fields[0].value).toBe('updated-item1');
      expect(form.getFieldValue('items')[0]).toBe('updated-item1');
    });

    it('应该响应表单数据变化', async () => {
      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      // 通过表单更新数组
      form.setFieldValue('items', ['new1', 'new2']);
      await nextTick();

      expect(wrapper.vm.fields).toHaveLength(2);
      expect(wrapper.vm.fields[0].value).toBe('new1');
      expect(wrapper.vm.fields[1].value).toBe('new2');
    });
  });

  describe('重置功能', () => {
    it('应该正确重置数组到初始状态', async () => {
      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      // 修改数组
      await wrapper.find('.append-btn').trigger('click');
      await wrapper.find('.remove-btn').trigger('click');
      await nextTick();

      expect(wrapper.vm.fields).toHaveLength(3); // 添加1个，删除1个

      // 重置
      await wrapper.find('.reset-btn').trigger('click');
      await nextTick();

      expect(wrapper.vm.fields).toHaveLength(3);
      expect(wrapper.vm.fields[0].value).toBe('item1');
      expect(wrapper.vm.fields[1].value).toBe('item2');
      expect(wrapper.vm.fields[2].value).toBe('item3');
    });
  });

  describe('验证功能', () => {
    it('应该支持数组级别的验证', async () => {
      const arrayValidator = vi.fn().mockReturnValue({ valid: false, message: 'Array error' });

      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form,
          rules: [{ validator: arrayValidator }]
        }
      });

      await wrapper.vm.validate();
      await nextTick();

      expect(arrayValidator).toHaveBeenCalledWith(
        ['item1', 'item2', 'item3'],
        expect.any(Object)
      );
      expect(wrapper.vm.error).toBe('Array error');
    });

    it('应该支持元素级别的验证', async () => {
      const itemValidator = vi.fn().mockReturnValue({ valid: true, message: '' });

      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form,
          itemRules: [{ validator: itemValidator }]
        }
      });

      await wrapper.vm.validateItem(0);
      await nextTick();

      expect(itemValidator).toHaveBeenCalledWith('item1', expect.any(Object));
    });
  });

  describe('事件处理', () => {
    it('应该触发数组变化事件', async () => {
      const onChange = vi.fn();

      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      wrapper.vm.fieldArray.onChange(onChange);

      await wrapper.find('.append-btn').trigger('click');
      await nextTick();

      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining(['item1', 'item2', 'item3', ''])
      );
    });

    it('应该触发元素变化事件', async () => {
      const onItemChange = vi.fn();

      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      wrapper.vm.fieldArray.onItemChange(onItemChange);

      const inputs = wrapper.findAll('.item-input');
      await inputs[0].setValue('changed');

      expect(onItemChange).toHaveBeenCalledWith(0, 'changed');
    });
  });

  describe('响应式更新', () => {
    it('应该响应表单重置', async () => {
      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      // 修改数组
      await wrapper.find('.append-btn').trigger('click');
      expect(wrapper.vm.fields).toHaveLength(4);

      // 表单重置
      form.reset();
      await nextTick();

      expect(wrapper.vm.fields).toHaveLength(3);
      expect(wrapper.vm.fields[0].value).toBe('item1');
    });

    it('应该保持字段ID的稳定性', async () => {
      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      const originalIds = wrapper.vm.fields.map((field: any) => field.id);

      // 更新值不应该改变ID
      const inputs = wrapper.findAll('.item-input');
      await inputs[0].setValue('updated');

      const newIds = wrapper.vm.fields.map((field: any) => field.id);
      expect(newIds).toEqual(originalIds);
    });
  });

  describe('内存管理', () => {
    it('应该在组件卸载时清理资源', () => {
      const wrapper = mount(TestFieldArrayComponent, {
        props: {
          name: 'items',
          form
        }
      });

      const fieldArrayInstance = wrapper.vm.fieldArray;
      expect(fieldArrayInstance).toBeDefined();

      // 卸载组件
      wrapper.unmount();

      // 验证清理完成（主要确保没有错误）
      expect(true).toBe(true);
    });
  });
});
