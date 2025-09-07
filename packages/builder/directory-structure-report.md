# 示例项目目录结构验证报告

**验证时间**: 2025-09-07T13:56:48.244Z
**测试项目数**: 8

## 📊 总体统计

- **通过验证**: 6/8
- **失败验证**: 4/8
- **警告数量**: 3

## 📋 项目详细结果

### basic-typescript (100/100)

✅ 构建成功 (2213ms)

**目录结构**:
- ✅ es/ (2 文件)
- ✅ lib/ (2 文件)
- ❌ dist/ (0 文件)

### complex-library (100/100)

✅ 构建成功 (5764ms)

**目录结构**:
- ✅ es/ (3 文件)
- ✅ lib/ (3 文件)
- ✅ dist/ (3 文件)

### mixed-library (100/100)

✅ 构建成功 (5094ms)

**目录结构**:
- ✅ es/ (14 文件)
- ✅ lib/ (14 文件)
- ✅ dist/ (10 文件)

**问题**:
- files 字段缺少目录: dist

### multi-module-typescript (100/100)

✅ 构建成功 (5853ms)

**目录结构**:
- ✅ es/ (48 文件)
- ✅ lib/ (48 文件)
- ✅ dist/ (26 文件)

**问题**:
- 缺少 unpkg 字段
- files 字段缺少目录: dist

### react-components (100/100)

✅ 构建成功 (5450ms)

**目录结构**:
- ✅ es/ (13 文件)
- ✅ lib/ (13 文件)
- ✅ dist/ (9 文件)

**问题**:
- 缺少 unpkg 字段
- files 字段缺少目录: dist

### style-library (20/100)

❌ 构建失败

**目录结构**:

**问题**:
- 构建失败: Command failed: pnpm run build

### typescript-utils (100/100)

✅ 构建成功 (6850ms)

**目录结构**:
- ✅ es/ (4 文件)
- ✅ lib/ (4 文件)
- ✅ dist/ (4 文件)

**问题**:
- CJS 入口 路径不标准
- ESM 入口 路径不标准
- 类型声明 路径不标准
- 缺少 unpkg 字段
- files 字段缺少目录: es, lib

### vue3-components (20/100)

❌ 构建失败

**目录结构**:

**问题**:
- 构建失败: Command failed: pnpm run build
