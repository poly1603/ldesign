/**
 * TemplateRenderer 组件 - 重构版本
 *
 * 声明式的模板渲染组件
 */

import type { PropType } from 'vue'
import type { DeviceType } from '../../types'
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
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

    /** 模板名称 */
    template: {
      type: String,
      required: true,
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
    'load': (result: any) => true,

    /** 加载错误事件 */
    'error': (error: Error) => true,

    /** 加载前事件 */
    'before-load': () => true,

    /** 模板变化事件 */
    'template-change': (template: any) => true,
  },

  setup(props, { emit, slots }) {
    // 状态管理
    const isLoading = ref(false)
    const error = ref<Error | null>(null)
    const currentComponent = ref<any>(null)
    const manager = ref<TemplateManager | null>(null)

    // 计算属性
    const targetDevice = computed(() => {
      return props.device || manager.value?.getCurrentDevice() || 'desktop'
    })

    const templateKey = computed(() => {
      return `${props.category}/${targetDevice.value}/${props.template}`
    })

    // 初始化管理器
    const initializeManager = async () => {
      if (!manager.value) {
        manager.value = new TemplateManager({
          enableCache: props.cache,
          autoDetectDevice: !props.device,
          debug: false,
        })

        // 扫描模板
        try {
          await manager.value.scanTemplates()
        }
        catch (err) {
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
          template: props.template,
          props: props.templateProps,
          cache: props.cache,
        })

        currentComponent.value = result.component
        emit('load', result)
        emit('template-change', result.metadata)
      }
      catch (err) {
        const loadError = err as Error
        error.value = loadError
        emit('error', loadError)
        console.error('Template loading failed:', loadError)
      }
      finally {
        isLoading.value = false
      }
    }

    // 重试加载
    const retryLoad = () => {
      loadTemplate()
    }

    // 监听属性变化
    watch(
      () => [props.category, props.device, props.template],
      () => {
        loadTemplate()
      },
      { immediate: false },
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
      { deep: true },
    )

    // 生命周期
    onMounted(async () => {
      await loadTemplate()

      // 预加载
      if (props.preload && manager.value) {
        const templates = manager.value.getTemplates(props.category, targetDevice.value)
        manager.value.preloadTemplates(templates).catch((err) => {
          console.warn('Template preloading failed:', err)
        })
      }
    })

    onUnmounted(() => {
      if (manager.value) {
        manager.value.destroy()
      }
    })

    // 渲染函数
    return () => {
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
  },
})

// 默认导出
export default TemplateRenderer
