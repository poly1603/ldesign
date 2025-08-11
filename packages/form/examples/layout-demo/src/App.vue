<script setup lang="ts">
import type { FormData } from '@/types/form'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import MockForm from '@/components/MockForm.vue'
import { useFormConfig } from '@/composables/useFormConfig'
import { mockFormData } from '@/data/mockData'

// 使用表单配置
const {
  currentLayout,
  showGroups,
  showValidation,
  formState,
  containerRef,
  formOptions,
  updateLayout,
  toggleAutoColumns,
  toggleUnifiedSpacing,
  toggleAutoLabelWidth,
  toggleExpand,
  toggleButtonPosition,
  toggleGroups,
  toggleValidation,
  toggleLabelWidthMode,
  setManualLabelWidth,
} = useFormConfig()

// 下拉框引用
const expandDropdownRef = ref<HTMLElement>()

// 表单数据
const formData = reactive<Partial<FormData>>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  birthDate: '',
  country: '',
  province: '',
  city: '',
  address: '',
  zipCode: '',
  company: '',
  position: '',
  industry: '',
  experience: '',
  salary: undefined,
  interests: [],
  newsletter: false,
  notifications: true,
  language: 'zh',
  bio: '',
  website: '',
  socialMedia: '',
})

// 表单重新渲染的 key
const formKey = ref(0)

// 隐藏字段的表单配置
const hiddenFieldsOptions = computed(() => {
  const hiddenFields = formOptions.value.fields.filter(field =>
    formState.hiddenFields.includes(field.name)
  )

  return {
    fields: hiddenFields,
    layout: {
      ...currentLayout,
      defaultRows: 0, // 隐藏字段不限制行数
      buttonPosition: undefined, // 隐藏字段表单不显示按钮组
    },
  }
})

// 重置表单
function resetForm() {
  Object.keys(formData).forEach(key => {
    const typedKey = key as keyof FormData
    if (typeof formData[typedKey] === 'boolean') {
      ;(formData as any)[typedKey] = false
    } else if (Array.isArray(formData[typedKey])) {
      ;(formData as any)[typedKey] = []
    } else if (typeof formData[typedKey] === 'number') {
      ;(formData as any)[typedKey] = undefined
    } else {
      ;(formData as any)[typedKey] = ''
    }
  })

  // 特殊处理一些默认值
  formData.notifications = true
  formData.language = 'zh'
}

// 填充示例数据
function fillMockData() {
  Object.assign(formData, mockFormData)
}

// 处理表单提交
function handleSubmit(data: any) {
  console.log('表单提交:', data)
  alert('表单提交成功！请查看控制台输出。')
}

// 处理表单验证
function handleValidate(valid: boolean, errors: any) {
  console.log('表单验证:', { valid, errors })
  if (!valid) {
    console.warn('表单验证失败:', errors)
  }
}

// 处理查询
function handleQuery() {
  console.log('执行查询:', formData)
  alert('查询功能已触发！请查看控制台输出。')
}

// 处理重置
function handleReset() {
  console.log('重置表单')
  resetForm()
}

// 点击外部关闭下拉框
function handleClickOutside(event: MouseEvent) {
  if (
    currentLayout.expandMode === 'popup' &&
    formState.isExpanded &&
    expandDropdownRef.value &&
    !expandDropdownRef.value.contains(event.target as Node)
  ) {
    toggleExpand()
  }
}

// 监听点击外部事件
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div id="app">
    <!-- 头部 -->
    <header class="header">
      <div class="container">
        <h1>表单布局演示</h1>
        <p>@ldesign/form 布局系统功能展示</p>
      </div>
    </header>

    <div class="container">
      <!-- 控制面板 -->
      <div class="control-panel">
        <h3>布局控制</h3>

        <!-- 列数控制 -->
        <div class="control-group">
          <div class="control-item">
            <button
              :class="{ active: currentLayout.autoColumns }"
              @click="toggleAutoColumns"
            >
              {{ currentLayout.autoColumns ? '关闭自动列数' : '开启自动列数' }}
            </button>
          </div>

          <div v-if="!currentLayout.autoColumns" class="control-item">
            <label>列数：</label>
            <select
              :value="currentLayout.columns"
              @change="updateLayout('columns', Number($event.target.value))"
            >
              <option :value="1">1列</option>
              <option :value="2">2列</option>
              <option :value="3">3列</option>
              <option :value="4">4列</option>
            </select>
          </div>

          <div v-if="currentLayout.autoColumns" class="control-item">
            <span class="info-text"
              >当前自动计算：{{ formState.calculatedColumns }}列</span
            >
          </div>
        </div>

        <!-- 间距控制 -->
        <div class="control-group">
          <div class="control-item">
            <button
              :class="{ active: currentLayout.unifiedSpacing }"
              @click="toggleUnifiedSpacing"
            >
              {{
                currentLayout.unifiedSpacing ? '分离间距设置' : '统一间距设置'
              }}
            </button>
          </div>

          <div v-if="currentLayout.unifiedSpacing" class="control-item">
            <label>统一间距：</label>
            <input
              type="range"
              min="8"
              max="32"
              step="4"
              :value="currentLayout.gap"
              @input="updateLayout('gap', Number($event.target.value))"
            />
            <span>{{ currentLayout.gap }}px</span>
          </div>

          <div v-if="!currentLayout.unifiedSpacing" class="control-item">
            <label>横向间距：</label>
            <input
              type="range"
              min="8"
              max="32"
              step="4"
              :value="currentLayout.columnGap"
              @input="updateLayout('columnGap', Number($event.target.value))"
            />
            <span>{{ currentLayout.columnGap }}px</span>
          </div>

          <div v-if="!currentLayout.unifiedSpacing" class="control-item">
            <label>纵向间距：</label>
            <input
              type="range"
              min="8"
              max="32"
              step="4"
              :value="currentLayout.rowGap"
              @input="updateLayout('rowGap', Number($event.target.value))"
            />
            <span>{{ currentLayout.rowGap }}px</span>
          </div>
        </div>

        <!-- 标签位置控制 -->
        <div class="control-group">
          <div class="control-item">
            <label>标签位置：</label>
            <select
              :value="currentLayout.labelPosition"
              @change="updateLayout('labelPosition', $event.target.value)"
            >
              <option value="top">顶部</option>
              <option value="left">左侧</option>
              <option value="right">右侧</option>
            </select>
          </div>

          <div
            v-if="currentLayout.labelPosition !== 'top'"
            class="control-item"
          >
            <button
              :class="{ active: currentLayout.autoLabelWidth }"
              @click="toggleAutoLabelWidth"
            >
              {{
                currentLayout.autoLabelWidth ? '手动设置宽度' : '自动计算宽度'
              }}
            </button>
          </div>

          <div
            v-if="
              currentLayout.labelPosition !== 'top' &&
              !currentLayout.autoLabelWidth
            "
            class="control-item"
          >
            <label>标签宽度：</label>
            <input
              type="number"
              min="80"
              max="200"
              step="10"
              :value="currentLayout.labelWidth"
              @input="updateLayout('labelWidth', Number($event.target.value))"
            />
          </div>

          <div
            v-if="
              currentLayout.labelPosition !== 'top' &&
              currentLayout.autoLabelWidth
            "
            class="control-item"
          >
            <label>标签宽度模式：</label>
            <select
              :value="currentLayout.labelWidthMode"
              @change="toggleLabelWidthMode"
            >
              <option value="auto">自动计算（按列对齐）</option>
              <option value="manual">手动设置</option>
            </select>
          </div>

          <!-- 手动设置标签宽度 -->
          <div
            v-if="
              currentLayout.autoLabelWidth &&
              currentLayout.labelWidthMode === 'manual' &&
              currentLayout.labelPosition !== 'top'
            "
            class="control-group"
          >
            <div
              v-for="col in typeof currentLayout.columns === 'number'
                ? currentLayout.columns
                : 2"
              :key="col"
              class="control-item"
            >
              <label>第{{ col }}列标签宽度：</label>
              <input
                type="number"
                :value="currentLayout.labelWidthByColumn?.[col - 1] || 120"
                min="60"
                max="300"
                step="10"
                style="width: 80px"
                @input="
                  setManualLabelWidth(col - 1, parseInt($event.target.value))
                "
              />
              <span>px</span>
            </div>
          </div>

          <div
            v-if="
              currentLayout.labelPosition !== 'top' &&
              currentLayout.autoLabelWidth
            "
            class="control-item"
          >
            <span class="info-text">
              当前宽度：
              <span
                v-for="(width, col) in formState.calculatedLabelWidths"
                :key="col"
              >
                第{{ col + 1 }}列: {{ width }}px{{
                  col < Object.keys(formState.calculatedLabelWidths).length - 1
                    ? ', '
                    : ''
                }}
              </span>
            </span>
          </div>

          <div
            v-if="currentLayout.labelPosition !== 'top'"
            class="control-item"
          >
            <label>标签对齐：</label>
            <select
              :value="currentLayout.labelAlign"
              @change="updateLayout('labelAlign', $event.target.value)"
            >
              <option value="left">左对齐</option>
              <option value="center">居中</option>
              <option value="right">右对齐</option>
            </select>
          </div>

          <div
            v-if="currentLayout.labelPosition !== 'top'"
            class="control-item"
          >
            <label>标签间距：</label>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              :value="currentLayout.labelGap"
              @input="updateLayout('labelGap', Number($event.target.value))"
            />
            <span>{{ currentLayout.labelGap }}px</span>
          </div>

          <div class="control-item">
            <button
              :class="{ active: currentLayout.showLabelColon }"
              @click="
                updateLayout('showLabelColon', !currentLayout.showLabelColon)
              "
            >
              {{
                currentLayout.showLabelColon ? '隐藏标签冒号' : '显示标签冒号'
              }}
            </button>
          </div>
        </div>

        <!-- 表单主题控制 -->
        <div class="control-group">
          <div class="control-item">
            <label>表单主题：</label>
            <select
              :value="currentLayout.formTheme"
              @change="updateLayout('formTheme', $event.target.value)"
            >
              <option value="default">默认样式</option>
              <option value="bordered">边框样式</option>
            </select>
          </div>
        </div>

        <!-- 默认显示行数控制 -->
        <div class="control-group">
          <div class="control-item">
            <label>默认显示行数：</label>
            <select
              :value="currentLayout.defaultRows || 0"
              @change="updateLayout('defaultRows', Number($event.target.value))"
            >
              <option :value="0">显示全部</option>
              <option :value="1">1行</option>
              <option :value="2">2行</option>
              <option :value="3">3行</option>
              <option :value="4">4行</option>
              <option :value="5">5行</option>
            </select>
          </div>

          <div
            v-if="currentLayout.defaultRows && currentLayout.defaultRows > 0"
            class="control-item"
          >
            <label>展开方式：</label>
            <select
              :value="currentLayout.expandMode"
              @change="updateLayout('expandMode', $event.target.value)"
            >
              <option value="inline">下方展开</option>
              <option value="popup">悬浮框展开</option>
            </select>
          </div>

          <div
            v-if="currentLayout.defaultRows && currentLayout.defaultRows > 0"
            class="control-item"
          >
            <span class="info-text">
              可见字段：{{ formState.visibleFields.length }}个， 隐藏字段：{{
                formState.hiddenFields.length
              }}个
            </span>
          </div>
        </div>

        <!-- 按钮组位置控制 -->
        <div
          v-if="currentLayout.defaultRows && currentLayout.defaultRows > 0"
          class="control-group"
        >
          <div class="control-item">
            <label>按钮组位置：</label>
            <select
              :value="currentLayout.buttonPosition"
              @change="updateLayout('buttonPosition', $event.target.value)"
            >
              <option value="follow-last-row">跟随最后一行</option>
              <option value="separate-row">单独占一行</option>
            </select>
          </div>

          <div class="control-item">
            <span class="info-text">
              {{
                currentLayout.buttonPosition === 'follow-last-row'
                  ? '按钮组将放在最后一行最后一列'
                  : '按钮组将单独占一行显示'
              }}
            </span>
          </div>
        </div>

        <!-- 功能开关 -->
        <div class="control-group">
          <div class="control-item">
            <button :class="{ active: showGroups }" @click="toggleGroups">
              {{ showGroups ? '隐藏分组' : '显示分组' }}
            </button>
          </div>

          <div class="control-item">
            <button
              :class="{ active: showValidation }"
              @click="toggleValidation"
            >
              {{ showValidation ? '隐藏验证' : '显示验证' }}
            </button>
          </div>

          <div class="control-item">
            <button @click="resetForm">重置表单</button>
          </div>

          <div class="control-item">
            <button @click="fillMockData">填充示例数据</button>
          </div>
        </div>

        <!-- 条件显示演示 -->
        <div class="control-group">
          <h4>条件显示演示</h4>
          <div class="control-item">
            <span class="info-text"> 选择"中国"查看省/州和城市字段 </span>
          </div>
          <div class="control-item">
            <span class="info-text"> 选择"互联网/IT"行业查看工作地点偏好 </span>
          </div>
          <div class="control-item">
            <span class="info-text"> 选择"远程工作"查看远程工作经验字段 </span>
          </div>
        </div>
      </div>

      <!-- 主要内容 -->
      <div class="main-content">
        <!-- 表单容器 -->
        <div ref="containerRef" class="form-container">
          <h2>用户信息表单</h2>
          <Transition name="fade" mode="out-in">
            <MockForm
              :key="formKey"
              v-model="formData"
              :options="formOptions"
              :is-expanded="formState.isExpanded"
              @submit="handleSubmit"
              @validate="handleValidate"
              @query="handleQuery"
              @reset="handleReset"
              @toggle-expand="toggleExpand"
            />
          </Transition>

          <!-- 下拉式展开模式 -->
          <div
            v-if="currentLayout.expandMode === 'popup' && formState.isExpanded"
            ref="expandDropdownRef"
            class="expand-dropdown"
          >
            <div class="dropdown-content">
              <div class="dropdown-header">
                <h3>更多字段</h3>
                <button class="close-button" @click="toggleExpand">×</button>
              </div>
              <div class="dropdown-body">
                <MockForm v-model="formData" :options="hiddenFieldsOptions" />
              </div>
            </div>
          </div>
        </div>

        <!-- 数据预览 -->
        <div class="data-preview">
          <h3>表单数据预览</h3>
          <pre>{{ JSON.stringify(formData, null, 2) }}</pre>

          <h3 style="margin-top: 1.5rem">当前布局配置</h3>
          <pre>{{ JSON.stringify(currentLayout, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 下拉式展开样式 */
.expand-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 8px;
}

.dropdown-content {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 70vh;
  overflow-y: auto;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e1e5e9;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #e9ecef;
  color: #333;
}

.dropdown-body {
  padding: 20px;
}

/* 确保表单容器有相对定位 */
.form-container {
  position: relative;
}

/* 控制组样式 */
.control-group {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0;
}

.control-group .control-item {
  margin-bottom: 8px;
}

.control-group .control-item:last-child {
  margin-bottom: 0;
}
</style>
