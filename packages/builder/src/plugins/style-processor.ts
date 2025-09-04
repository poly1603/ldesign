/**
 * 样式处理插件
 * 处理LESS/CSS文件，支持不同的输出策略
 */

import { Plugin } from 'rollup'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname, join, relative, extname } from 'path'
import less from 'less'

export interface StyleProcessorOptions {
  /** 输出目录 */
  outDir: string
  /** 是否提取CSS到单独文件 */
  extract: boolean
  /** 是否压缩 */
  minimize: boolean
  /** 源代码根目录 */
  srcRoot: string
}

export function styleProcessor(options: StyleProcessorOptions): Plugin {
  const processedStyles = new Map<string, string>()

  return {
    name: 'style-processor',
    
    async resolveId(id: string, importer?: string) {
      // 处理 .less 文件导入
      if (id.endsWith('.less')) {
        if (importer) {
          // 相对路径导入
          if (id.startsWith('./') || id.startsWith('../')) {
            const resolved = join(dirname(importer), id)
            if (existsSync(resolved)) {
              return resolved
            }
          }
        }
        // 绝对路径导入
        if (existsSync(id)) {
          return id
        }
      }
      return null
    },

    async load(id: string) {
      if (!id.endsWith('.less')) return null

      try {
        const content = readFileSync(id, 'utf-8')
        
        // 编译 LESS
        const result = await less.render(content, {
          filename: id,
          compress: options.minimize
        })

        const css = result.css

        if (options.extract) {
          // 提取CSS到单独文件
          const relativePath = relative(options.srcRoot, id)
          const cssPath = relativePath.replace(/\\.less$/, '.css')
          const outputPath = join(options.outDir, cssPath)
          
          // 确保输出目录存在
          const outputDir = dirname(outputPath)
          if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true })
          }

          // 写入CSS文件
          writeFileSync(outputPath, css)
          
          // 返回导入CSS文件的JS代码
          const importPath = cssPath.replace(/\\/g, '/').replace(/^\//, './')
          return `import '${importPath}';\nexport default {};`
        } else {
          // 内联CSS到JS中
          const jsCode = `
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = ${JSON.stringify(css)};
  document.head.appendChild(style);
}
export default {};
`
          return jsCode
        }
      } catch (error) {
        console.error(`Failed to process LESS file ${id}:`, error)
        throw error
      }
    },

    generateBundle(options, bundle) {
      // 在这里可以进一步处理生成的CSS文件
      // 比如合并、压缩等
    }
  }
}
