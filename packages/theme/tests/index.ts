/**
 * @ldesign/theme - 测试工具导出
 *
 * 统一导出所有测试相关的工具和辅助函数
 */

// 测试设置
export * from './setup'

// 测试辅助工具
export * from './utils/test-helpers'

// 重新导出常用的测试函数
export {
  describe,
  it,
  test,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  vi,
} from 'vitest'

export {
  mount,
  shallowMount,
  flushPromises,
  type VueWrapper,
  type MountingOptions,
} from '@vue/test-utils'
