# 持久化指南

@ldesign/store 提供了强大的持久化功能，让你可以轻松地将状态保存到本地存储、会话存储或自定义存储中。

## 基础持久化

### 使用 @PersistentState 装饰器

```typescript
import { Action, BaseStore, PersistentState, State } from '@ldesign/store'

class SettingsStore extends BaseStore {
  // 自动持久化到 localStorage
  @PersistentState({ default: 'light' })
  theme: 'light' | 'dark' = 'light'

  @PersistentState({ default: 'zh-CN' })
  language: string = 'zh-CN'

  @PersistentState({ default: true })
  notifications: boolean = true

  // 普通状态，不会持久化
  @State({ default: false })
  loading: boolean = false

  @Action()
  setTheme(theme: 'light' | 'dark') {
    this.theme = theme // 自动保存到 localStorage
  }

  @Action()
  setLanguage(language: string) {
    this.language = language // 自动保存到 localStorage
  }

  @Action()
  toggleNotifications() {
    this.notifications = !this.notifications // 自动保存到 localStorage
  }
}

const settingsStore = new SettingsStore('settings')
```

### 使用 usePersist Hook

```vue
<script setup lang="ts">
import { usePersist } from '@ldesign/store/vue'
import { ref } from 'vue'
import { SettingsStore } from '@/stores/settings'

const settingsStore = new SettingsStore('settings')

// 使用持久化 Hook
const { save, load, clear, isPersisted } = usePersist('settings')

// 响应式引用
const theme = ref(settingsStore.theme)
const language = ref(settingsStore.language)

// 监听变化并自动保存
watch([theme, language], () => {
  settingsStore.setTheme(theme.value)
  settingsStore.setLanguage(language.value)
})
</script>

<template>
  <div class="settings">
    <h2>应用设置</h2>

    <div class="setting-item">
      <label>主题:</label>
      <select v-model="theme">
        <option value="light">浅色</option>
        <option value="dark">深色</option>
      </select>
    </div>

    <div class="setting-item">
      <label>语言:</label>
      <select v-model="language">
        <option value="zh-CN">中文</option>
        <option value="en-US">English</option>
      </select>
    </div>

    <div class="actions">
      <button @click="save">手动保存</button>
      <button @click="load">重新加载</button>
      <button @click="clear">清除设置</button>
    </div>

    <p v-if="isPersisted">✅ 设置已保存</p>
  </div>
</template>
```

## 高级持久化配置

### 自定义存储键和选项

```typescript
class UserPreferencesStore extends BaseStore {
  // 自定义存储键
  @PersistentState({
    default: {},
    key: 'user_preferences_v2', // 自定义键名
    storage: 'localStorage', // 指定存储类型
  })
  preferences: UserPreferences = {}

  // 使用会话存储
  @PersistentState({
    default: null,
    key: 'current_session',
    storage: 'sessionStorage',
  })
  currentSession: Session | null = null

  // 自定义序列化
  @PersistentState({
    default: new Date(),
    key: 'last_visit',
    serialize: (date: Date) => date.toISOString(),
    deserialize: (str: string) => new Date(str),
  })
  lastVisit: Date = new Date()
}
```

### 条件持久化

```typescript
class ConditionalPersistStore extends BaseStore {
  @State({ default: null })
  user: User | null = null

  @PersistentState({
    default: [],
    // 只有在用户登录时才持久化
    condition: () => this.user !== null,
  })
  userSpecificData: any[] = []

  @Action()
  setUser(user: User | null) {
    this.user = user

    // 如果用户登出，清除持久化数据
    if (!user) {
      this.clearUserData()
    }
  }

  @Action()
  clearUserData() {
    this.userSpecificData = []
    // 手动清除持久化存储
    localStorage.removeItem('userSpecificData')
  }
}
```

## 自定义存储适配器

### 创建存储适配器

```typescript
// storage/adapters.ts
export interface StorageAdapter {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
  clear: () => void
}

// IndexedDB 适配器
export class IndexedDBAdapter implements StorageAdapter {
  private dbName: string
  private storeName: string
  private db: IDBDatabase | null = null

  constructor(dbName = 'AppStorage', storeName = 'KeyValueStore') {
    this.dbName = dbName
    this.storeName = storeName
    this.init()
  }

  private async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName)
        }
      }
    })
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(value, key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async removeItem(key: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

// 内存适配器（用于测试）
export class MemoryAdapter implements StorageAdapter {
  private storage = new Map<string, string>()

  getItem(key: string): string | null {
    return this.storage.get(key) || null
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value)
  }

  removeItem(key: string): void {
    this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }
}

// 加密存储适配器
export class EncryptedStorageAdapter implements StorageAdapter {
  private baseAdapter: StorageAdapter
  private encryptionKey: string

  constructor(baseAdapter: StorageAdapter, encryptionKey: string) {
    this.baseAdapter = baseAdapter
    this.encryptionKey = encryptionKey
  }

  getItem(key: string): string | null {
    const encrypted = this.baseAdapter.getItem(key)
    if (!encrypted) return null

    try {
      return this.decrypt(encrypted)
    } catch (error) {
      console.error('解密失败:', error)
      return null
    }
  }

  setItem(key: string, value: string): void {
    const encrypted = this.encrypt(value)
    this.baseAdapter.setItem(key, encrypted)
  }

  removeItem(key: string): void {
    this.baseAdapter.removeItem(key)
  }

  clear(): void {
    this.baseAdapter.clear()
  }

  private encrypt(text: string): string {
    // 简单的加密实现（实际应用中应使用更安全的加密算法）
    return btoa(text + this.encryptionKey)
  }

  private decrypt(encrypted: string): string {
    // 简单的解密实现
    const decoded = atob(encrypted)
    return decoded.replace(this.encryptionKey, '')
  }
}
```

### 使用自定义适配器

```typescript
import { EncryptedStorageAdapter, IndexedDBAdapter } from '@/storage/adapters'

class AdvancedPersistStore extends BaseStore {
  private indexedDBAdapter = new IndexedDBAdapter()
  private encryptedAdapter = new EncryptedStorageAdapter(localStorage, 'my-secret-key')

  // 使用 IndexedDB 存储大量数据
  @PersistentState({
    default: [],
    adapter: this.indexedDBAdapter,
  })
  largeDataset: any[] = []

  // 使用加密存储敏感数据
  @PersistentState({
    default: null,
    adapter: this.encryptedAdapter,
  })
  sensitiveData: SensitiveData | null = null

  @Action()
  async addLargeData(data: any) {
    this.largeDataset.push(data)
    // 数据会自动保存到 IndexedDB
  }

  @Action()
  setSensitiveData(data: SensitiveData) {
    this.sensitiveData = data
    // 数据会被加密后保存到 localStorage
  }
}
```

## 数据迁移

### 版本化持久化

```typescript
interface MigrationConfig {
  version: number
  migrate: (oldData: any) => any
}

class VersionedPersistStore extends BaseStore {
  private static CURRENT_VERSION = 3
  private static MIGRATIONS: MigrationConfig[] = [
    {
      version: 2,
      migrate: oldData => ({
        ...oldData,
        newField: 'default value',
      }),
    },
    {
      version: 3,
      migrate: oldData => ({
        ...oldData,
        settings: {
          ...oldData.settings,
          theme: oldData.theme || 'light',
        },
      }),
    },
  ]

  @PersistentState({
    default: { version: VersionedPersistStore.CURRENT_VERSION },
    key: 'app_data',
    beforeLoad: this.migrateData.bind(this),
  })
  appData: AppData = { version: VersionedPersistStore.CURRENT_VERSION }

  private migrateData(rawData: string): string {
    try {
      let data = JSON.parse(rawData)
      const currentVersion = data.version || 1

      if (currentVersion < VersionedPersistStore.CURRENT_VERSION) {
        console.log(`迁移数据从版本 ${currentVersion} 到 ${VersionedPersistStore.CURRENT_VERSION}`)

        // 应用所有需要的迁移
        for (const migration of VersionedPersistStore.MIGRATIONS) {
          if (migration.version > currentVersion) {
            data = migration.migrate(data)
            data.version = migration.version
          }
        }
      }

      return JSON.stringify(data)
    } catch (error) {
      console.error('数据迁移失败:', error)
      return rawData
    }
  }
}
```

### 数据备份和恢复

```typescript
class BackupRestoreStore extends BaseStore {
  @PersistentState({ default: {} })
  userData: UserData = {}

  @Action()
  exportData(): string {
    const exportData = {
      version: 1,
      timestamp: new Date().toISOString(),
      data: {
        userData: this.userData,
        // 其他需要导出的数据
      },
    }

    return JSON.stringify(exportData, null, 2)
  }

  @Action()
  importData(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData)

      // 验证数据格式
      if (!this.validateImportData(importData)) {
        throw new Error('无效的数据格式')
      }

      // 备份当前数据
      this.createBackup()

      // 导入新数据
      this.userData = importData.data.userData

      console.log('数据导入成功')
      return true
    } catch (error) {
      console.error('数据导入失败:', error)
      return false
    }
  }

  @Action()
  createBackup(): string {
    const backupKey = `backup_${Date.now()}`
    const backupData = this.exportData()

    localStorage.setItem(backupKey, backupData)

    // 清理旧备份（只保留最近5个）
    this.cleanupOldBackups()

    return backupKey
  }

  @Action()
  restoreFromBackup(backupKey: string): boolean {
    const backupData = localStorage.getItem(backupKey)
    if (!backupData) {
      console.error('备份不存在')
      return false
    }

    return this.importData(backupData)
  }

  @Action()
  getAvailableBackups(): string[] {
    const backups: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('backup_')) {
        backups.push(key)
      }
    }

    return backups.sort().reverse() // 最新的在前
  }

  private validateImportData(data: any): boolean {
    return (
      data &&
      typeof data.version === 'number' &&
      typeof data.timestamp === 'string' &&
      data.data &&
      typeof data.data === 'object'
    )
  }

  private cleanupOldBackups(): void {
    const backups = this.getAvailableBackups()

    // 只保留最近5个备份
    if (backups.length > 5) {
      const toDelete = backups.slice(5)
      toDelete.forEach(key => localStorage.removeItem(key))
    }
  }
}
```

## 性能优化

### 延迟持久化

```typescript
class OptimizedPersistStore extends BaseStore {
  private persistTimer: NodeJS.Timeout | null = null
  private pendingChanges = new Set<string>()

  @PersistentState({
    default: {},
    lazy: true, // 延迟持久化
    debounce: 1000, // 1秒后保存
  })
  frequentlyChangedData: any = {}

  @Action()
  updateData(key: string, value: any) {
    this.frequentlyChangedData[key] = value
    this.schedulePersist(key)
  }

  private schedulePersist(key: string) {
    this.pendingChanges.add(key)

    if (this.persistTimer) {
      clearTimeout(this.persistTimer)
    }

    this.persistTimer = setTimeout(() => {
      this.persistChanges()
    }, 1000)
  }

  private persistChanges() {
    if (this.pendingChanges.size > 0) {
      // 只持久化有变化的数据
      const changedData = {}
      this.pendingChanges.forEach(key => {
        changedData[key] = this.frequentlyChangedData[key]
      })

      // 执行持久化
      this.saveToPersistentStorage(changedData)

      this.pendingChanges.clear()
      this.persistTimer = null
    }
  }

  private saveToPersistentStorage(data: any) {
    // 实际的持久化逻辑
    const existing = JSON.parse(localStorage.getItem('frequentlyChangedData') || '{}')
    const merged = { ...existing, ...data }
    localStorage.setItem('frequentlyChangedData', JSON.stringify(merged))
  }
}
```

### 压缩存储

```typescript
// 使用 LZ-string 进行压缩
import LZString from 'lz-string'

class CompressedPersistStore extends BaseStore {
  @PersistentState({
    default: [],
    compress: true,
    serialize: data => LZString.compress(JSON.stringify(data)),
    deserialize: compressed => {
      const decompressed = LZString.decompress(compressed)
      return decompressed ? JSON.parse(decompressed) : null
    },
  })
  largeDataArray: any[] = []

  @Action()
  addLargeData(data: any) {
    this.largeDataArray.push(data)
    // 数据会被压缩后保存
  }
}
```

## 最佳实践

### 1. 选择合适的存储方式

```typescript
// ✅ 根据数据特性选择存储方式
class WellDesignedStore extends BaseStore {
  // 用户偏好 - localStorage (持久)
  @PersistentState({ storage: 'localStorage' })
  userPreferences: UserPreferences = {}

  // 会话数据 - sessionStorage (临时)
  @PersistentState({ storage: 'sessionStorage' })
  sessionData: SessionData = {}

  // 敏感数据 - 加密存储
  @PersistentState({ adapter: encryptedAdapter })
  sensitiveInfo: SensitiveInfo = {}

  // 大量数据 - IndexedDB
  @PersistentState({ adapter: indexedDBAdapter })
  bulkData: BulkData[] = []
}
```

### 2. 数据结构设计

```typescript
// ✅ 扁平化的数据结构
class FlatDataStore extends BaseStore {
  @PersistentState({ default: {} })
  userById: Record<string, User> = {}

  @PersistentState({ default: [] })
  userIds: string[] = []
}

// ❌ 深度嵌套的数据结构
class NestedDataStore extends BaseStore {
  @PersistentState({ default: {} })
  complexNestedData: {
    users: {
      [id: string]: {
        profile: {
          personal: {
            details: any
          }
        }
      }
    }
  } = {}
}
```

### 3. 错误处理

```typescript
class RobustPersistStore extends BaseStore {
  @PersistentState({
    default: {},
    onError: (error, key) => {
      console.error(`持久化失败 [${key}]:`, error)
      // 发送错误报告
      errorReporting.report(error)
    },
    fallback: key => {
      // 提供降级方案
      return this.getDefaultValue(key)
    },
  })
  criticalData: any = {}

  private getDefaultValue(key: string): any {
    // 返回默认值的逻辑
    return {}
  }
}
```

## 下一步

- 学习 [性能优化](/guide/performance) 提升应用性能
- 查看 [最佳实践](/guide/best-practices) 编写更好的代码
- 探索 [API 参考](/api/) 了解详细接口
