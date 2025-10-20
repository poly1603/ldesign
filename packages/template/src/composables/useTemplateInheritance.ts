/**
 * 模板继承组合式函数
 */

import type { InjectionKey } from 'vue';
import type {
  MergeStrategy,
  TemplateBlock,
  TemplateInheritanceConfig} from '../core/inheritance';
import type { Template } from '../types'
import { computed, inject, provide, reactive, ref, watch } from 'vue'
import {
  blockManager,
  createInheritableTemplate,
  inheritanceManager
} from '../core/inheritance'

/**
 * 模板继承上下文
 */
export interface TemplateInheritanceContext {
  /**
   * 父模板
   */
  parent?: Template
  
  /**
   * 混入列表
   */
  mixins: Template[]
  
  /**
   * 合并策略
   */
  mergeStrategy: MergeStrategy
  
  /**
   * 模板块
   */
  blocks: Map<string, TemplateBlock>
  
  /**
   * 继承深度
   */
  depth: number
}

// 注入键
const InheritanceContextKey: InjectionKey<TemplateInheritanceContext> = Symbol('TemplateInheritance')

/**
 * 模板继承选项
 */
export interface UseTemplateInheritanceOptions extends TemplateInheritanceConfig {
  /**
   * 是否自动注册
   */
  autoRegister?: boolean
  
  /**
   * 是否启用块继承
   */
  enableBlocks?: boolean
  
  /**
   * 块覆盖映射
   */
  blockOverrides?: Record<string, any>
  
  /**
   * 继承链追踪
   */
  trackChain?: boolean
}

/**
 * 使用模板继承
 */
export function useTemplateInheritance(
  template: Template,
  options: UseTemplateInheritanceOptions = {}
) {
  // 状态
  const isInherited = ref(false)
  const inheritanceChain = ref<string[]>([])
  const activeBlocks = reactive(new Map<string, TemplateBlock>())
  
  // 获取或创建上下文
  const parentContext = inject(InheritanceContextKey, null)
  
  // 创建当前上下文
  const context = reactive<TemplateInheritanceContext>({
    parent: options.extends as Template | undefined,
    mixins: (options.mixins || []) as Template[],
    mergeStrategy: options.mergeStrategy || {},
    blocks: activeBlocks,
    depth: (parentContext?.depth || 0) + 1
  })
  
  // 提供上下文给子组件
  provide(InheritanceContextKey, context)
  
  // 处理的模板
  const processedTemplate = computed(() => {
    if (!options.extends && !options.mixins?.length) {
      return template
    }
    
    return createInheritableTemplate(template, options)
  })
  
  // 注册模板
  if (options.autoRegister && template.id) {
    inheritanceManager.registerTemplate(template.id, template)
  }
  
  // 处理模板块
  if (options.enableBlocks && template.id) {
    // 注册块覆盖
    if (options.blockOverrides) {
      Object.entries(options.blockOverrides).forEach(([name, content]) => {
        blockManager.overrideBlock(template.id!, name, content)
      })
    }
  }
  
  // 追踪继承链
  if (options.trackChain) {
    const chain: string[] = []
    
    // 添加当前模板
    if (template.id) {
      chain.push(template.id)
    }
    
    // 添加父模板
    if (options.extends) {
      const parentId = typeof options.extends === 'string' 
        ? options.extends 
        : options.extends.id
      if (parentId) {
        chain.unshift(parentId)
      }
    }
    
    // 添加混入
    if (options.mixins) {
      options.mixins.forEach(mixin => {
        const mixinId = typeof mixin === 'string' ? mixin : mixin.id
        if (mixinId) {
          chain.push(`mixin:${mixinId}`)
        }
      })
    }
    
    inheritanceChain.value = chain
  }
  
  // 检查是否被继承
  watch(
    () => processedTemplate.value,
    (newTemplate) => {
      isInherited.value = newTemplate !== template
    },
    { immediate: true }
  )
  
  /**
   * 扩展当前模板
   */
  const extend = (config: TemplateInheritanceConfig): Template => {
    return inheritanceManager.extendTemplate(processedTemplate.value, config)
  }
  
  /**
   * 创建混入
   */
  const mixin = (id: string, mixinTemplate: Partial<Template>): void => {
    inheritanceManager.createMixin(id, mixinTemplate)
  }
  
  /**
   * 定义块
   */
  const defineBlock = (block: TemplateBlock): void => {
    if (!template.id) {
      console.warn('Template must have an id to define blocks')
      return
    }
    
    blockManager.defineBlock(template.id, block)
    activeBlocks.set(block.name, block)
  }
  
  /**
   * 覆盖块
   */
  const overrideBlock = (name: string, content: any): boolean => {
    if (!template.id) {
      console.warn('Template must have an id to override blocks')
      return false
    }
    
    const success = blockManager.overrideBlock(template.id, name, content)
    if (success) {
      const block = blockManager.getBlock(template.id, name)
      if (block) {
        activeBlocks.set(name, block)
      }
    }
    
    return success
  }
  
  /**
   * 获取块
   */
  const getBlock = (name: string): TemplateBlock | undefined => {
    if (!template.id) return undefined
    return blockManager.getBlock(template.id, name)
  }
  
  /**
   * 渲染块
   */
  const renderBlock = (name: string) => {
    if (!template.id) return null
    return blockManager.renderBlock(template.id, name)
  }
  
  /**
   * 获取父模板
   */
  const getParent = (): Template | undefined => {
    return context.parent
  }
  
  /**
   * 获取混入
   */
  const getMixins = (): Template[] => {
    return context.mixins
  }
  
  /**
   * 获取继承深度
   */
  const getDepth = (): number => {
    return context.depth
  }
  
  /**
   * 清理
   */
  const cleanup = (): void => {
    if (template.id) {
      blockManager.clearBlocks(template.id)
    }
    activeBlocks.clear()
  }
  
  return {
    // 状态
    template: processedTemplate,
    isInherited,
    inheritanceChain,
    blocks: activeBlocks,
    context,
    
    // 方法
    extend,
    mixin,
    defineBlock,
    overrideBlock,
    getBlock,
    renderBlock,
    getParent,
    getMixins,
    getDepth,
    cleanup
  }
}

/**
 * 使用模板块
 */
export function useTemplateBlocks(templateId: string) {
  const blocks = ref<TemplateBlock[]>([])
  const blockMap = reactive(new Map<string, TemplateBlock>())
  
  // 加载块
  const loadBlocks = () => {
    const loadedBlocks = blockManager.getBlocks(templateId)
    blocks.value = loadedBlocks
    blockMap.clear()
    loadedBlocks.forEach(block => {
      blockMap.set(block.name, block)
    })
  }
  
  // 初始加载
  loadBlocks()
  
  /**
   * 定义新块
   */
  const define = (block: TemplateBlock) => {
    blockManager.defineBlock(templateId, block)
    loadBlocks()
  }
  
  /**
   * 覆盖块内容
   */
  const override = (name: string, content: any): boolean => {
    const success = blockManager.overrideBlock(templateId, name, content)
    if (success) {
      loadBlocks()
    }
    return success
  }
  
  /**
   * 获取块
   */
  const get = (name: string): TemplateBlock | undefined => {
    return blockMap.get(name)
  }
  
  /**
   * 渲染块
   */
  const render = (name: string) => {
    return blockManager.renderBlock(templateId, name)
  }
  
  /**
   * 检查块是否存在
   */
  const has = (name: string): boolean => {
    return blockMap.has(name)
  }
  
  /**
   * 清除所有块
   */
  const clear = () => {
    blockManager.clearBlocks(templateId)
    blocks.value = []
    blockMap.clear()
  }
  
  return {
    blocks,
    blockMap,
    define,
    override,
    get,
    render,
    has,
    clear,
    refresh: loadBlocks
  }
}

/**
 * 使用模板混入
 */
export function useTemplateMixins() {
  const mixins = reactive(new Map<string, Partial<Template>>())
  
  /**
   * 注册混入
   */
  const register = (id: string, mixin: Partial<Template>) => {
    inheritanceManager.createMixin(id, mixin)
    mixins.set(id, mixin)
  }
  
  /**
   * 获取混入
   */
  const get = (id: string): Partial<Template> | undefined => {
    return inheritanceManager.getMixin(id)
  }
  
  /**
   * 应用混入到模板
   */
  const apply = (
    template: Template,
    mixinIds: string[],
    strategy?: MergeStrategy
  ): Template => {
    return inheritanceManager.extendTemplate(template, {
      mixins: mixinIds,
      mergeStrategy: strategy
    })
  }
  
  /**
   * 创建组合混入
   */
  const compose = (
    id: string,
    mixinIds: string[],
    additional?: Partial<Template>
  ): void => {
    const composedMixin: Partial<Template> = {}
    
    // 合并所有混入
    mixinIds.forEach(mixinId => {
      const mixin = get(mixinId)
      if (mixin) {
        Object.assign(composedMixin, mixin)
      }
    })
    
    // 添加额外配置
    if (additional) {
      Object.assign(composedMixin, additional)
    }
    
    register(id, composedMixin)
  }
  
  /**
   * 检查混入是否存在
   */
  const has = (id: string): boolean => {
    return mixins.has(id)
  }
  
  /**
   * 获取所有混入
   */
  const getAll = (): Map<string, Partial<Template>> => {
    return mixins
  }
  
  return {
    mixins,
    register,
    get,
    apply,
    compose,
    has,
    getAll
  }
}