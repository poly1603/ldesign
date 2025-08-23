<script setup lang="ts">
defineProps<{ title: string, description?: string }>()
</script>

<template>
  <div class="demo">
    <div class="demo__header">
      <div class="demo__title">
        {{ title }}
      </div>
      <div v-if="description" class="demo__desc">
        {{ description }}
      </div>
    </div>
    <div class="demo__preview">
      <slot name="demo" />
    </div>
    <details class="demo__code">
      <summary>查看代码</summary>
      <div class="demo__code-blocks">
        <div v-if="$slots['code-vue']" class="demo__code-block">
          <slot name="code-vue" />
        </div>
        <div v-if="$slots['code-html']" class="demo__code-block">
          <slot name="code-html" />
        </div>
      </div>
    </details>
  </div>
</template>

<style scoped>
.demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
}
.demo__header {
  padding: 12px 16px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}
.demo__title {
  font-weight: 600;
}
.demo__desc {
  color: var(--vp-c-text-2);
  font-size: 13px;
  margin-top: 4px;
}
.demo__preview {
  padding: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}
.demo__code {
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}
.demo__code summary {
  cursor: pointer;
  padding: 10px 16px;
}
.demo__code-blocks {
  padding: 0 16px 16px;
  display: grid;
  gap: 12px;
}
.demo__code-block pre {
  margin: 0;
}
</style>


