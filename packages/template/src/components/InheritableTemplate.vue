<script setup lang="ts">
import type { MergeStrategy, TemplateBlock } from '../core/inheritance'
import type { Template } from '../types'
import { computed, onBeforeUnmount, watch } from 'vue'
import { useTemplateInheritance } from '../composables/useTemplateInheritance'

/**
 * 组件属性
 */
interface Props {
  /**
   * 模板
   */
  template: Template
  
  /**
   * 父模板
   */
  extends?: Template | string
  
  /**
   * 混入列表
   */
  mixins?: (Template | string)[]
  
  /**
   * 合并策略
   */
  mergeStrategy?: MergeStrategy
  
  /**
   * 模板块定义
   */
  blocks?: TemplateBlock[]
  
  /**
   * 块覆盖
   */
  blockOverrides?: Record<string, any>
  
  /**
   * 组件属性
   */
  componentProps?: Record<string, any>
  
  /**
   * 内容属性
   */
  contentProps?: Record<string, any>
  
  /**
   * 是否显示调试信息
   */
  showDebug?: boolean
  
  /**
   * 是否自动注册
   */
  autoRegister?: boolean
  
  /**
   * CSS类名
   */
  className?: string
  
  /**
   * 最大继承深度
   */
  maxDepth?: number
}

const props = withDefaults(defineProps<Props>(), {
  mixins: () => [],
  mergeStrategy: () => ({}),
  blocks: () => [],
  blockOverrides: () => ({}),
  componentProps: () => ({}),
  contentProps: () => ({}),
  showDebug: false,
  autoRegister: true,
  maxDepth: 10
})

/**
 * 事件
 */
const emit = defineEmits<{
  /**
   * 继承完成
   */
  'inherited': [template: Template]
  
  /**
   * 块覆盖
   */
  'blockOverride': [name: string, success: boolean]
  
  /**
   * 深度超限
   */
  'depthExceeded': [depth: number]
}>()

// 使用模板继承
const {
  template: processedTemplate,
  isInherited,
  inheritanceChain,
  blocks,
  // context, // Removing unused variable
  defineBlock,
  overrideBlock,
  getBlock,
  renderBlock,
  getDepth,
  cleanup
} = useTemplateInheritance(props.template, {
  extends: props.extends,
  mixins: props.mixins,
  mergeStrategy: props.mergeStrategy,
  allowOverride: true,
  maxDepth: props.maxDepth,
  autoRegister: props.autoRegister,
  enableBlocks: true,
  blockOverrides: props.blockOverrides,
  trackChain: props.showDebug
})

// 注册块
if (props.blocks.length > 0) {
  props.blocks.forEach(block => {
    defineBlock(block)
  })
}

// 计算属性
const cssClasses = computed(() => {
  const classes = []
  
  if (props.className) {
    classes.push(props.className)
  }
  
  if (isInherited.value) {
    classes.push('is-inherited')
  }
  
  if (props.extends) {
    classes.push('has-parent')
  }
  
  if (props.mixins.length > 0) {
    classes.push('has-mixins')
  }
  
  return classes
})

// 继承的内容
const inheritedContent = computed(() => {
  if (!isInherited.value) {
    return null
  }
  
  return processedTemplate.value.component
})

// 深度
const depth = computed(() => getDepth())

// 检查是否有块
const hasBlock = (name: string): boolean => {
  return blocks.has(name)
}

// 监听继承变化
watch(
  () => processedTemplate.value,
  (newTemplate) => {
    if (isInherited.value) {
      emit('inherited', newTemplate)
    }
  }
)

// 监听深度
watch(
  depth,
  (newDepth) => {
    if (newDepth > props.maxDepth) {
      emit('depthExceeded', newDepth)
    }
  }
)

// 暴露方法
defineExpose({
  /**
   * 覆盖块
   */
  overrideBlock: (name: string, content: any) => {
    const success = overrideBlock(name, content)
    emit('blockOverride', name, success)
    return success
  },
  
  /**
   * 获取块
   */
  getBlock,
  
  /**
   * 获取处理后的模板
   */
  getProcessedTemplate: () => processedTemplate.value,
  
  /**
   * 获取继承链
   */
  getInheritanceChain: () => inheritanceChain.value,
  
  /**
   * 获取深度
   */
  getDepth
})

// 清理
onBeforeUnmount(() => {
  cleanup()
})
</script>

<template>
  <div class="inheritable-template" :class="cssClasses">
    <!-- 头部块 -->
    <template v-if="hasBlock('header')">
      <component :is="renderBlock('header')" />
    </template>
    
    <!-- 主内容 -->
    <div class="template-content">
      <slot name="before-content" />
      
      <!-- 继承的内容 -->
      <template v-if="inheritedContent">
        <component :is="inheritedContent" v-bind="contentProps" />
      </template>
      
      <!-- 默认内容 -->
      <slot v-else>
        <component 
          :is="template.component"
          v-if="template.component"
          v-bind="componentProps"
        />
      </slot>
      
      <slot name="after-content" />
    </div>
    
    <!-- 底部块 -->
    <template v-if="hasBlock('footer')">
      <component :is="renderBlock('footer')" />
    </template>
    
    <!-- 调试信息 -->
    <div v-if="showDebug" class="inheritance-debug">
      <div class="debug-info">
        <h4>Inheritance Chain</h4>
        <ul>
          <li v-for="(item, index) in inheritanceChain" :key="index">
            {{ item }}
          </li>
        </ul>
        <p>Depth: {{ depth }}</p>
        <p>Is Inherited: {{ isInherited }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inheritable-template {
  position: relative;
}

.template-content {
  min-height: 100px;
}

/* 继承状态 */
.inheritable-template.is-inherited {
  border: 1px dashed var(--color-primary-light);
}

.inheritable-template.has-parent::before {
  content: 'extends';
  position: absolute;
  top: -10px;
  left: 10px;
  font-size: 10px;
  color: var(--color-text-secondary);
  background: white;
  padding: 0 4px;
}

.inheritable-template.has-mixins::after {
  content: 'mixins';
  position: absolute;
  top: -10px;
  right: 10px;
  font-size: 10px;
  color: var(--color-text-secondary);
  background: white;
  padding: 0 4px;
}

/* 调试信息 */
.inheritance-debug {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #f9f9f9;
}

.debug-info h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.debug-info ul {
  margin: 0;
  padding-left: 20px;
}

.debug-info li {
  font-size: 12px;
  color: #888;
  line-height: 1.5;
}

.debug-info p {
  margin: 5px 0;
  font-size: 12px;
  color: #888;
}
</style>