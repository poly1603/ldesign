<template>
  <div class="login-test-page">
    <h2>登录页面测试</h2>
    
    <!-- 测试1: 直接使用模板 -->
    <div class="test-section">
      <h3>测试1: 直接使用默认登录模板</h3>
      <LoginTemplate 
        :title="'直接使用'"
        :subtitle="'测试副标题'"
        @submit="handleDirectSubmit">
        <template #loginPanel="{ handleSubmit }">
          <div class="custom-panel">
            <h4>自定义登录面板（直接使用）</h4>
            <button @click="handleSubmit">点击登录</button>
          </div>
        </template>
      </LoginTemplate>
    </div>
    
    <!-- 测试2: 使用 TemplateRenderer -->
    <div class="test-section">
      <h3>测试2: 通过 TemplateRenderer</h3>
      <TemplateRenderer 
        category="login"
        device="desktop"
        name="default"
        :component-props="{
          title: '通过Renderer',
          subtitle: '测试副标题'
        }"
        @submit="handleRendererSubmit">
        <template #loginPanel="{ handleSubmit }">
          <div class="custom-panel">
            <h4>自定义登录面板（Renderer）</h4>
            <button @click="handleSubmit">点击登录</button>
          </div>
        </template>
      </TemplateRenderer>
    </div>
    
    <!-- 测试3: 使用简单内容 -->
    <div class="test-section">
      <h3>测试3: 简单文本内容</h3>
      <TemplateRenderer 
        category="login"
        device="desktop"
        name="default">
        <template #loginPanel>
          <div style="background: yellow; padding: 20px;">
            这是一个简单的测试内容
          </div>
        </template>
      </TemplateRenderer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TemplateRenderer } from '@ldesign/template'
// 直接导入模板组件测试
import LoginTemplate from '@ldesign/template/src/templates/login/desktop/default/index.vue'

const handleDirectSubmit = (data: any) => {
  console.log('直接提交:', data)
  alert('直接提交成功')
}

const handleRendererSubmit = (data: any) => {
  console.log('Renderer提交:', data)
  alert('Renderer提交成功')
}
</script>

<style scoped>
.login-test-page {
  padding: 20px;
  background: #f5f5f5;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-section h3 {
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
  color: #333;
}

.custom-panel {
  background: #e8f5e9;
  border: 2px solid #4caf50;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
}

.custom-panel h4 {
  margin: 0 0 20px 0;
  color: #2e7d32;
}

.custom-panel button {
  padding: 12px 24px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.custom-panel button:hover {
  background: #45a049;
}
</style>