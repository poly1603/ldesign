/**
 * 删除 GitHub 远程仓库
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
const GITHUB_USERNAME = 'poly1603'

const reposToDelete = [
  'ldesign-tester',
  'ldesign-analyzer'
]

async function deleteRepo(repoName: string) {
  console.log(`\n正在删除仓库: ${repoName}...`)
  
  const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ldesign-tools'
      }
    })
    
    if (response.status === 204) {
      console.log(`✅ 成功删除仓库: ${repoName}`)
    } else if (response.status === 404) {
      console.log(`⚠️  仓库 ${repoName} 不存在或已被删除`)
    } else {
      const errorText = await response.text()
      console.error(`❌ 删除失败 (${response.status}): ${errorText}`)
    }
  } catch (error: any) {
    console.error(`❌ 删除失败: ${error.message}`)
  }
}

async function main() {
  console.log('\n🗑️  开始删除 GitHub 远程仓库...\n')
  
  for (const repo of reposToDelete) {
    await deleteRepo(repo)
  }
  
  console.log('\n✨ 完成！\n')
}

main()

