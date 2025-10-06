/**
 * 数据库适配器
 * 提供兼容旧代码的接口，使用新的 Repository
 */

import { getRepositories } from './index'
import type { Project } from './repositories/ProjectRepository'
import type { NpmSource, NpmSourceType } from './repositories/NpmSourceRepository'

// ==================== 项目相关 ====================

export { detectProjectType } from '../utils/project-detector'
export type { ProjectType } from '../utils/project-detector'
export type { Project }

/**
 * 获取所有项目
 */
export function getAllProjects(): Project[] {
  const repos = getRepositories()
  return repos.project.findAll()
}

/**
 * 根据ID获取项目
 */
export function getProjectById(id: string): Project | null {
  const repos = getRepositories()
  return repos.project.findById(id)
}

/**
 * 添加新项目
 */
export function addProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
  const repos = getRepositories()
  return repos.project.create(projectData)
}

/**
 * 更新项目
 */
export function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Project | null {
  const repos = getRepositories()
  return repos.project.update(id, updates)
}

/**
 * 删除项目
 */
export function deleteProject(id: string): boolean {
  const repos = getRepositories()
  return repos.project.delete(id)
}

/**
 * 根据路径查找项目
 */
export function getProjectByPath(path: string): Project | null {
  const repos = getRepositories()
  return repos.project.findByPath(path)
}

// ==================== NPM 源相关 ====================

export type { NpmSource, NpmSourceType }

/**
 * 获取所有 NPM 源
 */
export function getAllNpmSources(): NpmSource[] {
  const repos = getRepositories()
  return repos.npmSource.findAll()
}

/**
 * 根据ID获取 NPM 源
 */
export function getNpmSourceById(id: string): NpmSource | null {
  const repos = getRepositories()
  return repos.npmSource.findById(id)
}

/**
 * 添加新 NPM 源
 */
export function addNpmSource(sourceData: Omit<NpmSource, 'id' | 'createdAt' | 'updatedAt' | 'isLoggedIn'>): NpmSource {
  const repos = getRepositories()
  return repos.npmSource.create(sourceData)
}

/**
 * 更新 NPM 源
 */
export function updateNpmSource(id: string, updates: Partial<Omit<NpmSource, 'id' | 'createdAt'>>): NpmSource | null {
  const repos = getRepositories()
  return repos.npmSource.update(id, updates)
}

/**
 * 删除 NPM 源
 */
export function deleteNpmSource(id: string): boolean {
  const repos = getRepositories()
  return repos.npmSource.delete(id)
}

/**
 * 更新登录状态
 */
export function updateLoginStatus(id: string, isLoggedIn: boolean, loginInfo?: NpmSource['loginInfo']): NpmSource | null {
  const repos = getRepositories()
  return repos.npmSource.updateLoginStatus(id, isLoggedIn, loginInfo)
}
