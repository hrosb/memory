<template>
  <div class="new-game-form" 
       :class="{ 'form-entering': showForm }"
       :data-mode="props.mode">
    <div class="form-header">
      <h2 class="form-title">{{ mode === 'retry' ? t('game.tryAgain') : t('game.newGame') }}</h2>
    </div>

    <div class="game-options" v-if="mode === 'new-game'">
      <!-- Simplified name input without validation -->
      <div class="form-group">
        <label class="form-label" for="name">{{ t('game.nameInput') }}</label>
        <div class="input-wrapper">
          <input 
            class="form-input"
            name="name" 
            v-model="playerName"
            maxlength="20"
            :placeholder="t('game.namePlaceholder')"
          >
        </div>
      </div>

      <!-- Card Type Selection -->
      <div class="form-group">
        <label class="form-label" for="card-type">{{ t('game.cardType') }}</label>
        <div class="select-wrapper">
          <select class="form-select" id="card-type" v-model="cardType">
            <option v-for="ct in availableCardTypes" 
                    :key="ct.type" 
                    :value="ct.type">
              {{ ct.name_nb }}
            </option>
          </select>
        </div>
      </div>

      <!-- Difficulty Selection -->
      <div class="form-group">
        <label class="form-label" for="board-size">{{ t('game.difficulty') }}</label>
        <div class="select-wrapper">
          <select class="form-select" id="board-size" v-model="boardSizeId">
            <option v-for="board in boardSizeOptions" 
                    :key="board.id" 
                    :value="board.id">
              {{ board.name_nb }}
            </option>
          </select>
        </div>
      </div>

      <!-- Sound Options -->
      <div class="sound-options">
        <div class="toggle-option">
          <label class="toggle-label">
            <input type="checkbox" v-model="audioSettings.gfx">
            <span class="toggle-switch"></span>
            <span class="toggle-text">{{ audioSettings.gfx ? t('game.soundOn') : t('game.soundOff') }}</span>
          </label>
        </div>

        <div class="toggle-option">
          <label class="toggle-label">
            <input type="checkbox" v-model="audioSettings.music">
            <span class="toggle-switch"></span>
            <span class="toggle-text">{{ audioSettings.music ? t('game.musicOn') : t('game.musicOff') }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Replace language switcher markup -->
    <div class="language-switcher" v-if="mode === 'new-game'">
      <label class="form-label">{{ t('game.language') }}</label>
      <div class="language-buttons">
        <button 
          type="button"
          @click="setLocale('nb')" 
          :class="['lang-btn', { 'active': locale === 'nb' }]"
        >Norsk</button>
        <button 
          type="button"
          @click="setLocale('en')" 
          :class="['lang-btn', { 'active': locale === 'en' }]"
        >English</button>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="form-actions">
      <button v-if="mode === 'retry'"
              class="action-button secondary"
              @click="gotoBoardOptions">
        <span class="button-icon">←</span>
        {{ t('game.back') }}
      </button>
      
      <button class="action-button primary"
              @click="startGame"
              :disabled="props.mode === 'new-game' && !formState.isValid">
        <span v-if="isLoading" class="loader"></span>
        <span v-else>{{ props.mode === 'retry' ? t('game.tryAgain') : t('game.startGame') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { useI18n } from '../composables/useI18n'
const { t, setLocale, locale } = useI18n()

interface AudioSettings {
  gfx: boolean;
  music: boolean;
}

interface CardType {
  type: string;
  name: string;
  name_nb: string;
  cards: string[];
}

const props = defineProps<{
  availableCardTypes: CardType[]
  boardSizeOptions: { id: string; name_nb: string; }[],
  mode: 'new-game' | 'retry',
  gameState: any,
}>();

const emit = defineEmits(['startGame', 'gotoBoardOptions']);

const playerName = useLocalStorage('playerName', '');
const nameError = ref('');
const isLoading = ref(false);
const showForm = ref(true); // Changed from false to true

const cardType = ref(props.gameState.cardType);
const boardSizeId = ref(props.gameState.boardSizeId);

const audioSettings = useLocalStorage<AudioSettings>('audioSettings', {
  gfx: true,
  music: false
});

// Simplified formState
const formState = reactive({
  isValid: computed(() => true), // Always valid now
  isDirty: false
});

// Force initial validation on mount
onMounted(() => {
  showForm.value = true;
  if (playerName.value) {
    formState.isDirty = true;
  }
});

async function startGame() {
  isLoading.value = true;
  try {
    emit('startGame', {
      cardType: cardType.value,
      boardSizeId: boardSizeId.value,
      playerName: playerName.value || 'Anonymous',
      gfxOn: audioSettings.value.gfx,
      musicOn: audioSettings.value.music,
    });
  } finally {
    isLoading.value = false;
  }
}

const playerNameInputWidth = computed(() => {
  return `${playerName.value.length * .85}rem`;
});

function gotoBoardOptions() {
  emit('gotoBoardOptions');
}

onMounted(() => {
  showForm.value = true;
  // Validate initial value if exists
  if (playerName.value) {
    formState.isDirty = true;
  }
});
</script>

<style scoped>
.new-game-form {
  max-width: 480px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  backdrop-filter: blur(8px);
  transform: translateY(10px);
  opacity: 1; 
  transition: all 0.3s ease-out;
}

.form-entering {
  transform: translateY(0);
  opacity: 1;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.8rem;
  color: #2d3748;
  font-weight: 600;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.input-wrapper, .select-wrapper {
  position: relative;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background-color: white;
}

.form-input:focus, .form-select:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  outline: none;
}

.error {
  border-color: #fc8181;
}

.error-message {
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.sound-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
}

.toggle-option {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
  background: #cbd5e0;
  border-radius: 12px;
  margin-right: 0.75rem;
  transition: background 0.3s;
}

.toggle-switch:before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

input[type="checkbox"] {
  display: none;
}

input[type="checkbox"]:checked + .toggle-switch {
  background: #4299e1;
}

input[type="checkbox"]:checked + .toggle-switch:before {
  transform: translateX(24px);
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.action-button.primary {
  background: #4299e1;
  color: white;
}

.action-button.secondary {
  background: #718096;
  color: white;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.action-button:active {
  transform: translateY(1px);
}

.action-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loader {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .new-game-form {
    margin: 1rem;
    padding: 1rem;
  }

  .form-title {
    font-size: 1.4rem;
  }

  .action-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

[data-mode="retry"] {
  transform: scale(0.8);
  max-width: 360px;
}

/* Replace language switcher styles */
.language-switcher {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.language-buttons {
  display: flex;
  gap: 0.5rem;
}

.lang-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #4a5568;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn:hover {
  border-color: #4299e1;
  color: #4299e1;
}

.lang-btn.active {
  background: #f7fafc;
  border-color: #4299e1;
  color: #2d3748;
  font-weight: 500;
}
</style>