<template>
  <div class="templates-view">
    <div class="templates-container">
      <div class="templates-header">
        <h1>{{ t('templates.title') }}</h1>
        <p class="subtitle">{{ t('templates.subtitle') }}</p>
      </div>
      
      <div class="templates-content">
        <div class="template-categories">
          <button
            v-for="category in categories"
            :key="category.key"
            :class="['category-btn', { active: activeCategory === category.key }]"
            @click="activeCategory = category.key"
          >
            {{ t(category.label) }}
          </button>
        </div>
        
        <div class="templates-grid">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="template-card"
            @click="selectTemplate(template)"
          >
            <div class="template-preview">
              <div class="preview-image">
                <img v-if="template.preview" :src="template.preview" :alt="template.name" />
                <div v-else class="preview-placeholder">
                  <span>{{ template.name.charAt(0) }}</span>
                </div>
              </div>
              <div class="template-overlay">
                <button class="preview-btn">{{ t('templates.preview') }}</button>
                <button class="select-btn">{{ t('templates.select') }}</button>
              </div>
            </div>
            
            <div class="template-info">
              <h3 class="template-name">{{ template.name }}</h3>
              <p class="template-description">{{ template.description }}</p>
              <div class="template-meta">
                <span class="template-category">{{ t(`templates.categories.${template.category}`) }}</span>
                <span class="template-status" :class="template.status">
                  {{ t(`templates.status.${template.status}`) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="filteredTemplates.length === 0" class="empty-state">
          <p>{{ t('templates.noTemplates') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '@ldesign/i18n/vue'
import { useTemplate } from '@ldesign/template'

const { t } = useI18n()
const templateManager = useTemplate()

const activeCategory = ref('all')

const categories = [
  { key: 'all', label: 'templates.categories.all' },
  { key: 'login', label: 'templates.categories.login' },
  { key: 'dashboard', label: 'templates.categories.dashboard' },
  { key: 'admin', label: 'templates.categories.admin' }
]

const templates = ref([
  {
    id: 'classic-login',
    name: 'Classic Login',
    description: '经典登录模板，简洁大方',
    category: 'login',
    status: 'active',
    preview: '/templates/classic-login.png'
  },
  {
    id: 'modern-login',
    name: 'Modern Login',
    description: '现代化登录模板，时尚美观',
    category: 'login',
    status: 'active',
    preview: '/templates/modern-login.png'
  },
  {
    id: 'minimal-login',
    name: 'Minimal Login',
    description: '极简登录模板，专注体验',
    category: 'login',
    status: 'active',
    preview: '/templates/minimal-login.png'
  },
  {
    id: 'creative-login',
    name: 'Creative Login',
    description: '创意登录模板，独特设计',
    category: 'login',
    status: 'beta',
    preview: '/templates/creative-login.png'
  },
  {
    id: 'classic-dashboard',
    name: 'Classic Dashboard',
    description: '经典仪表板模板',
    category: 'dashboard',
    status: 'active',
    preview: '/templates/classic-dashboard.png'
  },
  {
    id: 'modern-dashboard',
    name: 'Modern Dashboard',
    description: '现代化仪表板模板',
    category: 'dashboard',
    status: 'active',
    preview: '/templates/modern-dashboard.png'
  }
])

const filteredTemplates = computed(() => {
  if (activeCategory.value === 'all') {
    return templates.value
  }
  return templates.value.filter(template => template.category === activeCategory.value)
})

const selectTemplate = (template: any) => {
  console.log('Selected template:', template)
  // 这里可以调用模板管理器来切换模板
  // templateManager.setTemplate(template.id)
}
</script>

<style lang="less" scoped>
.templates-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
}

.templates-container {
  max-width: 1200px;
  margin: 0 auto;
}

.templates-header {
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    color: #666;
    font-size: 1rem;
  }
}

.templates-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.template-categories {
  display: flex;
  border-bottom: 1px solid #e1e5e9;
  
  .category-btn {
    flex: 1;
    padding: 1rem;
    border: none;
    background: #f8f9fa;
    color: #6c757d;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #e9ecef;
    }
    
    &.active {
      background: white;
      color: #667eea;
      border-bottom: 2px solid #667eea;
    }
  }
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.template-card {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.template-preview {
  position: relative;
  height: 200px;
  overflow: hidden;
  
  .preview-image {
    width: 100%;
    height: 100%;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .preview-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      
      span {
        font-size: 3rem;
        font-weight: bold;
        color: white;
      }
    }
  }
  
  .template-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    opacity: 0;
    transition: opacity 0.2s;
    
    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
      
      &.preview-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        
        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
      
      &.select-btn {
        background: #667eea;
        color: white;
        
        &:hover {
          background: #5a6fd8;
        }
      }
    }
  }
  
  &:hover .template-overlay {
    opacity: 1;
  }
}

.template-info {
  padding: 1rem;
  
  .template-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  .template-description {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    line-height: 1.4;
  }
  
  .template-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .template-category {
      background: #f8f9fa;
      color: #6c757d;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    
    .template-status {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
      
      &.active {
        background: #d4edda;
        color: #155724;
      }
      
      &.beta {
        background: #fff3cd;
        color: #856404;
      }
      
      &.deprecated {
        background: #f8d7da;
        color: #721c24;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}
</style>
