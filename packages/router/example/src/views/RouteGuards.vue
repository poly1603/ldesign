<script setup lang="ts">
import { useRouter } from '@ldesign/router'

const router = useRouter()

function logout() {
  localStorage.removeItem('token')
  console.warn('已退出登录，下次访问将被重定向到登录页面')
  router.push('/login')
}

function clearPermissions() {
  // 模拟清除权限
  console.warn('权限已清除，下次访问受保护页面将被拒绝')
}

function goToProtected() {
  router.push('/guards')
}
</script>

<template>
  <div class="route-guards">
    <div class="card">
      <h1>路由守卫演示</h1>
      <p>这个页面演示了路由守卫功能，包括权限验证和认证检查。</p>
      <div class="alert alert-success">
        <strong>恭喜！</strong> 您已通过所有路由守卫验证，成功访问此页面。
      </div>
    </div>

    <div class="card">
      <h2>守卫类型</h2>
      <div class="guard-types">
        <div class="guard-item">
          <h3>🔐 认证守卫</h3>
          <p>验证用户是否已登录</p>
          <div class="status success">✅ 已通过</div>
        </div>
        <div class="guard-item">
          <h3>🛡️ 权限守卫</h3>
          <p>检查用户是否具有访问权限</p>
          <div class="status success">✅ 已通过</div>
        </div>
        <div class="guard-item">
          <h3>📝 标题守卫</h3>
          <p>自动设置页面标题</p>
          <div class="status success">✅ 已应用</div>
        </div>
        <div class="guard-item">
          <h3>⏳ 加载守卫</h3>
          <p>显示加载状态</p>
          <div class="status success">✅ 已执行</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>模拟操作</h2>
      <div class="actions">
        <button class="btn btn-warning" @click="logout">退出登录</button>
        <button class="btn btn-error" @click="clearPermissions">
          清除权限
        </button>
        <button class="btn btn-info" @click="goToProtected">
          访问其他受保护页面
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.route-guards {
  max-width: 1000px;
  margin: 0 auto;
}

.alert {
  padding: @spacing-md;
  border-radius: @border-radius-md;
  margin-bottom: @spacing-lg;

  &-success {
    background: fade(@success-color, 10%);
    border: 1px solid fade(@success-color, 30%);
    color: @success-color;
  }
}

.guard-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: @spacing-lg;
}

.guard-item {
  padding: @spacing-md;
  border: 1px solid @gray-200;
  border-radius: @border-radius-md;
  text-align: center;

  h3 {
    color: @gray-800;
    margin-bottom: @spacing-sm;
  }

  p {
    color: @gray-600;
    margin-bottom: @spacing-md;
  }

  .status {
    padding: @spacing-xs @spacing-sm;
    border-radius: @border-radius-sm;
    font-weight: 500;
    font-size: @font-size-sm;

    &.success {
      background: fade(@success-color, 20%);
      color: @success-color;
    }
  }
}

.actions {
  display: flex;
  gap: @spacing-md;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .guard-types {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }

  .actions .btn {
    width: 100%;
  }
}
</style>
