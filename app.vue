<template>
  <div class="game-container">
    <NewGameForm :game-state="gameState" mode="new-game" v-if="!gameIsOngoing" :availableCardTypes="availableCardTypes" :boardSizeOptions="boardSizeOptions" @startGame="handleStartGame" />

    <div class="game-content">
      <GameBoard
        :cards="gameState.cards"
        :boardSizeId="boardSizeId"
        :cardType="cardType"
        @cardClicked="handleCardClick"
        :game-state="gameState"
        v-if="gameIsOngoing">
      </GameBoard>

      <div class="current-score" v-if="gameIsOngoing">
        <p>{{ t('score.time') }}: {{ gameState.elapsedTime }}s</p>
        <p>{{ t('score.accuracy') }}: {{ currentAccuracy }}%</p>
      </div>

      <!-- Changed: Static retry section -->
      <div class="bottom-controls" v-if="gameIsOngoing && !gameState.gameCompleted">
        <NewGameForm 
          :game-state="gameState" 
          mode="retry" 
          @gotoBoardOptions="handleStopGame"
          :availableCardTypes="availableCardTypes" 
          :boardSizeOptions="boardSizeOptions" 
          @startGame="handleRestartGame"
        />
      </div>
    </div>

    <!-- Updated result modal with global leaderboard -->
    <Modal v-if="showResultModal" @closeModal="handleModalClose">
      <div class="result-modal">
        <div class="result-modal-content">
          <h2 class="result-title">
            {{ isHighScore ? t('results.gameComplete') : t('results.almostThere') }}
          </h2>
          
          <div class="result-stats">
            <div class="stat-item">
              <span class="stat-label">{{ t('score.time') }}</span>
              <span class="stat-value">{{ gameState.elapsedTime }}s</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ t('score.accuracy') }}</span>
              <span class="stat-value">{{ currentAccuracy }}%</span>
            </div>
            <div v-if="playerRank" class="stat-item">
              <span class="stat-label">{{ t('score.rank') }}</span>
              <span class="stat-value">#{{ playerRank }}</span>
            </div>
          </div>

          <!-- Show either global leaderboard or encouragement -->
          <div v-if="isHighScore" class="scoreboard">
            <h3>{{ t('score.globalTopScores') }}</h3>
            <div v-if="leaderboardLoading" class="loading-spinner">
              <div class="spinner"></div>
            </div>
            <ul v-else class="score-list">
              <li v-for="(score, index) in leaderboard" 
                  :key="score.id" 
                  :class="{ 'new-score': score.id === lastSubmittedScore?.id }">
                <span class="score-rank">{{ index + 1 }}</span>
                <span class="score-name">{{ score.playerName }}</span>
                <span class="score-time">{{ score.timeSpent.toFixed(2) }}s</span>
                <span class="score-accuracy">{{ (score.accuracy * 100).toFixed(2) }}%</span>
              </li>
            </ul>
          </div>
          <div v-else class="encouragement">
            <p class="encouragement-message">{{ t('encouragement')[Math.floor(Math.random() * t('encouragement').length)] }}</p>
            <div class="current-stats">
              <p>{{ t('score.yourTime') }}: {{ gameState.elapsedTime }}s</p>
              <p>{{ t('score.yourAccuracy') }}: {{ currentAccuracy }}%</p>
            </div>
          </div>

          <div class="result-actions">
            <button class="result-button result-button--secondary" @click="returnToMenu">
              {{ t('game.menu') }}
            </button>
            <button class="result-button result-button--primary" @click="handleRestartGame">
              {{ t('game.playAgain') }}
            </button>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Add share dialog -->
    <Modal v-if="showShareDialog" @closeModal="showShareDialog = false">
      <div class="share-modal">
        <h2 class="share-title">{{ t('game.shareableLink') }}</h2>
        <div class="share-input-group">
          <input
            ref="shareInput"
            type="text"
            readonly
            :value="shareableUrl"
            class="share-input"
          />
          <button @click="copyToClipboard(shareableUrl)" class="share-copy-btn">
            {{ linkCopied ? t('common.copied') : t('common.copy') }}
          </button>
        </div>
        <div class="share-info">
          <p>{{ t('game.shareInfo') }}</p>
        </div>
        <div class="share-actions">
          <button @click="showShareDialog = false" class="share-close-btn">
            {{ t('common.close') }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted } from 'vue';
import { useI18n } from './composables/useI18n';
import { useGameSound } from './composables/useSound';
import { useLeaderboard } from './composables/useLeaderboard';
import { useGameState } from './composables/useGameState';
import { getRandomEncouragement } from './data/encouragement';
import { 
  availableCards, 
  boardSizeOptions, 
  getAvailableCardTypes 
} from './data/gameConfig';

const { t, setLocale, locale } = useI18n();
const { 
  soundEnabled, 
  musicEnabled, 
  handleGameMusic, 
  stopGameMusic, 
  playCardSound 
} = useGameSound();

const { 
  submitScore, 
  getLeaderboard, 
  isLoading: leaderboardLoading, 
  leaderboard,
  playerRank
} = useLeaderboard();

// Use the game state composable
const { 
  gameState, 
  cardType, 
  boardSizeId, 
  currentAccuracy, 
  gameIsOngoing,
  startGame,
  stopCurrentGame,
  handleCardClick: gameStateHandleCardClick,
  cleanup,
  onGameCompleted
} = useGameState();

// Initialize necessary refs for UI state
const lastSubmittedScore = ref<any>(null);
const isHighScore = ref(false);
const highScoreModalVisible = ref(false);
const showShareDialog = ref(false);
const shareableUrl = ref('');
const linkCopied = ref(false);

// Register the game completed callback
onMounted(() => {
  onGameCompleted(() => {
    setTimeout(() => {
      updateScoreBoard();
    }, 100);
  });
});

// Convert availableCards to array format for components
const availableCardTypes = computed(() => getAvailableCardTypes());

// Handle starting a new game
function handleStartGame(gameOptions: any) {
  console.log(gameOptions);
  
  // Handle music control
  handleGameMusic(gameOptions.musicOn);
  
  // Start new game with the game state composable
  startGame(gameOptions, availableCards);
  
  hideHighScoreModal();
}

// Handle restarting the game
function handleRestartGame() {
  const currentSettings = {
    cardType: gameState.cardType,
    boardSizeId: gameState.boardSizeId,
    playerName: gameState.currentGame.playerName,
    gfxOn: soundEnabled.value,
    musicOn: musicEnabled.value,
  };
  
  handleStartGame(currentSettings);
}

// Handle stopping the game
function handleStopGame() {
  stopCurrentGame();
  stopGameMusic();
  hideHighScoreModal();
}

// Handle card clicks - simplified to use the composable directly
function handleCardClick(index: number) {
  gameStateHandleCardClick(index, 
    // onMatchCallback
    () => {
      if (soundEnabled.value) {
        playCardSound(null, true);
      }
    },
    // onCardFlipCallback
    (card) => {
      if (soundEnabled.value && !gameState.gameCompleted) {
        playCardSound({
          type: gameState.cardType,
          name: card.name
        }, false);
      }
    }
  );
}

// Update scoreboard after game completion - removed duplicate ranking logic
const updateScoreBoard = async () => {
  const finalScore = {
    playerName: gameState.currentGame.playerName || 'Anonymous',
    timeSpent: parseFloat(gameState.elapsedTime.toString()),
    accuracy: parseFloat(currentAccuracy.value.toString()) / 100,
    boardSize: gameState.boardSizeId,
    cardType: gameState.cardType
  };

  try {
    const result = await submitScore(finalScore);
    
    if (result) {
      lastSubmittedScore.value = result.score;
      isHighScore.value = result.rank <= 10;
      
      if (isHighScore.value) {
        await getLeaderboard({
          boardSize: gameState.boardSizeId,
          cardType: gameState.cardType,
          limit: 10
        });
        showHighScoreModal();
      } else {
        showEncouragementModal();
      }
    } else {
      showEncouragementModal();
    }
  } catch (error) {
    console.error('Failed to update score:', error);
    showEncouragementModal();
  }
};

// Modal handling
function showHighScoreModal() {
  highScoreModalVisible.value = true;
  
  // Refresh leaderboard data
  getLeaderboard({
    boardSize: gameState.boardSizeId,
    cardType: gameState.cardType,
    limit: 10
  });
}

function hideHighScoreModal() {
  highScoreModalVisible.value = false;
}

const showResultModal = computed(() => 
  gameState.gameCompleted && 
  highScoreModalVisible.value
);

function handleModalClose() {
  hideHighScoreModal();
}

function showEncouragementModal() {
  gameState.gameCompleted = true;
  highScoreModalVisible.value = true;
}

function returnToMenu() {
  hideHighScoreModal();
  handleStopGame();
}

// Add missing function for share dialog
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    linkCopied.value = true;
    setTimeout(() => {
      linkCopied.value = false;
    }, 2000);
  });
}

// Clean up on component unmount
onUnmounted(() => {
  cleanup();
  stopGameMusic();
});
</script>