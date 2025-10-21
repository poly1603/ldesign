/**
 * 数据库迁移管理器
 * 提供数据库迁移的创建、执行和回滚功能
 */

import type { DatabaseConnection } from '../types'
import { EventEmitter } from 'node:events'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { FileSystem } from '../filesystem'
import { DatabaseError } from '../types'
import { SchemaBuilder } from './schema-builder'

/**
 * 迁移管理器类
 */
export class MigrationManager extends EventEmitter {
  private connection: DatabaseConnection
  private migrationsPath: string
  private migrationsTable: string

  constructor(connection: DatabaseConnection, options: MigrationOptions = {}) {
    super()
    this.connection = connection
    this.migrationsPath = options.migrationsPath || './migrations'
    this.migrationsTable = options.migrationsTable || 'migrations'
  }

  /**
   * 初始化迁移表
   */
  async initialize(): Promise<void> {
    const schema = new SchemaBuilder(this.connection)

    const hasTable = await schema.hasTable(this.migrationsTable)
    if (!hasTable) {
      await schema.createTable(this.migrationsTable, (table) => {
        table.id()
        table.string('migration', 255).notNullable()
        table.integer('batch').notNullable()
        table.timestamps()
      })
    }
  }

  /**
   * 创建迁移文件
   * @param name 迁移名称
   * @param template 模板类型
   */
  async create(name: string, template: 'create' | 'alter' = 'create'): Promise<string> {
    await FileSystem.ensureDir(this.migrationsPath)

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14)
    const fileName = `${timestamp}_${name}.ts`
    const filePath = join(this.migrationsPath, fileName)

    const content = this.generateMigrationTemplate(name, template)
    await fs.writeFile(filePath, content)

    this.emit('migrationCreated', { name, fileName, path: filePath })
    return filePath
  }

  /**
   * 生成迁移模板
   */
  private generateMigrationTemplate(name: string, template: string): string {
    const className = this.toPascalCase(name)

    if (template === 'create') {
      return `import { SchemaBuilder, TableBuilder } from '@ldesign/kit'

export class ${className} {
  /**
   * 执行迁移
   */
  async up(schema: SchemaBuilder): Promise<void> {
    await schema.createTable('${this.toSnakeCase(name)}', (table: TableBuilder) => {
      table.id()
      table.timestamps()
    })
  }

  /**
   * 回滚迁移
   */
  async down(schema: SchemaBuilder): Promise<void> {
    await schema.dropTable('${this.toSnakeCase(name)}')
  }
}
`
    }
    else {
      return `import { SchemaBuilder, AlterTableBuilder } from '@ldesign/kit'

export class ${className} {
  /**
   * 执行迁移
   */
  async up(schema: SchemaBuilder): Promise<void> {
    await schema.alterTable('table_name', (table: AlterTableBuilder) => {
      // 添加你的修改
    })
  }

  /**
   * 回滚迁移
   */
  async down(schema: SchemaBuilder): Promise<void> {
    await schema.alterTable('table_name', (table: AlterTableBuilder) => {
      // 添加回滚操作
    })
  }
}
`
    }
  }

  /**
   * 获取待执行的迁移
   */
  async getPendingMigrations(): Promise<string[]> {
    const allMigrations = await this.getAllMigrations()
    const executedMigrations = await this.getExecutedMigrations()

    return allMigrations.filter(migration => !executedMigrations.includes(migration))
  }

  /**
   * 获取所有迁移文件
   */
  private async getAllMigrations(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.migrationsPath)
      return files.filter((file: string) => file.endsWith('.ts') || file.endsWith('.js')).sort()
    }
    catch {
      return []
    }
  }

  /**
   * 获取已执行的迁移
   */
  private async getExecutedMigrations(): Promise<string[]> {
    try {
      const result = await this.connection.query(
        `SELECT migration FROM ${this.migrationsTable} ORDER BY batch, id`,
      )
      return result.rows.map(row => row.migration)
    }
    catch {
      return []
    }
  }

  /**
   * 执行迁移
   * @param steps 执行步数，默认执行所有待执行的迁移
   */
  async migrate(steps?: number): Promise<MigrationResult[]> {
    await this.initialize()

    const pendingMigrations = await this.getPendingMigrations()
    const migrationsToRun = steps ? pendingMigrations.slice(0, steps) : pendingMigrations

    if (migrationsToRun.length === 0) {
      this.emit('noMigrations')
      return []
    }

    const batch = await this.getNextBatchNumber()
    const results: MigrationResult[] = []
    const schema = new SchemaBuilder(this.connection)

    for (const migrationFile of migrationsToRun) {
      const startTime = Date.now()

      try {
        this.emit('migrationStart', { migration: migrationFile })

        const migration = await this.loadMigration(migrationFile)
        await migration.up(schema)

        await this.recordMigration(migrationFile, batch)

        const duration = Date.now() - startTime
        const result: MigrationResult = {
          migration: migrationFile,
          status: 'success',
          duration,
        }

        results.push(result)
        this.emit('migrationComplete', result)
      }
      catch (error) {
        const duration = Date.now() - startTime
        const result: MigrationResult = {
          migration: migrationFile,
          status: 'failed',
          duration,
          error: (error as Error).message,
        }

        results.push(result)
        this.emit('migrationFailed', result)

        // 停止执行后续迁移
        break
      }
    }

    return results
  }

  /**
   * 回滚迁移
   * @param steps 回滚步数，默认回滚最后一个批次
   */
  async rollback(steps = 1): Promise<MigrationResult[]> {
    const migrationsToRollback = await this.getMigrationsToRollback(steps)

    if (migrationsToRollback.length === 0) {
      this.emit('noRollbacks')
      return []
    }

    const results: MigrationResult[] = []
    const schema = new SchemaBuilder(this.connection)

    // 按相反顺序回滚
    for (const migrationFile of migrationsToRollback.reverse()) {
      const startTime = Date.now()

      try {
        this.emit('rollbackStart', { migration: migrationFile })

        const migration = await this.loadMigration(migrationFile)
        await migration.down(schema)

        await this.removeMigrationRecord(migrationFile)

        const duration = Date.now() - startTime
        const result: MigrationResult = {
          migration: migrationFile,
          status: 'success',
          duration,
        }

        results.push(result)
        this.emit('rollbackComplete', result)
      }
      catch (error) {
        const duration = Date.now() - startTime
        const result: MigrationResult = {
          migration: migrationFile,
          status: 'failed',
          duration,
          error: (error as Error).message,
        }

        results.push(result)
        this.emit('rollbackFailed', result)

        // 停止执行后续回滚
        break
      }
    }

    return results
  }

  /**
   * 获取需要回滚的迁移
   */
  private async getMigrationsToRollback(steps: number): Promise<string[]> {
    if (steps === 0)
      return []

    try {
      const result = await this.connection.query(
        `SELECT migration FROM ${this.migrationsTable} ORDER BY batch DESC, id DESC LIMIT ?`,
        [steps],
      )
      return result.rows.map(row => row.migration)
    }
    catch {
      return []
    }
  }

  /**
   * 重置所有迁移
   */
  async reset(): Promise<MigrationResult[]> {
    const executedMigrations = await this.getExecutedMigrations()
    return this.rollback(executedMigrations.length)
  }

  /**
   * 刷新迁移（重置后重新执行）
   */
  async refresh(): Promise<{ rollback: MigrationResult[], migrate: MigrationResult[] }> {
    const rollbackResults = await this.reset()
    const migrateResults = await this.migrate()

    return {
      rollback: rollbackResults,
      migrate: migrateResults,
    }
  }

  /**
   * 获取迁移状态
   */
  async status(): Promise<MigrationStatus[]> {
    const allMigrations = await this.getAllMigrations()
    const executedMigrations = await this.getExecutedMigrations()

    return allMigrations.map(migration => ({
      migration,
      status: executedMigrations.includes(migration) ? 'executed' : 'pending',
    }))
  }

  /**
   * 加载迁移文件
   */
  private async loadMigration(fileName: string): Promise<Migration> {
    const filePath = join(this.migrationsPath, fileName)

    try {
      // 动态导入迁移文件
      const module = await import(filePath)
      const MigrationClass = module.default || Object.values(module)[0]
      return new MigrationClass()
    }
    catch (error) {
      throw new DatabaseError(`Failed to load migration: ${fileName}`, error as Error)
    }
  }

  /**
   * 记录迁移执行
   */
  private async recordMigration(migration: string, batch: number): Promise<void> {
    await this.connection.query(
      `INSERT INTO ${this.migrationsTable} (migration, batch, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`,
      [migration, batch],
    )
  }

  /**
   * 删除迁移记录
   */
  private async removeMigrationRecord(migration: string): Promise<void> {
    await this.connection.query(`DELETE FROM ${this.migrationsTable} WHERE migration = ?`, [
      migration,
    ])
  }

  /**
   * 获取下一个批次号
   */
  private async getNextBatchNumber(): Promise<number> {
    try {
      const result = await this.connection.query(
        `SELECT MAX(batch) as max_batch FROM ${this.migrationsTable}`,
      )
      const maxBatch = result.rows[0]?.max_batch || 0
      return maxBatch + 1
    }
    catch {
      return 1
    }
  }

  /**
   * 转换为PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
  }

  /**
   * 转换为snake_case
   */
  private toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
      .replace(/[-\s]+/g, '_')
  }

  /**
   * 创建迁移管理器实例
   */
  static create(connection: DatabaseConnection, options?: MigrationOptions): MigrationManager {
    return new MigrationManager(connection, options)
  }
}

// 类型定义
interface MigrationOptions {
  migrationsPath?: string
  migrationsTable?: string
}

interface Migration {
  up: (schema: SchemaBuilder) => Promise<void>
  down: (schema: SchemaBuilder) => Promise<void>
}

interface MigrationResult {
  migration: string
  status: 'success' | 'failed'
  duration: number
  error?: string
}

interface MigrationStatus {
  migration: string
  status: 'executed' | 'pending'
}
