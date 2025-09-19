#!/usr/bin/env node

/**
 * TypeScript 类型系统增强工具
 * 
 * 自动为组件添加泛型支持和优化类型定义
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 需要泛型支持的组件配置
 */
const GENERIC_COMPONENTS = {
  input: {
    valueType: 'T = string | number',
    description: '支持不同类型的输入值'
  },
  select: {
    valueType: 'T = string | number',
    description: '支持不同类型的选项值'
  },
  checkbox: {
    valueType: 'T = boolean',
    description: '支持不同类型的选中值'
  },
  radio: {
    valueType: 'T = string | number',
    description: '支持不同类型的选中值'
  },
  switch: {
    valueType: 'T = boolean',
    description: '支持不同类型的开关值'
  },
  form: {
    valueType: 'T = Record<string, any>',
    description: '支持不同类型的表单数据'
  }
}

/**
 * 类型工具函数模板
 */
const TYPE_UTILITIES_TEMPLATE = `
/**
 * 组件类型工具函数
 */

/**
 * 提取组件 Props 类型
 */
export type ExtractComponentProps<T> = T extends { props: infer P } ? P : never

/**
 * 提取组件 Emits 类型
 */
export type ExtractComponentEmits<T> = T extends { emits: infer E } ? E : never

/**
 * 提取组件实例类型
 */
export type ExtractComponentInstance<T> = T extends { __VLS_ctx: infer I } ? I : never

/**
 * 组件 Ref 类型
 */
export type ComponentRef<T> = T extends abstract new (...args: any) => infer I ? I : never

/**
 * 可选属性类型
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 必需属性类型
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] }

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 深度可选类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 值类型提取
 */
export type ValueOf<T> = T[keyof T]

/**
 * 函数参数类型提取
 */
export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never

/**
 * 函数返回值类型提取
 */
export type ReturnType<F extends Function> = F extends (...args: any[]) => infer R ? R : never

/**
 * 事件处理器类型
 */
export type EventHandler<T extends Event = Event> = (event: T) => void | Promise<void>

/**
 * 异步函数类型
 */
export type AsyncFunction<T extends any[] = any[], R = any> = (...args: T) => Promise<R>

/**
 * 组件插槽类型
 */
export type ComponentSlot<T = any> = (props: T) => VNode | VNode[]

/**
 * 主题相关类型
 */
export type ThemeMode = 'light' | 'dark' | 'auto'
export type ThemeSize = 'small' | 'medium' | 'large'
export type ThemeStatus = 'default' | 'primary' | 'success' | 'warning' | 'error'

/**
 * 响应式断点类型
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

/**
 * CSS 相关类型
 */
export type CSSProperties = Record<string, string | number>
export type ClassName = string | string[] | Record<string, boolean>
export type StyleValue = string | CSSProperties
`

/**
 * 增强组件类型定义
 */
async function enhanceComponentTypes(componentName) {
  const typesFile = path.resolve(__dirname, '..', 'src', 'components', componentName, 'types.ts')
  
  if (!fs.existsSync(typesFile)) {
    console.log(`⚠️  组件 ${componentName} 的 types.ts 文件不存在`)
    return
  }

  console.log(`🔧 增强组件类型: ${componentName}`)
  
  let content = fs.readFileSync(typesFile, 'utf-8')
  let modified = false

  // 检查是否需要添加泛型支持
  const genericConfig = GENERIC_COMPONENTS[componentName]
  if (genericConfig && !content.includes('<T')) {
    console.log(`  ✨ 添加泛型支持: ${genericConfig.description}`)
    
    // 添加泛型接口
    const genericInterface = generateGenericInterface(componentName, genericConfig)
    content += '\n' + genericInterface
    modified = true
  }

  // 检查是否需要添加类型工具函数
  if (!content.includes('ExtractComponentProps')) {
    console.log(`  🛠️  添加类型工具函数`)
    
    // 在文件末尾添加类型工具函数的引用
    const utilityImport = `\n// 类型工具函数\nexport * from '../../types/utilities'\n`
    content += utilityImport
    modified = true
  }

  // 优化现有类型定义
  const optimizedContent = optimizeTypeDefinitions(content, componentName)
  if (optimizedContent !== content) {
    content = optimizedContent
    modified = true
    console.log(`  🎯 优化类型定义`)
  }

  if (modified) {
    fs.writeFileSync(typesFile, content)
    console.log(`  ✅ 类型增强完成`)
  } else {
    console.log(`  ℹ️  无需增强`)
  }
}

/**
 * 生成泛型接口
 */
function generateGenericInterface(componentName, config) {
  const capitalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1)
  
  return `
/**
 * 泛型 ${capitalizedName} 组件接口
 * ${config.description}
 */
export interface Generic${capitalizedName}Props<${config.valueType}> {
  modelValue?: T
  // 其他属性继承自基础 Props
  // 可以根据需要扩展特定的泛型属性
}

/**
 * 泛型 ${capitalizedName} 事件接口
 */
export interface Generic${capitalizedName}Emits<${config.valueType}> {
  'update:modelValue': (value: T) => void
  change: (value: T, oldValue: T) => void
}

/**
 * 泛型 ${capitalizedName} 实例接口
 */
export interface Generic${capitalizedName}Instance<${config.valueType}> {
  getValue(): T
  setValue(value: T): void
  focus(): void
  blur(): void
}
`
}

/**
 * 优化类型定义
 */
function optimizeTypeDefinitions(content, componentName) {
  let optimized = content

  // 替换 any 类型为更具体的类型
  optimized = optimized.replace(/:\s*any\b/g, ': unknown')
  
  // 优化事件处理器类型
  optimized = optimized.replace(
    /\(event:\s*Event\)/g,
    '(event: Event)'
  )
  
  // 优化插槽类型
  optimized = optimized.replace(
    /\(\)\s*=>\s*any/g,
    '() => VNode | VNode[]'
  )
  
  // 添加必要的导入
  if (optimized.includes('VNode') && !optimized.includes('import.*VNode')) {
    optimized = optimized.replace(
      /import type \{([^}]+)\} from 'vue'/,
      "import type { $1, VNode } from 'vue'"
    )
  }

  return optimized
}

/**
 * 创建类型工具文件
 */
function createTypeUtilities() {
  const utilitiesFile = path.resolve(__dirname, '..', 'src', 'types', 'utilities.ts')
  
  if (!fs.existsSync(utilitiesFile)) {
    console.log('📝 创建类型工具文件')
    
    const content = `/**
 * TypeScript 类型工具函数
 * 
 * 提供组件库开发中常用的类型工具函数
 */

import type { VNode } from 'vue'
${TYPE_UTILITIES_TEMPLATE}
`
    
    fs.writeFileSync(utilitiesFile, content)
    console.log('✅ 类型工具文件创建完成')
  }
}

/**
 * 增强所有组件类型
 */
async function enhanceAllComponentTypes() {
  console.log('🚀 开始增强 TypeScript 类型系统...\n')

  // 创建类型工具文件
  createTypeUtilities()
  console.log('')

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
      await enhanceComponentTypes(component)
    } catch (error) {
      console.log(`  ❌ 增强失败: ${error.message}`)
    }
    console.log('')
  }

  console.log('🎉 TypeScript 类型系统增强完成！')
  console.log('\n建议运行以下命令验证类型定义:')
  console.log('npx tsc --noEmit')
  console.log('node scripts/check-typescript-types.js')
}

// 运行增强
if (import.meta.url === `file://${process.argv[1]}` || 
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  enhanceAllComponentTypes().catch(error => {
    console.error('增强过程中发生错误:', error)
    process.exit(1)
  })
}

export { enhanceAllComponentTypes }
