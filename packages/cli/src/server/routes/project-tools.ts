/**
 * 项目工具 API 路由
 * 提供依赖管理、脚本管理、配置文件管理等功能
 */

import { Router, type IRouter } from 'express'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '../../utils/logger.js'
import {
  readVersionCache,
  writeVersionCache,
  clearVersionCache,
  getCacheStatus
} from '../services/version-cache.js'

const execAsync = promisify(exec)
const toolsLogger = logger.withPrefix('Tools')

export const projectToolsRouter: IRouter = Router()

// ==================== Package.json API ====================

/**
 * 获取 package.json 内容
 */
projectToolsRouter.get('/package-json', (req, res) => {
  try {
    const { projectPath } = req.query

    if (!projectPath || typeof projectPath !== 'string') {
      return res.status(400).json({
        success: false,
        message: '缺少 projectPath 参数'
      })
    }

    const packageJsonPath = join(projectPath, 'package.json')

    if (!existsSync(packageJsonPath)) {
      return res.status(404).json({
        success: false,
        message: 'package.json 文件不存在'
      })
    }

    const content = readFileSync(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(content)

    res.json({
      success: true,
      data: packageJson
    })
  } catch (error) {
    toolsLogger.error('读取 package.json 失败:', error)
    res.status(500).json({
      success: false,
      message: '读取 package.json 失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

// ==================== Dependencies API ====================

/**
 * 检查依赖更新（批量并发 + 缓存）
 */
projectToolsRouter.post('/dependencies/check-updates', async (req, res) => {
  try {
    const { projectPath, dependencies, forceRefresh = false } = req.body

    if (!projectPath || !dependencies) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    // 尝试从缓存读取
    let cachedVersions = forceRefresh ? null : readVersionCache(projectPath)
    
    if (cachedVersions) {
      toolsLogger.info('使用缓存的版本信息')
      res.json({
        success: true,
        data: cachedVersions,
        fromCache: true
      })
      return
    }

    // 缓存不存在或过期，从 npm 获取
    toolsLogger.info('从 npm 检查版本信息')
    
    // 使用 Promise.allSettled 并发获取所有依赖的最新版本
    const updatePromises = dependencies.map(async (dep: any) => {
      try {
        const { stdout } = await execAsync(`npm view ${dep.name} version`, {
          cwd: projectPath,
          timeout: 5000
        })
        return {
          name: dep.name,
          version: stdout.trim()
        }
      } catch (error) {
        // 如果获取失败，返回原版本
        return {
          name: dep.name,
          version: dep.version
        }
      }
    })

    const results = await Promise.allSettled(updatePromises)
    const updates: Record<string, string> = {}

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        updates[result.value.name] = result.value.version
      }
    })

    // 写入缓存
    writeVersionCache(projectPath, updates)

    res.json({
      success: true,
      data: updates,
      fromCache: false
    })
  } catch (error) {
    toolsLogger.error('检查依赖更新失败:', error)
    res.status(500).json({
      success: false,
      message: '检查依赖更新失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取依赖的所有可用版本
 */
projectToolsRouter.post('/dependencies/versions', async (req, res) => {
  try {
    const { projectPath, name } = req.body

    if (!projectPath || !name) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    try {
      const { stdout } = await execAsync(`npm view ${name} versions --json`, {
        cwd: projectPath,
        timeout: 10000
      })
      const versions = JSON.parse(stdout)
      
      res.json({
        success: true,
        data: Array.isArray(versions) ? versions.reverse() : [versions] // 最新版本在前
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取版本列表失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  } catch (error) {
    toolsLogger.error('获取依赖版本失败:', error)
    res.status(500).json({
      success: false,
      message: '获取依赖版本失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 更新单个依赖
 */
projectToolsRouter.post('/dependencies/update', async (req, res) => {
  try {
    const { projectPath, name, version, isDev } = req.body

    if (!projectPath || !name || !version) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    // 读取 package.json
    const packageJsonPath = join(projectPath, 'package.json')
    const content = readFileSync(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(content)

    // 更新版本
    if (isDev) {
      if (!packageJson.devDependencies) {
        packageJson.devDependencies = {}
      }
      packageJson.devDependencies[name] = version
    } else {
      if (!packageJson.dependencies) {
        packageJson.dependencies = {}
      }
      packageJson.dependencies[name] = version
    }

    // 写回文件
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8')

    // 执行 npm install
    try {
      await execAsync(`npm install ${name}@${version}${isDev ? ' --save-dev' : ''}`, {
        cwd: projectPath,
        timeout: 60000
      })
    } catch (installError) {
      toolsLogger.warn('npm install 警告:', installError)
      // 即使 npm install 失败，package.json 已更新，仍然返回成功
    }

    res.json({
      success: true,
      message: `${name} 已更新到 ${version}`
    })
  } catch (error) {
    toolsLogger.error('更新依赖失败:', error)
    res.status(500).json({
      success: false,
      message: '更新依赖失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 删除依赖
 */
projectToolsRouter.post('/dependencies/remove', async (req, res) => {
  try {
    const { projectPath, name, isDev } = req.body

    if (!projectPath || !name) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    // 读取 package.json
    const packageJsonPath = join(projectPath, 'package.json')
    const content = readFileSync(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(content)

    // 删除依赖
    if (isDev && packageJson.devDependencies) {
      delete packageJson.devDependencies[name]
    } else if (packageJson.dependencies) {
      delete packageJson.dependencies[name]
    }

    // 写回文件
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8')

    // 执行 npm uninstall
    try {
      await execAsync(`npm uninstall ${name}`, {
        cwd: projectPath,
        timeout: 60000
      })
    } catch (uninstallError) {
      toolsLogger.warn('npm uninstall 警告:', uninstallError)
    }

    res.json({
      success: true,
      message: `${name} 已删除`
    })
  } catch (error) {
    toolsLogger.error('删除依赖失败:', error)
    res.status(500).json({
      success: false,
      message: '删除依赖失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 搜索npm包
 */
projectToolsRouter.post('/dependencies/search', async (req, res) => {
  try {
    const { keyword, registries } = req.body

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '缺少搜索关键词'
      })
    }

    // 默认注册表
    const defaultRegistries = [
      { name: 'npm', url: 'https://registry.npmjs.org' },
      { name: 'cnpm', url: 'https://registry.npmmirror.com' }
    ]

    // 合并用户配置的注册表
    const allRegistries = registries && registries.length > 0 
      ? registries 
      : defaultRegistries

    // 从所有注册表搜索
    const searchPromises = allRegistries.map(async (registry: any) => {
      try {
        // 使用 npm search API
        const searchUrl = `${registry.url}/-/v1/search?text=${encodeURIComponent(keyword)}&size=20`
        
        const response = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(10000) // 10秒超时
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        
        // 处理结果
        const packages = (data.objects || []).map((item: any) => ({
          name: item.package.name,
          version: item.package.version,
          description: item.package.description || '',
          author: item.package.author?.name || '',
          keywords: item.package.keywords || [],
          source: registry.name,
          sourceUrl: registry.url
        }))

        return {
          source: registry.name,
          sourceUrl: registry.url,
          success: true,
          packages
        }
      } catch (error) {
        toolsLogger.warn(`从 ${registry.name} 搜索失败:`, error)
        return {
          source: registry.name,
          sourceUrl: registry.url,
          success: false,
          packages: [],
          error: error instanceof Error ? error.message : String(error)
        }
      }
    })

    const results = await Promise.allSettled(searchPromises)
    const searchResults = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<any>).value)

    // 合并并去重结果
    const packageMap = new Map()
    searchResults.forEach(result => {
      if (result.success) {
        result.packages.forEach((pkg: any) => {
          if (!packageMap.has(pkg.name)) {
            packageMap.set(pkg.name, { ...pkg, sources: [result.source] })
          } else {
            const existing = packageMap.get(pkg.name)
            if (!existing.sources.includes(result.source)) {
              existing.sources.push(result.source)
            }
          }
        })
      }
    })

    const packages = Array.from(packageMap.values())

    res.json({
      success: true,
      data: {
        packages,
        sources: searchResults.map(r => ({
          name: r.source,
          success: r.success,
          count: r.packages.length,
          error: r.error
        }))
      }
    })
  } catch (error) {
    toolsLogger.error('搜索npm包失败:', error)
    res.status(500).json({
      success: false,
      message: '搜索npm包失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 新增依赖
 */
projectToolsRouter.post('/dependencies/add', async (req, res) => {
  try {
    const { projectPath, name, version, isDev } = req.body

    if (!projectPath || !name) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    // 如果没有指定版本，使用 latest
    const installVersion = version || 'latest'

    // 执行 npm install
    try {
      await execAsync(`npm install ${name}@${installVersion}${isDev ? ' --save-dev' : ' --save'}`, {
        cwd: projectPath,
        timeout: 120000 // 2分钟超时，首次安装可能较慢
      })

      res.json({
        success: true,
        message: `${name} 已安装`
      })
    } catch (installError: any) {
      res.status(500).json({
        success: false,
        message: '安装依赖失败',
        error: installError.message || String(installError)
      })
    }
  } catch (error) {
    toolsLogger.error('新增依赖失败:', error)
    res.status(500).json({
      success: false,
      message: '新增依赖失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

// ==================== Scripts API ====================

/**
 * 保存 script
 */
projectToolsRouter.post('/scripts/save', (req, res) => {
  try {
    const { projectPath, name, command } = req.body

    if (!projectPath || !name || !command) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    // 读取 package.json
    const packageJsonPath = join(projectPath, 'package.json')
    const content = readFileSync(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(content)

    // 更新 scripts
    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }
    packageJson.scripts[name] = command

    // 写回文件
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8')

    res.json({
      success: true,
      message: 'Script 保存成功'
    })
  } catch (error) {
    toolsLogger.error('保存 script 失败:', error)
    res.status(500).json({
      success: false,
      message: '保存 script 失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 删除 script
 */
projectToolsRouter.post('/scripts/delete', (req, res) => {
  try {
    const { projectPath, name } = req.body

    if (!projectPath || !name) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    // 读取 package.json
    const packageJsonPath = join(projectPath, 'package.json')
    const content = readFileSync(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(content)

    // 删除 script
    if (packageJson.scripts && packageJson.scripts[name]) {
      delete packageJson.scripts[name]
    }

    // 写回文件
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8')

    res.json({
      success: true,
      message: 'Script 删除成功'
    })
  } catch (error) {
    toolsLogger.error('删除 script 失败:', error)
    res.status(500).json({
      success: false,
      message: '删除 script 失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 运行 script
 */
projectToolsRouter.post('/scripts/run', async (req, res) => {
  try {
    const { projectPath, name } = req.body

    if (!projectPath || !name) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    // 执行 npm run
    try {
      const { stdout, stderr } = await execAsync(`npm run ${name}`, {
        cwd: projectPath,
        timeout: 300000, // 5分钟超时
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      })

      res.json({
        success: true,
        data: {
          output: stdout + stderr
        }
      })
    } catch (error: any) {
      // 即使命令执行失败，也返回输出
      res.json({
        success: false,
        message: '脚本执行失败',
        data: {
          output: (error.stdout || '') + (error.stderr || '')
        }
      })
    }
  } catch (error) {
    toolsLogger.error('运行 script 失败:', error)
    res.status(500).json({
      success: false,
      message: '运行 script 失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

// ==================== Build Configs API ====================

/**
 * 加载构建配置文件
 */
projectToolsRouter.post('/configs/load', (req, res) => {
  try {
    const { projectPath, files } = req.body

    if (!projectPath || !files) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    const results = files.map((fileName: string) => {
      const filePath = join(projectPath, fileName)
      const exists = existsSync(filePath)

      if (exists) {
        try {
          const content = readFileSync(filePath, 'utf-8')
          return {
            name: fileName,
            exists: true,
            content
          }
        } catch (error) {
          return {
            name: fileName,
            exists: true,
            content: '',
            error: '读取文件失败'
          }
        }
      }

      return {
        name: fileName,
        exists: false
      }
    })

    res.json({
      success: true,
      data: results
    })
  } catch (error) {
    toolsLogger.error('加载配置文件失败:', error)
    res.status(500).json({
      success: false,
      message: '加载配置文件失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 保存配置文件
 */
projectToolsRouter.post('/configs/save', (req, res) => {
  try {
    const { projectPath, fileName, content } = req.body

    if (!projectPath || !fileName || content === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    const filePath = join(projectPath, fileName)
    writeFileSync(filePath, content, 'utf-8')

    res.json({
      success: true,
      message: '保存成功'
    })
  } catch (error) {
    toolsLogger.error('保存配置文件失败:', error)
    res.status(500).json({
      success: false,
      message: '保存配置文件失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 创建配置文件
 */
projectToolsRouter.post('/configs/create', (req, res) => {
  try {
    const { projectPath, fileName } = req.body

    if (!projectPath || !fileName) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    const filePath = join(projectPath, fileName)

    // 根据文件类型创建默认内容
    let defaultContent = ''

    if (fileName === 'tsconfig.json') {
      defaultContent = JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          module: 'ESNext',
          lib: ['ES2020', 'DOM'],
          moduleResolution: 'node',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true
        }
      }, null, 2)
    } else if (fileName.includes('vite.config')) {
      defaultContent = `import { defineConfig } from 'vite'\n\nexport default defineConfig({\n  // 配置项\n})\n`
    } else if (fileName.includes('webpack.config')) {
      defaultContent = `module.exports = {\n  // 配置项\n}\n`
    }

    writeFileSync(filePath, defaultContent, 'utf-8')

    res.json({
      success: true,
      message: '文件创建成功'
    })
  } catch (error) {
    toolsLogger.error('创建配置文件失败:', error)
    res.status(500).json({
      success: false,
      message: '创建配置文件失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

// ==================== Other Configs API ====================

/**
 * 加载其他配置文件
 */
projectToolsRouter.post('/other-configs/load', (req, res) => {
  try {
    const { projectPath, files } = req.body

    if (!projectPath || !files) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    const results = files.map((file: { name: string; description: string }) => {
      const filePath = join(projectPath, file.name)
      const exists = existsSync(filePath)

      if (exists) {
        try {
          const content = readFileSync(filePath, 'utf-8')
          return {
            ...file,
            exists: true,
            content
          }
        } catch (error) {
          return {
            ...file,
            exists: true,
            content: '',
            error: '读取文件失败'
          }
        }
      }

      return {
        ...file,
        exists: false
      }
    })

    res.json({
      success: true,
      data: results
    })
  } catch (error) {
    toolsLogger.error('加载其他配置文件失败:', error)
    res.status(500).json({
      success: false,
      message: '加载其他配置文件失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 保存其他配置文件
 */
projectToolsRouter.post('/other-configs/save', (req, res) => {
  try {
    const { projectPath, fileName, content } = req.body

    if (!projectPath || !fileName || content === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    const filePath = join(projectPath, fileName)
    writeFileSync(filePath, content, 'utf-8')

    res.json({
      success: true,
      message: '保存成功'
    })
  } catch (error) {
    toolsLogger.error('保存其他配置文件失败:', error)
    res.status(500).json({
      success: false,
      message: '保存其他配置文件失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 分析依赖健康度
 */
projectToolsRouter.post('/dependencies/analyze-health', async (req, res) => {
  try {
    const { projectPath, dependencies } = req.body

    if (!projectPath || !dependencies || !Array.isArray(dependencies)) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    // 导入健康度分析工具
    const { analyzeDependencyHealth } = await import('../utils/dependency-health.js')

    // 调用健康度分析
    const health = analyzeDependencyHealth(dependencies)

    // TODO: 这里可以接入 DeepSeek AI 分析
    // 示例: const aiSuggestions = await getAISuggestions(dependencies)

    res.json({
      success: true,
      data: {
        health,
        // AI 分析结果（预留）
        aiSuggestions: null,
        // 缓存信息
        cacheStatus: getCacheStatus(projectPath)
      }
    })
  } catch (error) {
    toolsLogger.error('分析依赖健康度失败:', error)
    res.status(500).json({
      success: false,
      message: '分析依赖健康度失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 获取缓存状态
 */
projectToolsRouter.get('/dependencies/cache-status', (req, res) => {
  try {
    const { projectPath } = req.query

    if (!projectPath || typeof projectPath !== 'string') {
      return res.status(400).json({
        success: false,
        message: '缺少 projectPath 参数'
      })
    }

    const status = getCacheStatus(projectPath)

    res.json({
      success: true,
      data: status
    })
  } catch (error) {
    toolsLogger.error('获取缓存状态失败:', error)
    res.status(500).json({
      success: false,
      message: '获取缓存状态失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 清除缓存
 */
projectToolsRouter.post('/dependencies/clear-cache', (req, res) => {
  try {
    const { projectPath } = req.body

    if (!projectPath) {
      return res.status(400).json({
        success: false,
        message: '缺少 projectPath 参数'
      })
    }

    const cleared = clearVersionCache(projectPath)

    res.json({
      success: true,
      data: { cleared },
      message: cleared ? '缓存已清除' : '缓存不存在'
    })
  } catch (error) {
    toolsLogger.error('清除缓存失败:', error)
    res.status(500).json({
      success: false,
      message: '清除缓存失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * 创建其他配置文件
 */
projectToolsRouter.post('/other-configs/create', (req, res) => {
  try {
    const { projectPath, fileName } = req.body

    if (!projectPath || !fileName) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    const filePath = join(projectPath, fileName)

    // 根据文件类型创建默认内容
    let defaultContent = ''

    if (fileName === '.gitignore') {
      defaultContent = `node_modules/
dist/
.DS_Store
*.log
.env.local
`
    } else if (fileName === '.eslintrc.json' || fileName === '.eslintrc') {
      defaultContent = JSON.stringify({
        env: {
          browser: true,
          es2021: true
        },
        extends: ['eslint:recommended'],
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module'
        },
        rules: {}
      }, null, 2)
    } else if (fileName === '.prettierrc' || fileName === '.prettierrc.json') {
      defaultContent = JSON.stringify({
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5'
      }, null, 2)
    } else if (fileName === '.editorconfig') {
      defaultContent = `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
`
    } else if (fileName === '.npmrc') {
      defaultContent = `registry=https://registry.npmjs.org/
`
    } else if (fileName === 'LICENSE') {
      defaultContent = `MIT License

Copyright (c) ${new Date().getFullYear()}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
`
    } else if (fileName.startsWith('.env')) {
      defaultContent = `# Environment Variables
`
    }

    writeFileSync(filePath, defaultContent, 'utf-8')

    res.json({
      success: true,
      message: '文件创建成功'
    })
  } catch (error) {
    toolsLogger.error('创建其他配置文件失败:', error)
    res.status(500).json({
      success: false,
      message: '创建其他配置文件失败',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})