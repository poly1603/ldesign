/**
 * @ldesign/form Vanilla JS适配器测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { VanillaForm } from '../../../src/adapters/vanilla/classes/VanillaForm'
import type { FormConfig } from '../../../src/types/core'

describe('Vanilla JS适配器', () => {
  let container: HTMLElement
  let form: VanillaForm

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.style.width = '800px'
    document.body.appendChild(container)
  })

  afterEach(() => {
    // 清理
    if (form) {
      form.destroy()
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('VanillaForm', () => {
    it('应该正确初始化表单', () => {
      const config: FormConfig = {
        fields: [
          { name: 'name', label: '姓名', type: 'input' },
          { name: 'age', label: '年龄', type: 'number' }
        ]
      }

      form = new VanillaForm(container, config)

      // 检查DOM结构
      expect(container.querySelector('.ldesign-form')).toBeTruthy()
      expect(container.querySelector('.ldesign-form-content')).toBeTruthy()
      expect(container.querySelectorAll('.ldesign-form-item')).toHaveLength(2)
    })

    it('应该正确渲染字段', () => {
      const config: FormConfig = {
        fields: [
          { name: 'name', label: '姓名', type: 'input', placeholder: '请输入姓名' },
          { name: 'email', label: '邮箱', type: 'input' },
          { name: 'age', label: '年龄', type: 'number', min: 0, max: 120 },
          { name: 'bio', label: '简介', type: 'textarea', rows: 3 }
        ]
      }

      form = new VanillaForm(container, config)

      // 检查输入框
      const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(nameInput).toBeTruthy()
      expect(nameInput.placeholder).toBe('请输入姓名')

      // 检查数字输入框
      const ageInput = container.querySelector('input[type="number"]') as HTMLInputElement
      expect(ageInput).toBeTruthy()
      expect(ageInput.min).toBe('0')
      expect(ageInput.max).toBe('120')

      // 检查文本域
      const bioTextarea = container.querySelector('textarea') as HTMLTextAreaElement
      expect(bioTextarea).toBeTruthy()
      expect(bioTextarea.rows).toBe(3)
    })

    it('应该正确处理字段值变化', () => {
      const config: FormConfig = {
        fields: [
          { name: 'name', label: '姓名', type: 'input' }
        ]
      }

      const onChange = vi.fn()
      form = new VanillaForm(container, config)
      form.on('change', onChange)

      // 设置字段值
      form.setFieldValue('name', 'Alice')

      expect(form.getFieldValue('name')).toBe('Alice')
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            values: { name: 'Alice' },
            fieldName: 'name',
            fieldValue: 'Alice'
          })
        })
      )
    })

    it('应该正确处理表单验证', async () => {
      const config: FormConfig = {
        fields: [
          {
            name: 'email',
            label: '邮箱',
            type: 'input',
            rules: [
              { type: 'required', message: '邮箱不能为空' },
              { type: 'pattern', value: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$', message: '邮箱格式不正确' }
            ]
          }
        ]
      }

      form = new VanillaForm(container, config)

      // 验证空值
      const valid1 = await form.validateField('email')
      expect(valid1).toBe(false)

      // 验证无效邮箱
      form.setFieldValue('email', 'invalid-email')
      const valid2 = await form.validateField('email')
      expect(valid2).toBe(false)

      // 验证有效邮箱
      form.setFieldValue('email', 'test@example.com')
      const valid3 = await form.validateField('email')
      expect(valid3).toBe(true)
    })

    it('应该正确处理表单提交', async () => {
      const config: FormConfig = {
        fields: [
          { name: 'name', label: '姓名', type: 'input', rules: [{ type: 'required' }] }
        ],
        buttons: {
          submit: true,
          submitText: '提交'
        }
      }

      const onSubmit = vi.fn()
      form = new VanillaForm(container, config)
      form.on('submit', onSubmit)

      // 提交无效表单
      const result1 = await form.submit()
      expect(result1).toBe(false)
      expect(onSubmit).not.toHaveBeenCalled()

      // 设置有效值后提交
      form.setFieldValue('name', 'Alice')
      const result2 = await form.submit()
      expect(result2).toBe(true)
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            values: { name: 'Alice' }
          })
        })
      )
    })

    it('应该正确处理表单重置', () => {
      const config: FormConfig = {
        fields: [
          { name: 'name', label: '姓名', type: 'input', defaultValue: 'John' }
        ]
      }

      const onReset = vi.fn()
      form = new VanillaForm(container, config)
      form.on('reset', onReset)

      // 修改值
      form.setFieldValue('name', 'Alice')
      expect(form.getFieldValue('name')).toBe('Alice')

      // 重置
      form.reset()
      expect(form.getFieldValue('name')).toBe('John')
      expect(onReset).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            values: { name: 'John' }
          })
        })
      )
    })

    it('应该正确处理展开/收起功能', () => {
      const config: FormConfig = {
        fields: [
          { name: 'field1', label: '字段1', type: 'input' },
          { name: 'field2', label: '字段2', type: 'input' },
          { name: 'field3', label: '字段3', type: 'input' },
          { name: 'field4', label: '字段4', type: 'input' },
          { name: 'field5', label: '字段5', type: 'input' }
        ],
        layout: {
          columns: 4,
          previewRows: 1
        }
      }

      const onExpand = vi.fn()
      form = new VanillaForm(container, config)
      form.on('expand', onExpand)

      // 检查初始状态
      const moreElement = container.querySelector('.ldesign-form-more')
      expect(moreElement).toBeTruthy()
      expect(moreElement?.classList.contains('hidden')).toBe(true)

      // 展开
      form.toggleExpanded()
      expect(moreElement?.classList.contains('hidden')).toBe(false)
      expect(onExpand).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            expanded: true
          })
        })
      )

      // 收起
      form.toggleExpanded()
      expect(moreElement?.classList.contains('hidden')).toBe(true)
    })

    it('应该正确处理响应式布局', () => {
      const config: FormConfig = {
        fields: [
          { name: 'field1', label: '字段1', type: 'input' },
          { name: 'field2', label: '字段2', type: 'input' }
        ],
        layout: {
          columns: 4 // 固定列数，不使用响应式
        }
      }

      form = new VanillaForm(container, config)

      // 检查初始列数
      const contentElement = container.querySelector('.ldesign-form-content') as HTMLElement
      expect(contentElement.style.getPropertyValue('--form-columns')).toBe('4')

      // 测试updateLayout方法
      form.updateLayout()
      expect(contentElement.style.getPropertyValue('--form-columns')).toBe('4')
    })

    it('应该正确销毁表单', () => {
      const config: FormConfig = {
        fields: [
          { name: 'name', label: '姓名', type: 'input' }
        ]
      }

      form = new VanillaForm(container, config)

      // 检查DOM存在
      expect(container.querySelector('.ldesign-form')).toBeTruthy()

      // 销毁
      form.destroy()

      // 检查DOM被清理
      expect(container.innerHTML).toBe('')
    })

    it('应该正确处理事件监听', () => {
      const config: FormConfig = {
        fields: [
          { name: 'name', label: '姓名', type: 'input' }
        ]
      }

      form = new VanillaForm(container, config)

      const handler = vi.fn()
      const unsubscribe = form.on('change', handler)

      // 触发事件
      form.setFieldValue('name', 'Alice')
      expect(handler).toHaveBeenCalled()

      // 取消监听
      unsubscribe()
      form.setFieldValue('name', 'Bob')

      // 处理器不应该再被调用
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })
})
