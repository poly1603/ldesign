import { build } from '@ldesign/builder'

async function main() {
  const result = await build({
    input: 'src/index.ts',
    formats: ['umd'],
    dts: true,
    sourcemap: true,
    minify: true,
    external: ['vue'],
    globals: { vue: 'Vue' },
    name: 'LDesignRouter',
    // 强制单文件 UMD 输出
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        exports: 'named',
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'LDesignRouter',
        sourcemap: true
      }
    }
  })
  if (!result.success) {
    console.error('UMD build failed:', result.errors)
    process.exit(1)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })

