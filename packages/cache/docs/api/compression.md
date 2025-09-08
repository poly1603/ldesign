# 数据压缩（Compression）

本页介绍如何使用数据压缩功能以降低存储占用、提升传输效率，以及如何无缝集成到缓存读写流程中。

## 适用场景
- 大型 JSON 对象（> 1 KB）
- 重复字符/字段较多的数据
- 需要持久化到 localStorage/IndexedDB 的数据

## 快速上手

```ts
import { Compressor } from '@ldesign/cache'

const compressor = new Compressor({
  enabled: true,
  algorithm: 'gzip',     // 'gzip' | 'deflate' | 'brotli' | 'none'
  minSize: 1024,         // 小于此大小不压缩（字节）
  level: 6,              // 压缩等级（1-9）
})

// 压缩
const json = JSON.stringify(bigObject)
const result = await compressor.compress(json)
console.log(result.ratio) // 压缩率

// 解压
const original = await compressor.decompress(result.data, result.algorithm)
```

## API

### new Compressor(options)
```ts
interface CompressionOptions {
  enabled?: boolean
  algorithm?: 'gzip' | 'deflate' | 'brotli' | 'none'
  minSize?: number
  level?: number
  customCompress?: (data: string) => Promise<string>
  customDecompress?: (data: string) => Promise<string>
}
```

### compress(data)
- 入参: string（建议对对象先 JSON.stringify）
- 返回: `Promise<{ data, originalSize, compressedSize, ratio, algorithm }>`

### decompress(data, algorithm)
- 入参: 压缩数据、算法名称
- 返回: `Promise<string>`（通常再 JSON.parse）

### isCompressed(data)
- 入参: string
- 返回: boolean（基于魔术头 + 熵值估算）

### getCompressionStats(data)
- 返回压缩建议与潜在节省空间：
```ts
{
  originalSize: number
  potentialSavings: number
  recommendedAlgorithm: 'gzip' | 'deflate' | 'brotli' | 'none'
}
```

## 与缓存集成（装饰器）

```ts
import { withCompression } from '@ldesign/cache'
import { createCache } from '@ldesign/cache'

const cache = createCache()
const compressedCache = withCompression(cache, {
  algorithm: 'gzip',
  minSize: 1000,
})

// set 时自动压缩；get 时自动解压
await compressedCache.set('large', largeObject)
const obj = await compressedCache.get('large')
```

## 最佳实践
- 为 JSON 对象设置 minSize（例如 1KB），避免压小数据得不偿失
- 优先选择 gzip，兼容性更好；deflate 次之；brotli 回退（浏览器支持有限）
- network 传输与存储结合压缩效果更佳

