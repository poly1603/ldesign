import { Router } from 'express'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { success, error } from '../utils/response'
import { db } from '../database'

export const dependenciesRouter = Router()

// 获取项目依赖
dependenciesRouter.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params
    
    const project = db.getDb().prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any
    if (!project) {
      return error(res, '项目不存在', 'NOT_FOUND', 404)
    }
    
    const packageJsonPath = join(project.path, 'package.json')
    if (!existsSync(packageJsonPath)) {
      return error(res, 'package.json 不存在', 'FILE_NOT_FOUND', 404)
    }
    
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'))
    
    const dependencies = {
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {},
      peerDependencies: packageJson.peerDependencies || {},
    }
    
    return success(res, dependencies)
  } catch (err: any) {
    return error(res, err.message, 'READ_ERROR', 500)
  }
})

// 检查依赖更新
dependenciesRouter.get('/:projectId/updates', async (req, res) => {
  try {
    const { projectId } = req.params
    
    // 模拟依赖更新检查
    const updates = [
      {
        name: 'vue',
        current: '3.5.0',
        wanted: '3.5.22',
        latest: '3.5.22',
        type: 'dependencies',
      },
      {
        name: 'vite',
        current: '5.4.0',
        wanted: '5.4.21',
        latest: '5.4.21',
        type: 'devDependencies',
      },
    ]
    
    return success(res, updates)
  } catch (err: any) {
    return error(res, err.message, 'CHECK_ERROR', 500)
  }
})

// 分析依赖树
dependenciesRouter.get('/:projectId/tree', async (req, res) => {
  try {
    const { projectId } = req.params
    
    // 模拟依赖树
    const tree = {
      name: 'my-project',
      version: '1.0.0',
      dependencies: [
        {
          name: 'vue',
          version: '3.5.22',
          dependencies: [
            { name: '@vue/reactivity', version: '3.5.22' },
            { name: '@vue/runtime-core', version: '3.5.22' },
          ],
        },
        {
          name: 'vite',
          version: '5.4.21',
          dependencies: [
            { name: 'esbuild', version: '0.21.5' },
            { name: 'rollup', version: '4.9.0' },
          ],
        },
      ],
    }
    
    return success(res, tree)
  } catch (err: any) {
    return error(res, err.message, 'ANALYSIS_ERROR', 500)
  }
})
