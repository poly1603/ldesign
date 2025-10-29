import { Router } from 'express'
import { success, error } from '../utils/response'

export const gitRouter = Router()

// 模拟Git数据
const mockBranches = [
  { name: 'main', current: true, commit: 'abc123', lastModified: '2025-01-20' },
  { name: 'develop', current: false, commit: 'def456', lastModified: '2025-01-19' },
  { name: 'feature/new-ui', current: false, commit: 'ghi789', lastModified: '2025-01-18' },
]

const mockCommits = [
  {
    hash: 'abc123',
    author: 'John Doe',
    email: 'john@example.com',
    date: '2025-01-20T10:30:00Z',
    message: 'feat: add new feature',
    files: ['src/index.ts', 'src/utils.ts'],
  },
  {
    hash: 'def456',
    author: 'Jane Smith',
    email: 'jane@example.com',
    date: '2025-01-19T15:20:00Z',
    message: 'fix: resolve bug in router',
    files: ['src/router.ts'],
  },
]

const mockStatus = {
  branch: 'main',
  ahead: 0,
  behind: 0,
  staged: [],
  modified: ['src/app.ts'],
  untracked: ['temp.log'],
  conflicts: [],
}

// 获取仓库状态
gitRouter.get('/status', (req, res) => {
  return success(res, mockStatus)
})

// 获取分支列表
gitRouter.get('/branches', (req, res) => {
  return success(res, mockBranches)
})

// 创建分支
gitRouter.post('/branches', (req, res) => {
  const { name, from } = req.body
  
  if (!name) {
    return error(res, '分支名称不能为空', 'INVALID_INPUT', 400)
  }
  
  const newBranch = {
    name,
    current: false,
    commit: from || 'abc123',
    lastModified: new Date().toISOString().split('T')[0],
  }
  
  mockBranches.push(newBranch)
  return success(res, newBranch, '分支创建成功')
})

// 切换分支
gitRouter.post('/checkout', (req, res) => {
  const { branch } = req.body
  
  if (!branch) {
    return error(res, '分支名称不能为空', 'INVALID_INPUT', 400)
  }
  
  const targetBranch = mockBranches.find(b => b.name === branch)
  if (!targetBranch) {
    return error(res, '分支不存在', 'NOT_FOUND', 404)
  }
  
  mockBranches.forEach(b => { b.current = false })
  targetBranch.current = true
  mockStatus.branch = branch
  
  return success(res, null, `已切换到分支 ${branch}`)
})

// 删除分支
gitRouter.delete('/branches/:name', (req, res) => {
  const { name } = req.params
  
  const index = mockBranches.findIndex(b => b.name === name)
  if (index === -1) {
    return error(res, '分支不存在', 'NOT_FOUND', 404)
  }
  
  if (mockBranches[index].current) {
    return error(res, '不能删除当前分支', 'INVALID_OPERATION', 400)
  }
  
  mockBranches.splice(index, 1)
  return success(res, null, '分支删除成功')
})

// 获取提交历史
gitRouter.get('/commits', (req, res) => {
  const { branch, limit = '20', skip = '0' } = req.query
  
  const limitNum = Number.parseInt(limit as string, 10)
  const skipNum = Number.parseInt(skip as string, 10)
  
  const commits = mockCommits.slice(skipNum, skipNum + limitNum)
  
  return success(res, {
    commits,
    total: mockCommits.length,
    hasMore: skipNum + limitNum < mockCommits.length,
  })
})

// 获取提交详情
gitRouter.get('/commits/:hash', (req, res) => {
  const { hash } = req.params
  
  const commit = mockCommits.find(c => c.hash === hash)
  if (!commit) {
    return error(res, '提交不存在', 'NOT_FOUND', 404)
  }
  
  return success(res, {
    ...commit,
    diff: '+ added line\\n- removed line',
  })
})

// 暂存文件
gitRouter.post('/stage', (req, res) => {
  const { files } = req.body
  
  if (!Array.isArray(files)) {
    return error(res, '文件列表格式错误', 'INVALID_INPUT', 400)
  }
  
  mockStatus.staged.push(...files)
  mockStatus.modified = mockStatus.modified.filter(f => !files.includes(f))
  
  return success(res, null, '文件暂存成功')
})

// 取消暂存
gitRouter.post('/unstage', (req, res) => {
  const { files } = req.body
  
  if (!Array.isArray(files)) {
    return error(res, '文件列表格式错误', 'INVALID_INPUT', 400)
  }
  
  mockStatus.modified.push(...files)
  mockStatus.staged = mockStatus.staged.filter(f => !files.includes(f))
  
  return success(res, null, '取消暂存成功')
})

// 提交
gitRouter.post('/commit', (req, res) => {
  const { message } = req.body
  
  if (!message) {
    return error(res, '提交信息不能为空', 'INVALID_INPUT', 400)
  }
  
  if (mockStatus.staged.length === 0) {
    return error(res, '没有暂存的文件', 'INVALID_OPERATION', 400)
  }
  
  const newCommit = {
    hash: Math.random().toString(36).substring(7),
    author: 'Current User',
    email: 'user@example.com',
    date: new Date().toISOString(),
    message,
    files: [...mockStatus.staged],
  }
  
  mockCommits.unshift(newCommit)
  mockStatus.staged = []
  
  return success(res, newCommit, '提交成功')
})

// 推送
gitRouter.post('/push', (req, res) => {
  const { remote = 'origin', branch } = req.body
  
  return success(res, null, `已推送到 ${remote}/${branch || mockStatus.branch}`)
})

// 拉取
gitRouter.post('/pull', (req, res) => {
  const { remote = 'origin', branch } = req.body
  
  return success(res, {
    filesChanged: 3,
    insertions: 45,
    deletions: 12,
  }, `已从 ${remote}/${branch || mockStatus.branch} 拉取`)
})

// 获取diff
gitRouter.get('/diff', (req, res) => {
  const { file, staged } = req.query
  
  return success(res, {
    file: file || 'src/app.ts',
    diff: `@@ -1,5 +1,6 @@
 import express from 'express'
+import cors from 'cors'
 
 const app = express()
+app.use(cors())
 app.listen(3000)`,
  })
})

// 解决冲突
gitRouter.post('/resolve', (req, res) => {
  const { files } = req.body
  
  if (!Array.isArray(files)) {
    return error(res, '文件列表格式错误', 'INVALID_INPUT', 400)
  }
  
  return success(res, null, '冲突已解决')
})
