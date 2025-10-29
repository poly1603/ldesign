import { Router } from 'express'
import { randomUUID } from 'crypto'
import { success, error } from '../utils/response'
import { db } from '../database'
import type { TestRun } from '../types'

export const testsRouter = Router()

// 获取测试列表
testsRouter.get('/', (req, res) => {
  try {
    const { projectId, type, limit = 50, offset = 0 } = req.query
    
    let sql = 'SELECT * FROM test_runs WHERE 1=1'
    const params: any[] = []
    
    if (projectId) {
      sql += ' AND projectId = ?'
      params.push(projectId)
    }
    
    if (type) {
      sql += ' AND type = ?'
      params.push(type)
    }
    
    sql += ' ORDER BY startTime DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))
    
    const tests = db.getDb().prepare(sql).all(...params)
    return success(res, tests)
  } catch (err: any) {
    return error(res, err.message, 'QUERY_ERROR', 500)
  }
})

// 获取测试详情
testsRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const test = db.getDb().prepare('SELECT * FROM test_runs WHERE id = ?').get(id) as any
    
    if (!test) {
      return error(res, '测试记录不存在', 'NOT_FOUND', 404)
    }
    
    return success(res, {
      ...test,
      results: test.results ? JSON.parse(test.results) : undefined,
    })
  } catch (err: any) {
    return error(res, err.message, 'QUERY_ERROR', 500)
  }
})

// 创建测试
testsRouter.post('/', (req, res) => {
  try {
    const { projectId, type = 'all' } = req.body
    
    if (!projectId) {
      return error(res, '项目ID不能为空', 'INVALID_INPUT', 400)
    }
    
    const testRun: TestRun = {
      id: randomUUID(),
      projectId,
      type,
      status: 'pending',
      startTime: Date.now(),
    }
    
    db.getDb().prepare(`
      INSERT INTO test_runs (id, projectId, type, status, startTime)
      VALUES (?, ?, ?, ?, ?)
    `).run(testRun.id, testRun.projectId, testRun.type, testRun.status, testRun.startTime)
    
    return success(res, testRun, '测试已创建')
  } catch (err: any) {
    return error(res, err.message, 'CREATE_ERROR', 500)
  }
})
