#!/usr/bin/env node

/**
 * 组件创建脚本
 *
 * 用法：node scripts/create-component.js <component-name>
 * 示例：node scripts/create-component.js card
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 获取组件名称
const componentName = process.argv[2]

if (!componentName) {
  console.error('❌ 请提供组件名称')
  console.log('用法: node scripts/create-component.js <component-name>')
  console.log('示例: node scripts/create-component.js card')
  process.exit(1)
}

// 转换命名格式
const kebabCase = componentName.toLowerCase().replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
const PascalCase = componentName.charAt(0).toUpperCase() + componentName.slice(1).toLowerCase()
const camelCase = componentName.charAt(0).toLowerCase() + componentName.slice(1)

// 组件目录路径
const componentDir = path.join(__dirname, '../src/components', kebabCase)

// 检查组件是否已存在
if (fs.existsSync(componentDir)) {
  console.error(`❌ 组件 ${componentName} 已存在`)
  process.exit(1)
}

// 创建组件目录
fs.mkdirSync(componentDir, { recursive: true })

// 组件模板
const templates = {
  // Vue 组件模板
  vue: `<template>
  <div
    ref="${camelCase}Ref"
    :class="${camelCase}Classes"
    :style="style"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ${camelCase}Props, ${camelCase}Emits } from './types'
import type { ${PascalCase}Instance } from './types'

/**
 * ${PascalCase} 组件
 * 
 * TODO: 添加组件描述
 * 
 * @example
 * \`\`\`vue
 * <template>
 *   <l-${kebabCase}>
 *     内容
 *   </l-${kebabCase}>
 * </template>
 * \`\`\`
 */

// 组件名称
defineOptions({
  name: 'L${PascalCase}'
})

// Props 定义
const props = defineProps(${camelCase}Props)

// Emits 定义
const emit = defineEmits(${camelCase}Emits)

// 组件引用
const ${camelCase}Ref = ref<HTMLElement>()

// 计算类名
const ${camelCase}Classes = computed(() => {
  const classes = [
    'ld-${kebabCase}',
    \`ld-${kebabCase}--\${props.size}\`,
    {
      'ld-${kebabCase}--disabled': props.disabled
    }
  ]

  // 添加自定义类名
  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class)
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class)
    } else {
      Object.entries(props.class).forEach(([key, value]) => {
        if (value) {
          classes.push(key)
        }
      })
    }
  }

  return classes
})

// 暴露给父组件的方法和属性
defineExpose<${PascalCase}Instance>({
  $el: ${camelCase}Ref
})
</script>

<style lang="less">
@import './${kebabCase}.less';
</style>`,

  // 样式模板
  less: `/**
 * ${PascalCase} 组件样式
 */

@${kebabCase}-prefix: ~'ld-${kebabCase}';

.@{${kebabCase}-prefix} {
  position: relative;
  display: block;
  box-sizing: border-box;
  
  // 基础样式
  background-color: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ldesign-border-radius-base);
  color: var(--ldesign-text-color-primary);
  transition: all var(--ldesign-transition-base);
  
  // 大小变体
  &--small {
    padding: var(--ldesign-spacing-xs);
    font-size: var(--ldesign-font-size-sm);
  }
  
  &--medium {
    padding: var(--ldesign-spacing-sm);
    font-size: var(--ldesign-font-size-base);
  }
  
  &--large {
    padding: var(--ldesign-spacing-base);
    font-size: var(--ldesign-font-size-lg);
  }
  
  // 禁用状态
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  // 悬停状态
  &:hover:not(.@{${kebabCase}-prefix}--disabled) {
    border-color: var(--ldesign-border-level-2-color);
  }
}`,

  // 类型定义模板
  types: `/**
 * ${PascalCase} 组件类型定义
 */

import type { ExtractPropTypes, PropType } from 'vue'

/**
 * ${PascalCase} 组件大小
 */
export type ${PascalCase}Size = 'small' | 'medium' | 'large'

/**
 * ${PascalCase} Props 定义
 */
export const ${camelCase}Props = {
  /**
   * 组件大小
   */
  size: {
    type: String as PropType<${PascalCase}Size>,
    default: 'medium'
  },
  
  /**
   * 是否禁用
   */
  disabled: {
    type: Boolean,
    default: false
  },
  
  /**
   * 自定义类名
   */
  class: {
    type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    default: undefined
  },
  
  /**
   * 自定义样式
   */
  style: {
    type: [String, Object] as PropType<string | Record<string, any>>,
    default: undefined
  }
} as const

/**
 * ${PascalCase} Emits 定义
 */
export const ${camelCase}Emits = {
  // TODO: 添加事件定义
  // click: (event: MouseEvent) => event instanceof MouseEvent
}

/**
 * ${PascalCase} Props 类型
 */
export type ${PascalCase}Props = ExtractPropTypes<typeof ${camelCase}Props>

/**
 * ${PascalCase} Emits 类型
 */
export type ${PascalCase}Emits = typeof ${camelCase}Emits

/**
 * ${PascalCase} 实例类型
 */
export interface ${PascalCase}Instance {
  /** 组件根元素 */
  $el: HTMLElement
  // TODO: 添加实例方法
}`,

  // 导出文件模板
  index: `/**
 * ${PascalCase} 组件入口文件
 */

import type { App } from 'vue'
import ${PascalCase} from './${PascalCase}.vue'
import type { ${PascalCase}Props, ${PascalCase}Instance } from './types'

// 组件安装函数
${PascalCase}.install = (app: App): void => {
  app.component(${PascalCase}.name!, ${PascalCase})
}

// 导出组件
export default ${PascalCase}

// 导出类型
export type { ${PascalCase}Props, ${PascalCase}Instance }
export * from './types'`,

  // 测试文件模板
  test: `/**
 * ${PascalCase} 组件测试
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ${PascalCase} from './${PascalCase}.vue'

describe('${PascalCase}', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      const wrapper = mount(${PascalCase})
      expect(wrapper.classes()).toContain('ld-${kebabCase}')
    })
    
    it('should render with custom class', () => {
      const wrapper = mount(${PascalCase}, {
        props: {
          class: 'custom-class'
        }
      })
      expect(wrapper.classes()).toContain('custom-class')
    })
  })
  
  describe('Props', () => {
    it('should handle size prop correctly', () => {
      const wrapper = mount(${PascalCase}, {
        props: {
          size: 'large'
        }
      })
      expect(wrapper.classes()).toContain('ld-${kebabCase}--large')
    })
    
    it('should handle disabled prop correctly', () => {
      const wrapper = mount(${PascalCase}, {
        props: {
          disabled: true
        }
      })
      expect(wrapper.classes()).toContain('ld-${kebabCase}--disabled')
    })
  })
  
  // TODO: 添加更多测试用例
})`,

  // README 模板
  readme: `# ${PascalCase} 组件

TODO: 添加组件描述

## 基础用法

\`\`\`vue
<template>
  <l-${kebabCase}>
    基础用法
  </l-${kebabCase}>
</template>
\`\`\`

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| size | 组件大小 | \`'small' \\| 'medium' \\| 'large'\` | \`'medium'\` |
| disabled | 是否禁用 | \`boolean\` | \`false\` |
| class | 自定义类名 | \`string \\| string[] \\| Record<string, boolean>\` | \`undefined\` |
| style | 自定义样式 | \`string \\| Record<string, any>\` | \`undefined\` |

### Events

TODO: 添加事件文档

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 默认插槽 |

### Methods

TODO: 添加方法文档

## 主题定制

TODO: 添加主题定制说明

## 无障碍访问

TODO: 添加无障碍访问说明`
}

// 创建文件
const files = [
  { name: `${PascalCase}.vue`, content: templates.vue },
  { name: `${kebabCase}.less`, content: templates.less },
  { name: 'types.ts', content: templates.types },
  { name: 'index.ts', content: templates.index },
  { name: `${PascalCase}.test.ts`, content: templates.test },
  { name: 'README.md', content: templates.readme }
]

files.forEach(file => {
  const filePath = path.join(componentDir, file.name)
  fs.writeFileSync(filePath, file.content)
})

console.log(`✅ 组件 ${PascalCase} 创建成功！`)
console.log(`📁 组件目录: ${componentDir}`)
console.log('')
console.log('📝 接下来的步骤:')
console.log(`1. 完善组件实现 (${PascalCase}.vue)`)
console.log(`2. 完善样式定义 (${kebabCase}.less)`)
console.log(`3. 完善类型定义 (types.ts)`)
console.log(`4. 编写测试用例 (${PascalCase}.test.ts)`)
console.log(`5. 完善组件文档 (README.md)`)
console.log(`6. 在 src/index.ts 中导出组件`)
console.log('')
console.log('🚀 开始开发吧！')
