<template>
  <div class="about-view">
    <div class="about-container">
      <div class="about-header">
        <div class="logo-section">
          <div class="logo">
            <span class="logo-text">LDesign</span>
          </div>
          <h1>{{ t('about.title') }}</h1>
          <p class="version">{{ t('about.version') }} {{ version }}</p>
        </div>
      </div>
      
      <div class="about-content">
        <div class="about-card">
          <h2>{{ t('about.description.title') }}</h2>
          <p>{{ t('about.description.content') }}</p>
        </div>
        
        <div class="features-grid">
          <div
            v-for="feature in features"
            :key="feature.key"
            class="feature-card"
          >
            <div class="feature-icon">
              <span>{{ feature.icon }}</span>
            </div>
            <h3>{{ t(`about.features.${feature.key}.title`) }}</h3>
            <p>{{ t(`about.features.${feature.key}.description`) }}</p>
          </div>
        </div>
        
        <div class="tech-stack">
          <h2>{{ t('about.techStack.title') }}</h2>
          <div class="tech-grid">
            <div
              v-for="tech in techStack"
              :key="tech.name"
              class="tech-item"
            >
              <div class="tech-icon">{{ tech.icon }}</div>
              <span class="tech-name">{{ tech.name }}</span>
              <span class="tech-version">{{ tech.version }}</span>
            </div>
          </div>
        </div>
        
        <div class="team-section">
          <h2>{{ t('about.team.title') }}</h2>
          <div class="team-grid">
            <div
              v-for="member in team"
              :key="member.name"
              class="team-member"
            >
              <div class="member-avatar">
                <span>{{ member.name.charAt(0) }}</span>
              </div>
              <h3>{{ member.name }}</h3>
              <p class="member-role">{{ member.role }}</p>
              <p class="member-description">{{ member.description }}</p>
            </div>
          </div>
        </div>
        
        <div class="contact-section">
          <h2>{{ t('about.contact.title') }}</h2>
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-label">{{ t('about.contact.email') }}:</span>
              <span class="contact-value">contact@ldesign.com</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">{{ t('about.contact.website') }}:</span>
              <span class="contact-value">https://ldesign.com</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">{{ t('about.contact.github') }}:</span>
              <span class="contact-value">https://github.com/ldesign</span>
            </div>
          </div>
        </div>
        
        <div class="license-section">
          <h2>{{ t('about.license.title') }}</h2>
          <p>{{ t('about.license.content') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@ldesign/i18n/vue'

const { t } = useI18n()

const version = ref('1.0.0')

const features = [
  { key: 'modular', icon: '🧩' },
  { key: 'typescript', icon: '📘' },
  { key: 'responsive', icon: '📱' },
  { key: 'i18n', icon: '🌍' },
  { key: 'themes', icon: '🎨' },
  { key: 'performance', icon: '⚡' }
]

const techStack = [
  { name: 'Vue 3', version: '3.4+', icon: '💚' },
  { name: 'TypeScript', version: '5.0+', icon: '🔷' },
  { name: 'Vite', version: '5.0+', icon: '⚡' },
  { name: 'Pinia', version: '2.0+', icon: '🍍' },
  { name: 'Vue Router', version: '4.0+', icon: '🛣️' },
  { name: 'Less', version: '4.0+', icon: '🎨' }
]

const team = [
  {
    name: 'Alex Chen',
    role: 'Lead Developer',
    description: '全栈开发工程师，专注于前端架构设计'
  },
  {
    name: 'Sarah Wang',
    role: 'UI/UX Designer',
    description: '用户体验设计师，致力于创造优秀的用户界面'
  },
  {
    name: 'Mike Zhang',
    role: 'Backend Developer',
    description: '后端开发工程师，负责系统架构和API设计'
  }
]
</script>

<style lang="less" scoped>
.about-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
}

.about-header {
  text-align: center;
  margin-bottom: 3rem;
  
  .logo-section {
    .logo {
      margin-bottom: 1rem;
      
      .logo-text {
        font-size: 3rem;
        font-weight: bold;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    
    h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 0.5rem;
    }
    
    .version {
      color: #666;
      font-size: 1.1rem;
    }
  }
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.about-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  h2 {
    color: #333;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
    line-height: 1.6;
    font-size: 1.1rem;
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  .feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    color: #333;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
    line-height: 1.5;
  }
}

.tech-stack {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  h2 {
    color: #333;
    margin-bottom: 2rem;
    text-align: center;
  }
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
  }
  
  .tech-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .tech-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
  }
  
  .tech-version {
    font-size: 0.9rem;
    color: #666;
  }
}

.team-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  h2 {
    color: #333;
    margin-bottom: 2rem;
    text-align: center;
  }
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.team-member {
  text-align: center;
  padding: 1.5rem;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  
  .member-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
    margin: 0 auto 1rem;
  }
  
  h3 {
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  .member-role {
    color: #667eea;
    font-weight: 500;
    margin-bottom: 1rem;
  }
  
  .member-description {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
  }
}

.contact-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  h2 {
    color: #333;
    margin-bottom: 2rem;
    text-align: center;
  }
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  
  .contact-label {
    font-weight: 500;
    color: #333;
  }
  
  .contact-value {
    color: #667eea;
  }
}

.license-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  h2 {
    color: #333;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
    line-height: 1.6;
  }
}

@media (max-width: 768px) {
  .about-view {
    padding: 1rem;
  }
  
  .about-header .logo-section {
    .logo .logo-text {
      font-size: 2rem;
    }
    
    h1 {
      font-size: 1.8rem;
    }
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .tech-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .team-grid {
    grid-template-columns: 1fr;
  }
}
</style>
