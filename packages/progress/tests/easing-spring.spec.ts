import { describe, it, expect } from 'vitest'
import { LinearProgress } from '../src'

describe('Easing spring preset', () => {
  it('should animate with spring easing without throwing', () => {
    const container = document.createElement('div')
    container.style.width = '300px'
    container.style.height = '20px'
    document.body.appendChild(container)

    const lp = new LinearProgress({
      container,
      renderType: 'svg',
      animation: { duration: 200, easing: 'spring' },
    })

    expect(() => lp.setProgress(0.5, true)).not.toThrow()
    lp.destroy()
  })
})
