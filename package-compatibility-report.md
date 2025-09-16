# 包兼容性测试报告

## 📊 测试概览

- **测试时间**: 2025-09-15T14:06:06.927Z
- **总包数**: 37
- **构建成功**: 18
- **构建失败**: 19
- **成功率**: 48.65%

## ✅ 构建成功的包

- **@ldesign/shared** (72.64s)
- **@ldesign/builder** (44.01s)
- **@ldesign/launcher** (65.73s)
- **@ldesign/engine** (43.12s)
- **@ldesign/git** (10.61s)
- **@ldesign/http** (12.16s)
- **@ldesign/i18n** (31.18s) 🧪
- **@ldesign/kit** (5.27s)
- **@ldesign/pdf** (19.26s)
- **@ldesign/progress** (28.92s)
- **@ldesign/qrcode** (13.72s)
- **@ldesign/router** (28.62s) 🧪
- **@ldesign/size** (14.66s)
- **@ldesign/store** (23.36s)
- **@ldesign/table** (11.84s)
- **@ldesign/template** (22.46s)
- **@ldesign/theme** (37.12s)
- **@ldesign/websocket** (13.53s)

## ❌ 构建失败的包

### @ldesign/color

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/color" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/shared -> @ldesign/builder }
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/kit -> @ldesign/shared }


- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/color" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/shared -> @ldesign/builder }
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/kit -> @ldesign/shared }



**修复建议:**


### @ldesign/icons

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/icons" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/kit -> @ldesign/shared }
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/shared -> @ldesign/builder }


- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/icons" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/shared -> @ldesign/builder }
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/kit -> @ldesign/shared }



**修复建议:**


### @ldesign/api

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/api" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/shared -> @ldesign/builder }
      	{ @ldesign/kit -> @ldesign/shared }
      	{ @ldesign/builder -> @ldesign/kit }


- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/api" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/kit -> @ldesign/shared }
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/shared -> @ldesign/builder }



**修复建议:**


### @ldesign/cache

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/cache" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/shared -> @ldesign/builder }
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/kit -> @ldesign/shared }


- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/cache" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/shared -> @ldesign/builder }
      	{ @ldesign/kit -> @ldesign/shared }



**修复建议:**


### @ldesign/calendar

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/calendar" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/kit -> @ldesign/shared }
      	{ @ldesign/shared -> @ldesign/builder }


- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/calendar" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/shared -> @ldesign/builder }
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/kit -> @ldesign/shared }



**修复建议:**


### @ldesign/captcha

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/captcha" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/kit -> @ldesign/shared }
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/shared -> @ldesign/builder }


- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/captcha" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/shared -> @ldesign/builder }
      	{ @ldesign/kit -> @ldesign/shared }



**修复建议:**


### @ldesign/chart

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/chart" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/kit -> @ldesign/shared }
      	{ @ldesign/shared -> @ldesign/builder }


- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/chart" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/kit -> @ldesign/shared }
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/shared -> @ldesign/builder }



**修复建议:**


### @ldesign/component

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/component" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/kit -> @ldesign/shared }
      	{ @ldesign/shared -> @ldesign/builder }
      	{ @ldesign/builder -> @ldesign/kit }


- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/component" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/kit -> @ldesign/shared }
      	{ @ldesign/shared -> @ldesign/builder }



**修复建议:**


### @ldesign/cropper

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/cropper" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/shared -> @ldesign/builder }
      	{ @ldesign/kit -> @ldesign/shared }


- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/cropper" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/kit -> @ldesign/shared }
      	{ @ldesign/shared -> @ldesign/builder }



**修复建议:**


### @ldesign/crypto

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/crypto" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/shared -> @ldesign/builder }
      	{ @ldesign/kit -> @ldesign/shared }
      	{ @ldesign/builder -> @ldesign/kit }


- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/crypto" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/kit -> @ldesign/shared }
      	{ @ldesign/shared -> @ldesign/builder }
      	{ @ldesign/builder -> @ldesign/kit }



**修复建议:**


### @ldesign/datepicker

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/datepicker" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/builder -> @ldesign/kit }
      	{ @ldesign/kit -> @ldesign/shared }
      	{ @ldesign/shared -> @ldesign/builder }


- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/datepicker" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/kit -> @ldesign/shared }
      	{ @ldesign/shared -> @ldesign/builder }
      	{ @ldesign/builder -> @ldesign/kit }



**修复建议:**


### @ldesign/device

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/device" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

  x Invalid package dependency graph:
  `-> Cyclic dependency detected:
      	@ldesign/shared, @ldesign/kit, @ldesign/builder
      
      The cycle can be broken by removing any of these sets of dependencies:
      	{ @ldesign/kit -> @ldesign/shared }
      	{ @ldesign/shared -> @ldesign/builder }
      	{ @ldesign/builder -> @ldesign/kit }


- 测试失败: spawnSync C:\Windows\system32\cmd.exe ETIMEDOUT

**修复建议:**


### @ldesign/editor

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/editor" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

@ldesign/editor:build: ERROR: command finished with error: command (D:\WorkBench\ldesign\packages\editor) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
@ldesign/editor#build: command (D:\WorkBench\ldesign\packages\editor) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
 ERROR  run failed: command  exited (1)

- 测试失败: spawnSync C:\Windows\system32\cmd.exe ETIMEDOUT

**修复建议:**


### @ldesign/flowchart

**错误信息:**
- spawnSync C:\Windows\system32\cmd.exe ETIMEDOUT
- 测试失败: spawnSync C:\Windows\system32\cmd.exe ETIMEDOUT

**修复建议:**


### @ldesign/form

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/form" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

@ldesign/form:build: ERROR: command finished with error: command (D:\WorkBench\ldesign\packages\form) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
@ldesign/form#build: command (D:\WorkBench\ldesign\packages\form) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
 ERROR  run failed: command  exited (1)

- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/form" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

@ldesign/form:build: ERROR: command finished with error: command (D:\WorkBench\ldesign\packages\form) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
@ldesign/form#build: command (D:\WorkBench\ldesign\packages\form) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
 ERROR  run failed: command  exited (1)


**修复建议:**


### @ldesign/map

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/map" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

@ldesign/map:build: ERROR: command finished with error: command (D:\WorkBench\ldesign\packages\map) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (2)
@ldesign/map#build: command (D:\WorkBench\ldesign\packages\map) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (2)
 ERROR  run failed: command  exited (2)

- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/map" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

@ldesign/map:build: ERROR: command finished with error: command (D:\WorkBench\ldesign\packages\map) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (2)
@ldesign/map#build: command (D:\WorkBench\ldesign\packages\map) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (2)
 ERROR  run failed: command  exited (2)


**修复建议:**


### @ldesign/tree

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/tree" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

@ldesign/tree:build: ERROR: command finished with error: command (D:\WorkBench\ldesign\packages\tree) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
@ldesign/tree#build: command (D:\WorkBench\ldesign\packages\tree) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
 ERROR  run failed: command  exited (1)

- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/tree" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

@ldesign/tree:build: ERROR: command finished with error: command (D:\WorkBench\ldesign\packages\tree) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
@ldesign/tree#build: command (D:\WorkBench\ldesign\packages\tree) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
 ERROR  run failed: command  exited (1)


**修复建议:**


### @ldesign/video

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/video" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

@ldesign/video:build: ERROR: command finished with error: command (D:\WorkBench\ldesign\packages\video) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
@ldesign/video#build: command (D:\WorkBench\ldesign\packages\video) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
 ERROR  run failed: command  exited (1)

- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/video" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

@ldesign/video:build: ERROR: command finished with error: command (D:\WorkBench\ldesign\packages\video) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
@ldesign/video#build: command (D:\WorkBench\ldesign\packages\video) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
 ERROR  run failed: command  exited (1)


**修复建议:**


### @ldesign/watermark

**错误信息:**
- Command failed: pnpm turbo run build --filter="@ldesign/watermark" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

@ldesign/watermark:build: ERROR: command finished with error: command (D:\WorkBench\ldesign\packages\watermark) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
@ldesign/watermark#build: command (D:\WorkBench\ldesign\packages\watermark) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
 ERROR  run failed: command  exited (1)

- 测试失败: Command failed: pnpm turbo run test:run --filter="@ldesign/watermark" --no-cache
 WARNING  --no-cache is deprecated and will be removed in a future major version. Use --cache=local:r,remote:r
turbo 2.5.6

@ldesign/watermark:build: ERROR: command finished with error: command (D:\WorkBench\ldesign\packages\watermark) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
@ldesign/watermark#build: command (D:\WorkBench\ldesign\packages\watermark) C:\Users\swiml\AppData\Local\pnpm\.tools\pnpm\10.15.0\bin\pnpm.CMD run build exited (1)
 ERROR  run failed: command  exited (1)


**修复建议:**



## ⚠️ 警告信息

### @ldesign/shared
- @ldesign/kit:build: Entry module "dist/project/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]

### @ldesign/builder
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/kit:build: Entry module "dist/project/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]

### @ldesign/launcher
- @ldesign/launcher:build: Entry module "dist/chunks/app-config-HVC2M3QC.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.

### @ldesign/engine
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]

### @ldesign/git
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]

### @ldesign/http
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]

### @ldesign/i18n
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]

### @ldesign/kit
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.

### @ldesign/pdf
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]

### @ldesign/progress
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/launcher:build: Entry module "dist/chunks/app-config-HVC2M3QC.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.

### @ldesign/qrcode
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]

### @ldesign/router
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]

### @ldesign/size
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]

### @ldesign/store
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]

### @ldesign/table
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]

### @ldesign/template
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]

### @ldesign/theme
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]

### @ldesign/websocket
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1mConstructing "SVGIcons2SVGFont" will crash at run-time because it's an import namespace object, not a constructor[0m [call-import-namespace]
- @ldesign/kit:build: Entry module "dist/index.cjs" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]
- @ldesign/builder:build: [43m[30m WARN [39m[49m [33m▲ [43;33m[[43;30mWARNING[43;33m][0m [1m"import.meta" is not available with the "cjs" output format and will be empty[0m [empty-import-meta]


## 🚀 优化建议

- 🔧 优先修复构建失败的包，它们可能影响其他包的构建
- ⚡ 优化构建较慢的包: @ldesign/shared, @ldesign/builder, @ldesign/launcher, @ldesign/engine, @ldesign/i18n, @ldesign/theme

---
*报告生成时间: 2025-09-15T14:06:06.927Z*
