<template>
  <div
    class="max-w-[480px] mx-auto my-8 p-8 bg-[rgba(255,255,255,0.95)] rounded-[16px] shadow-[0_8px_32px_rgba(31,38,135,0.15)] backdrop-blur-[8px] translate-y-[10px] opacity-100 transition-all duration-300 ease-out"
    :class="{
      'translate-y-0': showForm,
      'scale-[0.8]': props.mode === 'retry'
    }"
    :data-mode="props.mode"
  >
    <!-- Header -->
    <div class="text-center mb-8">
      <h2 class="text-[1.8rem] text-gray-800 font-semibold mb-0">
        {{ mode === 'retry' ? t('game.tryAgain') : t('game.newGame') }}
      </h2>
    </div>

    <!-- Game options -->
    <div v-if="mode === 'new-game'">
      <!-- Player Name -->
      <div class="mb-6">
        <label class="block text-[0.9rem] font-medium text-gray-600 mb-2" for="name">
          {{ t('game.nameInput') }}
        </label>
        <div class="relative">
          <input
            class="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors bg-white focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
            name="name"
            v-model="playerName"
            maxlength="20"
            :placeholder="t('game.namePlaceholder')"
          />
        </div>
      </div>

      <!-- Card Type -->
      <div class="mb-6">
        <label class="block text-[0.9rem] font-medium text-gray-600 mb-2" for="card-type">
          {{ t('game.cardType') }}
        </label>
        <div class="relative">
          <select
            class="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors bg-white focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
            id="card-type"
            v-model="cardType"
          >
            <option
              v-for="ct in props.availableCardTypes"
              :key="ct.type"
              :value="ct.type"
            >
              {{ ct.name_nb }}
            </option>
          </select>
        </div>
      </div>

      <!-- Difficulty -->
      <div class="mb-6">
        <label class="block text-[0.9rem] font-medium text-gray-600 mb-2" for="board-size">
          {{ t('game.difficulty') }}
        </label>
        <div class="relative">
          <select
            class="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors bg-white focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
            id="board-size"
            v-model="boardSizeId"
          >
            <option
              v-for="board in props.boardSizeOptions"
              :key="board.id"
              :value="board.id"
            >
              {{ board.name_nb }}
            </option>
          </select>
        </div>
      </div>

      <!-- Sound Options -->
      <div class="flex flex-col gap-4 my-6">
        <!-- Gfx Toggle -->
        <div class="flex items-center">
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" v-model="audioSettings.gfx" />
            <div class="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6 peer-checked:after:border-white"></div>
            <span class="ml-2 text-gray-700">
              {{ audioSettings.gfx ? t('game.soundOn') : t('game.soundOff') }}
            </span>
          </label>
        </div>

        <!-- Music Toggle -->
        <div class="flex items-center">
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" v-model="audioSettings.music" />
            <div class="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6 peer-checked:after:border-white"></div>
            <span class="ml-2 text-gray-700">
              {{ audioSettings.music ? t('game.musicOn') : t('game.musicOff') }}
            </span>
          </label>
        </div>
      </div>

      <!-- Leaderboard Preview -->
      <div
        v-if="showLeaderboardPreview"
        class="mt-6 p-4 bg-[rgba(255,255,255,0.5)] rounded-lg"
      >
        <h3 class="text-center text-base mb-3">{{ t('score.globalTopScores') }}</h3>
        <div v-if="leaderboardLoading" class="text-center py-4 text-gray-600">
          {{ t('common.loading') }}...
        </div>
        <div v-else-if="previewLeaderboard.length === 0" class="text-center py-4 text-gray-600">
          {{ t('score.noScoresYet') }}
        </div>
        <ul v-else class="list-none p-0 m-0">
          <li
            v-for="(score, index) in previewLeaderboard.slice(0, 3)"
            :key="score.id"
            class="flex items-center py-2 border-b border-[rgba(0,0,0,0.1)]"
          >
            <span class="font-bold w-6">{{ index + 1 }}</span>
            <span class="flex-1">{{ score.playerName }}</span>
            <span class="font-medium">{{ score.timeSpent.toFixed(2) }}s</span>
          </li>
        </ul>
      </div>
      <div class="mt-4 flex gap-2">
        <button
          v-if="mode === 'new-game'"
          class="flex-1 p-2 bg-[rgba(255,255,255,0.5)] border border-[rgba(0,0,0,0.1)] rounded transition-colors hover:bg-[rgba(255,255,255,0.8)]"
          @click="toggleLeaderboardPreview"
        >
          {{ showLeaderboardPreview ? t('common.hideHighScores') : t('common.showHighScores') }}
        </button>
        

      </div>

    </div>

    <!-- Language Switcher -->
    <div v-if="mode === 'new-game'" class="mt-8 pt-6 border-t border-[rgba(0,0,0,0.1)]">
      <label class="block text-[0.9rem] font-medium text-gray-600 mb-2">{{ t('game.language') }}</label>
      <div class="flex gap-2">
        <button
          type="button"
          @click="setLocale('nb')"
          :class="[
            'flex-1 p-3 border-2 rounded-lg text-sm transition-all duration-200',
            locale === 'nb' 
              ? 'bg-blue-500 border-blue-500 text-white font-semibold shadow-md' 
              : 'bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50'
          ]"
        >
          Norsk
        </button>
        <button
          type="button"
          @click="setLocale('en')"
          :class="[
            'flex-1 p-3 border-2 rounded-lg text-sm transition-all duration-200',
            locale === 'en' 
              ? 'bg-blue-500 border-blue-500 text-white font-semibold shadow-md' 
              : 'bg-white border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50'
          ]"
        >
          English
        </button>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-center gap-4 mt-8">
      <button
        v-if="mode === 'retry'"
        class="px-4 py-3 rounded-lg font-semibold transition-all bg-gray-600 text-white hover:brightness-110 active:scale-[0.98]"
        @click="gotoBoardOptions"
      >
        <span class="mr-2">←</span>
        {{ t('game.back') }}
      </button>
      <button
        class="relative px-4 py-3 rounded-lg font-semibold transition-all bg-blue-500 text-white hover:brightness-110 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        @click="startGame"
        :disabled="props.mode === 'new-game' && !formState.isValid"
      >
        <span
          v-if="isLoading"
          class="inline-block w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"
        />
        <span v-else>{{ props.mode === 'retry' ? t('game.tryAgain') : t('game.startGame') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import { useUrlSearchParams } from '@vueuse/core'
import { useI18n } from '../composables/useI18n'
import { useLeaderboard } from '../composables/useLeaderboard'

const { t, setLocale, locale } = useI18n()
const { getLeaderboard, leaderboard: boardScores, isLoading: leaderboardLoading } = useLeaderboard()

// Get URL params for syncing
const urlParams = useUrlSearchParams('history')

interface AudioSettings {
  gfx: boolean
  music: boolean
}

interface CardType {
  type: string
  name: string
  name_nb: string
  cards: string[]
}

const props = defineProps<{
  availableCardTypes: CardType[]
  boardSizeOptions: { id: string; name_nb: string }[]
  mode: 'new-game' | 'retry'
  gameState: {
    cardType: string
    boardSizeId: string
    [key: string]: any
  }
}>()

const emit = defineEmits(['startGame', 'gotoBoardOptions'])

const playerName = useLocalStorage('playerName', '')
const nameError = ref('')
const isLoading = ref(false)
const showForm = ref(true)

// Sync these with URL parameters rather than just local refs
const cardType = computed({
  get: () => (urlParams.cardType as string) || props.gameState.cardType,
  set: (value) => { urlParams.cardType = value }
});

const boardSizeId = computed({
  get: () => (urlParams.boardSize as string) || props.gameState.boardSizeId,
  set: (value) => { urlParams.boardSize = value }
});

// Sync audio settings with URL - simplified logic
const audioSettings = useLocalStorage<AudioSettings>('audioSettings', {
  gfx: urlParams.sound !== 'false',
  music: urlParams.music === 'true'
})

// Update URL when audio settings change - more efficient with single watch
watch(audioSettings, (newValues) => {
  urlParams.sound = newValues.gfx.toString();
  urlParams.music = newValues.music.toString();
}, { deep: true })

// Simplified formState
const formState = reactive({
  isValid: computed(() => true),
  isDirty: false
})

// Show the form once mounted
onMounted(() => {
  showForm.value = true
  if (playerName.value) {
    formState.isDirty = true
  }
})

async function startGame() {
  isLoading.value = true
  try {
    emit('startGame', {
      cardType: cardType.value,
      boardSizeId: boardSizeId.value,
      playerName: playerName.value || 'Anonymous',
      gfxOn: audioSettings.value.gfx,
      musicOn: audioSettings.value.music
    })
  } finally {
    isLoading.value = false
  }
}

function gotoBoardOptions() {
  emit('gotoBoardOptions')
}

const showLeaderboardPreview = ref(false)
const previewLeaderboard = ref<any[]>([])

watch([cardType, boardSizeId], async ([newCardType, newBoardSizeId]) => {
  if (showLeaderboardPreview.value) {
    await loadLeaderboardPreview(newCardType, newBoardSizeId)
  }
})

async function loadLeaderboardPreview(cardTypeVal: string, boardSize: string) {
  try {
    await getLeaderboard({
      cardType: cardTypeVal,
      boardSize,
      limit: 3
    })
    previewLeaderboard.value = [...boardScores.value]
  } catch (error) {
    console.error('Failed to load leaderboard preview', error)
  }
}

function toggleLeaderboardPreview() {
  showLeaderboardPreview.value = !showLeaderboardPreview.value
  if (showLeaderboardPreview.value) {
    loadLeaderboardPreview(cardType.value, boardSizeId.value)
  }
}

</script>
