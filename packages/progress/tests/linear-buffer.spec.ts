import { describe, it, expect, beforeEach } from 'vitest'
import { LinearProgress } from '../src'

describe('LinearProgress buffer support', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    // 给一个可见尺寸，避免 0 宽高
    container.style.width = '300px'
    container.style.height = '20px'
    document.body.appendChild(container)
  })

  it('should accept 0-1 buffer and clamp correctly', () => {
    const lp = new LinearProgress({ container, renderType: 'svg', showBuffer: true, buffer: 0.4 })
    expect(lp.getBuffer()).toBeCloseTo(0.4, 3)
    lp.setBuffer(1.2)
    expect(lp.getBuffer()).toBeCloseTo(1, 3)
    lp.setBuffer(-0.2)
    expect(lp.getBuffer()).toBeCloseTo(0, 3)
    lp.destroy()
  })

  it('should accept absolute buffer value based on min/max', () => {
    const lp = new LinearProgress({ container, renderType: 'svg', showBuffer: true, min: 0, max: 200, buffer: 60 })
    expect(lp.getBuffer()).toBeCloseTo(0.3, 3)
    lp.setBufferValue(100)
    expect(lp.getBuffer()).toBeCloseTo(0.5, 3)
    lp.destroy()
  })
})
