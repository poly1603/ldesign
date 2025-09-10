import { describe, it, expect } from 'vitest'
import { SemicircleProgress } from '../src/SemicircleProgress'

function createContainer(width = 160, height = 160) {
  const el = document.createElement('div') as any
  el.getBoundingClientRect = () => ({ width, height })
  el.appendChild = () => {}
  return el
}

describe('SemicircleProgress (SVG renderer)', () => {
  it('supports all orientations without errors', () => {
    const orientations: Array<'top'|'bottom'|'left'|'right'> = ['top','bottom','left','right']
    orientations.forEach((o) => {
      const container = createContainer()
      const progress = new SemicircleProgress({
        container,
        renderType: 'svg',
        value: 40,
        orientation: o,
        text: { enabled: false }
      })
      expect(() => {
        progress.setValue(75, false)
        progress.render()
        progress.setOrientation(o)
        progress.render()
      }).not.toThrow()
      progress.destroy()
    })
  })

  it('applies size presets without errors', () => {
    const sizes = ['small','large'] as const
    sizes.forEach((s) => {
      const container = createContainer(220, 220)
      const progress = new SemicircleProgress({
        container,
        renderType: 'svg',
        size: s,
        value: 65,
        text: { enabled: false }
      })
      expect(() => progress.render()).not.toThrow()
      progress.destroy()
    })
  })

  it('status methods work as expected', () => {
    const container = createContainer()
    const p = new SemicircleProgress({ container, renderType: 'svg', value: 30 })
    p.setSuccess(); expect(p.getStatus()).toBe('success')
    p.setWarning(); expect(p.getStatus()).toBe('warning')
    p.setError(); expect(p.getStatus()).toBe('error')
    p.setLoading(); expect(p.getStatus()).toBe('loading')
    p.setNormal(); expect(p.getStatus()).toBe('normal')
    p.destroy()
  })

  it('inherits indeterminate API without throwing', async () => {
    const container = createContainer(200, 200)
    const p = new SemicircleProgress({ container, renderType: 'svg', value: 0 })
    expect(() => p.setIndeterminate(true)).not.toThrow()
    expect(() => p.setIndeterminate(false)).not.toThrow()
    p.destroy()
  })
})

