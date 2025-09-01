// 导出所有测试工具
export * from './setup'
export * from './mocks'
export * from './helpers'

// 重新导出常用的测试库
export { vi, expect, describe, it, test, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
export { mount, shallowMount, flushPromises } from '@vue/test-utils'
export { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/vue'
export { userEvent } from '@testing-library/user-event'
