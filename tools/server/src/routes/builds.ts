import { Router } from 'express'
import { randomUUID } from 'crypto'
import { success, error } from '../utils/response'
import { db } from '../database'
import type { Build } from '../types'

export const buildsRouter = Router()

// 获取构建列表
buildsRouter.get('/', (req, res) => {
  try {
    const { projectId, limit = 50, offset = 0 } = req.query
    
    let sql = 'SELECT * FROM builds'
    const params: any[] = []
    
    if (projectId) {
      sql += ' WHERE projectId = ?'
      params.push(projectId)
    }
    
    sql += ' ORDER BY startTime DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))
    
    const builds = db.getDb().prepare(sql).all(...params)
    return success(res, builds)
  } catch (err: any) {
    return error(res, err.message, 'QUERY_ERROR', 500)
  }
})

// 获取构建详情
buildsRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const build = db.getDb().prepare('SELECT * FROM builds WHERE id = ?').get(id)
    
    if (!build) {
      return error(res, '构建记录不存在', 'NOT_FOUND', 404)
    }
    
    return success(res, build)
  } catch (err: any) {
    return error(res, err.message, 'QUERY_ERROR', 500)
  }
})

// 创建构建
buildsRouter.post('/', (req, res) => {
  try {
    const { projectId } = req.body
    
    if (!projectId) {
      return error(res, '项目ID不能为空', 'INVALID_INPUT', 400)
    }
    
    const build: Build = {
      id: randomUUID(),
      projectId,
      status: 'pending',
      startTime: Date.now(),
    }
    
    db.getDb().prepare(`
      INSERT INTO builds (id, projectId, status, startTime)
      VALUES (?, ?, ?, ?)
    `).run(build.id, build.projectId, build.status, build.startTime)
    
    // TODO: 实际执行构建
    
    return success(res, build, '构建已创建')
  } catch (err: any) {
    return error(res, err.message, 'CREATE_ERROR', 500)
  }
})

// 取消构建
buildsRouter.post('/:id/cancel', (req, res) => {
  try {
    const { id } = req.params
    
    db.getDb().prepare(`
      UPDATE builds SET status = 'cancelled', endTime = ?, duration = ? - startTime
      WHERE id = ?
    `).run(Date.now(), Date.now(), id)
    
    return success(res, null, '构建已取消')
  } catch (err: any) {
    return error(res, err.message, 'CANCEL_ERROR', 500)
  }
})
