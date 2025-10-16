/**
 * 数据库管理器 - 使用 sql.js
 * sql.js 是纯 JavaScript 实现的 SQLite，不需要编译原生模块
 */

import initSqlJs, { type Database } from 'sql.js'
import * as path from 'path'
import * as fs from 'fs'

export interface DatabaseConfig {
  dbPath?: string
  verbose?: boolean
  readonly?: boolean
  fileMustExist?: boolean
}

/**
 * 数据库管理器类
 */
export class DatabaseManager {
  private db: Database | null = null
  private SQL: any = null
  private config: DatabaseConfig
  private dbPath: string

  constructor(config: DatabaseConfig = {}) {
    this.config = {
      verbose: config.verbose ?? false,
      readonly: config.readonly ?? false,
      fileMustExist: config.fileMustExist ?? false,
      ...config,
    }

    // 确定数据库文件路径
    this.dbPath = config.dbPath || this.getDefaultDbPath()
  }

  /**
   * 获取默认数据库路径
   */
  private getDefaultDbPath(): string {
    // 使用项目根目录下的 data 目录
    const dbDir = path.join(process.cwd(), 'data')
    
    // 确保目录存在
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    return path.join(dbDir, 'speed-tool.db')
  }

  /**
   * 初始化数据库连接
   */
  public async initialize(): Promise<void> {
    try {
      

      // 初始化 sql.js
      this.SQL = await initSqlJs()

      // 检查数据库文件是否存在
      let buffer: Uint8Array | undefined
      if (fs.existsSync(this.dbPath)) {
        buffer = fs.readFileSync(this.dbPath)
      } else if (this.config?.fileMustExist) {
        throw new Error(`数据库文件不存在: ${this.dbPath}`)
      }

      // 创建或打开数据库
      this.db = new this.SQL.Database(buffer)

      // 启用外键约束
      this.exec('PRAGMA foreign_keys = ON')

      // 创建表结构
      await this.createTables()

      
    } catch (error) {
      console.error('[DatabaseManager] 数据库初始化失败:', error)
      throw error
    }
  }

  /**
   * 执行 SQL 语句
   */
  private exec(sql: string): void {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }
    this.db.run(sql)
  }

  /**
   * 创建数据库表结构
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    // 项目表
    this.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        framework TEXT,
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        last_opened_at INTEGER,
        metadata TEXT
      )
    `)

    // NPM 源表
    this.exec(`
      CREATE TABLE IF NOT EXISTS npm_sources (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('public', 'private')),
        description TEXT,
        is_logged_in INTEGER DEFAULT 0,
        login_info TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)

    // AI 配置表
    this.exec(`
      CREATE TABLE IF NOT EXISTS ai_configs (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        api_key TEXT,
        model TEXT,
        base_url TEXT,
        config TEXT,
        is_active INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)

    // AI 对话表
    this.exec(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        metadata TEXT
      )
    `)

    // AI 消息表
    this.exec(`
      CREATE TABLE IF NOT EXISTS ai_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
      )
    `)

    // 用户设置表
    this.exec(`
      CREATE TABLE IF NOT EXISTS user_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('string', 'number', 'boolean', 'json')),
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)

    // Node 版本配置表
    this.exec(`
      CREATE TABLE IF NOT EXISTS node_configs (
        id TEXT PRIMARY KEY,
        version TEXT NOT NULL,
        path TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        is_installed INTEGER DEFAULT 1,
        metadata TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)

    // Verdaccio 配置表
    this.exec(`
      CREATE TABLE IF NOT EXISTS verdaccio_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)

    // 创建索引以提高查询性能
    this.exec(`
      CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_projects_last_opened_at ON projects(last_opened_at DESC);
      CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON ai_conversations(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at);
    `)

    
  }

  /**
   * 获取数据库实例（带有 better-sqlite3 风格的兼容 API）
   */
  public getDatabase(): any {
    if (!this.db) {
      throw new Error('数据库未初始化，请先调用 initialize()')
    }
    
    const self = this
    
    // 返回一个包装对象，提供 better-sqlite3 风格的 API
    return {
      prepare(sql: string) {
        return {
          run(...params: any[]) {
            if (!self.db) throw new Error('数据库未初始化')
            self.db.run(sql, params)
            // 保存到文件
            self.save()
            return { changes: 1 }
          },
          get(...params: any[]) {
            if (!self.db) throw new Error('数据库未初始化')
            const result = self.db.exec(sql, params)
            if (result.length === 0 || !result[0] || result[0].values.length === 0) {
              return null
            }
            const columns = result[0].columns
            const values = result[0].values[0]
            const row: any = {}
            columns.forEach((col, index) => {
              row[col] = values[index]
            })
            return row
          },
          all(...params: any[]) {
            if (!self.db) throw new Error('数据库未初始化')
            const result = self.db.exec(sql, params)
            if (result.length === 0 || !result[0]) {
              return []
            }
            const columns = result[0].columns
            const values = result[0].values
            return values.map(row => {
              const obj: any = {}
              columns.forEach((col, index) => {
                obj[col] = row[index]
              })
              return obj
            })
          }
        }
      }
    }
  }

  /**
   * 保存数据库到文件
   */
  private save(): void {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }
    const data = this.db.export()
    fs.writeFileSync(this.dbPath, data)
  }

  /**
   * 关闭数据库连接
   */
  public close(): void {
    if (this.db) {
      // 保存到文件
      this.save()
      this.db.close()
      this.db = null
      
    }
  }

  /**
   * 执行事务
   */
  public transaction<T>(fn: () => T): T {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }
    
    try {
      this.exec('BEGIN TRANSACTION')
      const result = fn()
      this.exec('COMMIT')
      // 事务成功后保存到文件
      this.save()
      return result
    } catch (error) {
      this.exec('ROLLBACK')
      throw error
    }
  }

  /**
   * 备份数据库
   */
  public async backup(backupPath?: string): Promise<string> {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    const targetPath = backupPath || `${this.dbPath}.backup-${Date.now()}`
    
    try {
      // 先保存当前数据
      this.save()
      // 复制文件
      fs.copyFileSync(this.dbPath, targetPath)
      
      return targetPath
    } catch (error) {
      throw error
    }
  }

  /**
   * 优化数据库
   */
  public optimize(): void {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    this.exec('PRAGMA optimize')
    this.exec('VACUUM')
    this.save()
    
  }

  /**
   * 获取数据库统计信息
   */
  public getStats(): {
    size: number
    pageCount: number
    pageSize: number
    tables: Array<{ name: string; rowCount: number }>
  } {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    // 获取文件大小
    const stats = fs.statSync(this.dbPath)
    const size = stats.size

    // 获取页数和页大小
    const pageCountResult = this.db.exec('PRAGMA page_count')
    const pageSizeResult = this.db.exec('PRAGMA page_size')
    
    const pageCount = pageCountResult[0]?.values[0]?.[0] as number || 0
    const pageSize = pageSizeResult[0]?.values[0]?.[0] as number || 0

    // 获取所有表及其行数
    const tablesResult = this.db.exec(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `)

    const tables = tablesResult[0]?.values || []
    const tablesWithCount = tables.map((row) => {
      const tableName = row[0] as string
      const countResult = this.db!.exec(`SELECT COUNT(*) as count FROM ${tableName}`)
      const count = countResult[0]?.values[0]?.[0] as number || 0
      return {
        name: tableName,
        rowCount: count,
      }
    })

    return {
      size,
      pageCount,
      pageSize,
      tables: tablesWithCount,
    }
  }

  /**
   * 检查数据库健康状态
   */
  public checkIntegrity(): boolean {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    const result = this.db.exec('PRAGMA integrity_check')
    return result[0]?.values[0]?.[0] === 'ok'
  }

  /**
   * 手动触发保存
   */
  public saveToFile(): void {
    this.save()
  }
}

// 导出单例实例
let instance: DatabaseManager | null = null

export function getDatabaseManager(config?: DatabaseConfig): DatabaseManager {
  if (!instance) {
    instance = new DatabaseManager(config)
  }
  return instance
}

export function closeDatabaseManager(): void {
  if (instance) {
    instance.close()
    instance = null
  }
}
