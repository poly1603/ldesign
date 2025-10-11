/* Vitest/JSdom 测试环境通用 Polyfills 与全局配置 */

import { Blob as NodeBlob, Buffer as NodeBuffer } from 'node:buffer'
import { webcrypto as nodeWebcrypto } from 'node:crypto'
import { performance as nodePerformance } from 'node:perf_hooks'
import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from 'node:util'

// 1) atob / btoa（Node.js 无内置）
if (typeof (globalThis as any).atob === 'undefined') {
  (globalThis as any).atob = (b64: string) => NodeBuffer.from(b64, 'base64').toString('binary')
}
if (typeof (globalThis as any).btoa === 'undefined') {
  (globalThis as any).btoa = (str: string) => NodeBuffer.from(str, 'binary').toString('base64')
}

// 2) crypto（Node 18+ 支持 webcrypto）
if (typeof (globalThis as any).crypto === 'undefined') {
  ;(globalThis as any).crypto = nodeWebcrypto
}

// 3) TextEncoder/TextDecoder（Node 18+ 已内置，兜底）
if (typeof (globalThis as any).TextEncoder === 'undefined') {
  ;(globalThis as any).TextEncoder = NodeTextEncoder
}
if (typeof (globalThis as any).TextDecoder === 'undefined') {
  ;(globalThis as any).TextDecoder = NodeTextDecoder
}

// 4) performance（Node 18+ 已内置，兜底）
if (typeof (globalThis as any).performance === 'undefined') {
  ;(globalThis as any).performance = nodePerformance
}

// 5) Blob（Node 18+ 已内置，保守兜底）
if (typeof (globalThis as any).Blob === 'undefined') {
  ;(globalThis as any).Blob = NodeBlob
}

// 6) URL.createObjectURL 可能在 jsdom 下不存在，用安全兜底
if (typeof URL.createObjectURL !== 'function') {
  ;(URL as any).createObjectURL = () => ''
}
if (typeof URL.revokeObjectURL !== 'function') {
  ;(URL as any).revokeObjectURL = () => {}
}

// 7) 统一定时器：部分代码读取 window.setInterval
if (typeof (globalThis as any).window !== 'undefined') {
  const w = (globalThis as any).window
  w.setInterval ||= globalThis.setInterval.bind(globalThis)
  w.clearInterval ||= globalThis.clearInterval.bind(globalThis)
}

export {}

