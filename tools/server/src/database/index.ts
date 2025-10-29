import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { logger } from '../utils/logger'

const DB_DIR = join(process.cwd(), '.ldesign')
const DB_PATH = join(DB_DIR, 'server.db')

class DatabaseManager {
  private db: Database.Database | null = null

  constructor() {
    // 确保数据库目录存在
    if (!existsSync(DB_DIR)) {
      mkdirSync(DB_DIR, { recursive: true })
    }
  }

  public initialize() {
    try {
      this.db = new Database(DB_PATH)
      this.db.pragma('journal_mode = WAL')
      this.createTables()
      logger.info('数据库初始化成功', { path: DB_PATH })
    } catch (error) {
      logger.error('数据库初始化失败', error)
      throw error
    }
  }

  private createTables() {
    if (!this.db) return

    // 项目表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        framework TEXT,
        packageManager TEXT,
        description TEXT,
        config TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        lastOpenedAt INTEGER
      )
    `)

    // 工具配置表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tool_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        toolName TEXT NOT NULL UNIQUE,
        config TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `)

    // 构建记录表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS builds (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        status TEXT NOT NULL,
        startTime INTEGER NOT NULL,
        endTime INTEGER,
        duration INTEGER,
        output TEXT,
        errors TEXT,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
      )
    `)

    // 部署记录表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS deployments (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        environment TEXT NOT NULL,
        status TEXT NOT NULL,
        version TEXT,
        startTime INTEGER NOT NULL,
        endTime INTEGER,
        duration INTEGER,
        logs TEXT,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
      )
    `)

    // 测试记录表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS test_runs (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        startTime INTEGER NOT NULL,
        endTime INTEGER,
        duration INTEGER,
        total INTEGER,
        passed INTEGER,
        failed INTEGER,
        skipped INTEGER,
        coverage REAL,
        results TEXT,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
      )
    `)

    // 日志表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        meta TEXT,
        timestamp INTEGER NOT NULL
      )
    `)

    // 创建索引
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_builds_projectId ON builds(projectId);
      CREATE INDEX IF NOT EXISTS idx_deployments_projectId ON deployments(projectId);
      CREATE INDEX IF NOT EXISTS idx_test_runs_projectId ON test_runs(projectId);
      CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
    `)

    logger.info('数据库表创建成功')
  }

  public getDb(): Database.Database {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }
    return this.db
  }

  public close() {
    if (this.db) {
      this.db.close()
      this.db = null
      logger.info('数据库连接已关闭')
    }
  }
}

export const db = new DatabaseManager()
