<template>
  <div class="version-selector">
    <div class="selector-header">
      <h4>版本升级策略</h4>
      <div class="current-version" v-if="currentVersion">
        <span class="label">当前版本:</span>
        <span class="version">{{ currentVersion }}</span>
      </div>
    </div>

    <div class="version-options">
      <div
        v-for="option in options"
        :key="option.value"
        class="version-option"
        :class="{ 
          active: modelValue === option.value,
          disabled: option.disabled 
        }"
        @click="!option.disabled && handleSelect(option.value)"
      >
        <div class="option-header">
          <div class="option-radio">
            <div class="radio-circle" :class="{ checked: modelValue === option.value }">
              <div class="radio-dot" v-if="modelValue === option.value"></div>
            </div>
          </div>
          <div class="option-content">
            <div class="option-title">
              <span class="type-badge" :class="`badge-${option.value}`">
                {{ option.label }}
              </span>
              <span class="version-preview" v-if="option.preview">
                <ArrowRight :size="14" />
                <span class="new-version">{{ option.preview }}</span>
              </span>
            </div>
            <div class="option-description">{{ option.description }}</div>
          </div>
        </div>
        
        <!-- 示例说明 -->
        <div class="option-examples" v-if="option.examples">
          <div class="example-item" v-for="(example, index) in option.examples" :key="index">
            <code>{{ example }}</code>
          </div>
        </div>
      </div>
    </div>

    <!-- 说明 -->
    <div class="version-note">
      <Info :size="14" />
      <span>按照语义化版本规范 (SemVer) 进行版本管理</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Info } from 'lucide-vue-next'

export type VersionBumpType = 'none' | 'patch' | 'minor' | 'major'

interface Props {
  modelValue: VersionBumpType
  currentVersion?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'none',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: VersionBumpType]
}>()

// 计算预览版本
const previewVersion = computed(() => {
  if (!props.currentVersion) return {}
  
  const parts = props.currentVersion.split('.').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return {}
  
  const [major, minor, patch] = parts
  
  return {
    none: props.currentVersion,
    patch: `${major}.${minor}.${patch + 1}`,
    minor: `${major}.${minor + 1}.0`,
    major: `${major + 1}.0.0`
  }
})

// 选项配置
const options = computed(() => [
  {
    value: 'none' as VersionBumpType,
    label: '不升级',
    description: '保持当前版本号不变',
    preview: previewVersion.value.none,
    disabled: props.disabled,
    examples: ['适用于调试构建、预览构建']
  },
  {
    value: 'patch' as VersionBumpType,
    label: 'Patch',
    description: '修复 bug 或小改动（x.x.+1）',
    preview: previewVersion.value.patch,
    disabled: props.disabled,
    examples: ['1.2.3 → 1.2.4', '修复bug、文档更新、小优化']
  },
  {
    value: 'minor' as VersionBumpType,
    label: 'Minor',
    description: '新增功能但向后兼容（x.+1.0）',
    preview: previewVersion.value.minor,
    disabled: props.disabled,
    examples: ['1.2.3 → 1.3.0', '新增功能、API扩展、向后兼容']
  },
  {
    value: 'major' as VersionBumpType,
    label: 'Major',
    description: '重大更新或不兼容改动（+1.0.0）',
    preview: previewVersion.value.major,
    disabled: props.disabled,
    examples: ['1.2.3 → 2.0.0', '破坏性更新、重构架构、不兼容改动']
  }
])

const handleSelect = (value: VersionBumpType) => {
  emit('update:modelValue', value)
}
</script>

<style lang="less" scoped>
.version-selector {
  background: var(--ldesign-bg-color);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-radius-md);
  padding: var(--ls-spacing-lg);
}

.selector-header {
  margin-bottom: var(--ls-spacing-lg);

  h4 {
    font-size: var(--ls-font-size-md);
    color: var(--ldesign-text-color-primary);
    margin: 0 0 var(--ls-spacing-sm) 0;
    font-weight: 600;
  }

  .current-version {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    font-size: var(--ls-font-size-sm);

    .label {
      color: var(--ldesign-text-color-secondary);
    }

    .version {
      color: var(--ldesign-primary-color);
      font-weight: 600;
      font-family: 'Consolas', 'Monaco', monospace;
    }
  }
}

.version-options {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-md);
}

.version-option {
  border: 2px solid var(--ldesign-border-color);
  border-radius: var(--ls-radius-md);
  padding: var(--ls-spacing-md);
  cursor: pointer;
  transition: all 0.2s;
  background: var(--ldesign-bg-color-secondary);

  &:hover:not(.disabled) {
    border-color: var(--ldesign-primary-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &.active {
    border-color: var(--ldesign-primary-color);
    background: var(--ldesign-primary-color-light);
    box-shadow: 0 2px 12px rgba(var(--ldesign-primary-color-rgb), 0.15);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.option-header {
  display: flex;
  gap: var(--ls-spacing-md);
  align-items: flex-start;
}

.option-radio {
  flex-shrink: 0;
  padding-top: 2px;

  .radio-circle {
    width: 20px;
    height: 20px;
    border: 2px solid var(--ldesign-border-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &.checked {
      border-color: var(--ldesign-primary-color);
      background: var(--ldesign-bg-color);
    }

    .radio-dot {
      width: 10px;
      height: 10px;
      background: var(--ldesign-primary-color);
      border-radius: 50%;
    }
  }
}

.option-content {
  flex: 1;
}

.option-title {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  margin-bottom: var(--ls-spacing-xs);

  .type-badge {
    display: inline-flex;
    padding: 2px 8px;
    border-radius: var(--ls-radius-sm);
    font-size: var(--ls-font-size-xs);
    font-weight: 600;
    
    &.badge-none {
      background: var(--ldesign-gray-2);
      color: var(--ldesign-gray-8);
    }

    &.badge-patch {
      background: #e3f2fd;
      color: #1976d2;
    }

    &.badge-minor {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    &.badge-major {
      background: #ffebee;
      color: #c62828;
    }
  }

  .version-preview {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);

    .new-version {
      font-weight: 600;
      color: var(--ldesign-primary-color);
      font-family: 'Consolas', 'Monaco', monospace;
    }
  }
}

.option-description {
  color: var(--ldesign-text-color-secondary);
  font-size: var(--ls-font-size-sm);
  line-height: 1.5;
}

.option-examples {
  margin-top: var(--ls-spacing-sm);
  padding-top: var(--ls-spacing-sm);
  border-top: 1px solid var(--ldesign-border-color);
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);

  .example-item {
    display: flex;
    align-items: center;

    code {
      font-size: var(--ls-font-size-xs);
      color: var(--ldesign-text-color-tertiary);
      background: var(--ldesign-bg-color);
      padding: 2px 6px;
      border-radius: var(--ls-radius-xs);
      font-family: 'Consolas', 'Monaco', monospace;
    }
  }
}

.version-note {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
  margin-top: var(--ls-spacing-md);
  padding: var(--ls-spacing-sm);
  background: var(--ldesign-info-bg);
  border-radius: var(--ls-radius-sm);
  color: var(--ldesign-info-color);
  font-size: var(--ls-font-size-xs);

  svg {
    flex-shrink: 0;
  }
}
</style>