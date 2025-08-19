/**
 * TemplateRenderer 组件 - 重构版本
 *
 * 声明式的模板渲染组件
 */

import type { DeviceType } from '../../types'
import { computed, defineComponent, onMounted, onUnmounted, ref, watch, Transition, type PropType } from 'vue'
import './TemplateRenderer.less'
import { TemplateManager } from '../../core/manager'

/**
 * TemplateRenderer 组件
 */
export const TemplateRenderer = defineComponent({
  name: 'TemplateRenderer',

  props: {
    /** 分类 */
    category: {
      type: String,
      required: true,
    },

    /** 设备类型 */
    device: {
      type: String as PropType<DeviceType>,
      default: undefined,
    },

    /** 模板名称（可选，不指定时使用默认模板）
     * 支持字符串或对象格式：
     * - 字符串：'default' - 所有设备使用相同模板
     * - 对象：{ desktop: 'classic', tablet: 'adaptive', mobile: 'simple' } - 不同设备使用不同模板
     */
    template: {
      type: [String, Object] as PropType<string | Record<DeviceType, string>>,
      required: false,
      default: undefined,
    },

    /** 传递给模板的属性 */
    templateProps: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },

    /** 是否使用缓存 */
    cache: {
      type: Boolean,
      default: true,
    },

    /** 是否启用切换动画 */
    transition: {
      type: Boolean,
      default: true,
    },

    /** 动画持续时间（毫秒） */
    transitionDuration: {
      type: Number,
      default: 300,
    },

    /** 动画类型 */
    transitionType: {
      type: String as PropType<'fade' | 'slide' | 'scale' | 'flip'>,
      default: 'fade',
    },

    /** 是否预加载 */
    preload: {
      type: Boolean,
      default: false,
    },

    /** 是否显示加载状态 */
    loading: {
      type: Boolean,
      default: false,
    },

    /** 是否显示错误状态 */
    error: {
      type: Boolean,
      default: false,
    },
  },

  emits: {
    /** 加载完成事件 */
    load: (result: any) => true,

    /** 加载错误事件 */
    error: (error: Error) => true,

    /** 加载前事件 */
    'before-load': () => true,

    /** 模板变化事件 */
    'template-change': (template: any) => true,

    /** 设备变化事件 */
    'device-change': (event: { oldDevice: DeviceType; newDevice: DeviceType }) => true,
  },

  setup(props: any, { emit, slots }: any) {
    // 状态管理
    const isLoading = ref(false)
    const error = ref<Error | null>(null)
    const currentComponent = ref<any>(null)
    const manager = ref<TemplateManager | null>(null)
    const currentDevice = ref<DeviceType>('desktop')

    // 计算属性
    const targetDevice = computed(() => {
      return props.device || currentDevice.value || 'desktop'
    })

    // 获取当前设备对应的模板名称
    const currentTemplate = computed(() => {
      if (!props.template) {
        return undefined // 使用默认模板
      }

      if (typeof props.template === 'string') {
        return props.template
      }

      // 对象格式：根据设备类型选择模板
      return props.template[targetDevice.value] || undefined
    })

    const templateKey = computed(() => {
      return `${props.category}/${targetDevice.value}/${currentTemplate.value || 'default'}`
    })

    // 初始化管理器
    const initializeManager = async () => {
      if (!manager.value) {
        manager.value = new TemplateManager({
          enableCache: props.cache,
          autoDetectDevice: !props.device,
          debug: true, // 启用调试模式
          // 启用持久化存储
          storage: {
            key: 'ldesign-template-selections',
            storage: 'localStorage',
          },
        })

        // 设置设备变化监听
        if (!props.device) {
          // 初始化当前设备类型
          currentDevice.value = manager.value.getCurrentDevice()

          // 监听设备变化
          manager.value.on('device:change', (event: any) => {
            const newDevice = event.newDevice
            if (newDevice !== currentDevice.value) {
              currentDevice.value = newDevice
              emit('device-change', {
                oldDevice: event.oldDevice,
                newDevice: newDevice,
              })
            }
          })
        }

        // 扫描模板
        try {
          await manager.value.scanTemplates()
        } catch (err) {
          console.warn('Template scanning failed:', err)
        }
      }
    }

    // 加载模板
    const loadTemplate = async () => {
      if (!manager.value) {
        await initializeManager()
      }

      if (!manager.value) {
        throw new Error('Template manager not initialized')
      }

      isLoading.value = true
      error.value = null

      try {
        emit('before-load')

        const result = await manager.value.render({
          category: props.category,
          device: targetDevice.value,
          template: currentTemplate.value,
          props: props.templateProps,
          cache: props.cache,
        })

        currentComponent.value = result.component
        emit('load', result)
        emit('template-change', result.metadata)
      } catch (err) {
        const loadError = err as Error
        error.value = loadError
        emit('error', loadError)
        console.error('Template loading failed:', loadError)
      } finally {
        isLoading.value = false
      }
    }

    // 重试加载
    const retryLoad = () => {
      loadTemplate()
    }

    // 监听属性变化
    watch(
      () => [props.category, props.device, props.template, currentTemplate.value],
      () => {
        loadTemplate()
      },
      { immediate: false }
    )

    // 监听设备变化（仅在未手动指定设备时）
    watch(
      () => currentDevice.value,
      (newDevice, oldDevice) => {
        if (!props.device && newDevice !== oldDevice) {
          console.log(`📱 TemplateRenderer 检测到设备变化: ${oldDevice} -> ${newDevice}`)
          loadTemplate()
        }
      },
      { immediate: false }
    )

    // 监听模板属性变化
    watch(
      () => props.templateProps,
      () => {
        // 如果模板属性变化，重新渲染当前组件
        if (currentComponent.value) {
          // 这里可以触发组件重新渲染
        }
      },
      { deep: true }
    )

    // 生命周期
    onMounted(async () => {
      await loadTemplate()

      // 预加载
      if (props.preload && manager.value) {
        const templates = manager.value.getTemplates(props.category, targetDevice.value)
        manager.value.preloadTemplates(templates).catch(err => {
          console.warn('Template preloading failed:', err)
        })
      }
    })

    onUnmounted(() => {
      if (manager.value) {
        manager.value.destroy()
      }
    })

    // 计算过渡动画类名
    const transitionName = computed(() => {
      return `template-${props.transitionType}`
    })

    // 计算过渡动画样式
    const transitionStyle = computed(() => {
      return {
        '--transition-duration': `${props.transitionDuration}ms`,
      }
    })

    // 渲染内容的函数
    const renderContent = () => {
      // 显示加载状态
      if (isLoading.value || props.loading) {
        if (slots.loading) {
          return slots.loading()
        }
        return (
          <div class="template-loading">
            <div class="loading-spinner"></div>
            <p>模板加载中...</p>
          </div>
        )
      }

      // 显示错误状态
      if (error.value || props.error) {
        if (slots.error) {
          return slots.error({ error: error.value, retry: retryLoad })
        }
        return (
          <div class="template-error">
            <h3>模板加载失败</h3>
            <p>{error.value?.message || '未知错误'}</p>
            <button onClick={retryLoad}>重试</button>
          </div>
        )
      }

      // 渲染模板组件
      if (currentComponent.value) {
        const Component = currentComponent.value
        return <Component {...props.templateProps} />
      }

      // 默认状态
      return (
        <div class="template-placeholder">
          <p>模板未加载</p>
        </div>
      )
    }

    // 渲染函数
    return () => {
      const content = renderContent()

      // 如果启用了过渡动画
      if (props.transition) {
        return (
          <div class="template-renderer" style={transitionStyle.value}>
            <Transition name={transitionName.value} mode="out-in" appear={true}>
              <div key={templateKey.value} class="template-content">
                {content}
              </div>
            </Transition>
          </div>
        )
      }

      // 不使用过渡动画
      return (
        <div class="template-renderer">
          <div class="template-content">{content}</div>
        </div>
      )
    }
  },
})

// 默认导出
export default TemplateRenderer
