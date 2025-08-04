import type { FormConfig, FormItemConfig, FormItemType } from '../src/types'
import { describe, expect, it } from 'vitest'

describe('form Types', () => {
  it('should define FormItemConfig correctly', () => {
    const formItem: FormItemConfig = {
      key: 'test',
      label: 'Test Field',
      type: 'input' as FormItemType,
      required: true,
      span: 2,
    }

    expect(formItem.key).toBe('test')
    expect(formItem.label).toBe('Test Field')
    expect(formItem.type).toBe('input')
    expect(formItem.required).toBe(true)
    expect(formItem.span).toBe(2)
  })

  it('should define FormConfig correctly', () => {
    const formConfig: FormConfig = {
      items: [
        {
          key: 'name',
          label: 'Name',
          type: 'input' as FormItemType,
        },
      ],
      layout: {
        defaultRows: 2,
        minColumns: 1,
        maxColumns: 4,
      },
      display: {
        labelPosition: 'left',
        expandMode: 'inline',
      },
      validation: {
        validateOnChange: true,
      },
      behavior: {
        readonly: false,
      },
    }

    expect(formConfig.items).toHaveLength(1)
    expect(formConfig.layout.defaultRows).toBe(2)
    expect(formConfig.display.labelPosition).toBe('left')
    expect(formConfig.validation.validateOnChange).toBe(true)
    expect(formConfig.behavior.readonly).toBe(false)
  })
})
