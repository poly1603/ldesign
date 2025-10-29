import { Router } from 'express'
import { randomUUID } from 'crypto'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { success, error } from '../utils/response'
import { db } from '../database'
import type { Project } from '../types'

export const projectsRouter = Router()

// 获取所有项目
projectsRouter.get('/', (req, res) => {
  try {
    const { limit = 100, offset = 0, keyword } = req.query
    
    let sql = 'SELECT * FROM projects'
    const params: any[] = []
    
    if (keyword) {
      sql += ' WHERE name LIKE ? OR path LIKE ?'
      params.push(`%${keyword}%`, `%${keyword}%`)
    }
    
    sql += ' ORDER BY updatedAt DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))
    
    const projects = db.getDb().prepare(sql).all(...params) as any[]
    
    // 解析 JSON 字段
    const formatted = projects.map(p => ({
      ...p,
      config: p.config ? JSON.parse(p.config) : undefined,
    }))
    
    return success(res, formatted)
  } catch (err: any) {
    return error(res, err.message, 'QUERY_ERROR', 500)
  }
})

// 获取单个项目
projectsRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const project = db.getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id) as any
    
    if (!project) {
      return error(res, '项目不存在', 'NOT_FOUND', 404)
    }
    
    return success(res, {
      ...project,
      config: project.config ? JSON.parse(project.config) : undefined,
    })
  } catch (err: any) {
    return error(res, err.message, 'QUERY_ERROR', 500)
  }
})

// 导入项目
projectsRouter.post('/import', (req, res) => {
  try {
    const { path: projectPath, detect = true } = req.body
    
    if (!projectPath) {
      return error(res, '项目路径不能为空', 'INVALID_INPUT', 400)
    }
    
    const absPath = resolve(projectPath)
    
    if (!existsSync(absPath)) {
      return error(res, '项目路径不存在', 'PATH_NOT_FOUND', 404)
    }
    
    // 检查项目是否已存在
    const existing = db.getDb().prepare('SELECT * FROM projects WHERE path = ?').get(absPath)
    if (existing) {
      return error(res, '项目已存在', 'DUPLICATE', 409)
    }
    
    // 自动检测项目信息
    const name = absPath.split(/[\\/]/).pop() || 'Unknown'
    const now = Date.now()
    
    const project: Project = {
      id: randomUUID(),
      name,
      path: absPath,
      type: 'web',
      framework: detect ? detectFramework(absPath) : undefined,
      packageManager: detect ? detectPackageManager(absPath) : undefined,
      createdAt: now,
      updatedAt: now,
    }
    
    db.getDb().prepare(`
      INSERT INTO projects (id, name, path, type, framework, packageManager, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      project.id,
      project.name,
      project.path,
      project.type,
      project.framework,
      project.packageManager,
      project.createdAt,
      project.updatedAt
    )
    
    return success(res, project, '项目导入成功')
  } catch (err: any) {
    return error(res, err.message, 'IMPORT_ERROR', 500)
  }
})

// 创建项目
projectsRouter.post('/create', (req, res) => {
  try {
    const { name, path: projectPath, template, framework } = req.body
    
    if (!name || !projectPath) {
      return error(res, '项目名称和路径不能为空', 'INVALID_INPUT', 400)
    }
    
    const absPath = resolve(projectPath, name)
    
    if (existsSync(absPath)) {
      return error(res, '目标路径已存在', 'PATH_EXISTS', 409)
    }
    
    const now = Date.now()
    const project: Project = {
      id: randomUUID(),
      name,
      path: absPath,
      type: 'web',
      framework,
      createdAt: now,
      updatedAt: now,
    }
    
    // TODO: 实际创建项目文件
    
    db.getDb().prepare(`
      INSERT INTO projects (id, name, path, type, framework, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      project.id,
      project.name,
      project.path,
      project.type,
      project.framework,
      project.createdAt,
      project.updatedAt
    )
    
    return success(res, project, '项目创建成功')
  } catch (err: any) {
    return error(res, err.message, 'CREATE_ERROR', 500)
  }
})

// 更新项目
projectsRouter.put('/:id', (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    
    const project = db.getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id)
    if (!project) {
      return error(res, '项目不存在', 'NOT_FOUND', 404)
    }
    
    const fields: string[] = []
    const values: any[] = []
    
    const allowedFields = ['name', 'description', 'framework', 'packageManager', 'config']
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`)
        values.push(field === 'config' ? JSON.stringify(updates[field]) : updates[field])
      }
    }
    
    if (fields.length === 0) {
      return error(res, '没有可更新的字段', 'INVALID_INPUT', 400)
    }
    
    fields.push('updatedAt = ?')
    values.push(Date.now())
    values.push(id)
    
    db.getDb().prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    
    const updated = db.getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id) as any
    
    return success(res, {
      ...updated,
      config: updated.config ? JSON.parse(updated.config) : undefined,
    })
  } catch (err: any) {
    return error(res, err.message, 'UPDATE_ERROR', 500)
  }
})

// 删除项目
projectsRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    
    const project = db.getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id)
    if (!project) {
      return error(res, '项目不存在', 'NOT_FOUND', 404)
    }
    
    db.getDb().prepare('DELETE FROM projects WHERE id = ?').run(id)
    
    return success(res, null, '项目删除成功')
  } catch (err: any) {
    return error(res, err.message, 'DELETE_ERROR', 500)
  }
})

// 打开项目
projectsRouter.post('/:id/open', (req, res) => {
  try {
    const { id } = req.params
    
    const project = db.getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id)
    if (!project) {
      return error(res, '项目不存在', 'NOT_FOUND', 404)
    }
    
    // 更新最后打开时间
    db.getDb().prepare('UPDATE projects SET lastOpenedAt = ? WHERE id = ?').run(Date.now(), id)
    
    return success(res, null, '项目已打开')
  } catch (err: any) {
    return error(res, err.message, 'OPEN_ERROR', 500)
  }
})

// 获取项目统计
projectsRouter.get('/:id/stats', (req, res) => {
  try {
    const { id } = req.params
    
    const project = db.getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id)
    if (!project) {
      return error(res, '项目不存在', 'NOT_FOUND', 404)
    }
    
    // TODO: 实现实际统计逻辑
    const stats = {
      files: 0,
      lines: 0,
      size: 0,
      dependencies: 0,
    }
    
    return success(res, stats)
  } catch (err: any) {
    return error(res, err.message, 'STATS_ERROR', 500)
  }
})

// 辅助函数：检测框架
function detectFramework(projectPath: string): string | undefined {
  try {
    const packageJsonPath = resolve(projectPath, 'package.json')
    if (existsSync(packageJsonPath)) {
      const packageJson = require(packageJsonPath)
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
      
      if (deps.vue) return 'vue'
      if (deps.react) return 'react'
      if (deps['@angular/core']) return 'angular'
      if (deps.svelte) return 'svelte'
    }
  } catch (e) {
    // ignore
  }
  return undefined
}

// 辅助函数：检测包管理器
function detectPackageManager(projectPath: string): string | undefined {
  if (existsSync(resolve(projectPath, 'pnpm-lock.yaml'))) return 'pnpm'
  if (existsSync(resolve(projectPath, 'yarn.lock'))) return 'yarn'
  if (existsSync(resolve(projectPath, 'package-lock.json'))) return 'npm'
  return undefined
}
