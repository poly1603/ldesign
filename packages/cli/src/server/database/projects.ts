/**
 * 项目数据库管理模块
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
const DB_FILE = join(DB_DIR, 'projects.json')

/**
 * 项目类型
 */
export type ProjectType = 'project' | 'library' | 'both'

/**
 * 项目接口定义
 */
export interface Project {
  id: string
  name: string
  path: string
  description?: string
  type: ProjectType
  packageJson?: any
  importedAt: string
  createdAt: string
  updatedAt: string
}

/**
 * 数据库接口定义
 */
interface ProjectDatabase {
  projects: Project[]
  lastId: number
}

/**
 * 初始化数据库
 */
function initDatabase(): ProjectDatabase {
  // 确保数据目录存在
  if (!existsSync(DB_DIR)) {
    mkdirSync(DB_DIR, { recursive: true })
  }

  // 如果数据库文件不存在，创建初始数据
  if (!existsSync(DB_FILE)) {
    const initialData: ProjectDatabase = {
      projects: [],
      lastId: 0
    }
    writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8')
    return initialData
  }

  // 读取现有数据
  try {
    const data = readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(data) as ProjectDatabase
  } catch (error) {
    console.error('读取数据库文件失败:', error)
    // 如果文件损坏，重新创建
    const initialData: ProjectDatabase = {
      projects: [],
      lastId: 0
    }
    writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8')
    return initialData
  }
}

/**
 * 保存数据库
 */
function saveDatabase(data: ProjectDatabase): void {
  try {
    writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error('保存数据库文件失败:', error)
    throw new Error('保存项目数据失败')
  }
}

/**
 * 生成新的项目ID
 */
function generateId(data: ProjectDatabase): string {
  data.lastId += 1
  return data.lastId.toString()
}

/**
 * 获取所有项目
 */
export function getAllProjects(): Project[] {
  const data = initDatabase()
  return data.projects
}

/**
 * 根据ID获取项目
 */
export function getProjectById(id: string): Project | null {
  const data = initDatabase()
  return data.projects.find(project => project.id === id) || null
}

/**
 * 根据 package.json 判断项目类型
 */
export function detectProjectType(packageJson: any): ProjectType {
  if (!packageJson) return 'project'

  const hasMain = !!packageJson.main
  const hasModule = !!packageJson.module
  const hasExports = !!packageJson.exports
  const hasTypes = !!packageJson.types || !!packageJson.typings

  // 如果有 main/module/exports/types 字段，说明是库
  const isLibrary = hasMain || hasModule || hasExports || hasTypes

  // 如果有 scripts.dev 或 scripts.start，说明是项目
  const hasDevScript = !!packageJson.scripts?.dev || !!packageJson.scripts?.start
  const isProject = hasDevScript

  if (isLibrary && isProject) {
    return 'both'
  } else if (isLibrary) {
    return 'library'
  } else {
    return 'project'
  }
}

/**
 * 添加新项目
 */
export function addProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'importedAt'>): Project {
  const data = initDatabase()

  // 检查路径是否已存在
  const existingProject = data.projects.find(p => p.path === projectData.path)
  if (existingProject) {
    throw new Error('该项目路径已存在')
  }

  const now = new Date().toISOString()
  const newProject: Project = {
    ...projectData,
    id: generateId(data),
    importedAt: now,
    createdAt: now,
    updatedAt: now
  }

  data.projects.push(newProject)
  saveDatabase(data)

  return newProject
}

/**
 * 更新项目
 */
export function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Project | null {
  const data = initDatabase()
  const projectIndex = data.projects.findIndex(project => project.id === id)

  if (projectIndex === -1) {
    return null
  }

  const updatedProject: Project = {
    ...data.projects[projectIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  data.projects[projectIndex] = updatedProject
  saveDatabase(data)

  return updatedProject
}

/**
 * 删除项目
 */
export function deleteProject(id: string): boolean {
  const data = initDatabase()
  const projectIndex = data.projects.findIndex(project => project.id === id)

  if (projectIndex === -1) {
    return false
  }

  data.projects.splice(projectIndex, 1)
  saveDatabase(data)

  return true
}

/**
 * 根据路径查找项目
 */
export function getProjectByPath(path: string): Project | null {
  const data = initDatabase()
  return data.projects.find(project => project.path === path) || null
}
