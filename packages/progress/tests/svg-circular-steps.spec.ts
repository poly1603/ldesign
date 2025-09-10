import { describe, it, expect, beforeEach } from 'vitest'
import { CircularProgress } from '../src'

describe('CircularProgress steps & ticks (SVG renderer)', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '160px'
    container.style.height = '160px'
    document.body.appendChild(container)
  })

  it('should build steps/ticks groups and update with progress', () => {
    const cp = new CircularProgress({
      container,
      renderType: 'svg',
      steps: { enabled: true, count: 10, gap: 4 },
      ticks: { enabled: true, count: 10, length: 8, width: 2, color: '#888' },
      strokeWidth: 6,
    })
    expect(() => cp.setProgress(0.25, false)).not.toThrow()
    expect(() => cp.setProgress(0.9, false)).not.toThrow()
    cp.destroy()
  })
})
