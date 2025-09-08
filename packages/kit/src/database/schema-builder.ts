/**
 * 数据库模式构建器
 * 提供数据库表结构定义和管理功能
 */

import type { DatabaseConnection } from '../types'

/**
 * 数据库模式构建器类
 */
export class SchemaBuilder {
  private connection: DatabaseConnection

  constructor(connection: DatabaseConnection) {
    this.connection = connection
  }

  /**
   * 创建表
   * @param tableName 表名
   * @param callback 表定义回调
   */
  async createTable(tableName: string, callback: (table: TableBuilder) => void): Promise<void> {
    const tableBuilder = new TableBuilder()
    callback(tableBuilder)

    const sql = this.buildCreateTableSQL(tableName, tableBuilder)
    await this.connection.query(sql)
  }

  /**
   * 修改表
   * @param tableName 表名
   * @param callback 表修改回调
   */
  async alterTable(tableName: string, callback: (table: AlterTableBuilder) => void): Promise<void> {
    const alterBuilder = new AlterTableBuilder()
    callback(alterBuilder)

    const sqls = this.buildAlterTableSQL(tableName, alterBuilder)
    for (const sql of sqls) {
      await this.connection.query(sql)
    }
  }

  /**
   * 删除表
   * @param tableName 表名
   */
  async dropTable(tableName: string): Promise<void> {
    const sql = `DROP TABLE IF EXISTS ${tableName}`
    await this.connection.query(sql)
  }

  /**
   * 检查表是否存在
   * @param tableName 表名
   */
  async hasTable(tableName: string): Promise<boolean> {
    // 这里是简化实现，实际应该根据数据库类型使用不同的查询
    try {
      await this.connection.query(`SELECT 1 FROM ${tableName} LIMIT 1`)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 获取表信息
   * @param tableName 表名
   */
  async getTableInfo(tableName: string): Promise<TableInfo> {
    // 简化实现
    return {
      name: tableName,
      columns: [],
      indexes: [],
      foreignKeys: [],
    }
  }

  /**
   * 构建创建表SQL
   */
  private buildCreateTableSQL(tableName: string, tableBuilder: TableBuilder): string {
    const columns = tableBuilder.getColumns()
    const foreignKeys = tableBuilder.getForeignKeys()

    let sql = `CREATE TABLE ${tableName} (\n`

    // 列定义
    const columnDefs = columns.map(col => this.buildColumnDefinition(col))
    sql += columnDefs.join(',\n')

    // 主键
    const primaryKeys = columns.filter(col => col.primary).map(col => col.name)
    if (primaryKeys.length > 0) {
      sql += `,\n  PRIMARY KEY (${primaryKeys.join(', ')})`
    }

    // 外键
    for (const fk of foreignKeys) {
      sql += `,\n  FOREIGN KEY (${fk.column}) REFERENCES ${fk.references.table}(${fk.references.column})`
      if (fk.onDelete)
        sql += ` ON DELETE ${fk.onDelete}`
      if (fk.onUpdate)
        sql += ` ON UPDATE ${fk.onUpdate}`
    }

    sql += '\n)'

    return sql
  }

  /**
   * 构建修改表SQL
   */
  private buildAlterTableSQL(tableName: string, alterBuilder: AlterTableBuilder): string[] {
    const operations = alterBuilder.getOperations()
    const sqls: string[] = []

    for (const op of operations) {
      switch (op.type) {
        case 'addColumn':
          sqls.push(`ALTER TABLE ${tableName} ADD COLUMN ${this.buildColumnDefinition(op.column!)}`)
          break
        case 'dropColumn':
          sqls.push(`ALTER TABLE ${tableName} DROP COLUMN ${op.columnName}`)
          break
        case 'modifyColumn':
          sqls.push(
            `ALTER TABLE ${tableName} MODIFY COLUMN ${this.buildColumnDefinition(op.column!)}`,
          )
          break
        case 'renameColumn':
          sqls.push(`ALTER TABLE ${tableName} RENAME COLUMN ${op.oldName} TO ${op.newName}`)
          break
        case 'addIndex':
          sqls.push(this.buildCreateIndexSQL(tableName, op.index!))
          break
        case 'dropIndex':
          sqls.push(`DROP INDEX ${op.indexName}`)
          break
      }
    }

    return sqls
  }

  /**
   * 构建列定义
   */
  private buildColumnDefinition(column: ColumnDefinition): string {
    let def = `  ${column.name} ${column.type}`

    if (column.length) {
      def += `(${column.length})`
    }

    if (column.unsigned) {
      def += ' UNSIGNED'
    }

    if (!column.nullable) {
      def += ' NOT NULL'
    }

    if (column.defaultValue !== undefined) {
      if (typeof column.defaultValue === 'string') {
        def += ` DEFAULT '${column.defaultValue}'`
      }
      else {
        def += ` DEFAULT ${column.defaultValue}`
      }
    }

    if (column.autoIncrement) {
      def += ' AUTO_INCREMENT'
    }

    if (column.unique) {
      def += ' UNIQUE'
    }

    if (column.comment) {
      def += ` COMMENT '${column.comment}'`
    }

    return def
  }

  /**
   * 构建创建索引SQL
   */
  private buildCreateIndexSQL(tableName: string, index: IndexDefinition): string {
    const indexType = index.unique ? 'UNIQUE INDEX' : 'INDEX'
    const columns = Array.isArray(index.columns) ? index.columns.join(', ') : index.columns
    return `CREATE ${indexType} ${index.name} ON ${tableName} (${columns})`
  }
}

/**
 * 表构建器类
 */
export class TableBuilder {
  private columns: ColumnDefinition[] = []
  private indexes: IndexDefinition[] = []
  private foreignKeys: ForeignKeyDefinition[] = []

  /**
   * 添加自增主键ID
   */
  id(name = 'id'): ColumnBuilder {
    return this.integer(name).primary().autoIncrement()
  }

  /**
   * 添加字符串列
   */
  string(name: string, length = 255): ColumnBuilder {
    return this.addColumn(name, 'VARCHAR', length)
  }

  /**
   * 添加文本列
   */
  text(name: string): ColumnBuilder {
    return this.addColumn(name, 'TEXT')
  }

  /**
   * 添加整数列
   */
  integer(name: string): ColumnBuilder {
    return this.addColumn(name, 'INT')
  }

  /**
   * 添加大整数列
   */
  bigInteger(name: string): ColumnBuilder {
    return this.addColumn(name, 'BIGINT')
  }

  /**
   * 添加小整数列
   */
  smallInteger(name: string): ColumnBuilder {
    return this.addColumn(name, 'SMALLINT')
  }

  /**
   * 添加浮点数列
   */
  float(name: string, precision?: number, scale?: number): ColumnBuilder {
    const type = precision && scale ? `FLOAT(${precision},${scale})` : 'FLOAT'
    return this.addColumn(name, type)
  }

  /**
   * 添加双精度浮点数列
   */
  double(name: string, precision?: number, scale?: number): ColumnBuilder {
    const type = precision && scale ? `DOUBLE(${precision},${scale})` : 'DOUBLE'
    return this.addColumn(name, type)
  }

  /**
   * 添加十进制数列
   */
  decimal(name: string, precision = 8, scale = 2): ColumnBuilder {
    return this.addColumn(name, `DECIMAL(${precision},${scale})`)
  }

  /**
   * 添加布尔列
   */
  boolean(name: string): ColumnBuilder {
    return this.addColumn(name, 'BOOLEAN')
  }

  /**
   * 添加日期列
   */
  date(name: string): ColumnBuilder {
    return this.addColumn(name, 'DATE')
  }

  /**
   * 添加时间列
   */
  time(name: string): ColumnBuilder {
    return this.addColumn(name, 'TIME')
  }

  /**
   * 添加日期时间列
   */
  datetime(name: string): ColumnBuilder {
    return this.addColumn(name, 'DATETIME')
  }

  /**
   * 添加时间戳列
   */
  timestamp(name: string): ColumnBuilder {
    return this.addColumn(name, 'TIMESTAMP')
  }

  /**
   * 添加JSON列
   */
  json(name: string): ColumnBuilder {
    return this.addColumn(name, 'JSON')
  }

  /**
   * 添加枚举列
   */
  enum(name: string, values: string[]): ColumnBuilder {
    const enumValues = values.map(v => `'${v}'`).join(', ')
    return this.addColumn(name, `ENUM(${enumValues})`)
  }

  /**
   * 添加时间戳列（created_at, updated_at）
   */
  timestamps(): void {
    this.timestamp('created_at').defaultValue('CURRENT_TIMESTAMP')
    this.timestamp('updated_at').defaultValue('CURRENT_TIMESTAMP').onUpdate('CURRENT_TIMESTAMP')
  }

  /**
   * 添加软删除列
   */
  softDeletes(name = 'deleted_at'): ColumnBuilder {
    return this.timestamp(name).nullable()
  }

  /**
   * 添加列
   */
  private addColumn(name: string, type: string, length?: number): ColumnBuilder {
    const column: ColumnDefinition = {
      name,
      type,
      length,
      nullable: true,
      primary: false,
      unique: false,
      autoIncrement: false,
    }

    this.columns.push(column)
    return new ColumnBuilder(column)
  }

  /**
   * 添加索引
   */
  index(columns: string | string[], name?: string): void {
    const indexName = name || `idx_${Array.isArray(columns) ? columns.join('_') : columns}`
    this.indexes.push({
      name: indexName,
      columns,
      unique: false,
    })
  }

  /**
   * 添加唯一索引
   */
  unique(columns: string | string[], name?: string): void {
    const indexName = name || `uniq_${Array.isArray(columns) ? columns.join('_') : columns}`
    this.indexes.push({
      name: indexName,
      columns,
      unique: true,
    })
  }

  /**
   * 添加外键
   */
  foreign(column: string): ForeignKeyBuilder {
    const foreignKey: ForeignKeyDefinition = {
      column,
      references: { table: '', column: '' },
    }

    this.foreignKeys.push(foreignKey)
    return new ForeignKeyBuilder(foreignKey)
  }

  getColumns(): ColumnDefinition[] {
    return this.columns
  }

  getIndexes(): IndexDefinition[] {
    return this.indexes
  }

  getForeignKeys(): ForeignKeyDefinition[] {
    return this.foreignKeys
  }
}

/**
 * 列构建器类
 */
export class ColumnBuilder {
  constructor(private column: ColumnDefinition) {}

  /**
   * 设置为主键
   */
  primary(): ColumnBuilder {
    this.column.primary = true
    this.column.nullable = false
    return this
  }

  /**
   * 设置为唯一
   */
  unique(): ColumnBuilder {
    this.column.unique = true
    return this
  }

  /**
   * 设置为可空
   */
  nullable(): ColumnBuilder {
    this.column.nullable = true
    return this
  }

  /**
   * 设置为不可空
   */
  notNullable(): ColumnBuilder {
    this.column.nullable = false
    return this
  }

  /**
   * 设置默认值
   */
  defaultValue(value: any): ColumnBuilder {
    this.column.defaultValue = value
    return this
  }

  /**
   * 设置为自增
   */
  autoIncrement(): ColumnBuilder {
    this.column.autoIncrement = true
    return this
  }

  /**
   * 设置为无符号
   */
  unsigned(): ColumnBuilder {
    this.column.unsigned = true
    return this
  }

  /**
   * 设置注释
   */
  comment(comment: string): ColumnBuilder {
    this.column.comment = comment
    return this
  }

  /**
   * 设置更新时的操作
   */
  onUpdate(action: string): ColumnBuilder {
    this.column.onUpdate = action
    return this
  }
}

/**
 * 外键构建器类
 */
export class ForeignKeyBuilder {
  constructor(private foreignKey: ForeignKeyDefinition) {}

  /**
   * 设置引用表和列
   */
  references(column: string): TableReferenceBuilder {
    this.foreignKey.references.column = column
    return new TableReferenceBuilder(this.foreignKey)
  }
}

/**
 * 表引用构建器类
 */
export class TableReferenceBuilder {
  constructor(private foreignKey: ForeignKeyDefinition) {}

  /**
   * 设置引用表
   */
  on(table: string): ForeignKeyConstraintBuilder {
    this.foreignKey.references.table = table
    return new ForeignKeyConstraintBuilder(this.foreignKey)
  }
}

/**
 * 外键约束构建器类
 */
export class ForeignKeyConstraintBuilder {
  constructor(private foreignKey: ForeignKeyDefinition) {}

  /**
   * 设置删除时的操作
   */
  onDelete(action: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'): ForeignKeyConstraintBuilder {
    this.foreignKey.onDelete = action
    return this
  }

  /**
   * 设置更新时的操作
   */
  onUpdate(action: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'): ForeignKeyConstraintBuilder {
    this.foreignKey.onUpdate = action
    return this
  }
}

/**
 * 修改表构建器类
 */
export class AlterTableBuilder {
  private operations: AlterOperation[] = []

  /**
   * 添加列
   */
  addColumn(name: string, type: string, options?: Partial<ColumnDefinition>): void {
    this.operations.push({
      type: 'addColumn',
      column: {
        name,
        type,
        nullable: true,
        primary: false,
        unique: false,
        autoIncrement: false,
        ...options,
      },
    })
  }

  /**
   * 删除列
   */
  dropColumn(name: string): void {
    this.operations.push({
      type: 'dropColumn',
      columnName: name,
    })
  }

  /**
   * 修改列
   */
  modifyColumn(name: string, type: string, options?: Partial<ColumnDefinition>): void {
    this.operations.push({
      type: 'modifyColumn',
      column: {
        name,
        type,
        nullable: true,
        primary: false,
        unique: false,
        autoIncrement: false,
        ...options,
      },
    })
  }

  /**
   * 重命名列
   */
  renameColumn(oldName: string, newName: string): void {
    this.operations.push({
      type: 'renameColumn',
      oldName,
      newName,
    })
  }

  /**
   * 添加索引
   */
  addIndex(columns: string | string[], name?: string, unique = false): void {
    const indexName = name || `idx_${Array.isArray(columns) ? columns.join('_') : columns}`
    this.operations.push({
      type: 'addIndex',
      index: { name: indexName, columns, unique },
    })
  }

  /**
   * 删除索引
   */
  dropIndex(name: string): void {
    this.operations.push({
      type: 'dropIndex',
      indexName: name,
    })
  }

  getOperations(): AlterOperation[] {
    return this.operations
  }
}

// 类型定义
interface ColumnDefinition {
  name: string
  type: string
  length?: number
  nullable: boolean
  primary: boolean
  unique: boolean
  autoIncrement: boolean
  unsigned?: boolean
  defaultValue?: any
  comment?: string
  onUpdate?: string
}

interface IndexDefinition {
  name: string
  columns: string | string[]
  unique: boolean
}

interface ForeignKeyDefinition {
  column: string
  references: {
    table: string
    column: string
  }
  onDelete?: string
  onUpdate?: string
}

/* interface TableOptions {
  engine?: string
  charset?: string
  collation?: string
  comment?: string
} */

interface TableInfo {
  name: string
  columns: ColumnDefinition[]
  indexes: IndexDefinition[]
  foreignKeys: ForeignKeyDefinition[]
}

interface AlterOperation {
  type: 'addColumn' | 'dropColumn' | 'modifyColumn' | 'renameColumn' | 'addIndex' | 'dropIndex'
  column?: ColumnDefinition
  columnName?: string
  oldName?: string
  newName?: string
  index?: IndexDefinition
  indexName?: string
}
