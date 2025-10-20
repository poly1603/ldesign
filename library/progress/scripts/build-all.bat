@echo off
REM 构建所有包并测试 (Windows)

echo 🚀 开始构建所有包...

REM 清理旧的构建产物
echo 🧹 清理旧的构建产物...
call pnpm clean

REM 安装依赖
echo 📦 安装依赖...
call pnpm install

REM 构建核心包
echo 📦 构建 @ldesign/progress-core...
call pnpm build:core
if %ERRORLEVEL% neq 0 (
  echo ❌ 核心包构建失败！
  exit /b 1
)

REM 构建 Vue 包
echo 📦 构建 @ldesign/progress-vue...
call pnpm build:vue
if %ERRORLEVEL% neq 0 (
  echo ❌ Vue 包构建失败！
  exit /b 1
)

REM 构建 React 包
echo 📦 构建 @ldesign/progress-react...
call pnpm build:react
if %ERRORLEVEL% neq 0 (
  echo ❌ React 包构建失败！
  exit /b 1
)

REM 构建 Lit 包
echo 📦 构建 @ldesign/progress-lit...
call pnpm build:lit
if %ERRORLEVEL% neq 0 (
  echo ❌ Lit 包构建失败！
  exit /b 1
)

REM 测试构建
echo 🧪 测试构建产物...
call pnpm test:build
if %ERRORLEVEL% neq 0 (
  echo ❌ 构建测试失败！
  exit /b 1
)

echo ✅ 所有包构建成功！


