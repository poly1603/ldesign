import { describe, it, expect, beforeEach } from 'vitest'
import { CircularProgress } from '../src'

describe('CircularProgress steps & ticks (Canvas renderer)', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '160px'
    container.style.height = '160px'
    document.body.appendChild(container)
  })

  it('should render steps without throwing and respond to progress', () => {
    const cp = new CircularProgress({
      container,
      renderType: 'canvas',
      steps: { enabled: true, count: 8, gap: 4 },
      ticks: { enabled: true, count: 8, length: 6, width: 2, color: '#666' },
      strokeWidth: 8,
    })

    expect(() => cp.setProgress(0.5, false)).not.toThrow()
    expect(() => cp.setProgress(0.9, false)).not.toThrow()

    cp.destroy()
  })
})
