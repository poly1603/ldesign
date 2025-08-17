<template>
  <div class="security-demo">
    <div class="demo-header">
      <h2>🔒 安全管理器演示</h2>
      <p>SecurityManager 提供了全面的安全防护功能，包括XSS防护、CSRF保护、内容安全策略等。</p>
    </div>

    <div class="demo-grid">
      <!-- 安全检测 -->
      <div class="card">
        <div class="card-header">
          <h3>安全检测</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>输入内容 (XSS测试)</label>
            <textarea 
              v-model="testInput" 
              placeholder="输入可能包含恶意代码的内容"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="testXSS">XSS 检测</button>
              <button class="btn btn-secondary" @click="sanitizeInput">内容净化</button>
              <button class="btn btn-warning" @click="validateCSRF">CSRF 验证</button>
            </div>
          </div>
          
          <div v-if="securityResult" class="security-result">
            <h4>检测结果</h4>
            <div class="result-item" :class="securityResult.level">
              <span class="result-level">{{ securityResult.level.toUpperCase() }}</span>
              <span class="result-message">{{ securityResult.message }}</span>
            </div>
            <div v-if="securityResult.sanitized" class="sanitized-content">
              <strong>净化后内容:</strong>
              <pre>{{ securityResult.sanitized }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- 权限管理 -->
      <div class="card">
        <div class="card-header">
          <h3>权限管理</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>用户角色</label>
            <select v-model="userRole">
              <option value="guest">访客</option>
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
              <option value="superadmin">超级管理员</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>请求权限</label>
            <input 
              v-model="requestedPermission" 
              type="text" 
              placeholder="例如: user:read, admin:write"
            />
          </div>
          
          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="checkPermission">检查权限</button>
              <button class="btn btn-secondary" @click="grantPermission">授予权限</button>
              <button class="btn btn-warning" @click="revokePermission">撤销权限</button>
            </div>
          </div>
          
          <div class="permissions-list">
            <h4>当前权限</h4>
            <div 
              v-for="permission in currentPermissions" 
              :key="permission"
              class="permission-item"
            >
              <span class="permission-name">{{ permission }}</span>
              <button 
                class="btn btn-error btn-sm"
                @click="removePermission(permission)"
              >
                移除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 安全策略 -->
      <div class="card">
        <div class="card-header">
          <h3>安全策略</h3>
        </div>
        <div class="card-body">
          <div class="policy-list">
            <div 
              v-for="policy in securityPolicies" 
              :key="policy.name"
              class="policy-item"
            >
              <div class="policy-info">
                <h4>{{ policy.name }}</h4>
                <p>{{ policy.description }}</p>
              </div>
              <div class="policy-toggle">
                <label class="switch">
                  <input 
                    type="checkbox" 
                    v-model="policy.enabled"
                    @change="togglePolicy(policy)"
                  />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 安全日志 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>安全日志</h3>
          <button class="btn btn-secondary btn-sm" @click="clearSecurityLogs">清空</button>
        </div>
        <div class="card-body">
          <div class="security-logs">
            <div 
              v-for="(log, index) in securityLogs" 
              :key="index"
              class="security-log-item"
              :class="log.level"
            >
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-level">{{ log.level.toUpperCase() }}</span>
              <span class="log-type">{{ log.type }}</span>
              <span class="log-message">{{ log.message }}</span>
              <span v-if="log.details" class="log-details">{{ log.details }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface Props {
  engine: any
}

interface Emits {
  (e: 'log', level: string, message: string, data?: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const testInput = ref('<script>alert("XSS Attack!")</script><img src="x" onerror="alert(\'XSS\')">')
const securityResult = ref<any>(null)
const userRole = ref('user')
const requestedPermission = ref('user:read')
const currentPermissions = reactive(['user:read', 'user:profile'])
const securityLogs = reactive<any[]>([])

// 安全策略
const securityPolicies = reactive([
  {
    name: 'XSS 防护',
    description: '自动检测和阻止跨站脚本攻击',
    enabled: true
  },
  {
    name: 'CSRF 保护',
    description: '防止跨站请求伪造攻击',
    enabled: true
  },
  {
    name: '内容安全策略',
    description: '限制资源加载来源，防止代码注入',
    enabled: false
  },
  {
    name: '点击劫持防护',
    description: '防止页面被嵌入到恶意框架中',
    enabled: true
  },
  {
    name: '安全头部',
    description: '自动添加安全相关的HTTP头部',
    enabled: true
  }
])

// 权限映射
const rolePermissions: Record<string, string[]> = {
  guest: ['public:read'],
  user: ['public:read', 'user:read', 'user:profile'],
  admin: ['public:read', 'user:read', 'user:write', 'admin:read', 'admin:write'],
  superadmin: ['*']
}

// 方法
const testXSS = () => {
  try {
    const threats = detectXSSThreats(testInput.value)
    
    if (threats.length > 0) {
      securityResult.value = {
        level: 'danger',
        message: `检测到 ${threats.length} 个潜在的XSS威胁`,
        threats
      }
      addSecurityLog('warning', 'XSS_DETECTED', `检测到XSS威胁: ${threats.join(', ')}`)
    } else {
      securityResult.value = {
        level: 'safe',
        message: '未检测到XSS威胁'
      }
      addSecurityLog('info', 'XSS_SAFE', '内容安全检查通过')
    }
    
    emit('log', 'info', 'XSS检测完成', securityResult.value)
  } catch (error: any) {
    emit('log', 'error', 'XSS检测失败', error)
  }
}

const sanitizeInput = () => {
  try {
    const sanitized = sanitizeHTML(testInput.value)
    
    securityResult.value = {
      level: 'info',
      message: '内容已净化',
      sanitized
    }
    
    addSecurityLog('info', 'CONTENT_SANITIZED', '内容净化完成')
    emit('log', 'success', '内容净化完成', { original: testInput.value, sanitized })
  } catch (error: any) {
    emit('log', 'error', '内容净化失败', error)
  }
}

const validateCSRF = () => {
  try {
    // 模拟CSRF令牌验证
    const hasValidToken = Math.random() > 0.3 // 70% 成功率
    
    if (hasValidToken) {
      securityResult.value = {
        level: 'safe',
        message: 'CSRF令牌验证通过'
      }
      addSecurityLog('info', 'CSRF_VALID', 'CSRF令牌验证成功')
    } else {
      securityResult.value = {
        level: 'danger',
        message: 'CSRF令牌验证失败'
      }
      addSecurityLog('error', 'CSRF_INVALID', 'CSRF令牌验证失败')
    }
    
    emit('log', 'info', 'CSRF验证完成', securityResult.value)
  } catch (error: any) {
    emit('log', 'error', 'CSRF验证失败', error)
  }
}

const checkPermission = () => {
  try {
    const hasPermission = hasUserPermission(userRole.value, requestedPermission.value)
    
    securityResult.value = {
      level: hasPermission ? 'safe' : 'warning',
      message: hasPermission ? '权限验证通过' : '权限不足'
    }
    
    addSecurityLog(
      hasPermission ? 'info' : 'warning',
      'PERMISSION_CHECK',
      `用户 ${userRole.value} 请求权限 ${requestedPermission.value}: ${hasPermission ? '通过' : '拒绝'}`
    )
    
    emit('log', 'info', '权限检查完成', securityResult.value)
  } catch (error: any) {
    emit('log', 'error', '权限检查失败', error)
  }
}

const grantPermission = () => {
  try {
    if (!currentPermissions.includes(requestedPermission.value)) {
      currentPermissions.push(requestedPermission.value)
      addSecurityLog('info', 'PERMISSION_GRANTED', `授予权限: ${requestedPermission.value}`)
      emit('log', 'success', `授予权限: ${requestedPermission.value}`)
    } else {
      emit('log', 'warning', '权限已存在')
    }
  } catch (error: any) {
    emit('log', 'error', '授予权限失败', error)
  }
}

const revokePermission = () => {
  try {
    const index = currentPermissions.indexOf(requestedPermission.value)
    if (index !== -1) {
      currentPermissions.splice(index, 1)
      addSecurityLog('warning', 'PERMISSION_REVOKED', `撤销权限: ${requestedPermission.value}`)
      emit('log', 'warning', `撤销权限: ${requestedPermission.value}`)
    } else {
      emit('log', 'warning', '权限不存在')
    }
  } catch (error: any) {
    emit('log', 'error', '撤销权限失败', error)
  }
}

const removePermission = (permission: string) => {
  const index = currentPermissions.indexOf(permission)
  if (index !== -1) {
    currentPermissions.splice(index, 1)
    addSecurityLog('warning', 'PERMISSION_REMOVED', `移除权限: ${permission}`)
    emit('log', 'warning', `移除权限: ${permission}`)
  }
}

const togglePolicy = (policy: any) => {
  addSecurityLog(
    'info',
    'POLICY_CHANGED',
    `${policy.enabled ? '启用' : '禁用'}安全策略: ${policy.name}`
  )
  emit('log', 'info', `${policy.enabled ? '启用' : '禁用'}安全策略: ${policy.name}`)
}

const addSecurityLog = (level: string, type: string, message: string, details?: string) => {
  securityLogs.push({
    timestamp: Date.now(),
    level,
    type,
    message,
    details
  })
  
  // 限制日志数量
  if (securityLogs.length > 100) {
    securityLogs.splice(0, securityLogs.length - 100)
  }
}

const clearSecurityLogs = () => {
  securityLogs.splice(0, securityLogs.length)
  emit('log', 'info', '清空安全日志')
}

// 辅助函数
const detectXSSThreats = (input: string): string[] => {
  const threats = []
  const patterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi
  ]
  
  patterns.forEach((pattern, index) => {
    if (pattern.test(input)) {
      threats.push(`威胁模式 ${index + 1}`)
    }
  })
  
  return threats
}

const sanitizeHTML = (input: string): string => {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<iframe[^>]*>/gi, '')
    .replace(/<object[^>]*>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/expression\s*\(/gi, '')
}

const hasUserPermission = (role: string, permission: string): boolean => {
  const permissions = rolePermissions[role] || []
  return permissions.includes('*') || permissions.includes(permission)
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 生命周期
onMounted(() => {
  addSecurityLog('info', 'SYSTEM_START', '安全管理器已启动')
  emit('log', 'info', '安全管理器演示已加载')
})
</script>

<style lang="less" scoped>
.security-demo {
  .demo-header {
    margin-bottom: var(--spacing-xl);
    
    h2 {
      margin-bottom: var(--spacing-sm);
      color: var(--text-primary);
    }
    
    p {
      color: var(--text-secondary);
      line-height: 1.6;
    }
  }
  
  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--spacing-lg);
    
    .full-width {
      grid-column: 1 / -1;
    }
  }
  
  .button-group {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }
  
  .security-result {
    margin-top: var(--spacing-md);
    
    h4 {
      margin-bottom: var(--spacing-sm);
      font-size: 16px;
    }
    
    .result-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm);
      border-radius: var(--border-radius);
      margin-bottom: var(--spacing-sm);
      
      &.safe {
        background: rgba(40, 167, 69, 0.1);
        border: 1px solid var(--success-color);
      }
      
      &.warning {
        background: rgba(255, 193, 7, 0.1);
        border: 1px solid var(--warning-color);
      }
      
      &.danger {
        background: rgba(220, 53, 69, 0.1);
        border: 1px solid var(--error-color);
      }
      
      .result-level {
        font-weight: bold;
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 4px;
        background: var(--bg-primary);
      }
    }
    
    .sanitized-content {
      margin-top: var(--spacing-sm);
      
      pre {
        background: var(--bg-secondary);
        padding: var(--spacing-sm);
        border-radius: var(--border-radius);
        font-size: 12px;
        overflow-x: auto;
      }
    }
  }
  
  .permissions-list {
    margin-top: var(--spacing-md);
    
    h4 {
      margin-bottom: var(--spacing-sm);
      font-size: 16px;
    }
    
    .permission-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm);
      margin-bottom: var(--spacing-xs);
      background: var(--bg-secondary);
      border-radius: var(--border-radius);
      
      .permission-name {
        font-family: monospace;
        color: var(--primary-color);
      }
    }
  }
  
  .policy-list {
    .policy-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
      background: var(--bg-secondary);
      border-radius: var(--border-radius);
      
      .policy-info {
        flex: 1;
        
        h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 16px;
        }
        
        p {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
        }
      }
      
      .policy-toggle {
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
          
          input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
            
            &:before {
              position: absolute;
              content: "";
              height: 18px;
              width: 18px;
              left: 3px;
              bottom: 3px;
              background-color: white;
              transition: .4s;
              border-radius: 50%;
            }
          }
          
          input:checked + .slider {
            background-color: var(--primary-color);
          }
          
          input:checked + .slider:before {
            transform: translateX(26px);
          }
        }
      }
    }
  }
  
  .security-logs {
    max-height: 300px;
    overflow-y: auto;
    
    .security-log-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) 0;
      border-bottom: 1px solid var(--border-color);
      font-family: monospace;
      font-size: 12px;
      
      &.error {
        background: rgba(220, 53, 69, 0.05);
      }
      
      &.warning {
        background: rgba(255, 193, 7, 0.05);
      }
      
      .log-time {
        color: var(--text-muted);
        min-width: 80px;
      }
      
      .log-level {
        font-weight: bold;
        min-width: 60px;
        
        &:contains('ERROR') {
          color: var(--error-color);
        }
        
        &:contains('WARNING') {
          color: var(--warning-color);
        }
        
        &:contains('INFO') {
          color: var(--info-color);
        }
      }
      
      .log-type {
        color: var(--primary-color);
        min-width: 120px;
      }
      
      .log-message {
        flex: 1;
        color: var(--text-primary);
      }
      
      .log-details {
        color: var(--text-muted);
        font-style: italic;
      }
    }
  }
}

@media (max-width: 768px) {
  .security-demo .demo-grid {
    grid-template-columns: 1fr;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .policy-item {
    flex-direction: column;
    align-items: flex-start !important;
    
    .policy-toggle {
      margin-top: var(--spacing-sm);
    }
  }
}
</style>
