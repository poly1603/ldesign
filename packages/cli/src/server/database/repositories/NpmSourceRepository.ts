/**
 * NPM 源数据访问层
 */

import { DatabaseManager } from '../DatabaseManager'

export type NpmSourceType = 'public' | 'private'

export interface NpmSource {
  id: string
  name: string
  url: string
  type: NpmSourceType
  description?: string
  isLoggedIn: boolean
  loginInfo?: {
    username?: string
    email?: string
    token?: string
    lastLoginAt?: string
  }
  createdAt: number
  updatedAt: number
}

export class NpmSourceRepository {
  private dbManager: DatabaseManager

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager
  }

  /**
   * 创建 NPM 源
   */
  create(source: Omit<NpmSource, 'id' | 'createdAt' | 'updatedAt' | 'isLoggedIn'>): NpmSource {
    const db = this.dbManager.getDatabase()
    const now = Date.now()
    const id = uuidv4()

    const stmt = db.prepare(`
      INSERT INTO npm_sources (
        id, name, url, type, description, is_logged_in, login_info,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      source.name,
      source.url,
      source.type,
      source.description || null,
      0,
      null,
      now,
      now
    )

    return this.findById(id)!
  }

  /**
   * 根据 ID 查找源
   */
  findById(id: string): NpmSource | null {
    const db = this.dbManager.getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM npm_sources WHERE id = ?
    `)

    const row = stmt.get(id) as any
    return row ? this.mapToNpmSource(row) : null
  }

  /**
   * 查找所有源
   */
  findAll(): NpmSource[] {
    const db = this.dbManager.getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM npm_sources ORDER BY created_at DESC
    `)

    const rows = stmt.all() as any[]
    return rows.map(row => this.mapToNpmSource(row))
  }

  /**
   * 根据URL查找源
   */
  findByUrl(url: string): NpmSource | null {
    const db = this.dbManager.getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM npm_sources WHERE url = ?
    `)

    const row = stmt.get(url) as any
    return row ? this.mapToNpmSource(row) : null
  }

  /**
   * 更新源
   */
  update(id: string, updates: Partial<Omit<NpmSource, 'id' | 'createdAt'>>): NpmSource | null {
    const db = this.dbManager.getDatabase()
    const now = Date.now()

    const fields: string[] = []
    const values: any[] = []

    if (updates.name !== undefined) {
      fields.push('name = ?')
      values.push(updates.name)
    }
    if (updates.url !== undefined) {
      fields.push('url = ?')
      values.push(updates.url)
    }
    if (updates.type !== undefined) {
      fields.push('type = ?')
      values.push(updates.type)
    }
    if (updates.description !== undefined) {
      fields.push('description = ?')
      values.push(updates.description)
    }
    if (updates.isLoggedIn !== undefined) {
      fields.push('is_logged_in = ?')
      values.push(updates.isLoggedIn ? 1 : 0)
    }
    if (updates.loginInfo !== undefined) {
      fields.push('login_info = ?')
      values.push(updates.loginInfo ? JSON.stringify(updates.loginInfo) : null)
    }

    fields.push('updated_at = ?')
    values.push(now)
    values.push(id)

    if (fields.length === 0) {
      return this.findById(id)
    }

    const stmt = db.prepare(`
      UPDATE npm_sources SET ${fields.join(', ')} WHERE id = ?
    `)

    stmt.run(...values)
    return this.findById(id)
  }

  /**
   * 更新登录状态
   */
  updateLoginStatus(id: string, isLoggedIn: boolean, loginInfo?: NpmSource['loginInfo']): NpmSource | null {
    const db = this.dbManager.getDatabase()
    const now = Date.now()

    const stmt = db.prepare(`
      UPDATE npm_sources 
      SET is_logged_in = ?, login_info = ?, updated_at = ?
      WHERE id = ?
    `)

    stmt.run(
      isLoggedIn ? 1 : 0,
      loginInfo ? JSON.stringify(loginInfo) : null,
      now,
      id
    )

    return this.findById(id)
  }

  /**
   * 删除源
   */
  delete(id: string): boolean {
    const db = this.dbManager.getDatabase()
    const stmt = db.prepare(`
      DELETE FROM npm_sources WHERE id = ?
    `)
    const result = stmt.run(id)
    return result.changes > 0
  }

  /**
   * 统计源数量
   */
  count(): number {
    const db = this.dbManager.getDatabase()
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM npm_sources
    `)
    const result = stmt.get() as { count: number }
    return result.count
  }

  /**
   * 初始化默认源（如果数据库为空）
   */
  initializeDefaultSources(): void {
    const count = this.count()
    if (count === 0) {
      // 添加默认的 NPM 源
      this.create({
        name: 'npm 官方源',
        url: 'https://registry.npmjs.org/',
        type: 'public',
        description: 'NPM 官方默认源',
      })

      this.create({
        name: '淘宝镜像',
        url: 'https://registry.npmmirror.com/',
        type: 'public',
        description: '淘宝 NPM 镜像源',
      })

      
    }
  }

  /**
   * 映射数据库行到 NpmSource 对象
   */
  private mapToNpmSource(row: any): NpmSource {
    return {
      id: row.id,
      name: row.name,
      url: row.url,
      type: row.type as NpmSourceType,
      description: row.description,
      isLoggedIn: row.is_logged_in === 1,
      loginInfo: row.login_info ? JSON.parse(row.login_info) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}
