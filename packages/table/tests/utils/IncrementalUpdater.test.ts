/**
 * IncrementalUpdater单元测试
 * 
 * 测试增量更新管理器功能
 * 确保差异计算、变更合并、批量处理等功能正常工作
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { IncrementalUpdater } from '@/utils/IncrementalUpdater'
import { createTestData } from '../setup'

describe('IncrementalUpdater', () => {
  let incrementalUpdater: IncrementalUpdater
  let testData: any[]
  let getKey: (item: any) => string

  beforeEach(() => {
    incrementalUpdater = new IncrementalUpdater({
      enabled: true,
      batchSize: 3,
      updateInterval: 50,
      enableAutoMerge: true,
      maxChangeRecords: 100
    })

    testData = createTestData(10)
    getKey = (item) => item.id.toString()
  })

  afterEach(() => {
    incrementalUpdater.destroy()
  })

  describe('快照初始化', () => {
    it('应该能初始化数据快照', () => {
      incrementalUpdater.initializeSnapshot(testData, getKey)

      const stats = incrementalUpdater.getStats()
      expect(stats.snapshotSize).toBe(testData.length)
    })
  })

  describe('差异计算', () => {
    beforeEach(() => {
      incrementalUpdater.initializeSnapshot(testData, getKey)
    })

    it('应该能检测新增项', () => {
      const newData = [...testData, { id: 11, name: '新用户', age: 25 }]

      const diff = incrementalUpdater.calculateDiff(newData, getKey)

      expect(diff.added).toHaveLength(1)
      expect(diff.added[0]).toMatchObject({ id: 11, name: '新用户' })
      expect(diff.updated).toHaveLength(0)
      expect(diff.removed).toHaveLength(0)
    })

    it('应该能检测更新项', () => {
      const newData = testData.map(item =>
        item.id === 1 ? { ...item, name: '更新的用户' } : item
      )

      const diff = incrementalUpdater.calculateDiff(newData, getKey)

      expect(diff.added).toHaveLength(0)
      expect(diff.updated).toHaveLength(1)
      expect(diff.updated[0]).toMatchObject({
        key: '1',
        oldData: expect.objectContaining({ id: 1 }),
        newData: expect.objectContaining({ id: 1, name: '更新的用户' })
      })
      expect(diff.removed).toHaveLength(0)
    })

    it('应该能检测删除项', () => {
      const newData = testData.filter(item => item.id !== 1)

      const diff = incrementalUpdater.calculateDiff(newData, getKey)

      expect(diff.added).toHaveLength(0)
      expect(diff.updated).toHaveLength(0)
      expect(diff.removed).toHaveLength(1)
      expect(diff.removed[0]).toMatchObject({ id: 1 })
    })

    it('应该能检测位置变化', () => {
      const newData = [...testData]
        // 交换前两个元素的位置
        ;[newData[0], newData[1]] = [newData[1], newData[0]]

      const diff = incrementalUpdater.calculateDiff(newData, getKey)

      expect(diff.moved).toHaveLength(2)
      expect(diff.moved).toContainEqual({
        key: testData[0].id.toString(),
        oldIndex: 0,
        newIndex: 1
      })
      expect(diff.moved).toContainEqual({
        key: testData[1].id.toString(),
        oldIndex: 1,
        newIndex: 0
      })
    })

    it('应该能使用自定义比较函数', () => {
      const newData = testData.map(item => ({ ...item })) // 浅拷贝

      // 使用默认比较（JSON.stringify）
      const diff1 = incrementalUpdater.calculateDiff(newData, getKey)
      expect(diff1.updated).toHaveLength(0)

      // 使用自定义比较函数
      const customCompare = (a: any, b: any) => a.name === b.name && a.age === b.age
      const diff2 = incrementalUpdater.calculateDiff(newData, getKey, customCompare)
      expect(diff2.updated).toHaveLength(0)
    })
  })

  describe('差异应用', () => {
    beforeEach(() => {
      incrementalUpdater.initializeSnapshot(testData, getKey)
    })

    it('应该能应用差异更新', () => {
      const newData = [
        ...testData.slice(1), // 删除第一项
        { id: 11, name: '新用户', age: 25 }, // 新增项
        { ...testData[1], name: '更新的用户' } // 更新项（但位置在最后）
      ]

      const diff = incrementalUpdater.calculateDiff(newData, getKey)
      const changes = incrementalUpdater.applyDiff(diff, getKey)

      expect(changes.length).toBeGreaterThan(0)

      const addChanges = changes.filter(c => c.type === 'add')
      const updateChanges = changes.filter(c => c.type === 'update')
      const removeChanges = changes.filter(c => c.type === 'remove')

      expect(addChanges).toHaveLength(1)
      expect(updateChanges).toHaveLength(1)
      expect(removeChanges).toHaveLength(1)
    })

    it('应该记录变更历史', () => {
      const newData = [...testData, { id: 11, name: '新用户', age: 25 }]

      const diff = incrementalUpdater.calculateDiff(newData, getKey)
      incrementalUpdater.applyDiff(diff, getKey)

      const records = incrementalUpdater.getChangeRecords()
      expect(records).toHaveLength(1)
      expect(records[0]).toMatchObject({
        type: 'add',
        key: '11',
        newData: expect.objectContaining({ id: 11 })
      })
    })
  })

  describe('变更合并', () => {
    beforeEach(() => {
      incrementalUpdater.initializeSnapshot(testData, getKey)
    })

    it('应该能合并连续的变更', async () => {
      const batchSpy = vi.fn()
      incrementalUpdater.on('batch-update', batchSpy)

      // 添加多个变更
      const diff1 = incrementalUpdater.calculateDiff(
        [...testData, { id: 11, name: '用户11', age: 25 }],
        getKey
      )
      incrementalUpdater.applyDiff(diff1, getKey)

      const diff2 = incrementalUpdater.calculateDiff(
        [...testData, { id: 11, name: '用户11', age: 25 }, { id: 12, name: '用户12', age: 26 }],
        getKey
      )
      incrementalUpdater.applyDiff(diff2, getKey)

      const diff3 = incrementalUpdater.calculateDiff(
        [...testData, { id: 11, name: '用户11', age: 25 }, { id: 12, name: '用户12', age: 26 }, { id: 13, name: '用户13', age: 27 }],
        getKey
      )
      incrementalUpdater.applyDiff(diff3, getKey)

      // 等待批量处理
      await new Promise(resolve => setTimeout(resolve, 60))

      expect(batchSpy).toHaveBeenCalled()
    })

    it('应该正确合并add+update变更', () => {
      // 这个测试需要访问私有方法，我们通过公共接口间接测试
      const newData1 = [...testData, { id: 11, name: '用户11', age: 25 }]
      const diff1 = incrementalUpdater.calculateDiff(newData1, getKey)
      incrementalUpdater.applyDiff(diff1, getKey)

      const newData2 = [...testData, { id: 11, name: '更新的用户11', age: 26 }]
      const diff2 = incrementalUpdater.calculateDiff(newData2, getKey)
      incrementalUpdater.applyDiff(diff2, getKey)

      const records = incrementalUpdater.getChangeRecords()
      expect(records.length).toBeGreaterThan(0)
    })
  })

  describe('批量处理', () => {
    it('应该在达到批量大小时触发处理', async () => {
      const batchSpy = vi.fn()
      incrementalUpdater.on('batch-update', batchSpy)

      // 添加足够的变更触发批量处理
      for (let i = 0; i < 3; i++) {
        const newData = [...testData, { id: 11 + i, name: `用户${11 + i}`, age: 25 + i }]
        const diff = incrementalUpdater.calculateDiff(newData, getKey)
        incrementalUpdater.applyDiff(diff, getKey)
      }

      expect(batchSpy).toHaveBeenCalled()
    })

    it('应该在延迟后触发批量处理', async () => {
      const batchSpy = vi.fn()
      incrementalUpdater.on('batch-update', batchSpy)

      // 添加少量变更
      const newData = [...testData, { id: 11, name: '用户11', age: 25 }]
      const diff = incrementalUpdater.calculateDiff(newData, getKey)
      incrementalUpdater.applyDiff(diff, getKey)

      // 等待延迟时间
      await new Promise(resolve => setTimeout(resolve, 60))

      expect(batchSpy).toHaveBeenCalled()
    })
  })

  describe('变更记录管理', () => {
    it('应该能获取指定时间后的变更', () => {
      const timestamp = Date.now()

      const newData = [...testData, { id: 11, name: '用户11', age: 25 }]
      const diff = incrementalUpdater.calculateDiff(newData, getKey)
      incrementalUpdater.applyDiff(diff, getKey)

      const records = incrementalUpdater.getChangeRecords(timestamp - 1000)
      expect(records.length).toBeGreaterThan(0)

      const recentRecords = incrementalUpdater.getChangeRecords(timestamp + 1000)
      expect(recentRecords).toHaveLength(0)
    })

    it('应该能清除变更记录', () => {
      const newData = [...testData, { id: 11, name: '用户11', age: 25 }]
      const diff = incrementalUpdater.calculateDiff(newData, getKey)
      incrementalUpdater.applyDiff(diff, getKey)

      expect(incrementalUpdater.getChangeRecords().length).toBeGreaterThan(0)

      incrementalUpdater.clearChangeRecords()
      expect(incrementalUpdater.getChangeRecords()).toHaveLength(0)
    })

    it('应该限制变更记录数量', () => {
      // 添加大量变更记录
      for (let i = 0; i < 120; i++) {
        const newData = [...testData, { id: 11 + i, name: `用户${11 + i}`, age: 25 }]
        const diff = incrementalUpdater.calculateDiff(newData, getKey)
        incrementalUpdater.applyDiff(diff, getKey)
      }

      const records = incrementalUpdater.getChangeRecords()
      expect(records.length).toBeLessThanOrEqual(50) // 应该被限制
    })
  })

  describe('统计信息', () => {
    it('应该能获取统计信息', () => {
      incrementalUpdater.initializeSnapshot(testData, getKey)

      const newData = [...testData, { id: 11, name: '用户11', age: 25 }]
      const diff = incrementalUpdater.calculateDiff(newData, getKey)
      incrementalUpdater.applyDiff(diff, getKey)

      const stats = incrementalUpdater.getStats()

      expect(stats).toMatchObject({
        totalChanges: expect.any(Number),
        pendingBatches: expect.any(Number),
        snapshotSize: expect.any(Number),
        memoryUsage: expect.any(Number)
      })
    })
  })

  describe('事件系统', () => {
    it('应该触发变更记录事件', () => {
      const recordSpy = vi.fn()
      incrementalUpdater.on('changes-recorded', recordSpy)

      const newData = [...testData, { id: 11, name: '用户11', age: 25 }]
      const diff = incrementalUpdater.calculateDiff(newData, getKey)
      incrementalUpdater.applyDiff(diff, getKey)

      expect(recordSpy).toHaveBeenCalledWith({
        changes: expect.any(Array)
      })
    })

    it('应该能移除事件监听器', () => {
      const listener = vi.fn()

      incrementalUpdater.on('changes-recorded', listener)
      incrementalUpdater.off('changes-recorded', listener)

      const newData = [...testData, { id: 11, name: '用户11', age: 25 }]
      const diff = incrementalUpdater.calculateDiff(newData, getKey)
      incrementalUpdater.applyDiff(diff, getKey)

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('销毁', () => {
    it('应该能正确销毁更新器', () => {
      incrementalUpdater.initializeSnapshot(testData, getKey)

      const newData = [...testData, { id: 11, name: '用户11', age: 25 }]
      const diff = incrementalUpdater.calculateDiff(newData, getKey)
      incrementalUpdater.applyDiff(diff, getKey)

      const statsBefore = incrementalUpdater.getStats()
      expect(statsBefore.totalChanges).toBeGreaterThan(0)

      incrementalUpdater.destroy()

      const statsAfter = incrementalUpdater.getStats()
      expect(statsAfter.totalChanges).toBe(0)
      expect(statsAfter.snapshotSize).toBe(0)
    })
  })
})
