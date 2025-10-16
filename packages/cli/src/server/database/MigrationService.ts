/**
 * 数据迁移服务
 * 将现有的 JSON 文件和 localStorage 数据迁移到 SQLite 数据库
 */

import * as fs from 'fs'
import * as path from 'path'
import { DatabaseManager } from './DatabaseManager'

export class MigrationService {
  private dbManager: DatabaseManager
  private dataDir: string

  constructor(dbManager: DatabaseManager, dataDir?: string) {
    this.dbManager = dbManager
    this.dataDir = dataDir || path.join(process.cwd(), 'data')
  }

  /**
   * 执行完整迁移
   */
  public async migrate(): Promise<{
    success: boolean
    migrated: {
      projects: number
      npmSources: number
      aiConfigs: number
      userSettings: number
    }
    errors: string[]
  }> {
    
    
    const errors: string[] = []
    const migrated = {
      projects: 0,
      npmSources: 0,
      aiConfigs: 0,
      userSettings: 0,
    }

    try {
      // 1. 迁移项目数据
      try {
        migrated.projects = await this.migrateProjects()
        
      } catch (error) {
        const msg = `项目迁移失败: ${error}`
        errors.push(msg)
        console.error(`[MigrationService] ${msg}`)
      }

      // 2. 迁移 NPM 源数据
      try {
        migrated.npmSources = await this.migrateNpmSources()
        
      } catch (error) {
        const msg = `NPM 源迁移失败: ${error}`
        errors.push(msg)
        console.error(`[MigrationService] ${msg}`)
      }

      // 3. 迁移 AI 配置数据
      try {
        migrated.aiConfigs = await this.migrateAIConfigs()
        
      } catch (error) {
        const msg = `AI 配置迁移失败: ${error}`
        errors.push(msg)
        console.error(`[MigrationService] ${msg}`)
      }

      // 4. 迁移用户设置
      try {
        migrated.userSettings = await this.migrateUserSettings()
        
      } catch (error) {
        const msg = `用户设置迁移失败: ${error}`
        errors.push(msg)
        console.error(`[MigrationService] ${msg}`)
      }

      
      
      return {
        success: errors.length === 0,
        migrated,
        errors,
      }
    } catch (error) {
      console.error('[MigrationService] 数据迁移失败:', error)
      return {
        success: false,
        migrated,
        errors: [...errors, `迁移失败: ${error}`],
      }
    }
  }

  /**
   * 迁移项目数据
   */
  private async migrateProjects(): Promise<number> {
    const projectsFile = path.join(this.dataDir, 'projects.json')
    
    if (!fs.existsSync(projectsFile)) {
      
      return 0
    }

    const data = JSON.parse(fs.readFileSync(projectsFile, 'utf-8'))
    const projects = Array.isArray(data) ? data : []
    
    const db = this.dbManager.getDatabase()
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO projects (
        id, name, path, type, framework, description,
        created_at, updated_at, last_opened_at, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    let count = 0
    
    this.dbManager.transaction(() => {
      for (const project of projects) {
        try {
          const now = Date.now()
          insertStmt.run(
            project.id || uuidv4(),
            project.name || 'Unknown',
            project.path || '',
            project.type || 'unknown',
            project.framework || null,
            project.description || null,
            project.createdAt || now,
            project.updatedAt || now,
            project.lastOpenedAt || null,
            JSON.stringify(project.metadata || {})
          )
          count++
        } catch (error) {
          console.error(`[MigrationService] 迁移项目失败: ${project.name}`, error)
        }
      }
    })

    return count
  }

  /**
   * 迁移 NPM 源数据
   */
  private async migrateNpmSources(): Promise<number> {
    const npmSourcesFile = path.join(this.dataDir, 'npm-sources.json')
    
    if (!fs.existsSync(npmSourcesFile)) {
      
      return 0
    }

    const data = JSON.parse(fs.readFileSync(npmSourcesFile, 'utf-8'))
    const sources = Array.isArray(data) ? data : []
    
    const db = this.dbManager.getDatabase()
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO npm_sources (
        id, name, url, type, description, is_logged_in, login_info,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    let count = 0
    
    this.dbManager.transaction(() => {
      for (const source of sources) {
        try {
          const now = Date.now()
          insertStmt.run(
            source.id || uuidv4(),
            source.name || 'Unknown',
            source.url || '',
            source.type || 'public',
            source.description || null,
            source.isLoggedIn ? 1 : 0,
            source.loginInfo ? JSON.stringify(source.loginInfo) : null,
            source.createdAt || now,
            source.updatedAt || now
          )
          count++
        } catch (error) {
          console.error(`[MigrationService] 迁移 NPM 源失败: ${source.name}`, error)
        }
      }
    })

    return count
  }

  /**
   * 迁移 AI 配置数据
   */
  private async migrateAIConfigs(): Promise<number> {
    // 从 localStorage 读取 AI 配置（如果在 Web 环境中）
    // 这里假设后端可以访问某种形式的配置存储
    const aiConfigFile = path.join(this.dataDir, 'ai-configs.json')
    
    if (!fs.existsSync(aiConfigFile)) {
      
      return 0
    }

    const data = JSON.parse(fs.readFileSync(aiConfigFile, 'utf-8'))
    const configs = Array.isArray(data) ? data : []
    
    const db = this.dbManager.getDatabase()
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO ai_configs (
        id, provider, api_key, model, base_url, config, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    let count = 0
    
    this.dbManager.transaction(() => {
      for (const config of configs) {
        try {
          const now = Date.now()
          insertStmt.run(
            config.id || uuidv4(),
            config.provider || 'unknown',
            config.apiKey || null,
            config.model || null,
            config.baseUrl || null,
            config.config ? JSON.stringify(config.config) : null,
            config.isActive ? 1 : 0,
            config.createdAt || now,
            config.updatedAt || now
          )
          count++
        } catch (error) {
          console.error(`[MigrationService] 迁移 AI 配置失败: ${config.provider}`, error)
        }
      }
    })

    return count
  }

  /**
   * 迁移用户设置
   */
  private async migrateUserSettings(): Promise<number> {
    const settingsFile = path.join(this.dataDir, 'user-settings.json')
    
    if (!fs.existsSync(settingsFile)) {
      
      return 0
    }

    const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'))
    
    const db = this.dbManager.getDatabase()
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO user_settings (
        key, value, type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?)
    `)

    let count = 0
    const now = Date.now()
    
    this.dbManager.transaction(() => {
      for (const [key, value] of Object.entries(settings)) {
        try {
          let type: string
          let valueStr: string

          if (typeof value === 'string') {
            type = 'string'
            valueStr = value
          } else if (typeof value === 'number') {
            type = 'number'
            valueStr = String(value)
          } else if (typeof value === 'boolean') {
            type = 'boolean'
            valueStr = String(value)
          } else {
            type = 'json'
            valueStr = JSON.stringify(value)
          }

          insertStmt.run(key, valueStr, type, now, now)
          count++
        } catch (error) {
          console.error(`[MigrationService] 迁移用户设置失败: ${key}`, error)
        }
      }
    })

    return count
  }

  /**
   * 备份现有数据文件
   */
  public async backupDataFiles(): Promise<void> {
    if (!fs.existsSync(this.dataDir)) {
      return
    }

    const backupDir = path.join(this.dataDir, `backup-${Date.now()}`)
    fs.mkdirSync(backupDir, { recursive: true })

    const files = fs.readdirSync(this.dataDir)
    for (const file of files) {
      if (file.endsWith('.json')) {
        const srcPath = path.join(this.dataDir, file)
        const destPath = path.join(backupDir, file)
        fs.copyFileSync(srcPath, destPath)
      }
    }

    
  }

  /**
   * 检查是否需要迁移
   */
  public needsMigration(): boolean {
    const db = this.dbManager.getDatabase()
    
    // 检查数据库是否为空
    const result = db.prepare(`
      SELECT COUNT(*) as count FROM projects
    `).get() as { count: number }

    // 如果数据库中没有项目，且存在 JSON 文件，则需要迁移
    if (result.count === 0) {
      const projectsFile = path.join(this.dataDir, 'projects.json')
      return fs.existsSync(projectsFile)
    }

    return false
  }
}
