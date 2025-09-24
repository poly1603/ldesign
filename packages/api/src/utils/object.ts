/**
 * 对象字段重命名工具
 */
export function renameKeysShallow<T extends Record<string, any>>(obj: T, mapping: Record<string, string>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(obj || {})) {
    const nk = mapping[k] || k
    out[nk] = v
  }
  return out
}

export function renameKeysDeep(input: any, mapping: Record<string, string>): any {
  if (Array.isArray(input))
    return input.map(i => renameKeysDeep(i, mapping))
  if (input && typeof input === 'object') {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(input)) {
      const nk = mapping[k] || k
      out[nk] = renameKeysDeep(v, mapping)
    }
    return out
  }
  return input
}
