import { readFile } from 'fs/promises'
import { pathToFileURL } from 'url'
import { resolve as resolvePath, join } from 'path'
import { Logger } from '../utils/logger'

const log = new Logger('ViteResolver', { compact: true })

function normalizeViteModule(mod: any): any {
  try {
    if (mod && typeof mod === 'object' && typeof mod.createServer === 'function') return mod
    if (mod && typeof mod === 'object' && mod.default && typeof mod.default.createServer === 'function') return mod.default
    return mod
  } catch {
    return mod
  }
}

/**
 * 尝试从项目的 node_modules 中解析 vite 路径
 */
async function resolveViteFromProject(cwd: string): Promise<string | null> {
  try {
    // 尝试读取项目的 package.json 来确认 vite 依赖
    const packageJsonPath = join(cwd, 'package.json')
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'))

    // 检查是否有 vite 依赖
    const hasVite = packageJson.dependencies?.vite ||
      packageJson.devDependencies?.vite ||
      packageJson.peerDependencies?.vite

    if (!hasVite) {
      return null
    }

    // 构建 vite 模块路径
    const vitePath = join(cwd, 'node_modules', 'vite', 'dist', 'node', 'index.js')
    return vitePath
  } catch {
    return null
  }
}

/**
 * 从给定 cwd 优先解析 import('vite')，否则回退到本包依赖
 */
export async function importViteFromCwd(cwd: string): Promise<any> {
  try {
    // 尝试从项目的 node_modules 解析 vite
    const vitePath = await resolveViteFromProject(cwd)

    if (vitePath) {
      const viteUrl = pathToFileURL(vitePath).href
      log.debug('Resolved vite from app cwd', { path: vitePath })
      const mod = await import(viteUrl)
      return normalizeViteModule(mod)
    }
  } catch (e) {
    log.debug('Resolve vite from app cwd failed', { error: (e as Error).message })
  }

  // 回退到本地 vite
  try {
    log.debug('Using fallback vite from launcher dependencies')
    const mod = await import('vite')
    return normalizeViteModule(mod)
  } catch (e) {
    log.error('Failed to import vite', { error: (e as Error).message })
    throw e
  }
}

