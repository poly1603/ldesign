/**
 * Complete Example: Advanced Store with All Features
 * 展示所有高级功能的完整示例
 */

import { createStore } from '../src/SimpleAPI';
import { batchUpdate } from '../src/ReactiveSystem';
import { ErrorBoundary } from '../src/BugFixes';
import { TimeTravelDebugger, MiddlewareSystem, StateSynchronizer } from '../src/AdvancedFeatures2';
import { PerformanceMonitor, AutoPerformanceAnalyzer } from '../src/PerformanceMonitoring';
import { initDevTools } from '../src/DevTools';

// ============= 初始化系统 =============
console.log('🚀 Initializing Advanced Store System...\n');

// 1. 初始化 DevTools
const devTools = initDevTools({
  name: 'My App Store',
  logActions: true,
  logState: false,
  enableTimeTravel: true,
  enableHotReload: true
});

// 2. 初始化性能监控
const performanceMonitor = new PerformanceMonitor({
  autoStart: true,
  slowThreshold: 20, // 20ms 为慢操作
  memoryInterval: 10000 // 每10秒检查内存
});

// 3. 初始化自动性能分析
const autoAnalyzer = new AutoPerformanceAnalyzer({
  analysisInterval: 30000, // 每30秒分析一次
  autoFix: true,
  thresholds: {
    slowOperation: 50,
    highMemory: 150 * 1024 * 1024
  }
});

// 4. 初始化错误边界
const errorBoundary = new ErrorBoundary();
errorBoundary.onError((error, context) => {
  console.error('❌ Error caught:', error, 'Context:', context);
});

// ============= 创建高级 Store =============
interface UserState {
  users: Array<{
    id: string;
    name: string;
    email: string;
    age: number;
    active: boolean;
  }>;
  selectedUserId: string | null;
  filter: {
    searchTerm: string;
    minAge: number;
    maxAge: number;
    activeOnly: boolean;
  };
  loading: boolean;
  error: string | null;
  statistics: {
    totalUsers: number;
    activeUsers: number;
    averageAge: number;
  };
}

// 创建用户管理 Store
const userStore = createStore<UserState>({
  // 初始状态
  state: {
    users: [],
    selectedUserId: null,
    filter: {
      searchTerm: '',
      minAge: 0,
      maxAge: 100,
      activeOnly: false
    },
    loading: false,
    error: null,
    statistics: {
      totalUsers: 0,
      activeUsers: 0,
      averageAge: 0
    }
  },

  // 计算属性
  computed: {
    // 过滤后的用户列表
    filteredUsers() {
      performanceMonitor.startTimer('filterUsers');

      const result = this.users.filter(user => {
        // 搜索词过滤
        if (this.filter.searchTerm) {
          const searchLower = this.filter.searchTerm.toLowerCase();
          if (!user.name.toLowerCase().includes(searchLower) &&
            !user.email.toLowerCase().includes(searchLower)) {
            return false;
          }
        }

        // 年龄过滤
        if (user.age < this.filter.minAge || user.age > this.filter.maxAge) {
          return false;
        }

        // 活跃状态过滤
        if (this.filter.activeOnly && !user.active) {
          return false;
        }

        return true;
      });

      performanceMonitor.endTimer('filterUsers');
      return result;
    },

    // 当前选中的用户
    selectedUser() {
      if (!this.selectedUserId) return null;
      return this.users.find(u => u.id === this.selectedUserId);
    },

    // 是否有数据
    hasData() {
      return this.users.length > 0;
    },

    // 过滤器是否激活
    isFilterActive() {
      return this.filter.searchTerm !== '' ||
        this.filter.minAge > 0 ||
        this.filter.maxAge < 100 ||
        this.filter.activeOnly;
    }
  },

  // Actions
  actions: {
    // 加载用户数据
    async loadUsers() {
      performanceMonitor.startTimer('loadUsers');

      this.loading = true;
      this.error = null;

      try {
        // 模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 生成测试数据
        const users = Array.from({ length: 100 }, (_, i) => ({
          id: `user-${i + 1}`,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          age: Math.floor(Math.random() * 60) + 18,
          active: Math.random() > 0.3
        }));

        // 批量更新状态
        batchUpdate(() => {
          this.users = users;
          this.updateStatistics();
        });

        performanceMonitor.increment('usersLoaded', users.length);
      } catch (error) {
        this.error = error.message;
        performanceMonitor.increment('loadErrors');
      } finally {
        this.loading = false;
        performanceMonitor.endTimer('loadUsers');
      }
    },

    // 更新统计信息
    updateStatistics() {
      const totalUsers = this.users.length;
      const activeUsers = this.users.filter(u => u.active).length;
      const averageAge = totalUsers > 0
        ? this.users.reduce((sum, u) => sum + u.age, 0) / totalUsers
        : 0;

      this.statistics = {
        totalUsers,
        activeUsers,
        averageAge: Math.round(averageAge)
      };
    },

    // 添加用户
    addUser(user: Omit<UserState['users'][0], 'id'>) {
      const newUser = {
        ...user,
        id: `user-${Date.now()}`
      };

      batchUpdate(() => {
        this.users.push(newUser);
        this.updateStatistics();
      });

      performanceMonitor.increment('usersAdded');
      return newUser;
    },

    // 更新用户
    updateUser(id: string, updates: Partial<UserState['users'][0]>) {
      const index = this.users.findIndex(u => u.id === id);
      if (index === -1) {
        throw new Error(`User ${id} not found`);
      }

      batchUpdate(() => {
        this.users[index] = { ...this.users[index], ...updates };
        this.updateStatistics();
      });

      performanceMonitor.increment('usersUpdated');
    },

    // 删除用户
    deleteUser(id: string) {
      const index = this.users.findIndex(u => u.id === id);
      if (index === -1) {
        throw new Error(`User ${id} not found`);
      }

      batchUpdate(() => {
        this.users.splice(index, 1);
        if (this.selectedUserId === id) {
          this.selectedUserId = null;
        }
        this.updateStatistics();
      });

      performanceMonitor.increment('usersDeleted');
    },

    // 选择用户
    selectUser(id: string | null) {
      this.selectedUserId = id;
    },

    // 更新过滤器
    updateFilter(filter: Partial<UserState['filter']>) {
      Object.assign(this.filter, filter);
    },

    // 清除过滤器
    clearFilter() {
      this.filter = {
        searchTerm: '',
        minAge: 0,
        maxAge: 100,
        activeOnly: false
      };
    },

    // 批量操作
    batchToggleActive(userIds: string[]) {
      performanceMonitor.startTimer('batchToggle');

      batchUpdate(() => {
        userIds.forEach(id => {
          const user = this.users.find(u => u.id === id);
          if (user) {
            user.active = !user.active;
          }
        });
        this.updateStatistics();
      });

      performanceMonitor.endTimer('batchToggle');
      performanceMonitor.increment('batchOperations');
    }
  }
});

// 注册到 DevTools
devTools.registerStore('userStore', userStore);

// ============= 添加中间件 =============
const middleware = new MiddlewareSystem();

// 日志中间件
middleware.use('action', async (context, next) => {
  const startTime = Date.now();
  console.log(`📝 [Action] ${context.action} started`);

  await next();

  const duration = Date.now() - startTime;
  console.log(`✅ [Action] ${context.action} completed in ${duration}ms`);
});

// 性能中间件
middleware.use('state', async (context, next) => {
  if (context.path === 'users' && Array.isArray(context.newValue)) {
    if (context.newValue.length > 1000) {
      console.warn('⚠️ Large array detected, consider pagination');
    }
  }
  await next();
});

// ============= 设置时间旅行 =============
const timeTravelDebugger = new TimeTravelDebugger(userStore, {
  maxSnapshots: 20,
  autoSnapshot: true
});

// ============= 设置状态同步 =============
const stateSynchronizer = new StateSynchronizer('user-sync-channel');
stateSynchronizer.addStore('userStore', userStore);
stateSynchronizer.startSync();

// ============= 使用示例 =============
async function demonstrateFeatures() {
  console.log('\n📋 Starting Feature Demonstration...\n');

  // 1. 加载数据
  console.log('1️⃣ Loading users...');
  await userStore.actions.loadUsers();
  console.log(`   Loaded ${userStore.state.users.length} users`);

  // 2. 测试过滤功能
  console.log('\n2️⃣ Testing filters...');
  userStore.actions.updateFilter({
    searchTerm: 'User 1',
    activeOnly: true
  });
  console.log(`   Filtered users: ${userStore.computed.filteredUsers.length}`);

  // 3. 添加新用户
  console.log('\n3️⃣ Adding new user...');
  const newUser = userStore.actions.addUser({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    active: true
  });
  console.log(`   Added user: ${newUser.id}`);

  // 4. 批量操作
  console.log('\n4️⃣ Batch operations...');
  const userIds = userStore.state.users.slice(0, 10).map(u => u.id);
  userStore.actions.batchToggleActive(userIds);
  console.log(`   Toggled ${userIds.length} users`);

  // 5. 时间旅行
  console.log('\n5️⃣ Time travel demo...');
  const snapshot1 = timeTravelDebugger.createSnapshot('Before changes');

  // 做一些改变
  userStore.actions.deleteUser(userStore.state.users[0].id);
  console.log(`   Deleted first user`);

  // 恢复到之前的状态
  timeTravelDebugger.restoreSnapshot(snapshot1.id);
  console.log(`   Restored to previous state`);

  // 6. 性能分析
  console.log('\n6️⃣ Performance analysis...');
  const stats = performanceMonitor.getStats('timer.filterUsers');
  if (stats) {
    console.log(`   Filter performance: avg=${stats.avg.toFixed(2)}ms, p95=${stats.p95.toFixed(2)}ms`);
  }

  // 7. 内存快照
  console.log('\n7️⃣ Memory snapshot...');
  const memSnapshot = performanceMonitor.takeMemorySnapshot();
  console.log(`   Heap used: ${(memSnapshot.heapUsed / 1024 / 1024).toFixed(2)}MB`);

  // 8. DevTools 检查
  console.log('\n8️⃣ DevTools inspection...');
  const inspection = devTools.inspect('userStore');
  if (inspection) {
    console.log(`   State keys: ${Object.keys(inspection.state).join(', ')}`);
    console.log(`   Actions: ${inspection.actions.join(', ')}`);
    console.log(`   History: ${inspection.history.length} snapshots`);
  }

  // 9. 导出/导入状态
  console.log('\n9️⃣ State export/import...');
  const exportedState = devTools.exportState('userStore');
  console.log(`   Exported state with ${exportedState.users.length} users`);

  // 清空然后导入
  userStore.state.users = [];
  devTools.importState('userStore', exportedState);
  console.log(`   Imported state restored ${userStore.state.users.length} users`);

  // 10. 错误处理
  console.log('\n🔟 Error handling...');
  try {
    await errorBoundary.wrap(async () => {
      // 故意触发错误
      userStore.actions.updateUser('non-existent-id', { name: 'Test' });
    })();
  } catch (error) {
    console.log(`   Error handled: ${error.message}`);
  }

  // 生成最终报告
  console.log('\n📊 Final Performance Report:');
  const report = performanceMonitor.stopRecording();
  console.log(`   Total duration: ${report.duration.toFixed(2)}ms`);
  console.log(`   Metrics collected: ${report.metrics.length}`);

  if (report.warnings.length > 0) {
    console.log('   ⚠️ Warnings:');
    report.warnings.forEach(w => console.log(`      - ${w}`));
  }

  if (report.suggestions.length > 0) {
    console.log('   💡 Suggestions:');
    report.suggestions.forEach(s => console.log(`      - ${s}`));
  }
}

// ============= Vue 3 集成示例 =============
const VueIntegrationExample = `
<template>
  <div class="user-management">
    <!-- 过滤器 -->
    <div class="filters">
      <input 
        v-model="filter.searchTerm" 
        @input="updateFilter"
        placeholder="Search users..."
      />
      <label>
        <input 
          type="checkbox" 
          v-model="filter.activeOnly"
          @change="updateFilter"
        />
        Active Only
      </label>
      <button @click="clearFilter">Clear</button>
    </div>

    <!-- 用户列表 -->
    <div class="user-list">
      <div v-if="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <div 
          v-for="user in filteredUsers" 
          :key="user.id"
          @click="selectUser(user.id)"
          :class="{ selected: user.id === selectedUserId }"
        >
          {{ user.name }} ({{ user.age }})
          <span v-if="user.active">✓</span>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="statistics">
      <div>Total: {{ statistics.totalUsers }}</div>
      <div>Active: {{ statistics.activeUsers }}</div>
      <div>Avg Age: {{ statistics.averageAge }}</div>
    </div>

    <!-- DevTools 按钮 -->
    <button @click="openDevTools">Open DevTools</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../hooks/useStore';

const store = useStore('userStore');

// 响应式状态
const loading = computed(() => store.state.loading);
const error = computed(() => store.state.error);
const filter = computed(() => store.state.filter);
const statistics = computed(() => store.state.statistics);
const selectedUserId = computed(() => store.state.selectedUserId);

// 计算属性
const filteredUsers = computed(() => store.computed.filteredUsers);

// Actions
const { 
  loadUsers, 
  updateFilter, 
  clearFilter, 
  selectUser 
} = store.actions;

// DevTools
const openDevTools = () => {
  const devtools = window.__LDESIGN_DEVTOOLS__;
  if (devtools) {
    // 触发 DevTools 检查器
    devtools.timeTravel('userStore', 'backward');
  }
};

// 初始化
loadUsers();
</script>
`;

// ============= 运行演示 =============
demonstrateFeatures().then(() => {
  console.log('\n✨ Demo completed successfully!');
  console.log('\n📚 Vue Integration Example:');
  console.log(VueIntegrationExample);

  // 清理
  setTimeout(() => {
    console.log('\n🧹 Cleaning up...');
    performanceMonitor.destroy();
    autoAnalyzer.destroy();
    stateSynchronizer.stopSync();
    devTools.destroy();
    console.log('👋 Goodbye!');
  }, 5000);
}).catch(error => {
  console.error('❌ Demo failed:', error);
});
