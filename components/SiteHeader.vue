<template>
  <header class="site-header">
    <div class="container">
      <h1 class="site-title">Memory Game</h1>
      
      <nav class="site-nav">
        <NuxtLink to="/" class="nav-link">{{ t('common.home') }}</NuxtLink>
        <NuxtLink to="/leaderboard" class="nav-link">{{ t('common.leaderboard') }}</NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();
</script>

<style scoped>
.site-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-title {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0;
}

.site-nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: #4a5568;
  text-decoration: none;
  padding: 0.5rem;
  transition: all 0.2s;
  border-radius: 4px;
}

.nav-link:hover {
  background-color: #f7fafc;
  color: #2d3748;
}

.nav-link.router-link-exact-active {
  color: #4299e1;
  font-weight: 500;
}

@media (max-width: 640px) {
  .container {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
