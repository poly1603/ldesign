/**
 * NPM 认证服务
 * 提供多种官方可靠的 NPM 登录方式
 */

import { execSync, spawn } from 'child_process'
import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

export interface LoginOptions {
  registry: string
  username?: string
  password?: string
  email?: string
  token?: string
}

export interface LoginResult {
  success: boolean
  message: string
  username?: string
  token?: string
  error?: string
}

/**
 * 方式 1: 使用 Access Token 登录（最推荐）
 * 这是最安全和可靠的方式
 */
export async function loginWithToken(options: { registry: string; token: string }): Promise<LoginResult> {
  try {
    const { registry, token } = options
    
    // 获取 registry 的 scope
    const registryUrl = new URL(registry)
    const scope = `//${registryUrl.host}${registryUrl.pathname}`.replace(/\/$/, '')
    
    // 设置 token 到 .npmrc
    const npmrcPath = join(homedir(), '.npmrc')
    const tokenLine = `${scope}/:_authToken=${token}\n`
    
    // 读取现有 .npmrc
    let npmrcContent = ''
    if (existsSync(npmrcPath)) {
      npmrcContent = readFileSync(npmrcPath, 'utf-8')
      
      // 移除该 registry 的旧 token
      const lines = npmrcContent.split('\n')
      npmrcContent = lines
        .filter(line => !line.startsWith(`${scope}/:_authToken=`))
        .join('\n')
    }
    
    // 添加新 token
    writeFileSync(npmrcPath, npmrcContent + '\n' + tokenLine, 'utf-8')
    
    // 验证 token 是否有效
    try {
      const username = execSync(`npm whoami --registry=${registry}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim()
      
      return {
        success: true,
        message: '使用 Token 登录成功',
        username,
        token
      }
    } catch (error) {
      return {
        success: false,
        message: 'Token 无效或已过期',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  } catch (error) {
    return {
      success: false,
      message: '登录失败',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * 方式 2: 使用交互式 npm login（适用于终端场景）
 * 这会打开交互式终端让用户输入凭据
 */
export async function loginInteractive(registry: string): Promise<LoginResult> {
  return new Promise((resolve) => {
    try {
      const child = spawn('npm', ['login', `--registry=${registry}`], {
        stdio: 'inherit',
        shell: true
      })
      
      child.on('close', (code) => {
        if (code === 0) {
          // 验证登录状态
          try {
            const username = execSync(`npm whoami --registry=${registry}`, {
              encoding: 'utf-8',
              stdio: ['pipe', 'pipe', 'pipe']
            }).trim()
            
            resolve({
              success: true,
              message: '登录成功',
              username
            })
          } catch (error) {
            resolve({
              success: false,
              message: '登录验证失败',
              error: error instanceof Error ? error.message : String(error)
            })
          }
        } else {
          resolve({
            success: false,
            message: '登录失败',
            error: `进程退出代码: ${code}`
          })
        }
      })
      
      child.on('error', (error) => {
        resolve({
          success: false,
          message: '启动登录进程失败',
          error: error.message
        })
      })
    } catch (error) {
      resolve({
        success: false,
        message: '登录失败',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })
}

/**
 * 方式 3: 使用 npm-cli-login（非交互式）
 * 需要先安装: npm install -g npm-cli-login
 */
export async function loginWithCredentials(options: LoginOptions): Promise<LoginResult> {
  try {
    const { registry, username, password, email } = options
    
    if (!username || !password || !email) {
      return {
        success: false,
        message: '缺少必要的登录信息（用户名、密码、邮箱）'
      }
    }
    
    // 检查是否安装了 npm-cli-login
    try {
      execSync('npm-cli-login --version', { stdio: 'pipe' })
    } catch {
      return {
        success: false,
        message: '未安装 npm-cli-login，请先执行: npm install -g npm-cli-login'
      }
    }
    
    // 使用 npm-cli-login 登录
    try {
      execSync(
        `npm-cli-login -u "${username}" -p "${password}" -e "${email}" -r "${registry}"`,
        {
          encoding: 'utf-8',
          stdio: 'pipe'
        }
      )
      
      // 验证登录状态
      const actualUsername = execSync(`npm whoami --registry=${registry}`, {
        encoding: 'utf-8',
        stdio: 'pipe'
      }).trim()
      
      return {
        success: true,
        message: '登录成功',
        username: actualUsername
      }
    } catch (error) {
      return {
        success: false,
        message: '登录失败，请检查用户名和密码',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  } catch (error) {
    return {
      success: false,
      message: '登录失败',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * 方式 4: 使用 .npmrc 直接配置（最灵活）
 * 适用于已有认证信息的场景
 */
export async function loginWithNpmrc(options: {
  registry: string
  authConfig: {
    _auth?: string  // base64 encoded username:password
    _authToken?: string
    username?: string
    password?: string
    email?: string
  }
}): Promise<LoginResult> {
  try {
    const { registry, authConfig } = options
    const registryUrl = new URL(registry)
    const scope = `//${registryUrl.host}${registryUrl.pathname}`.replace(/\/$/, '')
    
    const npmrcPath = join(homedir(), '.npmrc')
    let npmrcContent = existsSync(npmrcPath) ? readFileSync(npmrcPath, 'utf-8') : ''
    
    // 移除该 registry 的旧配置
    const lines = npmrcContent.split('\n')
    npmrcContent = lines
      .filter(line => !line.startsWith(scope))
      .join('\n')
    
    // 添加新配置
    const configLines: string[] = []
    
    if (authConfig._authToken) {
      configLines.push(`${scope}/:_authToken=${authConfig._authToken}`)
    } else if (authConfig._auth) {
      configLines.push(`${scope}/:_auth=${authConfig._auth}`)
    } else if (authConfig.username && authConfig.password) {
      const auth = Buffer.from(`${authConfig.username}:${authConfig.password}`).toString('base64')
      configLines.push(`${scope}/:_auth=${auth}`)
    }
    
    if (authConfig.email) {
      configLines.push(`${scope}/:email=${authConfig.email}`)
    }
    
    if (configLines.length === 0) {
      return {
        success: false,
        message: '未提供有效的认证信息'
      }
    }
    
    writeFileSync(npmrcPath, npmrcContent + '\n' + configLines.join('\n') + '\n', 'utf-8')
    
    // 验证配置是否有效
    try {
      const username = execSync(`npm whoami --registry=${registry}`, {
        encoding: 'utf-8',
        stdio: 'pipe'
      }).trim()
      
      return {
        success: true,
        message: '配置成功',
        username
      }
    } catch (error) {
      return {
        success: false,
        message: '认证信息无效',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  } catch (error) {
    return {
      success: false,
      message: '配置失败',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * 检查登录状态
 */
export async function checkLoginStatus(registry: string): Promise<{
  isLoggedIn: boolean
  username?: string
}> {
  try {
    const username = execSync(`npm whoami --registry=${registry}`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    }).trim()
    
    return {
      isLoggedIn: true,
      username
    }
  } catch {
    return {
      isLoggedIn: false
    }
  }
}

/**
 * 退出登录
 */
export async function logout(registry: string): Promise<LoginResult> {
  try {
    execSync(`npm logout --registry=${registry}`, {
      stdio: 'pipe'
    })
    
    return {
      success: true,
      message: '退出登录成功'
    }
  } catch (error) {
    return {
      success: false,
      message: '退出登录失败',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * 推荐的登录方式选择器
 * 根据可用信息自动选择最合适的登录方式
 */
export async function smartLogin(options: LoginOptions): Promise<LoginResult> {
  // 优先级 1: 如果提供了 token，使用 token 登录
  if (options.token) {
    return loginWithToken({ registry: options.registry, token: options.token })
  }
  
  // 优先级 2: 如果提供了完整的用户名、密码、邮箱，使用凭据登录
  if (options.username && options.password && options.email) {
    return loginWithCredentials(options)
  }
  
  // 优先级 3: 使用交互式登录
  return loginInteractive(options.registry)
}