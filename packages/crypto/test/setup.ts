import { beforeAll, afterAll, afterEach } from 'vitest'

// Mock crypto API for Node.js environment
beforeAll(() => {
  // Setup global test environment
  if (typeof global.crypto === 'undefined') {
    const { webcrypto } = require('node:crypto')
    global.crypto = webcrypto as Crypto
  }

  // Mock TextEncoder/TextDecoder if not available
  if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('node:util')
    global.TextEncoder = TextEncoder
    global.TextDecoder = TextDecoder
  }
})

afterEach(() => {
  // Clean up after each test
})

afterAll(() => {
  // Clean up after all tests
})
