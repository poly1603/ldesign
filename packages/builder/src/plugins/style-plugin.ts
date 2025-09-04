/**
 * 样式处理插件 - 处理 Less/CSS 文件和 Vue SFC 中的样式
 */

import type { Plugin } from 'rollup'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname, join, relative, extname, basename } from 'path'
import less from 'less'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'

export interface StylePluginOptions {
  // 输出目录
  outputDir: string
  // 是否提取样式到单独文件
  extract: boolean
  // 是否压缩
  minify: boolean
  // 是否生成 source map
  sourceMap: boolean
  // Less 配置
  lessOptions?: any
  // PostCSS 配置
  postcssOptions?: any
  // 是否处理 Vue 文件中的样式
  processVueStyles?: boolean
  // 样式输出格式
  format?: 'cjs' | 'es' | 'umd'
}

/**
 * 样式处理插件
 */
export function stylePlugin(options: StylePluginOptions): Plugin {
  const {
    outputDir,
    extract = true,
    minify: _minify = false,
    sourceMap: _sourceMap = false,
    lessOptions = {},
    postcssOptions = {},
    processVueStyles = true,
    format = 'es'
  } = options

  const styleMap = new Map<string, string>()

  return {
    name: 'style-plugin',

    async transform(code, id) {
      // 处理 .less 文件
      if (id.endsWith('.less')) {
        const css = await compileLess(code, id, lessOptions)
        const processed = await processCSS(css, id, postcssOptions)
        
        if (extract) {
          // 保存样式内容，后续输出
          styleMap.set(id, processed)
          
          // 返回空模块或导出样式路径
          const relativePath = getStyleOutputPath(id, outputDir)
          return {
            code: format === 'es' 
              ? `export default ${JSON.stringify(relativePath)};`
              : `module.exports = ${JSON.stringify(relativePath)};`,
            map: null
          }
        } else {
          // 内联样式
          return {
            code: generateInlineStyleCode(processed, format),
            map: null
          }
        }
      }

      // 处理 .css 文件
      if (id.endsWith('.css')) {
        const processed = await processCSS(code, id, postcssOptions)
        
        if (extract) {
          styleMap.set(id, processed)
          const relativePath = getStyleOutputPath(id, outputDir)
          return {
            code: format === 'es'
              ? `export default ${JSON.stringify(relativePath)};`
              : `module.exports = ${JSON.stringify(relativePath)};`,
            map: null
          }
        } else {
          return {
            code: generateInlineStyleCode(processed, format),
            map: null
          }
        }
      }

      // 处理 .vue 文件中的样式
      if (processVueStyles && id.endsWith('.vue')) {
        const styles = extractVueStyles(code)
        if (styles.length > 0) {
          const processedStyles = await Promise.all(
            styles.map(async (style) => {
              if (style.lang === 'less') {
                const css = await compileLess(style.content, id, lessOptions)
                return processCSS(css, id, postcssOptions)
              } else {
                return processCSS(style.content, id, postcssOptions)
              }
            })
          )
          
          const combinedStyles = processedStyles.join('\n')
          if (extract) {
            styleMap.set(`${id}.styles`, combinedStyles)
          }
        }
      }

      // 处理 TSX/JSX 中的样式导入路径转换
      if (id.endsWith('.tsx') || id.endsWith('.jsx')) {
        return transformStyleImports(code, id, outputDir, format)
      }

      return null
    },

    async generateBundle() {
      // 输出提取的样式文件
      if (extract) {
        for (const [filePath, cssContent] of styleMap.entries()) {
          const outputPath = getStyleOutputPath(filePath, outputDir)
          const fullOutputPath = join(outputDir, outputPath)
          
          // 确保输出目录存在
          const dir = dirname(fullOutputPath)
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true })
          }
          
          // TODO: 添加压缩功能
          const finalCSS = cssContent
          
          // 写入文件
          writeFileSync(fullOutputPath, finalCSS)
        }
      }
    }
  }
}

/**
 * 编译 Less
 */
async function compileLess(
  content: string, 
  filename: string, 
  options: any = {}
): Promise<string> {
  try {
    const result = await less.render(content, {
      filename,
      ...options
    })
    return result.css
  } catch (error) {
    console.error(`Failed to compile Less in ${filename}:`, error)
    throw error
  }
}

/**
 * 处理 CSS (PostCSS)
 */
async function processCSS(
  css: string, 
  from: string, 
  options: any = {}
): Promise<string> {
  try {
    const result = await postcss([
      autoprefixer(),
      ...((options.plugins || []))
    ]).process(css, { from, ...options })
    return result.css
  } catch (error) {
    console.error(`Failed to process CSS in ${from}:`, error)
    throw error
  }
}

/**
 * 提取 Vue 文件中的样式
 */
function extractVueStyles(content: string): Array<{ content: string; lang: string; scoped: boolean }> {
  const styles: Array<{ content: string; lang: string; scoped: boolean }> = []
  const styleRegex = /<style([^>]*)>([\s\S]*?)<\/style>/gi
  
  let match: RegExpExecArray | null
  while ((match = styleRegex.exec(content)) !== null) {
    const attrs = match[1]
    const styleContent = match[2]
    
    const langMatch = attrs.match(/lang=["']([^"']+)["']/i)
    const lang = langMatch ? langMatch[1] : 'css'
    const scoped = attrs.includes('scoped')
    
    styles.push({
      content: styleContent,
      lang,
      scoped
    })
  }
  
  return styles
}

/**
 * 生成内联样式代码
 */
function generateInlineStyleCode(css: string, format: 'cjs' | 'es' | 'umd'): string {
  const injectCode = `
function injectStyle(css) {
  if (typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = css;
  document.head.appendChild(style);
}
injectStyle(${JSON.stringify(css)});
`

  if (format === 'es') {
    return `${injectCode}\nexport default ${JSON.stringify(css)};`
  } else if (format === 'cjs') {
    return `${injectCode}\nmodule.exports = ${JSON.stringify(css)};`
  } else {
    return injectCode
  }
}

/**
 * 转换样式导入路径
 */
function transformStyleImports(
  code: string, 
  _id: string, 
  _outputDir: string,
  format: 'cjs' | 'es' | 'umd'
): { code: string; map: null } | null {
  let transformed = code
  let hasTransformation = false

  // 匹配 import 语句中的 .less 文件
  const importRegex = /import\s+['"]([^'"]+\.less)['"]/g
  transformed = transformed.replace(importRegex, (_match, importPath) => {
    hasTransformation = true
    const cssPath = importPath.replace(/\.less$/, '.css')
    return `import '${cssPath}'`
  })

  // 匹配 require 语句中的 .less 文件（CommonJS）
  if (format === 'cjs') {
    const requireRegex = /require\(['"]([^'"]+\.less)['"]\)/g
    transformed = transformed.replace(requireRegex, (_match, requirePath) => {
      hasTransformation = true
      const cssPath = requirePath.replace(/\.less$/, '.css')
      return `require('${cssPath}')`
    })
  }

  if (hasTransformation) {
    return { code: transformed, map: null }
  }

  return null
}

/**
 * 获取样式输出路径
 */
function getStyleOutputPath(inputPath: string, _outputDir: string): string {
  const ext = extname(inputPath)
  const name = basename(inputPath, ext)
  const dir = relative(process.cwd(), dirname(inputPath))
  
  // 将 .less 转换为 .css
  const outputExt = ext === '.less' ? '.css' : ext
  
  return join(dir, `${name}${outputExt}`).replace(/\\/g, '/')
}
