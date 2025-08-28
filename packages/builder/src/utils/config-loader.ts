import type { BuildOptions } from '../types'
import fs from 'node:fs'
import path from 'node:path'

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
          // 对于 TypeScript 配置文件，先尝试读取文件内容并简单解析
          try {
            const content = fs.readFileSync(full, 'utf-8')
            console.log(`[Config] 读取配置文件内容: ${name}`)
            console.log(`[Config] 文件内容包含 css: false: ${content.includes('css: false')}`)

            // 简单的 TypeScript 配置解析 - 查找 css 配置
            if (content.includes('css:')) {
              // 提取 css 配置值
              const cssMatch = content.match(/css:\s*(false|true)/m)
              console.log(`[Config] CSS 匹配结果:`, cssMatch)

              if (cssMatch) {
                const cssValue = cssMatch[1] === 'false' ? false : true
                console.log(`[Config] 解析出的 CSS 值:`, cssValue)
                mod = { css: cssValue }
              } else {
                // 没有找到 css 配置，回退到 require
                mod = require(full)
              }
            } else {
              // 没有 css 配置，使用 require
              mod = require(full)
            }
          }
          catch {
            // 回退到 ts-node
            try {
              require('ts-node/register')
              mod = require(full)
            }
            catch {
              // 最后回退到直接 require
              mod = require(full)
            }
          }
        } else {
          // 清理 require 缓存以便二次读取同一路径时能够命中新内容
          try {
            const cache: Record<string, any> = (require as any).cache || {}
            const fullNorm = path.normalize(full)
            for (const key of Object.keys(cache)) {
              const keyNorm = path.normalize(key)
              if (keyNorm === fullNorm || keyNorm.endsWith(path.sep + name)) {
                delete (require as any).cache[key]
              }
            }
          }
          catch { }
          mod = require(full)
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
