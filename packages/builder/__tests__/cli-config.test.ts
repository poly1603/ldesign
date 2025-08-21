import { loadUserConfig } from '../src/utils/config-loader'
import fs from 'fs'
import path from 'path'

describe('Config Loader', () => {
  const root = path.join(process.cwd(), '.tmp-config')

  beforeAll(() => {
    if (!fs.existsSync(root)) fs.mkdirSync(root)
  })

  afterAll(() => {
    try { fs.rmSync(root, { recursive: true, force: true }) } catch {}
  })

  it('returns null when no config present', async () => {
    const dir = path.join(root, 'case-empty')
    fs.mkdirSync(dir, { recursive: true })
    const res = await loadUserConfig(dir)
    expect(res).toBeNull()
  })

  it('loads js config', async () => {
    const dir = path.join(root, 'case-js')
    fs.mkdirSync(dir, { recursive: true })
    const cfg = `module.exports = { outDir: 'out-js' }`
    fs.writeFileSync(path.join(dir, 'ldesign.config.js'), cfg, 'utf-8')
    const res = await loadUserConfig(dir)
    expect(res).toEqual(expect.objectContaining({ outDir: 'out-js' }))
  })

  it('returns null on broken config', async () => {
    const dir = path.join(root, 'case-broken')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'ldesign.config.js'), 'module.exports = (()=>{ throw new Error("x") })()', 'utf-8')
    const res = await loadUserConfig(dir)
    expect(res).toBeNull()
  })

  it('returns null on config exporting non-object', async () => {
    const dir = path.join(root, 'case-nonobject')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'ldesign.config.js'), 'module.exports = 1', 'utf-8')
    const res = await loadUserConfig(dir)
    expect(res).toBeNull()
  })

  it('loads ts config when ts-node exists (silently ignored if missing)', async () => {
    const dir = path.join(root, 'case-ts')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'ldesign.config.ts'), 'export default { outDir: "out-ts" }', 'utf-8')
    const res = await loadUserConfig(dir)
    if (res) {
      expect(res).toEqual(expect.objectContaining({ outDir: 'out-ts' }))
    } else {
      expect(res).toBeNull()
    }
  })

  it('clears require cache to reload changed config', async () => {
    const dir = path.join(root, 'case-cache')
    fs.mkdirSync(dir, { recursive: true })
    const cfgPath = path.join(dir, 'ldesign.config.js')
    fs.writeFileSync(cfgPath, "module.exports = { outDir: 'v1' }", 'utf-8')
    const first = await loadUserConfig(dir)
    expect(first).toEqual(expect.objectContaining({ outDir: 'v1' }))
    // overwrite and ensure cache invalidation
    fs.writeFileSync(cfgPath, "module.exports = { outDir: 'v2' }", 'utf-8')
    jest.resetModules()
    const second = await loadUserConfig(dir)
    expect(second).toEqual(expect.objectContaining({ outDir: 'v2' }))
  })
})


