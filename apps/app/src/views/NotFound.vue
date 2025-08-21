<script setup lang="ts">
import { useRouter } from '@ldesign/router'

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<template>
  <div class="not-found">
    <div class="container">
      <div class="not-found-content">
        <div class="error-code">
          404
        </div>
        <h1>页面未找到</h1>
        <p>抱歉，您访问的页面不存在或已被移除。</p>

        <div class="actions">
          <router-link to="/home" class="btn btn-primary">
            返回首页
          </router-link>
          <button class="btn btn-secondary" @click="goBack">
            返回上页
          </button>
        </div>

        <div class="suggestions">
          <h3>您可能想要访问:</h3>
          <ul>
            <li>
              <router-link to="/home">
                首页
              </router-link>
            </li>
            <li>
              <router-link to="/login">
                登录页面
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.not-found {
  min-height: 100vh;
  background: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.not-found-content {
  text-align: center;
  max-width: 600px;

  .error-code {
    font-size: 120px;
    font-weight: 700;
    color: var(--primary-color);
    line-height: 1;
    margin-bottom: var(--spacing-md);
  }

  h1 {
    font-size: var(--font-size-2xl);
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: var(--spacing-md);
  }

  p {
    font-size: var(--font-size-lg);
    color: var(--text-color-secondary);
    margin-bottom: var(--spacing-xl);
    line-height: 1.6;
  }

  .actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    margin-bottom: var(--spacing-xl);
    flex-wrap: wrap;
  }

  .suggestions {
    text-align: left;
    background: var(--bg-color-secondary);
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);

    h3 {
      margin-bottom: var(--spacing-md);
      color: var(--text-color);
    }

    ul {
      list-style: none;
      padding: 0;

      li {
        margin-bottom: var(--spacing-sm);

        a {
          color: var(--primary-color);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .not-found-content {
    .error-code {
      font-size: 80px;
    }

    .actions {
      flex-direction: column;
      align-items: center;
    }
  }
}
</style>
