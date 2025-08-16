#!/usr/bin/env tsx

/**
 * 测试覆盖率徽章生成器
 * 读取测试覆盖率报告并生成徽章
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface CoverageSummary {
  total: {
    lines: { pct: number }
    statements: { pct: number }
    functions: { pct: number }
    branches: { pct: number }
  }
}

/**
 * 获取徽章颜色
 */
function getBadgeColor(percentage: number): string {
  if (percentage >= 90) return 'brightgreen'
  if (percentage >= 80) return 'green'
  if (percentage >= 70) return 'yellow'
  if (percentage >= 60) return 'orange'
  return 'red'
}

/**
 * 生成徽章SVG
 */
function generateBadgeSvg(label: string, percentage: number): string {
  const color = getBadgeColor(percentage)
  const message = `${percentage.toFixed(1)}%`

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="114" height="20">
    <linearGradient id="b" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <clipPath id="a">
      <rect width="114" height="20" rx="3" fill="#fff"/>
    </clipPath>
    <g clip-path="url(#a)">
      <path fill="#555" d="M0 0h63v20H0z"/>
      <path fill="${color}" d="M63 0h51v20H63z"/>
      <path fill="url(#b)" d="M0 0h114v20H0z"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110">
      <text x="325" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="530">${label}</text>
      <text x="325" y="140" transform="scale(.1)" textLength="530">${label}</text>
      <text x="875" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="410">${message}</text>
      <text x="875" y="140" transform="scale(.1)" textLength="410">${message}</text>
    </g>
  </svg>`
}

/**
 * 主函数
 */
async function main() {
  const rootDir = process.cwd()
  const coverageSummaryPath = join(rootDir, 'coverage', 'coverage-summary.json')
  const badgesDir = join(rootDir, 'badges')

  // 检查覆盖率报告是否存在
  if (!existsSync(coverageSummaryPath)) {
    console.error('❌ 覆盖率报告不存在，请先运行: pnpm test:coverage')
    process.exit(1)
  }

  // 读取覆盖率数据
  const coverageData: CoverageSummary = JSON.parse(
    readFileSync(coverageSummaryPath, 'utf-8')
  )

  // 创建徽章目录
  if (!existsSync(badgesDir)) {
    const { mkdirSync } = await import('node:fs')
    mkdirSync(badgesDir, { recursive: true })
  }

  // 生成各类徽章
  const badges = [
    { name: 'lines', label: 'Lines', value: coverageData.total.lines.pct },
    {
      name: 'statements',
      label: 'Statements',
      value: coverageData.total.statements.pct,
    },
    {
      name: 'functions',
      label: 'Functions',
      value: coverageData.total.functions.pct,
    },
    {
      name: 'branches',
      label: 'Branches',
      value: coverageData.total.branches.pct,
    },
  ]

  // 计算总体覆盖率
  const overallCoverage =
    (coverageData.total.lines.pct +
      coverageData.total.statements.pct +
      coverageData.total.functions.pct +
      coverageData.total.branches.pct) /
    4

  badges.push({ name: 'coverage', label: 'Coverage', value: overallCoverage })

  // 生成徽章文件
  badges.forEach(({ name, label, value }) => {
    const svg = generateBadgeSvg(label, value)
    const filePath = join(badgesDir, `${name}.svg`)
    writeFileSync(filePath, svg)
    console.log(`✅ 生成徽章: ${name}.svg (${value.toFixed(1)}%)`)
  })

  // 更新README中的徽章
  updateReadmeBadges(overallCoverage)

  console.log(`\n📊 总体测试覆盖率: ${overallCoverage.toFixed(1)}%`)
}

/**
 * 更新README中的覆盖率徽章
 */
function updateReadmeBadges(coverage: number) {
  const rootDir = process.cwd()
  const readmePath = join(rootDir, 'README.md')

  if (!existsSync(readmePath)) {
    return
  }

  let readme = readFileSync(readmePath, 'utf-8')

  // 更新覆盖率徽章（如果存在）
  const coverageBadgeRegex = /!\[Coverage\]\([^)]+\)/g
  const newBadge = `![Coverage](https://img.shields.io/badge/Coverage-${coverage.toFixed(
    1
  )}%25-${getBadgeColor(coverage)})`

  if (coverageBadgeRegex.test(readme)) {
    readme = readme.replace(coverageBadgeRegex, newBadge)
  } else {
    // 如果没有找到覆盖率徽章，添加到标题后面
    const titleRegex = /^# .+$/m
    readme = readme.replace(titleRegex, match => {
      return `${match}\n\n${newBadge}`
    })
  }

  writeFileSync(readmePath, readme)
  console.log('✅ 更新README覆盖率徽章')
}

// 运行主函数
main().catch(console.error)
