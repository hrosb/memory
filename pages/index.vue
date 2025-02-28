<template>
  <div class="min-h-screen py-8 [background:linear-gradient(322deg,#ba4aff,rgba(186,74,255,0)_70%),linear-gradient(178deg,#008aff,rgba(0,138,255,0)_70%),linear-gradient(24deg,#00ffc6,rgba(0,255,198,0)_35%)]">
    <div class="max-w-[1200px] mx-auto p-4 md:p-8 bg-[rgba(255,255,255,0.95)] rounded-[16px] shadow-[0_8px_32px_rgba(31,38,135,0.15)]">
      <h1 class="text-center mb-8 text-gray-800 text-2xl md:text-4xl">{{ t('score.globalTopScores') }}</h1>

      <!-- Filters -->
      <div class="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-8 mb-8">
        <!-- Board Size Filter -->
        <div class="flex flex-col w-[200px]">
          <label class="text-sm mb-2 text-gray-600">{{ t('game.difficulty') }}</label>
          <select v-model="filters.boardSize" class="p-3 border border-gray-200 rounded-lg bg-white">
            <option value="">{{ t('common.all') }}</option>
            <option v-for="option in boardSizeOptions" :key="option.id" :value="option.id">{{ option.name_nb }}</option>
          </select>
        </div>

        <!-- Card Type Filter -->
        <div class="flex flex-col w-[200px]">
          <label class="text-sm mb-2 text-gray-600">{{ t('game.cardType') }}</label>
          <select v-model="filters.cardType" class="p-3 border border-gray-200 rounded-lg bg-white">
            <option value="">{{ t('common.all') }}</option>
            <option v-for="type in availableCardTypes" :key="type.type" :value="type.type">{{ type.name_nb }}</option>
          </select>
        </div>
      </div>

      <!-- Leaderboard Table -->
      <div class="overflow-x-auto mb-8">
        <!-- Loading -->
        <div v-if="isLoading" class="flex flex-col items-center py-12">
          <div class="w-10 h-10 border-4 border-gray-100 border-t-blue-400 rounded-full animate-spin mb-4"></div>
          <p>{{ t('common.loading') }}...</p>
        </div>

        <!-- Table -->
        <table v-else class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100 font-semibold text-gray-600">
              <th class="p-2 md:p-4 text-left border-b border-gray-200">#</th>
              <th class="p-2 md:p-4 text-left border-b border-gray-200">{{ t('common.player') }}</th>
              <th class="p-2 md:p-4 text-left border-b border-gray-200">{{ t('score.time') }}</th>
              <th class="p-2 md:p-4 text-left border-b border-gray-200">{{ t('score.accuracy') }}</th>
              <th class="p-2 md:p-4 text-left border-b border-gray-200">{{ t('game.difficulty') }}</th>
              <th class="p-2 md:p-4 text-left border-b border-gray-200">{{ t('game.cardType') }}</th>
              <th class="p-2 md:p-4 text-left border-b border-gray-200">{{ t('common.date') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(score, index) in leaderboard" 
              :key="score.id" 
              class="hover:bg-gray-100"
            >
              <td class="p-2 md:p-4 text-left border-b border-gray-200 font-bold text-blue-400">{{ calculateRank(index) }}</td>
              <td class="p-2 md:p-4 text-left border-b border-gray-200">{{ score.playerName }}</td>
              <td class="p-2 md:p-4 text-left border-b border-gray-200">{{ score.timeSpent.toFixed(2) }}s</td>
              <td class="p-2 md:p-4 text-left border-b border-gray-200">{{ (score.accuracy * 100).toFixed(2) }}%</td>
              <td class="p-2 md:p-4 text-left border-b border-gray-200">{{ score.boardSize }}</td>
              <td class="p-2 md:p-4 text-left border-b border-gray-200">{{ getCardTypeName(score.cardType) }}</td>
              <td class="p-2 md:p-4 text-left border-b border-gray-200">{{ formatDate(score.createdAt) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="pagination && !isLoading" class="flex justify-center items-center mt-8 gap-4">
          <button 
            class="px-4 py-2 bg-blue-400 text-white rounded transition-colors hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed" 
            :disabled="pagination.page <= 1" 
            @click="changePage(pagination.page - 1)"
          >
            &laquo; {{ t('common.previous') }}
          </button>
          <span class="text-gray-600">{{ t('common.page') }} {{ pagination.page }} / {{ pagination.pages }}</span>
          <button 
            class="px-4 py-2 bg-blue-400 text-white rounded transition-colors hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed" 
            :disabled="pagination.page >= pagination.pages" 
            @click="changePage(pagination.page + 1)"
          >
            {{ t('common.next') }} &raquo;
          </button>
        </div>
      </div>

      <!-- Back button -->
      <div class="text-center mt-8">
        <NuxtLink 
          to="/" 
          class="inline-block px-4 py-3 bg-gray-800 text-white no-underline rounded-lg transition-colors hover:bg-gray-900"
        >
          &laquo; {{ t('common.backToGame') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useLeaderboard } from '../composables/useLeaderboard'

interface Pagination {
  page: number
  pages: number
}

interface Score {
  id: string
  playerName: string
  timeSpent: number
  accuracy: number
  boardSize: string
  cardType: string
  createdAt: string
}

interface Filters {
  boardSize: string
  cardType: string
  page: number
  limit: number
}

interface BoardSizeOption {
  id: string
  name_nb: string
}

interface CardType {
  type: string
  name_nb: string
}

const { t } = useI18n()
const { getLeaderboard, isLoading, leaderboard, error } = useLeaderboard()

const pagination = ref<Pagination | null>(null)

// Filters
const filters = reactive<Filters>({
  boardSize: '',
  cardType: '',
  page: 1,
  limit: 20
})

// Board sizes
const boardSizeOptions: BoardSizeOption[] = [
  { id: '2x2', name_nb: 'Altfor enkelt' },
  { id: '2x3', name_nb: 'Veldig enkelt' },
  { id: '3x4', name_nb: 'Enkelt' },
  { id: '4x4', name_nb: 'Normal' },
  { id: '4x5', name_nb: 'Vanskelig' },
  { id: '6x6', name_nb: 'Ekspert' }
]

// Card types
const availableCardTypes: CardType[] = [
  { type: 'animals', name_nb: 'Dyr' },
  { type: 'letters', name_nb: 'Bokstaver' }
]

async function loadLeaderboard(): Promise<void> {
  const result = await getLeaderboard({
    boardSize: filters.boardSize,
    cardType: filters.cardType,
    page: filters.page,
    limit: filters.limit
  })

  if (result && result.pagination) {
    pagination.value = result.pagination
  }
}

watch(filters, () => {
  loadLeaderboard()
})

function calculateRank(index: number): number {
  return ((pagination.value?.page ?? 1) - 1) * filters.limit + index + 1
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

function getCardTypeName(type: string): string {
  const cardType = availableCardTypes.find(ct => ct.type === type)
  return cardType ? cardType.name_nb : type
}

function changePage(newPage: number): void {
  filters.page = newPage
}

onMounted(() => {
  loadLeaderboard()
})
</script>
