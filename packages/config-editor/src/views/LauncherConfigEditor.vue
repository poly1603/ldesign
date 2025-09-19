<!--
  Launcher 配置编辑器
  
  用于编辑 launcher.config.ts 配置文件
  
  @author LDesign Team
  @since 1.0.0
-->

<template>
  <div class="launcher-config-editor">
    <div class="editor-container">
      <div class="config-form">
        <h3>Launcher 配置</h3>

        <!-- 服务器配置 -->
        <div class="config-section">
          <h4>服务器配置</h4>
          <div class="form-group">
            <label class="form-label">端口号</label>
            <input v-model.number="localConfig.server.port" type="number" class="form-input" placeholder="请输入端口号"
              @input="handleConfigChange" />
            <div class="form-help">开发服务器监听的端口号</div>
          </div>

          <div class="form-group">
            <label class="form-label">主机地址</label>
            <input v-model="localConfig.server.host" type="text" class="form-input" placeholder="请输入主机地址"
              @input="handleConfigChange" />
            <div class="form-help">开发服务器绑定的主机地址</div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <input v-model="localConfig.server.open" type="checkbox" @change="handleConfigChange" />
              自动打开浏览器
            </label>
            <div class="form-help">启动时是否自动打开浏览器</div>
          </div>
        </div>

        <!-- 构建配置 -->
        <div class="config-section">
          <h4>构建配置</h4>
          <div class="form-group">
            <label class="form-label">输出目录</label>
            <input v-model="localConfig.build.outDir" type="text" class="form-input" placeholder="请输入输出目录"
              @input="handleConfigChange" />
            <div class="form-help">构建输出的目录路径</div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <input v-model="localConfig.build.sourcemap" type="checkbox" @change="handleConfigChange" />
              生成 Source Map
            </label>
            <div class="form-help">是否生成源码映射文件</div>
          </div>

          <div class="form-group">
            <label class="form-label">压缩方式</label>
            <select v-model="localConfig.build.minify" class="form-select" @change="handleConfigChange">
              <option value="terser">Terser</option>
              <option value="esbuild">ESBuild</option>
              <option value="false">不压缩</option>
            </select>
            <div class="form-help">代码压缩工具选择</div>
          </div>
        </div>

        <!-- Launcher 配置 -->
        <div class="config-section">
          <h4>Launcher 配置</h4>
          <div class="form-group">
            <label class="form-label">日志级别</label>
            <select v-model="localConfig.launcher.logLevel" class="form-select" @change="handleConfigChange">
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>
            <div class="form-help">设置日志输出级别</div>
          </div>

          <div class="form-group">
            <label class="form-label">运行模式</label>
            <select v-model="localConfig.launcher.mode" class="form-select" @change="handleConfigChange">
              <option value="development">开发模式</option>
              <option value="production">生产模式</option>
              <option value="test">测试模式</option>
            </select>
            <div class="form-help">设置应用运行模式</div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <input v-model="localConfig.launcher.autoRestart" type="checkbox" @change="handleConfigChange" />
              启用自动重启
            </label>
            <div class="form-help">文件变化时是否自动重启服务</div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <input v-model="localConfig.launcher.debug" type="checkbox" @change="handleConfigChange" />
              启用调试模式
            </label>
            <div class="form-help">是否启用详细的调试信息</div>
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
      <button class="btn btn-secondary" @click="resetConfig" :disabled="!hasChanges">
        重置
      </button>
      <button class="btn btn-primary" @click="saveConfig" :disabled="!hasChanges">
        保存配置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useConfigStore } from '../stores/config'
import type { LauncherConfig } from '../types/config'
import { DEFAULT_LAUNCHER_CONFIG } from '../constants/defaults'

// 状态管理
const configStore = useConfigStore()

// 本地配置状态
const localConfig = ref<LauncherConfig>({ ...DEFAULT_LAUNCHER_CONFIG })

// 计算属性
const hasChanges = computed(() => {
  const original = configStore.launcherConfig
  if (!original) return false
  return JSON.stringify(localConfig.value) !== JSON.stringify(original)
})

const configPreview = computed(() => {
  return JSON.stringify(localConfig.value, null, 2)
})

// 方法
const handleConfigChange = () => {
  // 更新 store 中的配置
  configStore.updateConfig('launcher', localConfig.value)
}

const resetConfig = () => {
  if (configStore.launcherConfig) {
    localConfig.value = { ...configStore.launcherConfig }
  } else {
    localConfig.value = { ...DEFAULT_LAUNCHER_CONFIG }
  }
}

const saveConfig = async () => {
  try {
    await configStore.saveConfig('launcher')
    // 保存成功后的处理
  } catch (error) {
    console.error('保存配置失败:', error)
  }
}

// 监听 store 中的配置变化
watch(
  () => configStore.launcherConfig,
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
  if (configStore.launcherConfig) {
    localConfig.value = { ...configStore.launcherConfig }
  }
})
</script>

<style lang="less" scoped>
.launcher-config-editor {
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
  display: flex;
  align-items: center;
  gap: 8px;

  input[type="checkbox"] {
    width: auto;
    margin: 0;
  }
}

.form-input,
.form-select {
  .input-base();
}

.form-help {
  .form-help();
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
