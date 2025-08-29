import type { BuildOptions } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export async function loadUserConfig(cwd: string = process.cwd()): Promise<Partial<BuildOptions> | null> {
  const candidates = [
    'ldesign.config.ts',
    'ldesign.config.js',
    'ldesign.builder.ts',
    'ldesign.builder.js',
  ]

  for (const name of candidates) {
    const full = path.resolve(cwd, name)
    if (fs.existsSync(full)) {
      try {
        let mod: any

        if (name.endsWith('.ts')) {
          // 对于 TypeScript 配置文件，使用动态导入
          try {
            // 先尝试使用 tsx 来处理 TypeScript 文件

            // 创建临时的 JS 文件来执行 TS 配置
            const tempFile = path.join(cwd, `temp-config-${Date.now()}.mjs`)
            const tsContent = fs.readFileSync(full, 'utf-8')

            // 简单的 TS 到 JS 转换（仅处理基本的导入导出）
            let jsContent = tsContent
              .replace(/import\s+.*?from\s+['"]@ldesign\/builder['"];?\s*/g, '')
              .replace(/export\s+default\s+defineConfig\s*\(/g, 'export default ')
              .replace(/defineConfig\s*\(/g, '')
              .replace(/\)\s*$/, '')

            // 如果没有 export default，添加一个
            if (!jsContent.includes('export default')) {
              jsContent = `export default ${jsContent}`
            }

            fs.writeFileSync(tempFile, jsContent)

            try {
              const fileUrl = pathToFileURL(tempFile).href
              mod = await import(fileUrl)
            } finally {
              // 清理临时文件
              try {
                fs.unlinkSync(tempFile)
              } catch { }
            }
          }
          catch (tsError) {
            console.log(`[Config] TypeScript 处理失败，尝试简单解析:`, tsError)

            // 回退到简单的文本解析
            try {
              const content = fs.readFileSync(full, 'utf-8')

              // 提取配置对象
              const configMatch = content.match(/defineConfig\s*\(\s*({[\s\S]*?})\s*\)/m)
              if (configMatch) {
                const configStr = configMatch[1]
                // 简单的配置解析
                const config: any = {}

                // 解析常见的配置项
                const formats = configStr.match(/formats:\s*\[(.*?)\]/s)
                if (formats) {
                  config.formats = formats[1].split(',').map(f => f.trim().replace(/['"]/g, ''))
                }

                const dts = configStr.match(/dts:\s*(true|false)/)
                if (dts) {
                  config.dts = dts[1] === 'true'
                }

                const minify = configStr.match(/minify:\s*(true|false)/)
                if (minify) {
                  config.minify = minify[1] === 'true'
                }

                const sourcemap = configStr.match(/sourcemap:\s*(true|false)/)
                if (sourcemap) {
                  config.sourcemap = sourcemap[1] === 'true'
                }

                const external = configStr.match(/external:\s*\[(.*?)\]/s)
                if (external) {
                  config.external = external[1].split(',').map(e => e.trim().replace(/['"]/g, ''))
                }

                const name = configStr.match(/name:\s*['"]([^'"]*)['"]/s)
                if (name) {
                  config.name = name[1]
                }

                mod = { default: config }
              } else {
                mod = { default: {} }
              }
            }
            catch (parseError) {
              console.log(`[Config] 简单解析也失败:`, parseError)
              mod = { default: {} }
            }
          }
        } else {
          // 对于 JS 文件，使用动态导入
          const fileUrl = pathToFileURL(full).href
          mod = await import(fileUrl)
        }

        const raw = (mod && (mod.default || mod))
        if (raw && typeof raw === 'object') {
          return raw as Partial<BuildOptions>
        }
        return null
      }
      catch (e) {
        console.warn(`Failed to load config file ${name}:`, e)
        return null
      }
    }
  }
  return null
}
