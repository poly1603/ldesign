/**
 * Vue 3 适配器
 * 提供Vue组件封装和组合式API支持
 */

import { 
  defineComponent, 
  ref, 
  onMounted, 
  onUnmounted, 
  watch, 
  computed,
  PropType,
  h
} from 'vue'
import type {
  CaptchaType,
  CaptchaStatus,
  CaptchaResult,
  CaptchaError,
  BaseCaptchaConfig,
  SlidePuzzleConfig,
  ClickTextConfig,
  RotateSliderConfig,
  ClickConfig,
  ICaptcha
} from '../types'
import {
  SlidePuzzleCaptcha,
  ClickTextCaptcha,
  RotateSliderCaptcha,
  ClickCaptcha
} from '../index'

// Vue组件属性类型
interface CaptchaProps {
  /** 验证码类型 */
  type: CaptchaType
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 调试模式 */
  debug?: boolean
  /** 自定义配置 */
  config?: Partial<BaseCaptchaConfig>
  /** 滑动拼图配置 */
  slidePuzzleConfig?: Partial<SlidePuzzleConfig>
  /** 点击文字配置 */
  clickTextConfig?: Partial<ClickTextConfig>
  /** 旋转滑块配置 */
  rotateSliderConfig?: Partial<RotateSliderConfig>
  /** 点击验证配置 */
  clickConfig?: Partial<ClickConfig>
}

// Vue组件事件类型
interface CaptchaEmits {
  /** 验证成功事件 */
  success: [result: CaptchaResult]
  /** 验证失败事件 */
  fail: [error: CaptchaError]
  /** 状态变化事件 */
  statusChange: [status: CaptchaStatus]
  /** 重试事件 */
  retry: []
  /** 初始化完成事件 */
  ready: []
  /** 开始验证事件 */
  start: []
  /** 验证进度事件 */
  progress: [data: any]
}

/**
 * Vue 3 验证码组件
 */
export const LCaptcha = defineComponent({
  name: 'LCaptcha',
  props: {
    type: {
      type: String as PropType<CaptchaType>,
      required: true
    },
    width: {
      type: Number,
      default: 320
    },
    height: {
      type: Number,
      default: 180
    },
    disabled: {
      type: Boolean,
      default: false
    },
    debug: {
      type: Boolean,
      default: false
    },
    config: {
      type: Object as PropType<Partial<BaseCaptchaConfig>>,
      default: () => ({})
    },
    slidePuzzleConfig: {
      type: Object as PropType<Partial<SlidePuzzleConfig>>,
      default: () => ({})
    },
    clickTextConfig: {
      type: Object as PropType<Partial<ClickTextConfig>>,
      default: () => ({})
    },
    rotateSliderConfig: {
      type: Object as PropType<Partial<RotateSliderConfig>>,
      default: () => ({})
    },
    clickConfig: {
      type: Object as PropType<Partial<ClickConfig>>,
      default: () => ({})
    }
  },
  emits: {
    success: (result: CaptchaResult) => true,
    fail: (error: CaptchaError) => true,
    statusChange: (status: CaptchaStatus) => true,
    retry: () => true,
    ready: () => true,
    start: () => true,
    progress: (data: any) => true
  },
  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLElement>()
    const captchaInstance = ref<ICaptcha>()
    const status = ref<CaptchaStatus>(CaptchaStatus.UNINITIALIZED)

    // 计算合并后的配置
    const mergedConfig = computed(() => {
      const baseConfig: BaseCaptchaConfig = {
        container: containerRef.value!,
        width: props.width,
        height: props.height,
        disabled: props.disabled,
        debug: props.debug,
        onSuccess: (result) => emit('success', result),
        onFail: (error) => emit('fail', error),
        onStatusChange: (newStatus) => {
          status.value = newStatus
          emit('statusChange', newStatus)
        },
        onRetry: () => emit('retry'),
        ...props.config
      }

      // 根据类型合并特定配置
      switch (props.type) {
        case CaptchaType.SLIDE_PUZZLE:
          return { ...baseConfig, ...props.slidePuzzleConfig }
        case CaptchaType.CLICK_TEXT:
          return { ...baseConfig, ...props.clickTextConfig }
        case CaptchaType.ROTATE_SLIDER:
          return { ...baseConfig, ...props.rotateSliderConfig }
        case CaptchaType.CLICK:
          return { ...baseConfig, ...props.clickConfig }
        default:
          return baseConfig
      }
    })

    // 创建验证码实例
    const createCaptcha = () => {
      if (!containerRef.value) return

      const config = mergedConfig.value

      switch (props.type) {
        case CaptchaType.SLIDE_PUZZLE:
          return new SlidePuzzleCaptcha(config as SlidePuzzleConfig)
        case CaptchaType.CLICK_TEXT:
          return new ClickTextCaptcha(config as ClickTextConfig)
        case CaptchaType.ROTATE_SLIDER:
          return new RotateSliderCaptcha(config as RotateSliderConfig)
        case CaptchaType.CLICK:
          return new ClickCaptcha(config as ClickConfig)
        default:
          throw new Error(`不支持的验证码类型: ${props.type}`)
      }
    }

    // 初始化验证码
    const initCaptcha = async () => {
      try {
        if (captchaInstance.value) {
          captchaInstance.value.destroy()
        }

        captchaInstance.value = createCaptcha()
        
        if (captchaInstance.value) {
          // 绑定事件
          captchaInstance.value.on('ready', () => emit('ready'))
          captchaInstance.value.on('start', () => emit('start'))
          captchaInstance.value.on('progress', (data) => emit('progress', data.data))

          await captchaInstance.value.init()
        }
      } catch (error) {
        console.error('[LCaptcha] 初始化失败:', error)
        emit('fail', {
          code: 'INIT_ERROR',
          message: '验证码初始化失败',
          timestamp: Date.now()
        })
      }
    }

    // 重置验证码
    const reset = () => {
      captchaInstance.value?.reset()
    }

    // 开始验证
    const start = () => {
      captchaInstance.value?.start()
    }

    // 重试验证
    const retry = () => {
      captchaInstance.value?.retry()
    }

    // 验证结果
    const verify = async (data?: any) => {
      if (!captchaInstance.value) {
        throw new Error('验证码未初始化')
      }
      return await captchaInstance.value.verify(data)
    }

    // 监听属性变化
    watch(
      () => [props.type, props.width, props.height, props.disabled],
      () => {
        if (containerRef.value) {
          initCaptcha()
        }
      },
      { deep: true }
    )

    // 组件挂载
    onMounted(() => {
      initCaptcha()
    })

    // 组件卸载
    onUnmounted(() => {
      if (captchaInstance.value) {
        captchaInstance.value.destroy()
      }
    })

    // 暴露方法给父组件
    expose({
      reset,
      start,
      retry,
      verify,
      getInstance: () => captchaInstance.value,
      getStatus: () => status.value
    })

    return () => {
      return h('div', {
        ref: containerRef,
        class: 'ldesign-captcha-vue-container'
      })
    }
  }
})

/**
 * Vue 3 组合式API Hook
 */
export function useCaptcha(type: CaptchaType, config?: Partial<BaseCaptchaConfig>) {
  const containerRef = ref<HTMLElement>()
  const captchaInstance = ref<ICaptcha>()
  const status = ref<CaptchaStatus>(CaptchaStatus.UNINITIALIZED)
  const loading = ref(false)
  const error = ref<CaptchaError | null>(null)

  // 创建验证码实例
  const createInstance = () => {
    if (!containerRef.value) return null

    const mergedConfig: BaseCaptchaConfig = {
      container: containerRef.value,
      onStatusChange: (newStatus) => {
        status.value = newStatus
      },
      onSuccess: (result) => {
        loading.value = false
        error.value = null
      },
      onFail: (err) => {
        loading.value = false
        error.value = err
      },
      ...config
    }

    switch (type) {
      case CaptchaType.SLIDE_PUZZLE:
        return new SlidePuzzleCaptcha(mergedConfig as SlidePuzzleConfig)
      case CaptchaType.CLICK_TEXT:
        return new ClickTextCaptcha(mergedConfig as ClickTextConfig)
      case CaptchaType.ROTATE_SLIDER:
        return new RotateSliderCaptcha(mergedConfig as RotateSliderConfig)
      case CaptchaType.CLICK:
        return new ClickCaptcha(mergedConfig as ClickConfig)
      default:
        return null
    }
  }

  // 初始化
  const init = async () => {
    if (!containerRef.value) {
      throw new Error('容器元素未准备就绪')
    }

    loading.value = true
    error.value = null

    try {
      if (captchaInstance.value) {
        captchaInstance.value.destroy()
      }

      captchaInstance.value = createInstance()
      
      if (captchaInstance.value) {
        await captchaInstance.value.init()
      }
    } catch (err) {
      error.value = {
        code: 'INIT_ERROR',
        message: err instanceof Error ? err.message : '初始化失败',
        timestamp: Date.now()
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  // 重置
  const reset = () => {
    captchaInstance.value?.reset()
    error.value = null
  }

  // 开始验证
  const start = () => {
    captchaInstance.value?.start()
    loading.value = true
    error.value = null
  }

  // 重试
  const retry = () => {
    captchaInstance.value?.retry()
    error.value = null
  }

  // 验证
  const verify = async (data?: any) => {
    if (!captchaInstance.value) {
      throw new Error('验证码未初始化')
    }
    return await captchaInstance.value.verify(data)
  }

  // 销毁
  const destroy = () => {
    if (captchaInstance.value) {
      captchaInstance.value.destroy()
      captchaInstance.value = undefined
    }
  }

  // 计算属性
  const isReady = computed(() => status.value === CaptchaStatus.READY)
  const isVerifying = computed(() => status.value === CaptchaStatus.VERIFYING)
  const isSuccess = computed(() => status.value === CaptchaStatus.SUCCESS)
  const isFailed = computed(() => status.value === CaptchaStatus.FAILED)

  return {
    containerRef,
    captchaInstance: readonly(captchaInstance),
    status: readonly(status),
    loading: readonly(loading),
    error: readonly(error),
    isReady,
    isVerifying,
    isSuccess,
    isFailed,
    init,
    reset,
    start,
    retry,
    verify,
    destroy
  }
}

// 类型导出
export type { CaptchaProps, CaptchaEmits }
