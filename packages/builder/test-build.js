/**
 * 简单的构建测试脚本
 */

console.log('🚀 开始测试 @ldesign/builder...')

// 测试模块导入
try {
  const builderModule = await import('./dist/index.js')
  console.log('✅ 模块导入成功')
  console.log('📦 导出的内容:', Object.keys(builderModule))

  // 测试类型导出
  if (builderModule.LibraryBuilder) {
    console.log('✅ LibraryBuilder 类导出成功')
  }

  if (builderModule.createBuilder) {
    console.log('✅ createBuilder 函数导出成功')
  }

  if (builderModule.LibraryType) {
    console.log('✅ LibraryType 枚举导出成功')
    console.log('📋 支持的库类型:', Object.values(builderModule.LibraryType))
  }

  console.log('🎉 @ldesign/builder 模块测试完成!')
  console.log('📝 注意: 实际构建功能需要在 CommonJS 环境中测试，或者安装相应的打包器依赖')

} catch (error) {
  console.error('❌ 模块导入失败:', error.message)
}
