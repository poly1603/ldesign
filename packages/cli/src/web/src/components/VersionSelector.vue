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
  // 移除外层边框和背景，使其融入父容器
}

.selector-header {
  margin-bottom: var(--ls-spacing-base);

  h4 {
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-secondary);
    margin: 0 0 8px 0;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .current-version {
    display: none; // 隐藏，因为已经在上面显示了
  }
}

.version-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--ls-spacing-sm);
}

.version-option {
  position: relative;
  border: 2px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-padding-base);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--ldesign-bg-color-component);
  overflow: hidden;

  // 添加微妙的渐变背景
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, var(--ldesign-brand-bg) 100%);
    opacity: 0;
    transition: opacity 0.25s;
    pointer-events: none;
  }

  &:hover:not(.disabled) {
    border-color: var(--ldesign-brand-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

    &:before {
      opacity: 0.5;
    }
  }

  &.active {
    border-color: var(--ldesign-brand-color);
    background: var(--ldesign-brand-bg);
    box-shadow: 0 4px 16px rgba(94, 42, 167, 0.15);

    &:before {
      opacity: 1;
    }

    .option-radio .radio-circle {
      border-color: var(--ldesign-brand-color);
      background: var(--ldesign-brand-color);
    }

    .radio-dot {
      background: white;
    }
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.option-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.option-radio {
  position: absolute;
  top: var(--ls-padding-base);
  right: var(--ls-padding-base);
  z-index: 2;

  .radio-circle {
    width: 20px;
    height: 20px;
    border: 2px solid var(--ldesign-border-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    background: var(--ldesign-bg-color-container);

    &.checked {
      border-color: var(--ldesign-brand-color);
      background: var(--ldesign-brand-color);
      transform: scale(1.1);
    }

    .radio-dot {
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
      transform: scale(0);
      animation: radioCheckAnimation 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
  }
}

@keyframes radioCheckAnimation {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.option-content {
  flex: 1;
  padding-right: 32px; // 给右上角的单选按钮预留空间
}

.option-title {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;

  .type-badge {
    display: inline-flex;
    align-self: flex-start;
    padding: 4px 10px;
    border-radius: var(--ls-border-radius-base);
    font-size: var(--ls-font-size-xs);
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    
    &.badge-none {
      background: linear-gradient(135deg, #e0e0e0, #bdbdbd);
      color: #424242;
    }

    &.badge-patch {
      background: linear-gradient(135deg, #bbdefb, #64b5f6);
      color: #0d47a1;
    }

    &.badge-minor {
      background: linear-gradient(135deg, #e1bee7, #ba68c8);
      color: #4a148c;
    }

    &.badge-major {
      background: linear-gradient(135deg, #ffcdd2, #ef5350);
      color: #b71c1c;
    }
  }

  .version-preview {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);

    svg {
      color: var(--ldesign-brand-color);
    }

    .new-version {
      font-weight: 700;
      font-size: var(--ls-font-size-base);
      color: var(--ldesign-brand-color);
      font-family: 'Consolas', 'Monaco', monospace;
    }
  }
}

.option-description {
  color: var(--ldesign-text-color-secondary);
  font-size: var(--ls-font-size-xs);
  line-height: 1.6;
  margin-bottom: 0;
}

.option-examples {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--ldesign-border-color);
  display: flex;
  flex-direction: column;
  gap: 4px;

  .example-item {
    display: flex;
    align-items: center;

    code {
      font-size: 10px;
      color: var(--ldesign-text-color-secondary);
      background: transparent;
      padding: 0;
      border-radius: 0;
      font-family: 'Consolas', 'Monaco', monospace;
      font-weight: 500;
    }
  }
}

.version-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: var(--ls-spacing-base);
  padding: 10px 12px;
  background: var(--ldesign-info-bg);
  border-left: 3px solid var(--ldesign-brand-color);
  border-radius: var(--ls-border-radius-base);
  color: var(--ldesign-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;

  svg {
    flex-shrink: 0;
    color: var(--ldesign-brand-color);
    margin-top: 2px;
  }

  span {
    flex: 1;
  }
}
</style>