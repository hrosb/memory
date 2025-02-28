<template>
  <div class="result-display">
    <div class="result-header">
      <h3>{{ title }}</h3>
    </div>
    
    <div class="result-stats">
      <div class="stat-item">
        <span class="stat-label">{{ t('score.time') }}</span>
        <span class="stat-value">{{ score.timeSpent.toFixed(2) }}s</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">{{ t('score.accuracy') }}</span>
        <span class="stat-value">{{ (score.accuracy * 100).toFixed(2) }}%</span>
      </div>
      <div v-if="score.rank" class="stat-item">
        <span class="stat-label">{{ t('score.rank') }}</span>
        <span class="stat-value">#{{ score.rank }}</span>
      </div>
    </div>
    
    <div class="player-name">
      <span>{{ score.playerName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();

const props = defineProps({
  score: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.result-display {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.result-header {
  margin-bottom: 0.5rem;
  text-align: center;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 0.5rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #666;
}

.stat-value {
  font-weight: bold;
  font-size: 1.1rem;
}

.player-name {
  text-align: center;
  font-weight: 500;
  font-style: italic;
}
</style>
