import { Router } from 'express'
import { success, error } from '../utils/response'
import { taskManager } from '../core/TaskManager'

export const tasksRouter = Router()

// 获取所有任务
tasksRouter.get('/', (req, res) => {
  try {
    const { projectId, status } = req.query
    
    const tasks = taskManager.getAllTasks({
      projectId: projectId as string | undefined,
      status: status as any,
    })
    
    return success(res, tasks)
  } catch (err: any) {
    return error(res, err.message, 'QUERY_ERROR', 500)
  }
})

// 获取单个任务
tasksRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const task = taskManager.getTask(id)
    
    if (!task) {
      return error(res, '任务不存在', 'NOT_FOUND', 404)
    }
    
    return success(res, task)
  } catch (err: any) {
    return error(res, err.message, 'QUERY_ERROR', 500)
  }
})

// 创建任务
tasksRouter.post('/', (req, res) => {
  try {
    const { type, projectId } = req.body
    
    if (!type) {
      return error(res, '任务类型不能为空', 'INVALID_INPUT', 400)
    }
    
    const task = taskManager.createTask(type, projectId)
    return success(res, task, '任务已创建')
  } catch (err: any) {
    return error(res, err.message, 'CREATE_ERROR', 500)
  }
})

// 取消任务
tasksRouter.post('/:id/cancel', (req, res) => {
  try {
    const { id } = req.params
    const cancelled = taskManager.cancelTask(id)
    
    if (!cancelled) {
      return error(res, '无法取消任务', 'INVALID_STATE', 400)
    }
    
    return success(res, null, '任务已取消')
  } catch (err: any) {
    return error(res, err.message, 'CANCEL_ERROR', 500)
  }
})

// 删除任务
tasksRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    const deleted = taskManager.deleteTask(id)
    
    if (!deleted) {
      return error(res, '任务不存在', 'NOT_FOUND', 404)
    }
    
    return success(res, null, '任务已删除')
  } catch (err: any) {
    return error(res, err.message, 'DELETE_ERROR', 500)
  }
})

// 清理已完成的任务
tasksRouter.post('/cleanup', (req, res) => {
  try {
    const { olderThan = 24 * 60 * 60 * 1000 } = req.body
    const count = taskManager.cleanupCompletedTasks(olderThan)
    
    return success(res, { count }, `已清理 ${count} 个任务`)
  } catch (err: any) {
    return error(res, err.message, 'CLEANUP_ERROR', 500)
  }
})

// 注册示例任务执行器
taskManager.registerExecutor('build', async (task, updateProgress) => {
  updateProgress(10, '准备构建环境')
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  updateProgress(30, '安装依赖')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  updateProgress(60, '编译代码')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  updateProgress(90, '打包资源')
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return { success: true, output: 'dist/' }
})

taskManager.registerExecutor('test', async (task, updateProgress) => {
  updateProgress(20, '启动测试环境')
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  updateProgress(50, '运行测试用例')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  updateProgress(80, '生成测试报告')
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return { passed: 42, failed: 0, coverage: 85.5 }
})

taskManager.registerExecutor('deploy', async (task, updateProgress) => {
  updateProgress(15, '连接部署服务器')
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  updateProgress(40, '上传文件')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  updateProgress(70, '重启服务')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  updateProgress(95, '验证部署')
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return { url: 'https://example.com', status: 'deployed' }
})
