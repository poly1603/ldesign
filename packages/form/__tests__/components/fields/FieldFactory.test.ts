/**
 * @ldesign/form 字段工厂测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FieldFactory } from '../../../src/components/fields/FieldFactory'
import { InputField, TextareaField } from '../../../src/components/fields/InputField'
import { SelectField, RadioField, CheckboxField, SwitchField } from '../../../src/components/fields/SelectField'
import type { FieldConfig } from '../../../src/types/core'

describe('FieldFactory', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('字段创建', () => {
    it('应该创建输入框字段', () => {
      const config: FieldConfig = {
        name: 'test',
        type: 'input',
        label: '测试输入框'
      }

      const field = FieldFactory.createField(container, config)
      expect(field).toBeInstanceOf(InputField)
      expect(field.config.name).toBe('test')
    })

    it('应该创建文本域字段', () => {
      const config: FieldConfig = {
        name: 'test',
        type: 'textarea',
        label: '测试文本域'
      }

      const field = FieldFactory.createField(container, config)
      expect(field).toBeInstanceOf(TextareaField)
    })

    it('应该创建选择框字段', () => {
      const config: FieldConfig = {
        name: 'test',
        type: 'select',
        label: '测试选择框',
        options: [
          { value: '1', label: '选项1' },
          { value: '2', label: '选项2' }
        ]
      }

      const field = FieldFactory.createField(container, config)
      expect(field).toBeInstanceOf(SelectField)
    })

    it('应该创建单选框字段', () => {
      const config: FieldConfig = {
        name: 'test',
        type: 'radio',
        label: '测试单选框',
        options: [
          { value: '1', label: '选项1' },
          { value: '2', label: '选项2' }
        ]
      }

      const field = FieldFactory.createField(container, config)
      expect(field).toBeInstanceOf(RadioField)
    })

    it('应该创建复选框字段', () => {
      const config: FieldConfig = {
        name: 'test',
        type: 'checkbox',
        label: '测试复选框'
      }

      const field = FieldFactory.createField(container, config)
      expect(field).toBeInstanceOf(CheckboxField)
    })

    it('应该创建开关字段', () => {
      const config: FieldConfig = {
        name: 'test',
        type: 'switch',
        label: '测试开关'
      }

      const field = FieldFactory.createField(container, config)
      expect(field).toBeInstanceOf(SwitchField)
    })

    it('应该为不支持的类型创建默认输入框', () => {
      const config: FieldConfig = {
        name: 'test',
        type: 'unknown' as any,
        label: '未知类型'
      }

      const field = FieldFactory.createField(container, config)
      expect(field).toBeInstanceOf(InputField)
      expect(field.config.type).toBe('input')
    })
  })

  describe('批量创建字段', () => {
    it('应该批量创建多个字段', () => {
      const configs: FieldConfig[] = [
        { name: 'field1', type: 'input', label: '字段1' },
        { name: 'field2', type: 'textarea', label: '字段2' },
        { name: 'field3', type: 'select', label: '字段3', options: [] }
      ]

      const fields = FieldFactory.createFields(container, configs)
      expect(fields).toHaveLength(3)
      expect(fields[0]).toBeInstanceOf(InputField)
      expect(fields[1]).toBeInstanceOf(TextareaField)
      expect(fields[2]).toBeInstanceOf(SelectField)
    })
  })

  describe('支持的字段类型', () => {
    it('应该返回所有支持的字段类型', () => {
      const types = FieldFactory.getSupportedTypes()
      expect(types).toContain('input')
      expect(types).toContain('textarea')
      expect(types).toContain('select')
      expect(types).toContain('radio')
      expect(types).toContain('checkbox')
      expect(types).toContain('switch')
      expect(types).toContain('number')
      expect(types).toContain('email')
      expect(types).toContain('password')
    })

    it('应该正确检查字段类型是否支持', () => {
      expect(FieldFactory.isTypeSupported('input')).toBe(true)
      expect(FieldFactory.isTypeSupported('textarea')).toBe(true)
      expect(FieldFactory.isTypeSupported('unknown')).toBe(false)
    })
  })

  describe('默认配置', () => {
    it('应该返回输入框的默认配置', () => {
      const config = FieldFactory.getDefaultConfig('input')
      expect(config.type).toBe('input')
      expect(config.span).toBe(1)
      expect(config.disabled).toBe(false)
      expect(config.readonly).toBe(false)
    })

    it('应该返回文本域的默认配置', () => {
      const config = FieldFactory.getDefaultConfig('textarea')
      expect(config.type).toBe('textarea')
      expect(config.rows).toBe(3)
      expect(config.resize).toBe(true)
    })

    it('应该返回数字输入框的默认配置', () => {
      const config = FieldFactory.getDefaultConfig('number')
      expect(config.type).toBe('number')
      expect(config.step).toBe(1)
    })

    it('应该返回选择框的默认配置', () => {
      const config = FieldFactory.getDefaultConfig('select')
      expect(config.type).toBe('select')
      expect(config.options).toEqual([])
      expect(config.multiple).toBe(false)
    })

    it('应该返回复选框的默认配置', () => {
      const config = FieldFactory.getDefaultConfig('checkbox')
      expect(config.type).toBe('checkbox')
      expect(config.defaultValue).toBe(false)
    })
  })

  describe('配置验证', () => {
    it('应该验证有效的配置', () => {
      const config: FieldConfig = {
        name: 'test',
        type: 'input',
        label: '测试字段'
      }

      const result = FieldFactory.validateConfig(config)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测缺少字段名称', () => {
      const config: FieldConfig = {
        name: '',
        type: 'input',
        label: '测试字段'
      }

      const result = FieldFactory.validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('字段名称不能为空')
    })

    it('应该检测缺少字段类型', () => {
      const config: FieldConfig = {
        name: 'test',
        type: '' as any,
        label: '测试字段'
      }

      const result = FieldFactory.validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('字段类型不能为空')
    })

    it('应该检测不支持的字段类型', () => {
      const config: FieldConfig = {
        name: 'test',
        type: 'unknown' as any,
        label: '测试字段'
      }

      const result = FieldFactory.validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('不支持的字段类型: unknown')
    })

    it('应该检测选择类字段缺少选项', () => {
      const config: FieldConfig = {
        name: 'test',
        type: 'select',
        label: '测试选择框'
      }

      const result = FieldFactory.validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('select 字段必须提供选项')
    })

    it('应该检测数字字段的范围错误', () => {
      const config: FieldConfig = {
        name: 'test',
        type: 'number',
        label: '测试数字',
        min: 100,
        max: 50
      }

      const result = FieldFactory.validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('最小值不能大于最大值')
    })

    it('应该检测文本字段的长度错误', () => {
      const config: FieldConfig = {
        name: 'test',
        type: 'input',
        label: '测试输入',
        minLength: 10,
        maxLength: 5
      }

      const result = FieldFactory.validateConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('最小长度不能大于最大长度')
    })
  })

  describe('配置规范化', () => {
    it('应该规范化基础配置', () => {
      const config: FieldConfig = {
        name: 'test',
        type: 'input'
      }

      const normalized = FieldFactory.normalizeConfig(config)
      expect(normalized.name).toBe('test')
      expect(normalized.type).toBe('input')
      expect(normalized.label).toBe('test') // 默认使用name作为label
      expect(normalized.span).toBe(1)
      expect(normalized.disabled).toBe(false)
      expect(normalized.readonly).toBe(false)
    })

    it('应该保留已有的配置', () => {
      const config: FieldConfig = {
        name: 'test',
        type: 'input',
        label: '自定义标签',
        span: 2,
        disabled: true
      }

      const normalized = FieldFactory.normalizeConfig(config)
      expect(normalized.label).toBe('自定义标签')
      expect(normalized.span).toBe(2)
      expect(normalized.disabled).toBe(true)
    })

    it('应该应用类型特定的默认配置', () => {
      const config: FieldConfig = {
        name: 'test',
        type: 'textarea'
      }

      const normalized = FieldFactory.normalizeConfig(config)
      expect(normalized.rows).toBe(3)
      expect(normalized.resize).toBe(true)
    })
  })
})
