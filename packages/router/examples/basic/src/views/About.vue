<template>
  <div class="about">
    <h2>📖 About LDesign Router</h2>
    <p>LDesign Router is a powerful and flexible routing library for Vue.js applications.</p>
    
    <div class="content">
      <section>
        <h3>Key Features</h3>
        <div class="feature-grid">
          <div class="feature-card">
            <h4>🚀 Performance</h4>
            <p>Optimized for speed and efficiency with minimal bundle size.</p>
          </div>
          <div class="feature-card">
            <h4>🔧 Flexible</h4>
            <p>Supports multiple history modes and customizable configurations.</p>
          </div>
          <div class="feature-card">
            <h4>🛡️ Type Safe</h4>
            <p>Built with TypeScript for better development experience.</p>
          </div>
          <div class="feature-card">
            <h4>🎯 Vue 3 Ready</h4>
            <p>Designed specifically for Vue 3 with Composition API support.</p>
          </div>
        </div>
      </section>
      
      <section>
        <h3>Navigation Guards Demo</h3>
        <p>This page demonstrates navigation guards in action:</p>
        <ul>
          <li><strong>beforeEach:</strong> Logs navigation attempts</li>
          <li><strong>beforeResolve:</strong> Final validation before route resolution</li>
          <li><strong>afterEach:</strong> Post-navigation cleanup and logging</li>
        </ul>
        
        <div class="guard-demo">
          <button @click="navigateWithGuard">Test Navigation Guard</button>
          <button @click="simulateAuthRequired">Test Auth Required Route</button>
        </div>
      </section>
      
      <section>
        <h3>Route Transitions</h3>
        <p>Notice the smooth fade transition when navigating between pages.</p>
        <p>This is implemented using Vue's Transition component with RouterView.</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from '@ldesign/router'

const router = useRouter()

const navigateWithGuard = () => {
  // This will trigger the navigation guards
  router.push('/users')
}

const simulateAuthRequired = () => {
  // Navigate to a route that requires authentication
  router.push('/user/999')
}
</script>

<style scoped>
.about {
  max-width: 900px;
  margin: 0 auto;
}

.content {
  margin-top: 2rem;
}

section {
  margin-bottom: 3rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.feature-card {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.feature-card h4 {
  margin: 0 0 1rem 0;
  color: #007bff;
}

.feature-card p {
  margin: 0;
  color: #666;
}

.guard-demo {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.guard-demo button {
  padding: 0.75rem 1.5rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.guard-demo button:hover {
  background: #218838;
}

ul {
  padding-left: 1.5rem;
}

li {
  margin-bottom: 0.5rem;
}
</style>