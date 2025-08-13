<template>
  <div class="nested-default">
    <div class="welcome-section">
      <h3>🏠 嵌套路由默认页面</h3>
      <p>这是嵌套路由的默认子组件，当访问 <code>/nested</code> 时显示。</p>
    </div>

    <div class="info-section">
      <h4>路由信息</h4>
      <div class="route-details">
        <div class="detail-item">
          <strong>当前路径:</strong> {{ routeInfo?.path }}
        </div>
        <div class="detail-item">
          <strong>路由名称:</strong> {{ routeInfo?.name }}
        </div>
        <div class="detail-item">
          <strong>查询参数:</strong>
          {{ JSON.stringify(routeInfo?.query || {}) }}
        </div>
      </div>
    </div>

    <div class="navigation-section">
      <h4>快速导航</h4>
      <div class="nav-buttons">
        <RouterLink to="/nested/child1" class="btn btn-primary">
          前往子路由 1
        </RouterLink>
        <RouterLink to="/nested/child2" class="btn btn-secondary">
          前往子路由 2
        </RouterLink>
      </div>
    </div>

    <div class="feature-section">
      <h4>嵌套路由特性</h4>
      <ul class="feature-list">
        <li>✅ 支持无限层级嵌套</li>
        <li>✅ 独立的路由参数和查询参数</li>
        <li>✅ 子路由组件懒加载</li>
        <li>✅ 路由守卫继承</li>
        <li>✅ 动态路由匹配</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from '@ldesign/router'

interface Props {
  routeInfo?: {
    path: string
    name?: string
    query: Record<string, any>
  }
}

defineProps<Props>()
</script>

<style lang="less" scoped>
.nested-default {
  padding: @spacing-lg;
}

.welcome-section {
  text-align: center;
  margin-bottom: @spacing-xl;

  h3 {
    color: @primary-color;
    margin-bottom: @spacing-md;
    font-size: @font-size-xl;
  }

  p {
    color: @gray-600;
    line-height: 1.6;

    code {
      background: @gray-100;
      padding: 2px 6px;
      border-radius: @border-radius-sm;
      font-family: monospace;
      color: @primary-color;
    }
  }
}

.info-section,
.navigation-section,
.feature-section {
  margin-bottom: @spacing-lg;

  h4 {
    color: @gray-800;
    margin-bottom: @spacing-md;
    font-size: @font-size-lg;
  }
}

.route-details {
  background: @gray-50;
  padding: @spacing-md;
  border-radius: @border-radius-md;
  border-left: 4px solid @info-color;
}

.detail-item {
  margin-bottom: @spacing-sm;
  font-size: @font-size-sm;

  &:last-child {
    margin-bottom: 0;
  }

  strong {
    color: @gray-700;
    margin-right: @spacing-sm;
  }
}

.nav-buttons {
  display: flex;
  gap: @spacing-md;
  flex-wrap: wrap;
}

.feature-list {
  list-style: none;
  padding: 0;

  li {
    padding: @spacing-sm 0;
    color: @gray-700;
    border-bottom: 1px solid @gray-200;

    &:last-child {
      border-bottom: none;
    }
  }
}

@media (max-width: 768px) {
  .nav-buttons {
    flex-direction: column;
  }

  .nav-buttons .btn {
    width: 100%;
  }
}
</style>
