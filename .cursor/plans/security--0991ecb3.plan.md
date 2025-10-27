<!-- 0991ecb3-1d09-465b-89d4-47fb3410ed68 99946759-1269-40a6-b84f-d7d8ad85c9c5 -->
# Security 包全面优化和改进计划

## 📋 代码审查总结

经过逐行分析，该安全包整体架构良好，功能完整，但存在以下优化空间：

### ✅ 优点

- 模块化设计清晰，职责分明
- TypeScript 类型定义完善
- 功能丰富（漏洞检测、敏感信息扫描、注入检测等）
- CLI 工具完善，用户体验良好
- 支持多种报告格式

### ⚠️ 需要优化的方面

1. **代码注释不够完整** - 缺少 JSDoc 注释
2. **错误处理不一致** - 有些地方使用 try-catch，有些直接返回空数组
3. **性能优化空间** - 部分扫描可以更好地并行化
4. **测试覆盖不足** - 只有 3 个测试文件
5. **类型安全可增强** - 存在 `any` 类型使用
6. **缺少输入验证** - 对用户输入验证不够严格
7. **日志系统可增强** - 日志级别控制不够灵活
8. **缺少性能监控** - 没有详细的性能指标
9. **配置验证不完整** - 策略配置验证逻辑简单

---

## 🎯 优化实施计划

### 阶段一：代码质量提升（重要性：⭐⭐⭐⭐⭐）

#### 1.1 完善 JSDoc 注释

**文件：** 所有 `.ts` 文件

**问题：**

- 大部分函数缺少详细的 JSDoc 注释
- 参数说明不完整
- 返回值说明缺失
- 缺少使用示例

**改进方案：**

````typescript
// 当前（src/core/vulnerability-checker.ts）
async check(): Promise<Vulnerability[]> {
  // ...
}

// 改进后
/**
 * 检查项目依赖中的安全漏洞
 * 
 * 该方法会并行执行多个漏洞源的检查：
 * - NPM Audit：检查 npm 注册表中已知的漏洞
 * - OSV：查询 Open Source Vulnerabilities 数据库
 * 
 * @returns {Promise<Vulnerability[]>} 去重后的漏洞列表
 * @throws {ScanError} 当扫描过程发生不可恢复的错误时
 * 
 * @example
 * ```typescript
 * const checker = new VulnerabilityChecker('./my-project')
 * const vulnerabilities = await checker.check()
 * console.log(`Found ${vulnerabilities.length} vulnerabilities`)
 * ```
 */
async check(): Promise<Vulnerability[]> {
  // ...
}
````

**影响文件：**

- `src/core/*.ts` (16 个文件)
- `src/reporters/*.ts` (7 个文件)
- `src/utils/*.ts`
- `src/cli/*.ts`

#### 1.2 统一错误处理机制

**文件：** 所有核心模块

**问题：**

- 有些方法使用 `try-catch` 返回空数组
- 有些方法直接抛出异常
- 缺少统一的错误处理策略
- 未充分利用自定义错误类

**改进方案：**

```typescript
// 当前（src/core/secret-scanner.ts）
async scan(patterns?: string[]): Promise<SecretMatch[]> {
  try {
    // ...
  } catch (error) {
    console.warn('敏感信息扫描失败:', error)
    return []
  }
}

// 改进后
async scan(patterns?: string[]): Promise<SecretMatch[]> {
  try {
    // ...
  } catch (error) {
    this.logger.error('敏感信息扫描失败', error as Error)
    
    if (error instanceof FileSystemError) {
      throw error // 文件系统错误应该抛出
    }
    
    if (this.options.strictMode) {
      throw new ScanError('Secret scan failed', { 
        originalError: error,
        patterns 
      })
    }
    
    // 非严格模式下返回空数组
    return []
  }
}
```

**新增配置：**

```typescript
// types/index.ts
export interface ScanOptions {
  // 现有选项...
  strictMode?: boolean // 严格模式：遇到错误抛出异常而不是静默失败
  logger?: Logger      // 自定义日志器
  errorHandler?: (error: Error) => void // 自定义错误处理器
}
```

#### 1.3 消除 `any` 类型使用

**文件：** 多个核心文件

**问题：**

```typescript
// src/core/security-scanner.ts:47
const scanTasks: Promise<any>[] = []

// src/core/license-checker.ts:46
for (const [name, data] of Object.entries(auditResult.vulnerabilities as Record<string, any>))
```

**改进方案：**

```typescript
// 定义更精确的类型
type ScanTask = 
  | Promise<Vulnerability[]>
  | Promise<CodeIssue[]>
  | Promise<DependencyIssue[]>
  | Promise<SecretMatch[]>
  | Promise<InjectionIssue[]>
  | Promise<LicenseCheckResult>
  | Promise<SupplyChainIssue[]>

const scanTasks: ScanTask[] = []

// NPM Audit 结果类型
interface NpmAuditVulnerability {
  severity: string
  via: Array<{
    title?: string
    description?: string
    url?: string
    cve?: string
    cvss?: { score: number }
  }> | {
    title?: string
    description?: string
    url?: string
    cve?: string
    cvss?: { score: number }
  }
  fixAvailable: boolean | { version: string }
}

interface NpmAuditResult {
  vulnerabilities: Record<string, NpmAuditVulnerability>
}
```

#### 1.4 增强输入验证

**文件：** 所有接受外部输入的模块

**改进方案：**

```typescript
// 新建 src/utils/validation.ts
import { ValidationError } from '../errors/SecurityError'

export class Validator {
  /**
   * 验证项目目录
   */
  static async validateProjectDir(dir: string): Promise<void> {
    if (!dir || typeof dir !== 'string') {
      throw new ValidationError('Project directory must be a non-empty string')
    }

    const exists = await fs.pathExists(dir)
    if (!exists) {
      throw new ValidationError(`Project directory does not exist: ${dir}`)
    }

    const stats = await fs.stat(dir)
    if (!stats.isDirectory()) {
      throw new ValidationError(`Path is not a directory: ${dir}`)
    }

    // 检查是否有 package.json
    const packageJsonPath = path.join(dir, 'package.json')
    const hasPackageJson = await fs.pathExists(packageJsonPath)
    if (!hasPackageJson) {
      throw new ValidationError(`No package.json found in: ${dir}`)
    }
  }

  /**
   * 验证严重程度
   */
  static validateSeverity(severity: string): asserts severity is Severity {
    const validSeverities = ['critical', 'high', 'medium', 'low']
    if (!validSeverities.includes(severity)) {
      throw new ValidationError(
        `Invalid severity: ${severity}. Must be one of: ${validSeverities.join(', ')}`
      )
    }
  }

  /**
   * 验证报告格式
   */
  static validateReportFormat(format: string): asserts format is ReportFormat {
    const validFormats = ['html', 'json', 'yaml', 'sarif', 'pdf', 'markdown', 'excel']
    if (!validFormats.includes(format)) {
      throw new ValidationError(
        `Invalid report format: ${format}. Must be one of: ${validFormats.join(', ')}`
      )
    }
  }

  /**
   * 验证 cron 表达式
   */
  static validateCronExpression(cron: string): void {
    // 简单的 cron 表达式验证
    const parts = cron.split(' ')
    if (parts.length !== 5 && parts.length !== 6) {
      throw new ValidationError(
        `Invalid cron expression: ${cron}. Must have 5 or 6 parts.`
      )
    }
  }
}

// 在构造函数中使用
export class SecurityScanner {
  constructor(private options: ScanOptions = {}) {
    const projectDir = options.projectDir || process.cwd()
    
    // 添加验证
    Validator.validateProjectDir(projectDir).catch(error => {
      throw new ValidationError('Invalid project directory', { 
        dir: projectDir,
        error 
      })
    })
    
    if (options.severity) {
      Validator.validateSeverity(options.severity)
    }
    
    if (options.failOn) {
      Validator.validateSeverity(options.failOn)
    }
    
    // 现有初始化代码...
  }
}
```

---

### 阶段二：性能优化（重要性：⭐⭐⭐⭐）

#### 2.1 优化并行扫描策略

**文件：** `src/core/security-scanner.ts`

**问题：**

- 所有扫描任务使用简单的 `Promise.all`
- 没有并发限制，可能导致资源耗尽
- 大文件扫描时内存占用高

**改进方案：**

```typescript
// 新建 src/utils/parallel.ts
export class ParallelExecutor {
  /**
   * 并发限制的 Promise.all
   */
  static async allWithLimit<T>(
    tasks: Array<() => Promise<T>>,
    limit: number = 5
  ): Promise<T[]> {
    const results: T[] = []
    const executing: Promise<void>[] = []

    for (const task of tasks) {
      const promise = task().then(result => {
        results.push(result)
        const index = executing.indexOf(promise)
        if (index !== -1) executing.splice(index, 1)
      })

      executing.push(promise)

      if (executing.length >= limit) {
        await Promise.race(executing)
      }
    }

    await Promise.all(executing)
    return results
  }

  /**
   * 分批执行任务
   */
  static async batch<T, R>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const results: R[] = []

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const batchResults = await processor(batch)
      results.push(...batchResults)
    }

    return results
  }
}

// 在 SecurityScanner 中使用
async scan(): Promise<SecurityScanResult> {
  const startTime = Date.now()
  
  // 使用并发限制
  const scanTasksCreators = []
  
  if (!this.options.skipVulnerabilities) {
    scanTasksCreators.push(() => this.vulnerabilityChecker.check())
  }
  // ... 其他任务
  
  // 限制并发数为 3（可配置）
  const results = await ParallelExecutor.allWithLimit(
    scanTasksCreators,
    this.options.maxConcurrency || 3
  )
  
  // ... 处理结果
}
```

#### 2.2 增强缓存策略

**文件：** `src/core/cache-manager.ts`

**改进方案：**

```typescript
export class CacheManager {
  // 现有代码...
  
  /**
   * 批量获取缓存
   */
  async getMany<T>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>()
    
    await Promise.all(
      keys.map(async key => {
        const value = await this.get<T>(key)
        results.set(key, value)
      })
    )
    
    return results
  }
  
  /**
   * 批量设置缓存
   */
  async setMany<T>(entries: Array<{ key: string; value: T; metadata?: { hash?: string } }>): Promise<void> {
    await Promise.all(
      entries.map(({ key, value, metadata }) => 
        this.set(key, value, metadata)
      )
    )
  }
  
  /**
   * 预热缓存
   */
  async warmup(projectDir: string): Promise<void> {
    // 预加载常用的缓存项
    const packageJsonPath = path.join(projectDir, 'package.json')
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJSON(packageJsonPath)
      const depsKey = this.getDependencyCacheKey(packageJson.dependencies || {})
      // 预加载依赖信息
    }
  }
  
  /**
   * 压缩存储大型数据
   */
  private async saveToDisk<T>(item: CacheItem<T>): Promise<void> {
    try {
      await fs.ensureDir(this.cacheDir)
      const filename = this.generateHash(item.key)
      const filePath = path.join(this.cacheDir, `${filename}.json`)
      
      const data = JSON.stringify(item)
      
      // 如果数据大于 1MB，使用压缩
      if (data.length > 1024 * 1024) {
        const compressed = await this.compress(data)
        await fs.writeFile(filePath + '.gz', compressed)
      } else {
        await fs.writeJSON(filePath, item)
      }
    } catch (error) {
      this.logger.warn('Failed to save cache to disk', error)
    }
  }
  
  /**
   * 压缩数据
   */
  private async compress(data: string): Promise<Buffer> {
    const zlib = await import('zlib')
    return new Promise((resolve, reject) => {
      zlib.gzip(data, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })
  }
}
```

#### 2.3 流式处理大文件

**文件：** `src/core/secret-scanner.ts`, `src/core/injection-detector.ts`

**改进方案：**

```typescript
// src/core/secret-scanner.ts
import { createReadStream } from 'fs'
import { createInterface } from 'readline'

export class SecretScanner {
  /**
   * 使用流式处理扫描大文件
   */
  private async scanFileStream(filePath: string): Promise<SecretMatch[]> {
    const secrets: SecretMatch[] = []
    const fileStream = createReadStream(filePath)
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    let lineNumber = 0

    for await (const line of rl) {
      lineNumber++
      
      for (const pattern of this.patterns) {
        const matches = line.matchAll(pattern.regex)
        
        for (const match of matches) {
          if (this.isLikelyFalsePositive(line, filePath)) {
            continue
          }
          
          const column = match.index || 0
          const matched = this.maskSecret(match[0])
          
          secrets.push({
            file: path.relative(this.projectDir, filePath),
            line: lineNumber,
            column: column + 1,
            type: pattern.type,
            matched,
            pattern: pattern.name,
            severity: pattern.severity,
            suggestion: this.getSuggestion(pattern.type)
          })
        }
      }
    }
    
    return secrets
  }
  
  /**
   * 自适应选择扫描方式
   */
  private async scanFile(filePath: string): Promise<SecretMatch[]> {
    const stats = await fs.stat(filePath)
    const fileSizeInMB = stats.size / (1024 * 1024)
    
    // 大于 5MB 的文件使用流式处理
    if (fileSizeInMB > 5) {
      this.logger.debug(`Using stream processing for large file: ${filePath}`)
      return this.scanFileStream(filePath)
    } else {
      return this.scanFileInMemory(filePath)
    }
  }
  
  private async scanFileInMemory(filePath: string): Promise<SecretMatch[]> {
    // 现有的实现
  }
}
```

#### 2.4 添加性能监控

**文件：** 新建 `src/utils/performance.ts`

**改进方案：**

```typescript
export interface PerformanceMetrics {
  operation: string
  duration: number
  timestamp: string
  metadata?: Record<string, any>
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private timers = new Map<string, number>()
  
  /**
   * 开始计时
   */
  start(operation: string): void {
    this.timers.set(operation, Date.now())
  }
  
  /**
   * 结束计时并记录
   */
  end(operation: string, metadata?: Record<string, any>): number {
    const startTime = this.timers.get(operation)
    if (!startTime) {
      throw new Error(`No timer found for operation: ${operation}`)
    }
    
    const duration = Date.now() - startTime
    this.timers.delete(operation)
    
    this.metrics.push({
      operation,
      duration,
      timestamp: new Date().toISOString(),
      metadata
    })
    
    return duration
  }
  
  /**
   * 获取性能报告
   */
  getReport(): {
    total: number
    operations: Array<PerformanceMetrics>
    summary: Record<string, { count: number; avgDuration: number; totalDuration: number }>
  } {
    const summary: Record<string, { count: number; avgDuration: number; totalDuration: number }> = {}
    
    for (const metric of this.metrics) {
      if (!summary[metric.operation]) {
        summary[metric.operation] = {
          count: 0,
          avgDuration: 0,
          totalDuration: 0
        }
      }
      
      const s = summary[metric.operation]
      s.count++
      s.totalDuration += metric.duration
      s.avgDuration = s.totalDuration / s.count
    }
    
    return {
      total: this.metrics.reduce((sum, m) => sum + m.duration, 0),
      operations: this.metrics,
      summary
    }
  }
  
  /**
   * 清除指标
   */
  clear(): void {
    this.metrics = []
    this.timers.clear()
  }
  
  /**
   * 导出性能数据
   */
  async export(outputPath: string): Promise<void> {
    const report = this.getReport()
    await fs.writeJSON(outputPath, report, { spaces: 2 })
  }
}

// 在 SecurityScanner 中集成
export class SecurityScanner {
  private perfMonitor = new PerformanceMonitor()
  
  async scan(): Promise<SecurityScanResult> {
    this.perfMonitor.start('total_scan')
    
    // 各个扫描任务
    this.perfMonitor.start('vulnerability_check')
    const vulnerabilities = await this.vulnerabilityChecker.check()
    this.perfMonitor.end('vulnerability_check', { 
      count: vulnerabilities.length 
    })
    
    // ... 其他扫描
    
    const duration = this.perfMonitor.end('total_scan')
    
    // 如果启用了性能报告
    if (this.options.enablePerformanceReport) {
      await this.perfMonitor.export(
        path.join(this.options.projectDir!, '.security-perf.json')
      )
    }
    
    return {
      // ... 现有结果
      performance: this.perfMonitor.getReport()
    }
  }
}
```

---

### 阶段三：测试覆盖增强（重要性：⭐⭐⭐⭐⭐）

#### 3.1 增加单元测试

**目标：** 从当前 3 个测试文件增加到覆盖所有核心模块

**新增测试文件：**

```
tests/
  core/
    security-scanner.test.ts       ✅ 新增
    vulnerability-checker.test.ts  ✅ 已有
    secret-scanner.test.ts         ✅ 已有
    injection-detector.test.ts     ✅ 新增
    license-checker.test.ts        ✅ 已有
    supply-chain-analyzer.test.ts  ✅ 新增
    sbom-generator.test.ts         ✅ 新增
    cache-manager.test.ts          ✅ 新增
    policy-manager.test.ts         ✅ 新增
  reporters/
    html-reporter.test.ts          ✅ 已有
    json-reporter.test.ts          ✅ 新增
    sarif-reporter.test.ts         ✅ 新增
  utils/
    logger.test.ts                 ✅ 新增
    validation.test.ts             ✅ 新增
    performance.test.ts            ✅ 新增
  errors/
    SecurityError.test.ts          ✅ 新增
  integration/
    full-scan.test.ts              ✅ 新增
    cli.test.ts                    ✅ 新增
```

**示例测试：**

```typescript
// tests/core/security-scanner.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SecurityScanner } from '@/core/security-scanner'
import { ScanError } from '@/errors/SecurityError'
import fs from 'fs-extra'

describe('SecurityScanner', () => {
  let scanner: SecurityScanner
  const testProjectDir = './tests/fixtures/test-project'
  
  beforeEach(async () => {
    // 创建测试项目结构
    await fs.ensureDir(testProjectDir)
    await fs.writeJSON(`${testProjectDir}/package.json`, {
      name: 'test-project',
      dependencies: { lodash: '4.17.0' }
    })
    
    scanner = new SecurityScanner({ projectDir: testProjectDir })
  })
  
  afterEach(async () => {
    await fs.remove(testProjectDir)
  })
  
  describe('scan()', () => {
    it('should complete a full scan successfully', async () => {
      const result = await scanner.scan()
      
      expect(result).toBeDefined()
      expect(result.summary).toBeDefined()
      expect(result.riskLevel).toMatch(/^(critical|high|medium|low|none)$/)
      expect(result.timestamp).toBeDefined()
      expect(result.duration).toBeGreaterThan(0)
    })
    
    it('should skip vulnerability scan when option is set', async () => {
      scanner = new SecurityScanner({
        projectDir: testProjectDir,
        skipVulnerabilities: true
      })
      
      const result = await scanner.scan()
      expect(result.vulnerabilities).toHaveLength(0)
    })
    
    it('should calculate correct risk level', async () => {
      // Mock vulnerabilities
      vi.spyOn(scanner.getVulnerabilityChecker(), 'check')
        .mockResolvedValue([{
          package: 'test-pkg',
          severity: 'critical',
          title: 'Test vulnerability',
          description: 'Test',
          recommendation: 'Update',
          url: 'http://test.com',
          source: 'npm'
        }])
      
      const result = await scanner.scan()
      expect(result.riskLevel).toBe('critical')
    })
    
    it('should handle scan errors gracefully', async () => {
      vi.spyOn(scanner.getVulnerabilityChecker(), 'check')
        .mockRejectedValue(new Error('Network error'))
      
      await expect(scanner.scan()).rejects.toThrow()
    })
  })
  
  describe('calculateRiskLevel()', () => {
    it('should return critical for 1+ critical issues', () => {
      const issues = [
        { severity: 'critical' },
        { severity: 'low' }
      ]
      // 通过反射或导出私有方法进行测试
    })
  })
})
```

#### 3.2 增加集成测试

```typescript
// tests/integration/full-scan.test.ts
import { describe, it, expect } from 'vitest'
import { SecurityScanner } from '@/core/security-scanner'
import { HTMLReporter, JSONReporter } from '@/reporters'
import fs from 'fs-extra'
import path from 'path'

describe('Full Security Scan Integration', () => {
  const fixtureDir = path.join(__dirname, '../fixtures/real-project')
  
  it('should scan a real project and generate reports', async () => {
    // 使用真实的小型项目进行测试
    const scanner = new SecurityScanner({ projectDir: fixtureDir })
    const result = await scanner.scan()
    
    // 验证扫描结果
    expect(result.vulnerabilities).toBeDefined()
    expect(result.codeIssues).toBeDefined()
    expect(result.summary.totalIssues).toBeGreaterThanOrEqual(0)
    
    // 生成 HTML 报告
    const htmlReporter = new HTMLReporter(result)
    const htmlPath = path.join(fixtureDir, 'test-report.html')
    await htmlReporter.save(htmlPath)
    
    expect(await fs.pathExists(htmlPath)).toBe(true)
    const htmlContent = await fs.readFile(htmlPath, 'utf-8')
    expect(htmlContent).toContain('Security Scan Report')
    
    // 清理
    await fs.remove(htmlPath)
  }, 30000) // 延长超时时间
})
```

#### 3.3 提高测试覆盖率目标

```typescript
// vitest.config.ts - 更新覆盖率阈值
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 85,      // 从 80 提升到 85
        functions: 85,  // 从 80 提升到 85
        branches: 80,   // 保持 80
        statements: 85  // 从 80 提升到 85
      },
      // 添加更详细的报告
      reporter: ['text', 'json', 'html', 'lcov', 'text-summary'],
      // 排除测试辅助文件
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types/**',
        'tests/fixtures/**',
        'vitest.config.ts',
        'tsup.config.ts'
      ]
    }
  }
})
```

---

### 阶段四：功能增强（重要性：⭐⭐⭐⭐）

#### 4.1 增加漏洞数据库支持

**新增功能：** 支持更多漏洞数据源

**文件：** `src/core/vulnerability-checker.ts`

**改进方案：**

```typescript
export class VulnerabilityChecker {
  /**
   * 查询 GitHub Advisory Database
   */
  private async runGitHubAdvisoryCheck(): Promise<Vulnerability[]> {
    try {
      const vulnerabilities: Vulnerability[] = []
      const packageJsonPath = path.join(this.projectDir, 'package.json')
      const packageJson = await fs.readJSON(packageJsonPath)
      
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }
      
      // GitHub GraphQL API 查询
      for (const [pkgName, version] of Object.entries(allDeps)) {
        const advisories = await this.queryGitHubAdvisory(pkgName)
        vulnerabilities.push(...advisories)
      }
      
      return vulnerabilities
    } catch (error) {
      this.logger.warn('GitHub Advisory check failed', error)
      return []
    }
  }
  
  /**
   * 查询 Snyk 数据库（如果有 API key）
   */
  private async runSnykCheck(): Promise<Vulnerability[]> {
    const apiKey = process.env.SNYK_API_KEY
    if (!apiKey) {
      this.logger.debug('Snyk API key not found, skipping Snyk check')
      return []
    }
    
    try {
      // 调用 Snyk API
      const response = await fetch('https://api.snyk.io/v1/test/npm', {
        method: 'POST',
        headers: {
          'Authorization': `token ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // ... 请求体
        })
      })
      
      // 处理响应
      // ...
    } catch (error) {
      this.logger.warn('Snyk check failed', error)
      return []
    }
  }
  
  /**
   * 支持多数据源的检查
   */
  async check(sources?: Array<'npm' | 'osv' | 'github' | 'snyk'>): Promise<Vulnerability[]> {
    const enabledSources = sources || ['npm', 'osv']
    const tasks: Promise<Vulnerability[]>[] = []
    
    if (enabledSources.includes('npm')) {
      tasks.push(this.runNpmAudit())
    }
    
    if (enabledSources.includes('osv')) {
      tasks.push(this.runOSVCheck())
    }
    
    if (enabledSources.includes('github')) {
      tasks.push(this.runGitHubAdvisoryCheck())
    }
    
    if (enabledSources.includes('snyk')) {
      tasks.push(this.runSnykCheck())
    }
    
    const results = await Promise.all(tasks)
    const allVulns = results.flat()
    
    return this.deduplicateVulnerabilities(allVulns)
  }
}
```

#### 4.2 添加自定义规则引擎

**新增功能：** 允许用户定义自定义安全规则

**文件：** 新建 `src/rules/custom-rule-engine.ts`

**改进方案：**

```typescript