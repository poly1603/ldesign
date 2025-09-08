/**
 * 查询构建器
 * 提供链式API构建SQL查询
 */

import type { DatabaseConnection, QueryResult } from '../types'
import { DatabaseError } from '../types'

/**
 * 查询构建器类
 */
export class QueryBuilder {
  private queryType: 'select' | 'insert' | 'update' | 'delete' | null = null
  private tableName: string = ''
  private selectFields: string[] = ['*']
  private whereConditions: WhereCondition[] = []
  private joinClauses: JoinClause[] = []
  private orderByFields: OrderByField[] = []
  private groupByFields: string[] = []
  private havingConditions: WhereCondition[] = []
  private limitValue: number | null = null
  private offsetValue: number | null = null
  private insertData: Record<string, any> | Record<string, any>[] = {}
  private updateData: Record<string, any> = {}
  private connection: DatabaseConnection | null = null

  constructor(connection?: DatabaseConnection) {
    this.connection = connection || null
  }

  /**
   * 设置表名
   * @param table 表名
   */
  table(table: string): QueryBuilder {
    this.tableName = table
    return this
  }

  /**
   * 设置查询字段
   * @param fields 字段列表
   */
  select(...fields: string[]): QueryBuilder {
    this.queryType = 'select'
    this.selectFields = fields.length > 0 ? fields : ['*']
    return this
  }

  /**
   * 添加WHERE条件
   * @param field 字段名
   * @param operator 操作符
   * @param value 值
   */
  where(field: string, operator: string, value: any): QueryBuilder
  where(field: string, value: any): QueryBuilder
  where(conditions: Record<string, any>): QueryBuilder
  where(
    field: string | Record<string, any>,
    operatorOrValue?: string | any,
    value?: any,
  ): QueryBuilder {
    if (typeof field === 'object') {
      // 对象形式的条件
      for (const [key, val] of Object.entries(field)) {
        this.whereConditions.push({
          field: key,
          operator: '=',
          value: val,
          logic: 'AND',
        })
      }
    }
    else if (arguments.length === 2) {
      // field, value 形式
      this.whereConditions.push({
        field,
        operator: '=',
        value: operatorOrValue,
        logic: 'AND',
      })
    }
    else {
      // field, operator, value 形式
      this.whereConditions.push({
        field,
        operator: operatorOrValue,
        value,
        logic: 'AND',
      })
    }
    return this
  }

  /**
   * 添加OR WHERE条件
   * @param field 字段名
   * @param operator 操作符
   * @param value 值
   */
  orWhere(field: string, operator: string, value: any): QueryBuilder
  orWhere(field: string, value: any): QueryBuilder
  orWhere(field: string, operatorOrValue?: string | any, value?: any): QueryBuilder {
    if (arguments.length === 2) {
      this.whereConditions.push({
        field,
        operator: '=',
        value: operatorOrValue,
        logic: 'OR',
      })
    }
    else {
      this.whereConditions.push({
        field,
        operator: operatorOrValue,
        value,
        logic: 'OR',
      })
    }
    return this
  }

  /**
   * WHERE IN 条件
   * @param field 字段名
   * @param values 值数组
   */
  whereIn(field: string, values: any[]): QueryBuilder {
    this.whereConditions.push({
      field,
      operator: 'IN',
      value: values,
      logic: 'AND',
    })
    return this
  }

  /**
   * WHERE NOT IN 条件
   * @param field 字段名
   * @param values 值数组
   */
  whereNotIn(field: string, values: any[]): QueryBuilder {
    this.whereConditions.push({
      field,
      operator: 'NOT IN',
      value: values,
      logic: 'AND',
    })
    return this
  }

  /**
   * WHERE NULL 条件
   * @param field 字段名
   */
  whereNull(field: string): QueryBuilder {
    this.whereConditions.push({
      field,
      operator: 'IS NULL',
      value: null,
      logic: 'AND',
    })
    return this
  }

  /**
   * WHERE NOT NULL 条件
   * @param field 字段名
   */
  whereNotNull(field: string): QueryBuilder {
    this.whereConditions.push({
      field,
      operator: 'IS NOT NULL',
      value: null,
      logic: 'AND',
    })
    return this
  }

  /**
   * WHERE LIKE 条件
   * @param field 字段名
   * @param pattern 模式
   */
  whereLike(field: string, pattern: string): QueryBuilder {
    this.whereConditions.push({
      field,
      operator: 'LIKE',
      value: pattern,
      logic: 'AND',
    })
    return this
  }

  /**
   * WHERE BETWEEN 条件
   * @param field 字段名
   * @param min 最小值
   * @param max 最大值
   */
  whereBetween(field: string, min: any, max: any): QueryBuilder {
    this.whereConditions.push({
      field,
      operator: 'BETWEEN',
      value: [min, max],
      logic: 'AND',
    })
    return this
  }

  /**
   * JOIN 连接
   * @param table 表名
   * @param first 第一个字段
   * @param operator 操作符
   * @param second 第二个字段
   */
  join(table: string, first: string, operator: string, second: string): QueryBuilder
  join(table: string, first: string, second: string): QueryBuilder
  join(table: string, first: string, operatorOrSecond: string, second?: string): QueryBuilder {
    const joinType = 'INNER'
    if (arguments.length === 3) {
      this.joinClauses.push({
        type: joinType,
        table,
        first,
        operator: '=',
        second: operatorOrSecond,
      })
    }
    else {
      this.joinClauses.push({
        type: joinType,
        table,
        first,
        operator: operatorOrSecond,
        second: second!,
      })
    }
    return this
  }

  /**
   * LEFT JOIN 连接
   */
  leftJoin(table: string, first: string, operator: string, second: string): QueryBuilder
  leftJoin(table: string, first: string, second: string): QueryBuilder
  leftJoin(table: string, first: string, operatorOrSecond: string, second?: string): QueryBuilder {
    const joinType = 'LEFT'
    if (arguments.length === 3) {
      this.joinClauses.push({
        type: joinType,
        table,
        first,
        operator: '=',
        second: operatorOrSecond,
      })
    }
    else {
      this.joinClauses.push({
        type: joinType,
        table,
        first,
        operator: operatorOrSecond,
        second: second!,
      })
    }
    return this
  }

  /**
   * RIGHT JOIN 连接
   */
  rightJoin(table: string, first: string, operator: string, second: string): QueryBuilder
  rightJoin(table: string, first: string, second: string): QueryBuilder
  rightJoin(table: string, first: string, operatorOrSecond: string, second?: string): QueryBuilder {
    const joinType = 'RIGHT'
    if (arguments.length === 3) {
      this.joinClauses.push({
        type: joinType,
        table,
        first,
        operator: '=',
        second: operatorOrSecond,
      })
    }
    else {
      this.joinClauses.push({
        type: joinType,
        table,
        first,
        operator: operatorOrSecond,
        second: second!,
      })
    }
    return this
  }

  /**
   * ORDER BY 排序
   * @param field 字段名
   * @param direction 排序方向
   */
  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
    this.orderByFields.push({ field, direction })
    return this
  }

  /**
   * GROUP BY 分组
   * @param fields 字段列表
   */
  groupBy(...fields: string[]): QueryBuilder {
    this.groupByFields.push(...fields)
    return this
  }

  /**
   * HAVING 条件
   * @param field 字段名
   * @param operator 操作符
   * @param value 值
   */
  having(field: string, operator: string, value: any): QueryBuilder {
    this.havingConditions.push({
      field,
      operator,
      value,
      logic: 'AND',
    })
    return this
  }

  /**
   * LIMIT 限制
   * @param count 数量
   */
  limit(count: number): QueryBuilder {
    this.limitValue = count
    return this
  }

  /**
   * OFFSET 偏移
   * @param count 偏移量
   */
  offset(count: number): QueryBuilder {
    this.offsetValue = count
    return this
  }

  /**
   * 分页
   * @param page 页码
   * @param perPage 每页数量
   */
  paginate(page: number, perPage: number): QueryBuilder {
    this.limitValue = perPage
    this.offsetValue = (page - 1) * perPage
    return this
  }

  /**
   * INSERT 插入
   * @param data 数据
   */
  insert(data: Record<string, any> | Record<string, any>[]): QueryBuilder {
    this.queryType = 'insert'
    this.insertData = data
    return this
  }

  /**
   * UPDATE 更新
   * @param data 数据
   */
  update(data: Record<string, any>): QueryBuilder {
    this.queryType = 'update'
    this.updateData = data
    return this
  }

  /**
   * DELETE 删除
   */
  delete(): QueryBuilder {
    this.queryType = 'delete'
    return this
  }

  /**
   * 构建SQL语句
   */
  toSQL(): { sql: string, params: any[] } {
    const params: any[] = []
    let sql = ''

    switch (this.queryType) {
      case 'select':
        sql = this.buildSelectSQL(params)
        break
      case 'insert':
        sql = this.buildInsertSQL(params)
        break
      case 'update':
        sql = this.buildUpdateSQL(params)
        break
      case 'delete':
        sql = this.buildDeleteSQL(params)
        break
      default:
        throw new DatabaseError('No query type specified')
    }

    return { sql, params }
  }

  /**
   * 构建SELECT SQL
   */
  private buildSelectSQL(params: any[]): string {
    let sql = `SELECT ${this.selectFields.join(', ')} FROM ${this.tableName}`

    // JOIN
    for (const join of this.joinClauses) {
      sql += ` ${join.type} JOIN ${join.table} ON ${join.first} ${join.operator} ${join.second}`
    }

    // WHERE
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.buildWhereClause(this.whereConditions, params)}`
    }

    // GROUP BY
    if (this.groupByFields.length > 0) {
      sql += ` GROUP BY ${this.groupByFields.join(', ')}`
    }

    // HAVING
    if (this.havingConditions.length > 0) {
      sql += ` HAVING ${this.buildWhereClause(this.havingConditions, params)}`
    }

    // ORDER BY
    if (this.orderByFields.length > 0) {
      const orderClauses = this.orderByFields.map(field => `${field.field} ${field.direction}`)
      sql += ` ORDER BY ${orderClauses.join(', ')}`
    }

    // LIMIT
    if (this.limitValue !== null) {
      sql += ` LIMIT ${this.limitValue}`
    }

    // OFFSET
    if (this.offsetValue !== null) {
      sql += ` OFFSET ${this.offsetValue}`
    }

    return sql
  }

  /**
   * 构建INSERT SQL
   */
  private buildInsertSQL(params: any[]): string {
    if (Array.isArray(this.insertData)) {
      // 批量插入
      if (this.insertData.length === 0) {
        throw new DatabaseError('Insert data cannot be empty')
      }

      const fields = Object.keys(this.insertData[0])
      const placeholders = fields.map(() => '?').join(', ')
      const valuesClauses = this.insertData.map(() => `(${placeholders})`).join(', ')

      for (const row of this.insertData) {
        for (const field of fields) {
          params.push(row[field])
        }
      }

      return `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES ${valuesClauses}`
    }
    else {
      // 单行插入
      const fields = Object.keys(this.insertData)
      const placeholders = fields.map(() => '?').join(', ')

      for (const field of fields) {
        params.push(this.insertData[field])
      }

      return `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders})`
    }
  }

  /**
   * 构建UPDATE SQL
   */
  private buildUpdateSQL(params: any[]): string {
    const fields = Object.keys(this.updateData)
    const setClauses = fields.map(field => `${field} = ?`).join(', ')

    for (const field of fields) {
      params.push(this.updateData[field])
    }

    let sql = `UPDATE ${this.tableName} SET ${setClauses}`

    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.buildWhereClause(this.whereConditions, params)}`
    }

    return sql
  }

  /**
   * 构建DELETE SQL
   */
  private buildDeleteSQL(params: any[]): string {
    let sql = `DELETE FROM ${this.tableName}`

    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.buildWhereClause(this.whereConditions, params)}`
    }

    return sql
  }

  /**
   * 构建WHERE子句
   */
  private buildWhereClause(conditions: WhereCondition[], params: any[]): string {
    const clauses: string[] = []

    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i]
      if (!condition)
        continue

      let clause = ''

      if (i > 0) {
        clause += ` ${condition.logic} `
      }

      if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
        const placeholders = condition.value.map(() => '?').join(', ')
        clause += `${condition.field} ${condition.operator} (${placeholders})`
        params.push(...condition.value)
      }
      else if (condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL') {
        clause += `${condition.field} ${condition.operator}`
      }
      else if (condition.operator === 'BETWEEN') {
        clause += `${condition.field} BETWEEN ? AND ?`
        params.push(condition.value[0], condition.value[1])
      }
      else {
        clause += `${condition.field} ${condition.operator} ?`
        params.push(condition.value)
      }

      clauses.push(clause)
    }

    return clauses.join('')
  }

  /**
   * 执行查询
   */
  async execute(): Promise<QueryResult> {
    if (!this.connection) {
      throw new DatabaseError('No database connection available')
    }

    const { sql, params } = this.toSQL()
    return this.connection.query(sql, params)
  }

  /**
   * 获取第一行结果
   */
  async first(): Promise<any> {
    this.limit(1)
    const result = await this.execute()
    return result.rows[0] || null
  }

  /**
   * 获取所有结果
   */
  async get(): Promise<any[]> {
    const result = await this.execute()
    return result.rows
  }

  /**
   * 获取计数
   */
  async count(field = '*'): Promise<number> {
    this.select(`COUNT(${field}) as count`)
    const result = await this.first()
    return result ? Number.parseInt(result.count) : 0
  }

  /**
   * 检查是否存在
   */
  async exists(): Promise<boolean> {
    const count = await this.count()
    return count > 0
  }

  /**
   * 创建查询构建器实例
   * @param connection 数据库连接
   */
  static create(connection?: DatabaseConnection): QueryBuilder {
    return new QueryBuilder(connection)
  }

  /**
   * 重置查询构建器
   */
  reset(): QueryBuilder {
    this.queryType = null
    this.tableName = ''
    this.selectFields = ['*']
    this.whereConditions = []
    this.joinClauses = []
    this.orderByFields = []
    this.groupByFields = []
    this.havingConditions = []
    this.limitValue = null
    this.offsetValue = null
    this.insertData = {}
    this.updateData = {}
    return this
  }

  /**
   * 克隆查询构建器
   */
  clone(): QueryBuilder {
    const builder = new QueryBuilder(this.connection || undefined)
    builder.queryType = this.queryType
    builder.tableName = this.tableName
    builder.selectFields = [...this.selectFields]
    builder.whereConditions = [...this.whereConditions]
    builder.joinClauses = [...this.joinClauses]
    builder.orderByFields = [...this.orderByFields]
    builder.groupByFields = [...this.groupByFields]
    builder.havingConditions = [...this.havingConditions]
    builder.limitValue = this.limitValue
    builder.offsetValue = this.offsetValue
    builder.insertData = { ...this.insertData }
    builder.updateData = { ...this.updateData }
    return builder
  }
}

// 类型定义
interface WhereCondition {
  field: string
  operator: string
  value: any
  logic: 'AND' | 'OR'
}

interface JoinClause {
  type: 'INNER' | 'LEFT' | 'RIGHT'
  table: string
  first: string
  operator: string
  second: string
}

interface OrderByField {
  field: string
  direction: 'ASC' | 'DESC'
}
