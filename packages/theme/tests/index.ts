/**
 * @ldesign/theme - 测试工具导出
 *
 * 统一导出所有测试相关的工具和辅助函数
 */

// 测试设置
export * from './setup'

// 测试辅助工具
export * from './utils/test-helpers'

export {
  flushPromises,
  mount,
  type MountingOptions,
  shallowMount,
  type VueWrapper,
} from '@vue/test-utils'

// 重新导出常用的测试函数
export {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  test,
  vi,
} from 'vitest'
