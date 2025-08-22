<script setup lang="ts">
import { useEngine } from '@ldesign/engine/vue'
import { computed, onMounted, ref } from 'vue'

// 使用引擎组合式API
const { engine } = useEngine()

// 安全状态
const securityStatus = ref({
  overallScore: 85,
  xssProtection: true,
  csrfProtection: true,
  sqlInjectionProtection: true,
  contentSecurityPolicy: true,
  httpsOnly: true,
  dataEncryption: true,
  accessControl: true,
  inputValidation: true,
})

// 安全事件日志
const securityEvents = ref([
  {
    id: 1,
    type: 'blocked',
    category: 'XSS',
    description: '阻止了潜在的XSS攻击',
    severity: 'high',
    sourceIp: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    timestamp: new Date(Date.now() - 300000).toLocaleString(),
  },
  {
    id: 2,
    type: 'warning',
    category: 'Authentication',
    description: '检测到多次登录失败',
    severity: 'medium',
    sourceIp: '192.168.1.200',
    userAgent: 'Mozilla/5.0...',
    timestamp: new Date(Date.now() - 600000).toLocaleString(),
  },
  {
    id: 3,
    type: 'info',
    category: 'Access',
    description: '用户访问敏感页面',
    severity: 'low',
    sourceIp: '192.168.1.50',
    userAgent: 'Mozilla/5.0...',
    timestamp: new Date(Date.now() - 900000).toLocaleString(),
  },
])

// 安全规则配置
const securityRules = ref([
  {
    id: 'xss-protection',
    name: 'XSS防护',
    description: '防止跨站脚本攻击',
    enabled: true,
    category: 'injection',
    level: 'strict',
    hits: 23,
  },
  {
    id: 'csrf-protection',
    name: 'CSRF防护',
    description: '防止跨站请求伪造',
    enabled: true,
    category: 'forgery',
    level: 'medium',
    hits: 5,
  },
  {
    id: 'sql-injection',
    name: 'SQL注入防护',
    description: '防止SQL注入攻击',
    enabled: true,
    category: 'injection',
    level: 'strict',
    hits: 12,
  },
  {
    id: 'rate-limiting',
    name: '请求限流',
    description: '限制API请求频率',
    enabled: false,
    category: 'ddos',
    level: 'medium',
    hits: 0,
  },
])

// 访问控制列表
const accessControlList = ref([
  {
    id: 1,
    type: 'allow',
    target: '192.168.1.0/24',
    description: '内网IP范围',
    action: '允许访问',
    priority: 100,
    active: true,
  },
  {
    id: 2,
    type: 'block',
    target: '10.0.0.50',
    description: '可疑IP地址',
    action: '拒绝访问',
    priority: 200,
    active: true,
  },
  {
    id: 3,
    type: 'monitor',
    target: 'user:admin',
    description: '管理员用户',
    action: '监控访问',
    priority: 50,
    active: true,
  },
])

// 安全测试结果
const securityTests = ref([
  {
    id: 1,
    name: 'XSS漏洞扫描',
    status: 'passed',
    score: 95,
    vulnerabilities: 0,
    lastRun: new Date().toLocaleString(),
    details: ' 未发现XSS漏洞',
  },
  {
    id: 2,
    name: 'SQL注入测试',
    status: 'passed',
    score: 88,
    vulnerabilities: 0,
    lastRun: new Date(Date.now() - 3600000).toLocaleString(),
    details: '所有输入点都已正确过滤',
  },
  {
    id: 3,
    name: '权限测试',
    status: 'warning',
    score: 75,
    vulnerabilities: 2,
    lastRun: new Date(Date.now() - 7200000).toLocaleString(),
    details: '发现2个权限配置问题',
  },
])

// 新安全规则表单
const newRule = ref({
  name: '',
  description: '',
  category: 'injection',
  level: 'medium',
})

// 新访问控制表单
const newAcl = ref({
  type: 'allow',
  target: '',
  description: '',
  priority: 100,
})

// 计算属性
const criticalEvents = computed(() => {
  return securityEvents.value.filter(event => event.severity === 'high').length
})

const activeRules = computed(() => {
  return securityRules.value.filter(rule => rule.enabled).length
})

const blockedRequests = computed(() => {
  return securityEvents.value.filter(event => event.type === 'blocked').length
})

const securityHealth = computed(() => {
  const enabledFeatures = Object.values(securityStatus.value).filter(Boolean).length - 1 // 减去 overallScore
  const totalFeatures = Object.keys(securityStatus.value).length - 1
  return Math.round((enabledFeatures / totalFeatures) * 100)
})

// 切换安全功能
function toggleSecurityFeature(feature: string) {
  securityStatus.value[feature] = !securityStatus.value[feature]
  
  const action = securityStatus.value[feature] ? '启用' : '禁用'
  addSecurityEvent('info', 'Security', `${feature} 已${action}`, 'low')
  
  engine.value?.notifications.show({
    title: `🔒 安全功能${action}`,
    message: `${feature} 已${action}`,
    type: securityStatus.value[feature] ? 'success' : 'warning',
  })
}

// 切换安全规则
function toggleSecurityRule(ruleId: string) {
  const rule = securityRules.value.find(r => r.id === ruleId)
  if (rule) {
    rule.enabled = !rule.enabled
    
    addSecurityEvent('info', 'Rules', `安全规则 ${rule.name} 已${rule.enabled ? '启用' : '禁用'}`, 'low')
    
    engine.value?.notifications.show({
      title: rule.enabled ? '✅ 规则已启用' : '⏸️ 规则已禁用',
      message: `${rule.name} 已${rule.enabled ? '启用' : '禁用'}`,
      type: rule.enabled ? 'success' : 'warning',
    })
  }
}

// 运行安全测试
function runSecurityTest(testName: string) {
  const test = securityTests.value.find(t => t.name === testName)
  if (test) {
    test.status = 'running'
    
    engine.value?.notifications.show({
      title: '🔍 安全测试开始',
      message: `正在运行 ${testName}...`,
      type: 'info',
    })
    
    // 模拟测试过程
    setTimeout(() => {
      test.status = Math.random() > 0.3 ? 'passed' : 'warning'
      test.score = Math.floor(Math.random() * 30) + 70
      test.vulnerabilities = test.status === 'warning' ? Math.floor(Math.random() * 5) + 1 : 0
      test.lastRun = new Date().toLocaleString()
      test.details = test.status === 'passed' ? '测试通过，未发现安全问题' : `发现 ${test.vulnerabilities} 个潜在问题`
      
      addSecurityEvent('info', 'Testing', `安全测试 ${testName} 完成`, 'low')
      
      engine.value?.notifications.show({
        title: test.status === 'passed' ? '✅ 测试通过' : '⚠️ 发现问题',
        message: `${testName}: ${test.details}`,
        type: test.status === 'passed' ? 'success' : 'warning',
      })
    }, 3000)
  }
}

// 创建安全规则
function createSecurityRule() {
  if (!newRule.value.name || !newRule.value.description) {
    engine.value?.notifications.show({
      title: '❌ 输入错误',
      message: '请填写规则名称和描述',
      type: 'error',
    })
    return
  }
  
  const rule = {
    id: `custom-${Date.now()}`,
    name: newRule.value.name,
    description: newRule.value.description,
    enabled: true,
    category: newRule.value.category,
    level: newRule.value.level,
    hits: 0,
  }
  
  securityRules.value.push(rule)
  
  addSecurityEvent('info', 'Rules', `创建新安全规则: ${rule.name}`, 'low')
  
  // 重置表单
  newRule.value = {
    name: '',
    description: '',
    category: 'injection',
    level: 'medium',
  }
  
  engine.value?.notifications.show({
    title: '🎉 规则创建成功',
    message: `安全规则 ${rule.name} 已创建`,
    type: 'success',
  })
}

// 创建访问控制规则
function createAccessControl() {
  if (!newAcl.value.target || !newAcl.value.description) {
    engine.value?.notifications.show({
      title: '❌ 输入错误',
      message: '请填写目标和描述',
      type: 'error',
    })
    return
  }
  
  const acl = {
    id: Date.now(),
    type: newAcl.value.type,
    target: newAcl.value.target,
    description: newAcl.value.description,
    action: newAcl.value.type === 'allow' ? '允许访问' : newAcl.value.type === 'block' ? '拒绝访问' : '监控访问',
    priority: newAcl.value.priority,
    active: true,
  }
  
  accessControlList.value.push(acl)
  
  addSecurityEvent('info', 'Access', `创建新访问控制规则: ${acl.target}`, 'low')
  
  // 重置表单
  newAcl.value = {
    type: 'allow',
    target: '',
    description: '',
    priority: 100,
  }
  
  engine.value?.notifications.show({
    title: '🎉 访问控制规则创建成功',
    message: `已创建针对 ${acl.target} 的规则`,
    type: 'success',
  })
}

// 切换访问控制规则
function toggleAccessControl(aclId: number) {
  const acl = accessControlList.value.find(a => a.id === aclId)
  if (acl) {
    acl.active = !acl.active
    
    addSecurityEvent('info', 'Access', `访问控制规则 ${acl.target} 已${acl.active ? '启用' : '禁用'}`, 'low')
    
    engine.value?.notifications.show({
      title: acl.active ? '✅ 规则已启用' : '⏸️ 规则已禁用',
      message: `${acl.target} 的访问控制规则已${acl.active ? '启用' : '禁用'}`,
      type: acl.active ? 'success' : 'warning',
    })
  }
}

// 模拟安全攻击
function simulateAttack(attackType: string) {
  const attacks = {
    xss: {
      category: 'XSS',
      description: '检测到XSS攻击尝试',
      severity: 'high',
    },
    sqlinjection: {
      category: 'SQL Injection',
      description: '检测到SQL注入攻击',
      severity: 'high',
    },
    bruteforce: {
      category: 'Brute Force',
      description: '检测到暴力破解尝试',
      severity: 'medium',
    },
  }
  
  const attack = attacks[attackType]
  if (attack) {
    addSecurityEvent('blocked', attack.category, attack.description, attack.severity)
    
    // 更新规则命中数
    const rule = securityRules.value.find(r => r.category === attackType.replace('injection', ''))
    if (rule) {
      rule.hits++
    }
    
    engine.value?.notifications.show({
      title: '🛡️ 攻击已阻止',
      message: attack.description,
      type: 'success',
    })
  }
}

// 添加安全事件
function addSecurityEvent(type: string, category: string, description: string, severity: string) {
  const event = {
    id: Date.now(),
    type,
    category,
    description,
    severity,
    sourceIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
    userAgent: 'Mozilla/5.0 (Demo)',
    timestamp: new Date().toLocaleString(),
  }
  
  securityEvents.value.unshift(event)
  
  // 限制事件数量
  if (securityEvents.value.length > 100) {
    securityEvents.value = securityEvents.value.slice(0, 100)
  }
}

// 清除安全事件
function clearSecurityEvents() {
  securityEvents.value = []
  
  engine.value?.notifications.show({
    title: '🗑️ 事件日志已清除',
    message: '所有安全事件日志已清除',
    type: 'info',
  })
}

// 导出安全报告
function exportSecurityReport() {
  const report = {
    timestamp: new Date().toISOString(),
    securityStatus: securityStatus.value,
    events: securityEvents.value,
    rules: securityRules.value,
    accessControl: accessControlList.value,
    tests: securityTests.value,
  }
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `security-report-${Date.now()}.json`
  a.click()
  
  URL.revokeObjectURL(url)
  
  engine.value?.notifications.show({
    title: '📊 安全报告导出成功',
    message: '安全报告已导出到文件',
    type: 'success',
  })
}

// 组件挂载
onMounted(() => {
  engine.value?.logger.info('安全防护页面已加载')
})
</script>

<template>
  <div class="security">
    <div class="page-header">
      <h1>🔒 安全防护</h1>
      <p>全面的安全防护体系，保护应用免受各种网络攻击</p>
    </div>

    <!-- 安全概览 -->
    <div class="security-overview">
      <div class="security-score">
        <div class="score-circle">
          <div class="score-value">{{ securityStatus.overallScore }}</div>
          <div class="score-label">安全评分</div>
        </div>
      </div>
      
      <div class="security-stats">
        <div class="stat-card">
          <div class="stat-icon">🚨</div>
          <div class="stat-content">
            <div class="stat-value">{{ criticalEvents }}</div>
            <div class="stat-label">关键事件</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🛡️</div>
          <div class="stat-content">
            <div class="stat-value">{{ activeRules }}</div>
            <div class="stat-label">活跃规则</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🚫</div>
          <div class="stat-content">
            <div class="stat-value">{{ blockedRequests }}</div>
            <div class="stat-label">已阻止</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💚</div>
          <div class="stat-content">
            <div class="stat-value">{{ securityHealth }}%</div>
            <div class="stat-label">安全健康</div>
          </div>
        </div>
      </div>
      
      <div class="overview-actions">
        <button class="btn btn-primary" @click="exportSecurityReport">
          📊 导出报告
        </button>
        <button class="btn btn-secondary" @click="clearSecurityEvents">
          🗑️ 清除日志
        </button>
      </div>
    </div>

    <!-- 安全功能开关 -->
    <div class="section">
      <h2>🛡️ 安全功能</h2>
      <div class="security-features">
        <div v-for="(value, key) in securityStatus" :key="key" class="feature-toggle">
          <template v-if="key !== 'overallScore'">
            <div class="feature-info">
              <div class="feature-name">{{ getFeatureName(key) }}</div>
              <div class="feature-description">{{ getFeatureDescription(key) }}</div>
            </div>
            <div class="feature-control">
              <button 
                :class="['toggle-btn', value ? 'enabled' : 'disabled']"
                @click="toggleSecurityFeature(key)"
              >
                {{ value ? '✅' : '❌' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 攻击模拟演示 -->
    <div class="section">
      <h2>🎯 攻击模拟演示</h2>
      <div class="attack-simulation">
        <p class="simulation-desc">模拟各种网络攻击，测试安全防护效果</p>
        <div class="simulation-buttons">
          <button class="btn btn-danger" @click="simulateAttack('xss')">
            🚨 模拟XSS攻击
          </button>
          <button class="btn btn-danger" @click="simulateAttack('sqlinjection')">
            🚨 模拟SQL注入
          </button>
          <button class="btn btn-danger" @click="simulateAttack('bruteforce')">
            🚨 模拟暴力破解
          </button>
        </div>
      </div>
    </div>

    <!-- 安全规则管理 -->
    <div class="section">
      <h2>📋 安全规则</h2>
      <div class="rules-grid">
        <div v-for="rule in securityRules" :key="rule.id" class="rule-card">
          <div class="rule-header">
            <div class="rule-info">
              <h3 class="rule-name">{{ rule.name }}</h3>
              <p class="rule-description">{{ rule.description }}</p>
            </div>
            <div class="rule-control">
              <button 
                :class="['rule-toggle', rule.enabled ? 'enabled' : 'disabled']"
                @click="toggleSecurityRule(rule.id)"
              >
                {{ rule.enabled ? '✅' : '❌' }}
              </button>
            </div>
          </div>
          
          <div class="rule-meta">
            <span :class="['rule-category', rule.category]">{{ rule.category }}</span>
            <span :class="['rule-level', rule.level]">{{ rule.level }}</span>
            <span class="rule-hits">{{ rule.hits }} 次命中</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建新规则 -->
    <div class="section">
      <h2>➕ 创建安全规则</h2>
      <div class="create-rule">
        <div class="form-row">
          <div class="form-group">
            <label>规则名称</label>
            <input 
              v-model="newRule.name" 
              type="text" 
              placeholder="输入规则名称"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label>分类</label>
            <select v-model="newRule.category" class="form-select">
              <option value="injection">注入攻击</option>
              <option value="forgery">伪造攻击</option>
              <option value="ddos">DDoS攻击</option>
              <option value="malware">恶意软件</option>
            </select>
          </div>
          <div class="form-group">
            <label>严格级别</label>
            <select v-model="newRule.level" class="form-select">
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="strict">严格</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label>规则描述</label>
          <textarea 
            v-model="newRule.description" 
            placeholder="输入规则描述"
            class="form-textarea"
          />
        </div>
        
        <button class="btn btn-primary" @click="createSecurityRule">
          🎉 创建规则
        </button>
      </div>
    </div>

    <!-- 访问控制 -->
    <div class="section">
      <h2>🚪 访问控制</h2>
      <div class="access-control-list">
        <div v-for="acl in accessControlList" :key="acl.id" class="acl-item">
          <div class="acl-content">
            <div class="acl-target">{{ acl.target }}</div>
            <div class="acl-description">{{ acl.description }}</div>
            <div class="acl-meta">
              <span :class="['acl-type', acl.type]">{{ acl.action }}</span>
              <span class="acl-priority">优先级: {{ acl.priority }}</span>
            </div>
          </div>
          <div class="acl-control">
            <button 
              :class="['acl-toggle', acl.active ? 'active' : 'inactive']"
              @click="toggleAccessControl(acl.id)"
            >
              {{ acl.active ? '✅' : '❌' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建访问控制规则 -->
    <div class="section">
      <h2>➕ 创建访问控制规则</h2>
      <div class="create-acl">
        <div class="form-row">
          <div class="form-group">
            <label>规则类型</label>
            <select v-model="newAcl.type" class="form-select">
              <option value="allow">允许</option>
              <option value="block">阻止</option>
              <option value="monitor">监控</option>
            </select>
          </div>
          <div class="form-group">
            <label>目标</label>
            <input 
              v-model="newAcl.target" 
              type="text" 
              placeholder="IP地址或用户ID"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label>优先级</label>
            <input 
              v-model.number="newAcl.priority" 
              type="number" 
              min="1"
              max="1000"
              class="form-input"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label>描述</label>
          <input 
            v-model="newAcl.description" 
            type="text" 
            placeholder="输入规则描述"
            class="form-input"
          >
        </div>
        
        <button class="btn btn-primary" @click="createAccessControl">
          🎉 创建规则
        </button>
      </div>
    </div>

    <!-- 安全测试 -->
    <div class="section">
      <h2>🧪 安全测试</h2>
      <div class="tests-grid">
        <div v-for="test in securityTests" :key="test.id" class="test-card">
          <div class="test-header">
            <div class="test-info">
              <h3 class="test-name">{{ test.name }}</h3>
              <div class="test-meta">
                <span :class="['test-status', test.status]">
                  {{ test.status === 'passed' ? '✅ 通过' : 
                     test.status === 'warning' ? '⚠️ 警告' : '⏳ 运行中' }}
                </span>
                <span class="test-time">{{ test.lastRun }}</span>
              </div>
            </div>
            <div v-if="test.score > 0" class="test-score">
              <div class="score-display">
                <div class="score-number">{{ test.score }}</div>
                <div class="score-text">分</div>
              </div>
            </div>
          </div>
          
          <div class="test-details">
            <div class="test-vulnerabilities">
              <span class="vuln-label">漏洞数:</span>
              <span :class="['vuln-count', test.vulnerabilities > 0 ? 'has-vulns' : 'no-vulns']">
                {{ test.vulnerabilities }}
              </span>
            </div>
            <div class="test-description">{{ test.details }}</div>
          </div>
          
          <div class="test-actions">
            <button 
              class="btn btn-primary"
              :disabled="test.status === 'running'"
              @click="runSecurityTest(test.name)"
            >
              {{ test.status === 'running' ? '⏳ 运行中...' : '🧪 运行测试' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 安全事件日志 -->
    <div class="section">
      <h2>📚 安全事件日志</h2>
      <div class="events-container">
        <div v-if="securityEvents.length === 0" class="empty-events">
          <div class="empty-icon">📚</div>
          <p>暂无安全事件</p>
        </div>
        
        <div v-for="event in securityEvents.slice(0, 20)" :key="event.id" class="event-item">
          <div class="event-indicator">
            <span :class="['event-type', event.type]">
              {{ event.type === 'blocked' ? '🛡️' : 
                 event.type === 'warning' ? '⚠️' : 'ℹ️' }}
            </span>
          </div>
          
          <div class="event-content">
            <div class="event-description">{{ event.description }}</div>
            <div class="event-meta">
              <span class="event-category">{{ event.category }}</span>
              <span :class="['event-severity', event.severity]">{{ event.severity }}</span>
              <span class="event-ip">{{ event.sourceIp }}</span>
              <span class="event-time">{{ event.timestamp }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    getFeatureName(key) {
      const names = {
        xssProtection: 'XSS防护',
        csrfProtection: 'CSRF防护', 
        sqlInjectionProtection: 'SQL注入防护',
        contentSecurityPolicy: '内容安全策略',
        httpsOnly: 'HTTPS强制',
        dataEncryption: '数据加密',
        accessControl: '访问控制',
        inputValidation: '输入验证',
      }
      return names[key] || key
    },
    
    getFeatureDescription(key) {
      const descriptions = {
        xssProtection: '防止跨站脚本攻击',
        csrfProtection: '防止跨站请求伪造',
        sqlInjectionProtection: '防止SQL注入攻击',
        contentSecurityPolicy: '限制资源加载策略',
        httpsOnly: '强制使用HTTPS协议',
        dataEncryption: '加密敏感数据',
        accessControl: '控制用户访问权限',
        inputValidation: '验证用户输入数据',
      }
      return descriptions[key] || key
    },
  },
}
</script>

<style scoped>
.security {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
}

.security-overview {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: center;
}

.security-score {
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.score-value {
  font-size: 2.5rem;
  font-weight: bold;
}

.score-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.security-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #28a745;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.overview-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section {
  margin-bottom: 3rem;
}

.section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.security-features {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.feature-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.feature-toggle:last-child {
  border-bottom: none;
}

.feature-info {
  flex: 1;
}

.feature-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.feature-description {
  color: #666;
  font-size: 0.9rem;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s;
}

.toggle-btn:hover {
  transform: scale(1.1);
}

.attack-simulation {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.simulation-desc {
  color: #666;
  margin-bottom: 1.5rem;
}

.simulation-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.rule-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.rule-name {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.rule-description {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.rule-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.rule-category {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: capitalize;
}

.rule-category.injection {
  background: #f8d7da;
  color: #721c24;
}

.rule-category.forgery {
  background: #fff3cd;
  color: #856404;
}

.rule-category.ddos {
  background: #d1ecf1;
  color: #0c5460;
}

.rule-level {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.rule-level.low {
  background: #d4edda;
  color: #155724;
}

.rule-level.medium {
  background: #fff3cd;
  color: #856404;
}

.rule-level.strict {
  background: #f8d7da;
  color: #721c24;
}

.rule-hits {
  color: #666;
  font-size: 0.9rem;
}

.create-rule,
.create-acl {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #28a745;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.access-control-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.acl-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.acl-item:last-child {
  border-bottom: none;
}

.acl-content {
  flex: 1;
}

.acl-target {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.acl-description {
  color: #666;
  margin-bottom: 0.5rem;
}

.acl-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.acl-type {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.acl-type.allow {
  background: #d4edda;
  color: #155724;
}

.acl-type.block {
  background: #f8d7da;
  color: #721c24;
}

.acl-type.monitor {
  background: #d1ecf1;
  color: #0c5460;
}

.acl-priority {
  color: #666;
  font-size: 0.9rem;
}

.tests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.test-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.test-name {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.test-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
}

.test-status {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.test-status.passed {
  background: #d4edda;
  color: #155724;
}

.test-status.warning {
  background: #fff3cd;
  color: #856404;
}

.test-status.running {
  background: #d1ecf1;
  color: #0c5460;
}

.test-time {
  color: #666;
}

.score-display {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.score-number {
  font-size: 2rem;
  font-weight: bold;
  color: #28a745;
}

.score-text {
  font-size: 0.8rem;
  color: #666;
}

.test-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.test-vulnerabilities {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.vuln-label {
  font-weight: bold;
  color: #666;
}

.vuln-count.has-vulns {
  color: #dc3545;
  font-weight: bold;
}

.vuln-count.no-vulns {
  color: #28a745;
  font-weight: bold;
}

.test-description {
  color: #2c3e50;
}

.events-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-height: 500px;
  overflow-y: auto;
}

.empty-events {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.event-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.event-item:last-child {
  border-bottom: none;
}

.event-indicator {
  font-size: 1.5rem;
}

.event-content {
  flex: 1;
}

.event-description {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.event-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
}

.event-category {
  background: #ecf0f1;
  color: #2c3e50;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
}

.event-severity {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
}

.event-severity.high {
  background: #f8d7da;
  color: #721c24;
}

.event-severity.medium {
  background: #fff3cd;
  color: #856404;
}

.event-severity.low {
  background: #d4edda;
  color: #155724;
}

.event-ip {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #666;
}

.event-time {
  color: #666;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #28a745;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #218838;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .security-overview {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .security-stats {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .simulation-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .rules-grid {
    grid-template-columns: 1fr;
  }
  
  .tests-grid {
    grid-template-columns: 1fr;
  }
  
  .test-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .acl-item {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .event-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
