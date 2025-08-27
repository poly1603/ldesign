/**
 * 尺寸控制面板组件
 */

/* eslint-disable */
import type { SizeMode } from '../types'
import { computed, defineComponent, ref } from 'vue'
import { useSize, useSizeResponsive, useSmartSize } from './composables'
import SizeSwitcher from './SizeSwitcher'
import SizeIndicator from './SizeIndicator'

export interface SizeControlPanelProps {
  showSwitcher?: boolean
  showIndicator?: boolean
  showPreview?: boolean
  showRecommendation?: boolean
  layout?: 'vertical' | 'horizontal' | 'grid'
  collapsible?: boolean
  defaultCollapsed?: boolean
  theme?: 'light' | 'dark' | 'auto'
  size?: 'small' | 'medium' | 'large'
}

export default defineComponent({
  name: 'SizeControlPanel',
  props: {
    showSwitcher: {
      type: Boolean,
      default: true,
    },
    showIndicator: {
      type: Boolean,
      default: true,
    },
    showPreview: {
      type: Boolean,
      default: true,
    },
    showRecommendation: {
      type: Boolean,
      default: true,
    },
    layout: {
      type: String as () => 'vertical' | 'horizontal' | 'grid',
      default: 'vertical',
    },
    collapsible: {
      type: Boolean,
      default: false,
    },
    defaultCollapsed: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String as () => 'light' | 'dark' | 'auto',
      default: 'auto',
    },
    size: {
      type: String as () => 'small' | 'medium' | 'large',
      default: 'medium',
    },
  },
  emits: ['size-change', 'collapse-change'],
  setup(props, { emit, slots }) {
    const { currentMode, setMode } = useSize()
    const { isSmall, isMedium, isLarge } = useSizeResponsive()
    const { recommendedMode, isUsingRecommended, resetToRecommended } = useSmartSize()

    const isCollapsed = ref(props.defaultCollapsed)

    const panelClasses = computed(() => [
      'size-control-panel',
      `size-control-panel--${props.layout}`,
      `size-control-panel--${props.theme}`,
      `size-control-panel--${props.size}`,
      {
        'size-control-panel--collapsed': isCollapsed.value,
        'size-control-panel--collapsible': props.collapsible,
      },
    ])

    const handleSizeChange = (mode: SizeMode) => {
      setMode(mode)
      emit('size-change', mode)
    }

    const handleCollapseToggle = () => {
      isCollapsed.value = !isCollapsed.value
      emit('collapse-change', isCollapsed.value)
    }

    const handleResetToRecommended = () => {
      resetToRecommended()
      emit('size-change', recommendedMode.value)
    }

    return () => (
      <div class={panelClasses.value}>
        {/* 头部 */}
        <div class="size-control-panel__header">
          {slots.header?.() || (
            <div class="size-control-panel__title">
              <span>尺寸设置</span>
              {props.collapsible && (
                <button
                  class="size-control-panel__collapse-btn"
                  onClick={handleCollapseToggle}
                  aria-label={isCollapsed.value ? '展开' : '收起'}
                >
                  <span class={`size-control-panel__collapse-icon ${isCollapsed.value ? 'collapsed' : ''}`}>
                    ▼
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 内容区域 */}
        {!isCollapsed.value && (
          <div class="size-control-panel__content">
            {/* 当前状态指示器 */}
            {props.showIndicator && (
              <div class="size-control-panel__section">
                <h4 class="size-control-panel__section-title">当前状态</h4>
                <SizeIndicator format="chip" showScale={true} />
              </div>
            )}

            {/* 尺寸切换器 */}
            {props.showSwitcher && (
              <div class="size-control-panel__section">
                <h4 class="size-control-panel__section-title">选择尺寸</h4>
                <SizeSwitcher
                  switcherStyle="segmented"
                  showIcons={true}
                  animated={true}
                  onChange={handleSizeChange}
                />
              </div>
            )}

            {/* 推荐设置 */}
            {props.showRecommendation && (
              <div class="size-control-panel__section">
                <h4 class="size-control-panel__section-title">智能推荐</h4>
                <div class="size-control-panel__recommendation">
                  <div class="size-control-panel__recommendation-info">
                    <span class="size-control-panel__recommendation-label">
                      推荐尺寸：
                    </span>
                    <span class="size-control-panel__recommendation-value">
                      {recommendedMode.value}
                    </span>
                    {!isUsingRecommended.value && (
                      <span class="size-control-panel__recommendation-badge">
                        未使用
                      </span>
                    )}
                  </div>
                  {!isUsingRecommended.value && (
                    <button
                      class="size-control-panel__recommendation-btn"
                      onClick={handleResetToRecommended}
                    >
                      使用推荐设置
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 预览区域 */}
            {props.showPreview && (
              <div class="size-control-panel__section">
                <h4 class="size-control-panel__section-title">预览效果</h4>
                <div class="size-control-panel__preview">
                  <div class="size-control-panel__preview-item">
                    <span class="size-control-panel__preview-label">文字大小：</span>
                    <span
                      class="size-control-panel__preview-text"
                      style={{ fontSize: 'var(--ls-font-size)' }}
                    >
                      示例文字 Sample Text
                    </span>
                  </div>
                  <div class="size-control-panel__preview-item">
                    <span class="size-control-panel__preview-label">按钮样式：</span>
                    <button
                      class="size-control-panel__preview-button"
                      style={{
                        height: 'var(--ls-button-height)',
                        padding: 'var(--ls-button-padding)',
                        fontSize: 'var(--ls-button-font-size)',
                        borderRadius: 'var(--ls-border-radius)',
                      }}
                    >
                      示例按钮
                    </button>
                  </div>
                  <div class="size-control-panel__preview-item">
                    <span class="size-control-panel__preview-label">间距效果：</span>
                    <div
                      class="size-control-panel__preview-spacing"
                      style={{
                        padding: 'var(--ls-spacing)',
                        borderRadius: 'var(--ls-border-radius)',
                        border: '1px solid var(--ls-border-color, #e0e0e0)',
                      }}
                    >
                      间距示例
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 响应式状态 */}
            <div class="size-control-panel__section">
              <h4 class="size-control-panel__section-title">响应式状态</h4>
              <div class="size-control-panel__responsive-status">
                <div class={`size-control-panel__status-item ${isSmall.value ? 'active' : ''}`}>
                  小屏幕
                </div>
                <div class={`size-control-panel__status-item ${isMedium.value ? 'active' : ''}`}>
                  中等屏幕
                </div>
                <div class={`size-control-panel__status-item ${isLarge.value ? 'active' : ''}`}>
                  大屏幕
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 底部 */}
        {slots.footer && (
          <div class="size-control-panel__footer">
            {slots.footer()}
          </div>
        )}
      </div>
    )
  },
})
