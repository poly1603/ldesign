#!/usr/bin/env node

/**
 * API 设计规范修复工具
 * 
 * 自动修复组件API设计规范问题
 * 包括添加缺失的基础属性、统一类型导出等
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 基础属性模板
 */
const BASE_PROPS_TEMPLATE = `
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
  }`

/**
 * 尺寸属性模板
 */
const SIZE_PROP_TEMPLATE = `
  /**
   * 组件尺寸
   * @default 'medium'
   */
  size: {
    type: String as PropType<ComponentSize>,
    default: 'medium'
  },`

/**
 * 禁用属性模板
 */
const DISABLED_PROP_TEMPLATE = `
  /**
   * 是否禁用
   * @default false
   */
  disabled: {
    type: Boolean,
    default: false
  },`

/**
 * 类型导出模板
 */
const TYPE_EXPORTS_TEMPLATE = (componentName) => `
/**
 * ${componentName} Props 类型
 */
export type ${componentName}Props = ExtractPropTypes<typeof ${componentName.toLowerCase()}Props>

/**
 * ${componentName} Emits 类型
 */
export type ${componentName}Emits = typeof ${componentName.toLowerCase()}Emits

/**
 * ${componentName} 插槽定义
 */
export interface ${componentName}Slots {
  /**
   * 默认插槽
   */
  default?: () => any
}

/**
 * ${componentName} 实例类型
 */
export interface ${componentName}Instance {
  /**
   * 组件根元素
   */
  $el: HTMLElement
}`

/**
 * 需要尺寸属性的组件
 */
const COMPONENTS_WITH_SIZE = [
  'button', 'input', 'select', 'checkbox', 'radio', 'switch', 
  'tag', 'badge', 'loading', 'icon'
]

/**
 * 需要禁用属性的组件
 */
const COMPONENTS_WITH_DISABLED = [
  'button', 'input', 'select', 'checkbox', 'radio', 'switch', 
  'card', 'tag', 'loading', 'icon'
]

/**
 * 修复单个组件的API规范
 */
async function fixComponentAPI(componentName) {
  const typesFile = path.resolve(__dirname, '..', 'src', 'components', componentName, 'types.ts')
  
  if (!fs.existsSync(typesFile)) {
    console.log(`⚠️  组件 ${componentName} 的 types.ts 文件不存在`)
    return
  }

  console.log(`🔧 修复组件: ${componentName}`)
  
  let content = fs.readFileSync(typesFile, 'utf-8')
  let modified = false

  // 检查是否需要添加 ExtractPropTypes 导入
  if (!content.includes('ExtractPropTypes')) {
    content = content.replace(
      /import.*from 'vue'/,
      `import type { ExtractPropTypes, PropType } from 'vue'`
    )
    modified = true
  }

  // 检查是否缺少基础属性
  const needsClass = !content.includes('class:') && !content.includes('class?:')
  const needsStyle = !content.includes('style:') && !content.includes('style?:')
  const needsSize = COMPONENTS_WITH_SIZE.includes(componentName) && !content.includes('size:') && !content.includes('size?:')
  const needsDisabled = COMPONENTS_WITH_DISABLED.includes(componentName) && !content.includes('disabled:') && !content.includes('disabled?:')

  // 添加缺失的属性
  if (needsClass || needsStyle || needsSize || needsDisabled) {
    // 找到 props 定义的结束位置
    const propsEndMatch = content.match(/} as const\s*\n/)
    if (propsEndMatch) {
      const insertPos = propsEndMatch.index
      let insertContent = ''

      if (needsSize) {
        // 添加尺寸类型定义
        if (!content.includes(`${componentName}Size`)) {
          const typeDefPos = content.indexOf('export const')
          if (typeDefPos > 0) {
            const sizeTypeDef = `/**\n * ${componentName} 组件尺寸\n */\nexport type ${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Size = 'small' | 'medium' | 'large'\n\n`
            content = content.slice(0, typeDefPos) + sizeTypeDef + content.slice(typeDefPos)
            modified = true
          }
        }
        insertContent += SIZE_PROP_TEMPLATE.replace('ComponentSize', `${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Size`)
      }

      if (needsDisabled) {
        insertContent += DISABLED_PROP_TEMPLATE
      }

      if (needsClass || needsStyle) {
        insertContent += BASE_PROPS_TEMPLATE
      }

      if (insertContent) {
        content = content.slice(0, insertPos) + ',' + insertContent + '\n' + content.slice(insertPos)
        modified = true
      }
    }
  }

  // 检查是否缺少类型导出
  const capitalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1)
  const needsTypeExports = (
    !content.includes(`export type ${capitalizedName}Props`) ||
    !content.includes(`export type ${capitalizedName}Emits`) ||
    !content.includes(`export interface ${capitalizedName}Slots`) ||
    !content.includes(`export interface ${capitalizedName}Instance`)
  )

  if (needsTypeExports) {
    // 在文件末尾添加类型导出
    content += '\n' + TYPE_EXPORTS_TEMPLATE(capitalizedName)
    modified = true
  }

  // 检查事件定义是否需要 as const
  if (content.includes('Emits = {') && !content.includes('} as const')) {
    content = content.replace(/(\w+Emits = \{[^}]+\})/, '$1 as const')
    modified = true
  }

  if (modified) {
    fs.writeFileSync(typesFile, content)
    console.log(`  ✅ 已修复`)
  } else {
    console.log(`  ℹ️  无需修复`)
  }
}

/**
 * 修复所有组件
 */
async function fixAllComponents() {
  console.log('🚀 开始修复所有组件的API设计规范...\n')

  const componentsDir = path.resolve(__dirname, '..', 'src', 'components')
  const components = fs.readdirSync(componentsDir)
    .filter(item => {
      const itemPath = path.join(componentsDir, item)
      return fs.statSync(itemPath).isDirectory()
    })

  console.log(`找到 ${components.length} 个组件:`, components.join(', '))
  console.log('')

  for (const component of components) {
    try {
      await fixComponentAPI(component)
    } catch (error) {
      console.log(`  ❌ 修复失败: ${error.message}`)
    }
    console.log('')
  }

  console.log('🎉 所有组件API规范修复完成！')
  console.log('\n建议运行以下命令验证修复结果:')
  console.log('node scripts/check-api-standards.js')
}

// 运行修复
if (import.meta.url === `file://${process.argv[1]}` || 
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  fixAllComponents().catch(error => {
    console.error('修复过程中发生错误:', error)
    process.exit(1)
  })
}

export { fixAllComponents }
