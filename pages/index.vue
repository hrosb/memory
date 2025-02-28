<template>
  <div class="leaderboard-page">
    <div class="container">
      <h1 class="page-title">{{ t('score.globalTopScores') }}</h1>
      
      <div class="filter-options">
        <!-- Board Size Filter -->
        <div class="filter-group">
          <label class="filter-label">{{ t('game.difficulty') }}</label>
          <select v-model="filters.boardSize" class="filter-select">
            <option value="">{{ t('common.all') }}</option>
            <option v-for="option in boardSizeOptions" :key="option.id" :value="option.id">
              {{ option.name_nb }}
            </option>
          </select>
        </div>
        
        <!-- Card Type Filter -->
        <div class="filter-group">
          <label class="filter-label">{{ t('game.cardType') }}</label>
          <select v-model="filters.cardType" class="filter-select">
            <option value="">{{ t('common.all') }}</option>
            <option v-for="type in availableCardTypes" :key="type.type" :value="type.type">
              {{ type.name_nb }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Leaderboard Table -->
      <div class="leaderboard-table-wrapper">
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>{{ t('common.loading') }}...</p>
        </div>
        
        <table v-else class="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ t('common.player') }}</th>
              <th>{{ t('score.time') }}</th>
              <th>{{ t('score.accuracy') }}</th>
              <th>{{ t('game.difficulty') }}</th>
              <th>{{ t('game.cardType') }}</th>
              <th>{{ t('common.date') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(score, index) in leaderboard" :key="score.id">
              <td class="rank-cell">{{ calculateRank(index) }}</td>
              <td>{{ score.playerName }}</td>
              <td>{{ score.timeSpent.toFixed(2) }}s</td>
              <td>{{ (score.accuracy * 100).toFixed(2) }}%</td>
              <td>{{ score.boardSize }}</td>
              <td>{{ getCardTypeName(score.cardType) }}</td>
              <td>{{ formatDate(score.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="pagination && !isLoading" class="pagination">
          <button 
            class="page-btn" 
            :disabled="pagination.page <= 1"
            @click="changePage(pagination.page - 1)"
          >
            &laquo; {{ t('common.previous') }}
          </button>
          
          <span class="page-info">
            {{ t('common.page') }} {{ pagination.page }} / {{ pagination.pages }}
          </span>
          
          <button 
            class="page-btn" 
            :disabled="pagination.page >= pagination.pages"
            @click="changePage(pagination.page + 1)"
          >
            {{ t('common.next') }} &raquo;
          </button>
        </div>
      </div>
      
      <div class="back-button-container">
        <NuxtLink to="/" class="back-button">
          &laquo; {{ t('common.backToGame') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useLeaderboard } from '../composables/useLeaderboard';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();
const { getLeaderboard, isLoading, leaderboard, error } = useLeaderboard();

// Pagination state
const pagination = ref(null);

// Filter options
const filters = reactive({
  boardSize: '',
  cardType: '',
  page: 1,
  limit: 20
});

// Available options for filters (same as used in game)
const boardSizeOptions = [
  { id: '2x2', name_nb: 'Altfor enkelt' },
  { id: '2x3', name_nb: 'Veldig enkelt' },
  { id: '3x4', name_nb: 'Enkelt' },
  { id: '4x4', name_nb: 'Normal' },
  { id: '4x5', name_nb: 'Vanskelig' },
  { id: '6x6', name_nb: 'Ekspert' }
];

const availableCardTypes = [
  { type: 'animals', name_nb: 'Dyr' },
  { type: 'letters', name_nb: 'Bokstaver' }
];

// Load leaderboard data with current filters
async function loadLeaderboard() {
  const result = await getLeaderboard({
    boardSize: filters.boardSize,
    cardType: filters.cardType,
    page: filters.page,
    limit: filters.limit
  });
  
  if (result) {
    pagination.value = result.pagination;
  }
}

// Watch for filter changes
watch(filters, () => {
  loadLeaderboard();
});

// Helper functions
function calculateRank(index) {
  return ((pagination.value?.page - 1) * filters.limit) + index + 1;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function getCardTypeName(type) {
  const cardType = availableCardTypes.find(ct => ct.type === type);
  return cardType ? cardType.name_nb : type;
}

function changePage(newPage) {
  filters.page = newPage;
}

onMounted(() => {
  loadLeaderboard();
});
</script>

<style scoped>
.leaderboard-page {
  min-height: 100vh;
  background: linear-gradient(322deg, #ba4aff, rgba(186, 74, 255, 0) 70%),
              linear-gradient(178deg, #008aff, rgba(0, 138, 255, 0) 70%),
              linear-gradient(24deg, #00ffc6, rgba(0, 255, 198, 0) 35%);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
}

.page-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #2d3748;
  font-size: 2.5rem;
}

.filter-options {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  width: 200px;
}

.filter-label {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
}

.leaderboard-table-wrapper {
  overflow-x: auto;
  margin-bottom: 2rem;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
}

.leaderboard-table th,
.leaderboard-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.leaderboard-table th {
  background-color: #f7fafc;
  font-weight: 600;
  color: #4a5568;
}

.leaderboard-table tr:hover {
  background-color: #f7fafc;
}

.rank-cell {
  font-weight: bold;
  color: #4299e1;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 0;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #4299e1;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 1rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.page-btn:hover {
  background-color: #3182ce;
}

.page-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.page-info {
  color: #4a5568;
}

.back-button-container {
  text-align: center;
  margin-top: 2rem;
}

.back-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #2d3748;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #1a202c;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .filter-options {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .leaderboard-table th,
  .leaderboard-table td {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}
</style>
