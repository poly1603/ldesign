import { describe, it, expect } from 'vitest'
import { CircularProgress } from '../src/CircularProgress'

function createContainer(width = 120, height = 120) {
  const el = document.createElement('div') as any
  // mock size for BaseProgress.resize
  el.getBoundingClientRect = () => ({ width, height })
  el.appendChild = () => {}
  return el
}

describe('CircularProgress (Canvas renderer)', () => {
  it('does not throw when progress is extremely small (wave enabled)', () => {
    const container = createContainer()
    const progress = new CircularProgress({
      container,
      renderType: 'canvas',
      value: 0,
      wave: { enabled: true, amplitude: 5, frequency: 2 },
    })

    expect(() => {
      progress.setProgress(0.001, false)
      progress.render()
    }).not.toThrow()

    progress.destroy()
  })

  it('supports anticlockwise rendering without errors', () => {
    const container = createContainer()
    const progress = new CircularProgress({
      container,
      renderType: 'canvas',
      value: 0,
      clockwise: false,
    })

    expect(() => {
      progress.setProgress(0.5, false)
      progress.render()
    }).not.toThrow()

    progress.destroy()
  })

  it('radius remains non-negative on small containers during resize', () => {
    const container = createContainer(24, 24)
    const progress = new CircularProgress({
      container,
      renderType: 'canvas',
      value: 50,
      strokeWidth: 12,
    })

    expect(() => {
      // trigger resize logic
      progress.resize()
      progress.render()
    }).not.toThrow()

    progress.destroy()
  })
})

