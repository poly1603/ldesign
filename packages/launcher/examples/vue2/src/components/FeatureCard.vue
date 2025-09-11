<template>
  <div class="feature-card">
    <div class="feature-icon">{{ icon }}</div>
    <h4 class="feature-title">{{ title }}</h4>
    <p class="feature-description">{{ description }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'FeatureCard',
  props: {
    icon: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.feature-card {
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px -1px var(--shadow-color);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px -5px var(--shadow-color);
    border-color: var(--primary-color);
  }
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.feature-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}
</style>
