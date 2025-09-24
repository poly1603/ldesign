<!--
  Package.json 编辑器
  
  用于编辑 package.json 配置文件
  
  @author LDesign Team
  @since 1.0.0
-->

<template>
  <div class="package-json-editor">
    <div class="editor-container">
      <div class="config-form">
        <h3>Package.json 配置</h3>
        
        <!-- 基本信息 -->
        <div class="config-section">
          <h4>基本信息</h4>
          <div class="form-group">
            <label class="form-label">项目名称</label>
            <input 
              v-model="localConfig.name"
              type="text"
              class="form-input"
              placeholder="请输入项目名称"
              @input="handleConfigChange"
            />
            <div class="form-help">项目的名称标识</div>
          </div>
          
          <div class="form-group">
            <label class="form-label">版本号</label>
            <input 
              v-model="localConfig.version"
              type="text"
              class="form-input"
              placeholder="请输入版本号"
              @input="handleConfigChange"
            />
            <div class="form-help">项目的版本号（遵循 SemVer 规范）</div>
          </div>
          
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea 
              v-model="localConfig.description"
              class="form-textarea"
              placeholder="请输入项目描述"
              rows="3"
              @input="handleConfigChange"
            ></textarea>
            <div class="form-help">项目的简短描述</div>
          </div>
          
          <div class="form-group">
            <label class="form-label">作者</label>
            <input 
              v-model="localConfig.author"
              type="text"
              class="form-input"
              placeholder="请输入作者信息"
              @input="handleConfigChange"
            />
            <div class="form-help">项目作者信息</div>
          </div>
          
          <div class="form-group">
            <label class="form-label">许可证</label>
            <select 
              v-model="localConfig.license"
              class="form-select"
              @change="handleConfigChange"
            >
              <option value="MIT">MIT</option>
              <option value="Apache-2.0">Apache-2.0</option>
              <option value="GPL-3.0">GPL-3.0</option>
              <option value="BSD-3-Clause">BSD-3-Clause</option>
              <option value="ISC">ISC</option>
            </select>
            <div class="form-help">项目的开源许可证</div>
          </div>
        </div>
        
        <!-- 脚本配置 -->
        <div class="config-section">
          <h4>脚本配置</h4>
          <div class="scripts-list">
            <div 
              v-for="(script, name) in localConfig.scripts" 
              :key="name"
              class="script-item"
            >
              <div class="script-name">{{ name }}</div>
              <input 
                v-model="localConfig.scripts[name]"
                type="text"
                class="form-input script-command"
                placeholder="请输入脚本命令"
                @input="handleConfigChange"
              />
              <button 
                class="btn-remove"
                @click="removeScript(name)"
                title="删除脚本"
              >
                ×
              </button>
            </div>
          </div>
          
          <div class="add-script">
            <input 
              v-model="newScriptName"
              type="text"
              class="form-input"
              placeholder="脚本名称"
              style="width: 150px; margin-right: 8px;"
            />
            <input 
              v-model="newScriptCommand"
              type="text"
              class="form-input"
              placeholder="脚本命令"
              style="flex: 1; margin-right: 8px;"
            />
            <button 
              class="btn btn-secondary"
              @click="addScript"
              :disabled="!newScriptName || !newScriptCommand"
            >
              添加脚本
            </button>
          </div>
        </div>
        
        <!-- 依赖管理 -->
        <div class="config-section">
          <h4>依赖管理</h4>
          
          <!-- 生产依赖 -->
          <div class="dependency-group">
            <h5>生产依赖 (dependencies)</h5>
            <div class="dependencies-list">
              <div 
                v-for="(version, name) in localConfig.dependencies" 
                :key="name"
                class="dependency-item"
              >
                <div class="dependency-name">{{ name }}</div>
                <input 
                  v-model="localConfig.dependencies[name]"
                  type="text"
                  class="form-input dependency-version"
                  placeholder="版本号"
                  @input="handleConfigChange"
                />
                <button 
                  class="btn-remove"
                  @click="removeDependency('dependencies', name)"
                  title="删除依赖"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div class="add-dependency">
              <input 
                v-model="newDepName"
                type="text"
                class="form-input"
                placeholder="依赖包名"
                style="flex: 1; margin-right: 8px;"
              />
              <input 
                v-model="newDepVersion"
                type="text"
                class="form-input"
                placeholder="版本号"
                style="width: 120px; margin-right: 8px;"
              />
              <button 
                class="btn btn-secondary"
                @click="addDependency('dependencies')"
                :disabled="!newDepName || !newDepVersion"
              >
                添加依赖
              </button>
            </div>
          </div>
          
          <!-- 开发依赖 -->
          <div class="dependency-group">
            <h5>开发依赖 (devDependencies)</h5>
            <div class="dependencies-list">
              <div 
                v-for="(version, name) in localConfig.devDependencies" 
                :key="name"
                class="dependency-item"
              >
                <div class="dependency-name">{{ name }}</div>
                <input 
                  v-model="localConfig.devDependencies[name]"
                  type="text"
                  class="form-input dependency-version"
                  placeholder="版本号"
                  @input="handleConfigChange"
                />
                <button 
                  class="btn-remove"
                  @click="removeDependency('devDependencies', name)"
                  title="删除依赖"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div class="add-dependency">
              <input 
                v-model="newDevDepName"
                type="text"
                class="form-input"
                placeholder="依赖包名"
                style="flex: 1; margin-right: 8px;"
              />
              <input 
                v-model="newDevDepVersion"
                type="text"
                class="form-input"
                placeholder="版本号"
                style="width: 120px; margin-right: 8px;"
              />
              <button 
                class="btn btn-secondary"
                @click="addDependency('devDependencies')"
                :disabled="!newDevDepName || !newDevDepVersion"
              >
                添加开发依赖
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 预览区域 -->
      <div class="config-preview">
        <h3>配置预览</h3>
        <pre class="config-code"><code>{{ configPreview }}</code></pre>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="editor-actions">
      <button 
        class="btn btn-secondary"
        @click="resetConfig"
        :disabled="!hasChanges"
      >
        重置
      </button>
      <button 
        class="btn btn-primary"
        @click="saveConfig"
        :disabled="!hasChanges"
      >
        保存配置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useConfigStore } from '../stores/config'
import type { PackageJsonConfig } from '../types/config'
import { DEFAULT_PACKAGE_CONFIG } from '../constants/defaults'

// 状态管理
const configStore = useConfigStore()

// 本地配置状态
const localConfig = ref<PackageJsonConfig>({ ...DEFAULT_PACKAGE_CONFIG })

// 新增项的输入状态
const newScriptName = ref('')
const newScriptCommand = ref('')
const newDepName = ref('')
const newDepVersion = ref('')
const newDevDepName = ref('')
const newDevDepVersion = ref('')

// 计算属性
const hasChanges = computed(() => {
  const original = configStore.packageConfig
  if (!original) return false
  return JSON.stringify(localConfig.value) !== JSON.stringify(original)
})

const configPreview = computed(() => {
  return JSON.stringify(localConfig.value, null, 2)
})

// 方法
const handleConfigChange = () => {
  // 更新 store 中的配置
  configStore.updateConfig('package', localConfig.value)
}

const addScript = () => {
  if (newScriptName.value && newScriptCommand.value) {
    localConfig.value.scripts[newScriptName.value] = newScriptCommand.value
    newScriptName.value = ''
    newScriptCommand.value = ''
    handleConfigChange()
  }
}

const removeScript = (name: string) => {
  delete localConfig.value.scripts[name]
  handleConfigChange()
}

const addDependency = (type: 'dependencies' | 'devDependencies') => {
  const name = type === 'dependencies' ? newDepName.value : newDevDepName.value
  const version = type === 'dependencies' ? newDepVersion.value : newDevDepVersion.value
  
  if (name && version) {
    localConfig.value[type][name] = version
    
    if (type === 'dependencies') {
      newDepName.value = ''
      newDepVersion.value = ''
    } else {
      newDevDepName.value = ''
      newDevDepVersion.value = ''
    }
    
    handleConfigChange()
  }
}

const removeDependency = (type: 'dependencies' | 'devDependencies', name: string) => {
  delete localConfig.value[type][name]
  handleConfigChange()
}

const resetConfig = () => {
  if (configStore.packageConfig) {
    localConfig.value = { ...configStore.packageConfig }
  } else {
    localConfig.value = { ...DEFAULT_PACKAGE_CONFIG }
  }
}

const saveConfig = async () => {
  try {
    await configStore.saveConfig('package')
    // 保存成功后的处理
  } catch (error) {
    console.error('保存配置失败:', error)
  }
}

// 监听 store 中的配置变化
watch(
  () => configStore.packageConfig,
  (newConfig) => {
    if (newConfig) {
      localConfig.value = { ...newConfig }
    }
  },
  { immediate: true }
)

// 生命周期
onMounted(() => {
  // 组件挂载时初始化配置
  if (configStore.packageConfig) {
    localConfig.value = { ...configStore.packageConfig }
  }
})
</script>

<style lang="less" scoped>
// 基础样式与其他编辑器相同
.package-json-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-container {
  flex: 1;
  display: flex;
  gap: 24px;
  overflow: hidden;
}

.config-form {
  flex: 1;
  overflow-y: auto;
  .scrollbar();
  
  h3 {
    margin: 0 0 24px 0;
    font-size: 18px;
    font-weight: 600;
    color: @text-color-primary;
  }
}

.config-section {
  .card();
  margin-bottom: 24px;
  
  h4 {
    .card-header();
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  
  .form-group {
    .form-group();
    padding: 0 20px;
    
    &:first-child {
      padding-top: 20px;
    }
    
    &:last-child {
      padding-bottom: 20px;
    }
  }
}

.form-label {
  .form-label();
}

.form-input,
.form-select,
.form-textarea {
  .input-base();
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-help {
  .form-help();
}

// 脚本相关样式
.scripts-list,
.dependencies-list {
  margin-bottom: 16px;
}

.script-item,
.dependency-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  
  .script-name,
  .dependency-name {
    min-width: 120px;
    font-weight: 500;
    color: @text-color-primary;
  }
  
  .script-command {
    flex: 1;
  }
  
  .dependency-version {
    width: 120px;
  }
}

.add-script,
.add-dependency {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background-color: var(--ldesign-bg-color-component-hover);
  border-radius: var(--ls-border-radius-base);
}

.dependency-group {
  margin-bottom: 24px;
  
  h5 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: @text-color-secondary;
    padding: 0 20px;
  }
}

.btn-remove {
  .button-reset();
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--ldesign-error-color);
  color: white;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--ldesign-error-color-hover);
    transform: scale(1.1);
  }
}

.config-preview {
  width: 400px;
  .card();
  display: flex;
  flex-direction: column;
  
  h3 {
    .card-header();
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  
  .config-code {
    .card-content();
    flex: 1;
    margin: 0;
    background-color: var(--ldesign-bg-color-component-hover);
    border-radius: var(--ls-border-radius-base);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    line-height: 1.4;
    overflow: auto;
    .scrollbar();
    
    code {
      background: none;
      padding: 0;
      color: @text-color-primary;
    }
  }
}

.editor-actions {
  padding: 20px 0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid @border-color;
}

.btn {
  .button-base();
  padding: 8px 16px;
  font-size: 14px;
  
  &.btn-primary {
    .button-primary();
  }
  
  &.btn-secondary {
    .button-secondary();
  }
}
</style>
