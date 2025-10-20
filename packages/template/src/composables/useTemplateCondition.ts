/**
 * 条件渲染与A/B测试系统
 * 
 * 根据条件自动选择模板，支持A/B测试
 */

import type { Ref } from 'vue'
import type { DeviceType } from '../types'
import { computed, onMounted, ref, watch } from 'vue'

/**
 * 条件类型
 */
export interface TemplateCondition {
  /** 条件ID */
  id?: string
  /** 测试函数 */
  test: (context: TemplateContext) => boolean | Promise<boolean>
  /** 满足条件时使用的模板 */
  template: string
  /** 权重（用于A/B测试） */
  weight?: number
  /** 优先级（数字越大优先级越高） */
  priority?: number
  /** 条件描述 */
  description?: string
  /** 是否启用 */
  enabled?: boolean
}

/**
 * 模板上下文
 */
export interface TemplateContext {
  /** 用户信息 */
  user?: {
    id?: string
    role?: string
    isVip?: boolean
    isNewUser?: boolean
    [key: string]: any
  }
  /** 设备信息 */
  device?: {
    type?: DeviceType
    screen?: { width: number; height: number }
    userAgent?: string
  }
  /** 时间信息 */
  time?: {
    hour?: number
    dayOfWeek?: number
    date?: Date
  }
  /** 地理信息 */
  geo?: {
    country?: string
    region?: string
    city?: string
    language?: string
  }
  /** 功能标记 */
  features?: Record<string, boolean>
  /** 自定义数据 */
  custom?: Record<string, any>
}

/**
 * A/B测试配置
 */
export interface ABTestConfig {
  /** 测试ID */
  id: string
  /** 测试名称 */
  name?: string
  /** 变体列表 */
  variants: ABTestVariant[]
  /** 是否启用 */
  enabled?: boolean
  /** 流量分配策略 */
  strategy?: 'random' | 'weighted' | 'hash'
  /** 用于哈希的种子 */
  seed?: string
  /** 开始时间 */
  startDate?: Date
  /** 结束时间 */
  endDate?: Date
  /** 目标指标 */
  metrics?: string[]
}

/**
 * A/B测试变体
 */
export interface ABTestVariant {
  /** 变体ID */
  id: string
  /** 模板名称 */
  template: string
  /** 权重 */
  weight: number
  /** 描述 */
  description?: string
}

/**
 * A/B测试结果
 */
export interface ABTestResult {
  /** 选中的变体 */
  variant: ABTestVariant
  /** 测试ID */
  testId: string
  /** 分配原因 */
  reason: string
  /** 时间戳 */
  timestamp: number
}

/**
 * 使用条件渲染
 */
export function useTemplateCondition(
  conditions: TemplateCondition[] = [],
  context: Ref<TemplateContext> | TemplateContext = {}
) {
  const contextRef = ref(context)
  const selectedTemplate = ref<string | null>(null)
  const evaluating = ref(false)
  const lastEvaluation = ref<Date | null>(null)
  
  /**
   * 评估条件
   */
  const evaluateConditions = async (): Promise<string | null> => {
    evaluating.value = true
    
    try {
      // 过滤启用的条件
      const enabledConditions = conditions.filter(c => c.enabled !== false)
      
      // 按优先级排序
      const sortedConditions = [...enabledConditions].sort(
        (a, b) => (b.priority || 0) - (a.priority || 0)
      )
      
      // 逐个测试条件
      for (const condition of sortedConditions) {
        try {
          const result = await condition.test(contextRef.value)
          if (result) {
            lastEvaluation.value = new Date()
            return condition.template
          }
        } catch (error) {
          console.error(`Error evaluating condition ${condition.id}:`, error)
        }
      }
      
      return null
    } finally {
      evaluating.value = false
    }
  }
  
  /**
   * 选择模板
   */
  const selectTemplate = async () => {
    const template = await evaluateConditions()
    selectedTemplate.value = template
    return template
  }
  
  /**
   * 强制重新评估
   */
  const reevaluate = () => {
    return selectTemplate()
  }
  
  // 监听上下文变化
  watch(contextRef, () => {
    selectTemplate()
  }, { deep: true })
  
  // 初始评估
  onMounted(() => {
    selectTemplate()
  })
  
  return {
    selectedTemplate: computed(() => selectedTemplate.value),
    evaluating: computed(() => evaluating.value),
    lastEvaluation: computed(() => lastEvaluation.value),
    context: contextRef,
    selectTemplate,
    reevaluate
  }
}

/**
 * 使用A/B测试
 */
export function useTemplateABTest(
  config: ABTestConfig,
  userId?: string
) {
  const currentVariant = ref<ABTestVariant | null>(null)
  const testResult = ref<ABTestResult | null>(null)
  const isActive = ref(false)
  
  /**
   * 检查测试是否激活
   */
  const checkActive = (): boolean => {
    if (!config.enabled) return false
    
    const now = new Date()
    
    if (config.startDate && now < config.startDate) return false
    if (config.endDate && now > config.endDate) return false
    
    return true
  }
  
  /**
   * 哈希分配
   */
  const assignByHash = (): ABTestVariant => {
    const seed = config.seed || config.id
    const hash = hashCode(`${seed}-${userId || Math.random()}`)
    const totalWeight = config.variants.reduce((sum, v) => sum + v.weight, 0)
    
    let threshold = 0
    const normalizedHash = Math.abs(hash % totalWeight)
    
    for (const variant of config.variants) {
      threshold += variant.weight
      if (normalizedHash < threshold) {
        return variant
      }
    }
    
    return config.variants[0]
  }
  
  /**
   * 权重分配
   */
  const assignByWeight = (): ABTestVariant => {
    const totalWeight = config.variants.reduce((sum, v) => sum + v.weight, 0)
    const random = Math.random() * totalWeight
    
    let threshold = 0
    for (const variant of config.variants) {
      threshold += variant.weight
      if (random < threshold) {
        return variant
      }
    }
    
    return config.variants[0]
  }
  
  /**
   * 随机分配
   */
  const assignRandomly = (): ABTestVariant => {
    const index = Math.floor(Math.random() * config.variants.length)
    return config.variants[index]
  }
  
  /**
   * 分配变体
   */
  const assignVariant = (): ABTestVariant => {
    const strategy = config.strategy || 'random'
    
    switch (strategy) {
      case 'hash':
        return assignByHash()
      case 'weighted':
        return assignByWeight()
      case 'random':
      default:
        return assignRandomly()
    }
  }
  
  /**
   * 运行测试
   */
  const runTest = (): ABTestResult | null => {
    isActive.value = checkActive()
    
    if (!isActive.value) return null
    
    const variant = assignVariant()
    currentVariant.value = variant
    
    const result: ABTestResult = {
      variant,
      testId: config.id,
      reason: `Assigned by ${config.strategy || 'random'} strategy`,
      timestamp: Date.now()
    }
    
    testResult.value = result
    
    // 保存到localStorage（可选）
    if (userId) {
      try {
        const key = `ab-test-${config.id}-${userId}`
        localStorage.setItem(key, JSON.stringify(result))
      } catch (error) {
        console.error('Failed to save A/B test result:', error)
      }
    }
    
    return result
  }
  
  /**
   * 获取保存的测试结果
   */
  const getSavedResult = (): ABTestResult | null => {
    if (!userId) return null
    
    try {
      const key = `ab-test-${config.id}-${userId}`
      const saved = localStorage.getItem(key)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load saved A/B test result:', error)
    }
    
    return null
  }
  
  /**
   * 记录指标
   */
  const trackMetric = (metric: string, value?: any) => {
    if (!currentVariant.value) return
    
    const event = {
      testId: config.id,
      variantId: currentVariant.value.id,
      metric,
      value,
      timestamp: Date.now(),
      userId
    }
    
    // 发送到分析服务（需要实现）
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ab-test-metric', { detail: event }))
    }
  }
  
  // 初始化
  onMounted(() => {
    // 尝试加载保存的结果
    const saved = getSavedResult()
    if (saved && checkActive()) {
      const variant = config.variants.find(v => v.id === saved.variant.id)
      if (variant) {
        currentVariant.value = variant
        testResult.value = saved
        isActive.value = true
        return
      }
    }
    
    // 运行新测试
    runTest()
  })
  
  return {
    variant: computed(() => currentVariant.value),
    template: computed(() => currentVariant.value?.template || null),
    isActive: computed(() => isActive.value),
    result: computed(() => testResult.value),
    runTest,
    trackMetric
  }
}

/**
 * 哈希函数
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

/**
 * 预定义条件
 */
export const TEMPLATE_CONDITIONS = {
  /** 新用户条件 */
  isNewUser: (template: string): TemplateCondition => ({
    id: 'new-user',
    test: (ctx) => ctx.user?.isNewUser === true,
    template,
    description: '新用户',
    priority: 10
  }),
  
  /** VIP用户条件 */
  isVipUser: (template: string): TemplateCondition => ({
    id: 'vip-user',
    test: (ctx) => ctx.user?.isVip === true,
    template,
    description: 'VIP用户',
    priority: 20
  }),
  
  /** 设备条件 */
  isDevice: (device: DeviceType, template: string): TemplateCondition => ({
    id: `device-${device}`,
    test: (ctx) => ctx.device?.type === device,
    template,
    description: `设备类型: ${device}`,
    priority: 5
  }),
  
  /** 时间段条件 */
  timeRange: (startHour: number, endHour: number, template: string): TemplateCondition => ({
    id: `time-${startHour}-${endHour}`,
    test: (ctx) => {
      const hour = ctx.time?.hour ?? new Date().getHours()
      return hour >= startHour && hour < endHour
    },
    template,
    description: `时间段: ${startHour}:00 - ${endHour}:00`,
    priority: 3
  }),
  
  /** 功能标记条件 */
  hasFeature: (feature: string, template: string): TemplateCondition => ({
    id: `feature-${feature}`,
    test: (ctx) => ctx.features?.[feature] === true,
    template,
    description: `功能: ${feature}`,
    priority: 15
  }),
  
  /** 语言条件 */
  isLanguage: (language: string, template: string): TemplateCondition => ({
    id: `language-${language}`,
    test: (ctx) => ctx.geo?.language === language,
    template,
    description: `语言: ${language}`,
    priority: 8
  }),
  
  /** 自定义条件 */
  custom: (test: (ctx: TemplateContext) => boolean, template: string, options?: {
    id?: string
    description?: string
    priority?: number
  }): TemplateCondition => ({
    id: options?.id || 'custom',
    test,
    template,
    description: options?.description,
    priority: options?.priority || 0
  })
}

/**
 * A/B测试预设
 */
export function createABTest(
  id: string,
  variants: Array<{ template: string; weight?: number }>,
  options?: Partial<ABTestConfig>
): ABTestConfig {
  return {
    id,
    variants: variants.map((v, index) => ({
      id: `variant-${index}`,
      template: v.template,
      weight: v.weight || 1
    })),
    enabled: true,
    strategy: 'weighted',
    ...options
  }
}