import { Router } from 'express'
import { success } from '../utils/response'
import { cpus, totalmem, freemem } from 'os'

export const monitorRouter = Router()

// 获取系统监控数据
monitorRouter.get('/system', (req, res) => {
  const cpuUsage = cpus().map(cpu => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0)
    const idle = cpu.times.idle
    return ((total - idle) / total) * 100
  })
  
  const avgCpu = cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length
  
  return success(res, {
    cpu: Math.round(avgCpu * 100) / 100,
    memory: Math.round(((totalmem() - freemem()) / totalmem()) * 100 * 100) / 100,
    disk: 0, // TODO: 实现磁盘使用率检测
    network: {
      rx: 0,
      tx: 0,
    },
    timestamp: Date.now(),
  })
})

// 获取项目监控数据
monitorRouter.get('/project/:id', (req, res) => {
  const { id } = req.params
  
  return success(res, {
    projectId: id,
    uptime: 0,
    requests: 0,
    errors: 0,
    responseTime: 0,
    timestamp: Date.now(),
  })
})
