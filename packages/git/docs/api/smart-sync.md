# SmartSync API

本页介绍智能同步（SmartSync）的编程接口。

## 导入

```ts path=null start=null
import { Git } from '@ldesign/git'

const git = Git.create(process.cwd())
```

> 也可直接使用底层类：

```ts path=null start=null
import { SmartSync } from '@ldesign/git'
```

## 类型

```ts path=null start=null
export interface SmartSyncOptions {
  remote?: string                // 远程仓库名（默认 origin）
  branch?: string                // 当前分支（默认 HEAD）
  autoResolveConflicts?: boolean // 是否自动解决冲突
  conflictStrategy?: 'ours' | 'theirs' | 'manual'
  showProgress?: boolean         // 是否显示进度
  confirmBeforeAction?: boolean  // 执行前确认
  protectedBranches?: string[]   // 保护分支列表
  includeUntracked?: boolean     // 是否包含未跟踪文件到 stash
}

export interface SmartSyncResult {
  success: boolean
  message: string
  steps: string[]
  conflicts?: {
    resolved: boolean
    conflictFiles: string[]
    unresolvedFiles?: string[]
  }
  stashCreated?: boolean
  stashId?: string
  rollbackAvailable?: boolean
  error?: string
}
```

## CLI 与 API 映射

- 智能同步提交（API: `git.syncCommit`）
  ```bash
  ldesign-git sync-commit "feat: add feature" [file1 file2 ...] \
    [--auto-resolve] [--ours|--theirs] [--no-confirm]
  ```

- 回滚（API: `git.rollbackSync`）
  ```bash
  ldesign-git rollback [stashId]
  ```

- 冲突解决（与 `ConflictResolver` 辅助）
  ```bash
  ldesign-git resolve --ours|--theirs|--manual
  ```

## 方法

### git.syncCommit(message, files?, options?)

执行完整的“安全同步并提交”流程：

1. 安全检查与保护分支校验
2. 若有本地改动则 stash（可配置是否包含未跟踪）
3. 执行 pull
4. pop 恢复本地更改，如有冲突可自动/手动处理
5. add & commit
6. push 到远程

```ts path=null start=null
const result = await git.syncCommit('feat: add function', ['src/index.ts'], {
  showProgress: true,
  autoResolveConflicts: true,
  conflictStrategy: 'theirs'
})

if (!result.success) {
  console.error(result.message)
  if (result.rollbackAvailable) {
    // 需要的话回滚
  }
}
```

### git.rollbackSync(stashId?)

在上一次 syncCommit 创建过 stash 时用于回滚：

```ts path=null start=null
const rollback = await git.rollbackSync()
if (rollback.success) {
  console.log('已回滚')
}
```

## 常见问题

- 遇到冲突时建议先尝试 `autoResolveConflicts` 搭配 `ours`/`theirs`，不满足预期时回退到 `manual` 模式人工处理。
- CI 环境建议关闭 confirmBeforeAction，并根据需要关闭 showProgress 以减少日志噪声。

