/**
 * 项目管理API路由
 */

import { Router, type IRouter } from 'express'
import { readFileSync, existsSync, statSync, readdirSync } from 'fs'
import { join, resolve, basename, dirname, sep } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { homedir } from 'os'
import {
  getAllProjects,
  getProjectById,
  addProject,
  updateProject,
  deleteProject,
  getProjectByPath,
  detectProjectType,
  type Project
} from '../database/projects.js'

const execAsync = promisify(exec)

const projectsRouter: IRouter = Router()

/**
 * 验证项目路径是否有效
 */
function validateProjectPath(projectPath: string): { valid: boolean; error?: string; packageJson?: any } {
  try {
    // 检查路径是否存在
    if (!existsSync(projectPath)) {
      return { valid: false, error: '项目路径不存在' }
    }

    // 检查是否为目录
    const stats = statSync(projectPath)
    if (!stats.isDirectory()) {
      return { valid: false, error: '路径必须是一个目录' }
    }

    // 检查是否存在package.json
    const packageJsonPath = join(projectPath, 'package.json')
    if (!existsSync(packageJsonPath)) {
      return { valid: false, error: '项目目录中未找到package.json文件' }
    }

    // 读取并解析package.json
    try {
      const packageJsonContent = readFileSync(packageJsonPath, 'utf-8')
      const packageJson = JSON.parse(packageJsonContent)

      return { valid: true, packageJson }
    } catch (error) {
      return { valid: false, error: 'package.json文件格式错误' }
    }
  } catch (error) {
    return { valid: false, error: '验证项目路径时发生错误' }
  }
}

/**
 * 获取所有项目列表
 */
projectsRouter.get('/', (req, res) => {
  try {
    const projects = getAllProjects()
    res.json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.error('获取项目列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取项目列表失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 根据ID获取项目详情
 */
projectsRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const project = getProjectById(id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      })
    }

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('获取项目详情失败:', error)
    res.status(500).json({
      success: false,
      message: '获取项目详情失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取项目的package.json信息
 */
projectsRouter.get('/:id/package', (req, res) => {
  try {
    const { id } = req.params
    const project = getProjectById(id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      })
    }

    // 实时读取package.json文件
    const packageJsonPath = join(project.path, 'package.json')
    if (!existsSync(packageJsonPath)) {
      return res.status(404).json({
        success: false,
        message: 'package.json文件不存在'
      })
    }

    try {
      const packageJsonContent = readFileSync(packageJsonPath, 'utf-8')
      const packageJson = JSON.parse(packageJsonContent)

      res.json({
        success: true,
        data: packageJson
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'package.json文件格式错误'
      })
    }
  } catch (error) {
    console.error('获取package.json失败:', error)
    res.status(500).json({
      success: false,
      message: '获取package.json失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取目录列表
 */
projectsRouter.post('/list-directories', (req, res) => {
  try {
    const { path: dirPath } = req.body

    // 如果没有提供路径，返回根目录列表
    if (!dirPath) {
      // Windows 系统返回所有驱动器
      if (process.platform === 'win32') {
        const drives: Array<{ name: string; path: string; type: 'drive' }> = []

        // 获取所有驱动器（A-Z）
        for (let i = 65; i <= 90; i++) {
          const drive = String.fromCharCode(i) + ':\\'
          try {
            if (existsSync(drive)) {
              drives.push({
                name: drive,
                path: drive,
                type: 'drive'
              })
            }
          } catch (error) {
            // 忽略无法访问的驱动器
          }
        }

        // 添加用户主目录
        const homeDir = homedir()

        return res.json({
          success: true,
          data: {
            current: '',
            parent: null,
            directories: drives,
            specialDirs: [
              { name: '用户目录', path: homeDir, type: 'special' }
            ]
          }
        })
      } else {
        // Unix/Linux/Mac 返回根目录
        return res.json({
          success: true,
          data: {
            current: '/',
            parent: null,
            directories: [{ name: '/', path: '/', type: 'directory' }],
            specialDirs: [
              { name: '用户目录', path: homedir(), type: 'special' }
            ]
          }
        })
      }
    }

    // 验证路径是否存在
    if (!existsSync(dirPath)) {
      return res.status(400).json({
        success: false,
        message: '路径不存在'
      })
    }

    // 验证是否为目录
    const stats = statSync(dirPath)
    if (!stats.isDirectory()) {
      return res.status(400).json({
        success: false,
        message: '不是有效的目录'
      })
    }

    // 读取目录内容
    const items = readdirSync(dirPath, { withFileTypes: true })

    // 只返回目录
    const directories = items
      .filter(item => item.isDirectory())
      .map(item => ({
        name: item.name,
        path: join(dirPath, item.name),
        type: 'directory' as const
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    // 获取父目录
    const parentPath = dirname(dirPath)
    const parent = parentPath !== dirPath ? parentPath : null

    res.json({
      success: true,
      data: {
        current: dirPath,
        parent,
        directories
      }
    })
  } catch (error) {
    console.error('获取目录列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取目录列表失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 打开系统目录选择对话框（已废弃，保留用于兼容）
 */
projectsRouter.post('/select-directory', async (req, res) => {
  try {
    // Windows PowerShell 脚本来打开文件夹选择对话框
    // 使用 Base64 编码避免转义问题
    const powershellScript = `
Add-Type -AssemblyName System.Windows.Forms
$folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog
$folderBrowser.Description = '选择项目目录'
$folderBrowser.ShowNewFolderButton = $false
$result = $folderBrowser.ShowDialog()
if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
  Write-Output $folderBrowser.SelectedPath
}
`.trim()

    // 将脚本转换为 Base64 编码
    const encodedScript = Buffer.from(powershellScript, 'utf16le').toString('base64')

    // 执行 PowerShell 脚本（使用 -EncodedCommand 避免转义问题）
    const { stdout, stderr } = await execAsync(
      `powershell -NoProfile -NonInteractive -EncodedCommand ${encodedScript}`,
      {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024,
        timeout: 60000 // 60秒超时
      }
    )

    if (stderr && stderr.trim()) {
      console.error('PowerShell 错误:', stderr)
    }

    const selectedPath = stdout.trim()

    if (selectedPath) {
      console.log('用户选择的目录:', selectedPath)
      res.json({
        success: true,
        data: {
          path: selectedPath
        }
      })
    } else {
      console.log('用户取消了目录选择')
      res.json({
        success: false,
        message: '未选择目录'
      })
    }
  } catch (error) {
    console.error('打开目录选择对话框失败:', error)
    res.status(500).json({
      success: false,
      message: '打开目录选择对话框失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 验证项目路径并返回项目信息（不添加到数据库）
 */
projectsRouter.post('/validate', (req, res) => {
  try {
    const { path: projectPath } = req.body

    if (!projectPath) {
      return res.status(400).json({
        success: false,
        message: '项目路径不能为空'
      })
    }

    // 规范化路径
    const normalizedPath = resolve(projectPath)

    // 验证项目路径
    const validation = validateProjectPath(normalizedPath)
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      })
    }

    // 检查项目是否已存在
    const existingProject = getProjectByPath(normalizedPath)
    if (existingProject) {
      return res.json({
        success: true,
        data: {
          path: normalizedPath,
          name: existingProject.name,
          description: existingProject.description,
          type: existingProject.type,
          packageJson: validation.packageJson,
          exists: true
        },
        message: '该项目已存在'
      })
    }

    // 检测项目类型
    const projectType = detectProjectType(validation.packageJson)

    // 返回项目信息
    res.json({
      success: true,
      data: {
        path: normalizedPath,
        name: validation.packageJson?.name || basename(normalizedPath),
        description: validation.packageJson?.description || '',
        type: projectType,
        packageJson: validation.packageJson,
        exists: false
      }
    })
  } catch (error) {
    console.error('验证项目路径失败:', error)
    res.status(500).json({
      success: false,
      message: '验证项目路径失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 添加新项目
 */
projectsRouter.post('/', (req, res) => {
  try {
    const { path: projectPath, name, description } = req.body

    if (!projectPath) {
      return res.status(400).json({
        success: false,
        message: '项目路径不能为空'
      })
    }

    // 规范化路径
    const normalizedPath = resolve(projectPath)

    // 验证项目路径
    const validation = validateProjectPath(normalizedPath)
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      })
    }

    // 检查项目是否已存在
    const existingProject = getProjectByPath(normalizedPath)
    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: '该项目已存在'
      })
    }

    // 从package.json获取项目名称（如果没有提供）
    const projectName = name || validation.packageJson?.name || basename(normalizedPath)

    // 检测项目类型
    const projectType = detectProjectType(validation.packageJson)

    // 添加项目
    const newProject = addProject({
      name: projectName,
      path: normalizedPath,
      description: description || validation.packageJson?.description || '',
      type: projectType,
      packageJson: validation.packageJson
    })

    res.json({
      success: true,
      data: newProject,
      message: '项目添加成功'
    })
  } catch (error) {
    console.error('添加项目失败:', error)
    res.status(500).json({
      success: false,
      message: '添加项目失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 删除项目
 */
projectsRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    const success = deleteProject(id)

    if (!success) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      })
    }

    res.json({
      success: true,
      message: '项目删除成功'
    })
  } catch (error) {
    console.error('删除项目失败:', error)
    res.status(500).json({
      success: false,
      message: '删除项目失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 验证项目路径
 */
projectsRouter.post('/validate', (req, res) => {
  try {
    const { path: projectPath } = req.body

    if (!projectPath) {
      return res.status(400).json({
        success: false,
        message: '项目路径不能为空'
      })
    }

    const normalizedPath = resolve(projectPath)
    const validation = validateProjectPath(normalizedPath)

    if (validation.valid) {
      res.json({
        success: true,
        data: {
          path: normalizedPath,
          packageJson: validation.packageJson
        },
        message: '项目路径有效'
      })
    } else {
      res.status(400).json({
        success: false,
        message: validation.error
      })
    }
  } catch (error) {
    console.error('验证项目路径失败:', error)
    res.status(500).json({
      success: false,
      message: '验证项目路径失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

export { projectsRouter }
