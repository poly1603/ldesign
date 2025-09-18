<template>
  <div class="test-template-loading">
    <h1>Template Loading Test</h1>
    
    <div class="status">
      <p>Loading: {{ loading }}</p>
      <p>Error: {{ error || 'None' }}</p>
      <p>Current Template: {{ currentTemplate?.name || 'None' }}</p>
      <p>Available Templates: {{ availableTemplates.length }}</p>
    </div>

    <div class="template-list">
      <h2>Available Templates:</h2>
      <ul>
        <li v-for="template in availableTemplates" :key="template.name">
          {{ template.name }} ({{ template.device }})
          <button @click="switchTemplate(template.name)">Load</button>
        </li>
      </ul>
    </div>

    <div class="template-content" v-if="currentComponent">
      <h2>Current Template:</h2>
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTemplate } from '@ldesign/template'

// Test template loading with login category
const {
  currentTemplate,
  currentComponent,
  availableTemplates,
  loading,
  error,
  switchTemplate,
  refreshTemplates
} = useTemplate('login', {
  defaultTemplate: 'default',
  enableCache: true,
  showSelector: false
})

// Load templates on mount
onMounted(async () => {
  console.log('TestTemplateLoading mounted, refreshing templates...')
  await refreshTemplates()
  console.log('Templates loaded:', availableTemplates.value)
})
</script>

<style scoped>
.test-template-loading {
  padding: 20px;
}

.status {
  background: #f0f0f0;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
}

.status p {
  margin: 5px 0;
}

.template-list {
  margin: 20px 0;
}

.template-list ul {
  list-style: none;
  padding: 0;
}

.template-list li {
  padding: 5px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 300px;
}

.template-list button {
  padding: 5px 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.template-list button:hover {
  background: #0056b3;
}

.template-content {
  margin-top: 20px;
  padding: 20px;
  border: 2px solid #ddd;
  border-radius: 5px;
}
</style>