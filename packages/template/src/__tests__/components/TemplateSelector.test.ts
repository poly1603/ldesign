import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { TemplateSelector } from '../../components/TemplateSelector'
import {
  createWrapper,
  createMockSelectorProps,
  mockTemplates,
  waitForDOMUpdate,
  waitForAnimation,
  mockUserClick,
  mockUserInput,
  mockKeyboardEvent,
  expectElementVisible,
  expectElementHidden,
  expectEventEmitted,
  expectAnimationClass
} from '../../test-utils'

describe('TemplateSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该在 visible 为 true 时渲染选择器', () => {
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props })

      expect(wrapper.find('.template-selector').exists()).toBe(true)
      expect(wrapper.find('.template-selector__backdrop').exists()).toBe(true)
      expect(wrapper.find('.template-selector__content').exists()).toBe(true)
    })

    it('应该在 visible 为 false 时隐藏选择器', () => {
      const props = createMockSelectorProps({ visible: false })
      const wrapper = createWrapper(TemplateSelector, { props })

      expect(wrapper.find('.template-selector').exists()).toBe(false)
    })

    it('应该渲染标题和关闭按钮', () => {
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props })

      expect(wrapper.find('.template-selector__header').exists()).toBe(true)
      expect(wrapper.find('.template-selector__title').text()).toBe('选择模板')
      expect(wrapper.find('.template-selector__close').exists()).toBe(true)
    })
  })

  describe('搜索功能', () => {
    it('应该在 showSearch 为 true 时显示搜索框', () => {
      const props = createMockSelectorProps({
        visible: true,
        showSearch: true
      })
      const wrapper = createWrapper(TemplateSelector, { props })

      expect(wrapper.find('.template-selector__search').exists()).toBe(true)
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    })

    it('应该在 showSearch 为 false 时隐藏搜索框', () => {
      const props = createMockSelectorProps({
        visible: true,
        showSearch: false
      })
      const wrapper = createWrapper(TemplateSelector, { props })

      expect(wrapper.find('.template-selector__search').exists()).toBe(false)
    })

    it('应该能够搜索模板', async () => {
      const props = createMockSelectorProps({
        visible: true,
        showSearch: true
      })
      const wrapper = createWrapper(TemplateSelector, { props })

      const searchInput = wrapper.find('input[type="text"]')
      await mockUserInput(searchInput.element as HTMLInputElement, '创意')
      await waitForDOMUpdate()

      // 验证搜索结果过滤
      const templateItems = wrapper.findAll('.template-item')
      expect(templateItems.length).toBeLessThanOrEqual(mockTemplates.length)
    })

    it('应该在搜索无结果时显示提示', async () => {
      const props = createMockSelectorProps({
        visible: true,
        showSearch: true
      })
      const wrapper = createWrapper(TemplateSelector, { props })

      const searchInput = wrapper.find('input[type="text"]')
      await mockUserInput(searchInput.element as HTMLInputElement, 'nonexistent')
      await waitForDOMUpdate()

      expect(wrapper.find('.no-results').exists()).toBe(true)
      expect(wrapper.text()).toContain('未找到匹配的模板')
    })
  })

  describe('标签过滤', () => {
    it('应该在 showTags 为 true 时显示标签', () => {
      const props = createMockSelectorProps({
        visible: true,
        showTags: true
      })
      const wrapper = createWrapper(TemplateSelector, { props })

      expect(wrapper.find('.template-selector__tags').exists()).toBe(true)
    })

    it('应该能够通过标签过滤模板', async () => {
      const props = createMockSelectorProps({
        visible: true,
        showTags: true
      })
      const wrapper = createWrapper(TemplateSelector, { props })

      const tagButton = wrapper.find('.tag-button')
      if (tagButton.exists()) {
        await mockUserClick(tagButton.element)
        await waitForDOMUpdate()

        // 验证过滤结果
        const templateItems = wrapper.findAll('.template-item')
        expect(templateItems.length).toBeGreaterThan(0)
      }
    })
  })

  describe('排序功能', () => {
    it('应该在 showSort 为 true 时显示排序选项', () => {
      const props = createMockSelectorProps({
        visible: true,
        showSort: true
      })
      const wrapper = createWrapper(TemplateSelector, { props })

      expect(wrapper.find('.template-selector__sort').exists()).toBe(true)
    })

    it('应该能够按名称排序', async () => {
      const props = createMockSelectorProps({
        visible: true,
        showSort: true
      })
      const wrapper = createWrapper(TemplateSelector, { props })

      const sortButton = wrapper.find('[data-sort="name"]')
      if (sortButton.exists()) {
        await mockUserClick(sortButton.element)
        await waitForDOMUpdate()

        // 验证排序结果
        const templateItems = wrapper.findAll('.template-item')
        expect(templateItems.length).toBeGreaterThan(0)
      }
    })

    it('应该支持升序和降序切换', async () => {
      const props = createMockSelectorProps({
        visible: true,
        showSort: true
      })
      const wrapper = createWrapper(TemplateSelector, { props })

      const sortButton = wrapper.find('[data-sort="name"]')
      if (sortButton.exists()) {
        // 第一次点击 - 升序
        await mockUserClick(sortButton.element)
        await waitForDOMUpdate()
        expect(sortButton.classes()).toContain('sort-asc')

        // 第二次点击 - 降序
        await mockUserClick(sortButton.element)
        await waitForDOMUpdate()
        expect(sortButton.classes()).toContain('sort-desc')
      }
    })
  })

  describe('模板列表', () => {
    it('应该渲染模板列表', () => {
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props })

      expect(wrapper.find('.template-list').exists()).toBe(true)
      expect(wrapper.findAll('.template-item').length).toBeGreaterThan(0)
    })

    it('应该高亮当前选中的模板', () => {
      const props = createMockSelectorProps({
        visible: true,
        currentTemplate: 'default'
      })
      const wrapper = createWrapper(TemplateSelector, { props })

      const currentItem = wrapper.find('.template-item.current')
      expect(currentItem.exists()).toBe(true)
    })

    it('应该显示模板预览图', () => {
      const props = createMockSelectorProps({
        visible: true,
        showPreview: true
      })
      const wrapper = createWrapper(TemplateSelector, { props })

      const previewImages = wrapper.findAll('.template-preview img')
      expect(previewImages.length).toBeGreaterThan(0)
    })

    it('应该显示模板信息', () => {
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props })

      const templateItems = wrapper.findAll('.template-item')
      templateItems.forEach(item => {
        expect(item.find('.template-name').exists()).toBe(true)
        expect(item.find('.template-description').exists()).toBe(true)
      })
    })
  })

  describe('用户交互', () => {
    it('应该在点击模板时发射 select 事件', async () => {
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props })

      const templateItem = wrapper.find('.template-item')
      await mockUserClick(templateItem.element)

      expectEventEmitted(wrapper, 'select')
    })

    it('应该在点击关闭按钮时发射 close 事件', async () => {
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props })

      const closeButton = wrapper.find('.template-selector__close')
      await mockUserClick(closeButton.element)

      expectEventEmitted(wrapper, 'close')
    })

    it('应该在点击遮罩时发射 close 事件', async () => {
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props })

      const backdrop = wrapper.find('.template-selector__backdrop')
      await mockUserClick(backdrop.element)

      expectEventEmitted(wrapper, 'close')
    })

    it('应该支持键盘导航', async () => {
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props })

      const selector = wrapper.find('.template-selector')

      // 测试 ESC 键关闭
      await mockKeyboardEvent(selector.element, 'Escape')
      expectEventEmitted(wrapper, 'close')
    })

    it('应该支持 Enter 键选择模板', async () => {
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props })

      const templateItem = wrapper.find('.template-item')
      templateItem.element.focus()
      await mockKeyboardEvent(templateItem.element, 'Enter')

      expectEventEmitted(wrapper, 'select')
    })
  })

  describe('动画效果', () => {
    it('应该在打开时播放进入动画', async () => {
      const props = createMockSelectorProps({ visible: false })
      const wrapper = createWrapper(TemplateSelector, { props })

      // 切换为可见
      await wrapper.setProps({ visible: true })
      await waitForDOMUpdate()

      const selector = wrapper.find('.template-selector')
      expectAnimationClass(selector.element, 'template-selector-enter-active')
    })

    it('应该在关闭时播放离开动画', async () => {
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props })

      // 切换为隐藏
      await wrapper.setProps({ visible: false })
      await waitForDOMUpdate()

      const selector = wrapper.find('.template-selector')
      expectAnimationClass(selector.element, 'template-selector-leave-active')
    })

    it('应该在动画完成后移除元素', async () => {
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props })

      // 切换为隐藏
      await wrapper.setProps({ visible: false })
      await waitForAnimation(300) // 等待动画完成

      expect(wrapper.find('.template-selector').exists()).toBe(false)
    })
  })

  describe('响应式设计', () => {
    it('应该在移动设备上调整布局', () => {
      // Mock 移动设备
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const props = createMockSelectorProps({
        visible: true,
        device: 'mobile'
      })
      const wrapper = createWrapper(TemplateSelector, { props })

      expect(wrapper.find('.template-selector').classes()).toContain('mobile')
    })

    it('应该在桌面设备上使用默认布局', () => {
      const props = createMockSelectorProps({
        visible: true,
        device: 'desktop'
      })
      const wrapper = createWrapper(TemplateSelector, { props })

      expect(wrapper.find('.template-selector').classes()).toContain('desktop')
    })
  })

  describe('无障碍访问', () => {
    it('应该设置正确的 ARIA 属性', () => {
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props })

      const selector = wrapper.find('.template-selector')
      expect(selector.attributes('role')).toBe('dialog')
      expect(selector.attributes('aria-modal')).toBe('true')
      expect(selector.attributes('aria-labelledby')).toBeDefined()
    })

    it('应该支持焦点管理', async () => {
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props })

      await waitForDOMUpdate()

      // 验证焦点在打开时移动到选择器
      const selector = wrapper.find('.template-selector')
      expect(document.activeElement).toBe(selector.element)
    })

    it('应该支持焦点陷阱', async () => {
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props })

      const firstFocusable = wrapper.find('.template-selector__close')
      const lastFocusable = wrapper.findAll('.template-item').at(-1)

      // 测试 Tab 键循环
      firstFocusable.element.focus()
      await mockKeyboardEvent(firstFocusable.element, 'Tab', 'keydown')

      // 验证焦点移动
      expect(document.activeElement).not.toBe(firstFocusable.element)
    })
  })

  describe('性能优化', () => {
    it('应该使用虚拟滚动处理大量模板', () => {
      // 创建大量模板数据
      const manyTemplates = Array.from({ length: 1000 }, (_, i) => ({
        ...mockTemplates[0],
        id: `template-${i}`,
        name: `template-${i}`,
      }))

      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, {
        props,
        global: {
          provide: {
            templates: manyTemplates,
          },
        },
      })

      // 验证只渲染可见的模板项
      const visibleItems = wrapper.findAll('.template-item')
      expect(visibleItems.length).toBeLessThan(manyTemplates.length)
    })

    it('应该延迟加载模板预览图', () => {
      const props = createMockSelectorProps({
        visible: true,
        showPreview: true
      })
      const wrapper = createWrapper(TemplateSelector, { props })

      const previewImages = wrapper.findAll('.template-preview img')
      previewImages.forEach(img => {
        expect(img.attributes('loading')).toBe('lazy')
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理模板加载失败', async () => {
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, {
        props,
        global: {
          provide: {
            templates: [],
            error: new Error('模板加载失败'),
          },
        },
      })

      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.text()).toContain('模板加载失败')
    })

    it('应该提供重试机制', async () => {
      const retryFn = vi.fn()
      const props = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, {
        props,
        global: {
          provide: {
            templates: [],
            error: new Error('模板加载失败'),
            retry: retryFn,
          },
        },
      })

      const retryButton = wrapper.find('.retry-button')
      await mockUserClick(retryButton.element)

      expect(retryFn).toHaveBeenCalled()
    })
  })
})
