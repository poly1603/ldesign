/**
 * NPM 源数据库管理模块
 * 使用JSON文件作为数据存储
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 数据库文件路径
const DB_DIR = join(__dirname, '../../../data')
const DB_FILE = join(DB_DIR, 'npm-sources.json')

/**
 * NPM源类型
 */
export type NpmSourceType = 'public' | 'private'

/**
 * NPM源接口定义
 */
export interface NpmSource {
  id: string
  name: string
  url: string
  type: NpmSourceType
  description?: string
  isLoggedIn: boolean
  loginInfo?: {
    username?: string
    email?: string
    token?: string
    lastLoginAt?: string
  }
  createdAt: string
  updatedAt: string
}

/**
 * 数据库接口定义
 */
interface NpmSourceDatabase {
  sources: NpmSource[]
  lastId: number
}

/**
 * 初始化数据库
 */
function initDatabase(): NpmSourceDatabase {
  // 确保数据目录存在
  if (!existsSync(DB_DIR)) {
    mkdirSync(DB_DIR, { recursive: true })
  }

  // 如果数据库文件不存在，创建初始数据
  if (!existsSync(DB_FILE)) {
    const initialData: NpmSourceDatabase = {
      sources: [
        {
          id: '1',
          name: 'npm 官方源',
          url: 'https://registry.npmjs.org/',
          type: 'public',
          description: 'NPM 官方默认源',
          isLoggedIn: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: '淘宝镜像',
          url: 'https://registry.npmmirror.com/',
          type: 'public',
          description: '淘宝 NPM 镜像源',
          isLoggedIn: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      lastId: 2
    }
    writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8')
    return initialData
  }

  // 读取现有数据
  try {
    const data = readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(data) as NpmSourceDatabase
  } catch (error) {
    console.error('读取NPM源数据库文件失败:', error)
    // 如果文件损坏，重新创建
    const initialData: NpmSourceDatabase = {
      sources: [],
      lastId: 0
    }
    writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8')
    return initialData
  }
}

/**
 * 保存数据库
 */
function saveDatabase(data: NpmSourceDatabase): void {
  try {
    writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error('保存NPM源数据库文件失败:', error)
    throw new Error('保存NPM源数据失败')
  }
}

/**
 * 生成新的ID
 */
function generateId(data: NpmSourceDatabase): string {
  data.lastId += 1
  return data.lastId.toString()
}

/**
 * 获取所有NPM源
 */
export function getAllNpmSources(): NpmSource[] {
  const data = initDatabase()
  return data.sources
}

/**
 * 根据ID获取NPM源
 */
export function getNpmSourceById(id: string): NpmSource | null {
  const data = initDatabase()
  return data.sources.find(source => source.id === id) || null
}

/**
 * 添加新NPM源
 */
export function addNpmSource(sourceData: Omit<NpmSource, 'id' | 'createdAt' | 'updatedAt' | 'isLoggedIn'>): NpmSource {
  const data = initDatabase()

  // 检查URL是否已存在
  const existingSource = data.sources.find(s => s.url === sourceData.url)
  if (existingSource) {
    throw new Error('该源地址已存在')
  }

  const now = new Date().toISOString()
  const newSource: NpmSource = {
    ...sourceData,
    id: generateId(data),
    isLoggedIn: false,
    createdAt: now,
    updatedAt: now
  }

  data.sources.push(newSource)
  saveDatabase(data)

  return newSource
}

/**
 * 更新NPM源
 */
export function updateNpmSource(id: string, updates: Partial<Omit<NpmSource, 'id' | 'createdAt'>>): NpmSource | null {
  const data = initDatabase()
  const sourceIndex = data.sources.findIndex(source => source.id === id)

  if (sourceIndex === -1) {
    return null
  }

  const updatedSource: NpmSource = {
    ...data.sources[sourceIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  data.sources[sourceIndex] = updatedSource
  saveDatabase(data)

  return updatedSource
}

/**
 * 删除NPM源
 */
export function deleteNpmSource(id: string): boolean {
  const data = initDatabase()
  const sourceIndex = data.sources.findIndex(source => source.id === id)

  if (sourceIndex === -1) {
    return false
  }

  data.sources.splice(sourceIndex, 1)
  saveDatabase(data)

  return true
}

/**
 * 更新登录状态
 */
export function updateLoginStatus(id: string, isLoggedIn: boolean, loginInfo?: NpmSource['loginInfo']): NpmSource | null {
  const data = initDatabase()
  const sourceIndex = data.sources.findIndex(source => source.id === id)

  if (sourceIndex === -1) {
    return null
  }

  const updatedSource: NpmSource = {
    ...data.sources[sourceIndex],
    isLoggedIn,
    loginInfo: isLoggedIn ? loginInfo : undefined,
    updatedAt: new Date().toISOString()
  }

  data.sources[sourceIndex] = updatedSource
  saveDatabase(data)

  return updatedSource
}