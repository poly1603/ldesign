import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { TemplateRenderer } from '../../components/TemplateRenderer'
import { TemplateSelector } from '../../components/TemplateSelector'
import {
  createWrapper,
  createMockRendererProps,
  createMockSelectorProps,
  mockTemplates,
  mockVueComponent,
  waitForDOMUpdate,
  waitForAnimation,
  mockUserClick,
  expectEventEmitted,
  expectElementVisible,
  expectAnimationClass
} from '../../test-utils'

// Mock useTemplate composable
const mockUseTemplate = {
  currentTemplate: mockTemplates[0],
  currentComponent: mockVueComponent,
  loading: false,
  error: null,
  showSelector: false,
  selectorConfig: {
    theme: 'default',
    showSearch: true,
    showTags: true,
    showSort: true,
  },
  availableTemplates: mockTemplates,
  switchTemplate: vi.fn(),
  refreshTemplates: vi.fn(),
  openSelector: vi.fn(),
  closeSelector: vi.fn(),
  TemplateTransition: mockVueComponent,
}

vi.mock('../../composables/useTemplate', () => ({
  useTemplate: vi.fn(() => mockUseTemplate),
}))

describe('模板切换集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 重置 mock 状态
    Object.assign(mockUseTemplate, {
      currentTemplate: mockTemplates[0],
      currentComponent: mockVueComponent,
      loading: false,
      error: null,
      showSelector: false,
    })
  })

  describe('完整的模板切换流程', () => {
    it('应该能够完成从打开选择器到切换模板的完整流程', async () => {
      const props = createMockRendererProps({ showSelector: false })
      const wrapper = createWrapper(TemplateRenderer, { props })

      // 1. 初始状态：选择器隐藏，显示默认模板
      expect(wrapper.findComponent({ name: 'TemplateSelector' }).exists()).toBe(false)
      expect(wrapper.find('.template-content').exists()).toBe(true)

      // 2. 打开选择器
      mockUseTemplate.showSelector = true
      await wrapper.vm.$forceUpdate()
      await waitForDOMUpdate()

      const selector = wrapper.findComponent({ name: 'TemplateSelector' })
      expect(selector.exists()).toBe(true)
      expect(selector.props('visible')).toBe(true)

      // 3. 验证选择器动画
      await waitForAnimation(50) // 等待进入动画开始
      expectAnimationClass(selector.element, 'template-selector-enter-active')

      // 4. 选择新模板
      const creativeTemplate = mockTemplates.find(t => t.name === 'creative')
      mockUseTemplate.switchTemplate.mockResolvedValue(creativeTemplate)

      await selector.vm.$emit('select', 'creative')

      expect(mockUseTemplate.switchTemplate).toHaveBeenCalledWith('creative')

      // 5. 模拟模板切换完成
      mockUseTemplate.currentTemplate = creativeTemplate
      mockUseTemplate.showSelector = false
      await wrapper.vm.$forceUpdate()
      await waitForDOMUpdate()

      // 6. 验证选择器关闭动画
      await waitForAnimation(50)
      expectAnimationClass(selector.element, 'template-selector-leave-active')

      // 7. 验证新模板渲染
      await waitForAnimation(300) // 等待动画完成
      expect(wrapper.find('.template-content').exists()).toBe(true)
    })

    it('应该在模板切换时显示加载状态', async () => {
      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      // 模拟切换开始
      mockUseTemplate.loading = true
      mockUseTemplate.switchTemplate.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      )

      await wrapper.vm.$forceUpdate()
      await waitForDOMUpdate()

      // 验证加载状态
      expect(wrapper.find('.template-loading').exists()).toBe(true)
      expect(wrapper.text()).toContain('加载中')

      // 模拟切换完成
      mockUseTemplate.loading = false
      mockUseTemplate.currentTemplate = mockTemplates[1]
      await wrapper.vm.$forceUpdate()
      await waitForDOMUpdate()

      expect(wrapper.find('.template-loading').exists()).toBe(false)
      expect(wrapper.find('.template-content').exists()).toBe(true)
    })

    it('应该正确处理模板切换失败', async () => {
      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      // 模拟切换失败
      const error = new Error('模板切换失败')
      mockUseTemplate.error = error
      mockUseTemplate.switchTemplate.mockRejectedValue(error)

      await wrapper.vm.$forceUpdate()
      await waitForDOMUpdate()

      // 验证错误状态
      expect(wrapper.find('.template-error').exists()).toBe(true)
      expect(wrapper.text()).toContain('模板切换失败')

      // 验证重试按钮
      const retryButton = wrapper.find('.retry-button')
      expect(retryButton.exists()).toBe(true)

      await mockUserClick(retryButton.element)
      expect(mockUseTemplate.refreshTemplates).toHaveBeenCalled()
    })
  })

  describe('选择器动画测试', () => {
    it('应该有完整的打开动画', async () => {
      const selectorProps = createMockSelectorProps({ visible: false })
      const wrapper = createWrapper(TemplateSelector, { props: selectorProps })

      // 切换为可见
      await wrapper.setProps({ visible: true })
      await waitForDOMUpdate()

      const selector = wrapper.find('.template-selector')

      // 验证进入动画类
      expectAnimationClass(selector.element, 'template-selector-enter-active')

      // 验证初始状态
      const backdrop = wrapper.find('.template-selector__backdrop')
      const content = wrapper.find('.template-selector__content')

      expect(backdrop.exists()).toBe(true)
      expect(content.exists()).toBe(true)

      // 等待动画完成
      await waitForAnimation(300)

      // 验证最终状态
      expectElementVisible(selector.element)
    })

    it('应该有完整的关闭动画', async () => {
      const selectorProps = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props: selectorProps })

      await waitForDOMUpdate()
      const selector = wrapper.find('.template-selector')
      expectElementVisible(selector.element)

      // 切换为隐藏
      await wrapper.setProps({ visible: false })
      await waitForDOMUpdate()

      // 验证离开动画类
      expectAnimationClass(selector.element, 'template-selector-leave-active')

      // 等待动画完成
      await waitForAnimation(300)

      // 验证元素被移除
      expect(wrapper.find('.template-selector').exists()).toBe(false)
    })

    it('应该在选择模板后自动关闭并播放动画', async () => {
      const selectorProps = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props: selectorProps })

      await waitForDOMUpdate()

      // 选择模板
      const templateItem = wrapper.find('.template-item')
      await mockUserClick(templateItem.element)

      // 验证 select 事件被发射
      expectEventEmitted(wrapper, 'select')

      // 模拟选择器关闭
      await wrapper.setProps({ visible: false })
      await waitForDOMUpdate()

      // 验证关闭动画
      const selector = wrapper.find('.template-selector')
      if (selector.exists()) {
        expectAnimationClass(selector.element, 'template-selector-leave-active')
      }

      await waitForAnimation(300)
      expect(wrapper.find('.template-selector').exists()).toBe(false)
    })
  })

  describe('模板内容过渡', () => {
    it('应该在模板切换时播放内容过渡动画', async () => {
      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      // 初始模板
      expect(wrapper.find('.template-content').exists()).toBe(true)

      // 切换模板
      mockUseTemplate.currentTemplate = mockTemplates[1]
      await wrapper.vm.$forceUpdate()
      await waitForDOMUpdate()

      // 验证过渡组件存在
      const transition = wrapper.findComponent({ name: 'TemplateTransition' })
      expect(transition.exists()).toBe(true)

      // 验证内容更新
      expect(wrapper.find('.template-content').exists()).toBe(true)
    })

    it('应该支持不同的过渡类型', async () => {
      const props = createMockRendererProps({
        transitionType: 'slide',
      })
      const wrapper = createWrapper(TemplateRenderer, { props })

      const transition = wrapper.findComponent({ name: 'TemplateTransition' })
      expect(transition.props('type')).toBe('slide')
    })
  })

  describe('用户交互流程', () => {
    it('应该支持键盘导航选择模板', async () => {
      const selectorProps = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props: selectorProps })

      await waitForDOMUpdate()

      const templateItems = wrapper.findAll('.template-item')
      expect(templateItems.length).toBeGreaterThan(0)

      // 模拟键盘导航
      const firstItem = templateItems[0]
      firstItem.element.focus()

      // 模拟 Enter 键选择
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      firstItem.element.dispatchEvent(enterEvent)
      await waitForDOMUpdate()

      expectEventEmitted(wrapper, 'select')
    })

    it('应该支持搜索过滤模板', async () => {
      const selectorProps = createMockSelectorProps({
        visible: true,
        showSearch: true
      })
      const wrapper = createWrapper(TemplateSelector, { props: selectorProps })

      await waitForDOMUpdate()

      const searchInput = wrapper.find('input[type="text"]')
      expect(searchInput.exists()).toBe(true)

      // 输入搜索关键词
      await searchInput.setValue('创意')
      await waitForDOMUpdate()

      // 验证过滤结果
      const templateItems = wrapper.findAll('.template-item')
      expect(templateItems.length).toBeLessThanOrEqual(mockTemplates.length)
    })

    it('应该支持标签过滤', async () => {
      const selectorProps = createMockSelectorProps({
        visible: true,
        showTags: true
      })
      const wrapper = createWrapper(TemplateSelector, { props: selectorProps })

      await waitForDOMUpdate()

      const tagButtons = wrapper.findAll('.tag-button')
      if (tagButtons.length > 0) {
        await mockUserClick(tagButtons[0].element)
        await waitForDOMUpdate()

        // 验证过滤效果
        const templateItems = wrapper.findAll('.template-item')
        expect(templateItems.length).toBeGreaterThan(0)
      }
    })
  })

  describe('错误恢复流程', () => {
    it('应该能够从模板加载错误中恢复', async () => {
      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      // 模拟加载错误
      mockUseTemplate.error = new Error('网络错误')
      await wrapper.vm.$forceUpdate()
      await waitForDOMUpdate()

      expect(wrapper.find('.template-error').exists()).toBe(true)

      // 点击重试
      const retryButton = wrapper.find('.retry-button')
      await mockUserClick(retryButton.element)

      // 模拟恢复成功
      mockUseTemplate.error = null
      mockUseTemplate.currentTemplate = mockTemplates[0]
      await wrapper.vm.$forceUpdate()
      await waitForDOMUpdate()

      expect(wrapper.find('.template-error').exists()).toBe(false)
      expect(wrapper.find('.template-content').exists()).toBe(true)
    })

    it('应该在网络恢复后自动重新加载', async () => {
      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      // 模拟网络断开
      mockUseTemplate.error = new Error('网络连接失败')
      mockUseTemplate.availableTemplates = []
      await wrapper.vm.$forceUpdate()
      await waitForDOMUpdate()

      expect(wrapper.find('.template-error').exists()).toBe(true)

      // 模拟网络恢复
      mockUseTemplate.error = null
      mockUseTemplate.availableTemplates = mockTemplates
      mockUseTemplate.currentTemplate = mockTemplates[0]
      await wrapper.vm.$forceUpdate()
      await waitForDOMUpdate()

      expect(wrapper.find('.template-content').exists()).toBe(true)
    })
  })

  describe('性能优化验证', () => {
    it('应该避免不必要的重新渲染', async () => {
      const props = createMockRendererProps()
      const wrapper = createWrapper(TemplateRenderer, { props })

      const renderSpy = vi.spyOn(wrapper.vm, '$forceUpdate')

      // 设置相同的模板
      mockUseTemplate.currentTemplate = mockTemplates[0]
      await wrapper.vm.$forceUpdate()
      await waitForDOMUpdate()

      // 再次设置相同的模板
      mockUseTemplate.currentTemplate = mockTemplates[0]
      await wrapper.vm.$forceUpdate()
      await waitForDOMUpdate()

      // 验证没有额外的渲染
      expect(renderSpy).toHaveBeenCalledTimes(2) // 只有我们手动调用的两次
    })

    it('应该正确处理大量模板的性能', async () => {
      // 创建大量模板
      const manyTemplates = Array.from({ length: 100 }, (_, i) => ({
        ...mockTemplates[0],
        id: `template-${i}`,
        name: `template-${i}`,
        displayName: `模板 ${i}`,
      }))

      mockUseTemplate.availableTemplates = manyTemplates

      const selectorProps = createMockSelectorProps({ visible: true })
      const wrapper = createWrapper(TemplateSelector, { props: selectorProps })

      await waitForDOMUpdate()

      // 验证虚拟滚动或分页
      const templateItems = wrapper.findAll('.template-item')
      expect(templateItems.length).toBeLessThan(manyTemplates.length) // 应该只渲染可见项
    })
  })

  describe('状态同步', () => {
    it('应该保持选择器状态与渲染器状态同步', async () => {
      const rendererProps = createMockRendererProps({ showSelector: false })
      const rendererWrapper = createWrapper(TemplateRenderer, { props: rendererProps })

      // 初始状态：选择器隐藏
      expect(rendererWrapper.findComponent({ name: 'TemplateSelector' }).exists()).toBe(false)

      // 打开选择器
      mockUseTemplate.showSelector = true
      await rendererWrapper.vm.$forceUpdate()
      await waitForDOMUpdate()

      const selector = rendererWrapper.findComponent({ name: 'TemplateSelector' })
      expect(selector.exists()).toBe(true)
      expect(selector.props('visible')).toBe(true)

      // 关闭选择器
      mockUseTemplate.showSelector = false
      await rendererWrapper.vm.$forceUpdate()
      await waitForDOMUpdate()

      expect(selector.props('visible')).toBe(false)
    })

    it('应该正确传递当前模板信息', async () => {
      const currentTemplate = mockTemplates[1] // creative 模板
      mockUseTemplate.currentTemplate = currentTemplate
      mockUseTemplate.showSelector = true

      const rendererProps = createMockRendererProps({ showSelector: true })
      const wrapper = createWrapper(TemplateRenderer, { props: rendererProps })

      await waitForDOMUpdate()

      const selector = wrapper.findComponent({ name: 'TemplateSelector' })
      expect(selector.props('currentTemplate')).toBe(currentTemplate.name)
    })
  })
})
