import path from 'path'
import fs from 'fs'
import type { BuildOptions } from '../types'

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
        if (name.endsWith('.ts')) {
          // 尝试动态加载 ts-node 以支持本地 TS 配置
          try { require('ts-node/register') } catch {}
        }
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
        } catch {}
        const mod = require(full)
        const raw = (mod && (mod.default || mod))
        if (raw && typeof raw === 'object') {
          return raw as Partial<BuildOptions>
        }
        return null
      } catch (e) {
        return null
      }
    }
  }
  return null
}


