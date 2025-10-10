/**
 * Basic Cropper tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Cropper } from '../src/core/Cropper'

describe('Cropper', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'test-container'
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)
  })

  it('should create a cropper instance', () => {
    const cropper = new Cropper(container, {
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    })

    expect(cropper).toBeDefined()
    expect(cropper).toBeInstanceOf(Cropper)
  })

  it('should accept options', () => {
    const options = {
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      aspectRatio: 16 / 9,
      viewMode: 1 as const
    }

    const cropper = new Cropper(container, options)
    expect(cropper).toBeDefined()
  })

  it('should handle element selector', () => {
    const cropper = new Cropper('#test-container', {
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    })

    expect(cropper).toBeDefined()
  })
})
