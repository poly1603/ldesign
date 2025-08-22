<script setup lang="ts">
import { createCustomTheme, isValidHex, useNotification } from '@ldesign/color'
import { useTheme } from '@ldesign/color/vue'
import { computed, ref } from 'vue'

const { registerTheme, setTheme } = useTheme()
const { showNotification } = useNotification()

const themeName = ref('')
const lightPrimary = ref('#1890ff')
const darkPrimary = ref('#177ddc')

const canCreate = computed(() => {
  return (
<<<<<<< HEAD
    themeName.value.trim() &&
    isValidHex(lightPrimary.value) &&
    isValidHex(darkPrimary.value)
=======
    themeName.value.trim()
    && isValidHex(lightPrimary.value)
    && isValidHex(darkPrimary.value)
>>>>>>> d558c53bb81f65625318631d106345bf8a2cfdfe
  )
})

async function createTheme() {
  if (!canCreate.value) return

  try {
    const customTheme = createCustomTheme(
      themeName.value.trim(),
      lightPrimary.value,
      {
        displayName: themeName.value.trim(),
        description: `自定义主题：${themeName.value.trim()}`,
        darkPrimaryColor: darkPrimary.value,
      }
    )

    registerTheme(customTheme)
    await setTheme(customTheme.name)

    showNotification(`主题 "${themeName.value}" 创建成功！`, 'success')

    // 重置表单
    themeName.value = ''
    lightPrimary.value = '#1890ff'
    darkPrimary.value = '#177ddc'
  } catch {
    showNotification('创建主题失败', 'error')
  }
}
</script>

<template>
  <div class="card">
    <h2 class="card-title">🛠️ 自定义主题</h2>

    <form class="theme-form" @submit.prevent="createTheme">
      <div class="form-group">
        <label class="form-label">主题名称</label>
        <input
          v-model="themeName"
          type="text"
          class="form-control"
          placeholder="输入主题名称"
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label">亮色模式主色调</label>
        <div class="color-input-group">
<<<<<<< HEAD
          <input v-model="lightPrimary" type="color" class="color-picker" />
=======
          <input v-model="lightPrimary" type="color" class="color-picker">
>>>>>>> d558c53bb81f65625318631d106345bf8a2cfdfe
          <input
            v-model="lightPrimary"
            type="text"
            class="form-control"
            placeholder="#1890ff"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">暗色模式主色调</label>
        <div class="color-input-group">
<<<<<<< HEAD
          <input v-model="darkPrimary" type="color" class="color-picker" />
=======
          <input v-model="darkPrimary" type="color" class="color-picker">
>>>>>>> d558c53bb81f65625318631d106345bf8a2cfdfe
          <input
            v-model="darkPrimary"
            type="text"
            class="form-control"
            placeholder="#177ddc"
          />
        </div>
      </div>

      <button type="submit" class="btn btn-primary" :disabled="!canCreate">
        <span class="icon">✨</span>
        创建并应用主题
      </button>
    </form>
  </div>
</template>

<style scoped>
.theme-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.color-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-picker {
  width: 50px;
  height: 40px;
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 6px;
  cursor: pointer;
  background: none;
}

.icon {
  margin-right: 0.25rem;
}
</style>
