import { describe, it, expect } from 'vitest'
import { parsePageRange } from '../../src/utils/pdf-utils'

describe('parsePageRange', () => {
  it('parses simple ranges and singles', () => {
    expect(parsePageRange('1-3,5,10-12', 12)).toEqual([1, 2, 3, 5, 10, 11, 12])
  })

  it('handles reversed ranges', () => {
    expect(parsePageRange('3-1', 10)).toEqual([1, 2, 3])
  })

  it('clamps out-of-range values', () => {
    expect(parsePageRange('0-100', 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('ignores invalid tokens and removes duplicates', () => {
    expect(parsePageRange('abc,2-2,2', 10)).toEqual([2])
  })

  it('returns empty for empty/invalid strings', () => {
    expect(parsePageRange('', 10)).toEqual([])
    expect(parsePageRange(' , , ', 10)).toEqual([])
  })
})
