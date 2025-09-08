# GitStatus API

用于查询仓库状态、日志、差异与统计。

## 导入

```ts
import { Git } from '@ldesign/git'

const git = Git.create(process.cwd())
```

## 方法

### getStatus()
返回当前工作区状态。

```ts
const res = await git.status.getStatus()
if (res.success && res.data) {
  console.log('当前分支:', res.data.current)
  console.log('暂存文件:', res.data.staged)
}
```

返回类型：`Promise&lt;GitOperationResult&lt;GitStatusInfo&gt;&gt;`

### getLog(options?)
获取提交日志，支持筛选。

可用筛选（GitLogOptions）:
- maxCount?: number
- from?: string
- to?: string
- file?: string
- author?: string
- since?: string
- until?: string
- merges?: boolean
- grep?: string
- reverse?: boolean
- oneline?: boolean

```ts
const res = await git.status.getLog({ maxCount: 10, author: 'alice' })
if (res.success && res.data) {
  res.data.forEach(c => {
    console.log(`${c.hash.slice(0,7)} ${c.author_name}: ${c.message}`)
  })
}
```

返回类型：`Promise&lt;GitOperationResult&lt;GitCommitInfo[]&gt;&gt;`

### getDiff(file?, cached?)
获取差异（可选文件与暂存区）。

```ts
// 暂存区差异
const diff = await git.status.getDiff(undefined, true)

// 指定文件差异
const fileDiff = await git.status.getDiff('src/index.ts')
```

返回类型：`Promise&lt;GitOperationResult&lt;string&gt;&gt;`

### getDiffBetweenCommits(from, to, file?)
获取两个提交之间的差异（可选仅针对单个文件）。

```ts
const diff = await git.status.getDiffBetweenCommits('abc123', 'def456')
```

返回类型：`Promise&lt;GitOperationResult&lt;string&gt;&gt;`

### show(commitHash)
显示单个提交详情（底层等同于 `git show &lt;hash&gt;`）。

```ts
const res = await git.status.show('abc123')
console.log(res.data)
```

返回类型：`Promise&lt;GitOperationResult&lt;string&gt;&gt;`

### getFileHistory(filePath, maxCount?)
获取某个文件的提交历史。

```ts
const res = await git.status.getFileHistory('src/index.ts', 20)
if (res.success && res.data) {
  res.data.forEach(c => console.log(c.hash, c.message))
}
```

返回类型：`Promise&lt;GitOperationResult&lt;GitCommitInfo[]&gt;&gt;`

### getStats(fromCommit?, toCommit?)
以结构化数据返回增删统计（使用 `git diff --numstat` 解析）。

```ts
const res = await git.status.getStats('abc123', 'def456')
if (res.success && res.data) {
  console.log('汇总:', res.data.summary)
  for (const f of res.data.files) {
    console.log(`${f.file}: +${f.additions} -${f.deletions}`)
  }
}
```

返回类型：`Promise&lt;GitOperationResult&lt;GitStatsResult&gt;&gt;`

```ts
interface GitStatsFile {
  file: string
  additions: number
  deletions: number
}

interface GitStatsSummary {
  filesChanged: number
  insertions: number
  deletions: number
}

interface GitStatsResult {
  fromCommit?: string
  toCommit?: string
  files: GitStatsFile[]
  summary: GitStatsSummary
  raw?: string  // 原始 numstat 文本，便于调试
}
```

## 事件（与 GitStatus 相关）

GitStatus 会触发以下事件（payload 已类型化）。

```ts
// 事件 payload 结构
'status': { success?: boolean; status?: GitStatusInfo }
'log': { success?: boolean; commits?: GitCommitInfo[]; options?: GitLogOptions; file?: string; maxCount?: number }
'diff': { success?: boolean; file?: string; cached?: boolean; diff?: string; fromCommit?: string; toCommit?: string }
'show': { success?: boolean; commitHash?: string; content?: string }
'error': { operation: string; error: unknown }
// 监听状态
(git.status as any).on('status', (event: 'status', data) => {
  console.log('状态事件:', data?.status?.current)
})

// 监听日志结果
(git.status as any).on('log', (event: 'log', data) => {
  console.log('日志事件, 条数:', data?.commits?.length)
})

// 监听差异
(git.status as any).on('diff', (event: 'diff', data) => {
  console.log('差异事件, 文件:', data?.file)
})

// 监听错误
(git.status as any).on('error', (event: 'error', data) => {
  console.error('状态子系统错误:', data?.error)
})
```

