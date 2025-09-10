import { describe, it, expect, beforeEach } from 'vitest'
import { CircularProgress } from '../src'

describe('CircularProgress multi-ring', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '200px'
    container.style.height = '200px'
    document.body.appendChild(container)
  })

  it('should initialize with multiple rings and update ring progress without throwing', () => {
    const cp = new CircularProgress({
      container,
      renderType: 'svg',
      rings: [
        { radius: 60, strokeWidth: 8, value: 20, min: 0, max: 100, progressColor: '#165DFF' },
        { radius: 42, strokeWidth: 8, value: 10, min: 0, max: 100, progressColor: '#52C41A' },
      ],
    }) as any

    expect(() => cp.setRingProgress(0, 0.75)).not.toThrow()
    expect(() => cp.setRingValue(1, 80)).not.toThrow()

    cp.destroy()
  })
})
