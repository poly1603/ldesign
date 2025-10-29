import { Router } from 'express'
import { randomUUID } from 'crypto'
import { success, error } from '../utils/response'
import { db } from '../database'
import type { Deployment } from '../types'

export const deploymentsRouter = Router()

// 获取部署列表
deploymentsRouter.get('/', (req, res) => {
  try {
    const { projectId, environment, limit = 50, offset = 0 } = req.query
    
    let sql = 'SELECT * FROM deployments WHERE 1=1'
    const params: any[] = []
    
    if (projectId) {
      sql += ' AND projectId = ?'
      params.push(projectId)
    }
    
    if (environment) {
      sql += ' AND environment = ?'
      params.push(environment)
    }
    
    sql += ' ORDER BY startTime DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))
    
    const deployments = db.getDb().prepare(sql).all(...params)
    return success(res, deployments)
  } catch (err: any) {
    return error(res, err.message, 'QUERY_ERROR', 500)
  }
})

// 获取部署详情
deploymentsRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const deployment = db.getDb().prepare('SELECT * FROM deployments WHERE id = ?').get(id)
    
    if (!deployment) {
      return error(res, '部署记录不存在', 'NOT_FOUND', 404)
    }
    
    return success(res, deployment)
  } catch (err: any) {
    return error(res, err.message, 'QUERY_ERROR', 500)
  }
})

// 创建部署
deploymentsRouter.post('/', (req, res) => {
  try {
    const { projectId, environment, version } = req.body
    
    if (!projectId || !environment) {
      return error(res, '项目ID和环境不能为空', 'INVALID_INPUT', 400)
    }
    
    const deployment: Deployment = {
      id: randomUUID(),
      projectId,
      environment,
      version,
      status: 'pending',
      startTime: Date.now(),
    }
    
    db.getDb().prepare(`
      INSERT INTO deployments (id, projectId, environment, version, status, startTime)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(deployment.id, deployment.projectId, deployment.environment, deployment.version, deployment.status, deployment.startTime)
    
    return success(res, deployment, '部署已创建')
  } catch (err: any) {
    return error(res, err.message, 'CREATE_ERROR', 500)
  }
})

// 回滚部署
deploymentsRouter.post('/:id/rollback', (req, res) => {
  try {
    const { id } = req.params
    
    db.getDb().prepare(`
      UPDATE deployments SET status = 'rolled_back', endTime = ?, duration = ? - startTime
      WHERE id = ?
    `).run(Date.now(), Date.now(), id)
    
    return success(res, null, '部署已回滚')
  } catch (err: any) {
    return error(res, err.message, 'ROLLBACK_ERROR', 500)
  }
})
