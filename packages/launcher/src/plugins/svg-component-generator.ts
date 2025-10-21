/**
 * SVG 组件生成器插件
 * 
 * 根据项目类型将 SVG 文件转换为对应框架的组件
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Plugin } from 'vite'
import { Logger } from '../utils/logger'
import fs from 'node:fs/promises'
import path from 'node:path'

export interface SVGComponentOptions {
  /** SVG 源目录 */
  sourceDir?: string
  /** 输出目录 */
  outputDir?: string
  /** 项目类型（自动检测或手动指定） */
  framework?: 'vue' | 'react' | 'svelte' | 'angular' | 'auto'
  /** 组件名称前缀 */
  componentPrefix?: string
  /** 组件名称后缀 */
  componentSuffix?: string
  /** 是否生成 TypeScript */
  typescript?: boolean
  /** 是否优化 SVG */
  optimize?: boolean
  /** 是否生成索引文件 */
  generateIndex?: boolean
  /** SVG 优化选项 */
  svgoOptions?: any
  /** 自定义模板 */
  customTemplate?: string
}

export interface SVGComponentInfo {
  /** 原始文件名 */
  originalName: string
  /** 组件名称 */
  componentName: string
  /** 生成的文件路径 */
  outputPath: string
  /** SVG 内容 */
  svgContent: string
  /** 组件代码 */
  componentCode: string
}

export class SVGComponentGenerator {
  private logger: Logger
  private options: Required<Omit<SVGComponentOptions, 'customTemplate' | 'svgoOptions'>> & 
    Pick<SVGComponentOptions, 'customTemplate' | 'svgoOptions'>
  private detectedFramework: string = 'vue'

  constructor(options: SVGComponentOptions = {}) {
    this.logger = new Logger('SVGComponentGenerator')
    this.options = {
      sourceDir: './src/assets/icons',
      outputDir: './src/components/icons',
      framework: 'auto',
      componentPrefix: 'Icon',
      componentSuffix: '',
      typescript: true,
      optimize: true,
      generateIndex: true,
      customTemplate: options.customTemplate,
      svgoOptions: options.svgoOptions,
      ...options
    }
  }

  /**
   * 生成 SVG 组件
   */
  async generateComponents(): Promise<SVGComponentInfo[]> {
    this.logger.info('开始生成 SVG 组件...')

    try {
      // 检测项目框架
      if (this.options.framework === 'auto') {
        this.detectedFramework = await this.detectFramework()
      } else {
        this.detectedFramework = this.options.framework
      }

      this.logger.info(`检测到框架: ${this.detectedFramework}`)

      // 确保输出目录存在
      await fs.mkdir(this.options.outputDir, { recursive: true })

      // 扫描 SVG 文件
      const svgFiles = await this.scanSVGFiles()
      
      if (svgFiles.length === 0) {
        this.logger.warn('未找到 SVG 文件')
        return []
      }

      this.logger.info(`找到 ${svgFiles.length} 个 SVG 文件`)

      // 生成组件
      const componentInfos: SVGComponentInfo[] = []
      for (const svgFile of svgFiles) {
        const componentInfo = await this.generateSingleComponent(svgFile)
        if (componentInfo) {
          componentInfos.push(componentInfo)
        }
      }

      // 生成索引文件
      if (this.options.generateIndex) {
        await this.generateIndexFile(componentInfos)
      }

      this.logger.success(`SVG 组件生成完成，共处理 ${componentInfos.length} 个文件`)
      return componentInfos

    } catch (error) {
      this.logger.error('SVG 组件生成失败', { error: (error as Error).message })
      throw error
    }
  }

  /**
   * 检测项目框架
   */
  private async detectFramework(): Promise<string> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json')
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

      if (deps.vue) return 'vue'
      if (deps.react) return 'react'
      if (deps.svelte) return 'svelte'
      if (deps['@angular/core']) return 'angular'

      return 'vue' // 默认
    } catch {
      return 'vue'
    }
  }

  /**
   * 扫描 SVG 文件
   */
  private async scanSVGFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.options.sourceDir, { recursive: true })
      return files
        .filter(file => typeof file === 'string' && file.endsWith('.svg'))
        .map(file => path.join(this.options.sourceDir, file as string))
    } catch {
      return []
    }
  }

  /**
   * 生成单个组件
   */
  private async generateSingleComponent(svgPath: string): Promise<SVGComponentInfo | null> {
    try {
      const fileName = path.basename(svgPath, '.svg')
      const componentName = this.generateComponentName(fileName)
      
      this.logger.debug(`生成组件: ${componentName}`)

      // 读取和优化 SVG
      let svgContent = await fs.readFile(svgPath, 'utf8')
      
      if (this.options.optimize) {
        svgContent = await this.optimizeSVG(svgContent)
      }

      // 生成组件代码
      const componentCode = this.generateComponentCode(componentName, svgContent)
      
      // 确定输出路径
      const extension = this.options.typescript ? 
        (this.detectedFramework === 'vue' ? '.vue' : '.tsx') : 
        (this.detectedFramework === 'vue' ? '.vue' : '.jsx')
      
      const outputPath = path.join(this.options.outputDir, `${componentName}${extension}`)
      
      // 写入文件
      await fs.writeFile(outputPath, componentCode)

      return {
        originalName: fileName,
        componentName,
        outputPath,
        svgContent,
        componentCode
      }

    } catch (error) {
      this.logger.error(`生成组件失败: ${svgPath}`, { error: (error as Error).message })
      return null
    }
  }

  /**
   * 生成组件名称
   */
  private generateComponentName(fileName: string): string {
    // 转换为 PascalCase
    const pascalCase = fileName
      .split(/[-_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')

    return `${this.options.componentPrefix}${pascalCase}${this.options.componentSuffix}`
  }

  /**
   * 优化 SVG
   */
  private async optimizeSVG(svgContent: string): Promise<string> {
    try {
      // 简单的 SVG 优化
      return svgContent
        .replace(/\s+/g, ' ') // 压缩空白
        .replace(/<!--[\s\S]*?-->/g, '') // 移除注释
        .replace(/\s*([<>])\s*/g, '$1') // 移除标签周围的空白
        .trim()
    } catch {
      return svgContent
    }
  }

  /**
   * 生成组件代码
   */
  private generateComponentCode(componentName: string, svgContent: string): string {
    if (this.options.customTemplate) {
      return this.options.customTemplate
        .replace(/\{\{componentName\}\}/g, componentName)
        .replace(/\{\{svgContent\}\}/g, svgContent)
    }

    switch (this.detectedFramework) {
      case 'vue':
        return this.generateVueComponent(componentName, svgContent)
      case 'react':
        return this.generateReactComponent(componentName, svgContent)
      case 'svelte':
        return this.generateSvelteComponent(componentName, svgContent)
      case 'angular':
        return this.generateAngularComponent(componentName, svgContent)
      default:
        return this.generateVueComponent(componentName, svgContent)
    }
  }

  /**
   * 生成 Vue 组件
   */
  private generateVueComponent(componentName: string, svgContent: string): string {
    // 提取 SVG 属性和内容
    const svgMatch = svgContent.match(/<svg([^>]*)>([\s\S]*)<\/svg>/i)
    if (!svgMatch) return ''

    const svgAttrs = svgMatch[1]
    const svgInner = svgMatch[2]

    const template = `<template>
  <svg
    ${svgAttrs}
    :class="className"
    :style="style"
    v-bind="$attrs"
  >
    ${svgInner}
  </svg>
</template>

<script${this.options.typescript ? ' lang="ts"' : ''}>
${this.options.typescript ? `
import { defineComponent } from 'vue'

export default defineComponent({
  name: '${componentName}',
  inheritAttrs: false,
  props: {
    className: {
      type: String,
      default: ''
    },
    style: {
      type: Object,
      default: () => ({})
    }
  }
})
` : `
export default {
  name: '${componentName}',
  inheritAttrs: false,
  props: {
    className: {
      type: String,
      default: ''
    },
    style: {
      type: Object,
      default: () => ({})
    }
  }
}
`}
</script>`

    return template
  }

  /**
   * 生成 React 组件
   */
  private generateReactComponent(componentName: string, svgContent: string): string {
    // 转换 SVG 属性为 React 格式
    const reactSvg = svgContent
      .replace(/class=/g, 'className=')
      .replace(/stroke-width=/g, 'strokeWidth=')
      .replace(/fill-rule=/g, 'fillRule=')
      .replace(/clip-rule=/g, 'clipRule=')

    const template = `${this.options.typescript ? `
import React from 'react'

interface ${componentName}Props {
  className?: string
  style?: React.CSSProperties
  [key: string]: any
}

const ${componentName}: React.FC<${componentName}Props> = ({ 
  className = '', 
  style = {}, 
  ...props 
}) => {
  return (
    ${reactSvg.replace(/<svg([^>]*)>/, '<svg$1 className={className} style={style} {...props}>')}
  )
}

export default ${componentName}
` : `
import React from 'react'

const ${componentName} = ({ className = '', style = {}, ...props }) => {
  return (
    ${reactSvg.replace(/<svg([^>]*)>/, '<svg$1 className={className} style={style} {...props}>')}
  )
}

export default ${componentName}
`}`

    return template
  }

  /**
   * 生成 Svelte 组件
   */
  private generateSvelteComponent(componentName: string, svgContent: string): string {
    const svgMatch = svgContent.match(/<svg([^>]*)>([\s\S]*)<\/svg>/i)
    if (!svgMatch) return ''

    const svgAttrs = svgMatch[1]
    const svgInner = svgMatch[2]

    const template = `<script${this.options.typescript ? ' lang="ts"' : ''}>
  export let className${this.options.typescript ? ': string' : ''} = ''
  export let style${this.options.typescript ? ': string' : ''} = ''
</script>

<svg
  ${svgAttrs}
  class={className}
  {style}
  {...$$restProps}
>
  ${svgInner}
</svg>`

    return template
  }

  /**
   * 生成 Angular 组件
   */
  private generateAngularComponent(componentName: string, svgContent: string): string {
    const template = `import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-${componentName.toLowerCase()}',
  template: \`
    ${svgContent.replace(/class=/g, '[class]=')}
  \`,
  standalone: true
})
export class ${componentName}Component {
  @Input() className: string = ''
  @Input() style: any = {}
}`

    return template
  }

  /**
   * 生成索引文件
   */
  private async generateIndexFile(componentInfos: SVGComponentInfo[]): Promise<void> {
    const extension = this.options.typescript ? '.ts' : '.js'
    const indexPath = path.join(this.options.outputDir, `index${extension}`)

    let indexContent = '// Auto-generated icon components index\n\n'

    // 导出所有组件
    for (const info of componentInfos) {
      const relativePath = `./${info.componentName}`
      indexContent += `export { default as ${info.componentName} } from '${relativePath}'\n`
    }

    // 添加类型定义（如果是 TypeScript）
    if (this.options.typescript) {
      indexContent += '\n// Component types\n'
      indexContent += 'export interface IconProps {\n'
      indexContent += '  className?: string\n'
      indexContent += '  style?: React.CSSProperties | string | any\n'
      indexContent += '  [key: string]: any\n'
      indexContent += '}\n'
    }

    await fs.writeFile(indexPath, indexContent)
    this.logger.info(`索引文件已生成: ${indexPath}`)
  }
}

/**
 * 创建 SVG 组件生成器插件
 */
export function createSVGComponentPlugin(options: SVGComponentOptions = {}): Plugin {
  const generator = new SVGComponentGenerator(options)
  
  return {
    name: 'svg-component-generator',
    
    async buildStart() {
      if (process.env.NODE_ENV === 'development' || process.env.GENERATE_SVG_COMPONENTS === 'true') {
        await generator.generateComponents()
      }
    },
    
    configureServer(server) {
      // 在开发模式下监听 SVG 文件变化
      const svgDir = options.sourceDir || './src/assets/icons'
      
      server.watcher.add(svgDir)
      server.watcher.on('change', async (file) => {
        if (file.endsWith('.svg')) {
          console.log('SVG 文件变更，重新生成组件...')
          await generator.generateComponents()
        }
      })
    }
  }
}
