/**
 * 事务管理器
 * 提供数据库事务的管理和嵌套事务支持
 */

import type { DatabaseConnection, QueryResult } from '../types'
import { EventEmitter } from 'node:events'
import { DatabaseError } from '../types'

/**
 * 事务管理器类
 */
export class TransactionManager extends EventEmitter {
  private connection: DatabaseConnection
  private transactionStack: Transaction[] = []
  private savePointCounter = 0

  constructor(connection: DatabaseConnection) {
    super()
    this.connection = connection
  }

  /**
   * 开始事务
   * @param options 事务选项
   */
  async begin(options: TransactionOptions = {}): Promise<Transaction> {
    const isNested = this.transactionStack.length > 0
    const transaction: Transaction = {
      id: this.generateTransactionId(),
      level: this.transactionStack.length,
      savePoint: isNested ? `sp_${++this.savePointCounter}` : null,
      status: 'active',
      startTime: new Date(),
      options,
    }

    try {
      if (isNested) {
        // 嵌套事务使用保存点
        await this.connection.query(`SAVEPOINT ${transaction.savePoint}`)
      }
      else {
        // 顶级事务
        await this.connection.beginTransaction()
      }

      this.transactionStack.push(transaction)
      this.emit('transactionBegin', transaction)

      return transaction
    }
    catch (error) {
      transaction.status = 'failed'
      this.emit('transactionError', { transaction, error })
      throw new DatabaseError('Failed to begin transaction', error as Error)
    }
  }

  /**
   * 提交事务
   * @param transactionId 事务ID
   */
  async commit(transactionId?: string): Promise<void> {
    const transaction = this.findTransaction(transactionId)
    if (!transaction) {
      throw new DatabaseError('Transaction not found')
    }

    if (transaction.status !== 'active') {
      throw new DatabaseError(`Cannot commit transaction with status: ${transaction.status}`)
    }

    try {
      if (transaction.savePoint) {
        // 嵌套事务：释放保存点
        await this.connection.query(`RELEASE SAVEPOINT ${transaction.savePoint}`)
      }
      else {
        // 顶级事务：提交
        await this.connection.commit()
      }

      transaction.status = 'committed'
      transaction.endTime = new Date()

      this.removeTransaction(transaction.id)
      this.emit('transactionCommit', transaction)
    }
    catch (error) {
      transaction.status = 'failed'
      this.emit('transactionError', { transaction, error })
      throw new DatabaseError('Failed to commit transaction', error as Error)
    }
  }

  /**
   * 回滚事务
   * @param transactionId 事务ID
   */
  async rollback(transactionId?: string): Promise<void> {
    const transaction = this.findTransaction(transactionId)
    if (!transaction) {
      throw new DatabaseError('Transaction not found')
    }

    if (transaction.status !== 'active') {
      throw new DatabaseError(`Cannot rollback transaction with status: ${transaction.status}`)
    }

    try {
      if (transaction.savePoint) {
        // 嵌套事务：回滚到保存点
        await this.connection.query(`ROLLBACK TO SAVEPOINT ${transaction.savePoint}`)
      }
      else {
        // 顶级事务：回滚
        await this.connection.rollback()
      }

      transaction.status = 'rolled_back'
      transaction.endTime = new Date()

      this.removeTransaction(transaction.id)
      this.emit('transactionRollback', transaction)
    }
    catch (error) {
      transaction.status = 'failed'
      this.emit('transactionError', { transaction, error })
      throw new DatabaseError('Failed to rollback transaction', error as Error)
    }
  }

  /**
   * 执行事务
   * @param callback 事务回调
   * @param options 事务选项
   */
  async execute<T>(
    callback: (transaction: Transaction) => Promise<T>,
    options: TransactionOptions = {},
  ): Promise<T> {
    const transaction = await this.begin(options)

    try {
      const result = await callback(transaction)
      await this.commit(transaction.id)
      return result
    }
    catch (error) {
      await this.rollback(transaction.id)
      throw error
    }
  }

  /**
   * 在事务中执行查询
   * @param sql SQL语句
   * @param params 参数
   * @param transactionId 事务ID
   */
  async query(sql: string, params?: any[], transactionId?: string): Promise<QueryResult> {
    const transaction = this.findTransaction(transactionId)
    if (!transaction) {
      throw new DatabaseError('No active transaction found')
    }

    if (transaction.status !== 'active') {
      throw new DatabaseError(
        `Cannot execute query in transaction with status: ${transaction.status}`,
      )
    }

    try {
      const result = await this.connection.query(sql, params)
      this.emit('transactionQuery', { transaction, sql, params, result })
      return result
    }
    catch (error) {
      this.emit('transactionQueryError', { transaction, sql, params, error })
      throw error
    }
  }

  /**
   * 获取当前活跃事务
   */
  getCurrentTransaction(): Transaction | null {
    return this.transactionStack[this.transactionStack.length - 1] || null
  }

  /**
   * 获取所有活跃事务
   */
  getActiveTransactions(): Transaction[] {
    return this.transactionStack.filter(t => t.status === 'active')
  }

  /**
   * 检查是否在事务中
   */
  isInTransaction(): boolean {
    return this.transactionStack.length > 0
  }

  /**
   * 获取事务嵌套级别
   */
  getTransactionLevel(): number {
    return this.transactionStack.length
  }

  /**
   * 回滚所有事务
   */
  async rollbackAll(): Promise<void> {
    const transactions = [...this.transactionStack].reverse()

    for (const transaction of transactions) {
      try {
        await this.rollback(transaction.id)
      }
      catch (error) {
        this.emit('rollbackAllError', { transaction, error })
      }
    }
  }

  /**
   * 创建保存点
   * @param name 保存点名称
   */
  async createSavepoint(name?: string): Promise<string> {
    if (!this.isInTransaction()) {
      throw new DatabaseError('Cannot create savepoint outside of transaction')
    }

    const savepointName = name || `sp_${++this.savePointCounter}`

    try {
      await this.connection.query(`SAVEPOINT ${savepointName}`)
      this.emit('savepointCreated', { name: savepointName })
      return savepointName
    }
    catch (error) {
      throw new DatabaseError(`Failed to create savepoint: ${savepointName}`, error as Error)
    }
  }

  /**
   * 回滚到保存点
   * @param name 保存点名称
   */
  async rollbackToSavepoint(name: string): Promise<void> {
    if (!this.isInTransaction()) {
      throw new DatabaseError('Cannot rollback to savepoint outside of transaction')
    }

    try {
      await this.connection.query(`ROLLBACK TO SAVEPOINT ${name}`)
      this.emit('savepointRollback', { name })
    }
    catch (error) {
      throw new DatabaseError(`Failed to rollback to savepoint: ${name}`, error as Error)
    }
  }

  /**
   * 释放保存点
   * @param name 保存点名称
   */
  async releaseSavepoint(name: string): Promise<void> {
    if (!this.isInTransaction()) {
      throw new DatabaseError('Cannot release savepoint outside of transaction')
    }

    try {
      await this.connection.query(`RELEASE SAVEPOINT ${name}`)
      this.emit('savepointReleased', { name })
    }
    catch (error) {
      throw new DatabaseError(`Failed to release savepoint: ${name}`, error as Error)
    }
  }

  /**
   * 设置事务隔离级别
   * @param level 隔离级别
   */
  async setIsolationLevel(level: IsolationLevel): Promise<void> {
    try {
      await this.connection.query(`SET TRANSACTION ISOLATION LEVEL ${level}`)
      this.emit('isolationLevelSet', { level })
    }
    catch (error) {
      throw new DatabaseError(`Failed to set isolation level: ${level}`, error as Error)
    }
  }

  /**
   * 获取事务统计信息
   */
  getStats(): TransactionStats {
    const activeTransactions = this.getActiveTransactions()

    return {
      activeTransactions: activeTransactions.length,
      totalTransactions: this.transactionStack.length,
      nestedLevel: this.getTransactionLevel(),
      savePointCounter: this.savePointCounter,
      transactions: activeTransactions.map(t => ({
        id: t.id,
        level: t.level,
        status: t.status,
        startTime: t.startTime,
        duration: Date.now() - t.startTime.getTime(),
      })),
    }
  }

  /**
   * 查找事务
   */
  private findTransaction(transactionId?: string): Transaction | null {
    if (!transactionId) {
      return this.getCurrentTransaction()
    }

    return this.transactionStack.find(t => t.id === transactionId) || null
  }

  /**
   * 移除事务
   */
  private removeTransaction(transactionId: string): void {
    const index = this.transactionStack.findIndex(t => t.id === transactionId)
    if (index !== -1) {
      this.transactionStack.splice(index, 1)
    }
  }

  /**
   * 生成事务ID
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 创建事务管理器实例
   */
  static create(connection: DatabaseConnection): TransactionManager {
    return new TransactionManager(connection)
  }
}

/**
 * 简单事务包装器
 */
export class SimpleTransaction {
  private connection: DatabaseConnection
  private isActive = false

  constructor(connection: DatabaseConnection) {
    this.connection = connection
  }

  /**
   * 开始事务
   */
  async begin(): Promise<void> {
    if (this.isActive) {
      throw new DatabaseError('Transaction already active')
    }

    await this.connection.beginTransaction()
    this.isActive = true
  }

  /**
   * 提交事务
   */
  async commit(): Promise<void> {
    if (!this.isActive) {
      throw new DatabaseError('No active transaction')
    }

    await this.connection.commit()
    this.isActive = false
  }

  /**
   * 回滚事务
   */
  async rollback(): Promise<void> {
    if (!this.isActive) {
      throw new DatabaseError('No active transaction')
    }

    await this.connection.rollback()
    this.isActive = false
  }

  /**
   * 执行查询
   */
  async query(sql: string, params?: any[]): Promise<QueryResult> {
    if (!this.isActive) {
      throw new DatabaseError('No active transaction')
    }

    return this.connection.query(sql, params)
  }

  /**
   * 执行事务
   */
  async execute<T>(callback: (transaction: SimpleTransaction) => Promise<T>): Promise<T> {
    await this.begin()

    try {
      const result = await callback(this)
      await this.commit()
      return result
    }
    catch (error) {
      await this.rollback()
      throw error
    }
  }

  /**
   * 检查是否活跃
   */
  isTransactionActive(): boolean {
    return this.isActive
  }
}

// 类型定义
interface TransactionOptions {
  isolationLevel?: IsolationLevel
  readOnly?: boolean
  timeout?: number
}

interface Transaction {
  id: string
  level: number
  savePoint: string | null
  status: 'active' | 'committed' | 'rolled_back' | 'failed'
  startTime: Date
  endTime?: Date
  options: TransactionOptions
}

interface TransactionStats {
  activeTransactions: number
  totalTransactions: number
  nestedLevel: number
  savePointCounter: number
  transactions: Array<{
    id: string
    level: number
    status: string
    startTime: Date
    duration: number
  }>
}

type IsolationLevel = 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE'
