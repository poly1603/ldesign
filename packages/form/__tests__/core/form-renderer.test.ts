import type { DisplayConfig, FormItemConfig, ItemPosition } from '../../src/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { FormRenderer } from '../../src/core/form-renderer'

describe('formRenderer', () => {
  let container: HTMLElement
  let renderer: FormRenderer
  let displayConfig: DisplayConfig

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)

    displayConfig = {
      labelPosition: 'left',
      labelWidth: 80,
      showExpandButton: true,
      expandMode: 'inline',
    }

    renderer = new FormRenderer(container, displayConfig)
  })

  afterEach(() => {
    renderer.destroy()
    document.body.removeChild(container)
  })

  describe('constructor and configuration', () => {
    it('should create renderer with container and config', () => {
      expect(renderer).toBeInstanceOf(FormRenderer)
    })

    it('should update display config', () => {
      renderer.updateDisplayConfig({ labelPosition: 'top' })
      // 通过渲染结果验证配置更新
      const items: FormItemConfig[] = [{
        key: 'test',
        label: 'Test',
        type: 'input',
      }]
      const positions: ItemPosition[] = [{
        key: 'test',
        row: 0,
        column: 0,
        span: 1,
        width: 200,
        height: 60,
        visible: true,
      }]

      renderer.render(items, positions, 400)
      const label = container.querySelector('.form-item-label')
      expect(label).toHaveClass('form-item-label-top')
    })
  })

  describe('render', () => {
    it('should render empty form', () => {
      renderer.render([], [], 400)
      expect(container.children.length).toBe(0)
      expect(container).toHaveClass('adaptive-form-container')
    })

    it('should render simple form items', () => {
      const items: FormItemConfig[] = [
        { key: 'name', label: 'Name', type: 'input' },
        { key: 'email', label: 'Email', type: 'email' },
      ]
      const positions: ItemPosition[] = [
        { key: 'name', row: 0, column: 0, span: 1, width: 200, height: 60, visible: true },
        { key: 'email', row: 0, column: 1, span: 1, width: 200, height: 60, visible: true },
      ]

      renderer.render(items, positions, 400)

      expect(container.children.length).toBe(2)
      expect(container.querySelector('[data-key="name"]')).toBeTruthy()
      expect(container.querySelector('[data-key="email"]')).toBeTruthy()
    })

    it('should only render visible items', () => {
      const items: FormItemConfig[] = [
        { key: 'visible', label: 'Visible', type: 'input' },
        { key: 'hidden', label: 'Hidden', type: 'input' },
      ]
      const positions: ItemPosition[] = [
        { key: 'visible', row: 0, column: 0, span: 1, width: 200, height: 60, visible: true },
        { key: 'hidden', row: 1, column: 0, span: 1, width: 200, height: 60, visible: false },
      ]

      renderer.render(items, positions, 400)

      expect(container.children.length).toBe(1)
      expect(container.querySelector('[data-key="visible"]')).toBeTruthy()
      expect(container.querySelector('[data-key="hidden"]')).toBeFalsy()
    })

    it('should apply custom className and style', () => {
      const items: FormItemConfig[] = [{
        key: 'test',
        label: 'Test',
        type: 'input',
        className: 'custom-class',
        style: { backgroundColor: 'red' },
      }]
      const positions: ItemPosition[] = [{
        key: 'test',
        row: 0,
        column: 0,
        span: 1,
        width: 200,
        height: 60,
        visible: true,
      }]

      renderer.render(items, positions, 400)

      const element = container.querySelector('[data-key="test"]') as HTMLElement
      expect(element).toHaveClass('custom-class')
      expect(element.style.backgroundColor).toBe('red')
    })
  })

  describe('form item types', () => {
    const createTestItem = (type: any, options: Partial<FormItemConfig> = {}): FormItemConfig => ({
      key: 'test',
      label: 'Test',
      type,
      ...options,
    })

    const createTestPosition = (): ItemPosition => ({
      key: 'test',
      row: 0,
      column: 0,
      span: 1,
      width: 200,
      height: 60,
      visible: true,
    })

    it('should render text input', () => {
      const items = [createTestItem('input', { value: 'test value' })]
      const positions = [createTestPosition()]

      renderer.render(items, positions, 400)

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input).toBeTruthy()
      expect(input.value).toBe('test value')
      expect(input.id).toBe('input-test')
    })

    it('should render textarea', () => {
      const items = [createTestItem('textarea', { value: 'test content' })]
      const positions = [createTestPosition()]

      renderer.render(items, positions, 400)

      const textarea = container.querySelector('textarea') as HTMLTextAreaElement
      expect(textarea).toBeTruthy()
      expect(textarea.value).toBe('test content')
    })

    it('should render select with options', () => {
      const items = [createTestItem('select', {
        value: 'option2',
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ],
      })]
      const positions = [createTestPosition()]

      renderer.render(items, positions, 400)

      const select = container.querySelector('select') as HTMLSelectElement
      expect(select).toBeTruthy()
      expect(select.options.length).toBe(2)
      expect(select.value).toBe('option2')
    })

    it('should render select with grouped options', () => {
      const items = [createTestItem('select', {
        options: [
          { label: 'Option 1', value: 'option1', group: 'Group A' },
          { label: 'Option 2', value: 'option2', group: 'Group A' },
          { label: 'Option 3', value: 'option3', group: 'Group B' },
          { label: 'Option 4', value: 'option4' }, // 无分组
        ],
      })]
      const positions = [createTestPosition()]

      renderer.render(items, positions, 400)

      const select = container.querySelector('select') as HTMLSelectElement
      const optgroups = select.querySelectorAll('optgroup')
      expect(optgroups.length).toBe(2)
      expect(optgroups[0].label).toBe('Group A')
      expect(optgroups[1].label).toBe('Group B')

      // 检查无分组选项
      const directOptions = Array.from(select.children).filter(child => child.tagName === 'OPTION')
      expect(directOptions.length).toBe(1)
    })

    it('should render checkbox', () => {
      const items = [createTestItem('checkbox', { value: true })]
      const positions = [createTestPosition()]

      renderer.render(items, positions, 400)

      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox).toBeTruthy()
      expect(checkbox.checked).toBe(true)
    })

    it('should render radio buttons', () => {
      const items = [createTestItem('radio', {
        value: 'option2',
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ],
      })]
      const positions = [createTestPosition()]

      renderer.render(items, positions, 400)

      const radios = container.querySelectorAll('input[type="radio"]')
      expect(radios.length).toBe(2)

      const checkedRadio = container.querySelector('input[type="radio"]:checked') as HTMLInputElement
      expect(checkedRadio.value).toBe('option2')
    })

    it('should render different input types', () => {
      const types = ['email', 'password', 'number', 'date', 'url']

      types.forEach((type) => {
        container.innerHTML = ''
        const items = [createTestItem(type as any)]
        const positions = [createTestPosition()]

        renderer.render(items, positions, 400)

        const input = container.querySelector(`input[type="${type}"]`)
        expect(input).toBeTruthy()
      })
    })
  })

  describe('label positioning', () => {
    const testLabelPosition = (position: 'left' | 'right' | 'top') => {
      const config = { ...displayConfig, labelPosition: position }
      const testRenderer = new FormRenderer(container, config)

      const items: FormItemConfig[] = [{
        key: 'test',
        label: 'Test Label',
        type: 'input',
        required: true,
      }]
      const positions: ItemPosition[] = [{
        key: 'test',
        row: 0,
        column: 0,
        span: 1,
        width: 200,
        height: 60,
        visible: true,
      }]

      testRenderer.render(items, positions, 400)

      const label = container.querySelector('.form-item-label') as HTMLElement
      expect(label).toHaveClass(`form-item-label-${position}`)

      // 检查必填标记
      const requiredMark = label.querySelector('.form-item-required')
      expect(requiredMark).toBeTruthy()
      expect(requiredMark?.textContent).toBe('*')

      testRenderer.destroy()
    }

    it('should render label on the left', () => {
      testLabelPosition('left')
    })

    it('should render label on the right', () => {
      testLabelPosition('right')
    })

    it('should render label on the top', () => {
      testLabelPosition('top')
    })
  })

  describe('form item state management', () => {
    beforeEach(() => {
      const items: FormItemConfig[] = [{
        key: 'test',
        label: 'Test',
        type: 'input',
        value: 'initial',
      }]
      const positions: ItemPosition[] = [{
        key: 'test',
        row: 0,
        column: 0,
        span: 1,
        width: 200,
        height: 60,
        visible: true,
      }]

      renderer.render(items, positions, 400)
    })

    it('should update form item value', () => {
      renderer.updateFormItem('test', { value: 'updated' })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.value).toBe('updated')
    })

    it('should get form item value', () => {
      const input = container.querySelector('input') as HTMLInputElement
      input.value = 'new value'

      const value = renderer.getFormItemValue('test')
      expect(value).toBe('new value')
    })

    it('should update readonly state', () => {
      renderer.updateFormItem('test', { readonly: true })

      const wrapper = container.querySelector('.form-item') as HTMLElement
      const input = container.querySelector('input') as HTMLInputElement

      expect(wrapper).toHaveClass('readonly')
      expect(input).toHaveClass('readonly')
      expect(input.readOnly).toBe(true)
    })

    it('should update disabled state', () => {
      renderer.updateFormItem('test', { disabled: true })

      const wrapper = container.querySelector('.form-item') as HTMLElement
      const input = container.querySelector('input') as HTMLInputElement

      expect(wrapper).toHaveClass('disabled')
      expect(input).toHaveClass('disabled')
      expect(input.disabled).toBe(true)
    })

    it('should update error state', () => {
      renderer.updateFormItem('test', { errors: ['Error 1', 'Error 2'] })

      const wrapper = container.querySelector('.form-item') as HTMLElement
      const errorContainer = container.querySelector('.form-item-error') as HTMLElement

      expect(wrapper).toHaveClass('has-error')
      expect(errorContainer.children.length).toBe(2)
      expect(errorContainer.textContent).toContain('Error 1')
      expect(errorContainer.textContent).toContain('Error 2')
    })

    it('should clear error state', () => {
      // 先设置错误
      renderer.updateFormItem('test', { errors: ['Error'] })
      expect(container.querySelector('.form-item')).toHaveClass('has-error')

      // 清除错误
      renderer.updateFormItem('test', { errors: [] })
      const wrapper = container.querySelector('.form-item') as HTMLElement
      const errorContainer = container.querySelector('.form-item-error') as HTMLElement

      expect(wrapper).not.toHaveClass('has-error')
      expect(errorContainer.innerHTML).toBe('')
    })

    it('should update focus state', () => {
      renderer.updateFormItem('test', { focused: true })

      const wrapper = container.querySelector('.form-item') as HTMLElement
      expect(wrapper).toHaveClass('focused')
    })

    it('should focus form item', () => {
      const input = container.querySelector('input') as HTMLInputElement
      const focusSpy = vi.spyOn(input, 'focus')

      renderer.focusFormItem('test')

      expect(focusSpy).toHaveBeenCalled()
    })
  })

  describe('special input handling', () => {
    it('should handle checkbox value updates', () => {
      const items: FormItemConfig[] = [{
        key: 'test',
        label: 'Test',
        type: 'checkbox',
        value: false,
      }]
      const positions: ItemPosition[] = [{
        key: 'test',
        row: 0,
        column: 0,
        span: 1,
        width: 200,
        height: 60,
        visible: true,
      }]

      renderer.render(items, positions, 400)

      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      renderer.updateFormItem('test', { value: true })
      expect(checkbox.checked).toBe(true)
    })

    it('should handle number input value extraction', () => {
      const items: FormItemConfig[] = [{
        key: 'test',
        label: 'Test',
        type: 'number',
        value: 42,
      }]
      const positions: ItemPosition[] = [{
        key: 'test',
        row: 0,
        column: 0,
        span: 1,
        width: 200,
        height: 60,
        visible: true,
      }]

      renderer.render(items, positions, 400)

      const input = container.querySelector('input') as HTMLInputElement
      input.value = '123'

      const value = renderer.getFormItemValue('test')
      expect(value).toBe(123)
      expect(typeof value).toBe('number')
    })
  })

  describe('destroy', () => {
    it('should clean up when destroyed', () => {
      const items: FormItemConfig[] = [{
        key: 'test',
        label: 'Test',
        type: 'input',
      }]
      const positions: ItemPosition[] = [{
        key: 'test',
        row: 0,
        column: 0,
        span: 1,
        width: 200,
        height: 60,
        visible: true,
      }]

      renderer.render(items, positions, 400)
      expect(container.children.length).toBe(1)

      renderer.destroy()
      expect(container.children.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle non-existent form items gracefully', () => {
      expect(() => {
        renderer.updateFormItem('non-existent', { value: 'test' })
      }).not.toThrow()

      expect(renderer.getFormItemValue('non-existent')).toBeUndefined()

      expect(() => {
        renderer.focusFormItem('non-existent')
      }).not.toThrow()
    })

    it('should handle items without labels', () => {
      const items: FormItemConfig[] = [{
        key: 'test',
        label: '',
        type: 'input',
      }]
      const positions: ItemPosition[] = [{
        key: 'test',
        row: 0,
        column: 0,
        span: 1,
        width: 200,
        height: 60,
        visible: true,
      }]

      expect(() => {
        renderer.render(items, positions, 400)
      }).not.toThrow()

      const label = container.querySelector('.form-item-label')
      expect(label).toBeFalsy()
    })
  })
})
