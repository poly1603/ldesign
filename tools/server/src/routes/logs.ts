import { Router } from 'express'
import { success, error } from '../utils/response'
import { db } from '../database'

export const logsRouter = Router()

// 获取日志列表
logsRouter.get('/', (req, res) => {
  try {
    const { level, limit = 100, offset = 0, startTime, endTime } = req.query
    
    let sql = 'SELECT * FROM logs WHERE 1=1'
    const params: any[] = []
    
    if (level) {
      sql += ' AND level = ?'
      params.push(level)
    }
    
    if (startTime) {
      sql += ' AND timestamp >= ?'
      params.push(Number(startTime))
    }
    
    if (endTime) {
      sql += ' AND timestamp <= ?'
      params.push(Number(endTime))
    }
    
    sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))
    
    const logs = db.getDb().prepare(sql).all(...params) as any[]
    
    const formatted = logs.map(log => ({
      ...log,
      meta: log.meta ? JSON.parse(log.meta) : undefined,
    }))
    
    return success(res, formatted)
  } catch (err: any) {
    return error(res, err.message, 'QUERY_ERROR', 500)
  }
})

// 清空日志
logsRouter.delete('/', (req, res) => {
  try {
    db.getDb().prepare('DELETE FROM logs').run()
    return success(res, null, '日志已清空')
  } catch (err: any) {
    return error(res, err.message, 'DELETE_ERROR', 500)
  }
})
