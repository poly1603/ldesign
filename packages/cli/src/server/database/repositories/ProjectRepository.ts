/**
 * 项目数据访问层
 */

import { DatabaseManager } from '../DatabaseManager'

export interface Project {
  id: string
  name: string
  path: string
  type: string
  framework?: string
  description?: string
  createdAt: number
  updatedAt: number
  lastOpenedAt?: number
  metadata?: any
}

export class ProjectRepository {
  private dbManager: DatabaseManager

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager
  }

  /**
   * 创建项目
   */
  create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const db = this.dbManager.getDatabase()
    const now = Date.now()
    const id = uuidv4()

    const stmt = db.prepare(`
      INSERT INTO projects (
        id, name, path, type, framework, description,
        created_at, updated_at, last_opened_at, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      project.name,
      project.path,
      project.type,
      project.framework || null,
      project.description || null,
      now,
      now,
      project.lastOpenedAt || null,
      JSON.stringify(project.metadata || {})
    )

    return this.findById(id)!
  }

  /**
   * 根据 ID 查找项目
   */
  findById(id: string): Project | null {
    const db = this.dbManager.getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM projects WHERE id = ?
    `)

    const row = stmt.get(id) as any
    return row ? this.mapToProject(row) : null
  }

  /**
   * 根据路径查找项目
   */
  findByPath(path: string): Project | null {
    const db = this.dbManager.getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM projects WHERE path = ?
    `)

    const row = stmt.get(path) as any
    return row ? this.mapToProject(row) : null
  }

  /**
   * 查找所有项目
   */
  findAll(options?: {
    orderBy?: 'updated_at' | 'created_at' | 'last_opened_at' | 'name'
    order?: 'ASC' | 'DESC'
    limit?: number
    offset?: number
  }): Project[] {
    const db = this.dbManager.getDatabase()
    
    const orderBy = options?.orderBy || 'updated_at'
    const order = options?.order || 'DESC'
    let sql = `SELECT * FROM projects ORDER BY ${orderBy} ${order}`
    
    if (options?.limit) {
      sql += ` LIMIT ${options.limit}`
    }
    if (options?.offset) {
      sql += ` OFFSET ${options.offset}`
    }

    const stmt = db.prepare(sql)
    const rows = stmt.all() as any[]
    
    return rows.map(row => this.mapToProject(row))
  }

  /**
   * 按类型查找项目
   */
  findByType(type: string): Project[] {
    const db = this.dbManager.getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM projects WHERE type = ? ORDER BY updated_at DESC
    `)

    const rows = stmt.all(type) as any[]
    return rows.map(row => this.mapToProject(row))
  }

  /**
   * 搜索项目
   */
  search(query: string): Project[] {
    const db = this.dbManager.getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM projects 
      WHERE name LIKE ? OR path LIKE ? OR description LIKE ?
      ORDER BY updated_at DESC
    `)

    const searchPattern = `%${query}%`
    const rows = stmt.all(searchPattern, searchPattern, searchPattern) as any[]
    return rows.map(row => this.mapToProject(row))
  }

  /**
   * 更新项目
   */
  update(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Project | null {
    const db = this.dbManager.getDatabase()
    const now = Date.now()

    const fields: string[] = []
    const values: any[] = []

    if (updates.name !== undefined) {
      fields.push('name = ?')
      values.push(updates.name)
    }
    if (updates.path !== undefined) {
      fields.push('path = ?')
      values.push(updates.path)
    }
    if (updates.type !== undefined) {
      fields.push('type = ?')
      values.push(updates.type)
    }
    if (updates.framework !== undefined) {
      fields.push('framework = ?')
      values.push(updates.framework)
    }
    if (updates.description !== undefined) {
      fields.push('description = ?')
      values.push(updates.description)
    }
    if (updates.lastOpenedAt !== undefined) {
      fields.push('last_opened_at = ?')
      values.push(updates.lastOpenedAt)
    }
    if (updates.metadata !== undefined) {
      fields.push('metadata = ?')
      values.push(JSON.stringify(updates.metadata))
    }

    fields.push('updated_at = ?')
    values.push(now)
    values.push(id)

    if (fields.length === 0) {
      return this.findById(id)
    }

    const stmt = db.prepare(`
      UPDATE projects SET ${fields.join(', ')} WHERE id = ?
    `)

    stmt.run(...values)
    return this.findById(id)
  }

  /**
   * 更新最后打开时间
   */
  updateLastOpened(id: string): void {
    const db = this.dbManager.getDatabase()
    const stmt = db.prepare(`
      UPDATE projects SET last_opened_at = ?, updated_at = ? WHERE id = ?
    `)
    const now = Date.now()
    stmt.run(now, now, id)
  }

  /**
   * 删除项目
   */
  delete(id: string): boolean {
    const db = this.dbManager.getDatabase()
    const stmt = db.prepare(`
      DELETE FROM projects WHERE id = ?
    `)
    const result = stmt.run(id)
    return result.changes > 0
  }

  /**
   * 统计项目数量
   */
  count(): number {
    const db = this.dbManager.getDatabase()
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM projects
    `)
    const result = stmt.get() as { count: number }
    return result.count
  }

  /**
   * 按类型统计项目数量
   */
  countByType(): Record<string, number> {
    const db = this.dbManager.getDatabase()
    const stmt = db.prepare(`
      SELECT type, COUNT(*) as count FROM projects GROUP BY type
    `)
    const rows = stmt.all() as Array<{ type: string; count: number }>
    
    const result: Record<string, number> = {}
    for (const row of rows) {
      result[row.type] = row.count
    }
    return result
  }

  /**
   * 映射数据库行到项目对象
   */
  private mapToProject(row: any): Project {
    return {
      id: row.id,
      name: row.name,
      path: row.path,
      type: row.type,
      framework: row.framework,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastOpenedAt: row.last_opened_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
    }
  }
}
