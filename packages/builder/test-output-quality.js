/**
 * 测试输出质量验证器
 */

import { createOutputQualityValidator } from './src/tests/output-quality-validator.js'
import { Logger } from './src/utils/logger.js'
import fs from 'fs'

async function testOutputQuality() {
  const logger = new Logger()
  const validator = createOutputQualityValidator(logger)
  
  console.log('🔍 开始输出质量验证...')
  
  try {
    const report = await validator.validateOutput('dist')
    
    // 生成报告
    const reportContent = validator.generateReport(report)
    
    // 保存报告
    fs.writeFileSync('output-quality-report.md', reportContent)
    
    console.log('\n📊 质量验证结果:')
    console.log(`总体评分: ${report.overallScore}/100`)
    console.log(`通过检查: ${report.passedChecks}/${report.checks.length}`)
    console.log(`失败检查: ${report.failedChecks}/${report.checks.length}`)
    
    console.log('\n📋 检查详情:')
    report.checks.forEach(check => {
      const status = check.passed ? '✅' : '❌'
      console.log(`${status} ${check.name}: ${check.score}/100`)
      
      if (check.errors.length > 0) {
        check.errors.forEach(error => console.log(`  ${error}`))
      }
      
      if (check.warnings.length > 0) {
        check.warnings.forEach(warning => console.log(`  ${warning}`))
      }
    })
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 优化建议:')
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`)
      })
    }
    
    console.log('\n📄 详细报告已保存到: output-quality-report.md')
    
  } catch (error) {
    console.error('❌ 质量验证失败:', error.message)
  }
}

testOutputQuality()
